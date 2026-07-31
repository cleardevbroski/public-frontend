"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import type { ConfigurationDetail } from "./mock-data";
import { priceWithCharges } from "@/lib/propertyPresentation";
import {
  calculateUnitPriceRange,
  formatAreaMeasurement,
  formatInrUnitRate,
  parseAreaRange,
  parseInrPriceRange,
  type AreaUnit,
} from "@/lib/projectEnhancements";

const unitOptions: Array<{ unit: AreaUnit; label: string }> = [
  { unit: "sqft", label: "Sq. Ft." },
  { unit: "sqm", label: "Sq. Metre" },
  { unit: "sqyd", label: "Sq. Yard" },
];

function sourceArea(detail: ConfigurationDetail) {
  if (detail.superBuiltUpArea?.trim()) return { value: detail.superBuiltUpArea, label: "Super built-up area" };
  if (detail.builtUpArea?.trim()) return { value: detail.builtUpArea, label: "Built-up area" };
  return { value: detail.carpetArea, label: "Carpet area" };
}

export default function ApartmentPriceList({ title, details }: { title: string; details: ConfigurationDetail[] }) {
  const [selectedUnits, setSelectedUnits] = useState<Record<string, AreaUnit>>({});
  if (!details.length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#DCE1EA] bg-white shadow-sm" aria-labelledby="price-list-heading">
      <div className="border-b border-[#E5E8EE] px-5 py-5 md:px-7">
        <h2 id="price-list-heading" className="text-[21px] font-extrabold text-[#172039]">{title} Price List</h2>
        <p className="mt-1 text-[11px] text-[#667085]">Area and base-price calculations exclude registration, taxes, maintenance, and other additional charges.</p>
      </div>
      <div className="p-4 md:p-6">
        <div className="hidden grid-cols-[1.45fr_1fr_0.8fr] bg-[#F0F2F5] px-6 py-4 text-[13px] font-semibold text-[#39445A] md:grid">
          <span>Unit Type &amp; Area</span>
          <span>Base Price per Unit</span>
          <span>Price<sup>+</sup></span>
        </div>
        <div className="divide-y divide-[#E4E8EF] overflow-hidden rounded-xl border border-[#DDE2EA] md:rounded-t-none md:border-t-0">
          {details.map((detail, index) => {
            const rowKey = detail.id || `${detail.configuration}-${index}`;
            const unit = selectedUnits[rowKey] || "sqft";
            const source = sourceArea(detail);
            const area = parseAreaRange(source.value);
            const price = parseInrPriceRange(detail.price);
            const unitRate = area && price ? calculateUnitPriceRange(price, area, unit) : undefined;
            const isRange = Boolean(area && price && (area.min !== area.max || price.min !== price.max));
            return (
              <div key={rowKey} className="grid gap-5 px-5 py-5 text-[14px] md:min-h-28 md:grid-cols-[1.45fr_1fr_0.8fr] md:items-center md:px-6">
                <div>
                  <div className="flex items-start gap-3 font-extrabold text-[#172039]">
                    <Building2 className="mt-0.5 size-5 shrink-0 text-[#56627A]" />
                    <div>
                      <p>{detail.configuration} Apartment</p>
                      <p className="mt-1 text-[15px] font-extrabold text-[#39445A]">{area ? formatAreaMeasurement(area, unit) : source.value || "Area unavailable"}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-[#7A8599]">{source.label}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 pl-8" role="group" aria-label={`Area unit for ${detail.configuration} Apartment`}>
                    {unitOptions.map((option) => (
                      <button
                        key={option.unit}
                        type="button"
                        aria-pressed={unit === option.unit}
                        onClick={() => setSelectedUnits((current) => ({ ...current, [rowKey]: option.unit }))}
                        className={`rounded-md border px-2.5 py-1.5 text-[10px] font-bold transition ${unit === option.unit ? "border-[#172039] bg-[#172039] text-white" : "border-[#D8DEE8] bg-white text-[#596277] hover:border-[#C8A258]"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A8599] md:hidden">Base Price per Unit</p>
                  <p className="mt-1 font-extrabold text-[#172039]">{unitRate ? formatInrUnitRate(unitRate, unit) : "Price per unit unavailable"}</p>
                  <p className="mt-1 text-[10px] font-semibold text-[#7A8599]">{isRange ? "Calculated range · excludes additional charges" : "Excludes additional charges"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A8599] md:hidden">Total Base Price</p>
                  <p className="mt-1 font-extrabold text-[#172039]">{priceWithCharges(detail.price)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
