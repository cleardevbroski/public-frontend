"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Property } from "./mock-data";

export default function ProjectAbout({ property, title, facts }: { property: Property; title: string; facts: Array<{ label: string; val: unknown }> }) {
  const [expanded, setExpanded] = useState(false);
  const narrative = property.projectNarrative;
  const introductions = narrative?.introduction?.length ? narrative.introduction : property.description ? [property.description] : [];
  return <section className="rounded-2xl border border-[#DDE2EA] bg-white p-5 shadow-sm md:p-7" aria-labelledby="about-project-heading">
    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#B98428]">{property.propertyType ? `${property.propertyType} details` : "Details"}</p>
    <h2 id="about-project-heading" className="mt-1.5 text-[22px] font-extrabold text-[#172039] md:text-[26px]">{title}</h2>
    <div className={`relative mt-3 ${expanded ? "" : "max-h-[14rem] overflow-hidden"}`}>
      <div className="space-y-4">
        {introductions.map((paragraph, index) => <p key={index} className="whitespace-pre-line text-[14px] leading-7 text-[#514C57]">{paragraph}</p>)}
        {expanded && narrative?.usps?.length ? <section><h3 className="text-[18px] font-extrabold text-[#172039]">What are the USPs of {property.title}?</h3><ul className="mt-3 space-y-2">{narrative.usps.map((item) => <li key={item} className="flex gap-2 text-[13px] leading-6 text-[#596277]"><span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#DDAA42]" />{item}</li>)}</ul></section> : null}
        {expanded && narrative?.keyDetails?.length ? <section><h3 className="text-[18px] font-extrabold text-[#172039]">Key Details of {property.title}</h3><div className="mt-3 overflow-hidden rounded-xl border border-[#E5E8EE]">{narrative.keyDetails.map((row) => <div key={row.label} className="grid grid-cols-[minmax(120px,0.7fr)_minmax(0,1.3fr)] border-b border-[#E5E8EE] last:border-0"><span className="bg-[#F6F7F9] p-3 text-[12px] font-bold text-[#596277]">{row.label}</span><span className="p-3 text-[12px] font-semibold text-[#303A50]">{row.value}</span></div>)}</div></section> : null}
        {expanded && narrative?.featureGroups?.map((group) => <section key={group.title}><h3 className="text-[17px] font-extrabold text-[#172039]">{group.title}</h3><ul className="mt-2 grid gap-2 sm:grid-cols-2">{group.items.map((item) => <li key={item} className="text-[13px] leading-6 text-[#596277]">• {item}</li>)}</ul></section>)}
        {expanded && narrative?.locationAdvantage?.length ? <section><h3 className="text-[18px] font-extrabold text-[#172039]">Location Advantage and Connectivity</h3>{narrative.locationAdvantage.map((item) => <p key={item} className="mt-2 text-[13px] leading-6 text-[#596277]">{item}</p>)}</section> : null}
        {expanded && narrative?.investmentReasons?.length ? <section><h3 className="text-[18px] font-extrabold text-[#172039]">Why Invest in {property.title}?</h3>{narrative.investmentReasons.map((item) => <p key={item} className="mt-2 text-[13px] leading-6 text-[#596277]">{item}</p>)}</section> : null}
        {facts.length > 0 && <div aria-hidden={!expanded} className={`${expanded ? "grid" : "hidden"} grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#E4E0E7] bg-[#EAE7ED] md:grid-cols-3`}>{facts.map(({ label, val }, index) => <div key={`${label}-${index}`} className="min-h-[82px] bg-white px-4 py-3.5"><span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#77717E]">{label}</span><p className="mt-1 text-[13.5px] font-extrabold leading-snug text-[#121B35]">{String(val)}</p></div>)}</div>}
      </div>
      {!expanded && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />}
    </div>
    {(introductions.length > 0 || facts.length > 0) && <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="mt-4 inline-flex items-center gap-1 text-[12px] font-extrabold text-[#172039] underline underline-offset-4">{expanded ? "Read Less" : "Read More"}<ChevronDown className={`size-4 transition ${expanded ? "rotate-180" : ""}`} /></button>}
  </section>;
}
