"use client";

import { useEffect, useRef, useState } from "react";
import {
  BadgeIndianRupee,
  Building2,
  CalendarDays,
  ChevronDown,
  LayoutGrid,
  MapPin,
  Phone,
  Scale,
  Trees,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Property } from "./mock-data";

type Props = {
  property: Property;
  onCharges: () => void;
  onRequestCall: () => void;
  onContactLawyer: () => void;
};

function cleanDescription(text: string) {
  return text.replace(/\*\*/g, "").trim();
}

export type PropertyLedgerInformation = {
  price: string;
  projectType: string;
  totalLandArea: string;
  unitVariants: string;
  possession: string;
  totalUnits: string;
  landBreakdown: {
    buildingArea: string;
    openSpaceArea: string;
    amenitiesArea: string;
  };
};

const present = (value?: string | number) =>
  value === undefined || value === null || String(value).trim() === ""
    ? "Not provided"
    : String(value).trim();

const withoutCharges = (price: string) => price.replace(/\s*\+\s*charges?\s*$/i, "").trim();
const acres = (value?: number) => value === undefined ? "Not provided" : `${value.toLocaleString("en-IN")} acres`;

export function getPropertyLedgerInformation(property: Property): PropertyLedgerInformation {
  return {
    price: present(withoutCharges(property.price || "")),
    projectType: present(property.propertyType),
    totalLandArea: acres(property.projectArea?.totalAcres),
    unitVariants: present(property.configs?.filter(Boolean).join(", ")),
    possession: present(property.possessionDetails?.status || property.possession),
    totalUnits: property.totalUnits === undefined
      ? "Not provided"
      : property.totalUnits.toLocaleString("en-IN"),
    landBreakdown: {
      buildingArea: acres(property.projectArea?.builtUpAcres),
      openSpaceArea: acres(property.projectArea?.openSpaceAcres),
      amenitiesArea: acres(property.projectArea?.amenitiesAcres),
    },
  };
}

type LedgerItemProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  className?: string;
};

function LedgerItem({ icon: Icon, label, value, className = "" }: LedgerItemProps) {
  return (
    <div className={`group flex min-h-[72px] min-w-0 items-center gap-2.5 rounded-[12px] border border-[#DDE2EA] bg-white px-3 py-3 shadow-[0_2px_8px_rgba(16,24,40,0.04)] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[#E4C16D] hover:bg-[#FFFAEE] hover:shadow-[0_10px_22px_rgba(73,55,16,0.12)] focus-within:border-[#E4C16D] focus-within:bg-[#FFFAEE] focus-within:shadow-[0_10px_22px_rgba(73,55,16,0.12)] ${className}`}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#F0D79F] bg-[#FFFAF0] text-[#C48608] transition-colors group-hover:border-[#D9A437] group-hover:bg-[#FFF4D6]">
        <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.7} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-medium leading-4 text-[#71798A]">{label}</span>
        <span className="mt-0.5 block break-words text-[13px] font-extrabold leading-[17px] tracking-[-0.01em] text-[#172039]">{value}</span>
      </span>
    </div>
  );
}

