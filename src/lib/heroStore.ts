import { createHydratedCache } from "./hydratedCache";
import {
  fetchHeroBanners,
  fetchAdminHeroBanners,
  createHeroBanner,
  updateHeroBanner,
  updateHeroBannerOrder,
  deleteHeroBanner,
} from "./api";

export type HeroLinkType = "property" | "builder" | "custom";
export type PromotionSlot = "diamond" | "gold" | "silver";

export const PROMOTION_RANK: Record<PromotionSlot, 1 | 2 | 3> = {
  diamond: 1,
  gold: 2,
  silver: 3,
};

export type HeroExtraDetail = {
  id: string;
  label: string;
  value: string;
  enabled: boolean;
  order: number;
};

export type HeroSlide = {
  id: string;
  image: string;
  /** Optional small logo (builder/project mark) shown top-right. */
  logo?: string;
  builderName?: string;
  title: string;
  tagline?: string;
  location?: string;
  priceText?: string;
  rera?: string;
  badge?: string;
  ctaText?: string;
  linkType: HeroLinkType;
  /** property id / builder slug / external url depending on linkType. */
  linkValue: string;
  propertyId?: string | null;
  promotionSlot?: PromotionSlot | null;
  rank?: 1 | 2 | 3 | null;
  displayOnHomepage?: boolean;
  selectedFields?: string[];
  fieldOverrides?: Record<string, string>;
  extraDetails?: HeroExtraDetail[];
  additionalInformation?: {
    enabled: boolean;
    values: Record<string, unknown>;
  };
  resolvedDetails?: {
    propertyType?: string;
    possession?: string;
    area?: string;
    configuration?: string;
    structure?: string;
    amenities?: string;
  };
  order?: number;
  published?: boolean;
  source?: "curated" | "admin";
};

const HERO_EVENT = "cleartitle:hero-changed";

const cache = createHydratedCache<HeroSlide>(async () => {
  const data = await fetchHeroBanners();
  return (data.banners as HeroSlide[]).map((b) => ({ ...b, source: "admin" as const }));
}, HERO_EVENT);

const adminCache = createHydratedCache<HeroSlide>(async () => {
  const data = await fetchAdminHeroBanners();
  return (data.banners as HeroSlide[]).map((b) => ({ ...b, source: "admin" as const }));
}, HERO_EVENT);

/** Public hero — only banners currently published by the admin. */
export function getHeroSlides(): HeroSlide[] {
  return cache.get();
}

/** Revalidate the public hero when a page/tab becomes active again. */
export async function refreshHeroSlides(): Promise<void> {
  await cache.refresh();
}

/** Admin editor — backend banners only. */
export function getAdminHeroSlides(): HeroSlide[] {
  return adminCache.get();
}

export function getPropertyPromotion(propertyId: string): HeroSlide | undefined {
  return cache.get().find((slide) => slide.promotionSlot && slide.propertyId === propertyId);
}

export async function addHeroSlide(input: Omit<HeroSlide, "id" | "source">): Promise<HeroSlide> {
  const data = await createHeroBanner(input as Record<string, unknown>);
  await Promise.all([cache.refresh(), adminCache.refresh()]);
  return data.banner as HeroSlide;
}

export async function updateHeroSlide(id: string, updates: Partial<HeroSlide>): Promise<void> {
  await updateHeroBanner(id, updates as Record<string, unknown>);
  await Promise.all([cache.refresh(), adminCache.refresh()]);
}

export async function reorderHeroSlide(id: string, order: number): Promise<void> {
  await updateHeroBannerOrder(id, order);
  await Promise.all([cache.refresh(), adminCache.refresh()]);
}

export async function deleteHeroSlide(id: string): Promise<void> {
  await deleteHeroBanner(id);
  await Promise.all([cache.refresh(), adminCache.refresh()]);
}

/** Resolve the destination href for a slide. */
export function heroHref(slide: HeroSlide): string {
  if (slide.linkType === "property") return `/property/${slide.linkValue}`;
  if (slide.linkType === "builder") return `/builder/${slide.linkValue}`;
  return slide.linkValue || "/property-in-bangalore-ffid";
}
