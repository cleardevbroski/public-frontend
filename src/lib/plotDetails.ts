import type { PlotDetails, PlotFacing, PlotInventoryItem, PlotSizeDetail, Property } from "@/components/acres/mock-data";

export type PlotErrors = Record<string, string>;
const facings: PlotFacing[] = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];

export const initialPlotDetails = (): PlotDetails => ({
  plotSizeDetails: [],
  totalPlots: 0,
  approvalAuthority: "BMRDA",
  approvalNumber: "",
  roadWidth: "",
  civicInfrastructure: { undergroundDrainage: "Ready", electricity: "Ready", water: "Ready" },
  layoutMapUrl: "",
  layoutMapType: "image",
  layoutPossession: { status: "Layout Ready", readyDate: "" },
  inventory: [],
});

export function normalizePlotSize(value: string): { plotSize: string; width: number; length: number; areaSqft: number } | null {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(?:ft|feet|')?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:ft|feet|')?$/i);
  if (!match || Number(match[1]) <= 0 || Number(match[2]) <= 0) return null;
  const width = Number(match[1]);
  const length = Number(match[2]);
  return { plotSize: `${width} × ${length}`, width, length, areaSqft: width * length };
}

export function createPlotSizeDetail(value: string): PlotSizeDetail {
  const size = normalizePlotSize(value)!;
  return { ...size, pricePerSqft: 0, totalPrice: 0, facings: [] };
}

export function createPlotInventoryItem(plotSize = ""): PlotInventoryItem {
  return { plotNumber: "", plotSize, facing: "East", status: "Available", isCorner: false };
}

function validDate(value?: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "") && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export function formatPlotPrice(value: number) {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(value % 10_000_000 === 0 ? 0 : 2)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(value % 100_000 === 0 ? 0 : 2)} L`;
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function validatePlotDraft(property: Partial<Property>): PlotErrors {
  const errors: PlotErrors = {};
  const details = property.plotDetails;
  const rows = details?.plotSizeDetails || [];
  if (!rows.length) errors.configurations = "Add at least one plot size, for example 30 × 40.";
  const seen = new Set<string>();
  rows.forEach((row) => {
    const normalized = normalizePlotSize(row.plotSize);
    const prefix = `plotSize.${row.plotSize}`;
    if (!normalized) errors[`${prefix}.plotSize`] = "Use positive width × length values, for example 30 × 40.";
    else if (seen.has(normalized.plotSize)) errors.configurations = `Duplicate plot size: ${normalized.plotSize}.`;
    else seen.add(normalized.plotSize);
    if (!Number.isFinite(row.pricePerSqft) || row.pricePerSqft <= 0) errors[`${prefix}.pricePerSqft`] = "Enter a positive price per sqft.";
    if (!row.facings.length || row.facings.some((facing) => !facings.includes(facing))) errors[`${prefix}.facings`] = "Select at least one valid facing.";
  });
  const tags = property.configs || [];
  if (tags.length !== rows.length || tags.some((tag, index) => tag !== normalizePlotSize(rows[index]?.plotSize || "")?.plotSize)) errors.configurations = "Plot-size tags and detail rows must match.";
  if (!details || !Number.isInteger(details.totalPlots) || details.totalPlots < 1) errors.totalPlots = "Enter the total number of plots.";
  if (details && details.inventory.length !== details.totalPlots) errors.inventory = "Inventory rows must exactly match the declared number of plots.";
  const plotNumbers = new Set<string>();
  details?.inventory.forEach((item, index) => {
    if (!item.plotNumber.trim()) errors[`inventory.${index}.plotNumber`] = "Enter a plot number.";
    else if (plotNumbers.has(item.plotNumber.trim().toLowerCase())) errors.inventory = `Duplicate plot number: ${item.plotNumber}.`;
    else plotNumbers.add(item.plotNumber.trim().toLowerCase());
    if (!rows.some((row) => row.plotSize === item.plotSize)) errors[`inventory.${index}.plotSize`] = "Select a listed plot size.";
    if (!facings.includes(item.facing)) errors[`inventory.${index}.facing`] = "Select a valid facing.";
  });
  if (!details?.layoutMapUrl) errors.layoutMapUrl = "Upload the required master plan / layout map.";
  if (details?.layoutPossession.status === "Layout Ready" && !validDate(details.layoutPossession.readyDate)) errors.layoutPossession = "Layout Ready requires a ready date.";
  if (details?.layoutPossession.status === "Under Development" && !validDate(details.layoutPossession.expectedCompletionDate)) errors.layoutPossession = "Under Development requires an expected completion date.";
  if (!property.builder?.trim()) errors.builder = "Builder/developer is required.";
  if (!property.transactionType || !["New Property", "Resale"].includes(property.transactionType)) errors.transactionType = "Select a transaction type.";
  if (!property.listingType || !["For Sale", "For Rent"].includes(property.listingType)) errors.listingType = "Select a listing type.";
  if (property.reraRegistered && !/^[A-Za-z0-9/._-]{8,50}$/.test(property.reraNumber?.trim() || "")) errors.reraNumber = "Use 8–50 letters, numbers, /, ., _, or -.";
  if (property.locality?.pinCode && !/^\d{6}$/.test(property.locality.pinCode)) errors.pinCode = "Enter a 6-digit PIN code.";
  return errors;
}

export function preparePlotPropertyPayload<T extends Partial<Property>>(property: T): T {
  const rows = property.plotDetails?.plotSizeDetails;
  if (property.propertyType !== "Plot" || !rows?.length) return property;
  const values = rows.map((row) => ({ ...row, totalPrice: Math.round(row.areaSqft * row.pricePerSqft) }));
  const minPrice = Math.min(...values.map((row) => row.totalPrice));
  const maxPrice = Math.max(...values.map((row) => row.totalPrice));
  const minArea = Math.min(...values.map((row) => row.areaSqft));
  const maxArea = Math.max(...values.map((row) => row.areaSqft));
  const minPsf = Math.min(...values.map((row) => row.pricePerSqft));
  const maxPsf = Math.max(...values.map((row) => row.pricePerSqft));
  const layout = property.plotDetails!.layoutPossession;
  const badges = (property.badges || []).filter((badge) => badge !== "Corner Plot");
  if (property.plotDetails!.inventory.some((item) => item.isCorner && item.status === "Available")) badges.push("Corner Plot");
  return {
    ...property,
    configs: values.map((row) => row.plotSize),
    plotDetails: { ...property.plotDetails!, plotSizeDetails: values },
    price: minPrice === maxPrice ? formatPlotPrice(minPrice) : `${formatPlotPrice(minPrice)} - ${formatPlotPrice(maxPrice)}`,
    pricePerSqft: minPsf === maxPsf ? `₹${minPsf.toLocaleString("en-IN")}/sqft` : `₹${minPsf.toLocaleString("en-IN")}/sqft - ₹${maxPsf.toLocaleString("en-IN")}/sqft`,
    area: minArea === maxArea ? `${minArea} sqft` : `${minArea} - ${maxArea} sqft`,
    possession: layout.status,
    ageOfProperty: layout.status === "Under Development" ? "Under Construction" : "",
    badges,
    configurationDetails: undefined,
    villaDetails: undefined,
    possessionDetails: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    furnishing: undefined,
    parking: undefined,
    floorLabel: undefined,
    totalFloors: undefined,
    ownershipType: undefined,
    overlooking: undefined,
    bookingAmount: undefined,
    maintenanceCharges: undefined,
    maintenancePeriod: undefined,
  } as T;
}
