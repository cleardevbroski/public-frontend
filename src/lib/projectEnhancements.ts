import type { ProjectFaq, Property } from "@/components/acres/mock-data";

export type AreaUnit = "sqft" | "sqm" | "sqyd";
export type NumericRange = { min: number; max: number };
export type ParsedAreaRange = NumericRange & { sourceUnit: AreaUnit };

const AREA_FACTORS: Record<AreaUnit, number> = {
  sqft: 1,
  sqm: 0.09290304,
  sqyd: 1 / 9,
};

const AREA_LABELS: Record<AreaUnit, string> = {
  sqft: "Sq. Ft.",
  sqm: "Sq. Metres",
  sqyd: "Sq. Yards",
};

export function numericValue(value?: string): number | undefined {
  const match = String(value || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  const parsed = match ? Number(match[0]) : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

function sourceAreaUnit(value: string): AreaUnit {
  const normalized = value.toLowerCase();
  if (/(?:sq(?:uare)?\.?\s*(?:m|met(?:re|er))s?)\b/.test(normalized)) return "sqm";
  if (/(?:sq(?:uare)?\.?\s*(?:yd|yards?))\b/.test(normalized)) return "sqyd";
  return "sqft";
}

/** Parses an entered area and normalizes the numeric endpoints to square feet. */
export function parseAreaRange(value?: string): ParsedAreaRange | undefined {
  const text = String(value || "").replace(/,/g, "").trim();
  const values = [...text.matchAll(/\d+(?:\.\d+)?/g)]
    .map((match) => Number(match[0]))
    .filter((number) => Number.isFinite(number) && number > 0);
  if (!values.length) return undefined;
  const sourceUnit = sourceAreaUnit(text);
  const toSqft = sourceUnit === "sqm" ? (number: number) => number / AREA_FACTORS.sqm : sourceUnit === "sqyd" ? (number: number) => number * 9 : (number: number) => number;
  const normalized = values.map(toSqft);
  return { min: Math.min(...normalized), max: Math.max(...normalized), sourceUnit };
}

export function convertAreaRange(range: NumericRange, unit: AreaUnit): NumericRange {
  const factor = AREA_FACTORS[unit];
  return { min: range.min * factor, max: range.max * factor };
}

/** Parses Crore/Lakh price text and normalizes the endpoints to INR rupees. */
export function parseInrPriceRange(value?: string): NumericRange | undefined {
  const matches = [...String(value || "").replace(/,/g, "").matchAll(/(\d+(?:\.\d+)?)\s*(cr|crore|l|lac|lakh)?/gi)];
  if (!matches.length) return undefined;
  const impliedUnit = [...matches].reverse().find((match) => Boolean(match[2]))?.[2]?.toLowerCase();
  const values = matches.map((match) => {
    const amount = Number(match[1]);
    const unit = (match[2] || (matches.length > 1 ? impliedUnit : "") || "").toLowerCase();
    if (!Number.isFinite(amount) || amount <= 0) return Number.NaN;
    if (unit === "cr" || unit === "crore") return amount * 10_000_000;
    if (unit === "l" || unit === "lac" || unit === "lakh") return amount * 100_000;
    return amount;
  }).filter((number) => Number.isFinite(number) && number > 0);
  return values.length ? { min: Math.min(...values), max: Math.max(...values) } : undefined;
}

export function calculateUnitPriceRange(price: NumericRange, areaSqft: NumericRange, unit: AreaUnit): NumericRange | undefined {
  const convertedArea = convertAreaRange(areaSqft, unit);
  if (convertedArea.min <= 0 || convertedArea.max <= 0) return undefined;
  return {
    min: price.min / convertedArea.max,
    max: price.max / convertedArea.min,
  };
}

function formatAreaNumber(value: number, unit: AreaUnit): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: unit === "sqft" || Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: unit === "sqft" ? 2 : 2,
  });
}

export function formatAreaValue(rangeSqft: NumericRange, unit: AreaUnit): string {
  const range = convertAreaRange(rangeSqft, unit);
  const first = formatAreaNumber(range.min, unit);
  const second = formatAreaNumber(range.max, unit);
  return range.min === range.max ? first : `${first}–${second}`;
}

