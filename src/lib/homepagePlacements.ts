import type { Property } from "@/components/acres/mock-data";

export const HOMEPAGE_SECTIONS = [
  { id: "Recommended", label: "Recommended Properties" },
  { id: "Handpicked", label: "Handpicked Projects" },
  { id: "Newly Launched", label: "Newly Launched Projects" },
  { id: "Search Trends", label: "Based on Search Trends" },
  { id: "Offers", label: "Offers for You" },
  { id: "Newly Listed", label: "Newly Listed Properties" },
  { id: "Featured", label: "Featured Properties" },
] as const;

export type HomepageSection = (typeof HOMEPAGE_SECTIONS)[number]["id"];

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
