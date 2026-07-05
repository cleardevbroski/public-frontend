"use client";
import Image from "@/components/Image";
import Link from "@/components/Link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Home, Building, Landmark, Percent, Briefcase, KeyRound } from "lucide-react";
import { tiles } from "./mock-data";

// Map labels to icons for a premium look
const tileIcons: Record<string, React.ReactNode> = {
  "Buying a home": <Home className="size-6 text-[#C9A24E]" />,
  "Renting a home": <KeyRound className="size-6 text-[#E8C66A]" />,
  "New Projects": <Building className="size-6 text-[#C9A24E]" />,
  "Sell/Rent/Lease your property": <Percent className="size-6 text-[#E8C66A]" />,
  "Plots/Land": <Landmark className="size-6 text-[#C9A24E]" />,
  "Explore Insights": <Briefcase className="size-6 text-[#E8C66A]" />,
};

export default function CategoryTiles() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  return (
    <section className="max-w-[1200px] mx-auto px-4 mt-16 mb-16">
      <div className="text-center mb-10">
        <p className="acres-overline">Curated Selections</p>
        <h2 className="text-[28px] font-bold text-[#1E3A8A] mt-1" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
          Discover Elite Portfolios
        </h2>
        <p className="text-[14px] text-[#6E7488] mt-1">
          Explore handcrafted real estate options tailored to your lifestyle.
        </p>
      </div>

      <div className="relative">
        {/* Scroll Controls */}
        <button
          onClick={() => scrollBy(-1)}
          className="absolute -left-4 top-[85px] -translate-y-1/2 z-20 size-10 rounded-full bg-white/90 border border-[#D5DEF2]/60 flex items-center justify-center shadow-lg hover:border-[#C9A24E] hover:scale-105 transition-all duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft className="size-5 text-[#1E3A8A]" />
        </button>

        {/* Tiles Scroller Container */}
        <div
          ref={scrollerRef}
          className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-4 pt-2"
        >
          {tiles.map((t) => {
            const icon = tileIcons[t.label] || <Home className="size-6 text-[#C9A24E]" />;
            return (
              <Link
                key={t.label}
                href={t.href}
                className="group shrink-0 w-[200px]"
              >
                {/* Premium Card Frame */}
                <div className="relative w-[200px] h-[140px] rounded-2xl overflow-hidden bg-[#F1F5FF] border border-[#D5DEF2]/40 group-hover:border-[#D4AF37]/50 shadow-md group-hover:shadow-xl transition-all duration-300">
                  <Image
                    src={t.img}
                    alt={t.label}
                    fill
                    sizes="200px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.85] group-hover:brightness-[0.95]"
                  />
                  
                  {/* Luxury Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/80 via-[#1E3A8A]/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* New Flag */}
                  {t.isNew && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-[#D4AF37] to-[#E8C66A] text-[#1E3A8A] text-[9px] font-bold px-2 py-0.5 rounded shadow-md">
                      NEW COLLECTION
                    </span>
                  )}

                  {/* Icon Badge */}
                  <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <div className="text-white brightness-200">
                      {icon}
                    </div>
                  </div>

                  {/* Content inside card */}
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <p className="text-[14px] font-bold text-white tracking-wide group-hover:text-[#E8C66A] transition-colors leading-tight">
                      {t.label}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => scrollBy(1)}
          className="absolute -right-4 top-[85px] -translate-y-1/2 z-20 size-10 rounded-full bg-white/90 border border-[#D5DEF2]/60 flex items-center justify-center shadow-lg hover:border-[#C9A24E] hover:scale-105 transition-all duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight className="size-5 text-[#1E3A8A]" />
        </button>
      </div>
    </section>
  );
}
