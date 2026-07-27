"use client";

import { useState } from "react";
import type { PlotInventoryItem } from "./mock-data";

export default function PlotInventoryTable({ inventory }: { inventory: PlotInventoryItem[] }) {
  const [status, setStatus] = useState<"All" | PlotInventoryItem["status"]>("All");
  const filters = ["All", ...Array.from(new Set(inventory.map((item) => item.status).filter(Boolean)))] as const;
  const rows = status === "All" ? inventory : inventory.filter((item) => item.status === status);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((value) => (
          <button type="button" key={value} onClick={() => setStatus(value)} className={`px-3 py-1.5 rounded-full text-[12px] font-bold border ${status === value ? "bg-[#121B35] text-white border-[#121B35]" : "bg-white border-[#E4E0E7] text-[#3F3D46] hover:border-[#DDAA42]"}`}>
            {value} · {value === "All" ? inventory.length : inventory.filter((item) => item.status === value).length}
          </button>
        ))}
      </div>
      {rows.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((item, index) => (
            <article key={item.plotNumber || index} className="rounded-2xl border border-[#E4E0E7] bg-[#FCFBFC] p-4">
              <div className="flex items-start justify-between gap-3">
                {item.plotNumber && <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77717E]">Plot number</p>
                  <p className="mt-0.5 text-[18px] font-extrabold text-[#121B35]">{item.plotNumber}</p>
                </div>}
                {item.status && <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${item.status === "Available" ? "bg-emerald-100 text-emerald-700" : item.status === "Booked" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}>{item.status}</span>}
              </div>
              {(item.plotSize || item.facing || item.isCorner) && <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-[#5F5965]">
                {item.plotSize && <span><strong className="text-[#121B35]">{item.plotSize}</strong> size</span>}
                {item.facing && <span><strong className="text-[#121B35]">{item.facing}</strong> facing</span>}
                {item.isCorner && <span className="font-bold text-[#9A741E]">Corner plot</span>}
              </div>}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#D8D2DC] bg-[#FCFBFC] px-5 py-8 text-center text-[13px] font-semibold text-[#77717E]">
          No {status.toLowerCase()} plots in the current inventory.
        </div>
      )}
    </div>
  );
}
