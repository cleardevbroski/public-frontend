"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Building2, ChevronDown, Download, ExternalLink, FileCheck2, FileText, Loader2, ShieldCheck,
} from "lucide-react";
import type { Property, ReraDocument } from "./mock-data";
import { downloadPropertyDocument } from "@/lib/api";
import { useAuth } from "./AuthContext";
import DocumentAccessModal from "./DocumentAccessModal";

type WorkspaceView = "rera" | "project";
type PendingDocument = { phaseId: string; document: ReraDocument } | null;

const KARNATAKA_RERA_URL = "https://rera.karnataka.gov.in/viewAllProjects";
const officialReraUrl = (value?: string) => {
  try {
    const url = new URL(value || KARNATAKA_RERA_URL);
    return url.protocol === "https:" && ["rera.karnataka.gov.in", "www.rera.karnataka.gov.in"].includes(url.hostname.toLowerCase())
      ? url.toString()
      : KARNATAKA_RERA_URL;
  } catch {
    return KARNATAKA_RERA_URL;
  }
};

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Size unavailable";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const formatUploadDate = (value?: string) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

function VerificationQr({ url }: { url: string }) {
  const [source, setSource] = useState("");

  useEffect(() => {
    let active = true;
    setSource("");
    QRCode.toDataURL(url, {
      width: 184,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#121B35", light: "#FFFFFF" },
    }).then((dataUrl) => active && setSource(dataUrl)).catch(() => active && setSource(""));
    return () => { active = false; };
  }, [url]);

  return source
    ? <img src={source} alt="QR code to verify this phase on Karnataka RERA" className="size-20 rounded-lg border border-[#E1E5EC] bg-white p-1.5" />
    : <div className="grid size-20 place-items-center rounded-lg border border-[#E1E5EC] bg-white px-2 text-center text-[9px] font-semibold text-[#687080]">Preparing QR code</div>;
}

