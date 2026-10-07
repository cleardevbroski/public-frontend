import type { Property } from "@/components/acres/mock-data";

export type HomepageBhkStat = {
  label: string;
  count: number;
  href: string;
};

export type HomepagePossessionStat = {
  label: string;
  count: number;
  year?: number;
  href: string;
  image: string;
  tint: string;
};

const BHK_ORDER = [1, 2, 3, 4, 5];
const BHK_HREFS: Record<number, string> = {
  1: "/1-bhk-flats-in-bangalore-ffid",
  2: "/2-bhk-flats-in-bangalore-ffid",
  3: "/3-bhk-flats-in-bangalore-ffid",
  4: "/4-bhk-flats-in-bangalore-ffid",
  5: "/5-bhk-flats-in-bangalore-ffid",
};

const POSSESSION_MEDIA = [
  { image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80", tint: "#F4EFE3" },
  { image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80", tint: "#E7F0FA" },
  { image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80", tint: "#E6F2EA" },
  { image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=80", tint: "#FFF8E8" },
];

function isPublicProperty(property: Property): boolean {
  return property.published !== false && (!property.status || ["approved", "published"].includes(property.status));
}

function configurationNames(property: Property): string[] {
  return [
    ...(property.configs || []),
    ...(property.configurationDetails || []).map((row) => row.configuration || ""),
    ...(property.villaDetails?.configurationDetails || []).map((row) => row.configuration || ""),
  ].filter(Boolean);
}

function configurationBucket(value: string): number | null {
  const match = value.trim().match(/^(\d+(?:\.5)?)\s*BHK\b/i);
  if (!match) return null;
  const bedrooms = Number(match[1]);
  return Number.isFinite(bedrooms) && bedrooms >= 1 ? Math.floor(bedrooms) : null;
}

function possessionYear(property: Property): number | null {
  const details = property.possessionDetails;
  if (details?.status === "Ready to Move") return new Date().getFullYear();
  const source = details?.expectedCompletionDate || property.possession || "";
  if (!details && /ready\s*to\s*move/i.test(source)) return new Date().getFullYear();
  const date = new Date(source.length === 7 ? `${source}-01` : source);
  return Number.isNaN(date.getTime()) ? null : date.getFullYear();
}

export function getHomepageStats(properties: Property[]) {
  const published = properties.filter(isPublicProperty);
  const bhkCounts = new Map<number, number>();
  published.forEach((property) => {
    const buckets = new Set(configurationNames(property).map(configurationBucket).filter((value): value is number => value !== null));
    if (!buckets.size && property.bedrooms && property.bedrooms >= 1) buckets.add(Math.floor(property.bedrooms));
    buckets.forEach((bucket) => bhkCounts.set(bucket, (bhkCounts.get(bucket) || 0) + 1));
  });

  const currentYear = new Date().getFullYear();
  const possessionCounts = new Map<number, number>();
  published.forEach((property) => {
    const year = possessionYear(property);
    if (year !== null && year <= currentYear) {
      possessionCounts.set(currentYear, (possessionCounts.get(currentYear) || 0) + 1);
    } else if (year !== null) {
      possessionCounts.set(year, (possessionCounts.get(year) || 0) + 1);
    }
  });

  const bhk = BHK_ORDER
    .filter((bucket) => (bhkCounts.get(bucket) || 0) > 0)
    .map((bucket) => ({
      label: bucket === 1 ? "1 RK / 1 BHK" : bucket === 5 ? "5+ BHK" : `${bucket} BHK`,
      count: bhkCounts.get(bucket) || 0,
      href: BHK_HREFS[bucket],
    }));
  const possessionYears = [...possessionCounts.keys()].sort((a, b) => a - b);
  const possession = possessionYears.map((year, index) => ({
    label: year <= currentYear ? "Ready to move" : `Possession in ${year}`,
    count: possessionCounts.get(year) || 0,
    year: year > currentYear ? year : undefined,
    href: year <= currentYear ? "/ready-to-move-property-in-bangalore-ffid" : `/under-construction-property-in-bangalore-ffid?year=${year}`,
    ...POSSESSION_MEDIA[index % POSSESSION_MEDIA.length],
  }));

  return { publishedCount: published.length, bhk, possession };
}
