"use client";

import { useState } from "react";
import {
  Building2,
  CalendarDays,
  Car,
  ChevronDown,
  CircleGauge,
  Droplets,
  Info,
  Layers3,
  Scan,
  ShieldCheck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Property } from "./mock-data";

type Fact = { label: string; val: unknown };

function cleanDescription(text: string) {
  return text.replace(/\*\*/g, "").trim();
}

function factIcon(label: string): LucideIcon {
  const value = label.toLowerCase();
  if (/area|size|dimension|width|frontage/.test(value)) return Scan;
  if (/floor|tower|plot/.test(value)) return Layers3;
  if (/parking/.test(value)) return Car;
  if (/water|drainage/.test(value)) return Droplets;
  if (/power|electricity|load/.test(value)) return Zap;
  if (/rera|approval|security|fire/.test(value)) return ShieldCheck;
  if (/available|possession|date|period|tenure/.test(value)) return CalendarDays;
  if (/unit|bed|seating|visitor|tenant/.test(value)) return Users;
  if (/type|configuration|furnishing|structure|zone/.test(value)) return Building2;
  if (/price|rent|deposit|transaction|listing/.test(value)) return CircleGauge;
  return Info;
}

function hasValue(value: unknown) {
  if (value === undefined || value === null || value === false) return false;
  if (typeof value === "string") {
    const cleaned = value.trim();
    return cleaned !== "" && cleaned !== "—" && cleaned.toLowerCase() !== "not provided";
  }
  return true;
}

