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
import { configurationPriceRange } from "@/lib/propertyPresentation";
import { formatAreaRange, propertyAreaRange } from "@/lib/projectEnhancements";

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
  items: PropertyLedgerItem[];
  landBreakdown: Array<{ label: string; value: string }>;
};

export type PropertyLedgerItem = {
  key: "price" | "propertyType" | "area" | "configuration" | "availability" | "scale" | "builder" | "transaction" | "furnishing" | "facing" | "parking" | "rera";
  label: string;
  value: string;
  showCharges?: boolean;
};

const withoutCharges = (price: string) => price.replace(/\s*\+\s*charges?\s*$/i, "").trim();

function cleanValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value.toLocaleString("en-IN") : "";
  const text = String(value).trim();
  return text && text !== "—" && text.toLowerCase() !== "not provided" ? text : "";
}

function firstValue(...values: unknown[]): string {
  return values.map(cleanValue).find(Boolean) || "";
}

function distinct(values: Array<string | undefined>): string[] {
  return [...new Set(values.map(cleanValue).filter(Boolean))];
}

function formatMoney(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function numericRange(values: number[], formatter: (value: number) => string): string {
  const valid = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!valid.length) return "";
  const minimum = Math.min(...valid);
  const maximum = Math.max(...valid);
  return minimum === maximum ? formatter(minimum) : `${formatter(minimum)} – ${formatter(maximum)}`;
}

function textRange(values: Array<string | undefined>): string {
  const entries = distinct(values);
  if (!entries.length) return "";
  return entries.length === 1 ? entries[0] : `${entries[0]} – ${entries[entries.length - 1]}`;
}

function formatDate(value?: string): string {
  if (!value?.trim()) return "";
  const normalized = value.length === 7 ? `${value}-01` : value;
  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(parsed);
}

