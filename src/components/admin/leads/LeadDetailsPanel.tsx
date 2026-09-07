import { useEffect, useState } from "react";
import { Check, ExternalLink, Mail, MapPin, MessageCircle, Save, Trash2, UserCheck, X } from "lucide-react";
import Link from "@/components/Link";
import { QualificationBadge, StatusBadge } from "./LeadBadges";
import { qualificationLabels, sourceLabels, type Lead, type QualificationLevel } from "./types";

type Props = {
  lead: Lead | null;
  saving: boolean;
  onClose: () => void;
  onStatus: (lead: Lead, status: Lead["status"]) => Promise<void>;
  onQualification: (lead: Lead, data: { score: number; level: QualificationLevel; reasons: string[] }) => Promise<void>;
  onNote: (lead: Lead, data: { note: string; assignedTo?: string }) => Promise<void>;
  onDelete: (lead: Lead) => void;
};

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Not recorded";
}

function whatsappHref(phone?: string) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}` : "";
}

export default function LeadDetailsPanel({ lead, saving, onClose, onStatus, onQualification, onNote, onDelete }: Props) {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState<QualificationLevel>("unassessed");
  const [reasons, setReasons] = useState("");
  const [note, setNote] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (!lead) return;
    setScore(lead.qualificationScore || 0);
    setLevel(lead.qualificationLevel || "unassessed");
    setReasons((lead.qualificationReasons || []).join("\n"));
    setNote(lead.followUpNote || "");
    setAssignedTo(lead.assignedTo || "");
  }, [lead]);

  if (!lead) return null;
  const property = lead.propertyTitle || lead.activity?.topProperty?.propertyTitle;
  const location = lead.propertyLocation || lead.activity?.topProperty?.location;
  const whatsapp = whatsappHref(lead.phone);

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={`Lead details for ${lead.name}`}>
      <button type="button" aria-label="Close lead details" onClick={onClose} className="absolute inset-0 bg-[#091024]/45 backdrop-blur-[2px]" />
      <aside className="absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col overflow-hidden rounded-t-[26px] bg-[#F8F7F9] shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[520px] sm:rounded-none sm:border-l sm:border-[#E1DEE5]">
        <header className="flex items-start justify-between gap-4 border-b border-[#E5E2E7] bg-white px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7427]">Lead profile</p>
            <h2 className="mt-1 truncate text-[20px] font-bold tracking-[-0.02em] text-[#121B35]">{lead.name}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5"><StatusBadge status={lead.status} /><QualificationBadge lead={lead} /></div>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#E5E2E7] text-[#68646F] hover:bg-[#F4F2F5]" aria-label="Close"><X className="size-4" /></button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          <section className="rounded-[18px] border border-[#E7E5E9] bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8A8590]">Contact</p><p className="mt-1 text-[12.5px] font-semibold text-[#29253B]">{lead.phone || "Phone missing"}</p><p className="mt-1 break-all text-[11.5px] text-[#77727D]">{lead.email || "Email missing"}</p></div>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8A8590]">Source</p><p className="mt-1 text-[12.5px] font-semibold text-[#29253B]">{sourceLabels[lead.source]}</p><p className="mt-1 text-[11.5px] text-[#77727D]">Received {formatDate(lead.createdAt)}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E1DEE5] px-3 text-[11.5px] font-bold text-[#3D3945] hover:bg-[#F5F3F6]"><Mail className="size-3.5" /> Email</a>}
              {whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#BFE4CD] bg-[#F1FBF5] px-3 text-[11.5px] font-bold text-[#14633F]"><MessageCircle className="size-3.5" /> WhatsApp</a>}
              {lead.status === "new" && <button disabled={saving} type="button" onClick={() => onStatus(lead, "contacted")} className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#121B35] px-3 text-[11.5px] font-bold text-white disabled:opacity-50"><UserCheck className="size-3.5" /> Mark contacted</button>}
            </div>
          </section>

          <section className="rounded-[18px] border border-[#E7E5E9] bg-white p-4">
            <div className="flex items-start justify-between gap-3"><div><h3 className="text-[13px] font-bold text-[#121B35]">Property interest</h3><p className="mt-0.5 text-[11px] text-[#8A8590]">The explicit enquiry or most-viewed project</p></div>{lead.propertyId && <Link href={`/property/${lead.propertyId}`} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8A620F]">Open property <ExternalLink className="size-3" /></Link>}</div>
            {property ? <div className="mt-3 rounded-xl bg-[#FAF8F3] p-3"><p className="text-[13px] font-bold text-[#29253B]">{property}</p>{location && <p className="mt-1 flex items-start gap-1.5 text-[11.5px] text-[#77727D]"><MapPin className="mt-0.5 size-3 shrink-0 text-[#DDAA42]" /> {location}</p>}{lead.budget && <p className="mt-2 text-[11.5px] font-semibold text-[#5D5863]">Budget: {lead.budget}</p>}</div> : <p className="mt-3 text-[12px] text-[#8A8590]">No property has been linked to this enquiry.</p>}
            {lead.message && <div className="mt-3"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8A8590]">Enquiry</p><p className="mt-1 whitespace-pre-wrap text-[12px] leading-5 text-[#55505B]">{lead.message}</p></div>}
          </section>

          <section className="rounded-[18px] border border-[#E7E5E9] bg-white p-4">
            <div className="flex items-center justify-between gap-3"><div><h3 className="text-[13px] font-bold text-[#121B35]">Website engagement</h3><p className="mt-0.5 text-[11px] text-[#8A8590]">Matched through the customer account or phone</p></div>{lead.activity && <span className="text-[20px] font-bold tracking-[-0.03em] text-[#121B35]">{lead.activity.engagementScore}<small className="text-[10px] text-[#8A8590]">/100</small></span>}</div>
            {lead.activity ? <div className="mt-4 grid grid-cols-3 gap-2"><div className="rounded-xl bg-[#F5F3F6] p-2.5"><p className="text-[16px] font-bold text-[#121B35]">{lead.activity.visitCount}</p><p className="text-[9.5px] font-semibold text-[#817C87]">Visits</p></div><div className="rounded-xl bg-[#F5F3F6] p-2.5"><p className="text-[16px] font-bold text-[#121B35]">{lead.activity.totalPropertyViews}</p><p className="text-[9.5px] font-semibold text-[#817C87]">Property views</p></div><div className="rounded-xl bg-[#F5F3F6] p-2.5"><p className="text-[16px] font-bold text-[#121B35]">{Math.max(1, Math.round(lead.activity.totalActiveSeconds / 60))}</p><p className="text-[9.5px] font-semibold text-[#817C87]">Active minutes</p></div></div> : <p className="mt-3 text-[12px] leading-5 text-[#8A8590]">No matched browsing activity is available. This is shown openly and does not affect the stored enquiry.</p>}
          </section>

          <section className="rounded-[18px] border border-[#E7E5E9] bg-white p-4">
            <h3 className="text-[13px] font-bold text-[#121B35]">Admin qualification</h3>
            <p className="mt-0.5 text-[11px] text-[#8A8590]">Review intent using the enquiry and recorded engagement.</p>
            <div className="mt-4 grid grid-cols-[100px_1fr] gap-2">
              <label><span className="mb-1 block text-[10px] font-bold text-[#77727D]">Score</span><input type="number" min={0} max={100} value={score} onChange={(event) => setScore(Math.max(0, Math.min(100, Number(event.target.value))))} className="h-10 w-full rounded-xl border border-[#E1DEE5] px-3 text-[12px] font-semibold outline-none focus:border-[#DDAA42]" /></label>
              <label><span className="mb-1 block text-[10px] font-bold text-[#77727D]">Intent level</span><select value={level} onChange={(event) => setLevel(event.target.value as QualificationLevel)} className="h-10 w-full rounded-xl border border-[#E1DEE5] px-3 text-[12px] font-semibold outline-none focus:border-[#DDAA42]">{Object.entries(qualificationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            </div>
            <label className="mt-3 block"><span className="mb-1 block text-[10px] font-bold text-[#77727D]">Reasons, one per line</span><textarea rows={3} value={reasons} onChange={(event) => setReasons(event.target.value)} placeholder="Example: Viewed the same project several times" className="w-full resize-none rounded-xl border border-[#E1DEE5] px-3 py-2.5 text-[12px] leading-5 outline-none focus:border-[#DDAA42]" /></label>
            <button disabled={saving} type="button" onClick={() => onQualification(lead, { score, level, reasons: reasons.split("\n").map((item) => item.trim()).filter(Boolean) })} className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl bg-[#121B35] px-3.5 text-[11.5px] font-bold text-white disabled:opacity-50"><Check className="size-3.5" /> Save qualification</button>
          </section>

          <section className="rounded-[18px] border border-[#E7E5E9] bg-white p-4">
            <h3 className="text-[13px] font-bold text-[#121B35]">Internal follow-up notes</h3>
            <p className="mt-0.5 text-[11px] text-[#8A8590]">Private admin notes are not shown to the customer.</p>
            <label className="mt-3 block"><span className="mb-1 block text-[10px] font-bold text-[#77727D]">Assigned team member</span><input value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} placeholder="Optional" className="h-10 w-full rounded-xl border border-[#E1DEE5] px-3 text-[12px] outline-none focus:border-[#DDAA42]" /></label>
            <label className="mt-3 block"><span className="mb-1 block text-[10px] font-bold text-[#77727D]">Latest note</span><textarea rows={4} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add the outcome, requirement or next step" className="w-full resize-none rounded-xl border border-[#E1DEE5] px-3 py-2.5 text-[12px] leading-5 outline-none focus:border-[#DDAA42]" /></label>
            <button disabled={saving || !note.trim()} type="button" onClick={() => onNote(lead, { note: note.trim(), assignedTo: assignedTo.trim() })} className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl bg-[#DDAA42] px-3.5 text-[11.5px] font-bold text-[#121B35] disabled:opacity-50"><Save className="size-3.5" /> Save note</button>
            {lead.followUpHistory?.length ? <div className="mt-4 border-t border-[#ECEAEE] pt-3"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8A8590]">Recent notes</p><div className="mt-2 space-y-2">{[...lead.followUpHistory].reverse().slice(0, 5).map((entry, index) => <div key={entry._id || `${entry.createdAt}-${index}`} className="rounded-xl bg-[#F6F4F7] p-3"><p className="text-[11.5px] leading-5 text-[#514C56]">{entry.note}</p><p className="mt-1 text-[9.5px] font-semibold text-[#918C96]">{formatDate(entry.createdAt)}</p></div>)}</div></div> : null}
          </section>

          <button type="button" onClick={() => onDelete(lead)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[11.5px] font-bold text-[#B53A33] hover:bg-[#FFF1EF]"><Trash2 className="size-3.5" /> Delete lead</button>
        </div>
      </aside>
    </div>
  );
}
