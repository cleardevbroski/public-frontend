import { useEffect, useRef, useState } from "react";
import { Archive, FileSpreadsheet, Loader2, Sparkles, Upload, UploadCloud, WandSparkles } from "lucide-react";
import {
  analyzePropertyDescription,
  downloadPropertyDescriptionFormat,
  downloadPropertyExcelTemplate,
  parsePropertyExcel,
  type QuickFillPatch,
  type QuickFillSuggestion,
  type SupportedPropertyType,
} from "@/lib/propertyQuickFill";

type Props = {
  propertyType?: string;
  currentData?: Partial<QuickFillPatch>;
  onApply: (patch: QuickFillPatch, replaceExisting: boolean) => void;
};

function typeFor(value?: string): SupportedPropertyType | undefined {
  return ["Apartment", "Villa", "Plot", "Commercial", "PG/Co-living"].includes(value || "") ? value as SupportedPropertyType : undefined;
}

type UpdateChoice = "keep" | "import";

type ReviewField = {
  id: string;
  label: string;
  incoming: unknown;
  current: unknown;
  apply: (patch: Record<string, unknown>) => void;
  mergeOnly?: boolean;
};

const hasValue = (value: unknown) => Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== "";
const displayValue = (value: unknown) => Array.isArray(value)
  ? value.join(", ")
  : typeof value === "object" && value !== null
    ? JSON.stringify(value)
    : String(value ?? "");
const sameValue = (left: unknown, right: unknown) => displayValue(left).trim().toLowerCase() === displayValue(right).trim().toLowerCase();

