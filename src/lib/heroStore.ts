import { createHydratedCache } from "./hydratedCache";
import {
  fetchHeroBanners,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
} from "./api";

export type HeroLinkType = "property" | "builder" | "custom";

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
  source?: "curated" | "admin";
};

/** Default showcase slides (used until the admin adds their own). */
const defaultSlides: HeroSlide[] = [
  {
    id: "hero-prestige",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80",
    builderName: "Prestige Group",
    title: "Prestige Lakeside Habitat",
    tagline: "Lakefront living where every day begins with calm",
    location: "Varthur, Whitefield — Ready to Move",
    priceText: "Apartments starting at ₹1.2 Cr",
    rera: "PRM/KA/RERA/1251/446/PR/0312",
    badge: "Featured",
    ctaText: "Explore Now",
    linkType: "builder",
    linkValue: "prestige-group",
    source: "curated",
  },
  {
    id: "hero-sobha",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80",
    builderName: "Sobha Limited",
    title: "Sobha Dream Acres",
    tagline: "Smart, sustainable homes in the heart of the tech corridor",
    location: "Panathur, Balagere — New Launch",
    priceText: "2 & 3 BHK from ₹85 Lac",
    rera: "PRM/KA/RERA/1250/303/PR/1809",
    badge: "New Launch",
    ctaText: "Explore Now",
    linkType: "builder",
    linkValue: "sobha-limited",
    source: "curated",
  },
  {
    id: "hero-brigade",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80",
    builderName: "Brigade Group",
    title: "Brigade Cornerstone Utopia",
    tagline: "A township that has everything you will ever need",
    location: "Varthur Road, Whitefield — Under Construction",
    priceText: "Land & homes from ₹2,200 / sq.ft.",
    rera: "PRM/KA/RERA/1254/465/PR/220125",
    badge: "Township",
    ctaText: "Explore Now",
    linkType: "builder",
    linkValue: "brigade-group",
    source: "curated",
  },
];

const HERO_EVENT = "cleartitle:hero-changed";

const cache = createHydratedCache<HeroSlide>(async () => {
  const data = await fetchHeroBanners();
  return (data.banners as HeroSlide[]).map((b) => ({ ...b, source: "admin" as const }));
}, HERO_EVENT);

/** Public hero — backend banners, else the bundled defaults. */
export function getHeroSlides(): HeroSlide[] {
  const admin = cache.get();
  return admin.length ? admin : defaultSlides;
}

/** Admin editor — backend banners only. */
export function getAdminHeroSlides(): HeroSlide[] {
  return cache.get();
}

export async function addHeroSlide(input: Omit<HeroSlide, "id" | "source">): Promise<HeroSlide> {
  const data = await createHeroBanner(input as Record<string, unknown>);
  await cache.refresh();
  return data.banner as HeroSlide;
}

export async function updateHeroSlide(id: string, updates: Partial<HeroSlide>): Promise<void> {
  await updateHeroBanner(id, updates as Record<string, unknown>);
  await cache.refresh();
}

export async function deleteHeroSlide(id: string): Promise<void> {
  await deleteHeroBanner(id);
  await cache.refresh();
}

/** Resolve the destination href for a slide. */
export function heroHref(slide: HeroSlide): string {
  if (slide.linkType === "property") return `/property/${slide.linkValue}`;
  if (slide.linkType === "builder") return `/builder/${slide.linkValue}`;
  return slide.linkValue || "/property-in-bangalore-ffid";
}
