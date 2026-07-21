import type {
  ConfigurationDetail,
  PossessionDetails,
  Property,
} from "@/components/acres/mock-data";

export const facingOptions = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
] as const;

export function normalizeBhkLabel(value: string): string | null {
  const match = value.trim().match(/^(\d+)\s*bhk$/i);
  if (!match || Number(match[1]) < 1) return null;
  return `${Number(match[1])} BHK`;
}

export function createConfigurationDetail(configuration: string): ConfigurationDetail {
  const bedrooms = Number(configuration.match(/^\d+/)?.[0] || 1);
  return {
    configuration,
    price: "",
    superBuiltUpArea: "",
    carpetArea: "",
    bedrooms,
    bathrooms: bedrooms,
    balconies: 0,
    facings: [],
  };
}

function parseDisplayNumber(value: string | undefined, field: "price" | "superBuiltUpArea"): number {
  const match = String(value || "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return Number.NaN;
  const number = Number(match[1]);
  if (field !== "price") return number;
  const unit = String(value || "").toLowerCase();
  if (/\b(cr|crore)\b/.test(unit)) return number * 10_000_000;
  if (/\b(l|lac|lakh)\b/.test(unit)) return number * 100_000;
  return number;
}

export function displayRange(
  rows: ConfigurationDetail[] | undefined,
  field: "price" | "superBuiltUpArea"
): string {
  const values = (rows || [])
    .map((row) => ({ display: row[field], value: parseDisplayNumber(row[field], field) }))
    .filter((item) => Number.isFinite(item.value))
    .sort((a, b) => a.value - b.value);
  if (!values.length) return "";
  return values[0].value === values[values.length - 1].value
    ? values[0].display
    : `${values[0].display} - ${values[values.length - 1].display}`;
}

export function preparePropertyPayload<T extends Partial<Property>>(property: T): T {
  if (property.propertyType !== "Apartment" || !property.configurationDetails?.length) return property;
  const rows = property.configurationDetails;
  const nearbyDetails = property.nearbyDetails
    ? Object.fromEntries(
        Object.entries(property.nearbyDetails).filter(([, item]) =>
          item && (item.count !== undefined || Boolean(item.distance?.trim()))
        )
      )
    : undefined;
  return {
    ...property,
    configs: rows.map((row) => row.configuration),
    price: displayRange(rows, "price") || property.price,
    area: displayRange(rows, "superBuiltUpArea") || property.area,
    bedrooms: Math.min(...rows.map((row) => row.bedrooms)),
    bathrooms: Math.min(...rows.map((row) => row.bathrooms)),
    facing: rows[0]?.facings.join(", ") || property.facing,
    possession: property.possessionDetails?.status || property.possession,
    ageOfProperty: property.possessionDetails?.status === "Under Construction" ? "Under Construction" : "",
    nearbyDetails,
  } as T;
}

function validDate(value?: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

export function formatPossession(
  property: Pick<Property, "possession" | "possessionDetails" | "plotDetails"> & { propertyType?: string }
): string {
  if (property.propertyType === "Plot" && property.plotDetails?.layoutPossession) {
    const details = property.plotDetails.layoutPossession;
    const source = details.status === "Under Development" ? details.expectedCompletionDate : details.readyDate;
    if (!validDate(source)) return details.status;
    const formatted = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${source}T00:00:00`));
    return details.status === "Under Development" ? `Under development · Layout expected by ${formatted}` : `Layout ready · Ready since ${formatted}`;
  }
  const details = property.possessionDetails;
  if (!details) return property.possession?.trim() || "—";
  const source = details.status === "Under Construction" ? details.expectedCompletionDate : details.launchDate;
  if (!validDate(source)) return property.possession?.trim() || "—";
  const formatted = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${source}T00:00:00`));
  if (details.status === "Under Construction") {
    return `Under construction · Completion expected by ${formatted}`;
  }
  if (details.status === "Ready to Move") {
    return property.propertyType === "Villa"
      ? `Ready to move · Ready since ${formatted}`
      : `Ready to move · Launched on ${formatted}`;
  }
  const isFuture = new Date(`${source}T23:59:59`).getTime() > Date.now();
  return `New launch · ${isFuture ? "Launching" : "Launched"} on ${formatted}`;
}

export type ApartmentErrors = Record<string, string>;

export function validateApartmentDraft(property: Partial<Property>): ApartmentErrors {
  const errors: ApartmentErrors = {};
  const rows = property.configurationDetails || [];
  if (!rows.length) errors.configurations = "Add at least one BHK configuration.";
  rows.forEach((row) => {
    const prefix = `configuration.${row.configuration}`;
    if (!row.price.trim()) errors[`${prefix}.price`] = "Price is required.";
    if (!row.superBuiltUpArea.trim()) errors[`${prefix}.superBuiltUpArea`] = "Super built-up area is required.";
    if (!row.carpetArea.trim()) errors[`${prefix}.carpetArea`] = "Carpet area is required.";
    if (!Number.isInteger(row.bedrooms) || row.bedrooms < 1) errors[`${prefix}.bedrooms`] = "Enter at least 1 bedroom.";
    if (!Number.isInteger(row.bathrooms) || row.bathrooms < 1) errors[`${prefix}.bathrooms`] = "Enter at least 1 bathroom.";
    if (!Number.isInteger(row.balconies) || row.balconies < 0) errors[`${prefix}.balconies`] = "Balconies cannot be negative.";
    if (!row.facings.length) errors[`${prefix}.facings`] = "Select at least one facing.";
  });
  const possession = property.possessionDetails;
  if (!possession) errors.possessionDetails = "Select a possession status.";
  else if (possession.status === "Under Construction" && !validDate(possession.expectedCompletionDate)) {
    errors.possessionDate = "Expected completion date is required.";
  } else if (possession.status !== "Under Construction" && !validDate(possession.launchDate)) {
    errors.possessionDate = "Launch date is required.";
  }
  if (!property.floorLabel?.trim()) errors.floorLabel = "Flat floor is required.";
  if (property.totalFloors !== undefined && (!Number.isInteger(property.totalFloors) || property.totalFloors < 1)) {
    errors.totalFloors = "Total floors must be at least 1.";
  }
  if (/^[1-9]\d*$/.test(property.floorLabel || "") && property.totalFloors && Number(property.floorLabel) > property.totalFloors) {
    errors.floorLabel = "Flat floor cannot be higher than total floors.";
  }
  if (property.reraRegistered && !property.reraNumber?.trim()) errors.reraNumber = "RERA number is required.";
  if (property.transactionType === "New Property" && !property.bookingAmount?.trim()) {
    errors.bookingAmount = "Booking amount is required for a new property.";
  }
  if ((property.description || "").trim().length < 50) errors.description = "Enter at least 50 characters.";
  if (property.locality?.pinCode && !/^\d{6}$/.test(property.locality.pinCode)) errors.pinCode = "Enter a 6-digit PIN code.";
  if (property.virtualTourUrl) {
    try {
      const url = new URL(property.virtualTourUrl);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      errors.virtualTourUrl = "Enter a valid HTTP(S) virtual-tour URL.";
    }
  }
  for (const key of ["schools", "hospitals", "shopping", "metro"] as const) {
    const item = property.nearbyDetails?.[key];
    if (!item || (item.count === undefined && !item.distance?.trim())) continue;
    if (!Number.isInteger(item.count) || Number(item.count) < 0) errors[`nearby.${key}.count`] = "Enter a whole-number count.";
    if (!item.distance?.trim()) errors[`nearby.${key}.distance`] = "Enter the distance.";
  }
  return errors;
}

export function cleanPossessionDetails(status: PossessionDetails["status"]): PossessionDetails {
  return status === "Under Construction"
    ? { status, expectedCompletionDate: "" }
    : { status, launchDate: "" };
}
