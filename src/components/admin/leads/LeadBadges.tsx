import { CheckCircle2, CircleAlert, Flame, Minus } from "lucide-react";
import { qualificationLabels, statusLabels, type Lead, type LeadStatus, type QualificationLevel } from "./types";

const statusStyles: Record<LeadStatus, string> = {
  new: "border-[#DDAA42]/25 bg-[#FFF8E8] text-[#8A5B00]",
  contacted: "border-[#47648E]/20 bg-[#EEF3FA] text-[#294B78]",
  qualified: "border-[#18794E]/20 bg-[#ECF8F1] text-[#14633F]",
  closed: "border-[#74717A]/20 bg-[#F3F4F6] text-[#5B5961]",
};

const levelStyles: Record<QualificationLevel, string> = {
  unassessed: "border-[#D8D5DB] bg-[#F7F7F8] text-[#68646F]",
  low: "border-[#D8D5DB] bg-[#F7F7F8] text-[#68646F]",
  warm: "border-[#DDAA42]/25 bg-[#FFF8E8] text-[#8A5B00]",
  high: "border-[#E0574F]/20 bg-[#FFF1EF] text-[#B53A33]",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[status]}`}>{statusLabels[status]}</span>;
}

export function QualificationBadge({ lead }: { lead: Lead }) {
  const Icon = lead.qualificationLevel === "high" ? Flame : lead.qualificationLevel === "warm" ? CircleAlert : lead.qualificationLevel === "low" ? Minus : CheckCircle2;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${levelStyles[lead.qualificationLevel]}`}>
      <Icon className="size-3" />
      {qualificationLabels[lead.qualificationLevel]}
      {lead.qualificationScore > 0 ? ` · ${lead.qualificationScore}` : ""}
    </span>
  );
}

