import type { Property } from "@/components/acres/mock-data";
import { createHydratedCache } from "./hydratedCache";
import {
  fetchProperties,
  fetchBuilders,
  createProperty as apiCreateProperty,
  updateProperty as apiUpdateProperty,
  deleteProperty as apiDeleteProperty,
} from "./api";

const PROPERTIES_EVENT = "cleartitle:properties-changed";
const BUILDERS_EVENT = "cleartitle:builders-changed";

type BuilderRecord = { id: string; name: string; slug: string; verified?: boolean; featured?: boolean; logo?: string };

const cache = createHydratedCache<Property>(async () => {
  const data = await fetchProperties({ limit: 200, sort: "-createdAt" });
  return (data.properties as Property[]).map((p) => ({ ...p, source: "admin" as const }));
}, PROPERTIES_EVENT);

const builderCache = createHydratedCache<BuilderRecord>(async () => {
  const data = await fetchBuilders({ limit: 200 });
  return data.builders as BuilderRecord[];
}, BUILDERS_EVENT);

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
  const isFeatured = (p: Property) => p.featured || p.websiteSection === "Featured";
  const flagged = published.filter(isFeatured);
  const rest = published.filter((p) => !isFeatured(p));
  return [...flagged, ...rest].slice(0, limit);
}

/** Published listings tagged for a specific homepage section. */
export function getPropertiesBySection(section: string, limit = 10): Property[] {
  return getPublishedProperties()
    .filter((p) => p.websiteSection === section)
    .slice(0, limit);
}

/** Group published properties by property type for the browse-by-type tiles. */
export function getPropertiesByType(): { type: string; count: number; sample: Property }[] {
  const published = getPublishedProperties();
  const groups: Record<string, Property[]> = {};
  for (const p of published) {
    const type = (p.propertyType || "").trim();
    if (!type) continue;
    (groups[type] ||= []).push(p);
  }
  return Object.entries(groups)
    .map(([type, list]) => ({ type, count: list.length, sample: list[0] }))
    .sort((a, b) => b.count - a.count);
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

/** Distinct builders across published listings — real Builder links first, free-text fallback otherwise. */
export function getBuilders(): { name: string; slug: string; total: number; sample: Property; verified?: boolean; featured?: boolean; logo?: string }[] {
  const published = getPublishedProperties();
  const builders = builderCache.get();
  const byId = new Map(builders.map((b) => [b.id, b]));

  type Group = { name: string; slug: string; verified?: boolean; featured?: boolean; logo?: string; list: Property[] };
  const groups: Record<string, Group> = {};

  for (const p of published) {
    const linked = p.builderId ? byId.get(p.builderId) : undefined;
    const freeText = (p.builder || "").trim();

    if (!linked && !freeText) continue;

    const key = linked ? `id:${linked.id}` : `name:${freeText}`;

    if (!groups[key]) {
      groups[key] = {
        name: linked?.name ?? freeText,
        slug: linked?.slug ?? builderSlug(freeText),
        verified: linked?.verified,
        featured: linked?.featured,
        logo: linked?.logo,
        list: [],
      };
    }

    groups[key].list.push(p);
  }

  return Object.values(groups)
    .map((g) => ({ name: g.name, slug: g.slug, total: g.list.length, sample: g.list[0], verified: g.verified, featured: g.featured, logo: g.logo }))
    .sort((a, b) => b.total - a.total);
}

/** All published properties for a given builder slug (matches real Builder link first, free-text builder name otherwise). */
export function getPropertiesByBuilder(slug: string): Property[] {
  const builders = builderCache.get();
  const byId = new Map(builders.map((b) => [b.id, b]));
  return getPublishedProperties().filter((p) => {
    const linked = p.builderId ? byId.get(p.builderId) : undefined;
    if (linked) return linked.slug === slug;
    return Boolean(p.builder) && builderSlug(p.builder!) === slug;
  });
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

/** Reload the public-listing cache after an out-of-band admin workflow update. */
export async function refreshProperties(): Promise<void> {
  await cache.refresh();
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

export async function setPropertyStatus(id: string, status: string): Promise<Property | null> {
  return updateProperty(id, { status });
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