export default function VillaPropertyInformationCard({ property, onCharges, onRequestCall, onContactLawyer }: Props) {
  const info = getPropertyLedgerInformation(property);
  const projectLocation = property.locality?.address || property.subtitle || "";
  const projectDescription = cleanDescription(property.description?.trim() || property.projectNarrative?.introduction?.[0]?.trim() || "");
  const [landOpen, setLandOpen] = useState(false);
  const landRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!landOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!landRef.current?.contains(event.target as Node)) setLandOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLandOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [landOpen]);

  return (
    <section
      aria-label={`${property.propertyType || "Property"} project summary`}
      className="relative z-20 w-full max-w-[800px] self-start overflow-visible"
      style={{ fontFamily: "Inter, Arial, Helvetica, sans-serif" }}
    >
      <div className="flex flex-col gap-3">
        {(property.title || projectLocation || projectDescription) && (
          <div className="border-b border-[#E5E8EE] px-1 pb-3">
            {property.title && <h1 className="text-[19px] font-extrabold leading-tight tracking-[-0.02em] text-[#172039] md:text-[21px]">{property.title}</h1>}
            {projectLocation && (
              <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[12px] leading-5 text-[#596277] md:text-[13px]">
                <span className="inline-flex min-w-0 items-start gap-1.5">
                  <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#C48608]" />
                  <span className="line-clamp-2">{projectLocation}</span>
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(projectLocation)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center font-bold text-[#8B5C00] underline decoration-dotted underline-offset-2 hover:text-[#614000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A437]"
                >
                  See on map
                </a>
              </div>
            )}
            {projectDescription && <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-[#59616F] md:text-[13px]">{projectDescription}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="group flex min-h-[72px] min-w-0 items-center gap-2.5 rounded-[12px] border border-[#DDE2EA] bg-white px-3 py-3 shadow-[0_2px_8px_rgba(16,24,40,0.04)] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[#E4C16D] hover:bg-[#FFFAEE] hover:shadow-[0_10px_22px_rgba(73,55,16,0.12)] focus-within:border-[#E4C16D] focus-within:bg-[#FFFAEE] focus-within:shadow-[0_10px_22px_rgba(73,55,16,0.12)]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#F0D79F] bg-[#FFFAF0] text-[#C48608] transition-colors group-hover:border-[#D9A437] group-hover:bg-[#FFF4D6]">
              <BadgeIndianRupee aria-hidden="true" className="size-[18px]" strokeWidth={1.7} />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-medium leading-4 text-[#71798A]">Price</span>
              <span className="mt-0.5 block break-words text-[13px] font-extrabold leading-[17px] text-[#172039]">{info.price}</span>
              <button type="button" onClick={onCharges} className="mt-0.5 text-[10px] font-bold text-[#8B5C00] underline decoration-dotted underline-offset-2 hover:text-[#614000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A437]">+ Charges</button>
            </span>
          </div>

          <LedgerItem icon={Building2} label="Project Type" value={info.projectType} />

          <div ref={landRef} className={`relative rounded-[12px] ${landOpen ? "z-30" : ""}`}>
            <button
              type="button"
              aria-expanded={landOpen}
              aria-controls="project-land-breakdown"
              onClick={() => setLandOpen((open) => !open)}
              className={`group flex min-h-[72px] size-full min-w-0 items-center gap-2.5 rounded-[12px] border bg-white px-3 py-3 text-left shadow-[0_2px_8px_rgba(16,24,40,0.04)] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[#E4C16D] hover:bg-[#FFFAEE] hover:shadow-[0_10px_22px_rgba(73,55,16,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A437] ${landOpen ? "border-[#D9A437] bg-[#FFFAEE] shadow-[0_10px_22px_rgba(73,55,16,0.12)]" : "border-[#DDE2EA]"}`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#F0D79F] bg-[#FFFAF0] text-[#C48608] transition-colors group-hover:border-[#D9A437] group-hover:bg-[#FFF4D6]">
                <Trees aria-hidden="true" className="size-[18px]" strokeWidth={1.7} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-0.5 text-[11px] font-medium leading-4 text-[#71798A]">Total Land Area <ChevronDown aria-hidden="true" className={`size-3 shrink-0 transition-transform ${landOpen ? "rotate-180" : ""}`} /></span>
                <span className="mt-0.5 block break-words text-[13px] font-extrabold leading-[17px] text-[#172039]">{info.totalLandArea}</span>
              </span>
            </button>

            {landOpen && (
              <div id="project-land-breakdown" className="absolute left-1/2 top-[calc(100%+8px)] z-40 w-[min(270px,calc(100vw-32px))] -translate-x-1/2 rounded-[10px] border border-[#E2B95E] bg-white p-3 shadow-[0_16px_38px_rgba(35,29,14,0.18)]" role="region" aria-label="Land area breakdown">
                <span aria-hidden="true" className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-[#E2B95E] bg-white" />
                {[
                  ["Building area", info.landBreakdown.buildingArea],
                  ["Empty / open space", info.landBreakdown.openSpaceArea],
                  ["Amenities area", info.landBreakdown.amenitiesArea],
                ].map(([label, value], index) => (
                  <div key={label} className={`flex items-center justify-between gap-4 py-2 text-[11px] ${index ? "border-t border-[#E7E9ED]" : ""}`}>
                    <span className="font-medium text-[#596277]">{label}</span>
                    <span className="text-right font-extrabold text-[#172039]">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <LedgerItem icon={LayoutGrid} label="Unit Variants" value={info.unitVariants} />
          <LedgerItem icon={CalendarDays} label="Possession" value={info.possession} />
          <LedgerItem icon={Warehouse} label="Total Units" value={info.totalUnits} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 px-1">
          <button type="button" onClick={onRequestCall} className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-bold text-[#4C566A] underline decoration-[#C8A24C] decoration-1 underline-offset-4 transition-colors hover:text-[#8B5C00] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A437] focus-visible:ring-offset-2">
            <Phone aria-hidden="true" className="size-4" strokeWidth={1.8} />
            Request Call
          </button>
          <button type="button" onClick={onContactLawyer} className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] font-bold text-[#4C566A] underline decoration-[#C8A24C] decoration-1 underline-offset-4 transition-colors hover:text-[#8B5C00] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A437] focus-visible:ring-offset-2">
            <Scale aria-hidden="true" className="size-4" strokeWidth={1.8} />
            Contact Lawyer
          </button>
        </div>
      </div>
    </section>
  );
}
