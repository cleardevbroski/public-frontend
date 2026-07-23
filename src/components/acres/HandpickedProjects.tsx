"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Heart, ShieldCheck, Star } from "lucide-react";
import { getPropertiesBySection } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";
import { handpickedProjects, type Property } from "./mock-data";
import { formatPossession } from "@/lib/propertyDetails";

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

export default function HandpickedProjects() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 620, behavior: "smooth" });

  const configuredProjects = useLiveProperties<Property[]>(() => getPropertiesBySection("Handpicked"), []);
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
    : handpickedProjects.map((project) => ({
        ...project,
        status: project.status || "Featured",
        rera: Boolean(project.rera),
        href: "/new-projects-in-bangalore-ffid",
      }));

  return (
    <section className="bg-[#F8F7FA] py-14">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#DDAA42]">
              <Star className="size-4" /> Featured Projects in Bangalore East
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#121B35] mt-1">
              Handpicked <span className="text-gold-gradient">Projects</span>
            </h2>
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

        <div ref={scrollerRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
          {projects.map((p) => (
            <Link key={p.id} href={p.href} className="group shrink-0 w-[560px] max-w-[88vw]">
              <div className="relative h-[280px] overflow-hidden shadow-md">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <span className="absolute top-3 left-0 bg-[#DDAA42] text-[#0B1328] text-[11px] font-bold px-3 py-1 rounded-r-md shadow">
                  {p.status}
                </span>
                <button className="absolute top-3 right-3 size-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:text-red-500 transition-colors" aria-label="Shortlist" onClick={(e) => e.preventDefault()}>
                  <Heart className="size-4 text-[#121B35]" />
                </button>
                {/* Overlapping info card */}
                <div className="absolute left-6 right-6 -bottom-px">
                  <div className="bg-white pt-10 px-5 pb-5 shadow-lg relative">
                    <div className="absolute -top-8 left-5 size-16 rounded-full bg-white border border-[#E4E0E7] shadow flex items-center justify-center text-[#121B35] font-bold">
                      {p.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                    </div>
                    <h3 className="text-[18px] font-bold text-[#121B35] truncate">{p.name}</h3>
                    <p className="text-[13px] text-[#68646F] mt-0.5 truncate">{p.locality}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[18px] font-extrabold text-[#121B35]">{p.price}</span>
                      {p.rera && (
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
