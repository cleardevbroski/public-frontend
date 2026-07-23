"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, Tag, Building2 } from "lucide-react";
import { newlyLaunchedProjects } from "./mock-data";

export default function NewlyLaunchedProjects() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 560, behavior: "smooth" });

  return (
    <section className="bg-[#EEF4FB] py-14">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="size-12 rounded-xl bg-[#121B35] flex items-center justify-center text-[#F2C052]">
              <Building2 className="size-6" />
            </span>
            <div>
              <h2 className="text-[26px] md:text-[32px] font-bold text-[#121B35]">
                Newly launched <span className="text-gold-gradient">projects</span>
              </h2>
              <p className="text-[13px] text-[#68646F]">Less upfront payment</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollBy(-1)} className="size-10 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center shadow-sm hover:border-[#DDAA42] transition-all" aria-label="Scroll left">
              <ChevronLeft className="size-5 text-[#121B35]" />
            </button>
            <button onClick={() => scrollBy(1)} className="size-10 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center shadow-sm hover:border-[#DDAA42] transition-all" aria-label="Scroll right">
              <ChevronRight className="size-5 text-[#121B35]" />
            </button>
          </div>
        </div>

        <div ref={scrollerRef} className="flex gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
          {newlyLaunchedProjects.map((p) => (
            <div key={p.id} className="shrink-0 w-[460px] max-w-[88vw] bg-white shadow-sm border border-[#E4E0E7]/50 overflow-hidden">
              <div className="p-5">
                <div className="relative inline-block">
                  <span className="absolute -left-5 -top-2 bg-[#FAEBC8] text-[#7A5B12] text-[10px] font-bold px-2 py-1 rounded-r-md shadow-sm">{p.tag}</span>
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="relative shrink-0">
                    <img src={p.image} alt={p.name} className="size-20 rounded-full object-cover border border-[#E4E0E7]" />
                    {p.rera && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 inline-flex items-center gap-0.5 bg-[#121B35] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        <ShieldCheck className="size-2.5" /> RERA
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[18px] font-bold text-[#121B35] truncate">{p.name}</h3>
                    <p className="text-[13px] text-[#68646F] truncate">{p.locality}</p>
                    <p className="text-[14px] font-bold text-[#121B35] mt-1">
                      {p.price} <span className="text-[12px] font-medium text-[#68646F]">| {p.config}</span>
                    </p>
                    <p className="text-[12px] font-semibold text-[#1E7A46] mt-1 truncate">{p.priceTrend}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-dashed border-[#E4E0E7] px-5 py-3 bg-[#FDFCFD]">
                <span className="flex items-center gap-1.5 text-[12px] text-[#68646F]">
                  <Tag className="size-3.5 text-[#DDAA42]" /> Preferred options @zero brokerage
                </span>
                <button className="btn-gold text-[13px] font-bold px-4 py-2 rounded-lg whitespace-nowrap">View Number</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