export default function PropertyQuickFill({ propertyType, currentData = {}, onApply }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const zipInput = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [suggestion, setSuggestion] = useState<QuickFillSuggestion | null>(null);
  const [source, setSource] = useState<"Excel" | "Description" | "ZIP" | null>(null);
  const [loading, setLoading] = useState(false);
  const [draggingZip, setDraggingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<{ completed: number; total: number; label: string } | null>(null);
  const [error, setError] = useState("");
  const [reviewChoices, setReviewChoices] = useState<Record<string, UpdateChoice>>({});
  const [templateType, setTemplateType] = useState<SupportedPropertyType>(() => typeFor(propertyType) || "Apartment");

  useEffect(() => {
    const selected = typeFor(propertyType);
    if (selected) setTemplateType(selected);
  }, [propertyType]);

  const showSuggestion = (next: QuickFillSuggestion, nextSource: "Excel" | "Description" | "ZIP") => {
    setSuggestion(next);
    setSource(nextSource);
    setError("");
    setReviewChoices({});
  };

  const reviewFields: ReviewField[] = suggestion ? [
    ["title", "Project name"], ["builder", "Builder / developer"], ["subtitle", "Project locality"], ["price", "Project price"], ["pricePerSqft", "Price per sq. ft."], ["area", "Total area / sq. ft."], ["possession", "Possession"], ["totalUnits", "Total units"], ["totalTowers", "Total towers"], ["description", "Project description"],
  ].map(([key, label]) => ({ id: key, label, incoming: suggestion.patch[key as keyof QuickFillPatch], current: currentData[key as keyof QuickFillPatch], apply: (patch: Record<string, unknown>) => { patch[key] = suggestion.patch[key as keyof QuickFillPatch]; } })).filter((field) => hasValue(field.incoming)) : [];

  if (suggestion?.patch.locality) {
    (["city", "zone", "address", "landmark", "pinCode"] as const).forEach((key) => {
      const incoming = suggestion.patch.locality?.[key];
      if (!hasValue(incoming)) return;
      reviewFields.push({ id: `locality.${key}`, label: `Locality: ${key === "pinCode" ? "PIN code" : key}`, incoming, current: currentData.locality?.[key], apply: (patch) => {
        patch.locality = { ...((patch.locality as Record<string, unknown>) || {}), [key]: incoming };
      } });
    });
  }
  if (suggestion?.patch.reraNumber || suggestion?.patch.reraPhases?.length) {
    reviewFields.push({ id: "rera", label: "RERA registration / phases", incoming: suggestion.patch.reraPhases?.length ? suggestion.patch.reraPhases.map((phase) => phase.reraNumber).join(", ") : suggestion.patch.reraNumber, current: currentData.reraPhases?.length ? currentData.reraPhases.map((phase) => phase.reraNumber).join(", ") : currentData.reraNumber, apply: (patch) => {
      patch.reraRegistered = suggestion.patch.reraRegistered;
      patch.reraNumber = suggestion.patch.reraNumber;
      patch.reraPhases = suggestion.patch.reraPhases;
    } });
  }
  if (suggestion?.patch.amenities?.length) {
    const missing = suggestion.patch.amenities.filter((amenity) => !currentData.amenities?.some((existing) => existing.trim().toLowerCase() === amenity.trim().toLowerCase()));
    reviewFields.push({ id: "amenities", label: "Amenities", incoming: missing, current: currentData.amenities || [], mergeOnly: true, apply: (patch) => { patch.amenities = suggestion.patch.amenities; patch.facilities = suggestion.patch.facilities; } });
  }
  if (suggestion?.patch.configurationDetails?.length) {
    const incoming = suggestion.patch.configurationDetails.map((row) => `${row.variantName || row.configuration}: ${row.price || "price not supplied"} · ${row.builtUpArea || row.carpetArea || "area not supplied"}`).join(" | ");
    const current = currentData.configurationDetails?.map((row) => `${row.variantName || row.configuration}: ${row.price || "price not supplied"} · ${row.builtUpArea || row.carpetArea || "area not supplied"}`).join(" | ") || "";
    reviewFields.push({ id: "configurations", label: "Apartment configurations", incoming, current, apply: (patch) => {
      const existing = [...(currentData.configurationDetails || [])];
      const merged = [...existing];
      suggestion.patch.configurationDetails!.forEach((incomingRow) => {
        const index = merged.findIndex((currentRow) => (currentRow.variantName || currentRow.configuration).toLowerCase() === (incomingRow.variantName || incomingRow.configuration).toLowerCase());
        const fields = incomingRow.quickFillFields || Object.keys(incomingRow);
        const updates = Object.fromEntries(fields.filter((key) => key !== "quickFillFields").map((key) => [key, incomingRow[key as keyof typeof incomingRow]]));
        if (index < 0) merged.push({ ...incomingRow, quickFillFields: undefined });
        else merged[index] = { ...merged[index], ...updates, quickFillFields: undefined };
      });
      patch.configurationDetails = merged;
      patch.configs = merged.map((row) => row.configuration);
    } });
  }

  const choiceFor = (field: ReviewField): UpdateChoice => reviewChoices[field.id] || (!hasValue(field.current) ? "import" : "keep");

  const applySuggestion = () => {
    if (!suggestion) return;
    const patch: Record<string, unknown> = {};
    reviewFields.forEach((field) => {
      if (field.mergeOnly || choiceFor(field) === "import") field.apply(patch);
    });
    const reviewedRootKeys = new Set(["title", "builder", "subtitle", "price", "pricePerSqft", "area", "possession", "totalUnits", "totalTowers", "description", "locality", "reraRegistered", "reraNumber", "reraPhases", "amenities", "facilities", "configs", "configurationDetails"]);
    const fillBlankPatch = Object.fromEntries(Object.entries(suggestion.patch).filter(([key]) => !reviewedRootKeys.has(key))) as QuickFillPatch;
    // Keep full-template support: structured sections not shown in this compact
    // review are still filled only when the existing form has no value.
    if (Object.keys(fillBlankPatch).length) onApply(fillBlankPatch, false);
    if (!Object.keys(patch).length && !Object.keys(fillBlankPatch).length) { setError("Choose at least one uploaded value to apply."); return; }
    if (Object.keys(patch).length) onApply(patch as QuickFillPatch, true);
    setSuggestion(null);
  };

  const uploadZip = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setError("");
    setZipProgress({ completed: 0, total: 1, label: "Reading ZIP package" });
    try {
      const { importPropertyZip } = await import("@/lib/propertyZipImport");
      const next = await importPropertyZip(file, typeFor(propertyType), setZipProgress);
      showSuggestion(next, "ZIP");
    } catch (cause) {
      setSuggestion(null);
      setError(cause instanceof Error ? cause.message : "Unable to import this ZIP package.");
    } finally {
      setLoading(false);
      setDraggingZip(false);
      if (zipInput.current) zipInput.current.value = "";
    }
  };

  const upload = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setZipProgress(null);
    setError("");
    try {
      showSuggestion(await parsePropertyExcel(file, typeFor(propertyType)), "Excel");
    } catch (cause) {
      setSuggestion(null);
      setError(cause instanceof Error ? cause.message : "Unable to read this Excel file.");
    } finally {
      setLoading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const analyze = () => {
    setLoading(true);
    setZipProgress(null);
    setError("");
    try {
      showSuggestion(analyzePropertyDescription(description, typeFor(propertyType)), "Description");
    } catch (cause) {
      setSuggestion(null);
      setError(cause instanceof Error ? cause.message : "Unable to analyze this description.");
    } finally {
      setLoading(false);
    }
  };

  const projectContentChecklist = suggestion ? [
    { label: "About Developer", count: suggestion.patch.developerDescription?.trim() ? 1 : 0 },
    { label: "Introduction paragraphs", count: suggestion.patch.projectNarrative?.introduction?.length || 0 },
    { label: "Project USPs", count: suggestion.patch.projectNarrative?.usps?.length || 0 },
    { label: "Why invest", count: suggestion.patch.projectNarrative?.investmentReasons?.length || 0 },
    { label: "Location advantages", count: suggestion.patch.projectNarrative?.locationAdvantage?.length || 0 },
    { label: "Project key details", count: suggestion.patch.projectNarrative?.keyDetails?.length || 0 },
    { label: "Feature groups", count: suggestion.patch.projectNarrative?.featureGroups?.length || 0 },
    { label: "Master-plan title", count: suggestion.patch.masterPlan?.title?.trim() ? 1 : 0 },
    { label: "Master-plan description", count: suggestion.patch.masterPlan?.summary?.trim() ? 1 : 0 },
    { label: "Master-plan detail sections", count: suggestion.patch.masterPlan?.sections?.length || 0 },
    { label: "FAQs", count: suggestion.patch.faqs?.length || 0 },
  ] : [];

  return (
    <section className="rounded-2xl border border-[#DDAA42]/45 bg-[#FFFBF1] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[15px] font-bold text-[#121B35]"><Sparkles className="size-4 text-[#B98428]" /> Quick fill property details</p>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-[#68646F]">Admin only. Import Excel, analyze pasted text, or drop a complete ZIP package. ZIP packages can include property data, photos, plans, video and protected RERA/project documents.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Template property type" value={templateType} onChange={(event) => setTemplateType(event.target.value as SupportedPropertyType)} className="rounded-xl border border-[#DDAA42] bg-white px-3 py-2.5 text-[12px] font-bold text-[#805C12]">
            {(["Apartment", "Villa", "Plot", "Commercial", "PG/Co-living"] as SupportedPropertyType[]).map((type) => <option key={type}>{type}</option>)}
          </select>
          <button type="button" onClick={() => downloadPropertyDescriptionFormat(templateType)} className="rounded-xl border border-[#DDAA42] bg-white px-3 py-2.5 text-[12px] font-bold text-[#805C12]">{templateType} text template</button>
          <button type="button" onClick={() => downloadPropertyExcelTemplate(templateType)} className="rounded-xl border border-[#DDAA42] bg-white px-3 py-2.5 text-[12px] font-bold text-[#805C12]">{templateType} Excel template</button><button type="button" onClick={() => fileInput.current?.click()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#121B35] px-4 py-2.5 text-[12px] font-bold text-white disabled:opacity-60">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload Excel
        </button></div>
        <input ref={fileInput} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={() => zipInput.current?.click()}
        onDragOver={(event) => { event.preventDefault(); if (!loading) setDraggingZip(true); }}
        onDragLeave={() => setDraggingZip(false)}
        onDrop={(event) => { event.preventDefault(); setDraggingZip(false); if (!loading) void uploadZip(event.dataTransfer.files?.[0]); }}
        className={`mt-4 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center transition ${draggingZip ? "border-[#DDAA42] bg-[#FFF4D8]" : "border-[#D8C88F] bg-white hover:border-[#DDAA42]"} disabled:cursor-wait disabled:opacity-65`}
      >
        {loading && zipProgress ? <Loader2 className="size-7 animate-spin text-[#B98428]" /> : <UploadCloud className="size-7 text-[#B98428]" />}
        <span className="mt-2 text-[13px] font-bold text-[#121B35]">{loading && zipProgress ? "Importing property package…" : "Drop complete property ZIP here"}</span>
        <span className="mt-1 text-[10px] leading-4 text-[#68646F]">Text, configurations, official RERA details, plans, gallery, walkthrough and protected documents are mapped automatically.</span>
        {loading && zipProgress && <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#FFF4D8] px-3 py-1 text-[10px] font-bold text-[#805C12]"><Archive className="size-3" />{zipProgress.total > 1 ? `${zipProgress.completed}/${zipProgress.total} · ` : ""}{zipProgress.label}</span>}
      </button>
      <input ref={zipInput} type="file" accept=".zip,application/zip,application/x-zip-compressed" className="hidden" onChange={(event) => void uploadZip(event.target.files?.[0])} />

      <div className="mt-4 rounded-xl border border-[#E9DEC7] bg-white p-3">
        <label className="block text-[12px] font-bold text-[#3F3D46]">Paste property description</label>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} placeholder="Download Description format, ask ChatGPT to convert your original description into that format, then paste the completed format here." className="mt-2 w-full resize-none rounded-lg border border-[#E4E0E7] px-3 py-2 text-[13px] outline-none focus:border-[#DDAA42]" />
        <div className="mt-2 flex justify-end"><button type="button" onClick={analyze} disabled={loading || description.trim().length < 10} className="inline-flex items-center gap-2 rounded-lg border border-[#DDAA42] px-3 py-2 text-[12px] font-bold text-[#805C12] disabled:opacity-50"><WandSparkles className="size-4" /> Analyze & prefill</button></div>
      </div>

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>}

      {suggestion && (
        <div className="mt-4 rounded-xl border border-[#D8DDE4] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="flex items-center gap-2 text-[13px] font-bold text-[#121B35]"><FileSpreadsheet className="size-4 text-[#B98428]" /> {source} suggestions ready</p><p className="mt-0.5 text-[11px] text-[#68646F]">{suggestion.fields.length} field{suggestion.fields.length === 1 ? "" : "s"} found. Review the imported values below. Nothing is saved until you submit the property.</p></div><button type="button" onClick={applySuggestion} className="rounded-lg bg-[#DDAA42] px-4 py-2 text-[12px] font-bold text-[#121B35]">Apply selected updates</button></div>
          <div className="mt-3 rounded-lg border border-[#E9DEC7] bg-[#FFFBF1] p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#805C12]">Import confirmation</p>
            <div className="mt-2 grid gap-1.5 text-[11px] sm:grid-cols-2 lg:grid-cols-3">
              <p className={(suggestion.patch.reraPhases?.length || 0) > 0 ? "text-emerald-700" : "text-amber-700"}>{(suggestion.patch.reraPhases?.length || 0) > 0 ? "✓" : "⚠"} RERA phases: {suggestion.patch.reraPhases?.length || 0}</p>
              {projectContentChecklist.map((item) => <p key={item.label} className={item.count > 0 ? "text-emerald-700" : "text-amber-700"}>{item.count > 0 ? "✓" : "⚠"} {item.label}: {item.count || "not found"}</p>)}
            </div>
          </div>
          <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-[#EEF0F3] text-[12px]">
            {suggestion.fields.length ? suggestion.fields.map((field, index) => <div key={`${field.label}-${index}`} className="grid grid-cols-[130px_1fr] gap-3 border-b border-[#F0F1F3] px-3 py-2 last:border-0"><span className="font-semibold text-[#68646F]">{field.label}</span><span className="break-words text-[#121B35]">{field.value}</span></div>) : <p className="p-3 text-[#68646F]">No recognized fields were found. You can still enter the details manually.</p>}
          </div>
          <div className="mt-3 rounded-lg border border-[#E9DEC7] bg-[#FFFBF1] p-3 text-[11px] text-[#3F3D46]">
            <p className="font-bold text-[#805C12]">Review changes before applying</p>
            <p className="mt-1 text-[#68646F]">New values are selected automatically. Existing values stay unchanged until you choose the uploaded value. Amenities only add missing items.</p>
            <div className="mt-3 space-y-2">{reviewFields.map((field) => {
              const isNew = !hasValue(field.current);
              const isSame = !isNew && sameValue(field.current, field.incoming);
              const choice = choiceFor(field);
              return <div key={field.id} className="rounded-md border border-[#E9DEC7] bg-white px-3 py-2"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="font-bold text-[#121B35]">{field.label} <span className={isNew ? "text-emerald-700" : isSame ? "text-[#68646F]" : "text-amber-700"}>({isNew ? "new" : isSame ? "same" : field.mergeOnly ? "adds missing" : "conflict"})</span></p>{!isNew && <p className="mt-1 break-words text-[#68646F]">Current: {displayValue(field.current)}</p>}<p className="mt-1 break-words text-[#121B35]">Upload: {field.mergeOnly && !(field.incoming as unknown[]).length ? "No new amenities" : displayValue(field.incoming)}</p></div>{!field.mergeOnly && !isSame && <div className="flex shrink-0 gap-2"><label className="flex items-center gap-1"><input type="radio" name={`review-${field.id}`} checked={choice === "keep"} onChange={() => setReviewChoices((current) => ({ ...current, [field.id]: "keep" }))} />Keep</label><label className="flex items-center gap-1"><input type="radio" name={`review-${field.id}`} checked={choice === "import"} onChange={() => setReviewChoices((current) => ({ ...current, [field.id]: "import" }))} />Use upload</label></div>}</div></div>;
            })}</div>
          </div>
          {suggestion.warnings.map((warning) => <p key={warning} className="mt-2 text-[11px] leading-relaxed text-[#9A741E]">• {warning}</p>)}
        </div>
      )}
    </section>
  );
}
