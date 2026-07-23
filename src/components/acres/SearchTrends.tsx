"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Heart, ShieldCheck, TrendingUp } from "lucide-react";
import { getPropertiesBySection } from "@/lib/propertyStore";
import { formatPossession } from "@/lib/propertyDetails";
import { useLiveProperties } from "@/lib/useLiveProperties";
import { searchTrendProjects, type Property } from "./mock-data";

function statusOf(p: Property): string {
  if (p.possession || p.possessionDetails) return formatPossession(p);
  if (p.ageOfProperty === "Under Construction") return "Under Construction";
  return p.badges?.[0] || "New Launch";
}

type DisplayProject = {
  id: string;
  name: string;
  locality: string;
  price: string;
  image: string;
  status: string;
  rera: boolean;
  href: string;
};

export default function SearchTrends() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 600, behavior: "smooth" });

  const configuredProjects = useLiveProperties<Property[]>(() => getPropertiesBySection("Search Trends"), []);
  const projects: DisplayProject[] = configuredProjects.length
    ? configuredProjects.map((property) => ({
        id: property.id,
        name: property.title,
        locality: property.subtitle,
        price: property.price,
        image: property.image,
        status: statusOf(property),
        rera: Boolean(property.reraRegistered),
        href: `/property/${property.id}`,
      }))
    : searchTrendProjects.map((project) => ({
        ...project,
        status: project.status || "New Launch",
        rera: Boolean(project.rera),
        href: "/new-projects-in-bangalore-ffid",
      }));

  return (
    <section className="bg-white py-14">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#DDAA42]">
              <TrendingUp className="size-4" /> Trending now
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#121B35] mt-1">
              Based on <span className="text-gold-gradient">search trends</span>
            </h2>
            <p className="text-[13px] text-[#68646F] mt-1">Other city projects Bangalore East buyers considered</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollBy(-1)} className="size-10 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center shadow-sm hover:border-[#DDAA42] transition-all" aria-label="Scroll left">
              <ChevronLeft className="size-5 text-[#121B35]" />
            </button>
            <button onClick={() => scrollBy(1)} className="size-10 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center shadow-sm hover:border-[#DDAA42] transition-all" aria-label="Scroll right">
              <ChevronRight className="size-5 text-[#121B35]" />
            </button>
          </div>
        </div>

        <div ref={scrollerRef} className="flex gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
          {projects.map((p) => (
            <Link key={p.id} href={p.href} className="group shrink-0 w-[360px] max-w-[85vw]">
              <div className="relative h-[210px] overflow-hidden shadow-sm">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                {p.rera && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white/90 text-[#1E7A46] text-[10px] font-bold px-2 py-1 rounded">
                    <ShieldCheck className="size-3" /> RERA
                  </span>
                )}
                <button className="absolute top-3 right-3 size-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:text-red-500" aria-label="Shortlist" onClick={(e) => e.preventDefault()}>
                  <Heart className="size-4 text-[#121B35]" />
                </button>
                <span className="absolute bottom-3 left-3 text-white text-[13px] font-bold drop-shadow">{p.status}</span>
              </div>
              <h3 className="text-[17px] font-bold text-[#121B35] mt-3 group-hover:text-[#DDAA42] transition-colors truncate">{p.name}</h3>
              <p className="text-[13px] text-[#68646F] truncate">{p.locality}</p>
              <p className="text-[16px] font-extrabold text-[#121B35] mt-1">{p.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
