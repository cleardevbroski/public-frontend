import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { fetchPropertyIngestionReview, reviewPropertyIngestionCandidate } from "@/lib/api";

type ReviewData = {
  ingestion: {
    completeness?: number;
    sources?: Array<{ sourceKey: string; sourceUrl?: string; sourceType?: string; authorityTier?: number; matchScore?: number; matchEvidence?: string[]; retrievedAt?: string }>;
    warnings?: Array<{ code: string; field?: string; message: string; severity?: string }>;
    candidates?: Array<{ candidateId: string; field: string; value: unknown; sourceKey: string; confidence?: number; reason?: string; status: "pending" | "accepted" | "rejected" }>;
    mediaChecks?: Array<{ code?: string; accepted?: boolean; uploaded?: boolean; watermarkStatus?: string; authorization?: { authorized?: boolean; permissionReference?: string }; candidate?: { url?: string; mediaType?: string } }>;
    contentGeneration?: { status?: string; promptVersion?: string; supportingSourceKeys?: string[] };
  };
  publicationBlockers: Array<{ code: string; field?: string; candidateId?: string; message: string }>;
};

export default function IngestionReviewPanel({ propertyId, onChanged }: { propertyId: string; onChanged?: () => void }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = () => fetchPropertyIngestionReview(propertyId).then(setData).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load ingestion review"));
  useEffect(() => { load(); }, [propertyId]);

  const decide = async (candidateId: string, decision: "accepted" | "rejected") => {
    const reason = window.prompt(`Reason for ${decision === "accepted" ? "accepting" : "rejecting"} this candidate:`)?.trim();
    if (!reason) return;
    setBusy(candidateId);
    setError("");
    try {
      await reviewPropertyIngestionCandidate(propertyId, candidateId, decision, reason);
      await load();
      onChanged?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to review candidate");
    } finally {
      setBusy("");
    }
  };

  if (error && !data) return <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  if (!data) return <div className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600"><Loader2 className="size-4 animate-spin" /> Loading ingestion review…</div>;
  const pending = (data.ingestion.candidates || []).filter((candidate) => candidate.status === "pending");

  return (
    <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5" aria-label="Ingestion review">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="flex items-center gap-2 text-lg font-bold text-[#121B35]"><ShieldCheck className="size-5 text-[#B98428]" /> Verified ingestion review</h2><p className="mt-1 text-sm text-slate-600">Completeness: {data.ingestion.completeness ?? 0}% · {data.publicationBlockers.length} publication blocker(s)</p></div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${data.publicationBlockers.length ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{data.publicationBlockers.length ? "Not ready to publish" : "Safety checks clear"}</span>
      </div>
      {error && <div className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div>}
      {data.publicationBlockers.length > 0 && <div className="mt-4 space-y-2">{data.publicationBlockers.map((item, index) => <div key={`${item.code}-${item.field}-${index}`} className="flex gap-2 text-sm text-red-800"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><span><b>{item.field || item.code}:</b> {item.message}</span></div>)}</div>}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div><h3 className="text-sm font-bold text-[#121B35]">Sources and match evidence</h3><div className="mt-2 space-y-2">{(data.ingestion.sources || []).map((source) => <div key={source.sourceKey} className="rounded-lg border border-amber-100 bg-white p-3 text-xs"><div className="flex justify-between gap-2"><span className="font-semibold">{source.sourceKey}</span><span>Tier {source.authorityTier ?? "–"} · {source.matchScore ?? 0}%</span></div><div className="mt-1 text-slate-500">{source.sourceType} · {(source.matchEvidence || []).join(", ") || "No match evidence"}</div>{source.sourceUrl && <a className="mt-2 inline-flex items-center gap-1 text-blue-700 underline" href={source.sourceUrl} target="_blank" rel="noreferrer">Open source <ExternalLink className="size-3" /></a>}</div>)}</div></div>
        <div><h3 className="text-sm font-bold text-[#121B35]">Warnings</h3><div className="mt-2 space-y-2">{(data.ingestion.warnings || []).length ? data.ingestion.warnings?.map((warning, index) => <div key={`${warning.code}-${warning.field}-${index}`} className="rounded-lg border border-amber-100 bg-white p-3 text-xs"><b>{warning.code}</b>{warning.field ? ` · ${warning.field}` : ""}<div className="mt-1 text-slate-600">{warning.message}</div></div>) : <p className="text-sm text-slate-500">No ingestion warnings.</p>}</div></div>
      </div>
      <div className="mt-5"><h3 className="text-sm font-bold text-[#121B35]">Candidates ({pending.length} pending)</h3><div className="mt-2 space-y-3">{pending.length ? pending.map((candidate) => <div key={candidate.candidateId} className="rounded-xl border border-amber-200 bg-white p-4"><div className="flex flex-wrap justify-between gap-2"><div><p className="text-sm font-semibold text-[#121B35]">{candidate.field} · {candidate.confidence ?? 0}%</p><p className="mt-1 text-xs text-slate-500">{candidate.sourceKey} · {candidate.reason}</p></div><div className="flex gap-2"><button type="button" disabled={busy === candidate.candidateId} onClick={() => decide(candidate.candidateId, "accepted")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><CheckCircle2 className="size-3.5" /> Accept</button><button type="button" disabled={busy === candidate.candidateId} onClick={() => decide(candidate.candidateId, "rejected")} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><XCircle className="size-3.5" /> Reject</button></div></div><pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(candidate.value, null, 2)}</pre></div>) : <p className="text-sm text-slate-500">No unresolved candidates.</p>}</div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-amber-100 bg-white p-3 text-xs"><b>Media authorization</b><p className="mt-1 text-slate-600">{(data.ingestion.mediaChecks || []).length ? `${data.ingestion.mediaChecks?.filter((check) => check.accepted).length} accepted of ${data.ingestion.mediaChecks?.length}; watermark and permission results are retained per asset.` : "No media validation has run."}</p></div><div className="rounded-lg border border-amber-100 bg-white p-3 text-xs"><b>Generated content</b><p className="mt-1 text-slate-600">{data.ingestion.contentGeneration?.status || "Not requested"}{data.ingestion.contentGeneration?.promptVersion ? ` · ${data.ingestion.contentGeneration.promptVersion}` : ""}</p></div></div>
    </section>
  );
}
