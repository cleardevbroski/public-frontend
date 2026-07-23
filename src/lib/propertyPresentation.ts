import type { Property } from "@/components/acres/mock-data";

export function getProjectHeroImages(property: Pick<Property, "image" | "images" | "heroImages">): string[] {
  const selected = (property.heroImages || []).map((image) => image.trim()).filter(Boolean);
  const fallback = [property.image, ...(property.images || [])]
    .map((image) => image?.trim())
    .filter((image): image is string => Boolean(image));
  return [...new Set(selected.length ? selected : fallback)].slice(0, 3);
}
