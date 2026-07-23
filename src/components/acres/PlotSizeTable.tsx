import type { PlotSizeDetail } from "./mock-data";
import { formatPlotPrice } from "@/lib/plotDetails";

export default function PlotSizeTable({ details }: { details: PlotSizeDetail[] }) {
  return <div className="overflow-x-auto"><table className="min-w-[680px] w-full text-[13px]"><thead className="bg-[#121B35] text-white"><tr><th className="p-3 text-left">Plot size</th><th className="p-3 text-left">Area</th><th className="p-3 text-left">Price / sqft</th><th className="p-3 text-left">Total price</th><th className="p-3 text-left">Facing options</th></tr></thead><tbody>{details.map((row) => <tr key={row.plotSize} className="border-b border-[#F3F1F5]"><td className="p-3 font-semibold text-[#121B35]">{row.plotSize}</td><td className="p-3">{row.areaSqft.toLocaleString("en-IN")} sqft</td><td className="p-3">₹{row.pricePerSqft.toLocaleString("en-IN")}</td><td className="p-3 font-semibold">{formatPlotPrice(row.totalPrice || row.areaSqft * row.pricePerSqft)}</td><td className="p-3">{row.facings.join(", ")}</td></tr>)}</tbody></table></div>;
}
