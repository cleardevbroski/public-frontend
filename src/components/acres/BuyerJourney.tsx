import { ArrowRight, Calculator, FolderHeart, MessagesSquare, WandSparkles } from "lucide-react";
import Link from "@/components/Link";

const paths = [
  { icon: WandSparkles, label: "Find my home", copy: "Answer six questions and see ranked matches before sharing contact details.", href: "/find-my-home", accent: true },
  { icon: Calculator, label: "Understand total cost", copy: "Open a project to estimate government charges, initial payment, loan and EMI.", href: "/property-in-bangalore-ffid", accent: false },
  { icon: FolderHeart, label: "Build a shortlist", copy: "Save promising projects and return to them from your verified account.", href: "/account/saved-properties", accent: false },
  { icon: MessagesSquare, label: "Decide with family", copy: "Compare projects, vote, keep notes and discuss them through one secure workspace.", href: "/find-my-home", accent: false },
] as const;

export default function BuyerJourney() {
  return (
    <section className="buyer-journey" aria-labelledby="buyer-journey-title">
      <div className="public-container py-8 sm:py-11">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_2.2fr] lg:items-end">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#805A0B]">Start with your decision</p><h2 id="buyer-journey-title" className="display-heading mt-2 text-[30px] text-[#12172B] sm:text-[38px]">Four useful ways to begin.</h2><p className="mt-3 max-w-[42ch] text-[13px] leading-6 text-[#68646F]">Use the path that matches what you know today. You can move between tools without losing the projects you saved.</p></div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{paths.map(({ icon: Icon, label, copy, href, accent }) => <Link key={label} href={href} className={`public-interactive group flex min-h-[166px] flex-col rounded-[18px] p-4 ${accent ? "bg-[#121B35] text-white shadow-[0_16px_40px_rgba(18,27,53,.18)]" : "border border-[#E4E0E7] bg-white text-[#12172B]"}`}><span className={`grid size-9 place-items-center rounded-xl ${accent ? "bg-[#DDAA42] text-[#121B35]" : "bg-[#FFF8E8] text-[#805A0B]"}`}><Icon className="size-4.5" /></span><h3 className="mt-4 text-[14px] font-bold">{label}</h3><p className={`mt-1 text-[11px] leading-5 ${accent ? "text-[#D9DDE8]" : "text-[#68646F]"}`}>{copy}</p><ArrowRight className={`mt-auto size-4 self-end transition group-hover:translate-x-1 ${accent ? "text-[#F2C052]" : "text-[#805A0B]"}`} /></Link>)}</div>
        </div>
      </div>
    </section>
  );
}
