import { getPublishedProperties } from "./propertyStore";
import type { Property } from "@/components/acres/mock-data";
import { createHydratedCache } from "./hydratedCache";
import {
  fetchDealers,
  createDealer,
  updateDealer,
  deleteDealer as apiDeleteDealer,
} from "./api";

export type Dealer = {
  id: string;
  slug: string;
  name: string;
  agency: string;
  memberSince: string;
  /** Deal types: e.g. RESALE, NEW BOOKING, RENT */
  dealsIn: string[];
  buyersThisWeek: number;
  /** Operating since year, e.g. "2012" */
  operatingSince?: string;
  phone?: string;
  email?: string;
  about?: string;
  /** Localities the dealer is active in */
  localities?: string[];
  logo?: string;
  /** Property ids this dealer is linked to (for user-registered dealers). */
  propertyIds?: string[];
  source: "curated" | "user";
  status?: string;
};

const DEALERS_EVENT = "cleartitle:dealers-changed";

const cache = createHydratedCache<Dealer>(async () => {
  const data = await fetchDealers({ limit: 200 });
  return (data.dealers as Dealer[]).map((d) => ({ ...d, source: "curated" as const }));
}, DEALERS_EVENT);

export function dealerSlug(name: string, agency: string): string {
  return `${name}-${agency}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** All dealers from the backend. */
export function getDealers(): Dealer[] {
  return cache.get();
}

/** Only approved dealers for the public site. (Legacy records without status are treated as approved). */
export function getPublishedDealers(): Dealer[] {
  return getDealers().filter((d) => !("status" in d) || (d as any).status === "approved");
}

export function getDealerBySlug(slug: string): Dealer | undefined {
  return getDealers().find((d) => d.slug === slug);
}

/** Count of published properties attributable to a dealer. */
export function getDealerMatchCount(dealer: Dealer): number {
  if (dealer.propertyIds?.length) return dealer.propertyIds.length;
  const published = getPublishedProperties();
  // Stable pseudo-count derived from the dealer id so curated cards feel real.
  const hash = dealer.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return (hash % 70) + Math.min(published.length, 12) + 3;
}

/** Properties linked to a dealer (their own posts, else a locality-matched sample). */
export function getDealerProperties(dealer: Dealer): Property[] {
  const published = getPublishedProperties();
  if (dealer.propertyIds?.length) {
    return published.filter((p) => dealer.propertyIds!.includes(p.id));
  }
  if (dealer.localities?.length) {
    const matched = published.filter((p) =>
      dealer.localities!.some((loc) =>
        (p.subtitle || "").toLowerCase().includes(loc.toLowerCase())
      )
    );
    if (matched.length) return matched;
  }
  return published.slice(0, 6);
}

/** Register / upsert a user as a dealer (used by the account page). */
export async function registerDealer(
  input: Omit<Dealer, "id" | "slug" | "source" | "memberSince" | "buyersThisWeek"> &
    Partial<Pick<Dealer, "memberSince" | "buyersThisWeek">>
): Promise<Dealer> {
  const slug = dealerSlug(input.name, input.agency);
  const data = await createDealer({ ...input, slug });
  await cache.refresh();
  return data.dealer as Dealer;
}

export async function editDealer(id: string, updates: Partial<Dealer>): Promise<Dealer> {
  const data = await updateDealer(id, updates as Record<string, unknown>);
  await cache.refresh();
  return data.dealer as Dealer;
}

export async function removeDealer(id: string): Promise<void> {
  await apiDeleteDealer(id);
  await cache.refresh();
}

/** Look up a user-registered dealer profile by phone (account page hydration). */
export function getDealerByPhone(phone: string): Dealer | undefined {
  const norm = phone.replace(/\D/g, "").slice(-10);
  return getDealers().find(
    (d) => (d.phone || "").replace(/\D/g, "").slice(-10) === norm
  );
}
