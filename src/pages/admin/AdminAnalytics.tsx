"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Building2,
  CalendarDays,
  Eye,
  LineChart,
  MessageSquare,
  MousePointerClick,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchAnalyticsDashboard } from "@/lib/api";

type CountRow = { count: number };
type DashboardStats = {
  period: { days: number; from: string; to: string };
  totalProperties: number;
  publishedProperties: number;
  totalLeads: number;
  totalEvents: number;
  uniqueVisitors: number;
  propertyViews: number;
  conversionEvents: number;
  conversionRate: number;
  eventGrowth: number;
  leadGrowth: number;
  leadsByStatus: ({ status: string } & CountRow)[];
  leadsByType: ({ type: string } & CountRow)[];
  eventCounts: ({ eventType: string } & CountRow)[];
  propertiesByStatus: ({ status: string } & CountRow)[];
  trend: { date: string; events: number; leads: number }[];
  topProperties: { propertyId: string; title: string; location: string; views: number; interactions: number }[];
  topSearches: { query: string; count: number }[];
};

const eventLabels: Record<string, string> = {
  page_view: "Page views",
  property_view: "Property detail views",
  property_share: "Properties shared",
  search: "Searches",
  brochure_download: "Brochures downloaded",
  contact_reveal: "Contact numbers revealed",
  enquiry_submitted: "Property enquiries",
  contact_form_submitted: "Contact forms",
  legal_query_submitted: "General legal queries",
  lawyer_consultation_opened: "Lawyer consultation starts",
  lawyer_consultation_submitted: "Lawyer requests submitted",
  whatsapp_consultation_opened: "WhatsApp consultations",
  public_property_submitted: "Public property submissions",
};

const leadLabels: Record<string, string> = {
  contact: "Contact enquiries",
  consultation: "Legal consultations",
  property_interest: "Property interest",
};

function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-[13px] text-[#68646F]">{children}</p>;
}

function Growth({ value }: { value: number }) {
  const positive = value >= 0;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}{Math.abs(value)}%</span>;
}

function MetricCard({ icon: Icon, label, value, note, growth }: { icon: React.ElementType; label: string; value: string | number; note: string; growth?: number }) {
  return <div className="rounded-2xl border border-[#E4E0E7]/50 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-xl bg-[#121B35] text-[#F2C052]"><Icon className="size-5" /></span>{growth !== undefined && <Growth value={growth} />}</div>
    <p className="mt-4 text-[28px] font-bold leading-none text-[#121B35]">{value}</p>
    <p className="mt-2 text-[13px] font-bold text-[#3F3D46]">{label}</p>
    <p className="mt-1 text-[11px] text-[#68646F]">{note}</p>
  </div>;
}

