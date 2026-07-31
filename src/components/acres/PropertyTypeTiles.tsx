"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { Building2, Home, Key, Map, Store, FileText, Users, ArrowRight, Sparkles } from "lucide-react";
import { browsePropertyTypes } from "./bangalore-data";

const propertyTypes: Array<{
  label: string;
  canonicalSlug: string;
  icon: typeof Building2;
  image: string;
  color: string;
  accent: string;
  textDark?: boolean;
}> = [
  { ...browsePropertyTypes[0], icon: Building2, image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80", color: "from-[#121B35]/90 to-[#1d2b52]/95", accent: "#DDAA42" },
  { ...browsePropertyTypes[1], icon: Home, image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80", color: "from-[#2A3B5C]/90 to-[#1A2642]/95", accent: "#E4E0E7" },
  { ...browsePropertyTypes[2], icon: Key, image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80", color: "from-[#DDAA42]/90 to-[#B8860B]/95", accent: "#121B35", textDark: true },
  { ...browsePropertyTypes[3], icon: Map, image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80", color: "from-[#F3F1F5]/90 to-[#E4E0E7]/95", accent: "#121B35", textDark: true },
  { ...browsePropertyTypes[4], icon: Store, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80", color: "from-[#1a1a24]/90 to-[#0d0d12]/95", accent: "#DDAA42" },
  { ...browsePropertyTypes[5], icon: FileText, image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80", color: "from-[#1E7A46]/90 to-[#125A31]/95", accent: "#FFFFFF" },
  { ...browsePropertyTypes[6], icon: Users, image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80", color: "from-[#68646F]/90 to-[#454249]/95", accent: "#F2C052" },
];

export default function PropertyTypeTiles() {
  const scrollerRef = useRef<HTMLDivElement>(null);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {propertyTypes.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.label}
                href={`/${tile.canonicalSlug}`}
                className={`group relative overflow-hidden rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-start justify-between min-h-[160px] border border-[#E4E0E7]/20`}
              >
                {/* Background Image */}
                <img src={tile.image} alt={tile.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tile.color} transition-opacity duration-300 group-hover:opacity-85 backdrop-blur-[2px]`} />

                {/* Decorative background circle */}
                <div 
                  className="absolute -right-6 -top-6 size-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 z-0" 
                  style={{ backgroundColor: tile.accent }} 
                />
                
                <div 
                  className="size-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-300"
                >
                  <Icon className="size-6" style={{ color: tile.textDark ? tile.accent : "#FFFFFF" }} />
                </div>
                
                <div className="w-full flex items-center justify-between z-10">
                  <h3 className={`text-[18px] font-bold ${tile.textDark ? "text-[#121B35]" : "text-white"}`}>
                    {tile.label}
                  </h3>
                  <div className={`size-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300`}>
                    <ArrowRight className="size-3.5" style={{ color: tile.textDark ? "#121B35" : "#FFFFFF" }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
