"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Heart, ShieldCheck, TrendingUp } from "lucide-react";
import { searchTrendProjects } from "./mock-data";

export default function SearchTrends() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });

  return (
    <section className="bg-white py-14">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#D4AF37]">
              <TrendingUp className="size-4" /> Trending now
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#1E3A8A] mt-1">
              Based on <span className="text-gold-gradient">search trends</span>
            </h2>
            <p className="text-[13px] text-[#6E7488] mt-1">Other city projects Bangalore East buyers considered</p>
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
          {searchTrendProjects.map((p) => (
            <Link key={p.id} href="/new-projects-in-bangalore-ffid" className="group shrink-0 w-[360px] max-w-[85vw]">
              <div className="relative h-[210px] overflow-hidden shadow-sm">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                {p.rera && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/90 text-[#1E7A46] text-[10px] font-bold px-2 py-1 rounded">
                    <ShieldCheck className="size-3" /> RERA
                  </span>
                )}
                <button className="absolute top-3 right-3 size-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:text-red-500" aria-label="Shortlist" onClick={(e) => e.preventDefault()}>
                  <Heart className="size-4 text-[#1E3A8A]" />
                </button>
                {p.status && (
                  <span className="absolute bottom-3 left-3 text-white text-[13px] font-bold drop-shadow">{p.status}</span>
                )}
              </div>
              <h3 className="text-[17px] font-bold text-[#1E3A8A] mt-3 group-hover:text-[#D4AF37] transition-colors truncate">{p.name}</h3>
              <p className="text-[13px] text-[#6E7488] truncate">{p.locality}</p>
              <p className="text-[16px] font-extrabold text-[#1E3A8A] mt-1">{p.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