function Breakdown({ rows, labelFor }: { rows: ({ count: number } & Record<string, unknown>)[]; labelFor: (row: Record<string, unknown>) => string }) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return <div className="space-y-4">{rows.map((row, index) => <div key={`${labelFor(row)}-${index}`}>
    <div className="mb-1.5 flex items-center justify-between gap-3"><span className="text-[13px] font-medium text-[#3F3D46]">{labelFor(row)}</span><span className="text-[13px] font-bold text-[#121B35]">{row.count}</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-[#F3F1F5]"><div className="h-full rounded-full bg-gradient-to-r from-[#DDAA42] to-[#F2C052]" style={{ width: `${Math.max((row.count / max) * 100, 3)}%` }} /></div>
  </div>)}</div>;
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = async (period = days) => {
    setLoading(true);
    setError("");
    try {
      setStats(await fetchAnalyticsDashboard(period));
      setUpdatedAt(new Date());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(days); }, [days]);

  const maxTrend = Math.max(...(stats?.trend.map((item) => Math.max(item.events, item.leads)) || [1]), 1);
  const periodLabel = stats ? `${new Date(stats.period.from).toLocaleDateString()} – ${new Date(stats.period.to).toLocaleDateString()}` : "";

  return <AdminLayout>
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-[28px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}>Analytics Dashboard</h1><p className="mt-1 text-[14px] text-[#68646F]">Real customer engagement, lead conversion and inventory performance</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-[#E4E0E7] bg-white p-1">{([7, 30, 90] as const).map((value) => <button key={value} onClick={() => setDays(value)} className={`rounded-lg px-3.5 py-2 text-[12px] font-bold transition-colors ${days === value ? "bg-[#121B35] text-[#F2C052]" : "text-[#68646F] hover:bg-[#F8F7FA]"}`}>{value} days</button>)}</div>
        <button onClick={() => void load()} disabled={loading} className="flex size-10 items-center justify-center rounded-xl border border-[#E4E0E7] bg-white text-[#121B35] hover:border-[#DDAA42] disabled:opacity-50" aria-label="Refresh analytics"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /></button>
      </div>
    </div>

    {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p className="font-bold">Analytics could not be loaded</p><p className="mt-1">{error}</p><button onClick={() => void load()} className="mt-3 font-bold underline">Try again</button></div>}
    {loading && !stats && <div className="flex h-64 items-center justify-center"><div className="size-8 animate-spin rounded-full border-3 border-[#DDAA42] border-t-transparent" /></div>}

    {stats && <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#68646F]"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-[#DDAA42]" />Reporting period: {periodLabel}</span>{updatedAt && <span>Last refreshed {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}</div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard icon={MousePointerClick} label="Interactions" value={stats.totalEvents.toLocaleString()} note="All tracked customer actions" growth={stats.eventGrowth} />
        <MetricCard icon={Users} label="Unique visitors" value={stats.uniqueVisitors.toLocaleString()} note="Anonymous 30-day browser sessions" />
        <MetricCard icon={Eye} label="Property views" value={stats.propertyViews.toLocaleString()} note="Property overview visits" />
        <MetricCard icon={MessageSquare} label="Leads generated" value={stats.totalLeads.toLocaleString()} note="Contact, property and legal leads" growth={stats.leadGrowth} />
        <MetricCard icon={Activity} label="Intent conversion" value={`${stats.conversionRate}%`} note={`${stats.conversionEvents} high-intent actions`} />
        <MetricCard icon={Building2} label="Published properties" value={`${stats.publishedProperties}/${stats.totalProperties}`} note="Published versus all inventory" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-[#E4E0E7]/50 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-[16px] font-bold text-[#121B35]"><LineChart className="size-4 text-[#DDAA42]" />Daily activity</h2><p className="mt-1 text-[11px] text-[#68646F]">Interactions and leads created each day</p></div><div className="flex gap-4 text-[11px] font-bold text-[#68646F]"><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-[#DDAA42]" />Interactions</span><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-[#121B35]" />Leads</span></div></div>
          <div className="overflow-x-auto pb-2"><div className="grid h-48 min-w-[620px] items-end gap-1 border-b border-[#E4E0E7] px-1" style={{ gridTemplateColumns: `repeat(${stats.trend.length}, minmax(5px, 1fr))` }}>{stats.trend.map((item) => <div key={item.date} title={`${new Date(`${item.date}T00:00:00`).toLocaleDateString()}: ${item.events} interactions, ${item.leads} leads`} className="flex h-full items-end justify-center gap-px"><div className="w-[45%] min-h-[2px] rounded-t-sm bg-[#DDAA42] transition-all hover:bg-[#B98428]" style={{ height: `${Math.max((item.events / maxTrend) * 100, item.events ? 2 : 0)}%` }} /><div className="w-[35%] min-h-[2px] rounded-t-sm bg-[#121B35]" style={{ height: `${Math.max((item.leads / maxTrend) * 100, item.leads ? 2 : 0)}%` }} /></div>)}</div></div>
          <div className="mt-2 flex justify-between text-[10px] text-[#68646F]"><span>{new Date(stats.period.from).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span><span>Hover bars for daily totals</span><span>{new Date(stats.period.to).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></div>
        </section>

        <section className="rounded-2xl border border-[#E4E0E7]/50 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-[16px] font-bold text-[#121B35]"><MousePointerClick className="size-4 text-[#DDAA42]" />Interaction breakdown</h2><p className="mb-5 mt-1 text-[11px] text-[#68646F]">Which customer actions are happening most</p>{stats.eventCounts.length ? <Breakdown rows={stats.eventCounts} labelFor={(row) => eventLabels[String(row.eventType)] || titleCase(String(row.eventType))} /> : <Empty>No customer interactions have been recorded in this period.</Empty>}</section>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-[#E4E0E7]/50 bg-white shadow-sm"><div className="border-b border-[#E4E0E7]/50 p-5"><h2 className="flex items-center gap-2 text-[16px] font-bold text-[#121B35]"><Eye className="size-4 text-[#DDAA42]" />Top-performing properties</h2><p className="mt-1 text-[11px] text-[#68646F]">Ranked by detail views and total interactions</p></div>{stats.topProperties.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead className="bg-[#F8FAFC] text-[10px] uppercase tracking-wider text-[#68646F]"><tr><th className="px-5 py-3">Property</th><th className="px-4 py-3 text-right">Views</th><th className="px-5 py-3 text-right">Interactions</th></tr></thead><tbody className="divide-y divide-[#E4E0E7]/40">{stats.topProperties.map((item, index) => <tr key={item.propertyId}><td className="px-5 py-3.5"><div className="flex items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF8E5] text-xs font-bold text-[#B98428]">{index + 1}</span><div><p className="max-w-[280px] truncate text-[13px] font-bold text-[#121B35]">{item.title}</p><p className="max-w-[280px] truncate text-[11px] text-[#68646F]">{item.location || item.propertyId}</p></div></div></td><td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#121B35]">{item.views}</td><td className="px-5 py-3.5 text-right text-[13px] font-bold text-[#DDAA42]">{item.interactions}</td></tr>)}</tbody></table></div> : <Empty>No property interactions have been recorded yet.</Empty>}</section>

        <section className="rounded-2xl border border-[#E4E0E7]/50 bg-white p-5 shadow-sm"><h2 className="flex items-center gap-2 text-[16px] font-bold text-[#121B35]"><Search className="size-4 text-[#DDAA42]" />Top customer searches</h2><p className="mb-5 mt-1 text-[11px] text-[#68646F]">Localities, projects and property terms customers use</p>{stats.topSearches.length ? <div className="space-y-2.5">{stats.topSearches.map((item, index) => <div key={`${item.query}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-[#E4E0E7]/50 bg-[#F8FAFC] px-4 py-3"><span className="flex min-w-0 items-center gap-3"><i className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#121B35] text-[10px] font-bold text-[#F2C052]">{index + 1}</i><span className="truncate text-[13px] font-semibold text-[#121B35]">{item.query}</span></span><span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#68646F]">{item.count} searches</span></div>)}</div> : <Empty>No customer searches have been recorded in this period.</Empty>}</section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-[#E4E0E7]/50 bg-white p-5 shadow-sm"><h2 className="text-[15px] font-bold text-[#121B35]">Leads by status</h2><p className="mb-5 mt-1 text-[11px] text-[#68646F]">Follow-up progress for this period</p>{stats.leadsByStatus.length ? <Breakdown rows={stats.leadsByStatus} labelFor={(row) => titleCase(String(row.status))} /> : <Empty>No leads recorded.</Empty>}</section>
        <section className="rounded-2xl border border-[#E4E0E7]/50 bg-white p-5 shadow-sm"><h2 className="text-[15px] font-bold text-[#121B35]">Leads by source</h2><p className="mb-5 mt-1 text-[11px] text-[#68646F]">What kind of customer request converted</p>{stats.leadsByType.length ? <Breakdown rows={stats.leadsByType} labelFor={(row) => leadLabels[String(row.type)] || titleCase(String(row.type))} /> : <Empty>No leads recorded.</Empty>}</section>
        <section className="rounded-2xl border border-[#E4E0E7]/50 bg-white p-5 shadow-sm"><h2 className="text-[15px] font-bold text-[#121B35]">Property inventory</h2><p className="mb-5 mt-1 text-[11px] text-[#68646F]">All property records by moderation status</p>{stats.propertiesByStatus.length ? <Breakdown rows={stats.propertiesByStatus} labelFor={(row) => titleCase(String(row.status))} /> : <Empty>No properties recorded.</Empty>}</section>
      </div>
    </div>}
  </AdminLayout>;
}
