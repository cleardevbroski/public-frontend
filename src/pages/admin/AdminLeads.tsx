"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, RefreshCw, SlidersHorizontal } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import LeadDetailsPanel from "@/components/admin/leads/LeadDetailsPanel";
import LeadFilters from "@/components/admin/leads/LeadFilters";
import LeadImportDialog from "@/components/admin/leads/LeadImportDialog";
import LeadMetrics from "@/components/admin/leads/LeadMetrics";
import LeadMobileList from "@/components/admin/leads/LeadMobileList";
import { LeadsEmpty, LeadsError, LeadsLoading } from "@/components/admin/leads/LeadStates";
import LeadTable from "@/components/admin/leads/LeadTable";
import { leadId, type Lead, type LeadFiltersValue, type LeadMetricsData, type LeadPagination, type LeadStatus, type QualificationLevel } from "@/components/admin/leads/types";
import { deleteLead, fetchLead, fetchLeadMetrics, fetchLeads, importLeads, updateLeadFollowUp, updateLeadQualification, updateLeadStatus } from "@/lib/api";

const emptyMetrics: LeadMetricsData = { total: 0, new: 0, contacted: 0, qualified: 0, closed: 0, needsAttention: 0 };
const defaultFilters: LeadFiltersValue = { search: "", status: "", source: "", type: "", sort: "newest" };
const tabs: { label: string; status: "" | LeadStatus }[] = [
  { label: "All leads", status: "" },
  { label: "Needs attention", status: "new" },
  { label: "Qualified", status: "qualified" },
  { label: "Closed", status: "closed" },
];

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [metrics, setMetrics] = useState<LeadMetricsData>(emptyMetrics);
  const [pagination, setPagination] = useState<LeadPagination>({ page: 1, limit: 25, total: 0, pages: 0 });
  const [filters, setFilters] = useState<LeadFiltersValue>(defaultFilters);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [busyId, setBusyId] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const query = { ...filters, page, limit: 25 };
      const [leadData, metricData] = await Promise.all([fetchLeads(query), fetchLeadMetrics()]);
      setLeads(Array.isArray(leadData.leads) ? leadData.leads : []);
      setPagination(leadData.pagination || { page, limit: 25, total: 0, pages: 0 });
      setMetrics({ ...emptyMetrics, ...metricData });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Check the backend connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((current) => current.search === searchInput.trim() ? current : { ...current, search: searchInput.trim() });
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const changeFilters = (patch: Partial<LeadFiltersValue>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };
  const clearFilters = () => {
    setSearchInput("");
    setFilters(defaultFilters);
    setPage(1);
  };
  const openLead = async (lead: Lead) => {
    setSelected(lead);
    try {
      const result = await fetchLead(leadId(lead));
      if (result.lead) setSelected(result.lead);
    } catch {
      // Keep the usable list summary open if detail refresh fails.
    }
  };
  const replaceLead = (updated: Lead) => {
    const id = leadId(updated);
    setLeads((items) => items.map((lead) => leadId(lead) === id ? updated : lead));
    setSelected((lead) => lead && leadId(lead) === id ? updated : lead);
  };
  const changeStatus = async (lead: Lead, status: LeadStatus) => {
    const id = leadId(lead);
    if (lead.status === status) return;
    setBusyId(id);
    try {
      const result = await updateLeadStatus(id, status);
      replaceLead({ ...lead, ...(result.lead || {}), status });
      setNotice(`Lead marked ${status}.`);
      await load(true);
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : "Status could not be updated.");
    } finally { setBusyId(""); }
  };
  const saveQualification = async (lead: Lead, data: { score: number; level: QualificationLevel; reasons: string[] }) => {
    const id = leadId(lead);
    setBusyId(id);
    try {
      const result = await updateLeadQualification(id, data);
      if (result.lead) replaceLead(result.lead);
      setNotice("Qualification saved.");
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Qualification could not be saved."); }
    finally { setBusyId(""); }
  };
  const saveNote = async (lead: Lead, data: { note: string; assignedTo?: string }) => {
    const id = leadId(lead);
    setBusyId(id);
    try {
      const result = await updateLeadFollowUp(id, data);
      if (result.lead) replaceLead(result.lead);
      setNotice("Internal note saved.");
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Note could not be saved."); }
    finally { setBusyId(""); }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = leadId(deleteTarget);
    setBusyId(id);
    try {
      await deleteLead(id);
      setDeleteTarget(null);
      setSelected(null);
      setNotice("Lead deleted.");
      await load(true);
    } catch (reason) { setNotice(reason instanceof Error ? reason.message : "Lead could not be deleted."); }
    finally { setBusyId(""); }
  };
  const handleImport = async (rows: Record<string, unknown>[]) => {
    const result = await importLeads(rows);
    await load(true);
    return result;
  };
  const showing = useMemo(() => {
    if (!pagination.total) return "No leads";
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    return `${start}–${end} of ${pagination.total.toLocaleString("en-IN")}`;
  }, [pagination]);
  const isFiltered = Boolean(filters.search || filters.status || filters.source || filters.type || filters.sort !== "newest");

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-[1500px] space-y-5 pb-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9A7427]">Customer pipeline</p>
            <h1 className="mt-1 text-[28px] font-bold tracking-[-0.035em] text-[#121B35] sm:text-[32px]" style={{ fontFamily: "var(--font-outfit)" }}>Leads & enquiries</h1>
            <p className="mt-1 max-w-[620px] text-[13px] leading-5 text-[#77727D]">Review customer interest, website engagement and internal follow-up in one workspace.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void load()} disabled={loading} className="grid size-11 place-items-center rounded-xl border border-[#E1DEE5] bg-white text-[#68646F] hover:bg-[#F7F5F7] disabled:opacity-50" aria-label="Refresh leads"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /></button>
            <button type="button" onClick={() => setImportOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#DDAA42] px-4 text-[12.5px] font-bold text-[#121B35] shadow-[0_6px_18px_rgba(221,170,66,0.2)] hover:bg-[#E5B652]"><Download className="size-4" /> Import leads</button>
          </div>
        </header>

        <LeadMetrics metrics={metrics} loading={loading && !leads.length} />
        <nav className="flex gap-1 overflow-x-auto rounded-[14px] border border-[#E7E5E9] bg-white p-1" aria-label="Lead views">
          {tabs.map((tab) => <button key={tab.label} type="button" onClick={() => changeFilters({ status: tab.status })} className={`shrink-0 rounded-[10px] px-3.5 py-2 text-[11.5px] font-bold transition ${filters.status === tab.status ? "bg-[#121B35] text-white shadow-sm" : "text-[#716C77] hover:bg-[#F5F3F6]"}`}>{tab.label}{tab.status === "new" && metrics.needsAttention > 0 ? <span className="ml-1.5 rounded-full bg-[#DDAA42] px-1.5 py-0.5 text-[9px] text-[#121B35]">{metrics.needsAttention}</span> : null}</button>)}
        </nav>
        <LeadFilters value={filters} searchInput={searchInput} onSearchInput={setSearchInput} onChange={changeFilters} onClear={clearFilters} />

        <section className="overflow-hidden rounded-[18px] border border-[#E7E5E9] bg-white" aria-label="Lead records">
          <div className="flex items-center justify-between border-b border-[#E7E5E9] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2"><SlidersHorizontal className="size-3.5 text-[#8A8590]" /><p className="text-[11.5px] font-semibold text-[#5E5964]">{showing}</p></div>
            <label className="flex items-center gap-2 text-[10.5px] font-semibold text-[#8A8590]">Sort<select value={filters.sort} onChange={(event) => changeFilters({ sort: event.target.value as LeadFiltersValue["sort"] })} className="rounded-lg border-0 bg-[#F5F3F6] px-2 py-1.5 text-[10.5px] font-bold text-[#4E4954] outline-none"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="name">Name</option><option value="score">Qualification</option><option value="activity">Recent activity</option></select></label>
          </div>
          {loading ? <LeadsLoading /> : error ? <LeadsError message={error} onRetry={() => void load()} /> : leads.length === 0 ? <LeadsEmpty filtered={isFiltered} onClear={clearFilters} /> : <><LeadTable leads={leads} busyId={busyId} onOpen={(lead) => void openLead(lead)} onStatus={(lead, status) => void changeStatus(lead, status)} /><LeadMobileList leads={leads} onOpen={(lead) => void openLead(lead)} /></>}
          {!loading && !error && pagination.pages > 1 && <footer className="flex items-center justify-between border-t border-[#E7E5E9] bg-[#FAF9FB] px-4 py-3 sm:px-5"><p className="text-[10.5px] font-semibold text-[#817C87]">Page {pagination.page} of {pagination.pages}</p><div className="flex gap-1.5"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid size-9 place-items-center rounded-xl border border-[#E1DEE5] bg-white text-[#5E5964] disabled:opacity-35" aria-label="Previous page"><ChevronLeft className="size-4" /></button><button type="button" disabled={page >= pagination.pages} onClick={() => setPage((value) => Math.min(pagination.pages, value + 1))} className="grid size-9 place-items-center rounded-xl border border-[#E1DEE5] bg-white text-[#5E5964] disabled:opacity-35" aria-label="Next page"><ChevronRight className="size-4" /></button></div></footer>}
        </section>
      </div>

      <LeadDetailsPanel lead={selected} saving={Boolean(selected && busyId === leadId(selected))} onClose={() => setSelected(null)} onStatus={changeStatus} onQualification={saveQualification} onNote={saveNote} onDelete={(lead) => setDeleteTarget(lead)} />
      <LeadImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImport={handleImport} />
      {deleteTarget && <div className="fixed inset-0 z-[100] grid place-items-center bg-[#091024]/55 p-5 backdrop-blur-[2px]" role="alertdialog" aria-modal="true" aria-label="Delete lead"><div className="w-full max-w-[420px] rounded-[22px] bg-white p-6 shadow-2xl"><h2 className="text-[18px] font-bold text-[#121B35]">Delete this lead?</h2><p className="mt-2 text-[12.5px] leading-5 text-[#716C77]">{deleteTarget.name} and their enquiry history will be permanently removed.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setDeleteTarget(null)} className="h-10 rounded-xl border border-[#E1DEE5] px-4 text-[12px] font-bold text-[#5E5964]">Cancel</button><button type="button" disabled={busyId === leadId(deleteTarget)} onClick={() => void confirmDelete()} className="h-10 rounded-xl bg-[#B53A33] px-4 text-[12px] font-bold text-white disabled:opacity-50">Delete lead</button></div></div></div>}
      {notice && <div className="fixed bottom-5 left-1/2 z-[110] -translate-x-1/2 rounded-xl bg-[#121B35] px-4 py-3 text-[12px] font-semibold text-white shadow-xl" role="status">{notice}</div>}
    </AdminLayout>
  );
}
