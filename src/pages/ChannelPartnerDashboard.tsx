import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
  IndianRupee,
  LayoutDashboard,
  Loader2,
  RefreshCw,
  ShieldAlert,
  UserPlus,
  UsersRound,
  XCircle,
} from "lucide-react";
import {
  fetchChannelPartnerClashes,
  fetchChannelPartnerClientHistory,
  fetchChannelPartnerDashboard,
  hasChannelPartnerSession,
} from "@/lib/api";
import { useDocumentTitle } from "@/useDocumentTitle";

type ClientStatus = "pending" | "approved" | "successful" | "rejected" | "expired";
type Client = {
  id: string;
  leadNumber: string;
  clientName: string;
  mobileMasked: string;
  projectTitle: string;
  budget: string;
  status: ClientStatus;
  registeredAt: string;
  ownershipExpiresAt: string;
  bookingAdvanceAmountPaise: number;
  initialCpAmountPaise: number;
  initialCreditAt: string | null;
  initialCreditState: "credited" | "awaiting" | "not_available";
  finalSettlementCpAmountPaise: number;
  successfulAt: string | null;
};
type Clash = {
  id: string;
  direction: "initiated" | "received";
  clientName: string;
  mobileMasked: string;
  projectTitle: string;
  attemptedAt: string;
};
type DashboardData = {
  partner: { name: string; contactName: string; codeLast4: string };
  counts: Record<"total" | ClientStatus | "clashes", number>;
  earnings: {
    creditedInitialPaise: number;
    awaitingInitialPaise: number;
    finalSettlementCreditedPaise: number;
    totalCreditedPaise: number;
    nearestInitialCreditAt: string | null;
  };
  serverNow: string;
};

const statusLabels: Record<ClientStatus | "all", string> = {
  all: "All clients",
  pending: "Pending",
  approved: "Approved",
  successful: "Successful",
  rejected: "Rejected",
  expired: "Expired",
};

const statusStyles: Record<ClientStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-blue-200 bg-blue-50 text-blue-800",
  successful: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-red-200 bg-red-50 text-red-700",
  expired: "border-slate-200 bg-slate-100 text-slate-600",
};

const formatMoney = (paise = 0) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(paise / 100);

const formatDate = (value?: string | null, withTime = false) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
};

