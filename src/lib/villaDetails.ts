import type {
  Property,
  VillaConfigurationDetail,
  VillaDetails,
} from "@/components/acres/mock-data";
import { normalizeBhkLabel } from "@/lib/propertyDetails";

export type VillaErrors = Record<string, string>;

export const initialVillaDetails = (): VillaDetails => ({
  villaType: "Independent",
  configurationDetails: [],
  plotDimensions: "",
  numberOfFloors: "",
  plotFacing: "East",
  cornerPlot: false,
  roadWidthFacing: "",
  privateGarden: false,
  privateGardenArea: "",
  privatePool: false,
  terrace: false,
  terraceDetails: "",
  gatedCommunity: false,
});

export function createVillaConfigurationDetail(configuration: string): VillaConfigurationDetail {
  const bedrooms = Number(configuration.match(/^\d+/)?.[0] || 1);
  return {
    configuration,
    price: "",
    plotArea: "",
    builtUpArea: "",
    superArea: "",
    bedrooms,
    bathrooms: bedrooms,
  };
}

function parseDisplayNumber(value: string | undefined, price = false): number {
  const match = String(value || "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return Number.NaN;
  const number = Number(match[1]);
  if (!price) return number;
  const unit = String(value || "").toLowerCase();
  if (/\b(cr|crore)\b/.test(unit)) return number * 10_000_000;
  if (/\b(l|lac|lakh)\b/.test(unit)) return number * 100_000;
  return number;
}

function positiveDisplay(value: string | undefined, price = false): boolean {
  const number = parseDisplayNumber(value, price);
  return Number.isFinite(number) && number > 0;
}

export function villaDisplayRange(
  rows: VillaConfigurationDetail[] | undefined,
  field: "price" | "superArea"
): string {
  const values = (rows || [])
    .map((row) => ({ display: row[field], value: parseDisplayNumber(row[field], field === "price") }))
    .filter((item) => Number.isFinite(item.value))
    .sort((a, b) => a.value - b.value);
  if (!values.length) return "";
  return values[0].value === values[values.length - 1].value
    ? values[0].display
    : `${values[0].display} - ${values[values.length - 1].display}`;
}

function validDate(value?: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export function validateVillaDraft(property: Partial<Property>): VillaErrors {
  const errors: VillaErrors = {};
  const details = property.villaDetails;
  const rows = details?.configurationDetails || [];
  if (!rows.length) errors.configurations = "Add at least one Villa BHK configuration.";
  if (!details || !["Independent", "Row Villa", "Twin Villa"].includes(details.villaType)) errors.villaType = "Select a valid Villa type.";
  if (!details || !["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"].includes(details.plotFacing)) errors.plotFacing = "Select a valid plot facing.";
  const seen = new Set<string>();
  rows.forEach((row) => {
    const prefix = `villaConfiguration.${row.configuration}`;
    const normalized = normalizeBhkLabel(row.configuration);
    if (!normalized) errors[`${prefix}.configuration`] = "Use a positive whole-number BHK label.";
    else if (seen.has(normalized.toLowerCase())) errors.configurations = `Duplicate configuration: ${normalized}.`;
    else seen.add(normalized.toLowerCase());
    if (!positiveDisplay(row.price, true)) errors[`${prefix}.price`] = "Enter a positive price.";
    if (!positiveDisplay(row.plotArea)) errors[`${prefix}.plotArea`] = "Enter a positive plot area.";
    if (!positiveDisplay(row.builtUpArea)) errors[`${prefix}.builtUpArea`] = "Enter a positive built-up area.";
    if (!positiveDisplay(row.superArea)) errors[`${prefix}.superArea`] = "Enter a positive super area.";
    const expectedBedrooms = Number(normalizeBhkLabel(row.configuration)?.match(/^\d+/)?.[0]);
    if (!Number.isInteger(row.bedrooms) || row.bedrooms !== expectedBedrooms) {
      errors[`${prefix}.bedrooms`] = `Bedrooms must equal ${expectedBedrooms || "the BHK value"}.`;
    }
    if (!Number.isInteger(row.bathrooms) || row.bathrooms < 1) errors[`${prefix}.bathrooms`] = "Enter at least 1 bathroom.";
  });
  const tags = (property.configs || []).map(normalizeBhkLabel);
  if (tags.some((tag) => !tag) || tags.length !== rows.length || tags.some((tag, index) => tag !== normalizeBhkLabel(rows[index]?.configuration || ""))) {
    errors.configurations = "Configuration tags and Villa rows must match in the same order.";
  }
  if (details?.plotDimensions?.trim()) {
    const dimensions = details.plotDimensions.trim().match(/^(\d+(?:\.\d+)?)\s*(?:ft|feet|')?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|')?$/i);
    if (!dimensions || Number(dimensions[1]) <= 0 || Number(dimensions[2]) <= 0) errors.plotDimensions = "Use positive width × length values in feet, for example 40 ft × 60 ft.";
  }
  if (details?.numberOfFloors?.trim() && !/^(?:G(?:\s*\+\s*[1-9]\d*)?|[1-9]\d*)$/i.test(details.numberOfFloors.trim())) {
    errors.numberOfFloors = "Use G, G+N, or a positive whole number.";
  }
  if (details?.roadWidthFacing?.trim() && !positiveDisplay(details.roadWidthFacing)) {
    errors.roadWidthFacing = "Enter a positive road width.";
  }
  if (details?.privateGarden && !positiveDisplay(details.privateGardenArea)) {
    errors.privateGardenArea = "Garden area is required when a private garden is available.";
  }
  const possession = property.possessionDetails;
  if (!possession || !["Ready to Move", "Under Construction"].includes(possession.status)) {
    errors.possessionDetails = "Select Ready to Move or Under Construction.";
  } else if (possession.status === "Under Construction" && (!validDate(possession.expectedCompletionDate) || Boolean(possession.launchDate))) {
    errors.possessionDate = "Under Construction requires only an expected completion date.";
  } else if (possession.status === "Ready to Move" && (!validDate(possession.launchDate) || Boolean(possession.expectedCompletionDate))) {
    errors.possessionDate = "Ready to Move requires only a Ready Since date.";
  }
  if (!property.builder?.trim()) errors.builder = "Builder/developer is required.";
  if (!property.transactionType || !["New Property", "Resale"].includes(property.transactionType)) errors.transactionType = "Select a transaction type.";
  if (!property.listingType || !["For Sale", "For Rent"].includes(property.listingType)) errors.listingType = "Select a listing type.";
  if (property.reraRegistered && !/^[A-Za-z0-9/._-]{8,50}$/.test(property.reraNumber?.trim() || "")) {
    errors.reraNumber = "Use 8–50 letters, numbers, /, ., _, or -.";
  }
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

export function prepareVillaPropertyPayload<T extends Partial<Property>>(property: T): T {
  const rows = property.villaDetails?.configurationDetails;
  if (property.propertyType !== "Villa" || !rows?.length) return property;
  const nearbyDetails = property.nearbyDetails
    ? Object.fromEntries(Object.entries(property.nearbyDetails).filter(([, item]) =>
        item && (item.count !== undefined || Boolean(item.distance?.trim()))
      ))
    : undefined;
  return {
    ...property,
    configs: rows.map((row) => row.configuration),
    price: villaDisplayRange(rows, "price") || property.price,
    area: villaDisplayRange(rows, "superArea") || property.area,
    bedrooms: Math.min(...rows.map((row) => row.bedrooms)),
    bathrooms: Math.min(...rows.map((row) => row.bathrooms)),
    facing: property.villaDetails?.plotFacing || property.facing,
    possession: property.possessionDetails?.status || property.possession,
    ageOfProperty: property.possessionDetails?.status === "Under Construction" ? "Under Construction" : "",
    nearbyDetails,
    configurationDetails: undefined,
    floorLabel: undefined,
    totalFloors: undefined,
    ownershipType: undefined,
    overlooking: undefined,
    maintenanceCharges: undefined,
    maintenancePeriod: undefined,
  } as T;
}
