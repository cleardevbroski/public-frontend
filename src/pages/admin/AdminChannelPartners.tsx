import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Building2, CheckCircle2, ChevronLeft, ChevronRight, Eye, FileText, Loader2, LockKeyhole, RefreshCw, Search, ShieldCheck, UserRound, XCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { addChannelPartnerNote, fetchAdminChannelPartnerClients, fetchChannelPartner, fetchChannelPartners, updateChannelPartnerStatus } from "@/lib/api";
import type { ChannelPartnerApplication, ChannelPartnerStatus, ChannelPartnerType, PartnerDocument } from "@/lib/channelPartnerTypes";

type ListPartner = { id: string; applicationNumber: string; partnerType: ChannelPartnerType; companyName: string; businessType: string; panMasked: string; reraNumber: string; contactName: string; mobile: string; email: string; city: string; state: string; accountLast4: string; status: ChannelPartnerStatus; submittedAt: string };
const statusLabels: Record<ChannelPartnerStatus, string> = { active: "Active", submitted: "Submitted", under_review: "Under Review", changes_requested: "Changes Requested", resubmitted: "Resubmitted", approved: "Approved", rejected: "Rejected", suspended: "Suspended" };
const filters: Array<"all" | ChannelPartnerStatus> = ["all", "active", "submitted", "under_review", "changes_requested", "approved", "rejected", "suspended"];

const nextActions: Partial<Record<ChannelPartnerStatus, Array<{ status: ChannelPartnerStatus; label: string; tone: string }>>> = {
  active: [{ status: "suspended", label: "Suspend", tone: "bg-red-50 text-red-700" }],
  submitted: [{ status: "under_review", label: "Start Review", tone: "bg-[#121B35] text-white" }, { status: "rejected", label: "Reject", tone: "bg-red-50 text-red-700" }],
  under_review: [{ status: "changes_requested", label: "Request Changes", tone: "bg-amber-50 text-amber-800" }, { status: "approved", label: "Approve", tone: "bg-emerald-600 text-white" }, { status: "rejected", label: "Reject", tone: "bg-red-50 text-red-700" }],
  resubmitted: [{ status: "under_review", label: "Review Again", tone: "bg-[#121B35] text-white" }, { status: "rejected", label: "Reject", tone: "bg-red-50 text-red-700" }],
  approved: [{ status: "suspended", label: "Suspend", tone: "bg-red-50 text-red-700" }],
  suspended: [{ status: "active", label: "Restore Access", tone: "bg-emerald-600 text-white" }, { status: "rejected", label: "Reject", tone: "bg-red-50 text-red-700" }],
  rejected: [{ status: "under_review", label: "Reopen Review", tone: "bg-[#121B35] text-white" }],
};

