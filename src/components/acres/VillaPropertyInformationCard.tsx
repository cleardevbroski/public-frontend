"use client";

import {
  Bath,
  BedDouble,
  Box,
  Building2,
  CalendarDays,
  Car,
  CookingPot,
  ContactRound,
  DoorOpen,
  Grid2X2,
  Layers3,
  Map,
  PanelsTopLeft,
  Phone,
  Scan,
  ShieldCheck,
  Sofa,
  Tag,
  Users,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Property, VillaConfigurationDetail } from "./mock-data";

type Props = {
  property: Property;
  onCharges: () => void;
  onViewNumber: () => void;
  onRequestCall: () => void;
};

type VillaInformation = {
  price: string;
  area: string;
  bedrooms: string;
  additionalSpaces: string;
  bathrooms: string;
  view: string;
  possession: string;
};

export type PropertyInformationFact = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export type PropertyInformation = {
  price: string;
  facts: PropertyInformationFact[];
};

const present = (value?: string | number) =>
  value === undefined || value === null || String(value).trim() === ""
    ? "Not provided"
    : String(value).trim();

const withoutCharges = (price: string) => price.replace(/\s*\+\s*charges?\s*$/i, "").trim();

const money = (value?: number) => value ? `₹${value.toLocaleString("en-IN")}` : "Not provided";
const date = (value?: string) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not provided";

function villaFeature(
  row: VillaConfigurationDetail | undefined,
  property: Property,
  key: "privateGarden" | "privatePool" | "terrace",
) {
  return row?.[key] ?? property.villaDetails?.[key];
}

export function getVillaInformation(property: Property): VillaInformation {
  const row = property.villaDetails?.configurationDetails?.[0];
  const spaces = [
    villaFeature(row, property, "privateGarden") ? "Private Garden" : "",
    villaFeature(row, property, "privatePool") ? "Private Pool" : "",
    villaFeature(row, property, "terrace") ? "Terrace" : "",
  ].filter(Boolean);
  const facing = row?.plotFacing || property.villaDetails?.plotFacing || property.facing;

  return {
    price: present(withoutCharges(row?.price || property.price || "")),
    area: present(row?.superArea || row?.builtUpArea || row?.plotArea || property.area),
    bedrooms: row?.bedrooms ? `${row.bedrooms} Bedroom${row.bedrooms === 1 ? "" : "s"}` : present(property.bedrooms ? `${property.bedrooms} Bedrooms` : ""),
    additionalSpaces: present(spaces.join(", ")),
    bathrooms: row?.bathrooms ? `${row.bathrooms} Bathroom${row.bathrooms === 1 ? "" : "s"}` : present(property.bathrooms ? `${property.bathrooms} Bathrooms` : ""),
    view: present(property.overlooking?.filter(Boolean).join(", ") || (facing ? `${facing} Facing` : "")),
    possession: present(property.possessionDetails?.status || property.possession),
  };
}

function villaInformation(property: Property): PropertyInformation {
  const info = getVillaInformation(property);
  return { price: info.price, facts: [
    { label: "Area", value: info.area, icon: Scan },
    { label: "Bedroom", value: info.bedrooms, icon: BedDouble },
    { label: "Additional Spaces", value: info.additionalSpaces, icon: Box },
    { label: "Bath", value: info.bathrooms, icon: Bath },
    { label: "View", value: info.view, icon: PanelsTopLeft },
    { label: "Possession Status", value: info.possession, icon: Building2 },
  ] };
}

