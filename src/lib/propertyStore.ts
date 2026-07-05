import type { Property } from "@/components/acres/mock-data";
import { createHydratedCache } from "./hydratedCache";
import {
  fetchProperties,
  createProperty as apiCreateProperty,
  updateProperty as apiUpdateProperty,
  deleteProperty as apiDeleteProperty,
} from "./api";

const PROPERTIES_EVENT = "cleartitle:properties-changed";

const cache = createHydratedCache<Property>(async () => {
  const data = await fetchProperties({ limit: 200, sort: "-createdAt" });
  return (data.properties as Property[]).map((p) => ({ ...p, source: "admin" as const }));
}, PROPERTIES_EVENT);

/** All properties from the backend (admin views — unfiltered). */
export function getAllProperties(): Property[] {
  return cache.get();
}

/** Only properties that should appear on the public site. */
export function getPublishedProperties(): Property[] {
  return getAllProperties().filter((p) => p.published !== false);
}

/** Newest published listings first (admin posts surface to the top). */
export function getNewlyListed(limit = 8): Property[] {
  return getPublishedProperties()
    .slice()
    .sort((a, b) => {
      const da = a.postedDate ? Date.parse(a.postedDate) : 0;
      const db = b.postedDate ? Date.parse(b.postedDate) : 0;
      return db - da;
    })
    .slice(0, limit);
}

/** Featured published listings (admin-flagged first, then fall back to recent). */
export function getFeaturedProperties(limit = 6): Property[] {
  const published = getPublishedProperties();
  const flagged = published.filter((p) => p.featured);
  const rest = published.filter((p) => !p.featured);
  return [...flagged, ...rest].slice(0, limit);
}

/** Group published properties by their locality zone / city for the explorer. */
export function getPropertiesByLocality(): { zone: string; count: number; sample: Property }[] {
  const published = getPublishedProperties();
  const groups: Record<string, Property[]> = {};
  for (const p of published) {
    const zone =
      p.locality?.zone ||
      (p.subtitle?.split(",")[0]?.trim() ?? "Bangalore") ||
      "Bangalore";
    (groups[zone] ||= []).push(p);
  }
  return Object.entries(groups)
    .map(([zone, list]) => ({ zone, count: list.length, sample: list[0] }))
    .sort((a, b) => b.count - a.count);
}

/** Distinct builders across published listings, with project counts. */
export function getBuilders(): { name: string; slug: string; total: number; sample: Property }[] {
  const published = getPublishedProperties();
  const groups: Record<string, Property[]> = {};
  for (const p of published) {
    const name = (p.builder || "").trim();
    if (!name) continue;
    (groups[name] ||= []).push(p);
  }
  return Object.entries(groups)
    .map(([name, list]) => ({
      name,
      slug: builderSlug(name),
      total: list.length,
      sample: list[0],
    }))
    .sort((a, b) => b.total - a.total);
}

/** All published properties for a given builder (matched by slug). */
export function getPropertiesByBuilder(slug: string): Property[] {
  return getPublishedProperties().filter(
    (p) => p.builder && builderSlug(p.builder) === slug
  );
}

export function builderSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Resolve a builder's display name from its slug. */
export function getBuilderName(slug: string): string | undefined {
  return getBuilders().find((b) => b.slug === slug)?.name;
}

export function getAdminPostedProperties(): Property[] {
  return getAllProperties();
}

export function getMockProperties(): Property[] {
  return [];
}

export function getPropertyCount() {
  const all = getAllProperties();
  const published = all.filter((p) => p.published !== false).length;
  return {
    total: all.length,
    admin: all.length,
    mock: 0,
    published,
    pending: all.length - published,
  };
}

export async function addProperty(property: Omit<Property, "id">): Promise<Property | null> {
  const data = await apiCreateProperty(property as Record<string, unknown>);
  await cache.refresh();
  return data.property as Property;
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
  const data = await apiUpdateProperty(id, updates as Record<string, unknown>);
  await cache.refresh();
  return data.property as Property;
}

export async function togglePublish(id: string, currentState?: boolean): Promise<Property | null> {
  let isPublished = currentState;
  if (isPublished === undefined) {
    const current = getPropertyById(id);
    if (!current) return null;
    isPublished = current.published !== false;
  }
  return updateProperty(id, { published: !isPublished });
}

export async function toggleFeatured(id: string, currentState?: boolean): Promise<Property | null> {
  let isFeatured = currentState;
  if (isFeatured === undefined) {
    const current = getPropertyById(id);
    if (!current) return null;
    isFeatured = !!current.featured;
  }
  return updateProperty(id, { featured: !isFeatured });
}

export async function deleteProperty(id: string): Promise<boolean> {
  await apiDeleteProperty(id);
  await cache.refresh();
  return true;
}

export function getPropertyById(id: string): Property | undefined {
  const all = getAllProperties();
  return all.find((p) => p.id === id);
}