export function getPropertyLedgerInformation(property: Property): PropertyLedgerInformation {
  const items: PropertyLedgerItem[] = [];
  const add = (item: PropertyLedgerItem) => {
    if (!cleanValue(item.value) || items.some((existing) => existing.key === item.key || (existing.label === item.label && existing.value === item.value))) return;
    items.push(item);
  };

  const apartmentPrice = configurationPriceRange(property.configurationDetails, "");
  const villaPrice = configurationPriceRange(property.villaDetails?.configurationDetails, "");
  const plotPrice = numericRange(property.plotDetails?.plotSizeDetails.map((row) => row.totalPrice) || [], formatMoney);
  const pgPrice = numericRange(property.pgDetails?.sharingDetails.map((row) => row.rentPerBed) || [], (value) => `${formatMoney(value)}/month`);
  const rentPrice = property.rentDetails?.monthlyRent ? `${formatMoney(property.rentDetails.monthlyRent)}/month` : "";
  const leasePrice = property.leaseDetails?.leaseRent ? `${formatMoney(property.leaseDetails.leaseRent)}/month` : "";
  const price = firstValue(withoutCharges(property.price || ""), apartmentPrice, villaPrice, plotPrice, rentPrice, leasePrice, pgPrice);
  add({ key: "price", label: property.rentDetails || property.leaseDetails || property.pgDetails ? "Monthly Price" : "Price", value: price, showCharges: !property.rentDetails && !property.leaseDetails && !property.pgDetails && Boolean(property.price || apartmentPrice || villaPrice || plotPrice) });

  const specificType = firstValue(property.villaDetails?.villaType, property.commercialDetails?.commercialSubtype, property.rentDetails?.rentalPropertyType, property.leaseDetails?.leasePropertyType);
  add({ key: "propertyType", label: property.propertyType ? "Project Type" : "Property Type", value: firstValue(property.propertyType, specificType) });

  const apartmentArea = propertyAreaRange(property) ? formatAreaRange(propertyAreaRange(property), "sqft") : "";
  const villaArea = textRange(property.villaDetails?.configurationDetails.map((row) => row.plotArea || row.builtUpArea || row.superArea) || []);
  const plotArea = numericRange(property.plotDetails?.plotSizeDetails.map((row) => row.areaSqft) || [], (value) => `${value.toLocaleString("en-IN")} sq. ft.`);
  const commercialArea = firstValue(property.commercialDetails?.superArea, property.commercialDetails?.builtUpArea, property.commercialDetails?.carpetArea);
  const rentalArea = firstValue(property.rentDetails?.superArea, property.rentDetails?.carpetArea, property.leaseDetails?.superArea, property.leaseDetails?.carpetArea);
  if (property.projectArea?.totalAcres !== undefined && property.projectArea.totalAcres > 0) {
    add({ key: "area", label: "Total Land Area", value: `${property.projectArea.totalAcres.toLocaleString("en-IN")} acres` });
  } else {
    add({ key: "area", label: property.plotDetails ? "Plot Area" : property.commercialDetails ? "Commercial Area" : "Property Area", value: firstValue(property.area, apartmentArea, villaArea, plotArea, commercialArea, rentalArea) });
  }

  const configurations = distinct([
    ...(property.configs || []),
    ...(property.configurationDetails || []).map((row) => row.configuration),
    ...(property.villaDetails?.configurationDetails || []).map((row) => row.configuration),
  ]);
  const plotSizes = distinct(property.plotDetails?.plotSizeDetails.map((row) => row.plotSize) || []);
  const sharingOptions = distinct(property.pgDetails?.sharingDetails.map((row) => row.sharingType) || []);
  const configurationValue = firstValue(configurations.join(", "), plotSizes.join(", "), sharingOptions.join(", "), property.rentDetails?.configuration, property.commercialDetails?.commercialSubtype);
  const configurationLabel = configurations.length ? "Unit Variants" : plotSizes.length ? "Plot Sizes" : sharingOptions.length ? "Sharing Options" : "Configuration";
  add({ key: "configuration", label: configurationLabel, value: configurationValue });

  const plotAvailability = property.plotDetails?.layoutPossession;
  const availableFrom = firstValue(property.pgDetails?.availableFrom, property.rentDetails?.availableFrom, property.leaseDetails?.availableFrom);
  add({
    key: "availability",
    label: availableFrom && !property.possessionDetails && !property.possession && !plotAvailability ? "Available From" : "Possession",
    value: firstValue(property.possessionDetails?.status, property.possession, plotAvailability?.status, formatDate(availableFrom)),
  });

  if (property.totalUnits !== undefined && property.totalUnits > 0) add({ key: "scale", label: "Total Units", value: property.totalUnits.toLocaleString("en-IN") });
  else if (property.plotDetails?.totalPlots) add({ key: "scale", label: "Total Plots", value: property.plotDetails.totalPlots.toLocaleString("en-IN") });
  else if (property.totalTowers) add({ key: "scale", label: "Total Towers", value: property.totalTowers.toLocaleString("en-IN") });
  else {
    const availableBeds = property.pgDetails?.sharingDetails.reduce((total, row) => total + Math.max(0, row.bedsAvailable || 0), 0) || 0;
    if (availableBeds) add({ key: "scale", label: "Beds Available", value: availableBeds.toLocaleString("en-IN") });
    else if (property.commercialDetails?.seatingCapacity) add({ key: "scale", label: "Seating Capacity", value: property.commercialDetails.seatingCapacity.toLocaleString("en-IN") });
  }

  add({ key: "builder", label: "Builder", value: firstValue(property.builder) });
  add({ key: "transaction", label: "Transaction", value: firstValue(property.transactionType) });
  add({ key: "furnishing", label: "Furnishing", value: firstValue(property.furnishing, property.commercialDetails?.furnishing, property.rentDetails?.furnishing, property.leaseDetails?.furnishing) });
  add({ key: "facing", label: "Facing", value: firstValue(property.facing, property.villaDetails?.plotFacing) });
  add({ key: "parking", label: "Parking", value: firstValue(property.parking, property.commercialDetails?.parking, property.rentDetails?.parking) });
  add({ key: "rera", label: "RERA Number", value: property.reraRegistered ? firstValue(property.reraNumber, property.reraPhases?.[0]?.reraNumber) : "" });

  const landBreakdown = [
    { label: "Building area", value: (property.projectArea?.builtUpSqft ?? property.projectArea?.builtUpAcres) ? `${(property.projectArea?.builtUpSqft ?? property.projectArea?.builtUpAcres)?.toLocaleString("en-IN")} sq. ft.` : "" },
    { label: "Empty / open space", value: (property.projectArea?.openSpaceSqft ?? property.projectArea?.openSpaceAcres) ? `${(property.projectArea?.openSpaceSqft ?? property.projectArea?.openSpaceAcres)?.toLocaleString("en-IN")} sq. ft.` : "" },
    { label: "Amenities area", value: (property.projectArea?.amenitiesSqft ?? property.projectArea?.amenitiesAcres) ? `${(property.projectArea?.amenitiesSqft ?? property.projectArea?.amenitiesAcres)?.toLocaleString("en-IN")} sq. ft.` : "" },
  ].filter((item) => Boolean(item.value));

  return { items: items.slice(0, 6), landBreakdown };
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

const ledgerIcons: Record<PropertyLedgerItem["key"], LucideIcon> = {
  price: BadgeIndianRupee,
  propertyType: Building2,
  area: Trees,
  configuration: LayoutGrid,
  availability: CalendarDays,
  scale: Warehouse,
  builder: Building2,
  transaction: Scale,
  furnishing: Warehouse,
  facing: MapPin,
  parking: Warehouse,
  rera: Scale,
};

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

        {info.items.length > 0 && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {info.items.map((item) => {
            if (item.key === "price") {
              return <div key={item.key} className="group flex min-h-[72px] min-w-0 items-center gap-2.5 rounded-[12px] border border-[#DDE2EA] bg-white px-3 py-3 shadow-[0_2px_8px_rgba(16,24,40,0.04)] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[#E4C16D] hover:bg-[#FFFAEE] hover:shadow-[0_10px_22px_rgba(73,55,16,0.12)] focus-within:border-[#E4C16D] focus-within:bg-[#FFFAEE] focus-within:shadow-[0_10px_22px_rgba(73,55,16,0.12)]">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#F0D79F] bg-[#FFFAF0] text-[#C48608] transition-colors group-hover:border-[#D9A437] group-hover:bg-[#FFF4D6]"><BadgeIndianRupee aria-hidden="true" className="size-[18px]" strokeWidth={1.7} /></span>
                <span className="min-w-0"><span className="block text-[11px] font-medium leading-4 text-[#71798A]">{item.label}</span><span className="mt-0.5 block break-words text-[13px] font-extrabold leading-[17px] text-[#172039]">{item.value}</span>{item.showCharges && <button type="button" onClick={onCharges} className="mt-0.5 text-[10px] font-bold text-[#8B5C00] underline decoration-dotted underline-offset-2 hover:text-[#614000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A437]">+ Charges</button>}</span>
              </div>;
            }

            if (item.key === "area" && item.label === "Total Land Area" && info.landBreakdown.length > 0) {
              return <div key={item.key} ref={landRef} className={`relative rounded-[12px] ${landOpen ? "z-30" : ""}`}>
                <button type="button" aria-expanded={landOpen} aria-controls="project-land-breakdown" onClick={() => setLandOpen((open) => !open)} className={`group flex min-h-[72px] size-full min-w-0 items-center gap-2.5 rounded-[12px] border bg-white px-3 py-3 text-left shadow-[0_2px_8px_rgba(16,24,40,0.04)] transition-[background-color,border-color,box-shadow] duration-200 hover:border-[#E4C16D] hover:bg-[#FFFAEE] hover:shadow-[0_10px_22px_rgba(73,55,16,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A437] ${landOpen ? "border-[#D9A437] bg-[#FFFAEE] shadow-[0_10px_22px_rgba(73,55,16,0.12)]" : "border-[#DDE2EA]"}`}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#F0D79F] bg-[#FFFAF0] text-[#C48608] transition-colors group-hover:border-[#D9A437] group-hover:bg-[#FFF4D6]"><Trees aria-hidden="true" className="size-[18px]" strokeWidth={1.7} /></span>
                  <span className="min-w-0 flex-1"><span className="flex items-center gap-0.5 text-[11px] font-medium leading-4 text-[#71798A]">{item.label}<ChevronDown aria-hidden="true" className={`size-3 shrink-0 transition-transform ${landOpen ? "rotate-180" : ""}`} /></span><span className="mt-0.5 block break-words text-[13px] font-extrabold leading-[17px] text-[#172039]">{item.value}</span></span>
                </button>
                {landOpen && <div id="project-land-breakdown" className="absolute left-1/2 top-[calc(100%+8px)] z-40 w-[min(270px,calc(100vw-32px))] -translate-x-1/2 rounded-[10px] border border-[#E2B95E] bg-white p-3 shadow-[0_16px_38px_rgba(35,29,14,0.18)]" role="region" aria-label="Land area breakdown">
                  <span aria-hidden="true" className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-[#E2B95E] bg-white" />
                  {info.landBreakdown.map(({ label, value }, index) => <div key={label} className={`flex items-center justify-between gap-4 py-2 text-[11px] ${index ? "border-t border-[#E7E9ED]" : ""}`}><span className="font-medium text-[#596277]">{label}</span><span className="text-right font-extrabold text-[#172039]">{value}</span></div>)}
                </div>}
              </div>;
            }

            return <LedgerItem key={item.key} icon={ledgerIcons[item.key]} label={item.label} value={item.value} />;
          })}
        </div>}

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
