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
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#D4AF37]">
              <Building className="size-4" /> Browse by type
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#1E3A8A] mt-1">
              Apartments, Villas <span className="text-gold-gradient">and more</span>
            </h2>
            <p className="text-[13px] text-[#6E7488] mt-1">in Bangalore</p>
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
          {propertyTypeTiles.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              className="group shrink-0 w-[300px] h-[360px] overflow-hidden relative flex flex-col border border-[#D5DEF2]/50 shadow-sm hover:shadow-xl transition-all"
              style={{ backgroundColor: t.tint }}
            >
              <div className="p-6 relative z-10">
                <h3 className="text-[24px] font-bold text-[#1E3A8A] leading-tight">{t.label}</h3>
                <p className="text-[14px] text-[#6E7488] font-semibold mt-1">{t.count}</p>
              </div>
              <div className="mt-auto h-[200px] relative">
                <img src={t.image} alt={t.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
