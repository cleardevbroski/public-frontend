"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ShieldCheck, Star } from "lucide-react";
import { getAllProperties, getBuilderLogoForProperty, getFeaturedProperties, havePropertiesLoaded } from "@/lib/propertyStore";
import { useLiveData } from "@/lib/useLiveProperties";
import type { Property } from "./mock-data";
import { formatPossession } from "@/lib/propertyDetails";
import { getPropertyCoverImage, priceWithCharges } from "@/lib/propertyPresentation";
import FavoriteButton from "./FavoriteButton";
import {
  getHandpickedProjects,
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
  builderLogo?: string;
  href: string;
  canFavorite: boolean;
};

export default function HandpickedProjects() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const allProperties = useLiveData<Property[]>(() => getAllProperties(), [], ["cleartitle:properties-changed", "cleartitle:builders-changed"]);
  const loading = useLiveData(() => { getAllProperties(); return !havePropertiesLoaded(); }, true);
  const configuredProjects = getHandpickedProjects(allProperties);
  const visibleProjects = configuredProjects.length ? configuredProjects : getFeaturedProperties(10);
  const projects: DisplayProject[] = visibleProjects.map((property) => ({
        id: property.id,
        name: property.title,
        locality: property.subtitle,
        price: property.price,
        image: getPropertyCoverImage(property),
        status: statusOf(property),
        rera: Boolean(property.reraRegistered),
        builderLogo: getBuilderLogoForProperty(property),
        href: `/property/${property.id}`,
        canFavorite: true,
      }));

  if (!projects.length && !loading) return null;

  return (
    <section className="bg-[#F8F7FA] py-6">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="mb-4">
          <div>
            <span className="ct-section-kicker inline-flex items-center gap-1.5">
              <Star className="size-4" /> Featured projects
            </span>
            <h2 className="ct-section-title mt-1">
              Featured Handpicked <span className="text-gold-gradient">Projects</span>
            </h2>
          </div>
        </div>

        <div ref={scrollerRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
          {!projects.length && Array.from({ length: 2 }, (_, index) => <div key={index} aria-label="Loading featured projects" className="h-[220px] w-[480px] max-w-[88vw] shrink-0 animate-pulse rounded-2xl border border-[#E4E0E7] bg-white" />)}
          {projects.map((p) => (
            <Link key={p.id} href={p.href} className="group shrink-0 w-[480px] max-w-[88vw]">
              <div className="relative h-[220px] overflow-hidden rounded-2xl border border-[#E4E0E7]/70 shadow-md">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <span className="absolute top-3 left-0 bg-[#DDAA42] text-[#0B1328] text-[11px] font-bold px-3 py-1 rounded-r-md shadow">
                  {p.status}
                </span>
                {p.canFavorite && <FavoriteButton property={{ id: p.id, title: p.name, subtitle: p.locality, price: p.price }} className="absolute top-3 right-3 size-9 rounded-full bg-white/90 shadow" />}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07111F]/95 via-[#07111F]/70 to-transparent px-4 pb-3 pt-14 text-white">
                  <div className="flex items-end gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[16px] font-bold">{p.name}</h3>
                      <p className="mt-0.5 truncate text-[11px] text-white/75">{p.locality}</p>
                    </div>
                    <div className="flex min-w-0 shrink-0 items-center gap-1.5">
                      <span className="max-w-[180px] truncate whitespace-nowrap text-[13px] font-extrabold text-[#F2C052]">{priceWithCharges(p.price)}</span>
                      {p.rera && <span className="inline-flex shrink-0 items-center gap-1 rounded bg-[#E6F2EA] px-1.5 py-0.5 text-[9px] font-bold text-[#1E7A46]"><ShieldCheck className="size-3" /> RERA</span>}
                    </div>
                  </div>
                </div>
                {p.builderLogo ? <div className="pointer-events-none absolute bottom-3 left-3 flex size-9 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white/95 shadow"><img src={p.builderLogo} alt="" className="size-full object-contain p-1" /></div> : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
