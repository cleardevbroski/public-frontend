import type { Property } from "@/components/acres/mock-data";
import type { ListingKind } from "@/components/acres/bangalore-data";

const RESIDENTIAL = ["Apartment", "Villa", "Penthouse", "Independent House"];

function isForRent(p: Property): boolean {
  return p.listingType === "For Rent";
}

function isNewProject(p: Property): boolean {
  return (
    p.ageOfProperty === "Under Construction" ||
    (p.badges?.includes("New Launch") ?? false) ||
    p.websiteSection === "Newly Launched"
  );
}

/** Does a property belong on a listing page of the given route kind? */
export function matchesKind(p: Property, kind: ListingKind): boolean {
  const type = (p.propertyType || "").trim();
  const residential = RESIDENTIAL.includes(type);
  switch (kind) {
    case "buy":
      return residential && !isForRent(p);
    case "rent":
      return residential && isForRent(p);
    case "projects":
      return residential && !isForRent(p) && isNewProject(p);
    case "plots":
      return type === "Plot";
    case "commercial-sale":
      return type === "Commercial" && !isForRent(p);
    case "commercial-rent":
      return type === "Commercial" && isForRent(p);
    case "pg":
      return type === "PG/Co-living";
    default:
      return false;
  }
}

export function matchesZone(p: Property, zone: string): boolean {
  return (p.locality?.zone || "").toLowerCase() === zone.toLowerCase();
}

export function matchesLocality(p: Property, locality: string): boolean {
  const needle = locality.toLowerCase();
  const hay = [p.locality?.landmark, p.subtitle, p.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

function bhk(p: Property, n: number): boolean {
  if (typeof p.bedrooms === "number") return p.bedrooms === n;
  return p.configs?.some((c) => c.includes(`${n} BHK`)) ?? false;
}

function hasAmenity(p: Property, name: string): boolean {
  return p.amenities?.includes(name) ?? false;
}

type FilterDef = { group: string; test: (p: Property) => boolean };

/** Maps each Filter Portfolio chip label to its group + predicate. */
const FILTERS: Record<string, FilterDef> = {
  "Verified Only": { group: "source", test: (p) => p.verified === true },
  "Direct Owner": { group: "source", test: (p) => p.submittedBy === "user" },
  "RERA Mandated": { group: "source", test: (p) => p.reraRegistered === true },
  "With Photos": { group: "source", test: (p) => (p.images?.length ?? 0) > 0 || !!p.image },
  "1 BHK": { group: "config", test: (p) => bhk(p, 1) },
  "2 BHK": { group: "config", test: (p) => bhk(p, 2) },
  "3 BHK": { group: "config", test: (p) => bhk(p, 3) },
  "4 BHK": { group: "config", test: (p) => bhk(p, 4) },
  "Villa Portfolio": { group: "config", test: (p) => p.propertyType === "Villa" },
  "Ready To Move": { group: "status", test: (p) => p.possession === "Ready to Move" },
  "Under Construction": { group: "status", test: (p) => p.ageOfProperty === "Under Construction" },
  "New Project Launch": {
    group: "status",
    test: (p) => (p.badges?.includes("New Launch") ?? false) || p.websiteSection === "Newly Launched",
  },
  "Power Backup": { group: "amenity", test: (p) => hasAmenity(p, "Power Backup") },
  "Swimming Pool": { group: "amenity", test: (p) => hasAmenity(p, "Swimming Pool") },
  "Parking Spot": {
    group: "amenity",
    test: (p) => hasAmenity(p, "Reserved Parking") || (!!p.parking && p.parking !== "None"),
  },
  Gymnasium: { group: "amenity", test: (p) => hasAmenity(p, "Gymnasium") },
};

/** OR within a chip group, AND across groups. Unknown labels are ignored. */
export function matchesFilters(p: Property, active: string[]): boolean {
  if (active.length === 0) return true;
  const byGroup = new Map<string, ((p: Property) => boolean)[]>();
  for (const label of active) {
    const def = FILTERS[label];
    if (!def) continue;
    const arr = byGroup.get(def.group) ?? [];
    arr.push(def.test);
    byGroup.set(def.group, arr);
  }
  for (const tests of byGroup.values()) {
    if (!tests.some((t) => t(p))) return false;
  }
  return true;
}

export function matchesQuery(p: Property, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [
    p.title,
    p.subtitle,
    p.builder,
    p.propertyType,
    p.locality?.zone,
    p.locality?.landmark,
    ...(p.configs ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export function filterListingProperties(opts: {
  properties: Property[];
  kind: ListingKind;
  zone?: string | null;
  locality?: string | null;
  filters?: string[];
  query?: string;
}): Property[] {
  const { properties, kind, zone, locality, filters = [], query = "" } = opts;
  return properties.filter(
    (p) =>
      matchesKind(p, kind) &&
      (!zone || matchesZone(p, zone)) &&
      (!locality || matchesLocality(p, locality)) &&
      matchesFilters(p, filters) &&
      matchesQuery(p, query)
  );
}
