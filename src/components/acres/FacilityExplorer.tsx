"use client";

import { useState } from "react";
import {
  Bike,
  Building2,
  Car,
  Check,
  CircleDot,
  Dumbbell,
  Gamepad2,
  PersonStanding,
  Shield,
  Sparkles,
  TreePine,
  Users,
  Waves,
  X,
  Zap,
} from "lucide-react";
import type { FacilityDetail } from "./mock-data";

type Props = {
  title?: string;
  amenities?: string[];
  facilities?: FacilityDetail[];
};

const categoryOrder = ["Sports", "Convenience", "Safety", "Leisure", "Environment"] as const;

const categoryNames: Record<(typeof categoryOrder)[number], string[]> = {
  Sports: ["Gymnasium", "Swimming Pool", "Badminton Court(s)", "Badminton Court", "Kids' Play Areas / Sand Pits", "Children's Play Area", "Yoga Areas", "Jogging / Cycle Track", "Jogging Track", "Table Tennis", "Snooker/Pool/Billiards"],
  Convenience: ["Power Backup", "DG Backup", "AC Waiting Lobby", "24x7 Water Supply", "Water Storage", "Lift", "Passenger Lift", "Service Lift", "Reserved Parking", "EV Charging"],
  Safety: ["24 x 7 Security", "24x7 Security", "Security", "Gated Security", "CCTV / Video Surveillance", "Intercom Facility", "Security Cabin"],
  Leisure: ["Party Hall", "Community Hall", "Clubhouse", "Club House", "Indoor Games", "Luxurious Clubhouse", "Senior Citizen Area", "Cafeteria", "Food Court", "Conference Rooms"],
  Environment: ["Large Green Area", "Park", "Landscaped Gardens", "Avenue Plantation", "Rain Water Harvesting"],
};

const icons: Record<string, typeof Check> = {
  Gymnasium: Dumbbell,
  "Swimming Pool": Waves,
  "Badminton Court(s)": CircleDot,
  "Badminton Court": CircleDot,
  "Jogging / Cycle Track": Bike,
  "Jogging Track": Bike,
  "Kids' Play Areas / Sand Pits": Users,
  "Children's Play Area": Users,
  "Yoga Areas": PersonStanding,
  "Power Backup": Zap,
  "DG Backup": Zap,
  "AC Waiting Lobby": Building2,
  "24x7 Water Supply": Zap,
  "Water Storage": Zap,
  Security: Shield,
  "24x7 Security": Shield,
  "24 x 7 Security": Shield,
  "CCTV / Video Surveillance": Shield,
  "Intercom Facility": Building2,
  "Fire Safety": Shield,
  Lift: Building2,
  "Passenger Lift": Building2,
  "Service Lift": Building2,
  Clubhouse: Building2,
  "Club House": Building2,
  "Luxurious Clubhouse": Building2,
  "Indoor Games": Gamepad2,
  "Party Hall": Building2,
  "Senior Citizen Area": Users,
  "Table Tennis": CircleDot,
  "Snooker/Pool/Billiards": CircleDot,
  "Large Green Area": TreePine,
  Park: TreePine,
  "Landscaped Gardens": TreePine,
  "Reserved Parking": Car,
};

const narrativeGroups = [
  { title: "Areas for Relaxing and Socializing", text: "A residential complex is incomplete without areas where residents can relax away from their homes. These recreational facilities provide residents with areas for relaxation and leisure.", names: ["Kids' Play Areas / Sand Pits", "Children's Play Area", "Large Green Area", "Park", "Landscaped Gardens"] },
  { title: "Stay Active Without Leaving the Community", text: "Having fitness facilities within the project makes it easier to maintain an active lifestyle without traveling far from home.", names: ["Gymnasium", "Swimming Pool", "Badminton Court(s)", "Badminton Court", "Jogging / Cycle Track", "Jogging Track", "Table Tennis", "Snooker/Pool/Billiards"] },
  { title: "Places That Bring the Community Together", text: "Open spaces, walking paths, and shared areas create opportunities for neighbors to interact while giving residents room to spend time outdoors.", names: ["Yoga Areas", "Community Hall", "Large Green Area", "Park", "Landscaped Gardens"] },
  { title: "Facilities for Every Age Group", text: "A well-planned community includes shared spaces that can be enjoyed by both children and adults, making everyday living more convenient for families.", names: ["Luxurious Clubhouse", "Clubhouse", "Club House", "Indoor Games", "Kids' Play Areas / Sand Pits", "Children's Play Area"] },
  { title: "Everyday Comfort and Convenience", text: "These provisions support daily living and help residents manage routine activities while enhancing the community's overall convenience.", names: ["Party Hall", "Community Hall", "Clubhouse", "Club House", "Senior Citizen Area", "Power Backup", "Lift", "24x7 Water Supply", "Water Storage"] },
];

