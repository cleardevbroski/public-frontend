"use client";
import { useRef, useState } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, ShieldCheck, Star } from "lucide-react";
import { getAllProperties } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";
import { handpickedProjects, type Property } from "./mock-data";
import { formatPossession } from "@/lib/propertyDetails";
import { priceWithCharges } from "@/lib/propertyPresentation";
import FavoriteButton from "./FavoriteButton";
import {
  BANGALORE_ZONES,
  getHandpickedProjectsByZone,
  type BangaloreZone,
} from "@/lib/homepagePlacements";

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
  canFavorite: boolean;
};

export default function HandpickedProjects() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = useState<BangaloreZone>("East");
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 620, behavior: "smooth" });

  const allProperties = useLiveProperties<Property[]>(() => getAllProperties(), []);
  const configuredProjects = getHandpickedProjectsByZone(allProperties, activeZone);
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
        canFavorite: true,
      }))
    : handpickedProjects.map((project) => ({
        ...project,
        status: project.status || "Featured",
        rera: Boolean(project.rera),
        href: "/new-projects-in-bangalore-ffid",
        canFavorite: false,
      }));

  const selectZone = (zone: BangaloreZone) => {
    setActiveZone(zone);
    scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  return (
    <section className="bg-[#F8F7FA] py-8">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#DDAA42]">
              <Star className="size-4" /> Featured projects
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#121B35] mt-1">
              Featured Handpicked <span className="text-gold-gradient">Projects</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="handpicked-project-zone">Select Bangalore zone</label>
            <select
              id="handpicked-project-zone"
              value={activeZone}
              onChange={(event) => selectZone(event.target.value as BangaloreZone)}
              className="h-10 rounded-full border border-[#E4E0E7] bg-white px-3 text-[12px] font-bold text-[#121B35] shadow-sm outline-none transition focus:border-[#DDAA42]"
            >
              {BANGALORE_ZONES.map((zone) => <option key={zone} value={zone}>{zone} Bangalore</option>)}
            </select>
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
            <Link key={p.id} href={p.href} className="group shrink-0 w-[520px] max-w-[88vw]">
              <div className="relative h-[265px] overflow-hidden rounded-2xl border border-[#E4E0E7]/70 shadow-md">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <span className="absolute top-3 left-0 bg-[#DDAA42] text-[#0B1328] text-[11px] font-bold px-3 py-1 rounded-r-md shadow">
                  {p.status}
                </span>
                {p.canFavorite && <FavoriteButton property={{ id: p.id, title: p.name, subtitle: p.locality, price: p.price }} className="absolute top-3 right-3 size-9 rounded-full bg-white/90 shadow" />}
                {/* Overlapping info card */}
                <div className="absolute left-6 right-6 -bottom-px">
                  <div className="bg-white pt-10 px-5 pb-4 shadow-lg relative rounded-t-xl">
                    <div className="absolute -top-8 left-5 size-16 rounded-full bg-white border border-[#E4E0E7] shadow flex items-center justify-center text-[#121B35] font-bold">
                      {p.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                    </div>
                    <h3 className="text-[18px] font-bold text-[#121B35] truncate">{p.name}</h3>
                    <p className="text-[13px] text-[#68646F] mt-0.5 truncate">{p.locality}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[18px] font-extrabold text-[#121B35]">{priceWithCharges(p.price)}</span>
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
