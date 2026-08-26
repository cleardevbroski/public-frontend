import type {
  Property,
  VillaConfigurationDetail,
  VillaDetails,
  VillaType,
  VillaUnitVariant,
} from "@/components/acres/mock-data";
import { normalizeBhkLabel } from "@/lib/propertyDetails";

export type VillaErrors = Record<string, string>;

export const villaTypeOptions: VillaType[] = [
  "Independent", "Row Villa", "Twin Villa", "Villament", "Penthouse",
  "Duplex Villa", "Triplex Villa", "Mixed Villa Development",
];

export const villaUnitVariantOptions: VillaUnitVariant[] = [
  "Simplex", "Duplex", "Triplex", "Villament", "Penthouse", "Row House",
  "Independent Villa", "Twin Villa", "Sky Villa", "Custom",
];

export function normalizeVillaType(value: string): VillaType | undefined {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, " ");
  if (!normalized) return undefined;
  if (normalized.includes("mixed")) return "Mixed Villa Development";
  if (normalized.includes("villament")) return "Villament";
  if (normalized.includes("penthouse") || normalized.includes("pent house")) return "Penthouse";
  if (normalized.includes("row") || normalized.includes("townhouse") || normalized.includes("town house")) return "Row Villa";
  if (normalized.includes("triplex")) return "Triplex Villa";
  if (normalized.includes("duplex")) return "Duplex Villa";
  if (normalized.includes("twin")) return "Twin Villa";
  if (normalized.includes("independent") || normalized === "villa") return "Independent";
  return villaTypeOptions.find((option) => option.toLowerCase() === normalized);
}

function inferVillaUnitVariant(value: string): VillaUnitVariant | undefined {
  const normalized = value.toLowerCase();
  if (/\btriplex\b/.test(normalized)) return "Triplex";
  if (/\bduplex\b/.test(normalized)) return "Duplex";
  if (/\bsimplex\b/.test(normalized)) return "Simplex";
  if (/\bvillament\b/.test(normalized)) return "Villament";
  if (/\bpent\s*house\b/.test(normalized)) return "Penthouse";
  if (/\bsky\s*villa\b/.test(normalized)) return "Sky Villa";
  if (/\b(row\s*(?:house|villa)|town\s*house)\b/.test(normalized)) return "Row House";
  if (/\btwin\s*villa\b/.test(normalized)) return "Twin Villa";
  if (/\bindependent\s*villa\b/.test(normalized)) return "Independent Villa";
  return undefined;
}

export type ParsedVillaConfiguration = {
  configuration: string;
  bhk?: string;
  unitVariant?: VillaUnitVariant;
  numberOfFloors?: string;
};

/** Accepts canonical BHK labels as well as Villa labels such as 4 BHK Duplex (G+1), Villament, or Penthouse. */
export function parseVillaConfigurationLabel(value: string): ParsedVillaConfiguration | null {
  let configuration = String(value || "").trim().replace(/\s+/g, " ");
  if (!configuration || configuration.length > 120 || /[\r\n]/.test(configuration)) return null;
  const bhkMatch = configuration.match(/(\d+(?:\.5)?)\s*bhk\b/i);
  const bhk = bhkMatch ? normalizeBhkLabel(`${bhkMatch[1]} BHK`) || undefined : undefined;
  const inferredVariant = inferVillaUnitVariant(configuration);
  if (!bhk && !inferredVariant) return null;
  if (bhkMatch && bhk) configuration = configuration.replace(bhkMatch[0], bhk);
  configuration = configuration
    .replace(/pent\s*house/gi, "Penthouse")
    .replace(/\(\s*(G\s*\+\s*\d+|\d+)\s*\)/gi, (_, structure: string) => `(${structure.replace(/\s+/g, "").toUpperCase()})`);
  const structure = configuration.match(/\((G\+\d+|\d+)\)/i)?.[1]?.toUpperCase();
  return { configuration, bhk, unitVariant: inferredVariant, numberOfFloors: structure };
}

