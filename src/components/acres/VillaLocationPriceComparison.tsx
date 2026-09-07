"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, Loader2, RotateCcw } from "lucide-react";
import type { Property } from "./mock-data";
import { fetchLocationPriceComparison, type LocationPriceComparison } from "@/lib/api";

type Unit = "sqft" | "sqm" | "sqyd";

const UNITS: Array<[Unit, string]> = [["sqft", "Sq. Ft."], ["sqm", "Sq. Metre"], ["sqyd", "Sq. Yard"]];
const COLORS = ["#E0A826", "#445A9E", "#159A9C", "#8A5EB6", "#DC6B58"];
const SHORT_LABELS: Record<string, string> = { "Sarjapur Road": "Sarjapur", "This locality": "Local", "Electronic City": "E-City" };

function converted(value: number, unit: Unit) {
  return unit === "sqm" ? value * 10.7639 : unit === "sqyd" ? value * 9 : value;
}

function formatCurrency(value: number) {
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(value >= 1_000_000 ? 2 : 1)} L`;
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function keyFor(value: string) {
  return value.trim().toLocaleLowerCase();
}

export default function VillaLocationPriceComparison({ property }: { property: Property }) {
  const [unit, setUnit] = useState<Unit>("sqft");
  const [data, setData] = useState<LocationPriceComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const loadComparison = async () => {
      try {
        const result = await fetchLocationPriceComparison(property.id);
        if (active) setData(result);
      } catch {
        if (active) {
          setData(null);
          setError("Couldn’t load the live locality averages.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadComparison();
    return () => { active = false; };
  }, [property.id, requestVersion]);

  const currentLocation = data?.currentLocation || "";
  const values = data?.comparisons || [];
  const isMonthlyRent = data?.comparisonMetric === "monthlyRentPerBed" || property.propertyType === "PG/Co-living";
  const comparisonReady = data?.comparisonBasis === "verified_nearby_localities" && values.length >= 2;
  const max = Math.max(...values.map((item) => converted(item.averagePricePerSqft, unit)), 1);
  const currentKey = keyFor(currentLocation);

  return (
    <aside aria-label={`${property.propertyType || "Property"} location price comparison`} className="flex min-h-0 flex-col overflow-hidden rounded-[14px] border border-[#E1E3E6] bg-[#FCFCFD]">
      <div className="border-b border-[#E6E8EB] px-3.5 py-3">
        <div className="flex items-center gap-2"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF5D8] text-[#8B6714]"><BarChart3 className="size-4" /></span><div className="min-w-0"><p className="truncate text-[13px] font-extrabold text-[#1D2433]">Location Price Comparison</p><p className="text-[10px] text-[#737B88]">{isMonthlyRent ? "Nearest locality rent averages" : "Nearest locality sale-price averages"}</p></div></div>
        {!isMonthlyRent && <div className="mt-2.5 grid grid-cols-3 rounded-lg border border-[#E1E3E6] bg-[#F7F8FA] p-0.5">
          {UNITS.map(([value, label]) => <button key={value} type="button" onClick={() => setUnit(value)} className={`min-w-0 rounded-md px-1 py-1.5 text-[9px] font-bold transition-colors ${unit === value ? "bg-[#172039] text-white shadow-sm" : "text-[#687080] hover:bg-white"}`}><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{value === "sqft" ? "Sq.Ft" : value === "sqm" ? "Sq.M" : "Sq.Yd"}</span></button>)}
        </div>}
      </div>
      <div className="min-h-0 flex-1 px-3.5 py-3">
        {loading && <div className="flex h-full min-h-[150px] items-center justify-center gap-2 text-[11px] text-[#737B88]"><Loader2 className="size-4 animate-spin" /> Calculating live averages…</div>}

        {!loading && error && <div role="alert" className="flex h-[188px] flex-col items-center justify-center rounded-lg border border-dashed border-[#E4C98D] bg-[#FFF9ED] px-4 text-center"><AlertTriangle className="mb-2 size-5 text-[#A2771A]" /><p className="text-[11px] font-extrabold text-[#604A1B]">Nearby comparison couldn’t load</p><p className="mt-1 text-[9px] text-[#7A6842]">The project price has not been changed.</p><button type="button" onClick={() => setRequestVersion((value) => value + 1)} className="mt-2 inline-flex items-center gap-1 rounded-md border border-[#DEC17F] bg-white px-2 py-1 text-[9px] font-extrabold text-[#765917] hover:bg-[#FFF5D8]"><RotateCcw className="size-3" /> Retry</button></div>}

        {!loading && !error && comparisonReady && <>
          <div className="grid h-[188px] items-end gap-2.5 border-b border-[#EDF0F3] pb-2" style={{ gridTemplateColumns: `repeat(${Math.max(values.length, 4)}, minmax(0, 1fr))` }}>{values.map((item, index) => {
            const value = converted(item.averagePricePerSqft, unit);
            const current = item.key === currentKey;
            const label = SHORT_LABELS[item.location] || (item.location.length > 10 ? `${item.location.slice(0, 9)}…` : item.location);
            const firstColumn = index === 0 && values.length < 4 ? Math.ceil((4 - values.length) / 2) + 1 : undefined;
            return <div key={item.key} className="flex min-w-0 flex-col items-center justify-end text-center" style={{ gridColumnStart: firstColumn }}>
              <p className="mb-1 whitespace-nowrap text-[9px] font-extrabold text-[#1D2433]">{formatCurrency(value)}</p>
              <div className="flex h-[112px] w-full items-end rounded-t-lg bg-[#F0F2F5] px-1">
                <div className="w-full rounded-t-md shadow-[0_-2px_8px_rgba(31,43,67,0.12)] transition-[height] duration-500" style={{ height: `${Math.max(22, (value / max) * 100)}%`, background: `linear-gradient(180deg, ${COLORS[index]} 0%, ${COLORS[index]}B8 100%)` }} />
              </div>
              <p title={item.location} className={`mt-1.5 w-full truncate text-[9px] font-bold ${current ? "text-[#9A741E]" : "text-[#59616F]"}`}>{label}</p>
              <p className="whitespace-nowrap text-[8px] text-[#8A919C]">{current ? "Current" : `${item.distanceKm?.toFixed(1)} km`} · {item.projectCount} proj.</p>
            </div>;
          })}</div>
        </>}

        {!loading && !error && !comparisonReady && <div className="flex h-[188px] flex-col items-center justify-center rounded-lg border border-dashed border-[#D9DDE3] bg-[#F8F9FA] px-4 text-center"><BarChart3 className="mb-2 size-5 text-[#9AA1AC]" /><p className="text-[11px] font-extrabold text-[#353D4B]">Nearby comparison data unavailable</p><p className="mt-1 max-w-[230px] text-[9px] leading-4 text-[#737B88]">Verified coordinates and priced projects in another nearby locality are required.</p></div>}

        {!loading && !error && <div className="mt-2.5 rounded-lg bg-[#F7F8FA] px-2.5 py-2 text-center text-[9px] font-medium text-[#727A87]">{comparisonReady ? `${isMonthlyRent ? "Monthly rent per bed" : `Price per ${unit === "sqm" ? "sq. metre" : unit === "sqyd" ? "sq. yard" : "sq. ft."}`} · Nearest verified areas` : "No estimated or example locality prices shown"}</div>}
      </div>
    </aside>
  );
}
