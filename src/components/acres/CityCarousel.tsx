"use client";
import Link from "@/components/Link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import PropertyCard from "./PropertyCard";
import { cityListings } from "./mock-data";

const tabs = ["Buy", "Rent", "PG/Co-Living", "Commercial Buy", "Commercial Lease"];

export default function CityCarousel({ city }: { city: string }) {
  const [tab, setTab] = useState("Buy");
  const ref = useRef<HTMLDivElement>(null);
  const listings = cityListings[city] ?? [];
  const scrollBy = (d: 1 | -1) => ref.current?.scrollBy({ left: d * 640, behavior: "smooth" });
  return (
    <section className="max-w-[1200px] mx-auto px-3 mb-12">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[20px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
          {city} <span className="text-[#3F3D46] font-normal text-[15px]">— Top Properties</span>
        </h2>
        <Link href="/property-in-bangalore-ffid" className="text-[#DDAA42] text-[13px] font-semibold flex items-center gap-1 hover:underline hover:text-[#B98428] transition-colors duration-200">
          View more <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#F3F1F5] mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-2.5 text-[13px] whitespace-nowrap transition-all duration-200 ${
              tab === t
                ? "text-[#DDAA42] font-semibold"
                : "text-[#68646F] hover:text-[#121B35] font-medium"
            }`}
          >
            {t}
            {tab === t && <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-gradient-to-r from-[#DDAA42] to-[#273559] rounded-t" />}
          </button>
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => scrollBy(-1)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center acres-shadow-card hover:acres-shadow-card-hover hover:border-[#DDAA42] transition-all duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft className="size-5 text-[#121B35]" />
        </button>
        <div ref={ref} className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {listings.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
        <button
          onClick={() => scrollBy(1)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 size-9 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center acres-shadow-card hover:acres-shadow-card-hover hover:border-[#DDAA42] transition-all duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight className="size-5 text-[#121B35]" />
        </button>
      </div>
    </section>
  );
}