export function countdownLabel(target: string | null, now: number) {
  if (!target) return "No amount awaiting credit";
  const remaining = new Date(target).getTime() - now;
  if (remaining <= 0) return "Amount credited to your account";
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1_000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} until credit`;
}

export default function ChannelPartnerDashboard() {
  useDocumentTitle(
    "CP Dashboard | ClearTitle One",
    "Secure ClearTitle One channel partner dashboard for client registrations, approvals, clashes, and partner activity.",
    { canonical: "/cp-dashboard", robots: "noindex, nofollow, noarchive" },
  );
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clashes, setClashes] = useState<Clash[]>([]);
  const [filter, setFilter] = useState<ClientStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const hasSession = hasChannelPartnerSession();

  const load = useCallback(async () => {
    if (!hasChannelPartnerSession()) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const [dashboardData, clientData, clashData] = await Promise.all([
        fetchChannelPartnerDashboard(),
        fetchChannelPartnerClientHistory({ page: 1, limit: 100 }),
        fetchChannelPartnerClashes({ page: 1, limit: 20 }),
      ]);
      setDashboard(dashboardData);
      setClients(Array.isArray(clientData.clients) ? clientData.clients : []);
      setClashes(Array.isArray(clashData.clashes) ? clashData.clashes : []);
      setNow(dashboardData.serverNow ? new Date(dashboardData.serverNow).getTime() : Date.now());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow((value) => value + 1000), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleClients = useMemo(() => filter === "all" ? clients : clients.filter((client) => client.status === filter), [clients, filter]);

  if (!hasSession) return <SessionRequired />;

  return <div className="min-h-[100dvh] bg-[#EFF1F4] text-[#3F3D46]">
    <CPHeader />
    <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-10">
      {loading ? <DashboardSkeleton /> : error ? <ErrorState error={error} retry={load} /> : dashboard ? <>
        <section className="flex flex-col gap-5 border-b border-[#D9DCE2] pb-7 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#9A6A13]">Partner workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#121B35] md:text-4xl">Welcome, {dashboard.partner.name}</h1><p className="mt-2 text-sm text-[#68646F]">Track every client from registration through settlement.</p></div>
          <div className="flex flex-wrap gap-2"><button onClick={() => void load()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#CBD0D8] bg-white px-4 text-sm font-bold text-[#121B35] active:translate-y-px"><RefreshCw className="size-4" />Refresh</button><a href="/cp-registration" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#DDAA42] px-4 text-sm font-bold text-[#0B1328] active:translate-y-px"><UserPlus className="size-4" />Register Client</a></div>
        </section>

        <section aria-label="Client summary" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <Metric label="Total clients" value={dashboard.counts.total} icon={UsersRound} />
          <Metric label="Pending" value={dashboard.counts.pending} icon={Clock3} />
          <Metric label="Approved" value={dashboard.counts.approved} icon={CheckCircle2} />
          <Metric label="Successful" value={dashboard.counts.successful} icon={Banknote} />
          <Metric label="Rejected" value={dashboard.counts.rejected} icon={XCircle} />
          <Metric label="Expired" value={dashboard.counts.expired} icon={AlertTriangle} />
          <Metric label="Clashes" value={dashboard.counts.clashes} icon={ShieldAlert} />
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl bg-[#123D2D] text-white shadow-[0_18px_45px_rgba(13,62,44,.18)]">
          <div className="grid gap-7 p-6 md:grid-cols-[1.25fr_1fr] md:p-8">
            <div><div className="flex items-center gap-2 text-emerald-100"><IndianRupee className="size-5" /><span className="text-xs font-bold uppercase tracking-[.12em]">CP earnings</span></div><p className="mt-4 text-3xl font-bold md:text-4xl">{formatMoney(dashboard.earnings.totalCreditedPaise)}</p><p className="mt-1 text-sm text-emerald-100">Total amount credited to your account</p><div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-white/10 px-4 py-3 font-mono text-sm font-bold text-white"><Clock3 className="size-4" />{countdownLabel(dashboard.earnings.nearestInitialCreditAt, now)}</div></div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/20"><EarningStat label="Awaiting credit" value={formatMoney(dashboard.earnings.awaitingInitialPaise)} /><EarningStat label="Initial credited" value={formatMoney(dashboard.earnings.creditedInitialPaise)} /><EarningStat label="Settlement credited" value={formatMoney(dashboard.earnings.finalSettlementCreditedPaise)} /><EarningStat label="Credit delay" value="12 hours" /></dl>
          </div>
          <p className="border-t border-white/15 px-6 py-3 text-xs text-emerald-100 md:px-8">This dashboard tracks payment status. Funds are transferred outside the website.</p>
        </section>

        <section className="mt-8">
          <div><h2 className="text-2xl font-bold text-[#121B35]">Client pipeline</h2><p className="mt-1 text-sm text-[#68646F]">Property, approval, expiry, and earning details in one view.</p></div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filter clients">{(["all", "pending", "approved", "successful", "rejected", "expired"] as const).map((status) => <button key={status} role="tab" aria-selected={filter === status} onClick={() => setFilter(status)} className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold ${filter === status ? "border-[#DDAA42] bg-[#FFF6DD] text-[#5A4315]" : "border-[#D9DCE2] bg-white text-[#68646F]"}`}>{statusLabels[status]} ({status === "all" ? dashboard.counts.total : dashboard.counts[status]})</button>)}</div>
          <ClientTable clients={visibleClients} />
        </section>

        <section className="mt-8 border-t border-[#D9DCE2] pt-8">
          <h2 className="text-2xl font-bold text-[#121B35]">Clash activity</h2><p className="mt-1 text-sm text-[#68646F]">Privacy-safe registration conflicts involving your account.</p>
          {clashes.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-[#C9CDD5] bg-white p-8 text-center"><ShieldAlert className="mx-auto size-8 text-[#A3A7AF]" /><p className="mt-3 text-sm font-semibold text-[#3F3D46]">No clash attempts recorded.</p></div> : <div className="mt-4 grid gap-3 md:grid-cols-2">{clashes.map((clash) => <article key={clash.id} className="rounded-2xl border border-[#D9DCE2] bg-white p-4"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5F8] text-[#273559]">{clash.direction === "initiated" ? <ArrowUpRight className="size-5" /> : <ArrowDownLeft className="size-5" />}</span><div><p className="font-bold text-[#121B35]">{clash.clientName} <span className="font-normal text-[#68646F]">{clash.mobileMasked}</span></p><p className="mt-1 text-xs text-[#68646F]">{clash.projectTitle}</p><p className="mt-2 text-xs font-semibold text-[#8A681F]">{clash.direction === "initiated" ? "Your registration was blocked by an active claim." : "Another CP attempted to register this client."}</p><time className="mt-2 block text-[11px] text-[#8A8690]">{formatDate(clash.attemptedAt, true)}</time></div></div></article>)}</div>}
        </section>
      </> : null}
    </main>
  </div>;
}

