"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ConfigurationDetail } from "./mock-data";
import {
  calculateUnitPriceRange,
  formatAreaValue,
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

function sourceArea(detail: ConfigurationDetail): string {
  if (detail.superBuiltUpArea?.trim()) return detail.superBuiltUpArea;
  if (detail.builtUpArea?.trim()) return detail.builtUpArea;
  return detail.carpetArea;
}

function basePrice(value: string): string {
  return value.replace(/\s*\+\s*charges?\s*$/i, "").trim();
}

export default function ApartmentPriceList({ title, details, onChargesClick }: { title: string; details: ConfigurationDetail[]; onChargesClick?: () => void }) {
  const [selectedUnits, setSelectedUnits] = useState<Record<string, AreaUnit>>({});
  if (!details.length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#DCE1EA] bg-white shadow-sm" aria-labelledby="price-list-heading">
      <div className="border-b border-[#E5E8EE] px-5 py-4 md:px-6">
        <h2 id="price-list-heading" className="text-[21px] font-extrabold text-[#172039]">{title} Price List</h2>
      </div>
      <div className="p-3 md:p-5">
        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] gap-3 rounded-t-xl bg-[#F0F2F5] px-4 py-3 text-[11px] font-semibold text-[#39445A] md:px-5 md:text-[13px]">
          <span>Unit Type (Saleable)</span>
          <span>Price per Unit</span>
          <span className="text-right">Price<sup>+</sup></span>
        </div>
        <div className="divide-y divide-[#E4E8EF] overflow-hidden rounded-b-xl border border-t-0 border-[#DDE2EA]">
          {details.map((detail, index) => {
            const rowKey = detail.id || `${detail.configuration}-${index}`;
            const unit = selectedUnits[rowKey] || "sqft";
            const source = sourceArea(detail);
            const area = parseAreaRange(source);
            const price = parseInrPriceRange(detail.price);
            const unitRate = area && price ? calculateUnitPriceRange(price, area, unit) : undefined;
            const unitType = /\bapartment\b/i.test(detail.configuration)
              ? detail.configuration
              : `${detail.configuration} Apartment`;

            return (
              <div key={rowKey} className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-[12px] md:px-5 md:text-[14px]">
                <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 font-extrabold text-[#172039]">
                  <span>{unitType}</span>
                  {area ? (
                    <>
                      <span className="whitespace-nowrap text-[#39445A]">{formatAreaValue(area, unit)}</span>
                      <label className="relative inline-flex min-h-11 items-center">
                        <span className="sr-only">Area unit for {unitType}</span>
                        <select
                          value={unit}
                          onChange={(event) => setSelectedUnits((current) => ({ ...current, [rowKey]: event.target.value as AreaUnit }))}
                          aria-label={`Area unit for ${unitType}`}
                          className="h-9 cursor-pointer appearance-none rounded-md border border-transparent bg-transparent py-1 pl-1 pr-6 text-[13px] font-extrabold text-[#39445A] underline decoration-dotted underline-offset-4 outline-none transition hover:border-[#D8DEE8] focus:border-[#C8A258] focus:ring-2 focus:ring-[#C8A258]/25 md:text-[14px]"
                        >
                          {unitOptions.map((option) => <option key={option.unit} value={option.unit}>{option.label}</option>)}
                        </select>
                        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-1.5 size-3.5 text-[#596277]" />
                      </label>
                    </>
                  ) : (
                    <span className="font-semibold text-[#667085]">{source?.trim() || "Area unavailable"}</span>
                  )}
                </div>
                <p className="font-extrabold leading-5 text-[#172039]">{unitRate ? formatInrUnitRate(unitRate, unit) : "Price per unit unavailable"}</p>
                <div className="text-right">
                  <p className="whitespace-nowrap font-extrabold text-[#172039]">{basePrice(detail.price)}</p>
                  {onChargesClick ? <button type="button" onClick={onChargesClick} className="mt-0.5 whitespace-nowrap text-[10.5px] font-bold text-[#9A6B12] underline decoration-dotted underline-offset-2">+ Charges</button> : <p className="mt-0.5 whitespace-nowrap text-[10.5px] font-bold text-[#9A6B12]">+ Charges</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
