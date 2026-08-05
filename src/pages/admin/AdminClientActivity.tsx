"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, ChevronLeft, ChevronRight, Clock3, Eye, Loader2, MousePointerClick, RefreshCw, UserCheck, Users, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchClientActivityVisitor, fetchClientActivityVisitors } from "@/lib/api";

type VisitFilter = "all" | "1" | "2" | "3" | "4plus";
type IdentityFilter = "all" | "identified" | "anonymous";

type Interest = {
  propertyTitle?: string;
  propertyType?: string;
  budgetBand?: string;
  location?: string;
};

type Visitor = {
  id: string;
  name: string;
  phone: string;
  email: string;
  identified: boolean;
  visitCount: number;
  totalActiveSeconds: number;
  totalPropertyViews: number;
  leadScore: number;
  firstSeenAt: string;
  lastSeenAt: string;
  interest?: Interest;
};

type Counts = { total: number; identified: number; one: number; two: number; three: number; fourPlus: number };
type Pagination = { page: number; limit: number; total: number; pages: number };
type Session = {
  id: string;
  visitNumber: number;
  startedAt: string;
  lastActivityAt: string;
  activeSeconds: number;
  propertyViewCount: number;
  landingPath: string;
  referrer: string;
  deviceCategory: string;
};
type Actions = { brochure?: number; contact?: number; enquiry?: number; share?: number; whatsapp?: number; priceList?: number; floorPlan?: number; favorite?: number; unfavorite?: number };
type Engagement = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyType: string;
  location: string;
  priceLabel: string;
  budgetBand: string;
  viewCount: number;
  activeSeconds: number;
  actionCount: number;
  actions: Actions;
  lastViewedAt: string;
};
type VisitorDetail = { visitor: Visitor; sessions: Session[]; engagements: Engagement[] };

const EMPTY_COUNTS: Counts = { total: 0, identified: 0, one: 0, two: 0, three: 0, fourPlus: 0 };

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function actionSummary(actions: Actions) {
  const labels: Array<[keyof Actions, string]> = [["favorite", "saves"], ["unfavorite", "removals"], ["enquiry", "enquiries"], ["contact", "contacts"], ["brochure", "brochures"], ["share", "shares"], ["priceList", "price lists"], ["floorPlan", "floor plans"], ["whatsapp", "WhatsApp"]];
  const values = labels.filter(([key]) => actions?.[key]).map(([key, label]) => `${actions[key]} ${label}`);
  return values.join(", ") || "No actions";
}

