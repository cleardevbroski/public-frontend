"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileCheck2, Loader2, RefreshCw, UploadCloud, X } from "lucide-react";
import { uploadPropertyMedia } from "@/lib/api";
import { mapWithConcurrency } from "@/lib/uploadConcurrency";
import { ALL_RERA_DOCUMENT_DEFINITIONS, classifyReraFileName, documentDefinitionByKey, type ReraDocumentDefinition } from "@/lib/reraBulkUpload";
import type { ReraDocument } from "@/components/acres/mock-data";
import { PROPERTY_DOCUMENT_MAX_BYTES, PROPERTY_DOCUMENT_MAX_MB } from "@/lib/propertyMediaLimits";

type QueueStatus = "needs-review" | "ready" | "uploading" | "uploaded" | "error";
type QueueItem = { id: string; file: File; definition?: ReraDocumentDefinition; confidence: "high" | "medium" | "none"; status: QueueStatus; message: string };
type Props = {
  phaseName: string;
  reraDocuments: ReraDocument[];
  projectDocuments: ReraDocument[];
  onChange: (reraDocuments: ReraDocument[], projectDocuments: ReraDocument[]) => void;
  onBusyChange?: (busy: boolean) => void;
};

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const selectionValue = (definition?: ReraDocumentDefinition) => definition ? `${definition.group}:${definition.key}` : "";
const queueId = (file: File, index: number) => `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`;