function CPHeader() {
  return <header className="border-b border-[#DDAA42]/25 bg-[#0B1328]"><div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 md:px-6"><a href="/cp-dashboard" className="flex items-center gap-3"><img src="/cleartitleone/logo.png" alt="ClearTitle One" className="size-10 rounded-full ring-2 ring-[#DDAA42]/60" /><div><p className="text-base font-bold text-white">Clear<span className="text-[#F2C052]">Title</span><span className="text-[#DDAA42]">One</span></p><p className="text-[10px] uppercase tracking-[.12em] text-white/55">Channel Partner</p></div></a><nav aria-label="Channel Partner" className="flex items-center gap-2"><a href="/cp-dashboard" aria-current="page" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-xs font-bold text-white"><LayoutDashboard className="size-4" />Dashboard</a><a href="/cp-registration" className="inline-flex h-10 items-center rounded-xl bg-[#DDAA42] px-3 text-xs font-bold text-[#0B1328]">Register Client</a></nav></div></header>;
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return <article className="rounded-2xl border border-[#D9DCE2] bg-white p-4"><div className="flex items-center justify-between"><span className="text-xs font-bold text-[#68646F]">{label}</span><Icon className="size-4 text-[#9A6A13]" /></div><p className="mt-3 text-3xl font-bold text-[#121B35]">{value}</p></article>;
}

function EarningStat({ label, value }: { label: string; value: string }) {
  return <div className="bg-[#164A37] p-4"><dt className="text-[11px] font-semibold text-emerald-100">{label}</dt><dd className="mt-1 text-lg font-bold text-white">{value}</dd></div>;
}

function ClientTable({ clients }: { clients: Client[] }) {
  if (!clients.length) return <div className="mt-2 rounded-2xl border border-dashed border-[#C9CDD5] bg-white p-10 text-center"><UsersRound className="mx-auto size-9 text-[#A3A7AF]" /><p className="mt-3 font-bold text-[#121B35]">No clients in this status.</p><a href="/cp-registration" className="mt-4 inline-flex h-10 items-center rounded-xl bg-[#DDAA42] px-4 text-xs font-bold text-[#0B1328]">Register Client</a></div>;
  return <div className="mt-2 overflow-hidden rounded-2xl border border-[#D9DCE2] bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="bg-[#F5F6F8] text-[10px] font-bold uppercase tracking-[.1em] text-[#68646F]"><tr><th className="px-4 py-4">Client</th><th className="px-4 py-4">Property</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Dates</th><th className="px-4 py-4">Booking advance</th><th className="px-4 py-4">CP earning</th><th className="px-4 py-4">Payment status</th></tr></thead><tbody>{clients.map((client) => <tr key={client.id} className="border-t border-[#E8E9ED] align-top"><td className="px-4 py-4"><p className="font-bold text-[#121B35]">{client.clientName}</p><p className="mt-1 text-xs text-[#68646F]">{client.mobileMasked}</p><p className="mt-1 font-mono text-[10px] text-[#8A8690]">{client.leadNumber}</p></td><td className="px-4 py-4"><p className="text-sm font-semibold text-[#121B35]">{client.projectTitle}</p>{client.budget && <p className="mt-1 text-xs text-[#68646F]">Budget: {client.budget}</p>}</td><td className="px-4 py-4"><span className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyles[client.status]}`}>{statusLabels[client.status]}</span></td><td className="px-4 py-4 text-xs text-[#68646F]"><p>Registered {formatDate(client.registeredAt)}</p>{client.status === "pending" && <p className="mt-1">Expires {formatDate(client.ownershipExpiresAt)}</p>}{client.successfulAt && <p className="mt-1">Settled {formatDate(client.successfulAt)}</p>}</td><td className="px-4 py-4 text-sm font-bold text-[#121B35]">{client.bookingAdvanceAmountPaise ? formatMoney(client.bookingAdvanceAmountPaise) : "Awaiting approval"}</td><td className="px-4 py-4 text-sm font-bold text-[#121B35]">{client.initialCpAmountPaise ? formatMoney(client.initialCpAmountPaise) : "Not calculated"}{client.finalSettlementCpAmountPaise > 0 && <p className="mt-1 text-xs font-semibold text-emerald-700">+ {formatMoney(client.finalSettlementCpAmountPaise)} settlement</p>}</td><td className="px-4 py-4 text-xs font-semibold"><PaymentState client={client} /></td></tr>)}</tbody></table></div></div>;
}

function PaymentState({ client }: { client: Client }) {
  const current = Date.now();
  if (client.status === "pending") return <span className="text-amber-800">Pending admin review</span>;
  if (client.status === "rejected") return <span className="text-red-700">Registration rejected</span>;
  if (client.status === "expired") return <span className="text-slate-600">Registration expired</span>;
  if (client.initialCreditAt && new Date(client.initialCreditAt).getTime() > current) return <span className="text-emerald-700">{countdownLabel(client.initialCreditAt, current)}</span>;
  return <span className="text-emerald-700">Amount credited to your account</span>;
}

function DashboardSkeleton() {
  return <div aria-label="Loading dashboard" className="animate-pulse"><div className="h-24 rounded-2xl bg-white" /><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /></div><div className="mt-6 h-64 rounded-2xl bg-[#DDE3E0]" /><div className="mt-8 h-80 rounded-2xl bg-white" /></div>;
}

function ErrorState({ error, retry }: { error: string; retry: () => void }) {
  return <div role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-center"><AlertTriangle className="mx-auto size-9 text-red-600" /><h1 className="mt-4 text-xl font-bold text-[#121B35]">Dashboard unavailable</h1><p className="mt-2 text-sm text-red-700">{error}</p><div className="mt-5 flex justify-center gap-2"><button onClick={retry} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1328] px-4 text-xs font-bold text-white"><RefreshCw className="size-4" />Try Again</button><a href="/cp-registration" className="inline-flex h-10 items-center rounded-xl border border-[#CBD0D8] px-4 text-xs font-bold text-[#121B35]">Verify Code</a></div></div>;
}

function SessionRequired() {
  return <div className="min-h-[100dvh] bg-[#EFF1F4]"><CPHeader /><main className="mx-auto flex max-w-[720px] px-4 py-20"><section className="w-full rounded-2xl border border-[#D9DCE2] bg-white p-8 text-center shadow-[0_18px_45px_rgba(18,27,53,.08)]"><ShieldAlert className="mx-auto size-10 text-[#9A6A13]" /><h1 className="mt-5 text-2xl font-bold text-[#121B35]">Verify your Channel Partner code</h1><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#68646F]">Your dashboard uses the secure session created on the client registration page.</p><a href="/cp-registration" className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#DDAA42] px-5 text-sm font-bold text-[#0B1328]">Verify CP Code</a></section></main></div>;
}
