"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronRight, Sparkles } from "lucide-react";
import PropertyCard from "./PropertyCard";
import { getNewlyListed } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";
import type { Property } from "./mock-data";

export default function NewlyListed() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const properties = useLiveProperties<Property[]>(() => getNewlyListed(10), []);

  if (properties.length === 0) return null;

  return (
    <section className="bg-[#F8F7FA] py-12">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#DDAA42]">
              <Sparkles className="size-4" /> Just Added
            </span>
            <h2 className="text-[30px] md:text-[38px] font-bold text-[#121B35] mt-1">
              Newly Listed <span className="text-gold-gradient">Properties</span>
            </h2>
            <p className="text-[14px] text-[#68646F] mt-1">
              Fresh listings added to ClearTitle One — be the first to explore.
            </p>
          </div>
        </div>

        <div ref={scrollerRef} className="flex gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
          {properties.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/property-in-bangalore-ffid"
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#121B35] border border-[#121B35]/20 hover:border-[#DDAA42] hover:text-[#DDAA42] px-6 py-3 rounded-xl transition-all"
          >
            Browse All Listings
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
