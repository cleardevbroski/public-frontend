import { Filter, Search, X } from "lucide-react";
import type { LeadFiltersValue } from "./types";

type Props = {
  value: LeadFiltersValue;
  searchInput: string;
  onSearchInput: (value: string) => void;
  onChange: (patch: Partial<LeadFiltersValue>) => void;
  onClear: () => void;
};

const selectClass = "h-10 min-w-0 rounded-xl border border-[#E1DEE5] bg-white px-3 text-[12px] font-semibold text-[#39364A] outline-none transition focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10";

export default function LeadFilters({ value, searchInput, onSearchInput, onChange, onClear }: Props) {
  const active = Boolean(value.search || value.status || value.source || value.type || value.sort !== "newest");
  return (
    <section className="rounded-[18px] border border-[#E7E5E9] bg-white p-3 sm:p-4" aria-label="Lead filters">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Search leads</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8A8690]" />
          <input
            value={searchInput}
            onChange={(event) => onSearchInput(event.target.value)}
            placeholder="Search name, phone, email or property"
            className="h-11 w-full rounded-xl border border-[#E1DEE5] bg-[#FBFAFC] pl-10 pr-9 text-[13px] text-[#121B35] outline-none transition placeholder:text-[#9A96A0] focus:border-[#DDAA42] focus:bg-white focus:ring-2 focus:ring-[#DDAA42]/10"
          />
          {searchInput && <button type="button" onClick={() => onSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#77727D] hover:bg-[#F0EEF2]" aria-label="Clear search"><X className="size-3.5" /></button>}
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex">
          <label className="relative"><span className="sr-only">Status</span><select value={value.status} onChange={(event) => onChange({ status: event.target.value as LeadFiltersValue["status"] })} className={selectClass}><option value="">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option></select></label>
          <label><span className="sr-only">Source</span><select value={value.source} onChange={(event) => onChange({ source: event.target.value as LeadFiltersValue["source"] })} className={selectClass}><option value="">All sources</option><option value="website_contact">Website</option><option value="property_interest">Property interest</option><option value="legal_consultation">Legal consultation</option><option value="admin_import">Admin import</option><option value="manual">Manual</option></select></label>
          <label><span className="sr-only">Interest</span><select value={value.type} onChange={(event) => onChange({ type: event.target.value as LeadFiltersValue["type"] })} className={selectClass}><option value="">All interests</option><option value="property_interest">Property</option><option value="contact">General enquiry</option><option value="consultation">Legal consultation</option></select></label>
        </div>
        {active && <button type="button" onClick={onClear} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-[12px] font-bold text-[#6A6470] hover:bg-[#F4F2F5]"><Filter className="size-3.5" /> Reset</button>}
      </div>
    </section>
  );
}
