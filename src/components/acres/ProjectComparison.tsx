import type { Property } from "./mock-data";
import { formatAreaRange, formatPossessionDateOnly, propertyAreaRange, propertyDensity, type ComparisonMatch } from "@/lib/projectEnhancements";

const value = (text: unknown) => text === undefined || text === null || text === "" ? "Not provided" : String(text);

export default function ProjectComparison({ current, matches }: { current: Property; matches: ComparisonMatch[] }) {
  const properties = [current, ...matches.slice(0, 2).map((match) => match.property)];
  if (properties.length < 2) return null;
  const rows = [
    ["Price", (property: Property) => property.price],
    ["Configuration", (property: Property) => property.configs?.join(", ")],
    ["Unit Size", (property: Property) => propertyAreaRange(property) ? formatAreaRange(propertyAreaRange(property), "sqft") : property.area],
    ["Possession", (property: Property) => formatPossessionDateOnly(property)],
    ["Status", (property: Property) => property.possessionDetails?.status || property.possession],
    ["RERA No.", (property: Property) => property.reraNumber || property.reraPhases?.[0]?.reraNumber],
    ["Land Area", (property: Property) => property.projectArea?.totalAcres !== undefined ? `${property.projectArea.totalAcres} Acres` : undefined],
    ["Total Units", (property: Property) => property.totalUnits?.toLocaleString("en-IN")],
    ["Density", propertyDensity],
  ] as const;
  return <section className="rounded-2xl border border-[#DDE2EA] bg-white p-5 shadow-sm md:p-7" aria-labelledby="comparison-heading">
    <h2 id="comparison-heading" className="text-[22px] font-extrabold text-[#172039]">How does {current.title} compare with other top projects?</h2>
    <p className="mt-2 text-[13px] text-[#596277]">Compared using locality, property type, configurations, size, pricing, and possession data.</p>
    <div className="mt-5 overflow-x-auto"><div className="grid min-w-[760px]" style={{ gridTemplateColumns: `150px repeat(${properties.length}, minmax(190px, 1fr))` }}>
      <div className="border-b border-r border-[#E5E8EE] bg-[#F6F7F9] p-3 text-[11px] font-bold uppercase text-[#667085]">Metric</div>
      {properties.map((property, index) => {
        const image = property.heroImages?.find(Boolean) || property.images?.find(Boolean);
        return <div key={property.id} className={`border-b border-r border-[#E5E8EE] p-3 ${index === 0 ? "bg-[#FFF6DD]" : "bg-[#F6F7F9]"}`}>
          <div className="mb-3 aspect-[16/9] overflow-hidden rounded-lg bg-[#E5E8EE]">
            {image ? <img src={image} alt={`${property.title} project`} loading={index === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] font-semibold text-[#667085]">Project image unavailable</div>}
          </div>
          <p className="text-[13px] font-extrabold text-[#172039]">{property.title}</p><p className="mt-1 text-[10px] text-[#667085]">{property.subtitle}</p>{index === 0 && <span className="mt-2 inline-flex rounded bg-[#DDAA42] px-2 py-0.5 text-[9px] font-bold">CURRENT PROJECT</span>}
        </div>;
      })}
      {rows.flatMap(([label, getter]) => [<div key={`${label}-label`} className="border-b border-r border-[#E5E8EE] p-3 text-[11px] font-bold text-[#667085]">{label}</div>, ...properties.map((property) => <div key={`${label}-${property.id}`} className="border-b border-r border-[#E5E8EE] p-3 text-[12px] font-semibold text-[#303A50]">{value(getter(property))}</div>)])}
    </div></div>
    {matches.length > 0 && <p className="mt-4 text-[11px] leading-5 text-[#667085]"><strong>Why these projects?</strong> {matches.slice(0, 2).map((match) => `${match.property.title}: ${match.reasons.slice(0, 3).join(", ")}`).join(". ")}.</p>}
  </section>;
}
