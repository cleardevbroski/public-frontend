import type { CommercialDetails, Property } from "@/components/acres/mock-data";

export type CommercialErrors = Record<string, string>;
export const initialCommercialDetails = (): CommercialDetails => ({
  commercialSubtype: "Office Space", carpetArea: "", builtUpArea: "", superArea: "", floor: "", totalFloors: 1,
  frontage: "", zoneType: "IT/ITES SEZ", seatingCapacity: 0, cabins: 0, meetingRooms: 0, buildingGrade: "Grade A",
  structure: "", pantry: "None", washrooms: "", parking: "", powerBackup: "", sanctionedLoadKva: 0,
  fireSafetyCompliance: "", furnishing: "Bare Shell",
});

const positive = (value?: string) => Number.isFinite(Number(String(value || "").replace(/[^\d.]/g, ""))) && Number(String(value || "").replace(/[^\d.]/g, "")) > 0;
const date = (value?: string) => /^\d{4}-\d{2}-\d{2}$/.test(value || "") && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
const month = (value?: string) => /^\d{4}-(0[1-9]|1[0-2])(?:-\d{2})?$/.test(value || "");

export function validateCommercialDraft(property: Partial<Property>): CommercialErrors {
  const errors: CommercialErrors = {};
  const details = property.commercialDetails;
  if (!details) return { commercialDetails: "Commercial details are required." };
  if (!["Office Space", "Shop/Showroom", "Warehouse", "Industrial Shed", "Co-working"].includes(details.commercialSubtype)) errors.commercialSubtype = "Select a commercial subtype.";
  if (![details.carpetArea, details.builtUpArea, details.superArea].some(Boolean)) errors.areas = "Enter at least one area.";
  (["carpetArea", "builtUpArea", "superArea"] as const).forEach((field) => { if (details[field] && !positive(details[field])) errors[field] = "Enter a positive area."; });
  if (!details.floor.trim()) errors.floor = "Floor is required.";
  if (!Number.isInteger(details.totalFloors) || details.totalFloors < 1) errors.totalFloors = "Enter total floors.";
  if (/^[1-9]\d*$/.test(details.floor) && Number(details.floor) > details.totalFloors) errors.floor = "Floor cannot exceed total floors.";
  if (details.commercialSubtype === "Shop/Showroom" && !positive(details.frontage)) errors.frontage = "Frontage is required for a shop/showroom.";
  if (!property.builder?.trim()) errors.builder = "Builder/developer is required.";
  if (property.transactionType !== "New Property") errors.transactionType = property.transactionType === "Resale" ? "Resale properties are not applicable." : "Select New Property.";
  if (!['For Sale', 'For Rent'].includes(property.listingType || "")) errors.listingType = "Select a listing type.";
  const possession = property.possessionDetails;
  if (!possession || !["Ready to Move", "Under Construction"].includes(possession.status)) errors.possessionDetails = "Select Ready to Move or Under Construction.";
  else if (possession.status === "Under Construction" ? !month(possession.expectedCompletionDate) : !date(possession.launchDate)) errors.possessionDate = possession.status === "Under Construction" ? "Enter the expected completion month and year." : "Enter the ready date.";
  if (property.reraRegistered && (!property.reraPhases?.length || property.reraPhases.some((phase) => !phase.name.trim() || !/^[A-Za-z0-9/._-]{8,50}$/.test(phase.reraNumber.trim())))) errors.reraPhases = "Every phase needs a valid name and 8–50 character RERA number.";
  return errors;
}

export function prepareCommercialPropertyPayload<T extends Partial<Property>>(property: T): T {
  const details = property.commercialDetails;
  if (property.propertyType !== "Commercial" || !details) return property;
  return { ...property, configs: [details.commercialSubtype], area: details.superArea || details.builtUpArea || details.carpetArea || "", possession: property.possessionDetails?.status || property.possession, ageOfProperty: property.possessionDetails?.status === "Under Construction" ? "Under Construction" : "", configurationDetails: undefined, villaDetails: undefined, plotDetails: undefined, bedrooms: undefined, bathrooms: undefined, floorLabel: undefined, totalFloors: undefined, facing: undefined, furnishing: undefined, parking: undefined } as T;
}
