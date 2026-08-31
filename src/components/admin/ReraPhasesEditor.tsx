"use client";

import { useCallback, useState } from "react";
import { ExternalLink, FileText, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { uploadPropertyMedia } from "@/lib/api";
import type { ReraDocument, ReraPhase } from "@/components/acres/mock-data";
import BulkReraDocumentUploader from "./BulkReraDocumentUploader";
import { classifyReraFileName, PROJECT_DOCUMENT_DEFINITIONS, RERA_DOCUMENT_DEFINITIONS, type ReraDocumentDefinition } from "@/lib/reraBulkUpload";
import { PROPERTY_DOCUMENT_MAX_BYTES, PROPERTY_DOCUMENT_MAX_MB } from "@/lib/propertyMediaLimits";

export const KARNATAKA_RERA_URL = "https://rera.karnataka.gov.in/viewAllProjects";

const emptyPhase = (number: number): ReraPhase => ({
  name: `Phase ${number}`,
  reraNumber: "",
  reraSiteUrl: KARNATAKA_RERA_URL,
  reraDocuments: [],
  projectDocuments: [],
});

type Props = {
  phases: ReraPhase[];
  onChange: (phases: ReraPhase[]) => void;
  error?: string;
  onUploadingChange?: (uploading: boolean) => void;
};

function matchesDefinition(document: ReraDocument, definition: ReraDocumentDefinition) {
  if (document.key === definition.key) return true;
  return [document.key, document.label, document.fileName].some((value) => {
    const match = classifyReraFileName(value);
    return match.definition?.group === definition.group && match.definition.key === definition.key;
  });
}

function DocumentRows({
  definitions,
  documents,
  onChange,
  group,
}: {
  definitions: ReraDocumentDefinition[];
  documents: ReraDocument[];
  onChange: (documents: ReraDocument[]) => void;
  group: "rera" | "project";
}) {
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");

  const upload = async (definition: ReraDocumentDefinition, file?: File) => {
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setError("Documents must be PDF, JPG, or PNG files.");
      return;
    }
    if (file.size > PROPERTY_DOCUMENT_MAX_BYTES) {
      setError(`Each document must be ${PROPERTY_DOCUMENT_MAX_MB} MB or smaller.`);
      return;
    }
    setUploading(definition.key);
    setError("");
    try {
      const kind = file.type === "application/pdf"
        ? group === "project" ? "project-document-pdf" : "rera-document-pdf"
        : group === "project" ? "project-document-image" : "rera-document-image";
      const fileUrl = await uploadPropertyMedia(file, kind);
      const next: ReraDocument = {
        key: definition.key,
        label: definition.label,
        annexure: definition.annexure,
        fileName: file.name,
        fileUrl,
        mimeType: file.type as ReraDocument["mimeType"],
        fileSize: file.size,
      };
      onChange([...documents.filter((item) => !matchesDefinition(item, definition)), next]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Document upload failed.");
    } finally {
      setUploading("");
    }
  };

  return (
    <div className="space-y-2">
      {definitions.map((definition) => {
        const matchingDocuments = documents.filter((item) => matchesDefinition(item, definition));
        const document = matchingDocuments[0];
        return (
          <div key={definition.key} className="rounded-xl border border-[#E4E0E7] bg-white p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex min-w-0 items-start gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(document)}
                  onChange={(event) => {
                    if (!event.target.checked) onChange(documents.filter((item) => !matchesDefinition(item, definition)));
                    else window.document.getElementById(`rera-upload-${definition.key}`)?.click();
                  }}
                  className="mt-1"
                />
                <span>
                  <span className="block text-[12px] font-bold text-[#121B35]">{definition.label}</span>
                  {definition.annexure && <span className="text-[10px] text-[#68646F]">{definition.annexure}</span>}
                  {document && <span className="block max-w-sm truncate text-[10px] text-green-700">{document.fileName}</span>}
                  {matchingDocuments.length > 1 && <span className="block text-[9px] text-[#68646F]">{matchingDocuments.length} saved parts</span>}
                </span>
              </label>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#121B35] px-3 py-2 text-[11px] font-bold text-white">
                {uploading === definition.key ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                {document ? "Replace" : "Select & upload"}
                <input
                  id={`rera-upload-${definition.key}`}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  disabled={Boolean(uploading)}
                  onChange={(event) => void upload(definition, event.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        );
      })}
      {documents.length > 0 && (
        <div className="mt-4 rounded-xl border border-[#D8C88F] bg-[#FFFDF7] p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold text-[#121B35]">All saved documents</p>
            <span className="rounded-full bg-[#F0E6C7] px-2 py-1 text-[9px] font-bold text-[#795A18]">{documents.length} files</span>
          </div>
          <div className="mt-2 space-y-2">
            {documents.map((document, index) => (
              <div key={document._id || `${document.key}-${document.fileName}-${index}`} className="flex items-center gap-2 rounded-lg border border-[#E5E0D2] bg-white p-2.5">
                <FileText className="size-4 shrink-0 text-[#DDAA42]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold text-[#121B35]">{document.label || document.fileName}</p>
                  <p className="truncate text-[9px] text-[#68646F]">{document.fileName}</p>
                </div>
                {document.fileUrl && <a href={document.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-[#121B35] px-2 py-1.5 text-[9px] font-bold text-white">Open <ExternalLink className="size-3" /></a>}
                <button type="button" onClick={() => onChange(documents.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex size-7 items-center justify-center rounded-md bg-red-50 text-red-600" title="Remove document"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

export default function ReraPhasesEditor({ phases, onChange, error, onUploadingChange }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bulkUploading, setBulkUploading] = useState(false);
  const handleBulkUploading = useCallback((uploading: boolean) => {
    setBulkUploading(uploading);
    onUploadingChange?.(uploading);
  }, [onUploadingChange]);
  const safePhases = (phases.length ? phases : [emptyPhase(1)]).map((phase) => ({ ...phase, reraSiteUrl: phase.reraSiteUrl || KARNATAKA_RERA_URL }));
  const active = safePhases[Math.min(activeIndex, safePhases.length - 1)];

  const updateActive = (updates: Partial<ReraPhase>) => {
    const next = [...safePhases];
    next[Math.min(activeIndex, next.length - 1)] = { ...active, ...updates };
    onChange(next.map((phase, order) => ({ ...phase, reraSiteUrl: phase.reraSiteUrl || KARNATAKA_RERA_URL, order })));
  };

  const addPhase = () => {
    const next = [...safePhases, emptyPhase(safePhases.length + 1)];
    onChange(next.map((phase, order) => ({ ...phase, reraSiteUrl: phase.reraSiteUrl || KARNATAKA_RERA_URL, order })));
    setActiveIndex(next.length - 1);
  };

  const removePhase = () => {
    if (safePhases.length === 1) {
      onChange([emptyPhase(1)]);
      return;
    }
    const next = safePhases.filter((_, index) => index !== activeIndex);
    onChange(next.map((phase, order) => ({ ...phase, reraSiteUrl: phase.reraSiteUrl || KARNATAKA_RERA_URL, order })));
    setActiveIndex(Math.max(0, activeIndex - 1));
  };

  return (
    <div className="rounded-2xl border border-[#E4E0E7] bg-[#F8F7FA] p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        {safePhases.map((phase, index) => (
          <button key={phase._id || `${phase.name}-${index}`} type="button" disabled={bulkUploading} onClick={() => setActiveIndex(index)} className={`rounded-lg px-3 py-2 text-[11px] font-bold disabled:cursor-wait disabled:opacity-50 ${index === activeIndex ? "bg-[#DDAA42] text-[#0B1328]" : "bg-white text-[#68646F]"}`}>
            {phase.name || `Phase ${index + 1}`}
          </button>
        ))}
        <button type="button" disabled={bulkUploading} onClick={addPhase} className="inline-flex items-center gap-1 rounded-lg border border-[#DDAA42] px-3 py-2 text-[11px] font-bold text-[#9A6B00] disabled:cursor-wait disabled:opacity-50"><Plus className="size-3.5" />Add phase</button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="text-[12px] font-bold text-[#3F3D46]">Phase name *
          <input value={active.name} onChange={(event) => updateActive({ name: event.target.value })} maxLength={100} placeholder="Phase 1" className="mt-1 w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 font-normal" />
        </label>
        <label className="text-[12px] font-bold text-[#3F3D46]">RERA registration number *
          <input value={active.reraNumber} onChange={(event) => updateActive({ reraNumber: event.target.value })} maxLength={100} placeholder="PRM/KA/RERA/..." className="mt-1 w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 font-normal" />
        </label>
        <label className="text-[12px] font-bold text-[#3F3D46] md:col-span-2">Official Karnataka RERA project URL
          <input type="url" value={active.reraSiteUrl || KARNATAKA_RERA_URL} onChange={(event) => updateActive({ reraSiteUrl: event.target.value })} maxLength={2000} placeholder={KARNATAKA_RERA_URL} className="mt-1 w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 font-normal" />
          <span className="mt-1 block text-[10px] font-normal text-[#68646F]">Only HTTPS links on rera.karnataka.gov.in are accepted. The general project search page is used by default.</span>
        </label>
      </div>

      <div className="mt-5 rounded-xl border border-[#DDD4BE] bg-white p-4">
        <h5 className="text-[12px] font-bold text-[#121B35]">Official RERA project information</h5>
        <p className="mt-1 text-[10px] text-[#68646F]">Public facts from the registration record. ZIP imports fill these fields when the certificate or project metadata supplies them.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-[11px] font-bold text-[#3F3D46]">Official promoter
            <input value={active.officialDetails?.promoterName || ""} onChange={(event) => updateActive({ officialDetails: { ...active.officialDetails, promoterName: event.target.value } })} maxLength={250} className="mt-1 w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 font-normal" />
          </label>
          <label className="text-[11px] font-bold text-[#3F3D46]">RERA project ID
            <input value={active.officialDetails?.projectId || ""} onChange={(event) => updateActive({ officialDetails: { ...active.officialDetails, projectId: event.target.value } })} maxLength={100} className="mt-1 w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 font-normal" />
          </label>
          <label className="text-[11px] font-bold text-[#3F3D46]">Acknowledgement number
            <input value={active.officialDetails?.acknowledgementNumber || ""} onChange={(event) => updateActive({ officialDetails: { ...active.officialDetails, acknowledgementNumber: event.target.value } })} maxLength={150} className="mt-1 w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 font-normal" />
          </label>
          <label className="text-[11px] font-bold text-[#3F3D46]">Registration status
            <input value={active.officialDetails?.registrationStatus || ""} onChange={(event) => updateActive({ officialDetails: { ...active.officialDetails, registrationStatus: event.target.value } })} maxLength={100} className="mt-1 w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 font-normal" />
          </label>
          <label className="text-[11px] font-bold text-[#3F3D46]">District
            <input value={active.officialDetails?.district || ""} onChange={(event) => updateActive({ officialDetails: { ...active.officialDetails, district: event.target.value } })} maxLength={150} className="mt-1 w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 font-normal" />
          </label>
          <div className="hidden md:block" />
          <label className="text-[11px] font-bold text-[#3F3D46]">Project approval date
            <input type="date" value={active.officialDetails?.approvalDate || ""} onChange={(event) => updateActive({ officialDetails: { ...active.officialDetails, approvalDate: event.target.value } })} className="mt-1 w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 font-normal" />
          </label>
          <label className="text-[11px] font-bold text-[#3F3D46]">Registered completion date
            <input type="date" value={active.officialDetails?.registeredCompletionDate || ""} onChange={(event) => updateActive({ officialDetails: { ...active.officialDetails, registeredCompletionDate: event.target.value } })} className="mt-1 w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 font-normal" />
          </label>
          <label className="text-[11px] font-bold text-[#3F3D46] md:col-span-2">Registered project address
            <textarea value={active.officialDetails?.registeredAddress || ""} onChange={(event) => updateActive({ officialDetails: { ...active.officialDetails, registeredAddress: event.target.value } })} rows={2} maxLength={1000} className="mt-1 w-full resize-y rounded-lg border border-[#E4E0E7] px-3 py-2.5 font-normal" />
          </label>
          <label className="text-[11px] font-bold text-[#3F3D46] md:col-span-2">Promoter address
            <textarea value={active.officialDetails?.promoterAddress || ""} onChange={(event) => updateActive({ officialDetails: { ...active.officialDetails, promoterAddress: event.target.value } })} rows={2} maxLength={1000} className="mt-1 w-full resize-y rounded-lg border border-[#E4E0E7] px-3 py-2.5 font-normal" />
          </label>
        </div>
      </div>

      <BulkReraDocumentUploader
        key={active._id || `phase-${activeIndex}`}
        phaseName={active.name}
        reraDocuments={active.reraDocuments || []}
        projectDocuments={active.projectDocuments || []}
        onBusyChange={handleBulkUploading}
        onChange={(reraDocuments, projectDocuments) => updateActive({ reraDocuments, projectDocuments })}
      />

      <div className="mt-6">
        <h4 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#121B35]"><FileText className="size-4 text-[#DDAA42]" />RERA Details</h4>
        <DocumentRows group="rera" definitions={RERA_DOCUMENT_DEFINITIONS} documents={active.reraDocuments || []} onChange={(reraDocuments) => updateActive({ reraDocuments })} />
      </div>
      <div className="mt-6">
        <h4 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#121B35]"><FileText className="size-4 text-[#DDAA42]" />Project Details</h4>
        <DocumentRows group="project" definitions={PROJECT_DOCUMENT_DEFINITIONS} documents={active.projectDocuments || []} onChange={(projectDocuments) => updateActive({ projectDocuments })} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1 text-[10px] text-green-700"><Save className="size-3.5" />Phase details are saved with the property.</p>
        <button type="button" disabled={bulkUploading} onClick={removePhase} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 disabled:cursor-wait disabled:opacity-50"><Trash2 className="size-3.5" />Remove phase</button>
      </div>
      {error && <p className="mt-3 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
