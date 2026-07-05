"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Map, BarChart3 } from "lucide-react";
import { localityInsights } from "./mock-data";

export default function RecommendedInsights() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });

  return (
    <section className="bg-white py-14">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#D4AF37]">
              <BarChart3 className="size-4" /> Based on your search history
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#1E3A8A] mt-1">
              Recommended <span className="text-gold-gradient">Insights</span>
            </h2>
          </div>
          <Link href="/property-rates-and-price-trends-in-bangalore-prffid" className="text-[14px] font-bold text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#FAF3E2] px-5 py-2.5 rounded-xl transition-colors">
            View all Insights
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => scrollBy(-1)} className="hidden md:flex size-10 rounded-full bg-white border border-[#D5DEF2] items-center justify-center shadow-sm hover:border-[#D4AF37] transition-all shrink-0" aria-label="Scroll left">
            <ChevronLeft className="size-5 text-[#1E3A8A]" />
          </button>
          <div ref={scrollerRef} className="flex gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
            {localityInsights.map((l) => (
              <Link key={l.name} href={l.href} className="group shrink-0 w-[280px]">
                <div className="relative h-[200px] rounded-2xl overflow-hidden bg-[#E2E9FB] border border-[#D5DEF2]/60">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#E7F0FA,transparent),radial-gradient(circle_at_70%_70%,#F4EFE3,transparent)]" />
                  <span className="absolute top-3 right-3 size-7 rounded-md bg-white/80 flex items-center justify-center text-[#6E7488]">
                    <Map className="size-4" />
                  </span>
                  <img src={l.image} alt={l.name} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] size-24 rounded-full object-cover border-4 border-white shadow" />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <h3 className="text-[20px] font-bold text-[#1E3A8A]">{l.name}</h3>
                    <p className="text-[12px] font-semibold text-[#6E7488]">Bangalore</p>
                  </div>
                </div>
                <p className="text-[15px] font-bold text-[#1E3A8A] mt-3 group-hover:text-[#D4AF37] transition-colors">{l.name} Insights</p>
                <p className="text-[12px] text-[#6E7488]">Locality Insight</p>
              </Link>
            ))}
          </div>
          <button onClick={() => scrollBy(1)} className="hidden md:flex size-10 rounded-full bg-white border border-[#D5DEF2] items-center justify-center shadow-sm hover:border-[#D4AF37] transition-all shrink-0" aria-label="Scroll right">
            <ChevronRight className="size-5 text-[#1E3A8A]" />
          </button>
        </div>
      </div>
    </section>
  );
}
