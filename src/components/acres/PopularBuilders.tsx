"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Building2, ArrowUpRight } from "lucide-react";
import { getBuilders } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";

type Builder = { name: string; slug: string; total: number };

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function PopularBuilders() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const builders = useLiveProperties<Builder[]>(
    () => getBuilders().map(({ name, slug, total }) => ({ name, slug, total })),
    []
  );

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 640, behavior: "smooth" });
  };

  if (builders.length === 0) return null;

  return (
    <section className="bg-[#F8F7FA] py-20">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#DDAA42]">
              <Building2 className="size-4" /> Trusted Developers
            </span>
            <h2 className="text-[30px] md:text-[40px] font-bold text-[#121B35] mt-1">
              Popular <span className="text-gold-gradient">Builders</span>
            </h2>
            <p className="text-[14px] text-[#68646F] mt-1">
              Renowned developers with verified clear-title projects in Bangalore.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy(-1)}
              className="size-11 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center shadow-sm hover:border-[#DDAA42] hover:text-[#DDAA42] transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-5 text-[#121B35]" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="size-11 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center shadow-sm hover:border-[#DDAA42] hover:text-[#DDAA42] transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-5 text-[#121B35]" />
            </button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="grid grid-flow-col auto-cols-[minmax(300px,1fr)] grid-rows-2 gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth md:auto-cols-[minmax(440px,1fr)]"
        >
          {builders.map((b) => (
            <Link
              key={b.slug}
              href={`/builder/${b.slug}`}
              className="group flex items-center gap-5 bg-white rounded-2xl border border-[#E4E0E7]/60 hover:border-[#DDAA42]/60 hover:shadow-xl p-5 transition-all duration-300"
            >
              {/* Logo monogram */}
              <div className="relative shrink-0 size-[88px] rounded-full bg-[#F8F7FA] border border-[#E4E0E7] flex items-center justify-center shadow-inner group-hover:border-[#DDAA42]/50 transition-colors">
                <span className="text-[22px] font-bold text-[#121B35] tracking-tight">
                  {initials(b.name)}
                </span>
                <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-gradient-to-br from-[#F2C052] to-[#DDAA42] flex items-center justify-center shadow">
                  <Building2 className="size-3.5 text-[#121B35]" />
                </span>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[19px] font-bold text-[#121B35] group-hover:text-[#DDAA42] transition-colors truncate">
                    {b.name}
                  </h3>
                  <ArrowUpRight className="size-5 text-[#DDAA42] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <p className="text-[13px] text-[#68646F] mt-1">
                  <span className="font-semibold text-[#3F3D46]">{b.total}</span>{" "}
                  {b.total === 1 ? "Project" : "Projects"} on ClearTitle One
                  <span className="text-[#DDAA42]"> · Bangalore</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
