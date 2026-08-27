import JSZip, { type JSZipObject } from "jszip";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { ConfigurationDetail, Property, ReraDocument, ReraOfficialDetails, ReraPhase } from "@/components/acres/mock-data";
import { uploadPropertyMedia } from "@/lib/api";
import { mapWithConcurrency } from "@/lib/uploadConcurrency";
import { classifyReraFileName } from "@/lib/reraBulkUpload";
import { analyzePropertyDescription, type QuickFillSuggestion, type SupportedPropertyType } from "@/lib/propertyQuickFill";

GlobalWorkerOptions.workerSrc = typeof process !== "undefined" && process.env?.VITEST
  ? `file://${process.cwd()}/node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs`
  : new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();

const MAX_ZIP_BYTES = 150 * 1024 * 1024;
const MAX_EXPANDED_BYTES = 750 * 1024 * 1024;
const MAX_ENTRIES = 500;
const KARNATAKA_RERA_URL = "https://rera.karnataka.gov.in/viewAllProjects";

type ZipProgress = { completed: number; total: number; label: string };
type ProgressCallback = (progress: ZipProgress) => void;
type JsonRecord = Record<string, unknown>;
type MediaRecord = { kind?: string; label?: string; status?: string; saved_as?: string };
type DocumentRecord = { category?: string; label?: string; status?: string; saved_as?: string };
type UploadTask = {
  category: "gallery" | "floor-plan" | "master-plan" | "walkthrough" | "document";
  entry: JSZipObject;
  label: string;
  savedAs: string;
  mediaKind?: string;
  document?: DocumentRecord;
  phaseIndex?: number;
};
type UploadResult = UploadTask & { file?: File; url?: string; error?: string };

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function records(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map(record) : [];
}

function basename(value: string) {
  return value.split("/").filter(Boolean).pop() || value;
}

function extension(value: string) {
  return basename(value).split(".").pop()?.toLowerCase() || "";
}

function mimeFor(value: string) {
  const ext = extension(value);
  if (["jpg", "jpeg"].includes(ext)) return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "pdf") return "application/pdf";
  if (ext === "mp4") return "video/mp4";
  return "application/octet-stream";
}