export default function ProjectAbout({ property, title, facts }: { property: Property; title: string; facts: Fact[] }) {
  const [expanded, setExpanded] = useState(false);
  const narrative = property.projectNarrative;
  const introductions = (narrative?.introduction?.length ? narrative.introduction : property.description ? [property.description] : [])
    .map((paragraph) => cleanDescription(paragraph))
    .filter(Boolean);
  const validFacts = facts.filter(({ val }) => hasValue(val));
  const closingFactLabels = new Set(["property type", "transaction", "facing", "rera number", "total project area", "number of units", "security", "water supply", "power backup", "elevators", "visitor parking", "maintenance staff"]);
  const closingFacts = validFacts.filter(({ label }) => closingFactLabels.has(label.trim().toLowerCase()));
  const visibleFacts = (expanded ? validFacts : validFacts.slice(0, 6)).filter(({ label }) => !closingFactLabels.has(label.trim().toLowerCase()));
  const hasLongIntroduction = introductions.some((paragraph) => paragraph.length > 240 || paragraph.split(/\s+/).length > 42);
  const hasExtendedNarrative = Boolean(
    narrative?.usps?.length || narrative?.keyDetails?.length || narrative?.featureGroups?.length ||
    narrative?.locationAdvantage?.length || narrative?.investmentReasons?.length || introductions.length > 1,
  );
  const canExpand = validFacts.length > 6 || hasExtendedNarrative || hasLongIntroduction;
  if (!introductions.length && !validFacts.length && !hasExtendedNarrative) return null;

  return (
    <section className="overflow-hidden rounded-[14px] border border-[#E1E3E6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.025)]" aria-labelledby="about-project-heading">
      <header className="border-b border-[#E6E8EB] px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A741E]">{property.propertyType ? `${property.propertyType} details` : "Property details"}</p>
        <h2 id="about-project-heading" className="mt-1 text-[20px] font-bold leading-tight tracking-[-0.02em] text-[#1D2433] md:text-[22px]">{title}</h2>
      </header>

      {introductions.length > 0 && (
        <div className="border-b border-[#E6E8EB] px-5 py-3.5">
          <p className={`whitespace-pre-line text-[13px] leading-6 text-[#59616F] ${expanded ? "" : "line-clamp-3"}`}>{introductions[0]}</p>
          {expanded && introductions.slice(1).map((paragraph, index) => <p key={index} className="mt-3 whitespace-pre-line text-[13px] leading-6 text-[#59616F]">{paragraph}</p>)}
          {!expanded && canExpand && <button type="button" onClick={() => setExpanded(true)} className="mt-1 inline-flex items-center text-[12px] font-bold text-[#1D2433] underline underline-offset-4">View More</button>}
        </div>
      )}

      {visibleFacts.length > 0 && (
        <div className="grid sm:grid-cols-2">
          {visibleFacts.map(({ label, val }, index) => {
            const Icon = factIcon(label);
            const isLastOddItem = visibleFacts.length % 2 === 1 && index === visibleFacts.length - 1;
            return (
              <div key={`${label}-${index}`} className={`flex items-center gap-3 border-[#E6E8EB] px-4 py-3 ${index < visibleFacts.length - 1 ? "border-b" : ""} ${index + 2 >= visibleFacts.length ? "sm:border-b-0" : ""} ${index % 2 === 1 ? "sm:border-l" : ""} ${isLastOddItem ? "sm:col-span-2" : ""}`}>
                <Icon aria-hidden="true" className="size-8 shrink-0 text-[#7B838F]" strokeWidth={1.55} />
                <div className="min-w-0">
                  <p className="text-[12px] font-normal leading-4 text-[#767D88]">{label}</p>
                  <p className="mt-0.5 break-words text-[15px] font-bold leading-5 tracking-[-0.01em] text-[#202633]">{String(val)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {expanded && narrative?.usps?.length ? <section className="border-t border-[#E6E8EB] px-5 py-4"><h3 className="text-[16px] font-bold text-[#1D2433]">What are the USPs of {property.title}?</h3><ul className="mt-2 grid gap-2 sm:grid-cols-2">{narrative.usps.map((item) => <li key={item} className="flex gap-2 text-[12px] leading-5 text-[#59616F]"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#DDAA42]" />{item}</li>)}</ul></section> : null}
      {expanded && narrative?.keyDetails?.length ? <section className="border-t border-[#E6E8EB] px-5 py-4"><h3 className="text-[16px] font-bold text-[#1D2433]">Key Details</h3><div className="mt-3 overflow-hidden rounded-xl border border-[#E6E8EB]">{narrative.keyDetails.map((row) => <div key={row.label} className="grid grid-cols-[minmax(110px,0.7fr)_minmax(0,1.3fr)] border-b border-[#E6E8EB] last:border-0"><span className="bg-[#F7F8FA] p-3 text-[11px] font-semibold text-[#687080]">{row.label}</span><span className="p-3 text-[12px] font-bold text-[#202633]">{row.value}</span></div>)}</div></section> : null}
      {expanded && narrative?.featureGroups?.map((group) => <section key={group.title} className="border-t border-[#E6E8EB] px-5 py-4"><h3 className="text-[16px] font-bold text-[#1D2433]">{group.title}</h3><ul className="mt-2 grid gap-2 sm:grid-cols-2">{group.items.map((item) => <li key={item} className="text-[12px] leading-5 text-[#59616F]">• {item}</li>)}</ul></section>)}
      {expanded && narrative?.locationAdvantage?.length ? <section className="border-t border-[#E6E8EB] px-5 py-4"><h3 className="text-[16px] font-bold text-[#1D2433]">Location Advantage and Connectivity</h3>{narrative.locationAdvantage.map((item) => <p key={item} className="mt-2 text-[12px] leading-5 text-[#59616F]">{item}</p>)}</section> : null}
      {expanded && narrative?.investmentReasons?.length ? <section className="border-t border-[#E6E8EB] px-5 py-4"><h3 className="text-[16px] font-bold text-[#1D2433]">Why Invest in {property.title}?</h3>{narrative.investmentReasons.map((item) => <p key={item} className="mt-2 text-[12px] leading-5 text-[#59616F]">{item}</p>)}</section> : null}
      {expanded && closingFacts.length > 0 ? <section className="border-t border-[#E6E8EB] px-5 py-4"><div className="rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] px-4 py-3.5"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#596277]">Project details at a glance</p><div className="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2">{closingFacts.map(({ label, val }) => <div key={label} className="rounded-lg border border-[#E6E8EB] bg-white px-3 py-2"><p className="text-[11px] font-semibold text-[#667085]">{label === "Maintenance staff" ? "Maintenance Staff" : label}</p><p className="mt-0.5 break-words text-[13px] font-bold leading-5 text-[#202633]">{String(val)}</p></div>)}</div></div></section> : null}

      {canExpand && !expanded && !introductions.length && <div className="border-t border-[#E6E8EB] px-5 py-3"><button type="button" aria-expanded={false} onClick={() => setExpanded(true)} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#1D2433] underline underline-offset-4">View More<ChevronDown className="size-4" /></button></div>}
      {canExpand && expanded && <div className="border-t border-[#E6E8EB] px-5 py-3"><button type="button" aria-expanded={expanded} onClick={() => setExpanded(false)} className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#1D2433] underline underline-offset-4">Show Less<ChevronDown className="size-4 rotate-180" /></button></div>}
    </section>
  );
}
