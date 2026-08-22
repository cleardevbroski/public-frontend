"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Check, ChevronDown, ChevronRight } from "lucide-react";
import type { Property } from "./mock-data";
import PropertyCard from "./PropertyCard";
import Link from "@/components/Link";
import { builderSlug } from "@/lib/propertyStore";
import { fetchBuilder } from "@/lib/api";

type BuilderRecord = {
  name?: string; logo?: string; description?: string; longDescription?: string; headquarters?: string;
  experienceYears?: number; totalProjects?: number; deliveredProjects?: number; projectCount?: number;
};

export default function ProjectBuilderProfile({ property, projects }: { property: Property; projects: Property[] }) {
  const [builder, setBuilder] = useState<BuilderRecord | null>(null);
  const [filter, setFilter] = useState("All");
  const [showBuilderInfo, setShowBuilderInfo] = useState(false);
  useEffect(() => {
    if (!property.builder) return;
    fetchBuilder(builderSlug(property.builder)).then((data) => setBuilder(data.builder)).catch(() => setBuilder(null));
  }, [property.builder]);
  const filtered = useMemo(() => projects.filter((project) => {
    if (filter === "All") return true;
    return (project.possessionDetails?.status || project.possession) === filter;
  }), [filter, projects]);
  if (!property.builder && !property.developerLogoUrl) return null;
  const logo = builder?.logo || property.developerLogoUrl;
  const stats = [
    ["Experience", builder?.experienceYears !== undefined ? `${builder.experienceYears} Years` : undefined],
    ["Total Projects", builder?.totalProjects ?? builder?.projectCount],
    ["Delivered Projects", builder?.deliveredProjects],
  ].filter((row) => row[1] !== undefined);
  const builderDescription = builder?.longDescription || builder?.description || "";
  return <section className="rounded-2xl border border-[#DDE2EA] bg-white p-5 shadow-sm md:p-7" aria-labelledby="builder-heading">
    <h2 id="builder-heading" className="text-[22px] font-extrabold text-[#172039]">About {property.builder || "Builder"}</h2>
    <div className="mt-4 flex flex-wrap items-center gap-5 rounded-xl border border-[#E5E8EE] p-4">
      <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl border border-[#E5E8EE] bg-white">{logo ? <img src={logo} alt={`${property.builder} logo`} className="size-full object-contain p-2" /> : <Building2 className="size-8 text-[#596277]" />}</div>
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{stats.map(([label, value]) => <div key={String(label)}><p className="text-[10px] font-bold uppercase text-[#667085]">{label}</p><p className="mt-1 text-[15px] font-extrabold text-[#172039]">{value}</p></div>)}</div>
        {builderDescription && <div className="mt-2 flex items-start gap-2"><p className={`${showBuilderInfo ? "" : "line-clamp-2"} min-w-0 text-[11px] leading-5 text-[#596277]`}>{builderDescription}</p><button type="button" onClick={() => setShowBuilderInfo((value) => !value)} className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-bold text-[#9A741E] underline underline-offset-2">{showBuilderInfo ? "Less" : "View more"}<ChevronDown className={`size-3 transition-transform ${showBuilderInfo ? "rotate-180" : ""}`} /></button></div>}
      </div>
      {property.builder && <Link href={`/builder/${builderSlug(property.builder)}`} className="inline-flex items-center gap-1 text-[12px] font-bold text-[#9A741E]">View Builder <ChevronRight className="size-4" /></Link>}
    </div>
    {projects.length > 0 && <div className="mt-6"><h3 className="text-[18px] font-extrabold text-[#172039]">Projects by {property.builder}</h3><div className="mt-3 flex flex-wrap gap-2">{["All", "New Launch", "Under Construction", "Ready to Move"].map((status) => <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-lg px-3 py-2 text-[11px] font-bold ${filter === status ? "bg-[#172039] text-white" : "border border-[#DDE2EA] text-[#596277]"}`}>{status}</button>)}</div><div className="mt-4 flex gap-4 overflow-x-auto pb-2">{filtered.slice(0, 6).map((project) => <div key={project.id} className="w-[280px] shrink-0"><PropertyCard p={project} /></div>)}{!filtered.length && <p className="flex items-center gap-2 text-[12px] text-[#667085]"><Check className="size-4" /> No published projects in this status.</p>}</div></div>}
  </section>;
}
