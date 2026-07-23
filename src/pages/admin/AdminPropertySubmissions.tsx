import { useEffect, useState } from "react";
import { AlertTriangle, Building2, CheckCircle2, Clock3, Eye, Loader2, RefreshCw, Send, Trash2, UserRound, XCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { deleteProperty, fetchPublicSubmission, fetchPublicSubmissions, reviewPublicSubmission } from "@/lib/api";
import { refreshProperties } from "@/lib/propertyStore";
import type { Property } from "@/components/acres/mock-data";

const filters = ["all", "submitted", "under_review", "changes_requested", "resubmitted", "published", "rejected"] as const;
const labels: Record<string, string> = { all: "All", submitted: "Submitted", pending: "Submitted", under_review: "Under Review", changes_requested: "Changes Requested", resubmitted: "Resubmitted", published: "Published", approved: "Published", rejected: "Rejected" };

export default function AdminPropertySubmissions() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try { setProperties((await fetchPublicSubmissions(filter)).properties); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load submissions"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]);

  const open = async (id: string) => {
    setBusy(true); setError("");
    try { setSelected((await fetchPublicSubmission(id)).property); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to open submission"); }
    finally { setBusy(false); }
  };

  const act = async (action: "start_review" | "request_changes" | "publish" | "reject") => {
    if (["request_changes", "reject"].includes(action) && !message.trim()) { setError("Enter the correction or rejection reason first."); return; }
    if (!selected) return;
    setBusy(true); setError("");
    try {
      const data = await reviewPublicSubmission(selected.id, action, message.trim());
      setSelected(data.property); setMessage("");
      if (action === "publish") await refreshProperties();
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update submission"); }
    finally { setBusy(false); }
  };

  const removeSelected = async () => {
    if (!selected) return;
    if (!window.confirm(`Permanently delete “${selected.title}”? This cannot be undone.`)) return;
    setBusy(true); setError("");
    try {
      await deleteProperty(selected.id);
      await refreshProperties();
      setSelected(null);
      setMessage("");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete submission"); }
    finally { setBusy(false); }
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div><h1 className="text-[26px] font-bold text-[#121B35]">Public Property Submissions</h1><p className="text-[13px] text-[#68646F]">Review customer details, request corrections, and publish verified listings.</p></div>
        <button onClick={load} className="h-10 px-4 rounded-xl bg-white border border-[#E4E0E7] text-[13px] font-bold text-[#121B35] inline-flex items-center gap-2"><RefreshCw className="size-4" /> Refresh</button>
      </div>
      <div className="flex gap-2 flex-wrap mb-5">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`px-3 py-2 rounded-xl text-[12px] font-bold border ${filter === item ? "bg-[#DDAA42] border-[#DDAA42] text-[#0B1328]" : "bg-white border-[#E4E0E7] text-[#68646F]"}`}>{labels[item]}</button>)}</div>
      {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-[13px] text-red-700">{error}</div>}
      <div className="grid xl:grid-cols-[minmax(0,1fr)_440px] gap-5 items-start">
        <div className="bg-white rounded-2xl border border-[#E4E0E7] overflow-hidden">
          {loading ? <div className="p-12 flex justify-center"><Loader2 className="size-7 animate-spin text-[#DDAA42]" /></div> : !properties.length ? <div className="p-12 text-center text-[#68646F]">No submissions in this status.</div> : properties.map((property) => (
            <button key={property.id} onClick={() => open(property.id)} className={`w-full text-left p-4 border-b border-[#F3F1F5] hover:bg-[#F7F9FF] grid md:grid-cols-[1fr_180px_130px] gap-3 items-center ${selected?.id === property.id ? "bg-[#F8F7FA]" : ""}`}>
              <div className="flex gap-3 min-w-0"><span className="size-10 rounded-xl bg-[#F8F7FA] flex items-center justify-center shrink-0"><Building2 className="size-4 text-[#121B35]" /></span><span className="min-w-0"><strong className="block text-[14px] text-[#121B35] truncate">{property.title}</strong><small className="text-[#68646F]">{property.propertyType} · {property.subtitle}</small></span></div>
              <div className="text-[12px] text-[#3F3D46]"><strong className="block">{property.postedBy?.name || "Customer"}</strong><span>{property.postedBy?.phone || "—"}</span></div>
              <span className="text-[11px] font-bold text-[#9A7620] bg-[#FFF8E8] px-2.5 py-1.5 rounded-lg justify-self-start">{labels[property.status || "submitted"] || property.status}</span>
            </button>
          ))}
        </div>
        <aside className="bg-white rounded-2xl border border-[#E4E0E7] p-5 xl:sticky xl:top-24">
          {busy && !selected ? <div className="p-10 flex justify-center"><Loader2 className="size-7 animate-spin text-[#DDAA42]" /></div> : !selected ? <div className="text-center py-10"><Eye className="size-9 text-[#CBD6EE] mx-auto" /><p className="mt-3 text-[13px] text-[#68646F]">Select a submission to review.</p></div> : <SubmissionReview property={selected} message={message} setMessage={setMessage} act={act} onDelete={removeSelected} busy={busy} />}
        </aside>
      </div>
    </AdminLayout>
  );
}

function SubmissionReview({ property, message, setMessage, act, onDelete, busy }: { property: Property; message: string; setMessage: (value: string) => void; act: (action: "start_review" | "request_changes" | "publish" | "reject") => void; onDelete: () => void; busy: boolean }) {
  const customer = property.postedBy;
  return <div>
    <div className="flex items-center justify-between"><h2 className="font-bold text-[#121B35]">Submission Details</h2><span className="text-[11px] font-bold bg-[#F8F7FA] text-[#121B35] px-2 py-1 rounded-lg">v{property.submissionVersion || 1}</span></div>
    <div className="mt-4 rounded-xl bg-[#F7F9FF] p-4"><p className="text-[11px] uppercase font-bold text-[#68646F] flex items-center gap-1"><UserRound className="size-3.5" /> Customer</p><p className="font-bold text-[#121B35] mt-1">{customer?.name || "—"}</p><p className="text-[12.5px] text-[#3F3D46]">{customer?.phone || "—"} · {customer?.email || "—"}</p></div>
    <dl className="mt-4 grid grid-cols-2 gap-3 text-[12.5px]"><Detail label="Property" value={property.title} /><Detail label="Type" value={property.propertyType} /><Detail label="Location" value={property.subtitle} /><Detail label="Price" value={property.price} /><Detail label="Configurations" value={property.configs?.join(", ")} /><Detail label="Status" value={labels[property.status || "submitted"] || property.status} /></dl>
    {property.description && <div className="mt-4"><p className="text-[11px] uppercase font-bold text-[#68646F]">Description</p><p className="text-[13px] text-[#3F3D46] mt-1 whitespace-pre-wrap">{property.description}</p></div>}
    <details className="mt-4 rounded-xl border border-[#F3F1F5] p-3"><summary className="cursor-pointer text-[12px] font-bold text-[#121B35]">View all submitted property fields</summary><pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-[#3F3D46]">{JSON.stringify(propertyDetailsForReview(property), null, 2)}</pre></details>
    {!!property.reviewMessages?.length && <div className="mt-4"><p className="text-[11px] uppercase font-bold text-[#68646F]">Review history</p><div className="space-y-2 mt-2">{property.reviewMessages.map((item, index) => <div key={item._id || index} className="rounded-lg border border-[#F3F1F5] px-3 py-2 text-[12px]"><strong className="capitalize text-[#121B35]">{item.senderRole}</strong><p className="text-[#3F3D46] mt-0.5">{item.message}</p></div>)}</div></div>}
    {!(["published", "approved"].includes(property.status || "")) && <><textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-5 w-full h-24 rounded-xl border border-[#E4E0E7] p-3 text-[13px] outline-none focus:border-[#DDAA42] resize-none" placeholder="Explain required corrections or rejection reason..." /><div className="grid grid-cols-2 gap-2 mt-3"><Action disabled={busy} onClick={() => act("start_review")} icon={Clock3} label="Start Review" className="bg-[#F8F7FA] text-[#121B35]" /><Action disabled={busy} onClick={() => act("request_changes")} icon={Send} label="Request Changes" className="bg-amber-50 text-amber-800" /><Action disabled={busy} onClick={() => act("reject")} icon={XCircle} label="Reject" className="bg-red-50 text-red-700" /><Action disabled={busy} onClick={() => act("publish")} icon={CheckCircle2} label="Verify & Publish" className="bg-green-600 text-white" /></div></>}
    <button disabled={busy} onClick={onDelete} className="mt-5 w-full h-10 rounded-xl border border-red-200 bg-red-50 text-[12px] font-bold text-red-700 inline-flex items-center justify-center gap-1.5 hover:bg-red-100 disabled:opacity-50"><Trash2 className="size-3.5" />Delete Submission</button>
  </div>;
}

function Detail({ label, value }: { label: string; value?: string }) { return <div><dt className="text-[10.5px] uppercase font-bold text-[#68646F]">{label}</dt><dd className="font-semibold text-[#3F3D46] mt-0.5 break-words">{value || "—"}</dd></div>; }
function Action({ icon: Icon, label, className, ...props }: { icon: typeof AlertTriangle; label: string; className: string; disabled: boolean; onClick: () => void }) { return <button {...props} className={`h-10 rounded-xl text-[11.5px] font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50 ${className}`}><Icon className="size-3.5" />{label}</button>; }

function propertyDetailsForReview(property: Property) {
  const { id, postedBy, reviewMessages, image, images, brochure, ...details } = property;
  return { ...details, media: { coverImage: image || "Not uploaded", photos: images?.length || 0, brochure: brochure ? "Uploaded" : "Not uploaded" } };
}
