import { ChevronRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { QualificationBadge, StatusBadge } from "./LeadBadges";
import { leadId, sourceLabels, type Lead } from "./types";

type Props = {
  leads: Lead[];
  busyId: string;
  onOpen: (lead: Lead) => void;
  onStatus: (lead: Lead, status: Lead["status"]) => void;
};

function relativeDate(value?: string) {
  if (!value) return "No activity";
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  if (elapsed < 60_000) return "Just now";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}m ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}h ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function whatsappHref(phone?: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
}

export default function LeadTable({ leads, busyId, onOpen, onStatus }: Props) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full min-w-[1120px] table-fixed text-left">
        <thead>
          <tr className="border-b border-[#E7E5E9] bg-[#FAF9FB] text-[10px] font-bold uppercase tracking-[0.12em] text-[#827D88]">
            <th className="w-[22%] px-5 py-3.5">Customer</th>
            <th className="w-[22%] px-5 py-3.5">Interested property</th>
            <th className="w-[15%] px-5 py-3.5">Engagement</th>
            <th className="w-[13%] px-5 py-3.5">Qualification</th>
            <th className="w-[12%] px-5 py-3.5">Source</th>
            <th className="w-[10%] px-5 py-3.5">Last activity</th>
            <th className="w-[6%] px-4 py-3.5 text-right">Open</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ECEAEE]">
          {leads.map((lead) => {
            const id = leadId(lead);
            const property = lead.propertyTitle || lead.activity?.topProperty?.propertyTitle;
            const location = lead.propertyLocation || lead.activity?.topProperty?.location;
            const whatsapp = whatsappHref(lead.phone);
            return (
              <tr key={id} className="group bg-white transition hover:bg-[#FCFBF8]">
                <td className="px-5 py-4 align-middle">
                  <button type="button" onClick={() => onOpen(lead)} className="block max-w-full text-left">
                    <span className="block truncate text-[13px] font-bold text-[#121B35] group-hover:text-[#7B570D]">{lead.name}</span>
                    <span className="mt-1 block truncate text-[11.5px] text-[#77727D]">{lead.phone || lead.email || "Contact not supplied"}</span>
                  </button>
                  <div className="mt-2 flex items-center gap-1.5">
                    <StatusBadge status={lead.status} />
                    {lead.email && <a href={`mailto:${lead.email}`} aria-label={`Email ${lead.name}`} className="rounded-lg p-1.5 text-[#77727D] hover:bg-[#F0EEF2] hover:text-[#121B35]"><Mail className="size-3.5" /></a>}
                    {whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${lead.name}`} className="rounded-lg p-1.5 text-[#77727D] hover:bg-[#ECF8F1] hover:text-[#14633F]"><MessageCircle className="size-3.5" /></a>}
                  </div>
                </td>
                <td className="px-5 py-4 align-middle">
                  {property ? <><p className="line-clamp-2 text-[12.5px] font-semibold leading-[18px] text-[#27233A]">{property}</p>{location && <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[#85808A]"><MapPin className="size-3 shrink-0" /> {location}</p>}</> : <span className="text-[12px] text-[#9A96A0]">General enquiry</span>}
                </td>
                <td className="px-5 py-4 align-middle">
                  {lead.activity ? <div><div className="flex items-center justify-between text-[11px]"><span className="font-bold text-[#121B35]">{lead.activity.engagementScore}/100</span><span className="text-[#77727D]">{lead.activity.totalPropertyViews} views</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ECEAEE]"><div className="h-full rounded-full bg-[#DDAA42]" style={{ width: `${Math.min(100, lead.activity.engagementScore)}%` }} /></div><p className="mt-1.5 text-[10.5px] text-[#8A8590]">{Math.max(1, Math.round(lead.activity.totalActiveSeconds / 60))} min active</p></div> : <span className="text-[11.5px] text-[#9A96A0]">No matched activity</span>}
                </td>
                <td className="px-5 py-4 align-middle"><QualificationBadge lead={lead} /></td>
                <td className="px-5 py-4 align-middle"><span className="text-[11.5px] font-semibold leading-4 text-[#5E5964]">{sourceLabels[lead.source] || "Manual entry"}</span></td>
                <td className="px-5 py-4 align-middle"><p className="text-[11.5px] font-semibold text-[#3D3945]">{relativeDate(lead.activity?.lastActivityAt || lead.updatedAt || lead.createdAt)}</p><select disabled={busyId === id} value={lead.status} onChange={(event) => onStatus(lead, event.target.value as Lead["status"])} className="mt-1.5 max-w-full bg-transparent text-[10.5px] font-semibold text-[#7B570D] outline-none disabled:opacity-50"><option value="new">New</option><option value="contacted">Contacted</option><option value="qualified">Qualified</option><option value="closed">Closed</option></select></td>
                <td className="px-4 py-4 text-right align-middle"><button type="button" onClick={() => onOpen(lead)} className="inline-grid size-9 place-items-center rounded-xl border border-[#E5E2E7] text-[#68646F] transition hover:border-[#DDAA42]/50 hover:bg-[#FFF9EC] hover:text-[#7B570D]" aria-label={`View ${lead.name}`}><ChevronRight className="size-4" /></button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
