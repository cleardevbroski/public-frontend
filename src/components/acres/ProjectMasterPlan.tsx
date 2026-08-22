"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Property } from "./mock-data";

export default function ProjectMasterPlan({ property }: { property: Property }) {
  const legacy = property.plotDetails?.layoutMapType === "image" ? property.plotDetails.layoutMapUrl : "";
  const legacyPdf = property.plotDetails?.layoutMapType === "pdf" ? property.plotDetails.layoutMapUrl : "";
  const image = property.masterPlan?.imageUrl || legacy;
  const summary = property.masterPlan?.summary;
  const sections = property.masterPlan?.sections || [];
  const [expanded, setExpanded] = useState(false);
  if (!image && !legacyPdf && !summary && !sections.length) return null;

  return <section className="overflow-hidden rounded-2xl border border-[#DDE2EA] bg-white p-4 shadow-sm md:p-5" aria-labelledby="master-plan-heading">
    <h2 id="master-plan-heading" className="text-[20px] font-extrabold text-[#172039]">{property.masterPlan?.title || `${property.title} Master Plan`}</h2>
    <div className={`mt-4 grid gap-4 ${summary || sections.length ? "md:grid-cols-[minmax(320px,1.1fr)_minmax(0,0.9fr)]" : "grid-cols-1"}`}>
      {(image || legacyPdf) && <div className={`flex min-h-72 items-center justify-center overflow-hidden rounded-xl border border-[#E5E8EE] bg-[#F4F5F7] p-2 ${!summary && !sections.length ? "md:min-h-[460px]" : ""}`}>{image ? <img src={image} alt={`${property.title} master plan`} loading="lazy" className="size-full max-h-[520px] object-contain" /> : <a href={legacyPdf} target="_blank" rel="noreferrer" className="rounded-lg bg-[#172039] px-5 py-3 text-[13px] font-bold text-white">View Master Plan PDF</a>}</div>}
      {(summary || sections.length > 0) && <div className={!expanded ? "max-h-[290px] overflow-hidden" : ""}>
        {summary && <p className="whitespace-pre-line text-[14px] leading-7 text-[#4C566A]">{summary}</p>}
        {(expanded ? sections : sections.slice(0, 1)).map((section) => <article key={section.heading} className="mt-5"><h3 className="text-[17px] font-extrabold text-[#172039]">{section.heading}</h3><p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-[#596277]">{section.body}</p></article>)}
      </div>}
    </div>
    {(sections.length > 1 || (summary?.length || 0) > 500) && <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold text-[#172039] underline underline-offset-4">{expanded ? "Read Less" : "Read More"}<ChevronDown className={`size-4 transition ${expanded ? "rotate-180" : ""}`} /></button>}
  </section>;
}
