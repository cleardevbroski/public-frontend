import type { PlotSizeDetail } from "./mock-data";
import { formatPlotPrice } from "@/lib/plotDetails";
import { Compass, Maximize2, Ruler } from "lucide-react";

export default function PlotSizeTable({ details }: { details: PlotSizeDetail[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {details.map((row, index) => (
        <article key={`${row.plotSize}-${index}`} className="overflow-hidden rounded-2xl border border-[#E4E0E7] bg-white hover:border-[#DDAA42]/60 hover:shadow-lg transition-all">
          <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-[#121B35] to-[#273559] px-5 py-4 text-white">
            <div>
              {row.plotSize && <h3 className="text-[18px] font-extrabold">{row.plotSize}</h3>}
            </div>
            {row.totalPrice || row.pricePerSqft ? <div className="text-right">
              {row.totalPrice && <p className="text-[19px] font-extrabold text-[#F2C052]">{formatPlotPrice(row.totalPrice)}</p>}
              {row.pricePerSqft && <p className="mt-1 text-[10px] font-semibold text-white/55">₹{row.pricePerSqft.toLocaleString("en-IN")} / sq ft</p>}
            </div> : null}
          </div>
          {(row.areaSqft || (row.width && row.length) || row.facings?.length) ? <div className="grid grid-cols-3 gap-px bg-[#EAE7ED]">
            {row.areaSqft ? <div className="bg-white px-4 py-3.5">
              <Maximize2 className="size-4 text-[#DDAA42]" />
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#77717E]">Area</p>
              <p className="mt-0.5 text-[13px] font-bold text-[#121B35]">{row.areaSqft.toLocaleString("en-IN")} sq ft</p>
            </div> : null}
            {row.width && row.length ? <div className="bg-white px-4 py-3.5">
              <Ruler className="size-4 text-[#DDAA42]" />
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#77717E]">Dimensions</p>
              <p className="mt-0.5 text-[13px] font-bold text-[#121B35]">{row.width} × {row.length} ft</p>
            </div> : null}
            {row.facings?.length ? <div className="bg-white px-4 py-3.5">
              <Compass className="size-4 text-[#DDAA42]" />
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#77717E]">Facings</p>
              <p className="mt-0.5 text-[13px] font-bold text-[#121B35]">{row.facings.join(", ")}</p>
            </div> : null}
          </div> : null}
        </article>
      ))}
    </div>
  );
}