export const initialVillaDetails = (): VillaDetails => ({
  villaType: "Independent",
  configurationDetails: [],
  plotDimensions: "",
  numberOfFloors: "",
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
  const parsed = parseVillaConfigurationLabel(configuration);
  const normalizedConfiguration = parsed?.configuration || configuration.trim();
  const bedrooms = parsed?.bhk ? Math.floor(Number(parsed.bhk.match(/^\d+(?:\.5)?/)?.[0])) : undefined;
  return {
    configuration: normalizedConfiguration,
    bhk: parsed?.bhk,
    unitVariant: parsed?.unitVariant,
    price: "",
    plotArea: "",
    builtUpArea: "",
    carpetArea: "",
    superArea: "",
    bedrooms,
    bathrooms: bedrooms,
    balconies: undefined,
    numberOfFloors: parsed?.numberOfFloors,
    cornerPlot: false,
    privateGarden: false,
    privatePool: false,
    terrace: false,
    gatedCommunity: false,
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
  field: "price" | "plotArea" | "builtUpArea" | "carpetArea" | "superArea"
): string {
  const values = (rows || [])
    .map((row) => ({ display: row[field] || "", value: parseDisplayNumber(row[field], field === "price") }))
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
  if (!details || !villaTypeOptions.includes(details.villaType)) errors.villaType = "Select a valid Villa type.";
  rows.forEach((row, index) => {
    const prefix = `villaConfiguration.${index}`;
    const parsed = parseVillaConfigurationLabel(row.configuration);
    if (!parsed) errors[`${prefix}.configuration`] = "Use a Villa configuration such as 4 BHK Duplex (G+1), Villament, or Penthouse.";
    if (row.bhk && !normalizeBhkLabel(row.bhk)) errors[`${prefix}.bhk`] = "Use a positive BHK label, for example 4 BHK.";
    if (row.price && !positiveDisplay(row.price, true)) errors[`${prefix}.price`] = "Enter a positive price.";
    for (const areaField of ["plotArea", "builtUpArea", "carpetArea", "superArea"] as const) {
      if (row[areaField] && !positiveDisplay(row[areaField])) errors[`${prefix}.${areaField}`] = `Enter a positive ${areaField.replace(/([A-Z])/g, " $1").toLowerCase()}.`;
    }
    const expectedBedrooms = Math.floor(Number((row.bhk || parsed?.bhk)?.match(/^\d+(?:\.5)?/)?.[0]));
    if (row.bedrooms !== undefined && (!Number.isInteger(row.bedrooms) || row.bedrooms < 1 || (expectedBedrooms > 0 && row.bedrooms !== expectedBedrooms))) {
      errors[`${prefix}.bedrooms`] = `Bedrooms must equal ${expectedBedrooms || "the BHK value"}.`;
    }
    if (row.bathrooms !== undefined && (!Number.isInteger(row.bathrooms) || row.bathrooms < 1)) errors[`${prefix}.bathrooms`] = "Enter at least 1 bathroom.";
    if (row.balconies !== undefined && (!Number.isInteger(row.balconies) || row.balconies < 0)) errors[`${prefix}.balconies`] = "Enter zero or more balconies.";
    if (row.plotDimensions?.trim()) {
      const dimensions = row.plotDimensions.trim().match(/^(\d+(?:\.\d+)?)\s*(?:ft|feet|')?\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|')?$/i);
      if (!dimensions || Number(dimensions[1]) <= 0 || Number(dimensions[2]) <= 0) errors[`${prefix}.plotDimensions`] = "Use positive width × length values.";
    }
    if (row.numberOfFloors?.trim() && !/^(?:G(?:\s*\+\s*[1-9]\d*)?|[1-9]\d*)$/i.test(row.numberOfFloors.trim())) errors[`${prefix}.numberOfFloors`] = "Use G, G+N, or a positive whole number.";
    if (row.roadWidthFacing?.trim() && !positiveDisplay(row.roadWidthFacing)) errors[`${prefix}.roadWidthFacing`] = "Enter a positive road width.";
    if (row.privateGarden && row.privateGardenArea && !positiveDisplay(row.privateGardenArea)) errors[`${prefix}.privateGardenArea`] = "Enter a positive garden area.";
  });
  // Validate the legacy project-wide garden fields when editing an older Villa.
  if (details?.privateGardenArea && !positiveDisplay(details.privateGardenArea)) {
    errors.privateGardenArea = "Enter a positive private garden area.";
  }
  const tags = (property.configs || []).map((tag) => parseVillaConfigurationLabel(tag)?.configuration);
  if (tags.some((tag) => !tag) || tags.length !== rows.length || tags.some((tag, index) => tag !== parseVillaConfigurationLabel(rows[index]?.configuration || "")?.configuration)) {
    errors.configurations = "Configuration tags and Villa rows must match in the same order.";
  }
  const possession = property.possessionDetails;
  if (!possession || !["Ready to Move", "Under Construction"].includes(possession.status)) {
    errors.possessionDetails = "Select Ready to Move or Under Construction.";
  } else if (possession.status === "Under Construction" && (!/^\d{4}-(0[1-9]|1[0-2])(?:-\d{2})?$/.test(possession.expectedCompletionDate || "") || Boolean(possession.launchDate))) {
    errors.possessionDate = "Under Construction requires only an expected completion month and year.";
  } else if (possession.status === "Ready to Move" && (!validDate(possession.launchDate) || Boolean(possession.expectedCompletionDate))) {
    errors.possessionDate = "Ready to Move requires only a Ready Since date.";
  }
  if (!property.builder?.trim()) errors.builder = "Builder/developer is required.";
  if (!property.transactionType || !["New Property", "Resale"].includes(property.transactionType)) errors.transactionType = "Select a transaction type.";
  if (!property.listingType || !["For Sale", "For Rent"].includes(property.listingType)) errors.listingType = "Select a listing type.";
  if (property.reraRegistered && (!property.reraPhases?.length || property.reraPhases.some((phase) => !phase.name.trim() || !/^[A-Za-z0-9/._-]{8,50}$/.test(phase.reraNumber.trim())))) {
    errors.reraPhases = "Every phase needs a valid name and 8–50 character RERA number.";
  }
  if (property.locality?.pinCode && !/^\d{6}$/.test(property.locality.pinCode)) errors.pinCode = "Enter a 6-digit PIN code.";
  for (const key of ["schools", "colleges", "hospitals", "shopping", "metro", "workplaces", "parks", "roads"] as const) {
    const item = property.nearbyDetails?.[key];
    if (!item || (!item.places?.length && item.count === undefined && !item.distance?.trim())) continue;
    item.places?.forEach((place, index) => {
      if (!place.name.trim()) errors[`nearby.${key}.places.${index}.name`] = "Enter the place name.";
    });
    if (item.places?.length) continue;
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
        item && (Boolean(item.places?.length) || item.count !== undefined || Boolean(item.distance?.trim()))
      ))
    : undefined;
  return {
    ...property,
    configs: rows.map((row) => row.configuration),
    price: villaDisplayRange(rows, "price") || property.price,
    area: villaDisplayRange(rows, "superArea") || villaDisplayRange(rows, "builtUpArea") || villaDisplayRange(rows, "carpetArea") || villaDisplayRange(rows, "plotArea") || property.area,
    bedrooms: rows.some((row) => row.bedrooms !== undefined) ? Math.min(...rows.flatMap((row) => row.bedrooms === undefined ? [] : [row.bedrooms])) : property.bedrooms,
    bathrooms: rows.some((row) => row.bathrooms !== undefined) ? Math.min(...rows.flatMap((row) => row.bathrooms === undefined ? [] : [row.bathrooms])) : property.bathrooms,
    facing: rows.find((row) => row.plotFacing)?.plotFacing || property.villaDetails?.plotFacing || "",
    possession: property.possessionDetails?.status || property.possession,
    ageOfProperty: property.possessionDetails?.status === "Under Construction" ? "Under Construction" : "",
    nearbyDetails,
    configurationDetails: undefined,
    floorLabel: undefined,
    totalFloors: undefined,
    overlooking: undefined,
  } as T;
}
