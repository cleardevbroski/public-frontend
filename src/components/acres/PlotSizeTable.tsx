"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PlotSizeDetail } from "./mock-data";
import { formatPlotPrice } from "@/lib/plotDetails";
import {
  calculateUnitPriceRange,
  formatAreaValue,
  formatInrUnitRate,
  type AreaUnit,
} from "@/lib/projectEnhancements";

const unitOptions: Array<{ unit: AreaUnit; label: string }> = [
  { unit: "sqft", label: "Sq. Ft." },
  { unit: "sqm", label: "Sq. Metre" },
  { unit: "sqyd", label: "Sq. Yard" },
];

export default function PlotSizeTable({ details, onChargesClick }: { details: PlotSizeDetail[]; onChargesClick?: () => void }) {
  const [selectedUnits, setSelectedUnits] = useState<Record<string, AreaUnit>>({});
  if (!details.length) return null;

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] gap-3 rounded-t-xl bg-[#F0F2F5] px-4 py-3 text-[11px] font-semibold text-[#39445A] md:px-5 md:text-[13px]">
        <span>Plot Type (Saleable)</span>
        <span>Price per Unit</span>
        <span className="text-right">Price<sup>+</sup></span>
      </div>
      <div className="divide-y divide-[#E4E8EF] overflow-hidden rounded-b-xl border border-t-0 border-[#DDE2EA]">
        {details.map((row, index) => {
          const rowKey = `${row.plotSize}-${index}`;
          const unit = selectedUnits[rowKey] || "sqft";
          const area = row.areaSqft > 0 ? { min: row.areaSqft, max: row.areaSqft } : undefined;
          const price = row.totalPrice > 0 ? { min: row.totalPrice, max: row.totalPrice } : undefined;
          const unitRate = area && price ? calculateUnitPriceRange(price, area, unit) : undefined;
          const dimensions = row.width && row.length ? `${row.width} × ${row.length} ft` : row.plotSize;

          return (
            <div key={rowKey} className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-[12px] md:px-5 md:text-[14px]">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 font-extrabold text-[#172039]">
                  <span>{row.plotSize ? `${row.plotSize} Plot` : "Residential Plot"}</span>
                  {area && <span className="whitespace-nowrap text-[#39445A]">{formatAreaValue(area, unit)}</span>}
                  {area && (
                    <label className="relative inline-flex min-h-11 items-center">
                      <span className="sr-only">Area unit for {row.plotSize || "plot"}</span>
                      <select
                        value={unit}
                        onChange={(event) => setSelectedUnits((current) => ({ ...current, [rowKey]: event.target.value as AreaUnit }))}
                        aria-label={`Area unit for ${row.plotSize || "plot"}`}
                        className="h-9 cursor-pointer appearance-none rounded-md border border-transparent bg-transparent py-1 pl-1 pr-6 text-[13px] font-extrabold text-[#39445A] underline decoration-dotted underline-offset-4 outline-none transition hover:border-[#D8DEE8] focus:border-[#C8A258] focus:ring-2 focus:ring-[#C8A258]/25 md:text-[14px]"
                      >
                        {unitOptions.map((option) => <option key={option.unit} value={option.unit}>{option.label}</option>)}
                      </select>
                      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-1.5 size-3.5 text-[#596277]" />
                    </label>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-[10.5px] font-medium text-[#737B88]">
                  {dimensions}{row.facings?.length ? ` · ${row.facings.join(", ")} facing` : ""}
                </p>
              </div>
              <p className="font-extrabold leading-5 text-[#172039]">
                {unitRate ? formatInrUnitRate(unitRate, unit) : row.pricePerSqft ? `₹${row.pricePerSqft.toLocaleString("en-IN")} / Sq. Ft.` : "Price per unit unavailable"}
              </p>
              <div className="text-right">
                <p className="whitespace-nowrap font-extrabold text-[#172039]">{row.totalPrice ? formatPlotPrice(row.totalPrice) : "Price unavailable"}</p>
                {onChargesClick ? <button type="button" onClick={onChargesClick} className="mt-0.5 whitespace-nowrap text-[10.5px] font-bold text-[#9A6B12] underline decoration-dotted underline-offset-2">+ Charges</button> : <p className="mt-0.5 whitespace-nowrap text-[10.5px] font-bold text-[#9A6B12]">+ Charges</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
