"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { offerProjects } from "./mock-data";

export default function OffersForYou() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 560, behavior: "smooth" });

  return (
    <section className="bg-[#F1F5FF] py-14">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#D4AF37]">
              <Gift className="size-4" /> Limited period
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#1E3A8A] mt-1">
              Offers <span className="text-gold-gradient">for you</span>
            </h2>
            <p className="text-[13px] text-[#6E7488] mt-1">Projects with ongoing offers in Bangalore East</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollBy(-1)} className="size-10 rounded-full bg-white border border-[#D5DEF2] flex items-center justify-center shadow-sm hover:border-[#D4AF37] transition-all" aria-label="Scroll left">
              <ChevronLeft className="size-5 text-[#1E3A8A]" />
            </button>
            <button onClick={() => scrollBy(1)} className="size-10 rounded-full bg-white border border-[#D5DEF2] flex items-center justify-center shadow-sm hover:border-[#D4AF37] transition-all" aria-label="Scroll right">
              <ChevronRight className="size-5 text-[#1E3A8A]" />
            </button>
          </div>
        </div>

        <div ref={scrollerRef} className="flex gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
          {offerProjects.map((p) => (
            <div key={p.id} className="shrink-0 w-[420px] max-w-[88vw] bg-white border border-[#D5DEF2]/50 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <img src={p.image} alt={p.name} className="size-20 rounded-full object-cover border border-[#D5DEF2]" />
                <div className="min-w-0">
                  <h3 className="text-[18px] font-bold text-[#1E3A8A] truncate">{p.name}</h3>
                  <p className="text-[13px] text-[#6E7488]">{p.locality}</p>
                  <p className="text-[13px] text-[#6E7488]">{p.config}</p>
                  <p className="text-[16px] font-extrabold text-[#1E3A8A] mt-1">{p.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-dashed border-[#D5DEF2] px-5 py-3 bg-[#EEF4FB]">
                <Gift className="size-4 text-[#D4AF37]" />
                <span className="text-[13px] font-semibold text-[#1E3A8A] truncate">{p.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