function safeArchivePath(value: string) {
  const normalized = value.replace(/\\/g, "/");
  return Boolean(normalized && !normalized.startsWith("/") && !/^[A-Za-z]:\//.test(normalized) && !normalized.split("/").includes(".."));
}

function originalEntryName(entry: JSZipObject) {
  return (entry as JSZipObject & { unsafeOriginalName?: string }).unsafeOriginalName || entry.name;
}

function entrySize(entry: JSZipObject) {
  return Number((entry as JSZipObject & { _data?: { uncompressedSize?: number } })._data?.uncompressedSize || 0);
}

function findEntry(entries: JSZipObject[], savedAs: string) {
  const expected = savedAs.replace(/\\/g, "/").replace(/^\/+/, "");
  return entries.find((entry) => entry.name === expected)
    || entries.find((entry) => entry.name.endsWith(`/${expected}`))
    || entries.find((entry) => basename(entry.name).toLowerCase() === basename(expected).toLowerCase());
}

async function readJson(entry?: JSZipObject): Promise<JsonRecord> {
  if (!entry) return {};
  try {
    return record(JSON.parse(await entry.async("string")));
  } catch {
    throw new Error(`${basename(entry.name)} is not valid JSON.`);
  }
}

async function readJsonValue(entry?: JSZipObject): Promise<unknown> {
  if (!entry) return undefined;
  try {
    return JSON.parse(await entry.async("string"));
  } catch {
    throw new Error(`${basename(entry.name)} is not valid JSON.`);
  }
}

async function toFile(entry: JSZipObject) {
  const blob = await entry.async("blob");
  return new File([blob], basename(entry.name), { type: mimeFor(entry.name), lastModified: Date.now() });
}

function normalizeDmyDate(value: string) {
  const match = clean(value).match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

async function extractPdfText(entry?: JSZipObject) {
  if (!entry) return "";
  const loadingTask = getDocument({ data: await entry.async("uint8array") });
  try {
    const document = await loadingTask.promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= Math.min(document.numPages, 3); pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const lines = new Map<number, Array<{ x: number; text: string }>>();
      content.items.forEach((item) => {
        if (!("str" in item) || !item.str.trim()) return;
        const transform = "transform" in item ? item.transform : undefined;
        const y = Math.round(Number(transform?.[5] || 0));
        const x = Number(transform?.[4] || 0);
        const line = lines.get(y) || [];
        line.push({ x, text: item.str.trim() });
        lines.set(y, line);
      });
      pages.push([...lines.entries()].sort((left, right) => right[0] - left[0]).map(([, items]) => items.sort((left, right) => left.x - right.x).map((item) => item.text).join(" ")).join("\n"));
    }
    await document.destroy();
    return pages.join("\n");
  } finally {
    await loadingTask.destroy().catch(() => undefined);
  }
}

function betweenCaseInsensitive(source: string, start: string, end: string) {
  const lower = source.toLowerCase();
  const startIndex = lower.indexOf(start.toLowerCase());
  if (startIndex < 0) return "";
  const valueStart = startIndex + start.length;
  const endIndex = lower.indexOf(end.toLowerCase(), valueStart);
  return source.slice(valueStart, endIndex < 0 ? undefined : endIndex).trim();
}

function cleanCertificateAddress(value: string) {
  return value.replace(/^[,\s]+/, "").replace(/\s+/g, " ").replace(/\s+,/g, ",").trim();
}

export function officialDetailsFromCertificate(text: string, projectName: string, promoterName: string): Partial<ReraOfficialDetails> {
  const singleLine = text.replace(/\s+/g, " ").trim();
  const dates = [...singleLine.matchAll(/\b(\d{2})\s*-\s*(\d{2})\s*-\s*(\d{4})\b/g)].map((match) => `${match[1]}-${match[2]}-${match[3]}`);
  const chronologicalDates = [...new Set(dates.map(normalizeDmyDate).filter(Boolean))].sort();
  const registeredBlock = projectName && promoterName ? betweenCaseInsensitive(singleLine, projectName, promoterName) : "";
  const afterPromoter = promoterName ? betweenCaseInsensitive(singleLine, promoterName, dates[0] || "Signature Not Verified") : "";
  return {
    approvalDate: chronologicalDates[0] || "",
    registeredCompletionDate: chronologicalDates.length > 1 ? chronologicalDates[chronologicalDates.length - 1] : "",
    registeredAddress: cleanCertificateAddress(registeredBlock),
    promoterAddress: cleanCertificateAddress(afterPromoter),
  };
}

function officialDetailsFromProject(project: JsonRecord): ReraOfficialDetails {
  return {
    promoterName: clean(project.promoter_name),
    projectId: clean(project.project_id),
    acknowledgementNumber: clean(project.acknowledgement_number),
    registrationStatus: clean(project.status),
    district: clean(project.district),
  };
}

function mergeOfficialDetails(...values: Array<Partial<ReraOfficialDetails> | undefined>) {
  const merged = Object.assign({}, ...values);
  return Object.fromEntries(Object.entries(merged).filter(([, value]) => clean(value))) as ReraOfficialDetails;
}

function numericArea(value: unknown) {
  return clean(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0] || "";
}

function matchConfigurationIndex(rows: ConfigurationDetail[], label: string, path: string) {
  const source = `${label} ${path}`;
  const bhk = source.match(/\b(\d+(?:\.5)?)\s*BHK\b/i)?.[1];
  const area = source.match(/\b(\d{3,5})\s*(?:Sq\.?\s*Ft\.?|sqft)\b/i)?.[1];
  let index = rows.findIndex((row) => (!bhk || row.configuration.startsWith(`${Number(bhk)} BHK`)) && (!area || numericArea(row.builtUpArea || row.superBuiltUpArea || row.carpetArea) === area));
  if (index < 0 && bhk) index = rows.findIndex((row) => row.configuration.startsWith(`${Number(bhk)} BHK`));
  return index;
}

function propertyMissingWarnings(patch: Partial<Property>) {
  const warnings: string[] = [];
  if (patch.propertyType === "Apartment") {
    (patch.configurationDetails || []).forEach((row, index) => {
      const missing = [!row.carpetArea?.trim() && "carpet area", !row.bathrooms && "bathrooms", row.balconies === undefined && "balconies"].filter(Boolean);
      if (missing.length) warnings.push(`${row.configuration || `Configuration ${index + 1}`} still requires ${missing.join(", ")} before publication.`);
    });
  }
  if (!patch.locality?.pinCode) warnings.push("PIN code was not supplied by the ZIP package and remains blank.");
  return warnings;
}

function mediaRecords(projectData: JsonRecord, assetManifest: JsonRecord) {
  const source = Array.isArray(assetManifest) && assetManifest.length ? assetManifest : projectData.media;
  return records(source).map((item): MediaRecord => ({ kind: clean(item.kind), label: clean(item.label), status: clean(item.status), saved_as: clean(item.saved_as) }));
}

function documentRecords(manifest: JsonRecord) {
  return records(manifest.documents).map((item): DocumentRecord => ({ category: clean(item.category), label: clean(item.label), status: clean(item.status), saved_as: clean(item.saved_as) }));
}

function buildTasks(entries: JSZipObject[], media: MediaRecord[], documents: Array<{ row: DocumentRecord; phaseIndex: number }>, warnings: string[]) {
  const tasks: UploadTask[] = [];
  media.filter((item) => item.status === "downloaded" && item.saved_as).forEach((item) => {
    const entry = findEntry(entries, item.saved_as || "");
    if (!entry) {
      warnings.push(`${item.label || item.saved_as} is listed in the media manifest but is missing from the ZIP.`);
      return;
    }
    const kind = clean(item.kind).toLowerCase();
    const category = kind === "gallery" ? "gallery" : kind === "master_plan" ? "master-plan" : kind === "walkthrough" ? "walkthrough" : ["floor_plan", "3d_plan"].includes(kind) ? "floor-plan" : undefined;
    if (category) tasks.push({ category, entry, label: item.label || basename(entry.name), savedAs: item.saved_as || entry.name, mediaKind: kind });
  });
  documents.filter(({ row }) => row.status === "downloaded" && row.saved_as).forEach(({ row: item, phaseIndex }) => {
    const entry = findEntry(entries, item.saved_as || "");
    if (!entry) {
      warnings.push(`${item.label || item.saved_as} is listed in the RERA manifest but is missing from the ZIP.`);
      return;
    }
    tasks.push({ category: "document", entry, label: item.label || basename(entry.name), savedAs: item.saved_as || entry.name, document: item, phaseIndex });
  });
  return tasks;
}

async function uploadTasks(tasks: UploadTask[], onProgress: ProgressCallback | undefined, warnings: string[]) {
  let completed = 0;
  onProgress?.({ completed, total: tasks.length, label: "Preparing package uploads" });
  return mapWithConcurrency(tasks, 3, async (task): Promise<UploadResult> => {
    try {
      const file = await toFile(task.entry);
      let kind: Parameters<typeof uploadPropertyMedia>[1] = "image";
      if (task.category === "walkthrough") kind = "project-walkthrough";
      if (task.category === "document") {
        const match = classifyReraFileName(`${task.label} ${task.savedAs}`);
        if (!match.definition) throw new Error("No supported document category matched this filename");
        kind = match.definition.group === "rera" ? "rera-document-pdf" : "project-document-pdf";
      }
      const url = await uploadPropertyMedia(file, kind);
      return { ...task, file, url };
    } catch (cause) {
      const error = cause instanceof Error ? cause.message : "Upload failed";
      warnings.push(`${task.label}: ${error}.`);
      return { ...task, error };
    } finally {
      completed += 1;
      onProgress?.({ completed, total: tasks.length, label: task.label });
    }
  });
}

function attachUploads(patch: Partial<Property>, uploads: UploadResult[], warnings: string[]) {
  const gallery = uploads.filter((item) => item.category === "gallery" && item.url).map((item) => item.url!);
  if (gallery.length) {
    patch.heroImages = gallery.slice(0, 3);
    patch.images = gallery;
    patch.image = gallery[0];
  }

  const masterPlanImage = uploads.find((item) => item.category === "master-plan" && item.url)?.url;
  if (masterPlanImage) patch.masterPlan = { ...(patch.masterPlan || {}), imageUrl: masterPlanImage };

  const rows = (patch.configurationDetails || []).map((row) => ({ ...row }));
  uploads.filter((item) => item.category === "floor-plan" && item.url).forEach((item) => {
    const index = matchConfigurationIndex(rows, item.label, item.savedAs);
    if (index < 0) {
      warnings.push(`${item.label} was uploaded but could not be matched to a configuration.`);
      return;
    }
    if (item.mediaKind === "3d_plan") rows[index].floorPlan3dUrl = item.url;
    else rows[index].floorPlan2dUrl = item.url;
  });
  if (rows.length) patch.configurationDetails = rows;

  const walkthrough = uploads.find((item) => item.category === "walkthrough" && item.url && item.file);
  if (walkthrough?.url && walkthrough.file) {
    patch.projectDownloads = [
      ...(patch.projectDownloads || []).filter((item) => item.kind !== "walkthrough"),
      { kind: "walkthrough", label: "Project Walkthrough", fileName: walkthrough.file.name, fileUrl: walkthrough.url, mimeType: "video/mp4", fileSize: walkthrough.file.size },
    ];
  }

  const phases = (patch.reraPhases || []).map((phase) => ({ ...phase, reraDocuments: [...(phase.reraDocuments || [])], projectDocuments: [...(phase.projectDocuments || [])] }));
  if (!phases.length) return;
  uploads.filter((item) => item.category === "document" && item.url && item.file).forEach((item) => {
    const match = classifyReraFileName(`${item.label} ${item.savedAs}`);
    if (!match.definition || !item.file || !item.url) return;
    const document: ReraDocument = {
      key: match.definition.key,
      label: match.definition.label,
      annexure: match.definition.annexure,
      fileName: item.file.name,
      fileUrl: item.url,
      mimeType: item.file.type as ReraDocument["mimeType"],
      fileSize: item.file.size,
    };
    const phase = phases[item.phaseIndex || 0] || phases[0];
    const target = match.definition.group === "rera" ? phase.reraDocuments : phase.projectDocuments;
    const existing = target.findIndex((row) => row.key === document.key);
    if (existing >= 0) target[existing] = document;
    else target.push(document);
  });
  patch.reraPhases = phases;
}

export async function importPropertyZip(file: File, preferredType?: SupportedPropertyType, onProgress?: ProgressCallback): Promise<QuickFillSuggestion> {
  if (!file.name.toLowerCase().endsWith(".zip") && !["application/zip", "application/x-zip-compressed"].includes(file.type)) throw new Error("Select a ZIP property package.");
  if (file.size > MAX_ZIP_BYTES) throw new Error("ZIP packages must be 150 MB or smaller.");

  onProgress?.({ completed: 0, total: 1, label: "Validating ZIP package" });
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(file, { checkCRC32: true, createFolders: false });
  } catch {
    throw new Error("The ZIP package is damaged or cannot be read.");
  }
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  if (!entries.length) throw new Error("The ZIP package is empty.");
  if (entries.length > MAX_ENTRIES) throw new Error(`ZIP packages support at most ${MAX_ENTRIES} files.`);
  if (entries.some((entry) => !safeArchivePath(originalEntryName(entry)))) throw new Error("The ZIP contains an unsafe file path and was rejected.");
  const expandedBytes = entries.reduce((total, entry) => total + entrySize(entry), 0);
  if (expandedBytes > MAX_EXPANDED_BYTES) throw new Error("The expanded ZIP package is too large.");

  const propertyTextEntry = entries.find((entry) => basename(entry.name).toLowerCase() === "property_upload.txt");
  if (!propertyTextEntry) throw new Error("The ZIP must contain property_upload.txt.");
  const propertyText = await propertyTextEntry.async("string");
  const suggestion = analyzePropertyDescription(propertyText, preferredType);
  const warnings = [...suggestion.warnings];

  const projectData = await readJson(entries.find((entry) => basename(entry.name).toLowerCase() === "project_data.json"));
  const assetManifestEntry = entries.find((entry) => basename(entry.name).toLowerCase() === "asset_manifest.json");
  const assetManifestRaw = await readJsonValue(assetManifestEntry) || [];
  const sourceAudit = await readJson(entries.find((entry) => basename(entry.name).toLowerCase() === "source_audit.json"));
  if (clean(sourceAudit.notice)) warnings.push(clean(sourceAudit.notice));
  const projectReraNumbers = Array.isArray(projectData.rera_numbers) ? projectData.rera_numbers : [];
  const projectDetailsEntries = entries.filter((entry) => /(?:^|\/)rera_documents\/.*\/project_details\.json$/i.test(entry.name));
  const phaseSources: Array<{ detailsEntry?: JSZipObject; directory: string }> = projectDetailsEntries.length
    ? projectDetailsEntries.map((detailsEntry) => ({ detailsEntry, directory: detailsEntry.name.slice(0, detailsEntry.name.lastIndexOf("/")) }))
    : [{ directory: "" }];
  const phases = (suggestion.patch.reraPhases || []).map((phase) => ({ ...phase, reraDocuments: [...(phase.reraDocuments || [])], projectDocuments: [...(phase.projectDocuments || [])] }));
  const packagedDocuments: Array<{ row: DocumentRecord; phaseIndex: number }> = [];
  let officialFieldCount = 0;

  for (const [packageIndex, source] of phaseSources.entries()) {
    const projectDetails = await readJson(source.detailsEntry);
    const reraNumber = clean(projectDetails.rera_number) || clean(projectReraNumbers[packageIndex]) || (packageIndex === 0 ? suggestion.patch.reraNumber : "");
    let phaseIndex = reraNumber ? phases.findIndex((phase) => phase.reraNumber.toLowerCase() === reraNumber.toLowerCase()) : packageIndex < phases.length ? packageIndex : -1;
    const existingPhase = phaseIndex >= 0 ? phases[phaseIndex] : undefined;
    if (phaseIndex < 0 && reraNumber) phaseIndex = phases.length;

    const directoryPrefix = source.directory ? `${source.directory}/` : "";
    const certificateEntry = entries.find((entry) => entry.name.startsWith(directoryPrefix) && /rera_registration_certificate\.pdf$/i.test(entry.name));
    let certificateDetails: Partial<ReraOfficialDetails> = {};
    if (certificateEntry) {
      try {
        certificateDetails = officialDetailsFromCertificate(await extractPdfText(certificateEntry), clean(projectDetails.project_name) || suggestion.patch.title || "", clean(projectDetails.promoter_name));
      } catch (cause) {
        const reason = cause instanceof Error ? ` (${cause.message})` : "";
        warnings.push(`The RERA certificate for ${existingPhase?.name || `Phase ${packageIndex + 1}`} was uploaded, but its text could not be extracted automatically${reason}. Review the official date and address fields.`);
      }
    }
    const officialDetails = mergeOfficialDetails(existingPhase?.officialDetails, officialDetailsFromProject(projectDetails), certificateDetails);
    officialFieldCount += Object.keys(officialDetails).length;
    if (phaseIndex >= 0 && reraNumber) {
      phases[phaseIndex] = {
        name: existingPhase?.name || `Phase ${phaseIndex + 1}`,
        reraNumber,
        reraSiteUrl: existingPhase?.reraSiteUrl || clean(projectDetails.search_url) || KARNATAKA_RERA_URL,
        order: phaseIndex,
        officialDetails,
        reraDocuments: existingPhase?.reraDocuments || [],
        projectDocuments: existingPhase?.projectDocuments || [],
      };
    }
    if (!suggestion.patch.locality?.address && officialDetails.registeredAddress) {
      suggestion.patch.locality = { ...(suggestion.patch.locality || {}), address: officialDetails.registeredAddress };
    }

    const manifestEntry = entries.find((entry) => entry.name === `${directoryPrefix}manifest.json`)
      || (!source.directory ? entries.find((entry) => /(?:^|\/)rera_documents\/.*\/manifest\.json$/i.test(entry.name)) : undefined);
    const manifest = await readJson(manifestEntry);
    documentRecords(manifest).forEach((row) => packagedDocuments.push({
      row: { ...row, saved_as: row.saved_as && source.directory ? `${source.directory}/${row.saved_as}` : row.saved_as },
      phaseIndex: Math.max(0, phaseIndex),
    }));
  }
  if (phases.length) {
    suggestion.patch.reraRegistered = true;
    suggestion.patch.reraNumber = phases[0].reraNumber;
    suggestion.patch.reraPhases = phases;
  }

  const media = mediaRecords(projectData, assetManifestRaw as JsonRecord);
  const tasks = buildTasks(entries, media, packagedDocuments, warnings);
  const uploads = await uploadTasks(tasks, onProgress, warnings);
  attachUploads(suggestion.patch, uploads, warnings);

  const successful = uploads.filter((item) => item.url);
  const uploadedDocuments = successful.filter((item) => item.category === "document").length;
  const uploadedMedia = successful.length - uploadedDocuments;
  suggestion.fields.push(
    { label: "ZIP package", value: file.name },
    { label: "ZIP media uploaded", value: String(uploadedMedia) },
    { label: "ZIP documents uploaded", value: String(uploadedDocuments) },
    { label: "Official RERA fields", value: String(officialFieldCount) },
  );
  suggestion.warnings = [...new Set([...warnings, ...propertyMissingWarnings(suggestion.patch)])];
  return suggestion;
}
