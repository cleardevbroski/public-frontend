"use client";

import { useState } from "react";
import type { PlotInventoryItem } from "./mock-data";

export default function PlotInventoryTable({ inventory }: { inventory: PlotInventoryItem[] }) {
  const [status, setStatus] = useState<"All" | PlotInventoryItem["status"]>("Available");
  const rows = status === "All" ? inventory : inventory.filter((item) => item.status === status);
  return <div className="space-y-3"><div className="flex flex-wrap gap-2">{(["Available", "Booked", "Sold", "All"] as const).map((value) => <button type="button" key={value} onClick={() => setStatus(value)} className={`px-3 py-1.5 rounded-full text-[12px] font-bold border ${status === value ? "bg-[#C9A24E] text-white border-[#C9A24E]" : "bg-white border-[#D5DEF2] text-[#243559]"}`}>{value} ({value === "All" ? inventory.length : inventory.filter((item) => item.status === value).length})</button>)}</div><div className="overflow-x-auto"><table className="min-w-[560px] w-full text-[13px]"><thead className="bg-[#1E3A8A] text-white"><tr><th className="p-3 text-left">Plot no.</th><th className="p-3 text-left">Size</th><th className="p-3 text-left">Facing</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Corner</th></tr></thead><tbody>{rows.map((item) => <tr key={item.plotNumber} className="border-b border-[#E2E9FB]"><td className="p-3 font-semibold text-[#1E3A8A]">{item.plotNumber}</td><td className="p-3">{item.plotSize}</td><td className="p-3">{item.facing}</td><td className="p-3"><span className={`px-2 py-1 rounded-full text-[11px] font-bold ${item.status === "Available" ? "bg-emerald-100 text-emerald-700" : item.status === "Booked" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{item.status}</span></td><td className="p-3">{item.isCorner ? "Yes" : "No"}</td></tr>)}</tbody></table></div></div>;
}
