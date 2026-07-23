"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Gift } from "lucide-react";
import { getPropertiesBySection } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";
import { offerProjects, type Property } from "./mock-data";

type DisplayProject = {
  id: string;
  name: string;
  locality: string;
  config: string;
  price: string;
  image: string;
  note: string;
  href: string;
};

export default function OffersForYou() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 560, behavior: "smooth" });

  const configuredProjects = useLiveProperties<Property[]>(() => getPropertiesBySection("Offers"), []);
  const projects: DisplayProject[] = configuredProjects.length
    ? configuredProjects.map((property) => ({
        id: property.id,
        name: property.title,
        locality: property.subtitle,
        config: property.configs?.join(", ") || property.propertyType || "",
        price: property.price,
        image: property.image,
        note: property.description || "Limited period offer",
        href: `/property/${property.id}`,
      }))
    : offerProjects.map((project) => ({
        ...project,
        note: project.note || "Limited period offer",
        href: "/new-projects-in-bangalore-ffid",
      }));

  return (
    <section className="bg-[#F8F7FA] py-14">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#DDAA42]">
              <Gift className="size-4" /> Limited period
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#121B35] mt-1">
              Offers <span className="text-gold-gradient">for you</span>
            </h2>
            <p className="text-[13px] text-[#68646F] mt-1">Projects with ongoing offers in Bangalore East</p>
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
            <Link key={p.id} href={p.href} className="block shrink-0 w-[420px] max-w-[88vw] bg-white border border-[#E4E0E7]/50 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <img src={p.image} alt={p.name} className="size-20 rounded-full object-cover border border-[#E4E0E7]" />
                <div className="min-w-0">
                  <h3 className="text-[18px] font-bold text-[#121B35] truncate">{p.name}</h3>
                  <p className="text-[13px] text-[#68646F]">{p.locality}</p>
                  <p className="text-[13px] text-[#68646F]">{p.config}</p>
                  <p className="text-[16px] font-extrabold text-[#121B35] mt-1">{p.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-dashed border-[#E4E0E7] px-5 py-3 bg-[#EEF4FB]">
                <Gift className="size-4 text-[#DDAA42]" />
                <span className="text-[13px] font-semibold text-[#121B35] truncate">{p.note}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
