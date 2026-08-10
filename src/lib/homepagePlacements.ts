import type { Property } from "@/components/acres/mock-data";

export const HOMEPAGE_SECTIONS = [
  { id: "Recommended", label: "Recommended Properties" },
  { id: "Handpicked", label: "Featured Handpicked Projects" },
  { id: "Newly Launched", label: "Newly Launched Projects" },
  { id: "Search Trends", label: "Based on Search Trends" },
  { id: "Offers", label: "Offers for You" },
  { id: "Newly Listed", label: "Newly Listed Properties" },
  { id: "Featured", label: "Featured Properties" },
] as const;

export type HomepageSection = (typeof HOMEPAGE_SECTIONS)[number]["id"];

export const BANGALORE_ZONES = ["East", "West", "South", "North"] as const;
export type BangaloreZone = (typeof BANGALORE_ZONES)[number];

const SECTION_IDS = new Set<string>(HOMEPAGE_SECTIONS.map((section) => section.id));

export function getHomepageSections(
  property: Pick<Property, "homepageSections" | "websiteSection">
): HomepageSection[] {
  const placements = (property.homepageSections || []).filter(
    (section): section is HomepageSection => SECTION_IDS.has(section)
  );

  if (
    property.websiteSection &&
    property.websiteSection !== "None" &&
    SECTION_IDS.has(property.websiteSection) &&
    !placements.includes(property.websiteSection as HomepageSection)
  ) {
    placements.push(property.websiteSection as HomepageSection);
  }

  return placements;
}

export function isInHomepageSection(
  property: Pick<Property, "homepageSections" | "websiteSection">,
  section: HomepageSection
): boolean {
  return getHomepageSections(property).includes(section);
}

export function getBangaloreZone(zone?: string): BangaloreZone | null {
  const normalized = (zone || "").trim().toLowerCase();
  return BANGALORE_ZONES.find((item) => {
    const value = item.toLowerCase();
    return normalized === value || normalized === `${value} bangalore` || normalized === `bangalore ${value}`;
  }) || null;
}

export function getHandpickedProjectsByZone(
  properties: Property[],
  zone: BangaloreZone
): Property[] {
  return properties.filter(
    (property) =>
      property.published !== false &&
      !["Rent", "Lease"].includes(property.propertyType || "") &&
      isInHomepageSection(property, "Handpicked") &&
      getBangaloreZone(property.locality?.zone) === zone
  );
}
