import type { Property } from "@/components/acres/mock-data";

function text(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.map(text).join(" ");
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).map(text).join(" ");
  return String(value);
}

export function normalizeAdminSearch(value: unknown): string {
  return text(value).trim().toLocaleLowerCase();
}

/** Match every typed word, while allowing those words to occur in different record fields. */
export function matchesAdminSearch(query: string, values: unknown[]): boolean {
  const terms = normalizeAdminSearch(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalizeAdminSearch(values);
  return terms.every((term) => haystack.includes(term));
}

export function matchesPropertyAdminSearch(property: Property, query: string): boolean {
  return matchesAdminSearch(query, [
    property.id,
    property.title,
    property.subtitle,
    property.builder,
    property.propertyType,
    property.transactionType,
    property.listingType,
    property.price,
    property.pricePerSqft,
    property.area,
    property.configs,
    property.locality,
    property.reraNumber,
    property.reraPhases?.map((phase) => [phase.name, phase.reraNumber]),
  ]);
}

export function buildAdminPropertySearchHref(query: string): string {
  const normalized = query.trim();
  return normalized ? `/admin?q=${encodeURIComponent(normalized)}` : "/admin";
}