export default function AdminChannelPartners() {
  const [partners, setPartners] = useState<ListPartner[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState<ChannelPartnerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { const data = await fetchChannelPartners({ page, limit: 20, status: filter, search: search.trim() }); setPartners(data.partners || []); setCounts(data.counts || {}); setPages(data.pagination?.pages || 1); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load channel partners"); }
    finally { setLoading(false); }
  };
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 250); return () => window.clearTimeout(timer); }, [filter, page, search]);

  const open = async (id: string) => {
    setDetailLoading(true); setError("");
    try { setSelected((await fetchChannelPartner(id)).partner); setReason(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to open application"); }
    finally { setDetailLoading(false); }
  };
  const act = async (status: ChannelPartnerStatus) => {
    if (!selected?.id) return;
    if (["changes_requested", "rejected", "suspended"].includes(status) && !reason.trim()) { setError("Enter a reason before taking this action."); return; }
    setBusy(true); setError("");
    try { await updateChannelPartnerStatus(selected.id, status, reason.trim()); setSelected((await fetchChannelPartner(selected.id)).partner); setReason(""); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update application"); }
    finally { setBusy(false); }
  };
  const addNote = async () => {
    if (!selected?.id || !reason.trim()) { setError("Enter an internal note first."); return; }
    setBusy(true); setError("");
    try { await addChannelPartnerNote(selected.id, reason.trim()); setSelected((await fetchChannelPartner(selected.id)).partner); setReason(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to add note"); }
    finally { setBusy(false); }
  };
  const total = useMemo(() => Object.values(counts).reduce((sum, count) => sum + count, 0), [counts]);

  return <AdminLayout>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6"><div><h1 className="text-[26px] font-bold text-[#121B35]">Channel Partners</h1><p className="text-[13px] text-[#68646F]">Manage active partners, documents, registered clients, expiry history, and access status.</p></div><button onClick={() => void load()} className="h-10 px-4 rounded-xl bg-white border border-[#E4E0E7] text-[13px] font-bold inline-flex items-center gap-2"><RefreshCw className="size-4" /> Refresh</button></div>
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2 mb-5">{filters.map((item) => <button key={item} onClick={() => { setFilter(item); setPage(1); }} className={`rounded-xl border p-3 text-left ${filter === item ? "border-[#DDAA42] bg-[#FFF8E8]" : "border-[#E4E0E7] bg-white"}`}><span className="block text-[10px] uppercase font-bold text-[#68646F]">{item === "all" ? "All" : statusLabels[item]}</span><strong className="text-xl text-[#121B35]">{item === "all" ? total : counts[item] || 0}</strong></button>)}</div>
    <div className="relative max-w-xl mb-5"><Search className="absolute left-3.5 top-3 size-4 text-[#8A8690]" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full h-10 rounded-xl border border-[#E4E0E7] bg-white pl-10 pr-4 text-[13px] outline-none focus:border-[#DDAA42]" placeholder="Search application, company or partner, contact, email, mobile or RERA..." /></div>
    {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-[13px] text-red-700 flex gap-2"><AlertCircle className="size-4 mt-0.5" />{error}</div>}
    <div className="grid xl:grid-cols-[minmax(0,1fr)_470px] gap-5 items-start">
      <div className="bg-white rounded-2xl border border-[#E4E0E7] overflow-hidden">
        {loading ? <div className="p-14 flex justify-center"><Loader2 className="size-7 animate-spin text-[#DDAA42]" /></div> : partners.length === 0 ? <div className="p-14 text-center"><Building2 className="size-9 text-[#D8D4DC] mx-auto" /><p className="text-[13px] text-[#68646F] mt-3">No applications match this view.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr className="bg-[#F8F7FA] text-[10.5px] uppercase tracking-wide text-[#68646F]"><th className="p-4">Application</th><th className="p-4">Partner / Contact</th><th className="p-4">Location</th><th className="p-4">Submitted</th><th className="p-4">Status</th><th className="p-4"></th></tr></thead><tbody className="divide-y divide-[#F3F1F5]">{partners.map((partner) => <tr key={partner.id} className={selected?.id === partner.id ? "bg-[#FFFDF7]" : "hover:bg-[#FAFAFB]"}><td className="p-4"><strong className="block text-[12px] text-[#121B35]">{partner.applicationNumber}</strong><span className="text-[10.5px] text-[#8A8690]">PAN {partner.panMasked}</span></td><td className="p-4"><strong className="block text-[13px] text-[#121B35]">{partner.companyName}</strong><span className="inline-flex mt-1 rounded-md bg-[#F1F4FA] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#596277]">{partner.partnerType === "individual" ? "Individual" : "Company / Firm"}</span><span className="block mt-1 text-[11px] text-[#68646F]">{partner.contactName} · {partner.mobile}</span></td><td className="p-4 text-[12px] text-[#3F3D46]">{partner.city}, {partner.state}</td><td className="p-4 text-[12px] text-[#3F3D46]">{new Date(partner.submittedAt).toLocaleDateString()}</td><td className="p-4"><StatusBadge status={partner.status} /></td><td className="p-4"><button onClick={() => void open(partner.id)} className="size-8 rounded-lg border border-[#E4E0E7] inline-flex items-center justify-center" title="Review application"><Eye className="size-4" /></button></td></tr>)}</tbody></table></div>}
        <div className="h-14 px-4 border-t border-[#E4E0E7] flex items-center justify-between"><span className="text-[11px] text-[#68646F]">Page {page} of {pages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((v) => v - 1)} className="size-8 rounded-lg border border-[#E4E0E7] inline-flex items-center justify-center disabled:opacity-40"><ChevronLeft className="size-4" /></button><button disabled={page >= pages} onClick={() => setPage((v) => v + 1)} className="size-8 rounded-lg border border-[#E4E0E7] inline-flex items-center justify-center disabled:opacity-40"><ChevronRight className="size-4" /></button></div></div>
      </div>
      <aside className="bg-white rounded-2xl border border-[#E4E0E7] p-5 xl:sticky xl:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">{detailLoading ? <div className="p-12 flex justify-center"><Loader2 className="size-7 animate-spin text-[#DDAA42]" /></div> : selected ? <PartnerDetail partner={selected} reason={reason} setReason={setReason} act={act} addNote={addNote} busy={busy} /> : <div className="py-14 text-center"><Eye className="size-9 mx-auto text-[#D8D4DC]" /><p className="text-[13px] text-[#68646F] mt-3">Select an application to review.</p></div>}</aside>
    </div>
  </AdminLayout>;
}

function StatusBadge({ status }: { status: ChannelPartnerStatus }) { const tone = status === "active" || status === "approved" ? "bg-emerald-50 text-emerald-700" : status === "rejected" || status === "suspended" ? "bg-red-50 text-red-700" : status === "changes_requested" ? "bg-amber-50 text-amber-800" : "bg-[#F1F4FA] text-[#273559]"; return <span className={`inline-flex px-2 py-1 rounded-lg text-[10.5px] font-bold ${tone}`}>{statusLabels[status]}</span>; }
function PartnerDetail({ partner, reason, setReason, act, addNote, busy }: { partner: ChannelPartnerApplication; reason: string; setReason: (value: string) => void; act: (status: ChannelPartnerStatus) => void; addNote: () => void; busy: boolean }) {
  const [showBank, setShowBank] = useState(false);
  const partnerType = partner.partnerType || "company";
  const documents = Object.entries(partner.documents || {}).filter((entry): entry is [string, PartnerDocument] => Boolean(entry[1]));
  const businessValues: Array<[string, string]> = [["Areas",partner.business.areasOfOperation.join(", ")],...(partnerType === "company" && partner.business.teamStrength ? [["Team",partner.business.teamStrength.replace(/_/g,"–").replace("plus","+")] as [string,string]] : []),["Segments",partner.business.preferredSegments.join(", ")],["Current projects",partner.business.currentProjects || "Not supplied"],["Associations",partner.business.developerAssociations || "Not supplied"]];
  return <div><div className="flex items-start justify-between gap-3"><div><p className="text-[10.5px] uppercase font-bold tracking-wide text-[#DDAA42]">{partner.applicationNumber}</p><h2 className="text-lg font-bold text-[#121B35] mt-1">{partner.company.name}</h2><span className="inline-flex mt-1 rounded-md bg-[#F1F4FA] px-1.5 py-0.5 text-[9px] font-bold uppercase text-[#596277]">{partnerType === "individual" ? "Individual Partner" : "Company / Firm"}</span>{partner.partnerCode && <p className="mt-2 font-mono text-sm font-extrabold tracking-wider text-[#121B35]">{partner.partnerCode}</p>}</div>{partner.status && <StatusBadge status={partner.status} />}</div>
    <Section title={partnerType === "individual" ? "Individual Partner" : "Company"}><Details values={[["Type",partner.company.businessType.replace(/_/g," ")],["Established",partner.company.yearEstablished ? String(partner.company.yearEstablished) : "Not supplied"],["PAN",partner.company.panNumber],["GST",partner.company.gstNumber || "Not supplied"],["RERA",partner.company.reraNumber || "Not applicable"]]} /></Section>
    <Section title="Contact"><div className="rounded-xl bg-[#F7F9FF] p-3 flex gap-2"><UserRound className="size-4 text-[#273559] mt-0.5" /><div><strong className="block text-[13px] text-[#121B35]">{partner.contact.name} · {partner.contact.designation}</strong><p className="text-[11.5px] text-[#68646F]">{partner.contact.mobile}{partner.contact.alternateMobile ? ` / ${partner.contact.alternateMobile}` : ""}<br />{partner.contact.email}<br />{partner.address.line1}, {partner.address.city}, {partner.address.state} {partner.address.pinCode}</p></div></div></Section>
    <Section title="Business Profile"><Details values={businessValues} /></Section>
    <Section title="Bank Details"><button onClick={() => setShowBank((value) => !value)} className="w-full h-10 rounded-xl border border-[#E4E0E7] text-[12px] font-bold inline-flex items-center justify-center gap-2"><LockKeyhole className="size-4" />{showBank ? "Hide sensitive details" : `Reveal account ending ${partner.bank.accountNumberLast4 || "••••"}`}</button>{showBank && <div className="mt-3"><Details values={[["Holder",partner.bank.accountHolderName],["Bank",partner.bank.bankName],["Branch",partner.bank.branch],["Account",partner.bank.accountNumber || "Unavailable"],["IFSC",partner.bank.ifscCode]]} /></div>}</Section>
    <Section title="Documents"><div className="grid grid-cols-2 gap-2">{documents.map(([key,doc]) => <a key={key} href={doc.url} target="_blank" rel="noreferrer" className="rounded-xl border border-[#E4E0E7] p-3 text-[11px] font-bold text-[#121B35] flex gap-2 items-center"><FileText className="size-4 text-[#DDAA42]" /><span className="truncate capitalize">{key.replace(/([A-Z])/g," $1")}</span></a>)}</div></Section>
    <Section title="Declaration"><p className="text-[11.5px] text-[#3F3D46]">Accepted policy version <strong>{partner.declaration.policyVersion}</strong> on {partner.declaration.acceptedAt ? new Date(partner.declaration.acceptedAt).toLocaleString() : "submission"}. Signed by <strong>{partner.signatory.name}</strong>, {partner.signatory.designation}.</p></Section>
    {partner.id && <PartnerClients partnerId={partner.id} />}
    {!!partner.reviewHistory?.length && <Section title="Review History"><div className="space-y-2">{partner.reviewHistory.map((entry,index) => <div key={entry._id || index} className="border-l-2 border-[#DDAA42] pl-3 py-1"><p className="text-[11.5px] font-bold text-[#121B35]">{entry.fromStatus ? `${entry.fromStatus.replace(/_/g," ")} → ` : ""}{entry.toStatus.replace(/_/g," ")}</p>{entry.note && <p className="text-[11px] text-[#68646F]">{entry.note}</p>}<time className="text-[9.5px] text-[#9A96A0]">{new Date(entry.createdAt).toLocaleString()}</time></div>)}</div></Section>}
    {!!partner.internalNotes?.length && <Section title="Internal Notes"><div className="space-y-2">{partner.internalNotes.map((entry,index)=><div key={entry._id || index} className="rounded-lg bg-[#F8F7FA] p-2 text-[11.5px] text-[#3F3D46]">{entry.note}<time className="block text-[9.5px] text-[#9A96A0] mt-1">{new Date(entry.createdAt).toLocaleString()}</time></div>)}</div></Section>}
    <div className="mt-5"><label className="text-[11px] uppercase font-bold text-[#68646F]">Review reason or internal note</label><textarea value={reason} onChange={(e)=>setReason(e.target.value)} className="mt-1 w-full h-24 rounded-xl border border-[#E4E0E7] p-3 text-[12px] outline-none focus:border-[#DDAA42] resize-none" placeholder="Required for changes, rejection, or suspension..." /><button disabled={busy || !reason.trim()} onClick={addNote} className="mt-2 h-9 px-3 rounded-lg border border-[#E4E0E7] text-[11px] font-bold disabled:opacity-40">Save as internal note</button></div>
    <div className="grid grid-cols-2 gap-2 mt-4">{(partner.status ? nextActions[partner.status] || [] : []).map((action) => <button key={action.status} disabled={busy} onClick={() => act(action.status)} className={`min-h-10 px-3 rounded-xl text-[11px] font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50 ${action.tone}`}>{action.status === "approved" ? <CheckCircle2 className="size-3.5" /> : action.status === "rejected" || action.status === "suspended" ? <XCircle className="size-3.5" /> : <ShieldCheck className="size-3.5" />}{action.label}</button>)}</div>
  </div>;
}
function PartnerClients({ partnerId }: { partnerId: string }) {
  const [data, setData] = useState<{ active: Array<Record<string,string>>; history: Array<Record<string,string>> }>({ active: [], history: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => { let current = true; setLoading(true); fetchAdminChannelPartnerClients(partnerId).then((result) => { if (current) setData({ active: result.active || [], history: result.history || [] }); }).catch(() => { if (current) setData({ active: [], history: [] }); }).finally(() => { if (current) setLoading(false); }); return () => { current = false; }; }, [partnerId]);
  return <Section title={`Registered Clients (${data.active.length})`}>{loading ? <Loader2 className="size-5 animate-spin text-[#DDAA42]" /> : data.active.length === 0 ? <p className="text-[11.5px] text-[#68646F]">No active clients.</p> : <div className="space-y-2">{data.active.map((client) => <div key={client.id} className="rounded-xl border border-[#E4E0E7] p-3"><p className="text-[12px] font-bold text-[#121B35]">{client.clientName} · {client.mobileMasked}</p><p className="text-[10.5px] text-[#68646F]">{client.leadNumber} · {client.projectTitle}</p><p className="mt-1 text-[10px] text-[#8A681F]">Active until {new Date(client.ownershipExpiresAt).toLocaleDateString()}</p></div>)}</div>}{!loading && data.history.length > 0 && <details className="mt-3"><summary className="cursor-pointer text-[11px] font-bold text-[#68646F]">Expired/history ({data.history.length})</summary><div className="mt-2 space-y-2">{data.history.map((client) => <div key={client.id} className="rounded-lg bg-[#F8F7FA] p-2 text-[10.5px] text-[#68646F]">{client.clientName} · {client.leadNumber} · {client.status}</div>)}</div></details>}</Section>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-5 pt-4 border-t border-[#F0EDF2]"><h3 className="text-[11px] uppercase tracking-wide font-bold text-[#68646F] mb-2">{title}</h3>{children}</section>; }
function Details({ values }: { values: Array<[string,string]> }) { return <dl className="grid grid-cols-2 gap-2">{values.map(([label,value]) => <div key={label} className="rounded-lg bg-[#FAFAFB] p-2"><dt className="text-[9.5px] uppercase font-bold text-[#8A8690]">{label}</dt><dd className="text-[11.5px] text-[#121B35] break-words capitalize">{value}</dd></div>)}</dl>; }