export function formatAreaMeasurement(rangeSqft: NumericRange, unit: AreaUnit): string {
  return `${formatAreaValue(rangeSqft, unit)} ${AREA_LABELS[unit]}`;
}

export function formatInrUnitRate(range: NumericRange, unit: AreaUnit): string {
  const format = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;
  const amount = Math.round(range.min) === Math.round(range.max) ? format(range.min) : `${format(range.min)}–${format(range.max)}`;
  return `${amount} / ${AREA_LABELS[unit]}`;
}

export function propertyAreaRange(property: Pick<Property, "configurationDetails" | "area">): [number, number] | undefined {
  const values = (property.configurationDetails || [])
    .map((row) => numericValue(row.builtUpArea || row.superBuiltUpArea || row.carpetArea))
    .filter((value): value is number => value !== undefined);
  if (!values.length) {
    const fallback = numericValue(property.area);
    return fallback === undefined ? undefined : [fallback, fallback];
  }
  return [Math.min(...values), Math.max(...values)];
}

export function formatAreaRange(range: [number, number] | undefined, unit: AreaUnit): string {
  if (!range) return "—";
  const factor = AREA_FACTORS[unit];
  const digits = unit === "sqft" ? 0 : 2;
  const format = (value: number) => (value * factor).toLocaleString("en-IN", { maximumFractionDigits: digits });
  const suffix = unit === "sqft" ? "Sq. Ft." : unit === "sqm" ? "Sq. Metre" : "Sq. Yard";
  return range[0] === range[1] ? `${format(range[0])} ${suffix}` : `${format(range[0])} to ${format(range[1])} ${suffix}`;
}

