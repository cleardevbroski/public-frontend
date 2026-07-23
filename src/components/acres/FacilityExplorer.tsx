"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Clock3, Dumbbell, Shield, Sparkles, TreePine, Waves, Zap } from "lucide-react";
import type { FacilityDetail } from "./mock-data";

type Props = {
  amenities?: string[];
  facilities?: FacilityDetail[];
};

const facilityIcons: Record<string, typeof Check> = {
  "Swimming Pool": Waves,
  Gymnasium: Dumbbell,
  Security: Shield,
  Park: TreePine,
  "Power Backup": Zap,
  "Club House": Building2,
};

export default function FacilityExplorer({ amenities = [], facilities = [] }: Props) {
  const items = useMemo<FacilityDetail[]>(() => {
    const detailsByName = new Map(facilities.map((facility) => [facility.name, facility]));
    const selectedAmenities = amenities.map((name, index) => detailsByName.get(name) || { id: `amenity-${index}`, name, category: "Amenities", status: "Available" as const });
    const customFacilities = facilities.filter((facility) => !amenities.includes(facility.name));
    return [...selectedAmenities, ...customFacilities];
  }, [amenities, facilities]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  if (!items.length) return null;
  const selected = items[Math.min(selectedIndex, items.length - 1)];
  const visible = showAll ? items : items.slice(0, 8);
  const Icon = facilityIcons[selected.name] || Sparkles;

  return (
    <section className="rounded-2xl border border-[#E7E3EA] bg-white p-5 shadow-sm md:p-6" aria-labelledby="facilities-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C19A3C]">Project lifestyle</p>
          <h2 id="facilities-heading" className="mt-1 text-xl font-bold text-[#12172B]">Top facilities</h2>
          <p className="mt-1 text-[13px] text-[#68646F]">Select a facility to view its available details.</p>
        </div>
        {items.length > 8 && <button type="button" onClick={() => setShowAll((value) => !value)} className="text-[12px] font-bold text-[#121B35] hover:underline">{showAll ? "Show less" : `View all ${items.length}`}</button>}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {visible.map((facility, index) => {
            const ItemIcon = facilityIcons[facility.name] || Check;
            return (
              <button key={facility.id || `${facility.name}-${index}`} type="button" onClick={() => setSelectedIndex(index)} className={`min-h-24 rounded-xl border p-3 text-left transition-all ${selectedIndex === index ? "border-[#DDAA42] bg-[#FFF9E9] shadow-sm" : "border-[#E0E6F0] bg-[#FAFBFD] hover:border-[#B9C4D8]"}`}>
                <span className={`flex size-8 items-center justify-center rounded-lg ${selectedIndex === index ? "bg-[#DDAA42] text-[#0B1328]" : "bg-white text-[#121B35]"}`}><ItemIcon className="size-4" /></span>
                <span className="mt-2 block text-[12px] font-bold leading-4 text-[#3F3D46]">{facility.name}</span>
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-xl border border-[#DCE3EE] bg-[#F8F7FA]">
          {selected.imageUrl && <img src={selected.imageUrl} alt={selected.name} className="h-32 w-full object-cover" />}
          <div className="p-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#12172B] text-[#F2C052]"><Icon className="size-5" /></span>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[#8A6B25]">{selected.category || "Facility"}</p>
            <h3 className="mt-1 text-lg font-bold text-[#12172B]">{selected.name}</h3>
            <p className="mt-2 text-[12px] leading-5 text-[#68646F]">{selected.description || `${selected.name} is listed as part of the project's available amenities. Contact the advertiser for access rules and specifications.`}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"><Check className="size-3" /> {selected.status || "Available"}</span>
              {selected.hours && <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#5A5762]"><Clock3 className="size-3" /> {selected.hours}</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
