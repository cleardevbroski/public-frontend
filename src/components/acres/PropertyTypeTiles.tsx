"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Building } from "lucide-react";
import { propertyTypeTiles } from "./mock-data";

export default function PropertyTypeTiles() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });

  return (
    <section className="bg-white py-14">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#DDAA42]">
              <Building className="size-4" /> Browse by type
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#121B35] mt-1">
              Apartments, Villas <span className="text-gold-gradient">and more</span>
            </h2>
            <p className="text-[13px] text-[#68646F] mt-1">in Bangalore</p>
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
          {propertyTypeTiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="group shrink-0 w-[300px] h-[360px] overflow-hidden relative flex flex-col border border-[#E4E0E7]/50 shadow-sm hover:shadow-xl transition-all"
              style={{ backgroundColor: tile.tint }}
            >
              <div className="p-6 relative z-10">
                <h3 className="text-[24px] font-bold text-[#121B35] leading-tight">{tile.label}</h3>
                <p className="text-[14px] text-[#68646F] font-semibold mt-1">{tile.count}</p>
              </div>
              <div className="mt-auto h-[200px] relative">
                <img src={tile.image} alt={tile.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