export function formatPossessionDateOnly(property: Pick<Property, "possession" | "possessionDetails" | "plotDetails" | "propertyType">): string {
  const plot = property.propertyType === "Plot" ? property.plotDetails?.layoutPossession : undefined;
  const source = plot
    ? plot.status === "Under Development" ? plot.expectedCompletionDate : plot.readyDate
    : property.possessionDetails?.status === "Under Construction"
      ? property.possessionDetails.expectedCompletionDate
      : property.possessionDetails?.launchDate;
  if (!source) return property.possession?.trim() || "—";
  const monthOnly = source.length === 7;
  const parsed = new Date(`${monthOnly ? `${source}-01` : source}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return source;
  return new Intl.DateTimeFormat("en-IN", {
    ...(monthOnly ? {} : { day: "2-digit" as const }),
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function parsePriceRange(value?: string): [number, number] | undefined {
  const matches = [...String(value || "").replace(/,/g, "").matchAll(/(\d+(?:\.\d+)?)\s*(cr|crore|l|lac|lakh)?/gi)];
  const values = matches.map((match) => {
    const number = Number(match[1]);
    const unit = (match[2] || "").toLowerCase();
    if (unit.startsWith("cr")) return number * 1e7;
    if (unit.startsWith("l")) return number * 1e5;
    return number;
  }).filter(Number.isFinite);
  return values.length ? [Math.min(...values), Math.max(...values)] : undefined;
}

function overlapRatio(first?: [number, number], second?: [number, number]): number {
  if (!first || !second) return 0;
  const overlap = Math.max(0, Math.min(first[1], second[1]) - Math.max(first[0], second[0]));
  const span = Math.max(first[1], second[1]) - Math.min(first[0], second[0]);
  if (span === 0) return first[0] === second[0] ? 1 : 0;
  return overlap / span;
}

function configOverlap(first: string[] = [], second: string[] = []): boolean {
  const normalized = new Set(first.map((value) => value.toLowerCase().replace(/\s+/g, "")));
  return second.some((value) => normalized.has(value.toLowerCase().replace(/\s+/g, "")));
}

function localityKey(property: Property): string {
  return (property.locality?.zone || property.subtitle?.split(",")[0] || "").trim().toLowerCase();
}

function cityKey(property: Property): string {
  const subtitleParts = property.subtitle?.split(",") || [];
  return (property.locality?.city || subtitleParts[subtitleParts.length - 1] || "").trim().toLowerCase();
}

function possessionTimestamp(property: Property): number | undefined {
  const source = property.possessionDetails?.expectedCompletionDate || property.possessionDetails?.launchDate;
  if (!source) return undefined;
  const date = new Date(`${source.length === 7 ? `${source}-01` : source}T00:00:00`).getTime();
  return Number.isFinite(date) ? date : undefined;
}

export type ComparisonMatch = { property: Property; score: number; reasons: string[] };

export function scoreComparable(current: Property, candidate: Property): ComparisonMatch {
  let score = 0;
  const reasons: string[] = [];
  if (localityKey(current) && localityKey(current) === localityKey(candidate)) {
    score += 30;
    reasons.push("same locality");
  }
  if (current.propertyType && current.propertyType === candidate.propertyType) {
    score += 20;
    reasons.push("same property type");
  }
  if (configOverlap(current.configs, candidate.configs)) {
    score += 15;
    reasons.push("overlapping configurations");
  }
  const areaOverlap = overlapRatio(propertyAreaRange(current), propertyAreaRange(candidate));
  if (areaOverlap > 0) {
    score += Math.round(15 * areaOverlap);
    reasons.push("similar unit sizes");
  }
  const priceOverlap = overlapRatio(parsePriceRange(current.price), parsePriceRange(candidate.price));
  if (priceOverlap > 0) {
    score += Math.round(10 * priceOverlap);
    reasons.push("similar pricing");
  }
  const currentPossession = possessionTimestamp(current);
  const candidatePossession = possessionTimestamp(candidate);
  if (currentPossession !== undefined && candidatePossession !== undefined && Math.abs(currentPossession - candidatePossession) <= 365 * 24 * 60 * 60 * 1000) {
    score += 5;
    reasons.push("similar possession timeline");
  }
  if (current.builder && current.builder.toLowerCase() === candidate.builder?.toLowerCase()) {
    score += 5;
    reasons.push("same developer");
  }
  return { property: candidate, score, reasons };
}

export function rankComparableProperties(current: Property, candidates: Property[], limit = 8): ComparisonMatch[] {
  const city = cityKey(current);
  return candidates
    .filter((candidate) => candidate.id !== current.id && candidate.published !== false && !["rejected", "pending", "draft"].includes(candidate.status || "") && (!city || cityKey(candidate) === city))
    .map((candidate) => scoreComparable(current, candidate))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.property.title.localeCompare(b.property.title) || a.property.id.localeCompare(b.property.id))
    .slice(0, limit);
}

export function propertyDensity(property: Property): string {
  const units = property.totalUnits;
  const acres = property.projectArea?.totalAcres;
  if (!units || !acres) return "";
  return `${Math.round(units / acres)} Units/Acre`;
}

export function projectFaqs(property: Property): ProjectFaq[] {
  if (property.faqs?.length) return [...property.faqs].sort((a, b) => (a.order || 0) - (b.order || 0));
  const rows: ProjectFaq[] = [];
  const add = (question: string, answer?: string) => {
    if (answer?.trim()) rows.push({ question, answer });
  };
  add(`Where is ${property.title} located?`, property.locality?.address || property.subtitle);
  add(`Who is the developer of ${property.title}?`, property.builder ? `${property.title} is developed by ${property.builder}.` : undefined);
  add(`What is the possession date of ${property.title}?`, property.possessionDetails || property.possession ? `Possession is listed from ${formatPossessionDateOnly(property)}.` : undefined);
  add(`What configurations are available in ${property.title}?`, property.configs?.length ? `${property.configs.join(", ")} configurations are listed for this project.` : undefined);
  add(`What is the unit size range in ${property.title}?`, propertyAreaRange(property) ? `The listed unit sizes range from ${formatAreaRange(propertyAreaRange(property), "sqft")}.` : undefined);
  const reraNumber = property.reraNumber || property.reraPhases?.[0]?.reraNumber;
  add(`Is ${property.title} RERA registered?`, property.reraRegistered && reraNumber ? `Yes. The listed RERA registration number is ${reraNumber}.` : undefined);
  add(`How much open space is available in ${property.title}?`, property.projectArea?.openSpaceAcres !== undefined ? `${property.projectArea.openSpaceAcres} acres are listed as open-space area.` : undefined);
  return rows.slice(0, 10);
}
