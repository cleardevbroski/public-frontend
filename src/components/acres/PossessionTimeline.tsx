"use client";
import Link from "@/components/Link";
import { CalendarClock } from "lucide-react";
import { possessionTiles } from "./mock-data";

export default function PossessionTimeline() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-center gap-3 mb-5">
          <span className="size-11 rounded-xl bg-[#F1F5FF] border border-[#D5DEF2] flex items-center justify-center text-[#D4AF37] shadow-sm">
            <CalendarClock className="size-6" />
          </span>
          <div>
            <h2 className="text-[24px] md:text-[28px] font-bold text-[#1E3A8A]">Move in now, next year or later</h2>
            <p className="text-[13px] text-[#6E7488]">Projects based on your preferred possession date</p>
          </div>
        </div>
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2">
          {possessionTiles.map((t) => (
            <Link key={t.label} href={t.href} className="group shrink-0 w-[300px] h-[230px] overflow-hidden relative flex flex-col border border-[#D5DEF2]/50 shadow-sm hover:shadow-xl transition-all" style={{ backgroundColor: t.tint }}>
              <div className="p-5 relative z-10">
                <h3 className="text-[22px] font-bold text-[#1E3A8A] leading-tight">{t.label}</h3>
                <p className="text-[13px] text-[#6E7488] font-semibold mt-1">{t.count}</p>
              </div>
              <div className="mt-auto h-[120px] relative">
                <img src={t.image} alt={t.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
