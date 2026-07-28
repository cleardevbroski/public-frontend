import type { VillaConfigurationDetail } from "./mock-data";
import { Bath, Bed, Home, Maximize2 } from "lucide-react";

export default function VillaConfigurationTable({ details }: { details: VillaConfigurationDetail[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {details.map((row, index) => (
        <article
          key={`${row.configuration}-${row.plotArea}-${index}`}
          className="group overflow-hidden rounded-2xl border border-[#E4E0E7] bg-white transition-all hover:-translate-y-0.5 hover:border-[#DDAA42]/60 hover:shadow-lg"
        >
          <div className="flex items-start justify-between gap-4 bg-[#121B35] px-5 py-4 text-white">
            <div>
              {row.configuration && <h3 className="text-[18px] font-extrabold">{row.configuration}</h3>}
            </div>
            {row.price && <p className="text-right text-[19px] font-extrabold text-[#F2C052]">{row.price}</p>}
          </div>
          {[
            { icon: Home, label: "Plot area", value: row.plotArea },
            { icon: Maximize2, label: "Built-up area", value: row.builtUpArea },
            { icon: Bed, label: "Bedrooms", value: row.bedrooms },
            { icon: Bath, label: "Bathrooms", value: row.bathrooms },
          ].filter(({ value }) => value !== undefined && value !== "").length > 0 && <div className="grid grid-cols-2 gap-px bg-[#EAE7ED]">
            {[
              { icon: Home, label: "Plot area", value: row.plotArea },
              { icon: Maximize2, label: "Built-up area", value: row.builtUpArea },
              { icon: Bed, label: "Bedrooms", value: row.bedrooms },
              { icon: Bath, label: "Bathrooms", value: row.bathrooms },
            ].filter(({ value }) => value !== undefined && value !== "").map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white px-4 py-3.5">
                <Icon className="size-4 text-[#DDAA42]" />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#77717E]">{label}</p>
                <p className="mt-0.5 text-[14px] font-bold text-[#121B35]">{value}</p>
              </div>
            ))}
          </div>}
          {row.superArea && (
            <div className="flex items-center justify-between gap-3 border-t border-[#EAE7ED] bg-[#FCFBFC] px-5 py-3 text-[12px]">
              <span className="font-semibold text-[#77717E]">Total super area</span>
              <span className="font-extrabold text-[#121B35]">{row.superArea}</span>
            </div>
          )}
          {[
            ["Plot dimensions", row.plotDimensions],
            ["Floors", row.numberOfFloors],
            ["Plot facing", row.plotFacing],
            ["Corner plot", row.cornerPlot === true ? "Yes" : ""],
            ["Road width", row.roadWidthFacing],
            ["Private garden", row.privateGarden === true ? `Yes${row.privateGardenArea ? ` · ${row.privateGardenArea}` : ""}` : ""],
            ["Private pool", row.privatePool === true ? "Yes" : ""],
            ["Terrace", row.terrace === true ? `Yes${row.terraceDetails ? ` · ${row.terraceDetails}` : ""}` : ""],
            ["Gated community", row.gatedCommunity === true ? "Yes" : ""],
          ].some(([, value]) => Boolean(value)) && <div className="grid grid-cols-2 gap-2 border-t border-[#EAE7ED] p-4 text-[11px]">
            {[
              ["Plot dimensions", row.plotDimensions],
              ["Floors", row.numberOfFloors],
              ["Plot facing", row.plotFacing],
              ["Corner plot", row.cornerPlot === true ? "Yes" : ""],
              ["Road width", row.roadWidthFacing],
              ["Private garden", row.privateGarden === true ? `Yes${row.privateGardenArea ? ` · ${row.privateGardenArea}` : ""}` : ""],
              ["Private pool", row.privatePool === true ? "Yes" : ""],
              ["Terrace", row.terrace === true ? `Yes${row.terraceDetails ? ` · ${row.terraceDetails}` : ""}` : ""],
              ["Gated community", row.gatedCommunity === true ? "Yes" : ""],
            ].filter(([, value]) => Boolean(value)).map(([label, value]) => <div key={String(label)}><span className="text-[#77717E]">{label}</span><p className="font-bold text-[#121B35]">{value}</p></div>)}
          </div>}
        </article>
      ))}
    </div>
  );
}
