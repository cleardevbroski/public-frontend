import { BadgeCheck, Compass, ShieldCheck } from "lucide-react";

const records = [
  { icon: ShieldCheck, title: "Project records", sub: "Facts and missing fields shown openly" },
  { icon: BadgeCheck, title: "RERA references", sub: "Phase numbers shown when available" },
  { icon: Compass, title: "Verified pins", sub: "Only confirmed coordinates receive the badge" },
];

export default function ProjectTrustStrip({ placement = "hero" }: { placement?: "hero" | "below-properties" }) {
  const inHero = placement === "hero";
  return <div role="region" aria-label="Project information" className={inHero ? "mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5" : "home-project-trust"}>
    {records.map(({ icon: Icon, title, sub }) => <div key={title} className={inHero ? "flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3.5 rounded-xl" : "flex items-center gap-3 py-3"}>
      <div className={inHero ? "size-10 bg-[#DDAA42]/20 border border-[#DDAA42]/30 flex items-center justify-center shrink-0 rounded-lg" : "grid size-10 shrink-0 place-items-center rounded-lg bg-[#FFF4D8] text-[#805A0B]"}><Icon className={inHero ? "size-5 text-[#F2C052]" : "size-5"} /></div>
      <div className="leading-tight"><p className={inHero ? "text-[13.5px] font-bold text-white" : "text-sm font-bold text-[#121B35]"}>{title}</p><p className={inHero ? "text-[11px] text-white/55" : "mt-1 text-xs text-[#68646F]"}>{sub}</p></div>
    </div>)}
  </div>;
}
