import { CalendarClock, FileCheck2, MapPinned, ShieldCheck } from "lucide-react";
import type { Property } from "./mock-data";

function dateLabel(value?: string) {
  if (!value) return "Update date missing";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : `Updated ${date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
}

export default function PropertyTrustSummary({ property, onRera, onLocation }: { property: Property; onRera?: () => void; onLocation?: () => void }) {
  const phases = property.reraPhases?.filter((phase) => phase.reraNumber)?.length || 0;
  const documents = property.reraPhases?.reduce((sum, phase) => sum + (phase.projectDocuments?.length || 0), 0) || 0;
  const verifiedPin = property.locationVerification?.status === "admin_verified";
  const items = [
    { icon: ShieldCheck, label: property.verified ? "Admin reviewed" : "Review status", value: property.verified ? "Project information reviewed" : "Verification not confirmed", tone: property.verified ? "good" : "warn" },
    { icon: FileCheck2, label: "RERA record", value: phases ? `${phases} phase${phases === 1 ? "" : "s"} with number` : property.reraRegistered ? "Phase number missing" : "Not supplied", tone: phases ? "good" : "warn", action: phases ? onRera : undefined },
    { icon: MapPinned, label: "Project location", value: verifiedPin ? "Verified Pin" : "Exact pin not verified", tone: verifiedPin ? "good" : "warn", action: onLocation },
    { icon: CalendarClock, label: "Project files", value: documents ? `${documents} document${documents === 1 ? "" : "s"} available` : dateLabel(property.updatedAt || property.createdAt), tone: documents ? "good" : "neutral" },
  ];
  return (
    <section className="border-b border-[#E4E0E7] bg-[#FFFDF8]" aria-label="Project trust summary">
      <div className="public-container grid grid-cols-2 divide-x divide-y divide-[#E8E3D9] sm:grid-cols-4 sm:divide-y-0">{items.map(({ icon: Icon, label, value, tone, action }) => { const content = <><span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone === "good" ? "bg-[#ECF8F1] text-[#14633F]" : tone === "warn" ? "bg-[#FFF4DB] text-[#8A5B00]" : "bg-[#F2F0F3] text-[#68646F]"}`}><Icon className="size-4" /></span><span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-[0.11em] text-[#68646F]">{label}</span><span className="mt-0.5 block text-[11px] font-semibold leading-4 text-[#12172B]">{value}</span></span></>; return action ? <button key={label} type="button" onClick={action} className="flex min-h-[80px] items-center gap-2.5 p-3 text-left transition hover:bg-white">{content}</button> : <div key={label} className="flex min-h-[80px] items-center gap-2.5 p-3">{content}</div>; })}</div>
    </section>
  );
}
