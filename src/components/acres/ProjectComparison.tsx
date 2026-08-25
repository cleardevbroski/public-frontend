import type { Property } from "./mock-data";
import { formatAreaRange, formatPossessionDateOnly, propertyAreaRange, propertyDensity, type ComparisonMatch } from "@/lib/projectEnhancements";

const value = (text: unknown) => {
  if (text === undefined || text === null) return "";
  const result = String(text).trim();
  return result && result !== "—" && result.toLowerCase() !== "not provided" ? result : "";
};

const candidateRows: Array<{ label: string; getter: (property: Property) => unknown }> = [
  { label: "Price", getter: (property) => property.price },
  { label: "Configuration", getter: (property) => property.configs?.join(", ") },
  { label: "Unit Size", getter: (property) => propertyAreaRange(property) ? formatAreaRange(propertyAreaRange(property), "sqft") : property.area },
  { label: "Possession", getter: (property) => formatPossessionDateOnly(property) },
  { label: "Status", getter: (property) => property.possessionDetails?.status || property.possession },
  { label: "RERA No.", getter: (property) => property.reraNumber || property.reraPhases?.[0]?.reraNumber },
  { label: "Land Area", getter: (property) => property.projectArea?.totalAcres !== undefined ? `${property.projectArea.totalAcres} Acres` : undefined },
  { label: "Total Units", getter: (property) => property.totalUnits?.toLocaleString("en-IN") },
  { label: "Density", getter: propertyDensity },
];

export function hasProjectComparisonContent(current: Property, matches: ComparisonMatch[]): boolean {
  const properties = [current, ...matches.slice(0, 2).map((match) => match.property)];
  return properties.length >= 2 && candidateRows.some(({ getter }) => properties.every((property) => Boolean(value(getter(property)))));
}

export default function ProjectComparison({ current, matches }: { current: Property; matches: ComparisonMatch[] }) {
  const properties = [current, ...matches.slice(0, 2).map((match) => match.property)];
  if (properties.length < 2) return null;
  const rows = candidateRows.filter(({ getter }) => properties.every((property) => Boolean(value(getter(property)))));
  if (!rows.length) return null;
  return <section className="rounded-2xl border border-[#DDE2EA] bg-white p-5 shadow-sm md:p-7" aria-labelledby="comparison-heading">
    <h2 id="comparison-heading" className="text-[22px] font-extrabold text-[#172039]">How does {current.title} compare with other top projects?</h2>
    <p className="mt-2 text-[13px] text-[#596277]">Compared using locality, property type, configurations, size, pricing, and possession data.</p>
    <div className="mt-5 overflow-x-auto pb-1">
      <div className="grid min-w-[720px] gap-3" style={{ gridTemplateColumns: `repeat(${properties.length}, minmax(220px, 1fr))` }} aria-label="Compared properties">
      {properties.map((property, index) => {
        const image = property.heroImages?.find(Boolean) || property.images?.find(Boolean) || property.image;
        return <article key={property.id} className={`min-w-0 overflow-hidden rounded-xl border ${index === 0 ? "border-[#DDAA42] bg-[#FFF9E9]" : "border-[#E1E5EC] bg-[#F8F9FB]"}`}>
          <div className="p-3.5">
            {image && <div className="aspect-[16/9] overflow-hidden rounded-lg bg-[#E5E8EE]"><img src={image} alt={`${property.title} project`} loading={index === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" /></div>}
            <div className="min-h-[76px] pt-3">
              <p className="text-[13px] font-extrabold leading-5 text-[#172039]">{property.title}</p>
              <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#667085]">{property.subtitle}</p>
              {index === 0 && <span className="mt-2 inline-flex rounded bg-[#DDAA42] px-2 py-0.5 text-[9px] font-bold text-[#172039]">CURRENT PROJECT</span>}
            </div>
          </div>
          <dl className="border-t border-[#E1E5EC]">
            {rows.map(({ label, getter }) => <div key={label} className="min-h-[62px] border-b border-[#E1E5EC] px-3.5 py-2.5 last:border-b-0">
              <dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#7A8291]">{label}</dt>
              <dd className="mt-1 break-words text-[12px] font-semibold leading-5 tabular-nums text-[#303A50]">{value(getter(property))}</dd>
            </div>)}
          </dl>
        </article>;
      })}
      </div>
    </div>
    {matches.length > 0 && <p className="mt-4 text-[11px] leading-5 text-[#667085]"><strong>Why these projects?</strong> {matches.slice(0, 2).map((match) => `${match.property.title}: ${match.reasons.slice(0, 3).join(", ")}`).join(". ")}.</p>}
  </section>;
}
