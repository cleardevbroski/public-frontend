"use client";

import { useState } from "react";
import { FileText, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { uploadPropertyMedia } from "@/lib/api";
import type { ReraDocument, ReraPhase } from "@/components/acres/mock-data";

type DocumentDefinition = { key: string; label: string; annexure?: string };

export const RERA_DOCUMENT_DEFINITIONS: DocumentDefinition[] = [
  { key: "registration-certificate", label: "Registration Certificate", annexure: "Annexure 1" },
  { key: "certificate-of-incorporation", label: "Certificate of Incorporation" },
  { key: "memorandum-of-association", label: "Memorandum of Association", annexure: "Annexure 15" },
  { key: "articles-of-association", label: "Articles of Association", annexure: "Annexure 16" },
  { key: "pan-card", label: "PAN Card", annexure: "Annexure 2" },
];

export const PROJECT_DOCUMENT_DEFINITIONS: DocumentDefinition[] = [
  { key: "commencement-certificate", label: "Commencement Certificate", annexure: "Annexure 80" },
  { key: "approved-building-plan", label: "Approved Building Plan", annexure: "Annexure 81" },
  { key: "sectional-drawing", label: "Sectional Drawing of the Apartments", annexure: "Annexure 82" },
  { key: "structural-safety-certificate", label: "Structural Safety Certificate from Registered Engineer", annexure: "Annexure 83" },
  { key: "project-specifications", label: "Project Specifications", annexure: "Annexure 84" },
  { key: "brochure", label: "Brochure", annexure: "Annexure 85" },
  { key: "relinquishment-deed", label: "Relinquishment Deed", annexure: "Annexure 86" },
  { key: "agreement-for-sale", label: "Proforma of Agreement for Sale", annexure: "Annexure 87" },
  { key: "allotment-letter", label: "Proforma of Allotment Letter", annexure: "Annexure 88" },
];

const emptyPhase = (number: number): ReraPhase => ({
  name: `Phase ${number}`,
  reraNumber: "",
  reraSiteUrl: "",
  panNumber: "",
  reraDocuments: [],
  projectDocuments: [],
});

type Props = {
  phases: ReraPhase[];
  onChange: (phases: ReraPhase[]) => void;
  error?: string;
};

function DocumentRows({
  definitions,
  documents,
  onChange,
}: {
  definitions: DocumentDefinition[];
  documents: ReraDocument[];
  onChange: (documents: ReraDocument[]) => void;
}) {
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");

  const upload = async (definition: DocumentDefinition, file?: File) => {
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      setError("Documents must be PDF, JPG, or PNG files.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Each document must be 15 MB or smaller.");
      return;
    }
    setUploading(definition.key);
    setError("");
    try {
      const kind = file.type === "application/pdf" ? "rera-document-pdf" : "rera-document-image";
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
      onChange([...documents.filter((item) => item.key !== definition.key), next]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Document upload failed.");
    } finally {
      setUploading("");
    }
  };

  return (
    <div className="space-y-2">
      {definitions.map((definition) => {
        const document = documents.find((item) => item.key === definition.key);
        return (
          <div key={definition.key} className="rounded-xl border border-[#E4E0E7] bg-white p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex min-w-0 items-start gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(document)}
                  onChange={(event) => {
                    if (!event.target.checked) onChange(documents.filter((item) => item.key !== definition.key));
                    else window.document.getElementById(`rera-upload-${definition.key}`)?.click();
                  }}
                  className="mt-1"
                />
                <span>
                  <span className="block text-[12px] font-bold text-[#121B35]">{definition.label}</span>
                  {definition.annexure && <span className="text-[10px] text-[#68646F]">{definition.annexure}</span>}
                  {document && <span className="block max-w-sm truncate text-[10px] text-green-700">{document.fileName}</span>}
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
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

export default function ReraPhasesEditor({ phases, onChange, error }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safePhases = phases.length ? phases : [emptyPhase(1)];
  const active = safePhases[Math.min(activeIndex, safePhases.length - 1)];

  const updateActive = (updates: Partial<ReraPhase>) => {
    const next = [...safePhases];
    next[Math.min(activeIndex, next.length - 1)] = { ...active, ...updates };
    onChange(next.map((phase, order) => ({ ...phase, order })));
  };

  const addPhase = () => {
    const next = [...safePhases, emptyPhase(safePhases.length + 1)];
    onChange(next);
    setActiveIndex(next.length - 1);
  };

  const removePhase = () => {
    if (safePhases.length === 1) {
      onChange([emptyPhase(1)]);
      return;
    }
    const next = safePhases.filter((_, index) => index !== activeIndex);
    onChange(next.map((phase, order) => ({ ...phase, order })));
    setActiveIndex(Math.max(0, activeIndex - 1));
  };

  return (
    <div className="rounded-2xl border border-[#E4E0E7] bg-[#F8F7FA] p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        {safePhases.map((phase, index) => (
          <button key={phase._id || `${phase.name}-${index}`} type="button" onClick={() => setActiveIndex(index)} className={`rounded-lg px-3 py-2 text-[11px] font-bold ${index === activeIndex ? "bg-[#DDAA42] text-[#0B1328]" : "bg-white text-[#68646F]"}`}>
            {phase.name || `Phase ${index + 1}`}
          </button>
        ))}
        <button type="button" onClick={addPhase} className="inline-flex items-center gap-1 rounded-lg border border-[#DDAA42] px-3 py-2 text-[11px] font-bold text-[#9A6B00]"><Plus className="size-3.5" />Add phase</button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="text-[12px] font-bold text-[#3F3D46]">Phase name *
          <input value={active.name} onChange={(event) => updateActive({ name: event.target.value })} maxLength={100} placeholder="Phase 1" className="mt-1 w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 font-normal" />
        </label>
        <label className="text-[12px] font-bold text-[#3F3D46]">RERA registration number *
          <input value={active.reraNumber} onChange={(event) => updateActive({ reraNumber: event.target.value })} maxLength={100} placeholder="PRM/KA/RERA/..." className="mt-1 w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 font-normal" />
        </label>
        <label className="text-[12px] font-bold text-[#3F3D46]">Official RERA website URL
          <input type="url" value={active.reraSiteUrl || ""} onChange={(event) => updateActive({ reraSiteUrl: event.target.value })} placeholder="https://rera.karnataka.gov.in/..." className="mt-1 w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 font-normal" />
        </label>
        <label className="text-[12px] font-bold text-[#3F3D46]">PAN number
          <input value={active.panNumber || ""} onChange={(event) => updateActive({ panNumber: event.target.value.toUpperCase() })} maxLength={10} placeholder="AAAAA9999A" className="mt-1 w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 font-normal uppercase" />
        </label>
      </div>

      <div className="mt-6">
        <h4 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#121B35]"><FileText className="size-4 text-[#DDAA42]" />RERA Details</h4>
        <DocumentRows definitions={RERA_DOCUMENT_DEFINITIONS} documents={active.reraDocuments || []} onChange={(reraDocuments) => updateActive({ reraDocuments })} />
      </div>
      <div className="mt-6">
        <h4 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#121B35]"><FileText className="size-4 text-[#DDAA42]" />Project Details</h4>
        <DocumentRows definitions={PROJECT_DOCUMENT_DEFINITIONS} documents={active.projectDocuments || []} onChange={(projectDocuments) => updateActive({ projectDocuments })} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1 text-[10px] text-green-700"><Save className="size-3.5" />Phase details are saved with the property.</p>
        <button type="button" onClick={removePhase} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600"><Trash2 className="size-3.5" />Remove phase</button>
      </div>
      {error && <p className="mt-3 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