function DocumentRows({
  phaseId,
  rows,
  downloading,
  onDownload,
  emptyLabel,
}: {
  phaseId?: string;
  rows: ReraDocument[];
  downloading: string;
  onDownload: (phaseId: string, document: ReraDocument) => void;
  emptyLabel: string;
}) {
  if (!rows.length) {
    return <div className="rounded-xl border border-dashed border-[#D8DCE4] bg-[#F8F9FB] px-5 py-10 text-center"><FileText className="mx-auto size-7 text-[#9AA1AE]" /><p className="mt-3 text-[13px] font-bold text-[#343B49]">No documents uploaded</p><p className="mt-1 text-[11px] text-[#737B89]">{emptyLabel}</p></div>;
  }

  return <div className="overflow-hidden rounded-xl border border-[#E2E5EB] bg-white">
    <div className="hidden grid-cols-[minmax(0,1fr)_130px_100px_132px] border-b border-[#E2E5EB] bg-[#F8F9FB] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#737B89] md:grid">
      <span>Document</span><span>Uploaded</span><span>File size</span><span className="text-right">Access</span>
    </div>
    <div className="divide-y divide-[#E8EAF0]">
      {rows.map((document) => {
        const isDownloading = downloading === document._id;
        return <div key={document._id || document.key} className="grid gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,1fr)_130px_100px_132px] md:items-center">
          <div className="flex min-w-0 items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#FFF5DE] text-[#A36B00]"><FileText className="size-4" /></span><div className="min-w-0"><p className="text-[12px] font-bold text-[#172039]">{document.label}</p>{document.annexure && <p className="mt-0.5 text-[10px] text-[#717987]">{document.annexure}</p>}<p className="mt-0.5 truncate text-[10px] text-[#8A919D]">{document.fileName}</p></div></div>
          <p className="text-[11px] tabular-nums text-[#59616F]"><span className="mr-2 font-semibold md:hidden">Uploaded:</span>{formatUploadDate(document.uploadedAt)}</p>
          <p className="text-[11px] tabular-nums text-[#59616F]"><span className="mr-2 font-semibold md:hidden">Size:</span>{formatFileSize(document.fileSize)}</p>
          <button type="button" disabled={isDownloading} onClick={() => onDownload(phaseId || "", document)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#DDAA42] px-4 text-[11px] font-bold text-[#8A6107] transition hover:bg-[#FFF8E8] active:translate-y-px disabled:cursor-wait disabled:opacity-55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DDAA42]">{isDownloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}Download</button>
        </div>;
      })}
    </div>
  </div>;
}

export default function PropertyReraSections({
  property,
  setSectionRef,
  activeView,
  onViewChange,
}: {
  property: Property;
  setSectionRef: (id: string) => (element: HTMLDivElement | null) => void;
  activeView?: WorkspaceView;
  onViewChange?: (view: WorkspaceView) => void;
}) {
  const phases = property.reraPhases || [];
  const hasProjectDocuments = phases.some((phase) => Boolean(phase.projectDocuments?.length));
  const { user } = useAuth();
  const [view, setView] = useState<WorkspaceView>(activeView === "project" && hasProjectDocuments ? "project" : "rera");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [pending, setPending] = useState<PendingDocument>(null);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeView) setView(activeView === "project" && !hasProjectDocuments ? "rera" : activeView);
  }, [activeView, hasProjectDocuments]);

  useEffect(() => {
    setPhaseIndex((current) => Math.min(current, Math.max(0, phases.length - 1)));
  }, [phases.length]);

  if (!property.reraRegistered || !phases.length) return null;

  const selected = phases[Math.min(phaseIndex, phases.length - 1)];
  const officialUrl = officialReraUrl(selected.reraSiteUrl);
  const visibleDocuments = view === "rera" ? selected.reraDocuments || [] : selected.projectDocuments || [];
  const panelKey = `${selected._id || phaseIndex}:${view}`;
  const panelId = `phase-downloads-${phaseIndex}-${view}`;
  const downloadsExpanded = Boolean(expandedPanels[panelKey]);

  const selectView = (next: WorkspaceView) => {
    setView(next);
    onViewChange?.(next);
  };

  const download = async (phaseId: string, document: ReraDocument) => {
    if (!phaseId || !document._id) {
      setError("This document must be saved again before it can be downloaded.");
      return;
    }
    setDownloading(document._id);
    setError("");
    try {
      await downloadPropertyDocument(property.id, phaseId, document._id, document.fileName);
      setPending(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to download this document.");
      throw cause;
    } finally {
      setDownloading("");
    }
  };

  const requestDownload = (phaseId: string, document: ReraDocument) => {
    if (user?.name && user?.email) void download(phaseId, document).catch(() => {});
    else setPending({ phaseId, document });
  };

  return <>
    <div ref={setSectionRef("rera-details")} className="overflow-hidden rounded-2xl border border-[#DDE1E8] bg-white shadow-[0_8px_28px_rgba(18,27,53,.06)]" aria-labelledby="verification-workspace-heading">
      <div className="flex flex-col gap-3 border-b border-[#E2E5EB] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
        <div><p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#A36B00]">Official project records</p><h2 id="verification-workspace-heading" className="mt-1 text-[19px] font-extrabold tracking-[-.02em] text-[#172039]">RERA &amp; Project Details</h2><p className="mt-1 text-[10px] text-[#687080]">Phase-wise registration and approved project documents.</p></div>
        <div className="flex min-w-0 flex-col gap-2 md:items-end">
          <nav className={`grid overflow-hidden rounded-lg border border-[#D8DCE4] bg-[#F7F8FA] p-1 ${hasProjectDocuments ? "grid-cols-2" : "grid-cols-1"}`} aria-label="Verification details">
            <button type="button" aria-pressed={view === "rera"} onClick={() => selectView("rera")} className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-[11px] font-bold transition active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#DDAA42] ${view === "rera" ? "bg-[#DDAA42] text-[#121B35] shadow-sm" : "text-[#626A78] hover:bg-white"}`}><FileCheck2 className="size-4" />RERA Details</button>
            {hasProjectDocuments && <button type="button" aria-pressed={view === "project"} onClick={() => selectView("project")} className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-[11px] font-bold transition active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#DDAA42] ${view === "project" ? "bg-[#DDAA42] text-[#121B35] shadow-sm" : "text-[#626A78] hover:bg-white"}`}><Building2 className="size-4" />Project Details</button>}
          </nav>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-0.5" aria-label="Project phase">{phases.map((phase, index) => <button key={phase._id || `${phase.name}-${index}`} type="button" aria-pressed={phaseIndex === index} onClick={() => setPhaseIndex(index)} className={`min-h-8 shrink-0 rounded-md px-3 text-[10px] font-bold transition active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DDAA42] ${phaseIndex === index ? "bg-[#172039] text-white" : "border border-[#DFE2E8] bg-white text-[#626A78] hover:border-[#DDAA42]"}`}>{phase.name}</button>)}</div>
        </div>
      </div>

      <div>
        <section className="min-w-0 p-4 md:p-5" aria-live="polite">
          <div data-testid="selected-phase-summary" className="grid gap-3 rounded-xl border border-[#E1E4EA] bg-[#FAFBFC] p-3.5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-[#687080]">Selected project phase</p>
              <p className="mt-1 text-[14px] font-extrabold leading-5 text-[#172039]">{property.title} · {selected.name}</p>
              <p className="mt-1.5 max-w-[520px] text-[10px] leading-4 text-[#687080]">{view === "rera" ? "Registration certificates and phase-wise records supplied for official verification." : "Approved plans, certificates, specifications and buyer-facing project records."}</p>
            </div>
            <div data-testid="phase-verification" className="flex min-w-0 items-center gap-2.5 border-t border-[#E1E5EC] pt-3 lg:min-w-[290px] lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
              <div className="shrink-0"><VerificationQr url={officialUrl} /></div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[.08em] text-[#A36B00]">Karnataka RERA number</p>
                <p className="mt-1 break-all text-[11px] font-extrabold leading-4 tabular-nums text-[#172039]">{selected.reraNumber}</p>
                <a href={officialUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[#DDAA42] px-2.5 text-[10px] font-bold whitespace-nowrap text-[#8A6107] transition hover:bg-[#FFF8E8] active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DDAA42]">Open Karnataka RERA <ExternalLink className="size-3.5" /></a>
              </div>
            </div>
          </div>
          {visibleDocuments.length > 0 && <div className="mt-2 flex justify-end" data-testid="download-disclosure">
            <button
              type="button"
              aria-expanded={downloadsExpanded}
              aria-controls={panelId}
              aria-label={`${downloadsExpanded ? "Hide" : "View"} ${view === "rera" ? "RERA" : "project"} downloads`}
              onClick={() => setExpandedPanels((current) => ({ ...current, [panelKey]: !downloadsExpanded }))}
              className="inline-flex min-h-7 items-center gap-1 text-[10px] font-bold text-[#8A6107] underline decoration-[#DDAA42]/60 underline-offset-4 transition hover:text-[#664600] active:translate-y-px focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DDAA42]"
            >
              {downloadsExpanded ? "Hide downloads" : "View downloads"}
              <ChevronDown aria-hidden="true" className={`size-3.5 transition-transform ${downloadsExpanded ? "rotate-180" : ""}`} />
            </button>
          </div>}
          {visibleDocuments.length > 0 && downloadsExpanded && <div id={panelId} data-testid="phase-downloads" className="mt-4 border-t border-[#E2E5EB] pt-4">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <h3 className="text-[13px] font-extrabold text-[#172039]">{view === "rera" ? "RERA documents" : "Project documents"}</h3>
              <p className="hidden items-center gap-1.5 text-[9px] text-[#687080] sm:flex"><ShieldCheck className="size-3.5 text-[#A36B00]" />Verified access required</p>
            </div>
            <DocumentRows phaseId={selected._id} rows={visibleDocuments} downloading={downloading} onDownload={requestDownload} emptyLabel={`No ${view === "rera" ? "RERA" : "project"} documents are available for ${selected.name}.`} />
            {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[11px] font-semibold text-red-700">{error}</p>}
            <p className="mt-3 flex items-center gap-2 text-[9px] text-[#687080]"><ShieldCheck className="size-3.5 text-[#A36B00]" />Document storage links stay private. Downloads require a verified customer account.</p>
          </div>}
        </section>
      </div>
    </div>
    <DocumentAccessModal open={Boolean(pending)} documentName={pending?.document.label || ""} onClose={() => setPending(null)} onVerified={() => pending ? download(pending.phaseId, pending.document) : Promise.resolve()} />
  </>;
}