export function getPropertyInformation(property: Property): PropertyInformation {
  if (property.villaDetails || property.propertyType === "Villa") return villaInformation(property);

  if (property.plotDetails || property.propertyType === "Plot") {
    const plot = property.plotDetails;
    const row = plot?.plotSizeDetails?.[0];
    const available = plot?.inventory?.filter((item) => item.status === "Available").length;
    return { price: present(withoutCharges(property.price || (row?.totalPrice ? money(row.totalPrice) : ""))), facts: [
      { label: "Plot Area", value: present(row?.areaSqft ? `${row.areaSqft.toLocaleString("en-IN")} Sq.Ft.` : property.area), icon: Scan },
      { label: "Plot Size", value: present(row?.plotSize), icon: Grid2X2 },
      { label: "Facing", value: present(row?.facings?.join(", ") || property.facing), icon: PanelsTopLeft },
      { label: "Available Plots", value: available === undefined ? "Not provided" : `${available} of ${plot?.totalPlots || plot?.inventory?.length || available}`, icon: Map },
      { label: "Approval", value: present(plot?.approvalAuthority), icon: ShieldCheck },
      { label: "Layout Status", value: present(plot?.layoutPossession?.status || property.possessionDetails?.status || property.possession), icon: Building2 },
    ] };
  }

  if (property.commercialDetails || property.propertyType === "Commercial") {
    const commercial = property.commercialDetails;
    return { price: present(withoutCharges(property.price || "")), facts: [
      { label: "Area", value: present(commercial?.superArea || commercial?.builtUpArea || commercial?.carpetArea || property.area), icon: Scan },
      { label: "Property Type", value: present(commercial?.commercialSubtype), icon: Building2 },
      { label: "Floor", value: present(commercial?.floor || property.floor), icon: Layers3 },
      { label: "Furnishing", value: present(commercial?.furnishing || property.furnishing), icon: Sofa },
      { label: "Workspace", value: commercial?.seatingCapacity ? `${commercial.seatingCapacity} seats${commercial.cabins ? ` · ${commercial.cabins} cabins` : ""}` : "Not provided", icon: Users },
      { label: "Parking", value: present(commercial?.parking || property.parking), icon: Car },
    ] };
  }

  if (property.pgDetails || property.propertyType === "PG/Co-living") {
    const pg = property.pgDetails;
    const row = pg?.sharingDetails?.[0];
    return { price: present(withoutCharges(property.price || (row?.rentPerBed ? `${money(row.rentPerBed)} / month` : ""))), facts: [
      { label: "Occupancy", value: present(row?.sharingType), icon: DoorOpen },
      { label: "Beds Available", value: row?.bedsAvailable === undefined ? "Not provided" : String(row.bedsAvailable), icon: BedDouble },
      { label: "For", value: present(pg?.genderPreference), icon: Users },
      { label: "Meals", value: present(pg?.mealsIncluded), icon: Utensils },
      { label: "Food Type", value: present(pg?.foodType), icon: CookingPot },
      { label: "Available From", value: date(pg?.availableFrom), icon: CalendarDays },
    ] };
  }

  const apartment = property.configurationDetails?.[0];
  return { price: present(withoutCharges(apartment?.price || property.price || "")), facts: [
    { label: "Area", value: present(apartment?.builtUpArea || apartment?.superBuiltUpArea || apartment?.carpetArea || property.area), icon: Scan },
    { label: "Bedroom", value: apartment?.bedrooms ? `${apartment.bedrooms} Bedroom${apartment.bedrooms === 1 ? "" : "s"}` : present(property.configs?.[0]), icon: BedDouble },
    { label: "Balcony", value: apartment?.balconies === undefined ? "Not provided" : `${apartment.balconies} Balcon${apartment.balconies === 1 ? "y" : "ies"}`, icon: Box },
    { label: "Bath", value: apartment?.bathrooms ? `${apartment.bathrooms} Bathroom${apartment.bathrooms === 1 ? "" : "s"}` : present(property.bathrooms ? `${property.bathrooms} Bathrooms` : ""), icon: Bath },
    { label: "Facing / View", value: present(property.overlooking?.filter(Boolean).join(", ") || apartment?.facings?.join(", ") || property.facing), icon: PanelsTopLeft },
    { label: "Possession Status", value: present(property.possessionDetails?.status || property.possession), icon: Building2 },
  ] };
}

export default function VillaPropertyInformationCard({ property, onCharges, onViewNumber, onRequestCall }: Props) {
  const info = getPropertyInformation(property);
  const facts = info.facts;

  return (
    <section
      aria-label={`${property.propertyType || "Property"} property information`}
      className="w-full max-w-[800px] overflow-hidden rounded-[14px] border border-[#E1E3E6] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.025)]"
      style={{ fontFamily: "Inter, Arial, Helvetica, sans-serif" }}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-[#E6E8EB] px-5 py-[18px]">
        <Tag aria-hidden="true" className="size-9 shrink-0 text-[#747B87]" strokeWidth={1.65} />
        <p className="text-[25px] font-bold leading-none tracking-[-0.025em] text-[#1D2433] sm:text-[28px]">{info.price}</p>
        <button type="button" onClick={onCharges} className="text-[14px] font-medium text-[#4C5565] underline underline-offset-4 hover:text-[#1D2433] sm:text-[15px]">+ Charges</button>
      </div>

      <div className="grid sm:grid-cols-2">
        {facts.map(({ label, value, icon: Icon }, index) => (
          <div
            key={label}
            className={`flex items-center gap-3 border-[#E6E8EB] px-4 py-3.5 ${index < facts.length - 1 ? "border-b" : ""} ${index % 2 === 1 ? "sm:border-l" : ""} ${index >= facts.length - 2 ? "sm:border-b-0" : ""}`}
          >
            <Icon aria-hidden="true" className="size-9 shrink-0 text-[#7B838F]" strokeWidth={1.6} />
            <div className="min-w-0">
              <p className="text-[14px] font-normal leading-[18px] text-[#767D88] sm:text-[15px]">{label}</p>
              <p className="mt-[3px] break-words text-[18px] font-bold leading-6 tracking-[-0.015em] text-[#202633] sm:text-[20px]">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-2.5 border-t border-[#E6E8EB] px-5 py-3.5 sm:grid-cols-2">
        <button type="button" onClick={onViewNumber} className="inline-flex items-center justify-center gap-2.5 bg-white px-4 py-2.5 text-[16px] font-bold text-[#242B38] transition-colors hover:bg-[#FAFAFB] sm:text-[17px]">
          <ContactRound aria-hidden="true" className="size-5 text-[#59616E]" strokeWidth={1.7} />
          View Number
        </button>
        <button type="button" onClick={onRequestCall} className="inline-flex w-full items-center justify-center gap-2.5 rounded-[9px] bg-[#F4C430] px-5 py-2.5 text-[16px] font-bold text-[#201B0D] transition-colors hover:bg-[#E9B91F] sm:text-[17px]">
          <Phone aria-hidden="true" className="size-5" strokeWidth={1.8} />
          Request for Call
        </button>
      </div>
    </section>
  );
}
