import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Mail, Search, UsersRound } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchAdminCPClients, resendCPClientConfirmationEmail } from "@/lib/api";

type CPClient = {
  id: string; leadNumber: string; clientName: string; mobile: string; email: string; projectTitle: string; budget: string; status: "registered" | "expired" | "cancelled" | "converted"; registeredAt: string; ownershipExpiresAt: string;
  channelPartner?: { name?: string; contactName?: string; mobile?: string; email?: string; applicationNumber?: string; codeLast4?: string };
};
const statuses = ["all", "registered", "expired", "cancelled", "converted"] as const;
type Status = (typeof statuses)[number];

export default function AdminCPClients() {
  const [clients, setClients] = useState<CPClient[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<Status>("all");
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
  const label = useMemo(() => ({ all: "All clients", registered: "Active", expired: "Expired", cancelled: "Cancelled", converted: "Converted" }), []);
  const resendEmail = async (client: CPClient) => {
    setEmailingId(client.id); setError(""); setNotice("");
    try { const result = await resendCPClientConfirmationEmail(client.id); setNotice(result.message || "Client confirmation email sent."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to resend client confirmation email."); }
    finally { setEmailingId(""); }
  };

  return <AdminLayout><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-[28px] font-bold text-[#121B35]">CP Clients</h1><p className="mt-1 text-sm text-[#68646F]">Every client registered by a Channel Partner, including their selected project and ownership status.</p></div><div className="rounded-xl bg-[#FFF8E8] px-4 py-2 text-sm font-bold text-[#574619]">{total} client{total === 1 ? "" : "s"}</div></div>
    <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-5">{statuses.map((item) => <button key={item} onClick={() => { setStatus(item); setPage(1); }} className={`rounded-xl border p-3 text-left ${status === item ? "border-[#DDAA42] bg-[#FFF8E8]" : "border-[#E4E0E7] bg-white"}`}><span className="block text-[10px] font-bold uppercase text-[#68646F]">{label[item]}</span><strong className="text-xl text-[#121B35]">{item === "all" ? Object.values(counts).reduce((sum, value) => sum + value, 0) : counts[item] || 0}</strong></button>)}</div>
    <div className="relative mb-5 max-w-2xl"><Search className="absolute left-3.5 top-3 size-4 text-[#8A8690]" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search client, lead number, project, or Channel Partner..." className="h-10 w-full rounded-xl border border-[#E4E0E7] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#DDAA42]" /></div>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
    <div className="overflow-hidden rounded-2xl border border-[#E4E0E7] bg-white"><div className="overflow-x-auto"><table className="min-w-[1160px] w-full text-left"><thead className="border-b border-[#E4E0E7] bg-[#F8F7FA] text-[10px] font-bold uppercase tracking-wide text-[#68646F]"><tr><th className="px-5 py-4">Client</th><th className="px-5 py-4">Channel Partner</th><th className="px-5 py-4">Interested Project</th><th className="px-5 py-4">Registered / Expires</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Email</th></tr></thead><tbody className="divide-y divide-[#F0EDF2]">{loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#68646F]">Loading CP clients…</td></tr> : clients.length === 0 ? <tr><td colSpan={6} className="px-5 py-14 text-center"><UsersRound className="mx-auto size-9 text-[#D8D4DC]" /><p className="mt-3 text-sm text-[#68646F]">No CP clients found.</p></td></tr> : clients.map((client) => <ClientRow key={client.id || client.leadNumber} client={client} emailing={emailingId === client.id} resendEmail={resendEmail} />)}</tbody></table></div><div className="flex h-14 items-center justify-between border-t border-[#E4E0E7] px-5"><span className="text-xs text-[#68646F]">Page {page} of {pages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="inline-flex size-8 items-center justify-center rounded-lg border border-[#E4E0E7] disabled:opacity-40"><ChevronLeft className="size-4" /></button><button disabled={page >= pages} onClick={() => setPage((value) => value + 1)} className="inline-flex size-8 items-center justify-center rounded-lg border border-[#E4E0E7] disabled:opacity-40"><ChevronRight className="size-4" /></button></div></div></div>
  </AdminLayout>;
}

function displayDate(value?: string) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : "Unavailable";
}

function ClientRow({ client, emailing, resendEmail }: { client: CPClient; emailing: boolean; resendEmail: (client: CPClient) => void }) {
  const partner = client.channelPartner || {};
  return <tr className="align-top hover:bg-[#FCFCFD]"><td className="px-5 py-4"><p className="font-bold text-[#121B35]">{client.clientName || "Unnamed client"}</p><p className="mt-1 text-xs text-[#68646F]">{client.mobile || "Mobile unavailable"}{client.email ? ` · ${client.email}` : ""}</p><p className="mt-1 font-mono text-[10px] text-[#8A8690]">{client.leadNumber || "No lead reference"}</p></td><td className="px-5 py-4"><p className="font-bold text-[#121B35]">{partner.name || "Channel Partner unavailable"}</p><p className="mt-1 text-xs text-[#68646F]">{[partner.contactName, partner.mobile].filter(Boolean).join(" · ") || "Contact unavailable"}</p><p className="mt-1 text-[10px] text-[#8A8690]">{partner.applicationNumber || "Application unavailable"}{partner.codeLast4 ? ` · code ••••${partner.codeLast4}` : ""}</p></td><td className="px-5 py-4"><p className="font-semibold text-[#121B35]">{client.projectTitle || "Project unavailable"}</p>{client.budget && <p className="mt-1 text-xs text-[#68646F]">Budget: {client.budget}</p>}</td><td className="px-5 py-4 text-xs text-[#3F3D46]"><p className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-[#DDAA42]" />{displayDate(client.registeredAt)}</p><p className="mt-1 text-[#68646F]">Expires: {displayDate(client.ownershipExpiresAt)}</p></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${client.status === "registered" ? "bg-emerald-50 text-emerald-700" : client.status === "expired" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-800"}`}>{client.status || "unknown"}</span></td><td className="px-5 py-4"><button disabled={emailing || client.status !== "registered" || !client.id} onClick={() => resendEmail(client)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E0E7] px-3 py-2 text-[11px] font-bold text-[#121B35] disabled:opacity-40">{emailing ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}Resend</button></td></tr>;
}
