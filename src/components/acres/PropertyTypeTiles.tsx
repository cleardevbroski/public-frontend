"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Building } from "lucide-react";
import { getPropertiesByType } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";

const typeStyles: Record<string, { image: string; tint: string }> = {
  Apartment: { image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80", tint: "#FDF3DE" },
  Villa: { image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80", tint: "#E9F3EA" },
  Penthouse: { image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80", tint: "#EDEAF6" },
  Plot: { image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80", tint: "#FCE9E2" },
  Commercial: { image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80", tint: "#E2EFF7" },
  "Independent House": { image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80", tint: "#F3EEE4" },
};
const fallbackStyle = { image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=600&q=80", tint: "#EEF2FB" };

type Group = { type: string; count: number };

export default function PropertyTypeTiles() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });

  const groups = useLiveProperties<Group[]>(
    () => getPropertiesByType().map(({ type, count }) => ({ type, count })),
    []
  );

  if (groups.length === 0) return null;

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
          {groups.map(({ type, count }) => {
            const style = typeStyles[type] || fallbackStyle;
            return (
              <Link
                key={type}
                href="/property-in-bangalore-ffid"
                className="group shrink-0 w-[300px] h-[360px] overflow-hidden relative flex flex-col border border-[#D5DEF2]/50 shadow-sm hover:shadow-xl transition-all"
                style={{ backgroundColor: style.tint }}
              >
                <div className="p-6 relative z-10">
                  <h3 className="text-[24px] font-bold text-[#1E3A8A] leading-tight">{type}</h3>
                  <p className="text-[14px] text-[#6E7488] font-semibold mt-1">
                    {count} {count === 1 ? "Property" : "Properties"}
                  </p>
                </div>
                <div className="mt-auto h-[200px] relative">
                  <img src={style.image} alt={type} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
