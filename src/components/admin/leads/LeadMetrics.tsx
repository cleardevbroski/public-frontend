import { BadgeCheck, ContactRound, Sparkles, UsersRound } from "lucide-react";
import type { LeadMetricsData } from "./types";

const cards = [
  { key: "total", label: "Total leads", icon: UsersRound, tone: "bg-[#EEF2F8] text-[#294B78]" },
  { key: "new", label: "New", icon: Sparkles, tone: "bg-[#FFF8E8] text-[#8A5B00]" },
  { key: "contacted", label: "Contacted", icon: ContactRound, tone: "bg-[#F0F3F8] text-[#47648E]" },
  { key: "qualified", label: "Qualified", icon: BadgeCheck, tone: "bg-[#ECF8F1] text-[#14633F]" },
] as const;

export default function LeadMetrics({ metrics, loading }: { metrics: LeadMetricsData; loading: boolean }) {
  return (
    <section aria-label="Lead summary" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, tone }) => (
        <article key={key} className="rounded-[18px] border border-[#E7E5E9] bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold text-[#77727D]">{label}</p>
              {loading ? <div className="mt-2 h-8 w-14 animate-pulse rounded bg-[#ECEAF0]" /> : <p className="mt-1 text-[26px] font-bold tracking-[-0.04em] text-[#121B35]">{metrics[key].toLocaleString("en-IN")}</p>}
            </div>
            <span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-[18px]" /></span>
          </div>
        </article>
      ))}
    </section>
  );
}