export default function AdminClientActivity() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, pages: 1 });
  const [visitFilter, setVisitFilter] = useState<VisitFilter>("all");
  const [identityFilter, setIdentityFilter] = useState<IdentityFilter>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<VisitorDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadVisitors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchClientActivityVisitors({ visits: visitFilter, identity: identityFilter, page, limit: 25 });
      setVisitors(data.visitors || []);
      setCounts(data.counts || EMPTY_COUNTS);
      setPagination(data.pagination || { page: 1, limit: 25, total: 0, pages: 1 });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load client activity.");
    } finally {
      setLoading(false);
    }
  }, [identityFilter, page, visitFilter]);

  useEffect(() => { void loadVisitors(); }, [loadVisitors]);

  const openVisitor = async (id: string) => {
    setDetailLoading(true);
    setError("");
    try {
      setSelected(await fetchClientActivityVisitor(id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load visitor details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const frequencyFilters: Array<{ value: VisitFilter; label: string; count: number }> = [
    { value: "all", label: "All visitors", count: counts.total },
    { value: "1", label: "1 visit", count: counts.one },
    { value: "2", label: "2 visits", count: counts.two },
    { value: "3", label: "3 visits", count: counts.three },
    { value: "4plus", label: "4+ visits", count: counts.fourPlus },
  ];

  return (
    <AdminLayout>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D09A2D] text-xs font-bold uppercase tracking-[0.15em]"><Activity className="size-4" /> Audience intelligence</div>
          <h1 className="mt-2 text-[28px] font-bold text-[#121B35]">Client Activity</h1>
          <p className="mt-1 max-w-3xl text-sm text-[#68646F]">See repeat visits, active browsing time, preferred projects, property types, locations and budget bands. Anonymous visitors become identified after login.</p>
        </div>
        <button onClick={() => void loadVisitors()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E4E0E7] bg-white px-4 text-sm font-bold text-[#273559] hover:border-[#DDAA42] disabled:opacity-50">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <section aria-label="Client activity overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tracked visitors", value: counts.total, icon: Users, tone: "bg-[#EEF3FF] text-[#3157A4]" },
          { label: "Identified clients", value: counts.identified, icon: UserCheck, tone: "bg-[#EAF8F1] text-[#26724D]" },
          { label: "Returning visitors", value: counts.two + counts.three + counts.fourPlus, icon: RefreshCw, tone: "bg-[#FFF8E8] text-[#A66E00]" },
          { label: "High intent (4+)", value: counts.fourPlus, icon: MousePointerClick, tone: "bg-[#F8EEFF] text-[#7641A7]" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#EAE6EC] bg-white p-5 shadow-sm">
            <div className={`flex size-10 items-center justify-center rounded-xl ${item.tone}`}><item.icon className="size-5" /></div>
            <div className="mt-4 text-3xl font-bold text-[#121B35]">{item.value}</div>
            <div className="mt-1 text-sm font-semibold text-[#68646F]">{item.label}</div>
          </div>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-[#EAE6EC] bg-white shadow-sm">
        <div className="border-b border-[#EEEAF0] p-4 md:p-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by visit frequency">
            {frequencyFilters.map((filter) => (
              <button key={filter.value} onClick={() => { setVisitFilter(filter.value); setPage(1); }} aria-pressed={visitFilter === filter.value} className={`rounded-xl px-3.5 py-2 text-sm font-bold transition-colors ${visitFilter === filter.value ? "bg-[#121B35] text-white" : "bg-[#F6F4F7] text-[#68646F] hover:bg-[#ECE9EE]"}`}>
                {filter.label} <span className="ml-1 opacity-70">{filter.count}</span>
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-sm font-semibold text-[#68646F]">
              Identity
              <select value={identityFilter} onChange={(event) => { setIdentityFilter(event.target.value as IdentityFilter); setPage(1); }} className="h-10 rounded-xl border border-[#E4E0E7] bg-white px-3 text-sm font-semibold text-[#121B35] outline-none focus:border-[#DDAA42]">
                <option value="all">All</option><option value="identified">Identified</option><option value="anonymous">Anonymous</option>
              </select>
            </label>
          </div>
        </div>

        {error && <div role="alert" className="m-5 rounded-xl bg-[#FFF1EF] px-4 py-3 text-sm font-semibold text-[#A83226]">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <caption className="sr-only">Tracked client and anonymous visitor activity</caption>
            <thead className="bg-[#F8F7F9] text-xs uppercase tracking-wide text-[#68646F]">
              <tr><th scope="col" className="px-5 py-3.5">Visitor</th><th scope="col" className="px-4 py-3.5">Visits</th><th scope="col" className="px-4 py-3.5">Active time</th><th scope="col" className="px-4 py-3.5">Top interest</th><th scope="col" className="px-4 py-3.5">Budget</th><th scope="col" className="px-4 py-3.5">Last activity</th><th scope="col" className="px-5 py-3.5 text-right">Details</th></tr>
            </thead>
            <tbody className="divide-y divide-[#EEEAF0]">
              {loading ? (
                <tr><td colSpan={7} className="h-48 text-center text-[#68646F]"><Loader2 className="mx-auto mb-2 size-6 animate-spin text-[#DDAA42]" />Loading client activity…</td></tr>
              ) : visitors.length === 0 ? (
                <tr><td colSpan={7} className="h-48 text-center text-[#68646F]">No visitors match these filters yet.</td></tr>
              ) : visitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-[#FCFBFC]">
                  <td className="px-5 py-4"><div className="font-bold text-[#121B35]">{visitor.name}</div><div className="mt-0.5 text-xs text-[#85808A]">{visitor.phone || visitor.email || "Anonymous browser"}</div></td>
                  <td className="px-4 py-4"><span className="inline-flex rounded-full bg-[#EEF3FF] px-2.5 py-1 font-bold text-[#3157A4]">{visitor.visitCount}</span></td>
                  <td className="px-4 py-4 font-semibold text-[#273559]">{formatDuration(visitor.totalActiveSeconds)}<div className="text-xs font-normal text-[#85808A]">{visitor.totalPropertyViews} project views</div></td>
                  <td className="max-w-[250px] px-4 py-4"><div className="truncate font-bold text-[#121B35]">{visitor.interest?.propertyTitle || "—"}</div><div className="truncate text-xs text-[#85808A]">{[visitor.interest?.propertyType, visitor.interest?.location].filter(Boolean).join(" · ")}</div></td>
                  <td className="px-4 py-4 font-semibold text-[#273559]">{visitor.interest?.budgetBand || "Unknown"}</td>
                  <td className="px-4 py-4 text-xs text-[#68646F]">{formatDate(visitor.lastSeenAt)}</td>
                  <td className="px-5 py-4 text-right"><button onClick={() => void openVisitor(visitor.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E0E7] px-3 py-2 text-xs font-bold text-[#273559] hover:border-[#DDAA42] hover:text-[#A66E00]"><Eye className="size-3.5" /> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#EEEAF0] px-5 py-4 text-sm text-[#68646F]">
          <span>{pagination.total} matching visitor{pagination.total === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-2"><button aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="flex size-9 items-center justify-center rounded-lg border border-[#E4E0E7] disabled:opacity-40"><ChevronLeft className="size-4" /></button><span className="font-semibold">{page} / {pagination.pages}</span><button aria-label="Next page" disabled={page >= pagination.pages || loading} onClick={() => setPage((current) => current + 1)} className="flex size-9 items-center justify-center rounded-lg border border-[#E4E0E7] disabled:opacity-40"><ChevronRight className="size-4" /></button></div>
        </div>
      </section>

      {(detailLoading || selected) && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-[#081020]/55" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && !detailLoading) setSelected(null); }}>
          <aside role="dialog" aria-modal="true" aria-labelledby="visitor-detail-title" className="h-full w-full max-w-3xl overflow-y-auto bg-[#F8F7F9] shadow-2xl">
            {detailLoading ? <div className="flex h-full items-center justify-center text-[#68646F]"><Loader2 className="mr-2 size-6 animate-spin text-[#DDAA42]" /> Loading visitor…</div> : selected && <>
              <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#E4E0E7] bg-white px-5 py-5 md:px-7">
                <div><div className="text-xs font-bold uppercase tracking-[0.14em] text-[#D09A2D]">Visitor profile</div><h2 id="visitor-detail-title" className="mt-1 text-2xl font-bold text-[#121B35]">{selected.visitor.name}</h2><p className="mt-1 text-sm text-[#68646F]">{selected.visitor.phone || selected.visitor.email || "Anonymous browser"}</p></div>
                <button aria-label="Close visitor details" onClick={() => setSelected(null)} className="flex size-10 items-center justify-center rounded-full bg-[#F3F1F4] text-[#68646F] hover:text-[#121B35]"><X className="size-5" /></button>
              </header>
              <div className="space-y-6 p-5 md:p-7">
                <section aria-label="Visitor summary" className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[{ label: "Visits", value: selected.visitor.visitCount }, { label: "Active time", value: formatDuration(selected.visitor.totalActiveSeconds) }, { label: "Project views", value: selected.visitor.totalPropertyViews }, { label: "Lead score", value: selected.visitor.leadScore }].map((item) => <div key={item.label} className="rounded-xl border border-[#EAE6EC] bg-white p-4"><div className="text-xl font-bold text-[#121B35]">{item.value}</div><div className="mt-1 text-xs font-semibold text-[#85808A]">{item.label}</div></div>)}
                </section>

                <section><h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#121B35]"><Clock3 className="size-4 text-[#D09A2D]" /> Visit history</h3><div className="grid gap-3 md:grid-cols-2">{selected.sessions.map((session) => <article key={session.id} className="rounded-xl border border-[#EAE6EC] bg-white p-4"><div className="flex items-center justify-between"><strong className="text-sm text-[#121B35]">Visit {session.visitNumber}</strong><span className="rounded-full bg-[#F3F1F4] px-2 py-1 text-[11px] font-bold capitalize text-[#68646F]">{session.deviceCategory}</span></div><div className="mt-2 text-xs text-[#68646F]">{formatDate(session.startedAt)}</div><div className="mt-3 flex gap-4 text-xs font-semibold text-[#273559]"><span>{formatDuration(session.activeSeconds)} active</span><span>{session.propertyViewCount} project views</span></div><div className="mt-2 truncate text-xs text-[#85808A]" title={session.landingPath}>Landed on {session.landingPath || "/"}</div></article>)}</div></section>

                <section><h3 className="mb-3 flex items-center gap-2 text-base font-bold text-[#121B35]"><BuildingInterestIcon /> Project interests</h3><div className="overflow-x-auto rounded-xl border border-[#EAE6EC] bg-white"><table className="w-full min-w-[680px] text-left text-sm"><caption className="sr-only">Projects viewed by this visitor</caption><thead className="bg-[#F3F1F4] text-xs uppercase text-[#68646F]"><tr><th scope="col" className="px-4 py-3">Project</th><th scope="col" className="px-4 py-3">Type / budget</th><th scope="col" className="px-4 py-3">Attention</th><th scope="col" className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-[#EEEAF0]">{selected.engagements.length ? selected.engagements.map((item) => <tr key={item.id}><td className="px-4 py-3"><div className="font-bold text-[#121B35]">{item.propertyTitle || item.propertyId}</div><div className="text-xs text-[#85808A]">{item.location}</div></td><td className="px-4 py-3"><div className="font-semibold text-[#273559]">{item.propertyType || "—"}</div><div className="text-xs text-[#85808A]">{item.budgetBand || "Unknown"}</div></td><td className="px-4 py-3 font-semibold text-[#273559]">{formatDuration(item.activeSeconds)}<div className="text-xs font-normal text-[#85808A]">{item.viewCount} views</div></td><td className="max-w-[220px] px-4 py-3 text-xs text-[#68646F]">{actionSummary(item.actions)}</td></tr>) : <tr><td colSpan={4} className="p-8 text-center text-[#85808A]">No project activity recorded.</td></tr>}</tbody></table></div></section>
              </div>
            </>}
          </aside>
        </div>
      )}
    </AdminLayout>
  );
}

function BuildingInterestIcon() {
  return <MousePointerClick className="size-4 text-[#D09A2D]" />;
}
