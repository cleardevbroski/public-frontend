import type { ConfigurationDetail, Property } from "@/components/acres/mock-data";

export function getProjectHeroImages(property: Pick<Property, "image" | "images" | "heroImages">): string[] {
  const selected = (property.heroImages || []).map((image) => image.trim()).filter(Boolean);
  const fallback = [property.image, ...(property.images || [])]
    .map((image) => image?.trim())
    .filter((image): image is string => Boolean(image));
  return [...new Set(selected.length ? selected : fallback)].slice(0, 3);
}

export function priceWithCharges(price?: string): string {
  const value = String(price || "").trim();
  if (!value || /\+\s*charges?\b/i.test(value)) return value;
  return `${value} + Charges`;
}

function parsePricePoints(value: string): number[] {
  const matches = [...value.replace(/,/g, "").matchAll(/(\d+(?:\.\d+)?)\s*(cr|crore|l|lac|lakh)?/gi)];
  const impliedUnit = matches.findLast((match) => match[2])?.[2]?.toLowerCase();

  return matches.flatMap((match) => {
    const amount = Number(match[1]);
    if (!Number.isFinite(amount)) return [];
    // Inputs such as "1.89 - 2.46 Cr" state the unit only once; apply it to both endpoints.
    const unit = (match[2] || (matches.length > 1 ? impliedUnit : undefined))?.toLowerCase();
  if (unit === "cr" || unit === "crore") return amount * 10_000_000;
  if (unit === "l" || unit === "lac" || unit === "lakh") return amount * 100_000;
    return amount;
  });
}

function formatProjectPrice(amount: number): string {
  if (amount >= 10_000_000) return `₹ ${(amount / 10_000_000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (amount >= 100_000) return `₹ ${(amount / 100_000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹ ${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Uses the lowest and highest submitted apartment configuration prices for the public range. */
export function configurationPriceRange(details: Pick<ConfigurationDetail, "price">[] | undefined, fallback = ""): string {
  const prices = (details || []).flatMap((detail) => parsePricePoints(detail.price));
  if (!prices.length) return fallback;
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  const minimumLabel = formatProjectPrice(minimum);
  const maximumLabel = formatProjectPrice(maximum);
  // Avoid a meaningless range when two submitted values round to the same public price.
  if (minimumLabel === maximumLabel) return minimumLabel;
  return `${minimumLabel} - ${maximumLabel.replace(/^₹\s*/, "")}`;
}