export default function BulkReraDocumentUploader({ phaseName, reraDocuments, projectDocuments, onChange, onBusyChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const documentsRef = useRef({ reraDocuments, projectDocuments });
  const mountedRef = useRef(true);
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<QueueItem[]>([]);

  useEffect(() => { documentsRef.current = { reraDocuments, projectDocuments }; }, [projectDocuments, reraDocuments]);
  useEffect(() => () => { mountedRef.current = false; onBusyChange?.(false); }, [onBusyChange]);

  const busy = items.some((item) => item.status === "uploading");
  useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);
  const existingKeys = useMemo(() => new Set([
    ...reraDocuments.map((document) => `rera:${document.key}`),
    ...projectDocuments.map((document) => `project:${document.key}`),
  ]), [projectDocuments, reraDocuments]);

  const uploadItems = async (entries: QueueItem[]) => {
    const uploadable = entries.filter((entry) => entry.definition && entry.status !== "uploading" && entry.status !== "uploaded");
    if (!uploadable.length || busy) return;
    const ids = new Set(uploadable.map((entry) => entry.id));
    setItems((current) => current.map((entry) => ids.has(entry.id) ? { ...entry, status: "uploading", message: "Uploading to secure storage…" } : entry));

    const results = await mapWithConcurrency(uploadable, 3, async (entry) => {
      const definition = entry.definition!;
      try {
        const isPdf = entry.file.type === "application/pdf";
        const kind = isPdf
          ? definition.group === "project" ? "project-document-pdf" : "rera-document-pdf"
          : definition.group === "project" ? "project-document-image" : "rera-document-image";
        const fileUrl = await uploadPropertyMedia(entry.file, kind);
        return { id: entry.id, definition, document: {
          key: definition.key,
          label: definition.label,
          annexure: definition.annexure,
          fileName: entry.file.name,
          fileUrl,
          mimeType: entry.file.type as ReraDocument["mimeType"],
          fileSize: entry.file.size,
        } satisfies ReraDocument };
      } catch (cause) {
        return { id: entry.id, definition, error: cause instanceof Error ? cause.message : "Upload failed." };
      }
    });

    if (!mountedRef.current) return;
    const resultById = new Map(results.map((result) => [result.id, result]));
    setItems((current) => current.map((entry) => {
      const result = resultById.get(entry.id);
      if (!result) return entry;
      return result.document
        ? { ...entry, status: "uploaded", message: "Uploaded and assigned." }
        : { ...entry, status: "error", message: result.error || "Upload failed." };
    }));

    const nextRera = [...documentsRef.current.reraDocuments];
    const nextProject = [...documentsRef.current.projectDocuments];
    for (const result of results) {
      if (!result.document) continue;
      const target = result.definition.group === "rera" ? nextRera : nextProject;
      const existingIndex = target.findIndex((document) => document.key === result.definition.key);
      if (existingIndex >= 0) target[existingIndex] = result.document;
      else target.push(result.document);
    }
    documentsRef.current = { reraDocuments: nextRera, projectDocuments: nextProject };
    onChange(nextRera, nextProject);
  };

  const addFiles = (files: FileList | File[]) => {
    const classified = Array.from(files).map((file, index): QueueItem => {
      if (!allowedTypes.has(file.type)) return { id: queueId(file, index), file, confidence: "none", status: "error", message: "Use PDF, JPG, or PNG." };
      if (file.size > PROPERTY_DOCUMENT_MAX_BYTES) return { id: queueId(file, index), file, confidence: "none", status: "error", message: `File exceeds the ${PROPERTY_DOCUMENT_MAX_MB} MB limit.` };
      const match = classifyReraFileName(file.name);
      return { id: queueId(file, index), file, definition: match.definition, confidence: match.confidence, status: match.confidence === "high" ? "ready" : "needs-review", message: match.reason };
    });
    const assignedCounts = new Map<string, number>();
    classified.forEach((item) => { const value = selectionValue(item.definition); if (value) assignedCounts.set(value, (assignedCounts.get(value) || 0) + 1); });
    const prepared = classified.map((item) => {
      const value = selectionValue(item.definition);
      if (!value || item.status === "error") return item;
      if ((assignedCounts.get(value) || 0) > 1) return { ...item, status: "needs-review" as const, message: "Another dropped file matched this category. Choose which file to keep." };
      if (existingKeys.has(value)) return { ...item, status: "needs-review" as const, message: "This category already has a file. Uploading will replace it." };
      return item;
    });
    setItems((current) => [...current, ...prepared]);
    const automatic = prepared.filter((item) => item.status === "ready");
    if (automatic.length) void uploadItems(automatic);
    if (inputRef.current) inputRef.current.value = "";
  };

  const updateAssignment = (id: string, value: string) => {
    const [group, key] = value.split(":");
    const definition = group && key ? documentDefinitionByKey(group as "rera" | "project", key) : undefined;
    setItems((current) => {
      const duplicateInQueue = Boolean(definition && current.some((item) => item.id !== id && selectionValue(item.definition) === value && item.status !== "uploaded"));
      const replacesExisting = Boolean(definition && existingKeys.has(value));
      return current.map((item) => item.id === id ? {
        ...item,
        definition,
        confidence: definition ? "high" : "none",
        status: definition && !duplicateInQueue && !replacesExisting ? "ready" : "needs-review",
        message: !definition
          ? "Choose the document category before uploading."
          : duplicateInQueue
            ? "Another queued file uses this category. Upload only the file you want to keep."
            : replacesExisting
              ? "This category already has a file. Confirming will replace it."
              : `Will be saved as ${definition.label}.`,
      } : item);
    });
  };
  const readyItems = items.filter((item) => item.status === "ready" || item.status === "error" && item.definition);

  return <section className="mt-5 rounded-2xl border border-[#D8C88F] bg-[#FFFDF7] p-4 md:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><UploadCloud className="size-5 text-[#A87519]" /><h4 className="text-[14px] font-bold text-[#121B35]">Smart bulk document import</h4></div><p className="mt-1 text-[11px] leading-5 text-[#68646F]">Drop all files for <strong>{phaseName || "this phase"}</strong>. Recognized names and annexure numbers upload automatically.</p></div>{items.length > 0 && <button type="button" disabled={busy} onClick={() => setItems((current) => current.filter((item) => item.status === "uploading"))} className="text-[10px] font-bold text-[#68646F] disabled:opacity-40">Clear queue</button>}</div>
    <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); if (!busy) addFiles(event.dataTransfer.files); }} className={`mt-4 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-7 text-center transition-colors ${dragging ? "border-[#DDAA42] bg-[#FFF7DF]" : "border-[#D9D2BF] bg-white hover:border-[#DDAA42]"} disabled:cursor-wait disabled:opacity-60`}>
      {busy ? <Loader2 className="size-7 animate-spin text-[#DDAA42]" /> : <UploadCloud className="size-7 text-[#DDAA42]" />}<span className="mt-2 text-[13px] font-bold text-[#121B35]">{busy ? "Uploading files…" : "Drop all RERA and project documents here"}</span><span className="mt-1 text-[10px] text-[#68646F]">PDF, JPG or PNG · {PROPERTY_DOCUMENT_MAX_MB} MB each · 3 concurrent uploads</span>
    </button>
    <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="hidden" onChange={(event) => event.target.files && addFiles(event.target.files)} />
    {items.length > 0 && <div className="mt-4 space-y-2">{items.map((item) => <div key={item.id} className="grid gap-2 rounded-xl border border-[#E5E0D2] bg-white p-3 md:grid-cols-[minmax(0,1fr)_minmax(210px,.75fr)_auto] md:items-center">
      <div className="flex min-w-0 items-start gap-2">{item.status === "uploading" ? <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-[#DDAA42]" /> : item.status === "uploaded" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : item.status === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" /> : <FileCheck2 className="mt-0.5 size-4 shrink-0 text-[#A87519]" />}<div className="min-w-0"><p className="truncate text-[11px] font-bold text-[#121B35]">{item.file.name}</p><p className={`mt-0.5 text-[9px] ${item.status === "error" ? "text-red-600" : item.status === "uploaded" ? "text-emerald-700" : "text-[#68646F]"}`}>{item.message}</p></div></div>
      <select value={selectionValue(item.definition)} disabled={item.status === "uploading" || item.status === "uploaded"} onChange={(event) => updateAssignment(item.id, event.target.value)} className="h-9 min-w-0 rounded-lg border border-[#E4E0E7] bg-white px-2 text-[10px] text-[#3F3D46] disabled:bg-[#F5F4F6]"><option value="">Select document category</option><optgroup label="RERA details">{ALL_RERA_DOCUMENT_DEFINITIONS.filter((definition) => definition.group === "rera").map((definition) => <option key={selectionValue(definition)} value={selectionValue(definition)}>{definition.label}{definition.annexure ? ` · ${definition.annexure}` : ""}</option>)}</optgroup><optgroup label="Project details">{ALL_RERA_DOCUMENT_DEFINITIONS.filter((definition) => definition.group === "project").map((definition) => <option key={selectionValue(definition)} value={selectionValue(definition)}>{definition.label}{definition.annexure ? ` · ${definition.annexure}` : ""}</option>)}</optgroup></select>
      <div className="flex items-center justify-end gap-1">{((item.status === "ready" || item.status === "needs-review") && item.definition || item.status === "error" && item.definition) && <button type="button" disabled={busy} onClick={() => void uploadItems([item])} className="inline-flex size-8 items-center justify-center rounded-lg bg-[#121B35] text-white disabled:opacity-40" title={item.status === "error" ? "Retry upload" : item.status === "needs-review" ? "Confirm and upload" : "Upload file"}>{item.status === "error" ? <RefreshCw className="size-3.5" /> : <UploadCloud className="size-3.5" />}</button>}{item.status !== "uploading" && <button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="inline-flex size-8 items-center justify-center rounded-lg bg-[#F5F3F5] text-[#68646F]" title="Remove from queue"><X className="size-3.5" /></button>}</div>
    </div>)}{readyItems.length > 1 && <div className="flex justify-end"><button type="button" disabled={busy} onClick={() => void uploadItems(readyItems)} className="inline-flex items-center gap-2 rounded-lg bg-[#DDAA42] px-4 py-2 text-[11px] font-bold text-[#121B35] disabled:opacity-50"><UploadCloud className="size-4" />Upload {readyItems.length} ready files</button></div>}</div>}
  </section>;
}
