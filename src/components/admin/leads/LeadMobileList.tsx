import { ChevronRight, MapPin } from "lucide-react";
import { QualificationBadge, StatusBadge } from "./LeadBadges";
import { leadId, sourceLabels, type Lead } from "./types";

export default function LeadMobileList({ leads, onOpen }: { leads: Lead[]; onOpen: (lead: Lead) => void }) {
  return (
    <div className="divide-y divide-[#ECEAEE] lg:hidden">
      {leads.map((lead) => {
        const property = lead.propertyTitle || lead.activity?.topProperty?.propertyTitle;
        return (
          <button key={leadId(lead)} type="button" onClick={() => onOpen(lead)} className="block w-full bg-white p-4 text-left transition active:bg-[#FAF8F3]">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#121B35] text-[13px] font-bold text-white">{lead.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-[13.5px] font-bold text-[#121B35]">{lead.name}</p><p className="mt-0.5 truncate text-[11px] text-[#817C87]">{lead.phone || lead.email || sourceLabels[lead.source]}</p></div><ChevronRight className="mt-1 size-4 shrink-0 text-[#9A96A0]" /></div>
                {property && <p className="mt-2 flex items-start gap-1.5 text-[11.5px] font-semibold leading-4 text-[#4B4650]"><MapPin className="mt-0.5 size-3 shrink-0 text-[#DDAA42]" /><span className="line-clamp-2">{property}</span></p>}
                <div className="mt-3 flex flex-wrap items-center gap-1.5"><StatusBadge status={lead.status} /><QualificationBadge lead={lead} />{lead.activity && <span className="ml-auto text-[10.5px] font-bold text-[#77727D]">{lead.activity.engagementScore}/100 activity</span>}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

