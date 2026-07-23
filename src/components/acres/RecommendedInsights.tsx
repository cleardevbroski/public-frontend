"use client";
import { useEffect, useRef, useState } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Map, BarChart3 } from "lucide-react";
import { localityInsights as fallbackInsights } from "./mock-data";
import { fetchInsights } from "@/lib/api";

export default function RecommendedInsights() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  const [items, setItems] = useState(fallbackInsights);

  useEffect(() => {
    fetchInsights({ status: "approved" })
      .then((rows: any[]) => { if (Array.isArray(rows) && rows.length) setItems(rows); })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-white py-14">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#DDAA42]">
              <BarChart3 className="size-4" /> Based on your search history
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#121B35] mt-1">
              Recommended <span className="text-gold-gradient">Insights</span>
            </h2>
          </div>
          <Link href="/property-rates-and-price-trends-in-bangalore-prffid" className="text-[14px] font-bold text-[#DDAA42] border border-[#DDAA42]/40 hover:bg-[#FFF8E8] px-5 py-2.5 rounded-xl transition-colors">
            View all Insights
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => scrollBy(-1)} className="hidden md:flex size-10 rounded-full bg-white border border-[#E4E0E7] items-center justify-center shadow-sm hover:border-[#DDAA42] transition-all shrink-0" aria-label="Scroll left">
            <ChevronLeft className="size-5 text-[#121B35]" />
          </button>
          <div ref={scrollerRef} className="flex gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
            {items.map((l) => (
              <Link key={(l as any)._id ?? l.name} href={l.href} className="group shrink-0 w-[280px]">
                <div className="relative h-[200px] rounded-2xl overflow-hidden bg-[#F3F1F5] border border-[#E4E0E7]/60">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#E7F0FA,transparent),radial-gradient(circle_at_70%_70%,#F4EFE3,transparent)]" />
                  <span className="absolute top-3 right-3 size-7 rounded-md bg-white/80 flex items-center justify-center text-[#68646F]">
                    <Map className="size-4" />
                  </span>
                  <img src={l.image} alt={l.name} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] size-24 rounded-full object-cover border-4 border-white shadow" />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <h3 className="text-[20px] font-bold text-[#121B35]">{l.name}</h3>
                    <p className="text-[12px] font-semibold text-[#68646F]">Bangalore</p>
                  </div>
                </div>
                <p className="text-[15px] font-bold text-[#121B35] mt-3 group-hover:text-[#DDAA42] transition-colors">{l.name} Insights</p>
                <p className="text-[12px] text-[#68646F]">Locality Insight</p>
              </Link>
            ))}
          </div>
          <button onClick={() => scrollBy(1)} className="hidden md:flex size-10 rounded-full bg-white border border-[#E4E0E7] items-center justify-center shadow-sm hover:border-[#DDAA42] transition-all shrink-0" aria-label="Scroll right">
            <ChevronRight className="size-5 text-[#121B35]" />
          </button>
        </div>
      </div>
    </section>
  );
}
