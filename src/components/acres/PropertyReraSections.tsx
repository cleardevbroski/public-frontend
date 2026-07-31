"use client";

import { useState } from "react";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";
import type { Property, ReraDocument } from "./mock-data";
import { downloadPropertyDocument } from "@/lib/api";
import { useAuth } from "./AuthContext";
import DocumentAccessModal from "./DocumentAccessModal";

type PendingDocument = { phaseId: string; document: ReraDocument } | null;
const KARNATAKA_RERA_URL = "https://rera.karnataka.gov.in/viewAllProjects";

export default function PropertyReraSections({ property, setSectionRef }: { property: Property; setSectionRef: (id: string) => (element: HTMLDivElement | null) => void }) {
  const phases = property.reraPhases || [];
  const { user } = useAuth();
  const [reraPhase, setReraPhase] = useState(0);
  const [projectPhase, setProjectPhase] = useState(0);
  const [pending, setPending] = useState<PendingDocument>(null);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");
  const [showReraDocuments, setShowReraDocuments] = useState(false);
  const [showProjectDocuments, setShowProjectDocuments] = useState(false);

  if (!property.reraRegistered || !phases.length) return null;

  const download = async (phaseId: string, document: ReraDocument) => {
    if (!phaseId || !document._id) return setError("This document needs to be saved again before it can be downloaded.");
    setDownloading(document._id);
    setError("");
    try {
      await downloadPropertyDocument(property.id, phaseId, document._id, document.fileName);
      setPending(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to download document.");
      throw cause;
    } finally {
      setDownloading("");
    }
  };

  const requestDownload = (phaseId: string, document: ReraDocument) => {
    if (user?.name && user?.email) void download(phaseId, document).catch(() => {});
    else setPending({ phaseId, document });
  };

  const tabs = (active: number, setActive: (value: number) => void) => (
    <div className="flex flex-wrap gap-2">
      {phases.map((phase, index) => <button key={phase._id || `${phase.name}-${index}`} type="button" onClick={() => setActive(index)} className={`rounded-full px-4 py-2 text-[12px] font-bold ${index === active ? "bg-[#DDAA42] text-[#0B1328]" : "bg-[#F3F1F5] text-[#68646F]"}`}>{phase.name}</button>)}
    </div>
  );

  const documents = (phaseId: string | undefined, rows: ReraDocument[]) => rows.length ? (
    <div className="divide-y divide-[#E4E0E7] overflow-hidden rounded-2xl border border-[#E4E0E7]">
      {rows.map((document) => (
        <div key={document._id || document.key} className="flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3"><FileText className="mt-0.5 size-5 shrink-0 text-[#DDAA42]" /><div><p className="text-[13px] font-bold text-[#121B35]">{document.label}</p>{document.annexure && <p className="text-[10px] text-[#68646F]">{document.annexure}</p>}<p className="max-w-md truncate text-[10px] text-[#77717E]">{document.fileName}</p></div></div>
          <button type="button" disabled={downloading === document._id} onClick={() => requestDownload(phaseId || "", document)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDAA42] px-4 py-2.5 text-[12px] font-bold text-[#9A6B00] disabled:opacity-50">{downloading === document._id ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}Download</button>
        </div>
      ))}
    </div>
  ) : <p className="rounded-xl bg-[#F8F7FA] p-4 text-[12px] text-[#68646F]">No documents uploaded for this phase.</p>;

  const selectedRera = phases[Math.min(reraPhase, phases.length - 1)];
  const selectedProject = phases[Math.min(projectPhase, phases.length - 1)];

  return (
    <>
      <div ref={setSectionRef("rera-details")} className="space-y-5 rounded-3xl border border-[#E4E0E7]/30 bg-white p-6 shadow-md md:p-8">
        <h2 className="flex items-center gap-2 text-[20px] font-bold text-[#121B35]"><span className="h-6 w-1.5 rounded-full bg-[#DDAA42]" />RERA Details</h2>
        {tabs(reraPhase, setReraPhase)}
        <div className="grid gap-4 rounded-2xl bg-[#121B35] p-5 text-white md:grid-cols-[1fr_auto]">
          <div><p className="text-[10px] font-bold uppercase tracking-widest text-white/55">Project / Phase</p><p className="mt-1 text-[14px] font-bold text-white">{property.title} · {selectedRera.name}</p><p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white/55">Karnataka RERA registration number</p><p className="mt-1 break-all text-[16px] font-bold text-[#F2C052]">{selectedRera.reraNumber}</p><a href={KARNATAKA_RERA_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#F2C052]">Open Karnataka RERA <ExternalLink className="size-3.5" /></a></div>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(KARNATAKA_RERA_URL)}`} alt="QR code for Karnataka RERA" className="size-28 rounded-xl bg-white p-2" />
        </div>
        <button type="button" onClick={() => setShowReraDocuments((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-[#DDAA42] px-4 py-2.5 text-[12px] font-bold text-[#9A6B00]">{showReraDocuments ? "Hide RERA Details" : "View / Download RERA Details"}</button>
        <div className={showReraDocuments ? "" : "hidden"} aria-hidden={!showReraDocuments}>{documents(selectedRera._id, selectedRera.reraDocuments || [])}</div>
      </div>
      <div ref={setSectionRef("project-details")} className="space-y-5 rounded-3xl border border-[#E4E0E7]/30 bg-white p-6 shadow-md md:p-8">
        <h2 className="flex items-center gap-2 text-[20px] font-bold text-[#121B35]"><span className="h-6 w-1.5 rounded-full bg-[#DDAA42]" />Project Details</h2>
        {tabs(projectPhase, setProjectPhase)}
        <button type="button" onClick={() => setShowProjectDocuments((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-[#DDAA42] px-4 py-2.5 text-[12px] font-bold text-[#9A6B00]">{showProjectDocuments ? "Hide Project Details" : "View / Download Project Details"}</button>
        <div className={showProjectDocuments ? "" : "hidden"} aria-hidden={!showProjectDocuments}>{documents(selectedProject._id, selectedProject.projectDocuments || [])}</div>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-[12px] text-red-600">{error}</p>}
      <DocumentAccessModal open={Boolean(pending)} documentName={pending?.document.label || ""} onClose={() => setPending(null)} onVerified={() => pending ? download(pending.phaseId, pending.document) : Promise.resolve()} />
    </>
  );
}
