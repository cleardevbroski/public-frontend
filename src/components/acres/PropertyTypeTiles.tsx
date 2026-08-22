"use client";
import Link from "@/components/Link";
import { Building2, Home, Map, Store, Users, ArrowRight, Sparkles } from "lucide-react";
import { browsePropertyTypes } from "./bangalore-data";

const propertyTypes: Array<{
  label: string;
  canonicalSlug: string;
  icon: typeof Building2;
  image?: string;
  color?: string;
  accent?: string;
  textDark?: boolean;
}> = [
  { ...browsePropertyTypes[0], icon: Building2 },
  { ...browsePropertyTypes[1], icon: Home },
  { ...browsePropertyTypes[2], icon: Map },
  { ...browsePropertyTypes[3], icon: Store },
  { ...browsePropertyTypes[4], icon: Users },
];

export default function PropertyTypeTiles() {
  return (
    <section className="bg-white py-10">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#DDAA42] mb-2">
              <Sparkles className="size-4" /> Browse by type
            </span>
            <h2 className="text-[32px] md:text-[40px] font-bold text-[#121B35] leading-tight">
              Explore Premium <span className="text-gold-gradient">Properties</span>
            </h2>
            <p className="text-[15px] text-[#68646F] mt-2 max-w-lg">
              Find exactly what you are looking for. Choose from our wide range of curated real estate categories in Bangalore.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 md:gap-4">
          {propertyTypes.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.label}
                href={`/${tile.canonicalSlug}`}
                className="group flex min-h-[116px] flex-col items-center justify-center gap-3 rounded-xl border border-[#E4E0E7] bg-[#FAFBFC] px-3 py-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#DDAA42] hover:bg-[#FFF9EA] hover:shadow-md"
              >
                <div className="flex size-11 items-center justify-center rounded-xl border border-[#D8DDE7] bg-white text-[#121B35] transition-colors duration-300 group-hover:border-[#DDAA42] group-hover:text-[#DDAA42]">
                  <Icon className="size-5.5" />
                </div>
                
                <div className="flex w-full items-center justify-center gap-1">
                  <h3 className="text-[13px] font-bold text-[#121B35] transition-colors group-hover:text-[#9A741E]">
                    {tile.label}
                  </h3>
                  <ArrowRight className="size-3.5 text-[#9A741E] opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
