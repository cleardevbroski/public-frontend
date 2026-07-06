"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Heart, ShieldCheck, Star } from "lucide-react";
import { getPropertiesBySection } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";
import type { Property } from "./mock-data";

function statusOf(p: Property): string {
  if (p.possession === "Ready to Move") return "Ready to Move";
  if (p.ageOfProperty === "Under Construction") return "Under Construction";
  return p.badges?.[0] || "New Launch";
}

export default function HandpickedProjects() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 620, behavior: "smooth" });

  const projects = useLiveProperties<Property[]>(() => getPropertiesBySection("Handpicked"), []);

  if (projects.length === 0) return null;

  return (
    <section className="bg-[#F1F5FF] py-14">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#D4AF37]">
              <Star className="size-4" /> Featured Projects in Bangalore East
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#1E3A8A] mt-1">
              Handpicked <span className="text-gold-gradient">Projects</span>
            </h2>
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

        <div ref={scrollerRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
          {projects.map((p) => (
            <Link key={p.id} href={`/property/${p.id}`} className="group shrink-0 w-[560px] max-w-[88vw]">
              <div className="relative h-[280px] overflow-hidden shadow-md">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <span className="absolute top-3 left-0 bg-[#D4AF37] text-[#1E3A8A] text-[11px] font-bold px-3 py-1 rounded-r-md shadow">
                  {statusOf(p)}
                </span>
                <button className="absolute top-3 right-3 size-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:text-red-500 transition-colors" aria-label="Shortlist" onClick={(e) => e.preventDefault()}>
                  <Heart className="size-4 text-[#1E3A8A]" />
                </button>
                {/* Overlapping info card */}
                <div className="absolute left-6 right-6 -bottom-px">
                  <div className="bg-white pt-10 px-5 pb-5 shadow-lg relative">
                    <div className="absolute -top-8 left-5 size-16 rounded-full bg-white border border-[#D5DEF2] shadow flex items-center justify-center text-[#1E3A8A] font-bold">
                      {p.title.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                    </div>
                    <h3 className="text-[18px] font-bold text-[#1E3A8A] truncate">{p.title}</h3>
                    <p className="text-[13px] text-[#6E7488] mt-0.5 truncate">{p.subtitle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[18px] font-extrabold text-[#1E3A8A]">{p.price}</span>
                      {p.reraRegistered && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1E7A46] bg-[#E6F2EA] px-1.5 py-0.5 rounded">
                          <ShieldCheck className="size-3" /> RERA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
