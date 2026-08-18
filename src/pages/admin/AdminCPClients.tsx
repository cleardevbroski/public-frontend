import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Loader2, Mail, Search, UsersRound, XCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchAdminCPClients, resendCPClientConfirmationEmail, updateAdminCPClientStatus } from "@/lib/api";

type Status = "pending" | "approved" | "successful" | "rejected" | "expired";
type CPClient = {
  id: string; leadNumber: string; clientName: string; mobile: string; email: string; projectTitle: string; budget: string; status: Status; registeredAt: string; ownershipExpiresAt: string;
  claimActive: boolean; bookingAdvanceAmountPaise: number; initialCpAmountPaise: number; approvedAt: string | null; initialCreditAt: string | null; initialCreditState: "credited" | "awaiting" | "not_available"; finalSettlementCpAmountPaise: number; successfulAt: string | null;
  statusHistory?: Array<{ _id?: string; fromStatus: string; toStatus: string; reason: string; actorLabel: string; createdAt: string }>;
  channelPartner?: { name?: string; contactName?: string; mobile?: string; email?: string; applicationNumber?: string; codeLast4?: string };
};

const statuses = ["all", "pending", "approved", "successful", "rejected", "expired"] as const;
type FilterStatus = (typeof statuses)[number];
const labels: Record<FilterStatus, string> = { all: "All clients", pending: "Pending", approved: "Approved", successful: "Successful", rejected: "Rejected", expired: "Expired" };
const money = (paise = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

export default function AdminCPClients() {
  const [clients, setClients] = useState<CPClient[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [emailingId, setEmailingId] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const data = await fetchAdminCPClients({ page, limit: 25, status, search: search.trim() });
      setClients(Array.isArray(data.clients) ? data.clients : []); setCounts(data.counts && typeof data.counts === "object" ? data.counts : {}); setPages(data.pagination?.pages || 1); setTotal(data.pagination?.total || 0);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load CP clients."); }
    finally { setLoading(false); }
  };

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 250); return () => window.clearTimeout(timer); }, [page, status, search]);
  const allCount = useMemo(() => Object.values(counts).reduce((sum, value) => sum + value, 0), [counts]);

  const resendEmail = async (client: CPClient) => {
    setEmailingId(client.id); setError(""); setNotice("");
    try { const result = await resendCPClientConfirmationEmail(client.id); setNotice(result.message || "Client confirmation email sent."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to resend client confirmation email."); }
    finally { setEmailingId(""); }
  };

  const updateStatus = async (client: CPClient, payload: Record<string, unknown>) => {
    setError(""); setNotice("");
    const result = await updateAdminCPClientStatus(client.id, payload);
    setNotice(result.message || "Client status updated.");
    await load();
  };

  return <AdminLayout>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-[28px] font-bold text-[#121B35]">CP Clients</h1><p className="mt-1 text-sm text-[#68646F]">Review registrations, control booking status, and track Channel Partner earnings.</p></div><div className="rounded-xl bg-[#FFF8E8] px-4 py-2 text-sm font-bold text-[#574619]">{total} client{total === 1 ? "" : "s"}</div></div>
    <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">{statuses.map((item) => <button key={item} onClick={() => { setStatus(item); setPage(1); }} className={`rounded-xl border p-3 text-left ${status === item ? "border-[#DDAA42] bg-[#FFF8E8]" : "border-[#E4E0E7] bg-white"}`}><span className="block text-[10px] font-bold uppercase text-[#68646F]">{labels[item]}</span><strong className="text-xl text-[#121B35]">{item === "all" ? allCount : counts[item] || 0}</strong></button>)}</div>
    <div className="relative mb-5 max-w-2xl"><Search className="absolute left-3.5 top-3 size-4 text-[#8A8690]" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search client, lead number, project, or Channel Partner" className="h-10 w-full rounded-xl border border-[#E4E0E7] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#DDAA42]" /></div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
    <div className="space-y-3">{loading ? <div className="rounded-2xl border border-[#E4E0E7] bg-white p-12 text-center text-sm text-[#68646F]"><Loader2 className="mx-auto size-6 animate-spin text-[#DDAA42]" /><p className="mt-3">Loading CP clients</p></div> : clients.length === 0 ? <div className="rounded-2xl border border-[#E4E0E7] bg-white p-14 text-center"><UsersRound className="mx-auto size-9 text-[#D8D4DC]" /><p className="mt-3 text-sm text-[#68646F]">No CP clients found.</p></div> : clients.map((client) => <ClientCard key={client.id} client={client} emailing={emailingId === client.id} resendEmail={resendEmail} updateStatus={updateStatus} />)}</div>
    <div className="mt-4 flex h-14 items-center justify-between rounded-xl border border-[#E4E0E7] bg-white px-5"><span className="text-xs text-[#68646F]">Page {page} of {pages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="inline-flex size-8 items-center justify-center rounded-lg border border-[#E4E0E7] disabled:opacity-40"><ChevronLeft className="size-4" /></button><button disabled={page >= pages} onClick={() => setPage((value) => value + 1)} className="inline-flex size-8 items-center justify-center rounded-lg border border-[#E4E0E7] disabled:opacity-40"><ChevronRight className="size-4" /></button></div></div>
  </AdminLayout>;
}

function ClientCard({ client, emailing, resendEmail, updateStatus }: { client: CPClient; emailing: boolean; resendEmail: (client: CPClient) => void; updateStatus: (client: CPClient, payload: Record<string, unknown>) => Promise<void> }) {
  const partner = client.channelPartner || {};
  return <article className="rounded-2xl border border-[#E4E0E7] bg-white p-4 md:p-5">
    <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr_1fr_1fr_auto]">
      <div><p className="font-bold text-[#121B35]">{client.clientName || "Unnamed client"}</p><p className="mt-1 text-xs text-[#68646F]">{client.mobile || "Mobile unavailable"}{client.email ? ` | ${client.email}` : ""}</p><p className="mt-1 font-mono text-[10px] text-[#8A8690]">{client.leadNumber}</p></div>
      <div><p className="text-[10px] font-bold uppercase text-[#8A8690]">Channel Partner</p><p className="mt-1 text-sm font-bold text-[#121B35]">{partner.name || "Unavailable"}</p><p className="mt-1 text-xs text-[#68646F]">{partner.contactName || "Contact unavailable"}</p></div>
      <div><p className="text-[10px] font-bold uppercase text-[#8A8690]">Property</p><p className="mt-1 text-sm font-bold text-[#121B35]">{client.projectTitle || "Unavailable"}</p>{client.budget && <p className="mt-1 text-xs text-[#68646F]">Budget: {client.budget}</p>}</div>
      <div><p className="text-[10px] font-bold uppercase text-[#8A8690]">Earnings</p><p className="mt-1 text-sm font-bold text-[#121B35]">Advance: {client.bookingAdvanceAmountPaise ? money(client.bookingAdvanceAmountPaise) : "Not entered"}</p><p className="mt-1 text-xs text-[#68646F]">20% CP: {client.initialCpAmountPaise ? money(client.initialCpAmountPaise) : "Not calculated"}</p>{client.finalSettlementCpAmountPaise > 0 && <p className="mt-1 text-xs font-bold text-emerald-700">Final: {money(client.finalSettlementCpAmountPaise)}</p>}</div>
      <div className="flex items-start gap-2 xl:justify-end"><StatusBadge status={client.status} /><button disabled={emailing || !client.id || !client.claimActive} onClick={() => resendEmail(client)} title="Resend confirmation email" className="inline-flex size-8 items-center justify-center rounded-lg border border-[#E4E0E7] text-[#121B35] disabled:opacity-40">{emailing ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}</button></div>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#F0EDF2] pt-3 text-xs text-[#68646F]"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-[#DDAA42]" />Registered {displayDate(client.registeredAt)}</span>{client.status === "pending" && <span>Expires {displayDate(client.ownershipExpiresAt)}</span>}{client.initialCreditAt && <span className="inline-flex items-center gap-1.5 text-emerald-700"><Clock3 className="size-3.5" />{client.initialCreditState === "credited" ? "Initial amount credited" : `Credit at ${displayDateTime(client.initialCreditAt)}`}</span>}</div>
    <AdminActions client={client} updateStatus={updateStatus} />
    {!!client.statusHistory?.length && <details className="mt-3"><summary className="cursor-pointer text-xs font-bold text-[#68646F]">Status and financial history ({client.statusHistory.length})</summary><div className="mt-2 grid gap-2 md:grid-cols-2">{client.statusHistory.map((entry, index) => <div key={entry._id || index} className="rounded-xl bg-[#F8F7FA] p-3 text-xs"><p className="font-bold capitalize text-[#121B35]">{entry.fromStatus ? `${entry.fromStatus} to ` : ""}{entry.toStatus}</p>{entry.reason && <p className="mt-1 text-[#68646F]">{entry.reason}</p>}<p className="mt-1 text-[10px] text-[#8A8690]">{entry.actorLabel || "system"} | {displayDateTime(entry.createdAt)}</p></div>)}</div></details>}
  </article>;
}

function AdminActions({ client, updateStatus }: { client: CPClient; updateStatus: (client: CPClient, payload: Record<string, unknown>) => Promise<void> }) {
  const [mode, setMode] = useState<"" | "approve" | "reject" | "successful">("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  if (!(["pending", "approved"] as Status[]).includes(client.status)) return null;

  const submit = async () => {
    setLocalError("");
    const rupees = Number(amount);
    let payload: Record<string, unknown>;
    if (mode === "approve") {
      if (!Number.isFinite(rupees) || rupees <= 0) return setLocalError("Enter the booking advance in rupees.");
      payload = { status: "approved", bookingAdvanceAmountPaise: Math.round(rupees * 100), note: reason.trim() };
    } else if (mode === "successful") {
      if (!Number.isFinite(rupees) || rupees <= 0) return setLocalError("Enter the final CP amount in rupees.");
      payload = { status: "successful", finalSettlementCpAmountPaise: Math.round(rupees * 100), note: reason.trim() };
    } else {
      if (!reason.trim()) return setLocalError("A rejection reason is required.");
      payload = { status: "rejected", reason: reason.trim() };
    }
    setBusy(true);
    try { await updateStatus(client, payload); setMode(""); setAmount(""); setReason(""); }
    catch (cause) { setLocalError(cause instanceof Error ? cause.message : "Unable to update status."); }
    finally { setBusy(false); }
  };

  return <div className="mt-4 rounded-xl border border-[#E8E4D9] bg-[#FFFDF7] p-3">
    <div className="flex flex-wrap gap-2">{client.status === "pending" ? <><button onClick={() => setMode(mode === "approve" ? "" : "approve")} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-bold text-white"><CheckCircle2 className="size-3.5" />Approve</button><button onClick={() => setMode(mode === "reject" ? "" : "reject")} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-700 px-3 text-xs font-bold text-white"><XCircle className="size-3.5" />Reject</button></> : <button onClick={() => setMode(mode === "successful" ? "" : "successful")} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0B1328] px-3 text-xs font-bold text-white"><CheckCircle2 className="size-3.5" />Mark Successful</button>}</div>
    {mode && <div className="mt-3 grid gap-3 md:grid-cols-[220px_minmax(0,1fr)_auto]">{mode !== "reject" && <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-[#68646F]">{mode === "approve" ? "Booking advance (₹)" : "Final CP amount (₹)"}</span><input type="number" min="1" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="h-10 w-full rounded-lg border border-[#D8D4DC] bg-white px-3 text-sm outline-none focus:border-[#DDAA42]" /></label>}<label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-[#68646F]">{mode === "reject" ? "Reason" : "Admin note (optional)"}</span><input value={reason} onChange={(event) => setReason(event.target.value)} className="h-10 w-full rounded-lg border border-[#D8D4DC] bg-white px-3 text-sm outline-none focus:border-[#DDAA42]" /></label><button disabled={busy} onClick={() => void submit()} className="h-10 self-end rounded-lg bg-[#DDAA42] px-4 text-xs font-bold text-[#0B1328] disabled:opacity-50">{busy ? "Saving" : "Confirm"}</button></div>}
    {mode === "approve" && amount && Number(amount) > 0 && <p className="mt-2 text-xs font-semibold text-emerald-700">CP earning: {money(Math.round(Number(amount) * 100 * .2))}. Credit unlocks 12 hours after approval.</p>}
    {localError && <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{localError}</p>}
  </div>;
}

function StatusBadge({ status }: { status: Status }) {
  const tone = status === "successful" ? "bg-emerald-50 text-emerald-700" : status === "approved" ? "bg-blue-50 text-blue-700" : status === "pending" ? "bg-amber-50 text-amber-800" : status === "rejected" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600";
  return <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase ${tone}`}>{labels[status]}</span>;
}

function displayDate(value?: string) { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-IN") : "Unavailable"; }
function displayDateTime(value?: string) { const date = value ? new Date(value) : null; return date && !Number.isNaN(date.getTime()) ? date.toLocaleString("en-IN") : "Unavailable"; }
