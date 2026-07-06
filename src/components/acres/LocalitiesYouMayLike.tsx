"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Building2, MapPin } from "lucide-react";
import { getPropertiesByLocality } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";
import type { Property } from "./mock-data";

const localityImages: Record<string, string> = {
  East: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  West: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  North: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80",
  South: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80",
  Central: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
};
const fallbackImg = "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80";

type Group = { zone: string; count: number; sample: Property };

export default function LocalitiesYouMayLike() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });

  const groups = useLiveProperties<Group[]>(() => getPropertiesByLocality(), []);

  if (groups.length === 0) return null;

  return (
    <section className="bg-white py-14">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#D4AF37]">
              <MapPin className="size-4" /> Neighbourhood Insights
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#1E3A8A] mt-1">
              Localities you <span className="text-gold-gradient">may like</span>
            </h2>
            <p className="text-[13px] text-[#6E7488] mt-1">
              Based on the localities popular in Bangalore East
            </p>
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
          {groups.map(({ zone, count, sample }) => {
            const href = `/property-in-bangalore-${zone.toLowerCase()}-ffid`;
            return (
              <div key={zone} className="shrink-0 w-[360px] bg-white border border-[#D5DEF2]/60 shadow-sm hover:shadow-lg transition-all overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <img src={localityImages[zone] || fallbackImg} alt={zone} className="size-16 rounded-full object-cover border border-[#D5DEF2]" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[17px] font-bold text-[#1E3A8A] truncate">{zone} Bangalore</h3>
                    </div>
                    <p className="text-[13px] text-[#243559] mt-1 flex items-center gap-1.5">
                      {sample.pricePerSqft && <span className="font-semibold">{sample.pricePerSqft}</span>}
                      <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#1E7A46]">
                        <Building2 className="size-3.5" /> {count} {count === 1 ? "Property" : "Properties"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 border-t border-[#D5DEF2]/50 divide-x divide-[#D5DEF2]/50">
                  <Link href={href} className="py-3 text-center text-[13px] font-bold text-[#D4AF37] hover:bg-[#FAF3E2] transition-colors">Insights</Link>
                  <Link href={href} className="py-3 text-center text-[13px] font-bold text-[#D4AF37] hover:bg-[#FAF3E2] transition-colors">Properties</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
