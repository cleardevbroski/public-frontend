"use client";

import { useState } from "react";
import { Download, ExternalLink, FileText, Loader2, Map, Play, Video } from "lucide-react";
import type { ProjectDownload, Property, ReraDocument } from "./mock-data";
import { downloadProjectFile, downloadPropertyDocument } from "@/lib/api";
import { useAuth } from "./AuthContext";
import DocumentAccessModal from "./DocumentAccessModal";
import { canonicalYoutubeUrl, youtubeThumbnail, youtubeVideoId } from "@/lib/youtube";

type HubDocument = ProjectDownload & { phaseId?: string; reraDocument?: ReraDocument };

export default function ProjectDownloadHub({ property, onLegacyDownload }: { property: Property; onLegacyDownload: () => void }) {
  const { user } = useAuth();
  const [pending, setPending] = useState<HubDocument | null>(null);
  const [pendingAll, setPendingAll] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");
  const linkedBrochure = property.reraPhases
    ?.flatMap((phase) => (phase.projectDocuments || []).map((document) => ({ phase, document })))
    .find(({ document }) => document.key === "brochure");
  const projectRows = property.projectDownloads || [];
  const rows: HubDocument[] = [
    ...projectRows.filter((document) => document.kind !== "brochure"),
    ...(linkedBrochure ? [{
      kind: "brochure" as const,
      label: "Project Brochure",
      fileName: linkedBrochure.document.fileName,
      mimeType: "application/pdf" as const,
      phaseId: linkedBrochure.phase._id,
      reraDocument: linkedBrochure.document,
    }] : projectRows.some((document) => document.kind === "brochure")
      ? projectRows.filter((document) => document.kind === "brochure")
      : property.brochure
        ? [{ kind: "brochure" as const, label: "Project Brochure", fileName: property.brochureName || `${property.title}-brochure.pdf`, fileUrl: property.brochure, mimeType: "application/pdf" as const }]
        : []),
  ];
  const youtubeId = youtubeVideoId(property.walkthroughVideoUrl);
  const youtubeUrl = canonicalYoutubeUrl(property.walkthroughVideoUrl);
  const thumbnail = youtubeThumbnail(property.walkthroughVideoUrl);
  if (!rows.length && !youtubeId) return null;
  const download = async (document: HubDocument) => {
    if (document.phaseId && document.reraDocument?._id) {
      setDownloading(document.kind);
      setError("");
      try {
        await downloadPropertyDocument(property.id, document.phaseId, document.reraDocument._id, document.fileName);
        setPending(null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Download failed.");
        throw cause;
      } finally {
        setDownloading("");
      }
      return;
    }
    if (!document._id) return onLegacyDownload();
    setDownloading(document.kind);
    setError("");
    try {
      await downloadProjectFile(property.id, document._id, document.fileName);
      setPending(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Download failed.");
      throw cause;
    } finally {
      setDownloading("");
    }
  };
  const downloadAll = async () => {
    setPendingAll(false);
    setPending(null);
    for (const document of rows) {
      if (document.phaseId && document.reraDocument?._id) await downloadPropertyDocument(property.id, document.phaseId, document.reraDocument._id, document.fileName);
      else if (document._id) await downloadProjectFile(property.id, document._id, document.fileName);
      else onLegacyDownload();
    }
  };
  const request = (document: HubDocument) => {
    setPendingAll(false);
    if (user?.name && user?.email) void download(document).catch(() => {});
    else setPending(document);
  };
  const requestAll = () => {
    if (user?.name && user?.email) void downloadAll().catch((cause) => setError(cause instanceof Error ? cause.message : "Download failed."));
    else {
      setPendingAll(true);
      setPending(rows[0]);
    }
  };
  const icons = { brochure: FileText, "master-plan": Map, walkthrough: Video };
  return <><section className="rounded-2xl border border-[#DDE2EA] bg-white p-5 shadow-sm md:p-7" aria-labelledby="download-hub-heading">
    <h2 id="download-hub-heading" className="text-[22px] font-extrabold text-[#172039]">Downloads Hub for {property.title}</h2>
    <p className="mt-2 text-[13px] leading-6 text-[#596277]">Access the available project documents after signing in or verifying your details.</p>
    <div className="mt-5 grid gap-4 md:grid-cols-3">{rows.map((document) => {
      const Icon = icons[document.kind];
      return <article key={document.kind} className="overflow-hidden rounded-xl border border-[#E5E8EE]"><div className="flex items-center gap-3 bg-[#F6F7F9] p-4"><span className="flex size-10 items-center justify-center rounded-lg bg-white"><Icon className="size-5 text-[#303A50]" /></span><div><h3 className="text-[14px] font-extrabold text-[#172039]">{document.label}</h3><p className="mt-0.5 text-[10px] text-[#667085]">{document.kind === "walkthrough" ? "Virtual tour of the property" : "Verified project document"}</p></div></div><div className="p-3"><button type="button" disabled={downloading === document.kind} onClick={() => request(document)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#D6DAE2] py-2.5 text-[12px] font-bold text-[#303A50] hover:border-[#C89A32] disabled:opacity-50">{downloading === document.kind ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Download</button></div></article>;
    })}{youtubeId && <a href={youtubeUrl} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-xl border border-[#E5E8EE] bg-white">
      <div className="relative aspect-video overflow-hidden bg-[#172039]">
        <img src={thumbnail} alt={`${property.title} walkthrough video thumbnail`} className="size-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />
        <span className="absolute inset-0 grid place-items-center bg-black/20"><span className="grid size-12 place-items-center rounded-full bg-red-600 text-white shadow-lg"><Play className="size-5 fill-current" /></span></span>
      </div>
      <div className="flex items-center justify-between gap-3 p-3"><span><span className="block text-[13px] font-extrabold text-[#172039]">Walkthrough Video</span><span className="mt-0.5 block text-[10px] text-[#667085]">Watch on YouTube</span></span><ExternalLink className="size-4 text-[#303A50]" /></div>
    </a>}</div>
    {rows.length > 1 && <button type="button" onClick={requestAll} className="mx-auto mt-5 flex items-center gap-2 rounded-lg bg-[#172039] px-6 py-3 text-[13px] font-bold text-white"><Download className="size-4" /> Get All Downloads</button>}
    {error && <p className="mt-3 text-[11px] text-red-600">{error}</p>}
  </section><DocumentAccessModal open={Boolean(pending)} documentName={pendingAll ? "all project downloads" : pending?.label || ""} onClose={() => { setPending(null); setPendingAll(false); }} onVerified={() => pendingAll ? downloadAll() : pending ? download(pending) : Promise.resolve()} /></>;
}