function AmenityIcon({ name, compact = false }: { name: string; compact?: boolean }) {
  const Icon = icons[name] || Sparkles;
  return <Icon className={compact ? "size-7 text-[#2E3547]" : "size-6 text-[#2E3547]"} strokeWidth={1.6} />;
}

export default function FacilityExplorer({ title, amenities = [], facilities = [] }: Props) {
  const [open, setOpen] = useState(false);
  const selected = [...new Set([...amenities, ...facilities.map((facility) => facility.name)])];
  if (!selected.length) return null;

  const descriptions = new Map(facilities.map((facility) => [facility.name, facility.description?.trim() || ""]));
  const categorized = categoryOrder
    .map((category) => ({ category, names: selected.filter((name) => categoryNames[category].includes(name)) }))
    .filter((group) => group.names.length);
  const categorizedNames = new Set(categorized.flatMap((group) => group.names));
  const groups = selected.filter((name) => !categorizedNames.has(name)).length
    ? [...categorized, { category: "Other", names: selected.filter((name) => !categorizedNames.has(name)) }]
    : categorized;
  const preview = selected.slice(0, 10);
  const remaining = selected.length - preview.length;

  return (
    <>
      <section className="rounded-2xl border border-[#DDE2EA] bg-white p-5 shadow-sm md:p-7" aria-labelledby="facilities-heading">
        <h2 id="facilities-heading" className="text-[22px] font-extrabold text-[#172039]">{title ? `${title} Amenities` : "Amenities"}</h2>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {preview.map((name) => (
            <div key={name} className="min-h-[108px] rounded-xl border border-[#E5E8EE] bg-white px-2 py-3 text-center">
              <span className="mx-auto flex h-9 items-center justify-center"><AmenityIcon name={name} compact /></span>
              <span className="mt-2 block line-clamp-2 text-[11px] font-semibold leading-4 text-[#596277]">{name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end"><button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-[#C8A258] bg-[#FFFDF8] px-4 py-2 text-[12px] font-bold text-[#795A18] transition hover:bg-[#FFF6DD]" aria-expanded={open} aria-controls="amenities-modal">{remaining > 0 ? `View More (+${remaining})` : "View More Details"}</button></div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0B1328]/55 p-0 backdrop-blur-[2px] md:items-center md:p-5" role="dialog" aria-modal="true" aria-labelledby="amenities-modal-title">
          <div id="amenities-modal" className="max-h-[92vh] w-full max-w-[1060px] overflow-y-auto rounded-t-2xl bg-white shadow-2xl md:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#DDE2EA] bg-white px-5 py-4 md:px-6">
              <h2 id="amenities-modal-title" className="text-[18px] font-extrabold text-[#172039]">Amenities{title ? ` - ${title}` : ""}</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-[#30394E] transition hover:bg-[#F2F4F7]" aria-label="Close amenities"><X className="size-5" /></button>
            </div>
            <div className="space-y-3 p-4 md:p-6">
              {groups.map((group) => (
                <section key={group.category} className="rounded-xl border border-[#DDE2EA] px-4 py-4">
                  <h3 className="mb-4 text-[13px] font-extrabold text-[#30394E]">{group.category}</h3>
                  <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                    {group.names.map((name) => (
                      <div key={name} className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center"><AmenityIcon name={name} /></span><span className="text-[12px] font-semibold leading-4 text-[#39445A]">{name}</span></div>
                    ))}
                  </div>
                </section>
              ))}
              <div className="space-y-6 border-t border-[#E5E8EE] pt-6">
                {narrativeGroups.map((group) => {
                  const matches = selected.filter((name) => group.names.includes(name));
                  if (!matches.length) return null;
                  return <article key={group.title}><h3 className="text-[17px] font-extrabold text-[#172039]">{group.title}</h3><p className="mt-2 text-[13px] leading-6 text-[#60697A]">{group.text}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{matches.map((name) => <div key={name} className="rounded-lg bg-[#F7F8FA] px-3 py-2.5"><p className="text-[12px] font-bold text-[#303A50]">{name}</p>{descriptions.get(name) && <p className="mt-1 text-[11px] leading-5 text-[#667085]">{descriptions.get(name)}</p>}</div>)}</div></article>;
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
