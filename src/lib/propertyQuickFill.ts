import * as XLSX from "xlsx";
import type {
  CommercialDetails,
  ConfigurationDetail,
  PgDetails,
  PlotDetails,
  PlotFacing,
  Property,
  VillaConfigurationDetail,
} from "@/components/acres/mock-data";
import { createConfigurationDetail, normalizeBhkLabel } from "@/lib/propertyDetails";
import {
  createVillaConfigurationDetail,
  initialVillaDetails,
  normalizeVillaFloorCount,
  normalizePlotFacing,
  normalizeVillaType,
  parseVillaConfigurationLabel,
  villaUnitVariantOptions,
} from "@/lib/villaDetails";
import { createPlotSizeDetail, initialPlotDetails, normalizePlotSize } from "@/lib/plotDetails";
import { initialCommercialDetails } from "@/lib/commercialDetails";
import { initialPgDetails } from "@/lib/pgDetails";
import {
  PROPERTY_DESCRIPTION_TEMPLATES,
  PROPERTY_TEMPLATE_FILE_NAMES,
  type PropertyImportType,
} from "@/lib/propertyDescriptionTemplates";

export type SupportedPropertyType = PropertyImportType;
export type QuickFillPatch = Partial<Property>;
export type QuickFillSuggestion = {
  patch: QuickFillPatch;
  fields: Array<{ label: string; value: string }>;
  warnings: string[];
};

const MAX_ROWS = 250;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const KARNATAKA_RERA_URL = "https://rera.karnataka.gov.in/viewAllProjects";

function clean(value: unknown): string {
  return String(value ?? "").trim();
}
function key(value: unknown): string {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function number(value: unknown): number | undefined {
  const match = clean(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}
function normalizeImportTransaction(value: unknown): string | undefined {
  const raw = clean(value);
  if (!raw) return undefined;
  if (/\bnew\s*property\b/i.test(raw)) return "New Property";
  if (/\bresale\b/i.test(raw)) throw new Error("Resale properties are not applicable. Import a New Property project instead.");
  return raw;
}
function componentAreaToSqft(value: unknown): number | undefined {
  const parsed = number(value);
  if (parsed === undefined) return undefined;
  return /\bacres?\b/i.test(clean(value)) ? parsed * 43_560 : parsed;
}
function totalLandToAcres(value: unknown): number | undefined {
  const parsed = number(value);
  if (parsed === undefined) return undefined;
  return /\b(?:sq\.?\s*ft|sqft|square\s*feet)\b/i.test(clean(value)) ? parsed / 43_560 : parsed;
}
function list(value: unknown): string[] {
  return clean(value).split(/[,;|\n]/).map((item) => item.trim()).filter(Boolean);
}
function multiLineList(value: unknown): string[] {
  return clean(value).split(/[;|\n]/).map((item) => item.trim()).filter(Boolean);
}

function importedPlotFacing(value: unknown, warnings: string[], label: string): PlotFacing | undefined {
  const raw = clean(value);
  const facing = normalizePlotFacing(raw);
  if (raw && !facing) {
    const warning = `${label} was skipped because \"${raw}\" contains more than one direction or is unsupported. Select one facing in the form.`;
    if (!warnings.includes(warning)) warnings.push(warning);
  }
  return facing;
}

function jsonValue<T>(value: string, label: string, warnings: string[]): T | undefined {
  if (!clean(value)) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    warnings.push(`${label} contains invalid JSON and was skipped.`);
    return undefined;
  }
}

function approvedCloudinaryUrl(value: unknown): string | undefined {
  const url = clean(value);
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function normalizePropertyType(value: unknown): SupportedPropertyType | undefined {
  const normalized = key(value);
  if (normalized.includes("apartment") || normalized.includes("flat")) return "Apartment";
  if (normalized.includes("villa") || normalized.includes("mansion") || normalized.includes("rowhouse") || normalized.includes("penthouse")) return "Villa";
  if (normalized.includes("plot") || normalized.includes("land")) return "Plot";
  if (normalized.includes("commercial") || normalized.includes("office") || normalized.includes("warehouse") || normalized.includes("showroom")) return "Commercial";
  if (normalized.includes("pg") || normalized.includes("coliving") || normalized.includes("hostel")) return "PG/Co-living";
  return undefined;
}

function normalizeImportedApartmentConfiguration(value: unknown): string | null {
  const raw = clean(value);
  const direct = normalizeBhkLabel(raw);
  if (direct) return direct;
  const embedded = raw.match(/\b\d+(?:\.5)?\s*BHK\b/i)?.[0];
  return embedded ? normalizeBhkLabel(embedded) : null;
}

function completion(value: string): QuickFillPatch["possessionDetails"] | undefined {
  const month = value.match(/(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*[-, ]?\s*(20\d{2})/i);
  if (month) {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const index = months.indexOf(month[0].slice(0, 3).toLowerCase());
    if (index >= 0) return { status: "Under Construction", expectedCompletionDate: `${month[1]}-${String(index + 1).padStart(2, "0")}` };
  }
  if (/under\s*(construction|development)|possession\s*(by|in|:)/i.test(value)) return { status: "Under Construction", expectedCompletionDate: "" };
  if (/ready\s*(to move|for possession)|ready possession/i.test(value)) return { status: "Ready to Move", launchDate: "" };
  return undefined;
}

function templatePossession(statusValue: string, dateValue: string): QuickFillPatch["possessionDetails"] | undefined {
  const status = clean(statusValue);
  const date = clean(dateValue);
  if (status === "Under Construction") {
    const normalized = date.match(/^(20\d{2})-(0[1-9]|1[0-2])/)?.slice(1).join("-");
    return { status, expectedCompletionDate: normalized || completion(`${status} ${date}`)?.expectedCompletionDate || "" };
  }
  if (["Ready to Move", "New Launch"].includes(status)) return { status: status as "Ready to Move" | "New Launch", launchDate: /^20\d{2}-\d{2}-\d{2}$/.test(date) ? date : "" };
  return completion(`${status} ${date}`);
}

function addField(fields: QuickFillSuggestion["fields"], label: string, value: unknown) {
  const text = clean(value);
  if (text) fields.push({ label, value: text });
}

function buildCommonPatch(read: (names: string[]) => string, preferredType?: SupportedPropertyType): QuickFillSuggestion {
  const fields: QuickFillSuggestion["fields"] = [];
  const warnings: string[] = [];
  const propertyType = normalizePropertyType(read(["propertytype", "type", "category"])) || preferredType;
  const possessionText = read(["possession", "possessionyear", "posseionyear", "possessiondate", "expectedcompletion", "completiondate"]);
  const reraNumber = read(["reranumber", "reraregistrationnumber", "rera"]);
  const reraPhaseName = read(["reraphasename", "phasename"]);
  const amenities = list(read(["amenities", "commonamenities", "facilities"]));
  const projectNarrative = jsonValue<Property["projectNarrative"]>(read(["projectnarrativejson"]), "Project Narrative JSON", warnings);
  const masterPlan = jsonValue<Property["masterPlan"]>(read(["masterplanjson"]), "Master Plan JSON", warnings);
  const faqs = jsonValue<Property["faqs"]>(read(["faqsjson"]), "FAQs JSON", warnings);
  const projectDownloads = jsonValue<Property["projectDownloads"]>(read(["projectdownloadsjson"]), "Project Downloads JSON", warnings);
  const reraPhasesJson = jsonValue<Property["reraPhases"]>(read(["reraphasesjson"]), "RERA Phases JSON", warnings);
  const heroImages = list(read(["heroimages"])).map(approvedCloudinaryUrl).filter((value): value is string => Boolean(value)).slice(0, 3);
  const galleryImages = list(read(["galleryimages"])).map(approvedCloudinaryUrl).filter((value): value is string => Boolean(value));
  const developerLogoUrl = approvedCloudinaryUrl(read(["developerlogourl"]));
  const safeDownloads = (projectDownloads || []).filter((item) => item?.mimeType === "application/pdf" && Boolean(approvedCloudinaryUrl(item.fileUrl))).map((item) => ({ ...item, fileUrl: approvedCloudinaryUrl(item.fileUrl) }));
  const patch: QuickFillPatch = {
    propertyType,
    title: read(["project", "projects", "projectname", "propertyname", "title", "name"]),
    subtitle: read(["location", "subtitle", "locality", "address"]),
    builder: read(["company", "builder", "developer", "builderdeveloper"]),
    price: read(["priceupto", "price", "totalprice", "pricefrom"]),
    pricePerSqft: read(["pricepersqft", "psf", "ratepersqft"]),
    area: read(["sqftstartsfrom", "area", "superarea", "builtuparea", "size"]),
    description: read(["description", "propertydescription", "about"]),
    transactionType: normalizeImportTransaction(read(["transactiontype", "transaction"])),
    listingType: read(["listingtype", "listing", "saleorrent"]) || undefined,
    furnishing: read(["furnishing", "furnished"]),
    parking: read(["parking", "carparking"]),
    facing: read(["facing", "direction"]),
    floor: read(["floor", "propertyfloor"]),
    totalFloors: number(read(["totalfloors", "nofloors", "numberoffloors"])),
    amenities,
    projectNarrative,
    masterPlan,
    faqs,
    heroImages,
    images: galleryImages,
    developerLogoUrl,
    developerDescription: read(["developerdescription", "aboutdeveloper"]),
    projectDownloads: safeDownloads,
    reraRegistered: Boolean(reraNumber) || /yes|true|registered/i.test(read(["reraregistered"])),
    reraNumber: reraNumber || undefined,
    reraPhases: reraPhasesJson || (reraNumber ? [{ name: reraPhaseName || "Phase 1", reraNumber, reraDocuments: [], projectDocuments: [] }] : []),
    projectArea: ["totalprojectarea", "projectarea", "totalarea", "sitearea", "openspacearea", "emptyopenspacearea", "apartmentbuiltuparea", "buildingarea", "amenitiesarea"].some((name) => Boolean(read([name]))) ? {
      totalAcres: totalLandToAcres(read(["totalprojectarea", "projectarea", "totalarea", "sitearea"])),
      openSpaceSqft: componentAreaToSqft(read(["openspacearea", "emptyopenspacearea"])),
      builtUpSqft: componentAreaToSqft(read(["apartmentbuiltuparea", "buildingarea"])),
      amenitiesSqft: componentAreaToSqft(read(["amenitiesarea"])),
    } : undefined,
    totalUnits: number(read(["totalunits", "units", "totalhomes"])),
    totalTowers: number(read(["totaltowers", "towers"])),
    locality: {
      city: read(["city"]),
      zone: read(["zone"]),
      address: read(["address", "fulladdress"]),
      landmark: read(["landmark", "location"]),
      pinCode: read(["pincode", "postalcode", "zipcode"]),
    },
    possessionDetails: completion(possessionText),
    possession: possessionText || undefined,
  };
  Object.entries(patch).forEach(([label, value]) => {
    if (Array.isArray(value) ? value.length : value && typeof value === "object" ? Object.values(value).some(Boolean) : value !== undefined) addField(fields, label, Array.isArray(value) ? value.join(", ") : value);
  });
  if (!propertyType) warnings.push("Select a property type before applying this import, or include a Property Type column in Excel.");
  if ((read(["heroimages"]) || read(["galleryimages"]) || read(["developerlogourl"])) && !heroImages.length && !galleryImages.length && !developerLogoUrl) warnings.push("Media URLs were skipped because only permanent Cloudinary HTTPS URLs can be re-imported.");
  return { patch, fields, warnings };
}

function rowsFromSheet(sheet: XLSX.WorkSheet): string[][] {
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false }).map((row: unknown[]) => row.map(clean));
}

function getHeaders(rows: string[][]) {
  const headers = rows[0] || [];
  return headers.map(key);
}

function valueAt(row: string[], headers: string[], names: string[]) {
  const index = headers.findIndex((header) => names.includes(header));
  return index >= 0 ? clean(row[index]) : "";
}

function configurationsFromWideRow(row: string[], rawHeaders: string[], propertyType?: SupportedPropertyType) {
  const configurations: Array<{ configuration: string; area: string; price: string }> = [];
  rawHeaders.forEach((header, index) => {
    if (!/^\s*bhk\b/i.test(header)) return;
    const rawConfiguration = clean(row[index]);
    const configuration = propertyType === "Villa"
      ? parseVillaConfigurationLabel(rawConfiguration)?.configuration
      : normalizeImportedApartmentConfiguration(rawConfiguration);
    if (!configuration) return;
    configurations.push({ configuration, area: clean(row[index + 1]), price: clean(row[index + 2]) });
  });
  if (!configurations.length) {
    const fromSingle = list(valueAt(row, getHeaders([rawHeaders]), ["configurations", "bhkconfigurations", "bhk"]));
    fromSingle.forEach((item) => {
      const configuration = propertyType === "Villa" ? parseVillaConfigurationLabel(item)?.configuration : normalizeImportedApartmentConfiguration(item);
      if (configuration) configurations.push({ configuration, area: "", price: "" });
    });
  }
  if (propertyType !== "Apartment" && propertyType !== "Villa") return configurations;
  return configurations;
}

function applyTypeDetails(suggestion: QuickFillSuggestion, row: string[], headers: string[], rawHeaders: string[]) {
  const type = suggestion.patch.propertyType as SupportedPropertyType | undefined;
  const read = (names: string[]) => valueAt(row, headers, names);
  if (type === "Apartment") {
    const configs = configurationsFromWideRow(row, rawHeaders, type);
    if (configs.length) {
      const details: ConfigurationDetail[] = configs.map((item) => ({ ...createConfigurationDetail(item.configuration), price: item.price, builtUpArea: item.area }));
      suggestion.patch.configurationDetails = details;
      suggestion.patch.configs = details.map((item) => item.configuration);
      addField(suggestion.fields, "Configurations", details.map((item) => `${item.configuration} · ${item.builtUpArea || "area missing"} · ${item.price || "price missing"}`).join(" | "));
    }
  }
  if (type === "Villa") {
    const configs = configurationsFromWideRow(row, rawHeaders, type);
    const details: VillaConfigurationDetail[] = configs.map((item) => ({ ...createVillaConfigurationDetail(item.configuration), price: item.price, builtUpArea: item.area, carpetArea: read(["carpetarea"]), plotArea: read(["plotarea"]), superArea: read(["superarea", "area"]), bedrooms: number(read(["bedrooms"])) ?? createVillaConfigurationDetail(item.configuration).bedrooms, bathrooms: number(read(["bathrooms"])) ?? createVillaConfigurationDetail(item.configuration).bathrooms, balconies: number(read(["balconies"])) }));
    suggestion.patch.villaDetails = { ...initialVillaDetails(), villaType: normalizeVillaType(read(["villatype"])) || "Independent", configurationDetails: details, plotDimensions: read(["plotdimensions", "dimensions"]), numberOfFloors: normalizeVillaFloorCount(read(["numberoffloors", "totalfloors"])) || "", roadWidthFacing: read(["roadwidth"]), privateGarden: /yes|true/i.test(read(["privategarden"])), privatePool: /yes|true/i.test(read(["privatepool"])), terrace: /yes|true/i.test(read(["terrace"])), gatedCommunity: /yes|true/i.test(read(["gatedcommunity"])) };
    suggestion.patch.configs = details.map((item) => item.configuration);
    if (details.length) addField(suggestion.fields, "Villa configurations", details.map((item) => item.configuration).join(", "));
  }
  if (type === "Plot") {
    const dimensions = read(["plotsize", "plotdimensions", "dimensions"]);
    const normalized = normalizePlotSize(dimensions);
    const details: PlotDetails = { ...initialPlotDetails(), approvalAuthority: read(["approvalauthority", "approval"]) || "BMRDA", approvalNumber: read(["approvalnumber"]), roadWidth: read(["roadwidth"]), totalPlots: number(read(["totalplots"])) || 0 };
    if (normalized) {
      const size = createPlotSizeDetail(normalized.plotSize);
      size.pricePerSqft = number(read(["pricepersqft", "psf"])) || 0;
      details.plotSizeDetails = [size];
      suggestion.patch.configs = [size.plotSize];
    }
    suggestion.patch.plotDetails = details;
  }
  if (type === "Commercial") {
    suggestion.patch.commercialDetails = { ...initialCommercialDetails(), commercialSubtype: (read(["commercialsubtype", "subtype"]) as CommercialDetails["commercialSubtype"]) || "Office Space", carpetArea: read(["carpetarea"]), builtUpArea: read(["builtuparea"]), superArea: read(["superarea"]), floor: read(["floor"]), totalFloors: number(read(["totalfloors"])) || 0, frontage: read(["frontage"]), seatingCapacity: number(read(["seatingcapacity", "seats"])) || 0, cabins: number(read(["cabins"])) || 0, meetingRooms: number(read(["meetingrooms"])) || 0, washrooms: read(["washrooms", "bathrooms"]), parking: read(["parking"]), powerBackup: read(["powerbackup"]), sanctionedLoadKva: number(read(["sanctionedloadkva", "kva"])) || 0 };
  }
  if (type === "PG/Co-living") {
    const details: PgDetails = { ...initialPgDetails(), genderPreference: (read(["genderpreference", "gender"]) as PgDetails["genderPreference"]) || "Co-ed", mealsIncluded: (read(["mealsincluded", "meals"]) as PgDetails["mealsIncluded"]) || "No meals", foodType: (read(["foodtype"]) as PgDetails["foodType"]) || "", wifiIncluded: /yes|true|included/i.test(read(["wifi", "wifiincluded"])), laundryIncluded: /yes|true|included/i.test(read(["laundry", "laundryincluded"])), availableFrom: read(["availablefrom"]), commonAmenities: list(read(["commonamenities", "amenities"])) };
    suggestion.patch.pgDetails = details;
  }
}

function recordsFromSheet(sheet: XLSX.WorkSheet): Array<Record<string, string>> {
  const rows = rowsFromSheet(sheet);
  const headers = rows[0]?.map(key) || [];
  return rows.slice(1).filter((row) => row.some(Boolean)).map((row) => Object.fromEntries(headers.map((header, index) => [header, clean(row[index])])));
}

function recordValue(record: Record<string, string>, names: string[]) {
  return names.map((name) => record[key(name)] || "").find(Boolean) || "";
}

function applySupplementarySheets(workbook: XLSX.WorkBook, suggestion: QuickFillSuggestion) {
  const title = clean(suggestion.patch.title).toLowerCase();
  const sheet = (name: string) => workbook.SheetNames.find((candidate) => key(candidate) === key(name));
  const matching = (name: string) => {
    const target = sheet(name);
    if (!target) return [];
    const records = recordsFromSheet(workbook.Sheets[target]);
    return records.filter((record) => {
      const project = recordValue(record, ["project", "projectname", "property", "propertyname"]).toLowerCase();
      return !project || !title || project === title;
    });
  };
  const type = suggestion.patch.propertyType as SupportedPropertyType | undefined;
  const configurations = matching("Configurations");
  if (configurations.length && (type === "Apartment" || type === "Villa")) {
    const rows = configurations.map((record) => {
      const rawConfiguration = recordValue(record, ["configurationname", "configuration", "bhk"]);
      const parsedVilla = type === "Villa" ? parseVillaConfigurationLabel(rawConfiguration) : null;
      const configuration = type === "Villa" ? parsedVilla?.configuration : normalizeImportedApartmentConfiguration(rawConfiguration);
      const unitVariantRaw = recordValue(record, ["unitvariant", "variant"]);
      const unitVariant = villaUnitVariantOptions.find((option) => option.toLowerCase() === unitVariantRaw.toLowerCase()) || parsedVilla?.unitVariant;
      return configuration ? { configuration, bhk: normalizeBhkLabel(recordValue(record, ["bhk"])) || parsedVilla?.bhk, unitVariant, price: recordValue(record, ["price"]), builtUpArea: recordValue(record, ["builtuparea", "area", "sqft"]), carpetArea: recordValue(record, ["carpetarea"]), plotArea: recordValue(record, ["plotarea"]), superArea: recordValue(record, ["superarea"]), bedrooms: number(recordValue(record, ["bedrooms"])), bathrooms: number(recordValue(record, ["bathrooms"])), balconies: number(recordValue(record, ["balconies"])), numberOfFloors: recordValue(record, ["structure", "numberoffloors"]) || parsedVilla?.numberOfFloors, facing: recordValue(record, ["facing", "plotfacing"]) } : null;
    }).filter((item): item is NonNullable<typeof item> => Boolean(item));
    if (type === "Apartment" && rows.length) suggestion.patch.configurationDetails = rows.map((row) => ({ ...createConfigurationDetail(row.configuration), price: row.price, builtUpArea: row.builtUpArea, carpetArea: row.carpetArea, bathrooms: row.bathrooms || createConfigurationDetail(row.configuration).bathrooms }));
    if (type === "Villa" && rows.length) suggestion.patch.villaDetails = { ...(suggestion.patch.villaDetails || initialVillaDetails()), configurationDetails: rows.map((row) => ({ ...createVillaConfigurationDetail(row.configuration), bhk: row.bhk, unitVariant: row.unitVariant, price: row.price, builtUpArea: row.builtUpArea, carpetArea: row.carpetArea, plotArea: row.plotArea, superArea: row.superArea, bedrooms: row.bedrooms ?? createVillaConfigurationDetail(row.configuration).bedrooms, bathrooms: row.bathrooms ?? createVillaConfigurationDetail(row.configuration).bathrooms, balconies: row.balconies, numberOfFloors: normalizeVillaFloorCount(row.numberOfFloors) || row.numberOfFloors, plotFacing: importedPlotFacing(row.facing, suggestion.warnings, `${row.configuration} plot facing`) })) };
    suggestion.patch.configs = rows.map((row) => row.configuration);
    addField(suggestion.fields, "Configuration sheet", `${rows.length} configuration row${rows.length === 1 ? "" : "s"}`);
  }
  const amenities = matching("Amenities").flatMap((record) => list(recordValue(record, ["amenity", "amenities", "name"])));
  if (amenities.length) {
    suggestion.patch.amenities = [...new Set([...(suggestion.patch.amenities || []), ...amenities])];
    suggestion.patch.facilities = matching("Amenities").map((record) => ({ name: recordValue(record, ["amenity", "amenities", "name"]), description: recordValue(record, ["description"]), status: (recordValue(record, ["status"]) as "Available" | "Planned" | "Under Construction") || "Available", category: "Amenities" })).filter((facility) => facility.name);
    addField(suggestion.fields, "Amenities sheet", amenities.join(", "));
  }
  const societyRows = matching("Society");
  if (societyRows[0]) {
    const record = societyRows[0];
    suggestion.patch.society = {
      security: recordValue(record, ["security"]), waterSupply: recordValue(record, ["watersupply"]), powerBackup: recordValue(record, ["powerbackup"]), lift: recordValue(record, ["lift"]), visitorParking: recordValue(record, ["visitorparking"]), maintenanceStaff: recordValue(record, ["maintenancestaff"]),
    };
    addField(suggestion.fields, "Society sheet", "Society services");
  }
  const typeDetailSheet = type === "PG/Co-living" ? "PG Details" : `${type} Details`;
  const typeDetail = matching(typeDetailSheet)[0];
  if (typeDetail && type === "Villa") suggestion.patch.villaDetails = { ...(suggestion.patch.villaDetails || initialVillaDetails()), villaType: normalizeVillaType(recordValue(typeDetail, ["villatype"])) || "Independent", plotDimensions: recordValue(typeDetail, ["plotdimensions"]), numberOfFloors: normalizeVillaFloorCount(recordValue(typeDetail, ["numberoffloors"])) || "", plotFacing: importedPlotFacing(recordValue(typeDetail, ["plotfacing"]), suggestion.warnings, "Project plot facing"), cornerPlot: /yes|true/i.test(recordValue(typeDetail, ["cornerplot"])), roadWidthFacing: recordValue(typeDetail, ["roadwidth"]), privateGarden: /yes|true/i.test(recordValue(typeDetail, ["privategarden"])), privateGardenArea: recordValue(typeDetail, ["gardenarea"]), privatePool: /yes|true/i.test(recordValue(typeDetail, ["privatepool"])), terrace: /yes|true/i.test(recordValue(typeDetail, ["terrace"])), gatedCommunity: /yes|true/i.test(recordValue(typeDetail, ["gatedcommunity"])) };
  if (typeDetail && type === "Plot") suggestion.patch.plotDetails = { ...(suggestion.patch.plotDetails || initialPlotDetails()), totalPlots: number(recordValue(typeDetail, ["totalplots"])) || 0, approvalAuthority: recordValue(typeDetail, ["approvalauthority"]) || "BMRDA", approvalNumber: recordValue(typeDetail, ["approvalnumber"]), roadWidth: recordValue(typeDetail, ["roadwidth"]), civicInfrastructure: { undergroundDrainage: (recordValue(typeDetail, ["undergrounddrainage"]) as any) || "Ready", electricity: (recordValue(typeDetail, ["electricity"]) as any) || "Ready", water: (recordValue(typeDetail, ["water"]) as any) || "Ready" }, layoutPossession: /under/i.test(recordValue(typeDetail, ["layoutpossessionstatus"])) ? { status: "Under Development", expectedCompletionDate: recordValue(typeDetail, ["layoutdate"]) } : { status: "Layout Ready", readyDate: recordValue(typeDetail, ["layoutdate"]) } };
  if (typeDetail && type === "Commercial") suggestion.patch.commercialDetails = { ...(suggestion.patch.commercialDetails || initialCommercialDetails()), commercialSubtype: (recordValue(typeDetail, ["commercialsubtype"]) as any) || "Office Space", zoneType: (recordValue(typeDetail, ["zonetype"]) as any) || "Non-SEZ", carpetArea: recordValue(typeDetail, ["carpetarea"]), builtUpArea: recordValue(typeDetail, ["builtuparea"]), superArea: recordValue(typeDetail, ["superarea"]), floor: recordValue(typeDetail, ["floor"]), totalFloors: number(recordValue(typeDetail, ["totalfloors"])) || 0, frontage: recordValue(typeDetail, ["frontage"]), seatingCapacity: number(recordValue(typeDetail, ["seatingcapacity"])) || 0, cabins: number(recordValue(typeDetail, ["cabins"])) || 0, meetingRooms: number(recordValue(typeDetail, ["meetingrooms"])) || 0, buildingGrade: (recordValue(typeDetail, ["buildinggrade"]) as any) || "Not Applicable", pantry: (recordValue(typeDetail, ["pantry"]) as any) || "None", washrooms: recordValue(typeDetail, ["washrooms"]), parking: recordValue(typeDetail, ["parking"]), powerBackup: recordValue(typeDetail, ["powerbackup"]), sanctionedLoadKva: number(recordValue(typeDetail, ["sanctionedloadkva"])) || 0, fireSafetyCompliance: recordValue(typeDetail, ["firesafety"]), furnishing: (recordValue(typeDetail, ["furnishing"]) as any) || "Bare Shell" };
  if (typeDetail && type === "PG/Co-living") suggestion.patch.pgDetails = { ...(suggestion.patch.pgDetails || initialPgDetails()), genderPreference: (recordValue(typeDetail, ["genderpreference"]) as any) || "Co-ed", availableFrom: recordValue(typeDetail, ["availablefrom"]), mealsIncluded: (recordValue(typeDetail, ["mealsincluded"]) as any) || "No meals", foodType: (recordValue(typeDetail, ["foodtype"]) as any) || "", wifiIncluded: /yes|true|included/i.test(recordValue(typeDetail, ["wifiincluded"])), laundryIncluded: /yes|true|included/i.test(recordValue(typeDetail, ["laundryincluded"])), housekeeping: recordValue(typeDetail, ["housekeeping"]), curfewEntryTiming: recordValue(typeDetail, ["curfewentrytiming"]), visitorsAllowed: recordValue(typeDetail, ["visitorsallowed"]), noticePeriod: recordValue(typeDetail, ["noticeperiod"]), lockInPeriod: recordValue(typeDetail, ["lockinperiod"]), contactType: (recordValue(typeDetail, ["contacttype"]) as any) || "PG Manager", commonAmenities: list(recordValue(typeDetail, ["commonamenities"])) };
  if (typeDetail) addField(suggestion.fields, `${type} details sheet`, "Type-specific details");
  if (type === "Plot") {
    const sizeRecords = matching("Plot Sizes");
    const inventoryRecords = matching("Plot Inventory");
    const current = suggestion.patch.plotDetails || initialPlotDetails();
    const plotSizeDetails = sizeRecords.map((record) => {
      const normalized = normalizePlotSize(recordValue(record, ["plotdimensions", "plotsize"]));
      if (!normalized) return null;
      const row = createPlotSizeDetail(normalized.plotSize);
      row.pricePerSqft = number(recordValue(record, ["pricepersqft", "psf"])) || 0;
      row.facings = parseImportedFacings(recordValue(record, ["facings", "facing"]), suggestion.warnings, normalized.plotSize);
      return row;
    }).filter((row): row is NonNullable<PlotDetails["plotSizeDetails"]>[number] => row !== null);
    const inventory = inventoryRecords.map((record) => ({
      plotNumber: recordValue(record, ["plotnumber", "number"]),
      plotSize: normalizePlotSize(recordValue(record, ["plotdimensions", "plotsize"]))?.plotSize || recordValue(record, ["plotdimensions", "plotsize"]),
      facing: importedPlotFacing(recordValue(record, ["facing"]), suggestion.warnings, `Plot ${recordValue(record, ["plotnumber"]) || "inventory"} facing`),
      status: (recordValue(record, ["status"]) || "Available") as "Available" | "Booked" | "Sold",
      isCorner: yes(recordValue(record, ["cornerplot", "iscorner"])),
    })).filter((row) => row.plotNumber || row.plotSize);
    if (plotSizeDetails.length || inventory.length) {
      suggestion.patch.plotDetails = { ...current, ...(plotSizeDetails.length ? { plotSizeDetails } : {}), ...(inventory.length ? { inventory } : {}) };
      if (plotSizeDetails.length) suggestion.patch.configs = plotSizeDetails.map((row) => row.plotSize);
      addField(suggestion.fields, "Plot workbook rows", `${plotSizeDetails.length} size${plotSizeDetails.length === 1 ? "" : "s"}, ${inventory.length} inventory row${inventory.length === 1 ? "" : "s"}`);
    }
  }
  if (type === "PG/Co-living") {
    const sharingRecords = matching("PG Sharing Options").length ? matching("PG Sharing Options") : matching("PG Details");
    const sharingDetails = sharingRecords.map((record) => ({
      sharingType: recordValue(record, ["sharingtype"]) as PgDetails["sharingDetails"][number]["sharingType"],
      rentPerBed: number(recordValue(record, ["rentperbed", "rent"])) || 0,
      deposit: number(recordValue(record, ["deposit"])) || 0,
      bedsAvailable: number(recordValue(record, ["bedsavailable", "beds"])) || 0,
    })).filter((row) => row.sharingType);
    if (sharingDetails.length) {
      suggestion.patch.pgDetails = { ...(suggestion.patch.pgDetails || initialPgDetails()), sharingDetails };
      suggestion.patch.configs = sharingDetails.map((row) => row.sharingType);
      addField(suggestion.fields, "PG sharing sheet", `${sharingDetails.length} sharing option${sharingDetails.length === 1 ? "" : "s"}`);
    }
  }
  const phaseRecords = matching("RERA Phases");
  if (phaseRecords.length) {
    const phases = phaseRecords.map((record) => ({ name: recordValue(record, ["phasename", "name"]), reraNumber: recordValue(record, ["reranumber", "registrationnumber"]), reraSiteUrl: recordValue(record, ["reraurl", "rerasiteurl"]) || KARNATAKA_RERA_URL, reraDocuments: [], projectDocuments: [] })).filter((phase) => phase.name && phase.reraNumber);
    if (phases.length) { suggestion.patch.reraRegistered = true; suggestion.patch.reraNumber = phases[0].reraNumber; suggestion.patch.reraPhases = phases; addField(suggestion.fields, "RERA phases sheet", `${phases.length} phase${phases.length === 1 ? "" : "s"}`); }
  }
  const narrativeRecord = matching("Project Narrative")[0];
  const keyDetailRecords = matching("Project Key Details");
  const featureGroupRecords = matching("Project Feature Groups");
  if (narrativeRecord || keyDetailRecords.length || featureGroupRecords.length) {
    const existing = suggestion.patch.projectNarrative || {};
    const introduction = narrativeRecord ? multiLineList(recordValue(narrativeRecord, ["introductionparagraphs", "introduction"])) : existing.introduction;
    const usps = narrativeRecord ? multiLineList(recordValue(narrativeRecord, ["usps", "usp"])) : existing.usps;
    const locationAdvantage = narrativeRecord ? multiLineList(recordValue(narrativeRecord, ["locationadvantages", "locationadvantage"])) : existing.locationAdvantage;
    const investmentReasons = narrativeRecord ? multiLineList(recordValue(narrativeRecord, ["investmentreasons", "whyinvest"])) : existing.investmentReasons;
    const keyDetails = keyDetailRecords.map((record) => ({ label: recordValue(record, ["label", "category"]), value: recordValue(record, ["value", "details"]) })).filter((row) => row.label && row.value);
    const featureGroups = featureGroupRecords.map((record) => ({ title: recordValue(record, ["grouptitle", "title"]), items: multiLineList(recordValue(record, ["items", "features"])) })).filter((group) => group.title && group.items.length);
    suggestion.patch.projectNarrative = { ...existing, introduction, usps, locationAdvantage, investmentReasons, ...(keyDetails.length ? { keyDetails } : {}), ...(featureGroups.length ? { featureGroups } : {}) };
    const entryCount = (introduction?.length || 0) + (usps?.length || 0) + (locationAdvantage?.length || 0) + (investmentReasons?.length || 0) + keyDetails.length + featureGroups.reduce((total, group) => total + group.items.length, 0);
    addField(suggestion.fields, "Project content sheets", `${entryCount} narrative entr${entryCount === 1 ? "y" : "ies"}`);
  }
  const masterPlanRecords = matching("Master Plan Content");
  if (masterPlanRecords.length) {
    const existing = suggestion.patch.masterPlan || {};
    const title = masterPlanRecords.map((record) => recordValue(record, ["title"])).find(Boolean) || existing.title || "";
    const summary = masterPlanRecords.map((record) => recordValue(record, ["summary"])).find(Boolean) || existing.summary || "";
    const masterPlanSections = masterPlanRecords.map((record) => ({ heading: recordValue(record, ["sectionheading", "heading"]), body: recordValue(record, ["sectionbody", "body"]) })).filter((row) => row.heading && row.body);
    suggestion.patch.masterPlan = { ...existing, title, summary, ...(masterPlanSections.length ? { sections: masterPlanSections } : {}) };
    addField(suggestion.fields, "Master Plan Content sheet", `${masterPlanSections.length} detail section${masterPlanSections.length === 1 ? "" : "s"}`);
  }
  const faqRecords = matching("FAQs");
  if (faqRecords.length) {
    const faqs = faqRecords.map((record) => ({ question: recordValue(record, ["question"]), answer: recordValue(record, ["answer"]) })).filter((faq) => faq.question && faq.answer);
    if (faqs.length) { suggestion.patch.faqs = faqs; addField(suggestion.fields, "FAQs sheet", `${faqs.length} FAQ${faqs.length === 1 ? "" : "s"}`); }
  }
  const nearby = matching("Nearby Places");
  if (nearby.length) {
    const categories = ["schools", "colleges", "hospitals", "shopping", "metro", "workplaces", "parks", "roads"] as const;
    const nearbyDetails: NonNullable<Property["nearbyDetails"]> = {};
    nearby.forEach((record) => {
      const rawCategory = key(recordValue(record, ["category", "type"]));
      const category = categories.find((item) => rawCategory.includes(item.slice(0, -1)) || rawCategory === item);
      const name = recordValue(record, ["name", "place", "placename"]);
      if (!category || !name) return;
      const current = nearbyDetails[category]?.places || [];
      nearbyDetails[category] = { places: [...current, { name, address: recordValue(record, ["address"]), distance: recordValue(record, ["distance"]), landmark: recordValue(record, ["landmark"]) }] };
    });
    if (Object.keys(nearbyDetails).length) {
      suggestion.patch.nearbyDetails = nearbyDetails;
      addField(suggestion.fields, "Nearby places sheet", `${nearby.length} place row${nearby.length === 1 ? "" : "s"}`);
    }
  }
}

/** Parse the first filled property row from a normal spreadsheet or the legacy BHK-triplet workbook. */
export async function parsePropertyExcel(file: File, preferredType?: SupportedPropertyType): Promise<QuickFillSuggestion> {
  if (!/\.xlsx$/i.test(file.name)) throw new Error("Upload an .xlsx Excel file.");
  if (file.size > MAX_FILE_BYTES) throw new Error("Excel file must be 5 MB or smaller.");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellFormula: false, cellHTML: false, bookVBA: false });
  const first = workbook.SheetNames[0];
  if (!first) throw new Error("The workbook has no worksheets.");
  const rows = rowsFromSheet(workbook.Sheets[first]);
  if (rows.length < 2) throw new Error("Add a header row and at least one property row to the workbook.");
  if (rows.length - 1 > MAX_ROWS) throw new Error(`This import supports up to ${MAX_ROWS} property rows at a time. Split a larger file into smaller uploads.`);
  const rawHeaders = rows[0];
  const headers = getHeaders(rows);
  const data = rows.slice(1).find((row) => row.some((cell) => clean(cell)));
  if (!data) throw new Error("No property details were found in the workbook.");
  const read = (names: string[]) => valueAt(data, headers, names);
  const suggestion = buildCommonPatch(read, preferredType);
  applyTypeDetails(suggestion, data, headers, rawHeaders);
  applySupplementarySheets(workbook, suggestion);
  suggestion.warnings.push("Only permanent Cloudinary HTTPS image/PDF URLs are imported. Videos and untrusted external media are skipped.");
  return suggestion;
}

/** Download a multi-sheet template that keeps repeated configurations, amenities and nearby places readable. */
export function downloadPropertyExcelTemplate(propertyType: SupportedPropertyType = "Apartment") {
  const workbook = XLSX.utils.book_new();
  const properties = XLSX.utils.aoa_to_sheet([
    ["Project Name", "Property Type", "Builder", "Developer Description", "Location", "City", "Zone", "Address", "Landmark", "Pincode", "Price", "Price Per Sqft", "Area", "Total Project Area", "Open Space Area", "Apartment Built Up Area", "Amenities Area", "Total Units", "Total Towers", "Possession Year", "Transaction Type", "Listing Type", "RERA Registered", "RERA Number", "RERA Phase Name", "Furnishing", "Parking", "Facing", "Floor", "Total Floors", "Description", "Project Narrative JSON", "Master Plan JSON", "FAQs JSON", "Hero Images", "Gallery Images", "Developer Logo URL", "Project Downloads JSON", "RERA Phases JSON", "Source References JSON"],
    ["Example Project", propertyType, "Example Builder", "Verified developer history and expertise", "Whitefield", "Bangalore", "East", "", "", "", "₹ 1.25 Cr", "₹ 8,500/sqft", "1200 sqft", "", "", "", "", "", "", "Dec 2030", "New Property", propertyType === "PG/Co-living" ? "For Rent" : "For Sale", "Yes", "", "Phase 1", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ]);
  const configurations = XLSX.utils.aoa_to_sheet([["Project Name", "Configuration Name", "BHK", "Unit Variant", "Structure", "Price", "Plot Area", "Built Up Area", "Carpet Area", "Super Area", "Bedrooms", "Bathrooms", "Balconies", "Facing"], propertyType === "Villa" ? ["Example Project", "4 BHK Duplex (G+1)", "4 BHK", "Duplex", "G+1", "₹ 5.25 Cr", "", "3009 sqft", "2443 sqft", "3009 sqft", "4", "4", "2", "East"] : ["Example Project", "2 BHK", "2 BHK", "", "", "₹ 1.25 Cr", "", "1200 sqft", "900 sqft", "", "2", "2", "1", "East"]]);
  const society = XLSX.utils.aoa_to_sheet([["Project Name", "Security", "Water Supply", "Power Backup", "Lift", "Visitor Parking", "Maintenance Staff"], ["Example Project", "24x7 security", "24x7 water", "DG backup", "2 lifts", "Available", "Available"]]);
  const amenities = XLSX.utils.aoa_to_sheet([["Project Name", "Amenity", "Description", "Status"], ["Example Project", "Swimming Pool", "Temperature controlled pool", "Available"]]);
  const nearby = XLSX.utils.aoa_to_sheet([["Project Name", "Category", "Name", "Distance", "Address", "Landmark"], ["Example Project", "Schools", "Example School", "1 km", "", ""]]);
  const villa = XLSX.utils.aoa_to_sheet([["Project Name", "Villa Type", "Plot Dimensions", "Number Of Floors", "Plot Facing", "Corner Plot", "Road Width", "Private Garden", "Garden Area", "Private Pool", "Terrace", "Gated Community"], ["Example Project", "Independent", "30 x 40", "G+2", "East", "No", "30 ft", "Yes", "200 sqft", "No", "Yes", "Yes"]]);
  const plots = XLSX.utils.aoa_to_sheet([["Project Name", "Plot Dimensions", "Price Per Sqft", "Total Plots", "Approval Authority", "Approval Number", "Road Width", "Underground Drainage", "Electricity", "Water", "Layout Possession Status", "Layout Date"], ["Example Project", "30 x 40", "8500", "50", "BMRDA", "", "30 ft", "Ready", "Ready", "Ready", "Under Development", "2030-12"]]);
  const plotSizes = XLSX.utils.aoa_to_sheet([["Project Name", "Plot Dimensions", "Price Per Sqft", "Facings"], ["Example Project", "30 x 40", "8500", "East, North"]]);
  const plotInventory = XLSX.utils.aoa_to_sheet([["Project Name", "Plot Number", "Plot Dimensions", "Facing", "Status", "Corner Plot"], ["Example Project", "A-01", "30 x 40", "East", "Available", "No"]]);
  const commercial = XLSX.utils.aoa_to_sheet([["Project Name", "Commercial Subtype", "Zone Type", "Carpet Area", "Built Up Area", "Super Area", "Floor", "Total Floors", "Frontage", "Seating Capacity", "Cabins", "Meeting Rooms", "Building Grade", "Pantry", "Washrooms", "Parking", "Power Backup", "Sanctioned Load Kva", "Fire Safety", "Furnishing"], ["Example Project", "Office Space", "Non-SEZ", "1000 sqft", "1200 sqft", "", "2", "10", "", "50", "3", "1", "Grade A", "Private Pantry", "2", "2 Covered", "DG backup", "20", "Compliant", "Fully Furnished"]]);
  const pg = XLSX.utils.aoa_to_sheet([["Project Name", "Gender Preference", "Available From", "Sharing Type", "Rent Per Bed", "Deposit", "Beds Available", "Meals Included", "Food Type", "Wifi Included", "Laundry Included", "Housekeeping", "Curfew Entry Timing", "Visitors Allowed", "Notice Period", "Lock In Period", "Contact Type", "Common Amenities"], ["Example Project", "Co-ed", "2030-01-01", "Double sharing", "12000", "24000", "4", "Breakfast + Dinner", "Veg only", "Yes", "Yes", "Daily", "10 PM", "Yes", "30 days", "3 months", "PG Manager", "Wi-Fi, Washing machine"]]);
  const pgSharing = XLSX.utils.aoa_to_sheet([["Project Name", "Sharing Type", "Rent Per Bed", "Deposit", "Beds Available"], ["Example Project", "Double sharing", "12000", "24000", "4"]]);
  const reraPhases = XLSX.utils.aoa_to_sheet([["Project Name", "Phase Name", "RERA Number", "RERA URL"], ["Example Project", "Phase 1", "PRM/KA/RERA/EXAMPLE01", KARNATAKA_RERA_URL], ["Example Project", "Phase 2", "PRM/KA/RERA/EXAMPLE02", KARNATAKA_RERA_URL]]);
  const projectNarrative = XLSX.utils.aoa_to_sheet([["Project Name", "Introduction Paragraphs", "USPs", "Location Advantages", "Investment Reasons"], ["Example Project", "Verified introduction 1 | Verified introduction 2", "USP 1 | USP 2", "Location advantage 1", "Investment reason 1"]]);
  const projectKeyDetails = XLSX.utils.aoa_to_sheet([["Project Name", "Label", "Value"], ["Example Project", "Architecture", "Contemporary design"]]);
  const projectFeatureGroups = XLSX.utils.aoa_to_sheet([["Project Name", "Group Title", "Items"], ["Example Project", "Outdoor and Green Spaces", "Feature 1 | Feature 2"]]);
  const masterPlanContent = XLSX.utils.aoa_to_sheet([["Project Name", "Title", "Summary", "Section Heading", "Section Body"], ["Example Project", "Project Master Plan", "Verified master-plan summary", "Central Zone", "Verified section details"]]);
  const faqs = XLSX.utils.aoa_to_sheet([["Project Name", "Question", "Answer"], ["Example Project", "What configurations are available?", "See the verified configuration rows."]]);
  XLSX.utils.book_append_sheet(workbook, properties, "Properties");
  if (["Apartment", "Villa"].includes(propertyType)) XLSX.utils.book_append_sheet(workbook, configurations, "Configurations");
  if (propertyType !== "PG/Co-living") XLSX.utils.book_append_sheet(workbook, society, "Society");
  XLSX.utils.book_append_sheet(workbook, amenities, "Amenities");
  XLSX.utils.book_append_sheet(workbook, nearby, "Nearby Places");
  if (propertyType === "Villa") XLSX.utils.book_append_sheet(workbook, villa, "Villa Details");
  if (propertyType === "Plot") { XLSX.utils.book_append_sheet(workbook, plots, "Plot Details"); XLSX.utils.book_append_sheet(workbook, plotSizes, "Plot Sizes"); XLSX.utils.book_append_sheet(workbook, plotInventory, "Plot Inventory"); }
  if (propertyType === "Commercial") XLSX.utils.book_append_sheet(workbook, commercial, "Commercial Details");
  if (propertyType === "PG/Co-living") { XLSX.utils.book_append_sheet(workbook, pg, "PG Details"); XLSX.utils.book_append_sheet(workbook, pgSharing, "PG Sharing Options"); }
  XLSX.utils.book_append_sheet(workbook, reraPhases, "RERA Phases");
  XLSX.utils.book_append_sheet(workbook, projectNarrative, "Project Narrative");
  XLSX.utils.book_append_sheet(workbook, projectKeyDetails, "Project Key Details");
  XLSX.utils.book_append_sheet(workbook, projectFeatureGroups, "Project Feature Groups");
  XLSX.utils.book_append_sheet(workbook, masterPlanContent, "Master Plan Content");
  XLSX.utils.book_append_sheet(workbook, faqs, "FAQs");
  XLSX.writeFile(workbook, `${propertyType.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-property-import-template.xlsx`, { bookType: "xlsx", compression: true });
}

export const PROPERTY_IMPORT_DESCRIPTION_FORMAT = `PROPERTY IMPORT FORMAT

[PROPERTY BASICS]
Property Type: Apartment | Villa | Plot | Commercial | PG/Co-living
Project / Property Name:
Builder / Developer:
Transaction Type: New Property
Listing Type: For Sale
Title / Subtitle:
Description:
Price:
Price Per Sqft:
Total Area:
Possession Status: Ready to Move | Under Construction
Expected Completion / Ready Date:
RERA Registered: Yes | No
RERA Number:

[DEVELOPER DETAILS]
Developer Name:
About Developer:

[PROJECT AREA AND INVENTORY]
Total Project Area:
Open Space Area:
Apartment Built-up Area:
Amenities Area:
Total Units:
Total Towers:

[RERA PHASES]
Phase 1 Name:
Phase 1 RERA Number:
Phase 1 RERA URL:
Phase 2 Name:
Phase 2 RERA Number:
Phase 2 RERA URL:

[PROJECT NARRATIVE]
Introduction Paragraph 1:
Introduction Paragraph 2:
USP 1:
USP 2:
Location Advantage 1:
Investment Reason 1:

[PROJECT KEY DETAILS]
Detail 1 Label:
Detail 1 Value:

[PROJECT FEATURE GROUPS]
Group 1 Title:
Group 1 Item 1:
Group 1 Item 2:

[MASTER PLAN CONTENT]
Title:
Summary:
Section 1 Heading:
Section 1 Body:

[FAQS]
FAQ 1 Question:
FAQ 1 Answer:

[LOCATION]
Address:
Landmark:
Locality:
Zone:
City:
Pincode:

[CONFIGURATIONS]
Configuration 1:
Configuration Name:
BHK:
Unit Variant: Simplex | Duplex | Triplex | Villament | Penthouse | Row House | Independent Villa | Twin Villa | Sky Villa | Custom
Structure:
Price:
Plot Area:
Built-up Area:
Carpet Area:
Super Area:
Bedrooms:
Bathrooms:
Balconies:
Facing:

[SOCIETY]
Security:
Water Supply:
Power Backup:
Lift:
Visitor Parking:
Maintenance Staff:

[AMENITIES]
Amenity 1 Name:
Amenity 1 Description:
Amenity 1 Status: Available | Planned | Under Construction
Amenity 2 Name:
Amenity 2 Description:
Amenity 2 Status: Available | Planned | Under Construction

[NEARBY PLACES]
School 1 Name:
School 1 Distance:
School 1 Address:
School 1 Landmark:
Hospital 1 Name:
Hospital 1 Distance:
Hospital 1 Address:
Hospital 1 Landmark:
College 1 Name:
College 1 Distance:
College 1 Address:
College 1 Landmark:
Shopping / Mall 1 Name:
Shopping / Mall 1 Distance:
Shopping / Mall 1 Address:
Shopping / Mall 1 Landmark:
Metro 1 Name:
Metro 1 Distance:
Metro 1 Address:
Metro 1 Landmark:
Workplace 1 Name:
Workplace 1 Distance:
Workplace 1 Address:
Workplace 1 Landmark:
Park 1 Name:
Park 1 Distance:
Park 1 Address:
Park 1 Landmark:
Road 1 Name:
Road 1 Distance:
Road 1 Address:
Road 1 Landmark:

[VILLA DETAILS — only for Villa]
Villa Type: Independent | Row Villa | Twin Villa | Villament | Penthouse | Duplex Villa | Triplex Villa | Mixed Villa Development
Plot Area:
Plot Dimensions:
Number of Floors:
Plot Facing:
Corner Plot: Yes | No
Road Width:
Private Garden: Yes | No
Garden Area:
Private Pool: Yes | No
Terrace: Yes | No
Gated Community: Yes | No

[PLOT DETAILS — only for Plot]
Plot Dimensions:
Plot Area:
Price Per Sqft:
Total Plots:
Approval Authority:
Approval Number:
Road Width:
Underground Drainage:
Electricity:
Water:
Layout Possession Status:
Layout Ready / Expected Date:

[COMMERCIAL DETAILS — only for Commercial]
Commercial Subtype:
Zone Type:
Carpet Area:
Built-up Area:
Super Area:
Floor:
Total Floors:
Frontage:
Seating Capacity:
Cabins:
Meeting Rooms:
Building Grade:
Pantry:
Washrooms:
Parking:
Power Backup:
Sanctioned Load:
Fire Safety:
Furnishing:

[PG / CO-LIVING DETAILS — only for PG/Co-living]
Gender Preference:
Available From:
Sharing Type:
Rent Per Bed:
Deposit:
Beds Available:
Meals Included:
Food Type:
Wi-Fi Included: Yes | No
Laundry Included: Yes | No
Housekeeping:
Curfew Timing:
Visitors Allowed:
Notice Period:
Lock-in Period:
Contact Type:
PG Amenities:`;

export function downloadPropertyDescriptionFormat(propertyType: SupportedPropertyType = "Apartment") {
  const blob = new Blob([PROPERTY_DESCRIPTION_TEMPLATES[propertyType]], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = PROPERTY_TEMPLATE_FILE_NAMES[propertyType];
  link.click();
  URL.revokeObjectURL(url);
}

function isProvided(value: string) { return Boolean(value && !/^not\s*(provided|available)|n\/?a$/i.test(value.trim())); }
function sections(text: string, name: string) {
  return [...text.matchAll(new RegExp(`\\[${name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}[^\\]]*\\]([\\s\\S]*?)(?=\\n\\s*\\[[^\\]]+\\]|$)`, "gi"))].map((match) => match[1] || "");
}
function section(text: string, name: string) {
  return sections(text, name)[0] || "";
}
function labelled(text: string, label: string) {
  const match = text.match(new RegExp(`^[\\t ]*${label.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}[\\t ]*:[\\t ]*([^\\r\\n]*)[\\t ]*$`, "im"));
  const value = clean(match?.[1]);
  return isProvided(value) ? value : "";
}

function numberedValues(text: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...text.matchAll(new RegExp(`^\\s*${escaped}\\s+(\\d+)\\s*:\\s*(.+?)\\s*$`, "gim"))]
    .map((match) => ({ index: Number(match[1]), value: clean(match[2]) }))
    .filter((item) => isProvided(item.value))
    .sort((a, b) => a.index - b.index);
}

function exactSections(text: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...text.matchAll(new RegExp(`(?:^|\\r?\\n)[\\t ]*\\[${escaped}(?:\\s*(?:#\\s*)?\\d+)?\\][\\t ]*(?:\\r?\\n|$)([\\s\\S]*?)(?=\\r?\\n[\\t ]*\\[[^\\]\\r\\n]+\\][\\t ]*(?:\\r?\\n|$)|$)`, "gi"))]
    .map((match) => match[1] || "");
}

function exactSection(text: string, name: string) {
  return exactSections(text, name)[0] || "";
}

function labelledValues(text: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...text.matchAll(new RegExp(`^[\\t ]*${escaped}[\\t ]*:[\\t ]*([^\\r\\n]*)[\\t ]*$`, "gim"))]
    .map((match) => clean(match[1]))
    .filter(isProvided);
}

function yes(value: string) {
  return /^(?:yes|true)$/i.test(clean(value));
}

function parseImportedFacings(value: string, warnings: string[], label: string) {
  const rawValues = clean(value).split(/[,;|/]/).map((item) => item.trim()).filter(Boolean);
  const facings = rawValues.map((item) => normalizePlotFacing(item)).filter((item): item is PlotFacing => Boolean(item));
  if (rawValues.length && facings.length !== rawValues.length) warnings.push(`${label} contains an unsupported facing and was partially skipped.`);
  return [...new Set(facings)];
}

function nearbyCategory(value: string): keyof NonNullable<Property["nearbyDetails"]> | undefined {
  const normalized = key(value);
  if (normalized.includes("school")) return "schools";
  if (normalized.includes("college")) return "colleges";
  if (normalized.includes("hospital")) return "hospitals";
  if (normalized.includes("shopping") || normalized.includes("mall")) return "shopping";
  if (normalized.includes("metro")) return "metro";
  if (normalized.includes("workplace") || normalized.includes("office") || normalized.includes("techpark")) return "workplaces";
  if (normalized.includes("park")) return "parks";
  if (normalized.includes("road")) return "roads";
  return undefined;
}

function applyModernDescriptionBlocks(
  source: string,
  type: SupportedPropertyType | undefined,
  patch: QuickFillPatch,
  fields: QuickFillSuggestion["fields"],
  warnings: string[],
) {
  const rera = exactSection(source, "RERA");
  const reraBlocks = exactSections(source, "RERA PHASE");
  if (rera || reraBlocks.length) {
    const registeredValue = labelled(rera, "RERA Registered");
    const phases = reraBlocks.map((block, index) => ({
      name: labelled(block, "Phase Name"),
      reraNumber: labelled(block, "RERA Number"),
      reraSiteUrl: labelled(block, "RERA Website") || KARNATAKA_RERA_URL,
      officialDetails: {
        promoterName: labelled(block, "Official Promoter"),
        projectId: labelled(block, "RERA Project ID"),
        acknowledgementNumber: labelled(block, "Acknowledgement Number"),
        registrationStatus: labelled(block, "Registration Status"),
        district: labelled(block, "District"),
        approvalDate: labelled(block, "Project Approval Date"),
        registeredCompletionDate: labelled(block, "Registered Completion Date"),
        registeredAddress: labelled(block, "Registered Address"),
        promoterAddress: labelled(block, "Promoter Address"),
      },
      reraDocuments: [],
      projectDocuments: [],
      order: index,
    })).filter((phase) => {
      if (phase.name && phase.reraNumber) return true;
      if (phase.name || phase.reraNumber) warnings.push("An incomplete RERA phase was skipped; both Phase Name and RERA Number are required.");
      return false;
    });
    const uniquePhases = phases.filter((phase, index) => phases.findIndex((item) => item.reraNumber.toLowerCase() === phase.reraNumber.toLowerCase()) === index);
    patch.reraRegistered = /^(?:yes|true)$/i.test(registeredValue) || uniquePhases.length > 0;
    patch.reraPhases = patch.reraRegistered ? uniquePhases : [];
    patch.reraNumber = uniquePhases[0]?.reraNumber || undefined;
    if (uniquePhases.length) addField(fields, "RERA phases recognized", `${uniquePhases.length}`);
  }

  const introduction = exactSections(source, "PROJECT INTRODUCTION").flatMap((block) => labelledValues(block, "Paragraph"));
  const usps = exactSections(source, "PROJECT USPS").flatMap((block) => labelledValues(block, "USP"));
  const investmentReasons = exactSections(source, "WHY INVEST").flatMap((block) => labelledValues(block, "Reason"));
  const locationAdvantage = exactSections(source, "LOCATION ADVANTAGES").flatMap((block) => labelledValues(block, "Advantage"));
  const keyDetails = exactSections(source, "PROJECT KEY DETAIL").map((block) => ({ label: labelled(block, "Label"), value: labelled(block, "Value") })).filter((row) => row.label && row.value);
  const featureGroups = exactSections(source, "PROJECT FEATURE GROUP").map((block) => ({ title: labelled(block, "Group Title"), items: labelledValues(block, "Item") })).filter((group) => group.title && group.items.length);
  if (introduction.length || usps.length || investmentReasons.length || locationAdvantage.length || keyDetails.length || featureGroups.length) {
    patch.projectNarrative = { introduction, usps, investmentReasons, locationAdvantage, keyDetails, featureGroups };
    addField(fields, "Introduction paragraphs", introduction.join(" | "));
    addField(fields, "Project USPs", usps.join(" | "));
    addField(fields, "Why invest", investmentReasons.join(" | "));
    addField(fields, "Location advantages", locationAdvantage.join(" | "));
    addField(fields, "Project key details", `${keyDetails.length}`);
    addField(fields, "Project feature groups", `${featureGroups.length}`);
  }

  const masterPlanBlock = exactSection(source, "MASTER PLAN");
  const masterPlanSections = exactSections(source, "MASTER PLAN DETAIL").map((block) => ({
    heading: labelled(block, "Section Title"),
    body: labelled(block, "Section Description"),
  })).filter((section) => section.heading && section.body);
  const masterPlanTitle = labelled(masterPlanBlock, "Master Plan Section Title");
  const masterPlanSummary = labelled(masterPlanBlock, "Verified Master Plan Description");
  if (masterPlanTitle || masterPlanSummary || masterPlanSections.length) {
    patch.masterPlan = { title: masterPlanTitle, summary: masterPlanSummary, sections: masterPlanSections };
    addField(fields, "Master-plan title", masterPlanTitle);
    addField(fields, "Master-plan description", masterPlanSummary);
    addField(fields, "Master-plan detail sections", `${masterPlanSections.length}`);
  }

  const faqs = exactSections(source, "FAQ").map((block) => ({ question: labelled(block, "Question"), answer: labelled(block, "Answer") })).filter((faq) => faq.question && faq.answer);
  if (faqs.length) {
    patch.faqs = faqs;
    addField(fields, "FAQs recognized", `${faqs.length}`);
  }

  const facilities = exactSections(source, "AMENITY").map((block) => {
    const status = labelled(block, "Amenity Status");
    return {
      name: labelled(block, "Amenity Name"),
      description: labelled(block, "Amenity Description"),
      status: (["Available", "Planned", "Under Construction"].includes(status) ? status : "Available") as "Available" | "Planned" | "Under Construction",
      category: "Amenities",
    };
  }).filter((facility) => facility.name);
  if (facilities.length) {
    patch.facilities = facilities;
    patch.amenities = facilities.map((facility) => facility.name);
    addField(fields, "Amenities recognized", `${facilities.length}`);
  }

  const nearbyDetails: NonNullable<Property["nearbyDetails"]> = {};
  exactSections(source, "NEARBY PLACE").forEach((block) => {
    const category = nearbyCategory(labelled(block, "Category"));
    const name = labelled(block, "Place Name");
    if (!category || !name) return;
    const places = nearbyDetails[category]?.places || [];
    nearbyDetails[category] = { places: [...places, { name, distance: labelled(block, "Distance"), address: labelled(block, "Address"), landmark: labelled(block, "Landmark") }] };
  });
  if (Object.keys(nearbyDetails).length) {
    patch.nearbyDetails = nearbyDetails;
    const count = Object.values(nearbyDetails).reduce((total, item) => total + (item?.places?.length || 0), 0);
    addField(fields, "Nearby places recognized", `${count}`);
  }

  const configBlocks = exactSections(source, "CONFIGURATION");
  if (type === "Apartment" && configBlocks.length) {
    const rows = configBlocks.map((block, index): ConfigurationDetail | null => {
      const rawConfiguration = labelled(block, "Configuration Name") || labelled(block, "BHK Configuration") || labelled(block, "BHK");
      const configuration = normalizeImportedApartmentConfiguration(rawConfiguration);
      if (!configuration) {
        if (rawConfiguration) warnings.push(`Apartment configuration ${index + 1} was skipped because its BHK label is invalid.`);
        return null;
      }
      const row = createConfigurationDetail(configuration);
      return {
        ...row,
        price: labelled(block, "Price"),
        builtUpArea: labelled(block, "Built-up Area"),
        carpetArea: labelled(block, "Carpet Area"),
        bedrooms: number(labelled(block, "Bedrooms")) ?? row.bedrooms,
        bathrooms: number(labelled(block, "Bathrooms")),
        balconies: number(labelled(block, "Balconies")),
        facings: parseImportedFacings(labelled(block, "Facings") || labelled(block, "Facing"), warnings, configuration),
      } as ConfigurationDetail;
    }).filter((row): row is ConfigurationDetail => row !== null);
    patch.configurationDetails = rows;
    patch.configs = rows.map((row) => row.configuration);
    if (rows.length) addField(fields, "Apartment configurations", `${rows.length}`);
  }

  const modernVillaBlock = exactSection(source, "VILLA DETAILS");
  if (type === "Villa" && (modernVillaBlock || configBlocks.length)) {
    const villaBlock = modernVillaBlock;
    const rows = configBlocks.map((block, index): VillaConfigurationDetail | null => {
      const rawConfiguration = labelled(block, "Configuration Name") || labelled(block, "BHK");
      const parsed = parseVillaConfigurationLabel(rawConfiguration);
      if (!parsed) {
        if (rawConfiguration) warnings.push(`Villa configuration ${index + 1} was skipped because its label is invalid.`);
        return null;
      }
      const row = createVillaConfigurationDetail(parsed.configuration);
      const unitVariantRaw = labelled(block, "Unit Variant");
      const unitVariant = villaUnitVariantOptions.find((option) => option.toLowerCase() === unitVariantRaw.toLowerCase()) || parsed.unitVariant;
      const privateGarden = yes(labelled(block, "Private Garden"));
      const terrace = yes(labelled(block, "Terrace"));
      return {
        ...row,
        bhk: normalizeBhkLabel(labelled(block, "BHK")) || parsed.bhk,
        unitVariant,
        price: labelled(block, "Price"),
        plotArea: labelled(block, "Plot Area"),
        builtUpArea: labelled(block, "Built-up Area"),
        carpetArea: labelled(block, "Carpet Area"),
        superArea: labelled(block, "Super Area"),
        bedrooms: number(labelled(block, "Bedrooms")) ?? row.bedrooms,
        bathrooms: number(labelled(block, "Bathrooms")) ?? row.bathrooms,
        balconies: number(labelled(block, "Balconies")),
        plotDimensions: labelled(block, "Plot Dimensions"),
        numberOfFloors: normalizeVillaFloorCount(labelled(block, "Structure")) || labelled(block, "Structure") || parsed.numberOfFloors,
        plotFacing: importedPlotFacing(labelled(block, "Plot Facing") || labelled(block, "Facing"), warnings, `${parsed.configuration} plot facing`),
        cornerPlot: yes(labelled(block, "Corner Plot")),
        roadWidthFacing: labelled(block, "Road Width"),
        privateGarden,
        privateGardenArea: privateGarden ? labelled(block, "Garden Area") : "",
        privatePool: yes(labelled(block, "Private Pool")),
        terrace,
        terraceDetails: terrace ? labelled(block, "Terrace Details") : "",
        gatedCommunity: yes(labelled(block, "Gated Community")),
      } as VillaConfigurationDetail;
    }).filter((row): row is VillaConfigurationDetail => row !== null);
    const sharedGarden = yes(labelled(villaBlock, "Private Garden"));
    const sharedTerrace = yes(labelled(villaBlock, "Terrace"));
    patch.villaDetails = {
      ...initialVillaDetails(),
      villaType: normalizeVillaType(labelled(villaBlock, "Villa Type")) || "Independent",
      configurationDetails: rows,
      plotDimensions: labelled(villaBlock, "Plot Dimensions"),
      numberOfFloors: normalizeVillaFloorCount(labelled(villaBlock, "Number of Floors")) || "",
      plotFacing: importedPlotFacing(labelled(villaBlock, "Project Plot Facing") || labelled(villaBlock, "Plot Facing"), warnings, "Project plot facing"),
      cornerPlot: yes(labelled(villaBlock, "Corner Plot")),
      roadWidthFacing: labelled(villaBlock, "Road Width"),
      privateGarden: sharedGarden,
      privateGardenArea: sharedGarden ? labelled(villaBlock, "Garden Area") : "",
      privatePool: yes(labelled(villaBlock, "Private Pool")),
      terrace: sharedTerrace,
      terraceDetails: sharedTerrace ? labelled(villaBlock, "Terrace Details") : "",
      gatedCommunity: yes(labelled(villaBlock, "Gated Community")),
    };
    patch.configs = rows.map((row) => row.configuration);
    if (rows.length) addField(fields, "Villa configurations", `${rows.length}`);
  }

  const modernPlotDetailsBlock = exactSection(source, "PLOT DETAILS");
  const modernPlotSizeBlocks = exactSections(source, "PLOT SIZE");
  const modernPlotInventoryBlocks = exactSections(source, "PLOT INVENTORY ITEM");
  if (type === "Plot" && (modernPlotDetailsBlock || modernPlotSizeBlocks.length || modernPlotInventoryBlocks.length)) {
    const detailsBlock = modernPlotDetailsBlock;
    const sizeRows = modernPlotSizeBlocks.map((block, index) => {
      const normalized = normalizePlotSize(labelled(block, "Plot Dimensions") || labelled(block, "Plot Size"));
      if (!normalized) {
        if (labelled(block, "Plot Dimensions") || labelled(block, "Plot Size")) warnings.push(`Plot size ${index + 1} was skipped because it is not width × length.`);
        return null;
      }
      const row = createPlotSizeDetail(normalized.plotSize);
      row.pricePerSqft = number(labelled(block, "Price Per Sqft")) || 0;
      row.facings = parseImportedFacings(labelled(block, "Facings") || labelled(block, "Facing"), warnings, normalized.plotSize);
      return row;
    }).filter((row): row is NonNullable<PlotDetails["plotSizeDetails"]>[number] => Boolean(row));
    const inventory = modernPlotInventoryBlocks.map((block) => ({
      plotNumber: labelled(block, "Plot Number"),
      plotSize: normalizePlotSize(labelled(block, "Plot Dimensions") || labelled(block, "Plot Size"))?.plotSize || labelled(block, "Plot Dimensions") || labelled(block, "Plot Size"),
      facing: importedPlotFacing(labelled(block, "Facing"), warnings, `Plot ${labelled(block, "Plot Number") || "inventory"} facing`),
      status: (labelled(block, "Status") || "Available") as "Available" | "Booked" | "Sold",
      isCorner: yes(labelled(block, "Corner Plot")),
    })).filter((row) => row.plotNumber || row.plotSize);
    const status = labelled(detailsBlock, "Layout Possession Status");
    patch.plotDetails = {
      ...initialPlotDetails(),
      plotSizeDetails: sizeRows,
      totalPlots: number(labelled(detailsBlock, "Total Plots")) || 0,
      approvalAuthority: labelled(detailsBlock, "Approval Authority") || "BMRDA",
      approvalNumber: labelled(detailsBlock, "Approval Number"),
      roadWidth: labelled(detailsBlock, "Road Width"),
      civicInfrastructure: {
        undergroundDrainage: (labelled(detailsBlock, "Underground Drainage") || "Ready") as "Ready" | "Under Development",
        electricity: (labelled(detailsBlock, "Electricity") || "Ready") as "Ready" | "Under Development",
        water: (labelled(detailsBlock, "Water") || "Ready") as "Ready" | "Under Development",
      },
      layoutPossession: /under/i.test(status)
        ? { status: "Under Development", expectedCompletionDate: labelled(detailsBlock, "Expected Completion Month") }
        : { status: "Layout Ready", readyDate: labelled(detailsBlock, "Layout Ready Date") },
      inventory,
    };
    patch.configs = sizeRows.map((row) => row.plotSize);
    if (sizeRows.length) addField(fields, "Plot sizes", `${sizeRows.length}`);
    if (inventory.length) addField(fields, "Plot inventory rows", `${inventory.length}`);
    warnings.push("Upload the Plot master plan / layout map manually after applying the text template.");
  }

  const modernCommercialBlock = exactSection(source, "COMMERCIAL DETAILS");
  if (type === "Commercial" && modernCommercialBlock) {
    const block = modernCommercialBlock;
    const current = initialCommercialDetails();
    patch.commercialDetails = {
      ...current,
      commercialSubtype: (labelled(block, "Commercial Subtype") || current.commercialSubtype) as CommercialDetails["commercialSubtype"],
      zoneType: (labelled(block, "Zone Type") || current.zoneType) as CommercialDetails["zoneType"],
      carpetArea: labelled(block, "Carpet Area"), builtUpArea: labelled(block, "Built-up Area"), superArea: labelled(block, "Super Area"),
      floor: labelled(block, "Floor"), totalFloors: number(labelled(block, "Total Floors")) || current.totalFloors,
      frontage: labelled(block, "Frontage"), seatingCapacity: number(labelled(block, "Seating Capacity")) || 0,
      cabins: number(labelled(block, "Cabins")) || 0, meetingRooms: number(labelled(block, "Meeting Rooms")) || 0,
      buildingGrade: (labelled(block, "Building Grade") || current.buildingGrade) as CommercialDetails["buildingGrade"],
      structure: labelled(block, "Structure"), pantry: (labelled(block, "Pantry") || current.pantry) as CommercialDetails["pantry"],
      washrooms: labelled(block, "Washrooms"), parking: labelled(block, "Parking"), powerBackup: labelled(block, "Power Backup"),
      sanctionedLoadKva: number(labelled(block, "Sanctioned Load KVA")) || 0, fireSafetyCompliance: labelled(block, "Fire Safety Compliance"),
      furnishing: (labelled(block, "Furnishing") || current.furnishing) as CommercialDetails["furnishing"],
    };
    addField(fields, "Commercial details", labelled(block, "Commercial Subtype") || current.commercialSubtype);
  }

  const modernPgBlock = exactSection(source, "PG DETAILS") || exactSection(source, "PG / CO-LIVING DETAILS");
  const modernPgSharingBlocks = exactSections(source, "PG SHARING OPTION");
  if (type === "PG/Co-living" && (modernPgBlock || modernPgSharingBlocks.length)) {
    const block = modernPgBlock;
    const current = initialPgDetails();
    const sharingDetails = modernPgSharingBlocks.map((sharing) => ({
      sharingType: labelled(sharing, "Sharing Type") as PgDetails["sharingDetails"][number]["sharingType"],
      rentPerBed: number(labelled(sharing, "Rent Per Bed")) || 0,
      deposit: number(labelled(sharing, "Deposit")) || 0,
      bedsAvailable: number(labelled(sharing, "Beds Available")) || 0,
    })).filter((row) => row.sharingType);
    patch.pgDetails = {
      ...current,
      genderPreference: (labelled(block, "Gender Preference") || current.genderPreference) as PgDetails["genderPreference"],
      sharingDetails,
      mealsIncluded: (labelled(block, "Meals Included") || current.mealsIncluded) as PgDetails["mealsIncluded"],
      foodType: labelled(block, "Food Type") as PgDetails["foodType"],
      wifiIncluded: yes(labelled(block, "Wi-Fi Included")), laundryIncluded: yes(labelled(block, "Laundry Included")),
      laundrySchedule: labelled(block, "Laundry Schedule"), housekeeping: labelled(block, "Housekeeping"),
      curfewEntryTiming: labelled(block, "Curfew / Entry Timing") || labelled(block, "Curfew Timing"), visitorsAllowed: labelled(block, "Visitors Allowed"),
      noticePeriod: labelled(block, "Notice Period"), lockInPeriod: labelled(block, "Lock-in Period"), idProofRequired: labelled(block, "ID Proof Required"),
      utilitiesIncluded: labelled(block, "Utilities Included"), availableFrom: labelled(block, "Available From"),
      commonAmenities: multiLineList(labelled(block, "Common Amenities")), contactType: (labelled(block, "Contact Type") || current.contactType) as PgDetails["contactType"],
    };
    patch.configs = sharingDetails.map((row) => row.sharingType);
    if (sharingDetails.length) addField(fields, "PG sharing options", `${sharingDetails.length}`);
  }
}

function analyzeStructuredDescription(source: string, preferredType?: SupportedPropertyType): QuickFillSuggestion {
  const basics = section(source, "PROPERTY BASICS"); const location = section(source, "LOCATION"); const configurations = section(source, "CONFIGURATIONS");
  const society = section(source, "SOCIETY"); const amenityText = section(source, "AMENITIES"); const nearbyText = section(source, "NEARBY PLACES"); const inventory = section(source, "PROJECT AREA AND INVENTORY"); const reraPhases = sections(source, "RERA PHASES").join("\n"); const villaText = section(source, "VILLA DETAILS");
  const developerText = section(source, "DEVELOPER DETAILS"); const narrativeText = section(source, "PROJECT NARRATIVE"); const keyDetailsText = section(source, "PROJECT KEY DETAILS"); const featureGroupsText = section(source, "PROJECT FEATURE GROUPS"); const masterPlanText = section(source, "MASTER PLAN CONTENT"); const faqText = section(source, "FAQS");
  const get = (label: string, body = basics) => labelled(body, label);
  const fields: QuickFillSuggestion["fields"] = []; const warnings = ["Only fields supplied in this format are filled. Complete missing fields and all photo/document uploads manually."];
  const type = normalizePropertyType(get("Property Type")) || preferredType;
  const reraNumber = get("RERA Number");
  const totalProjectArea = totalLandToAcres(get("Total Project Area", inventory)); const openSpaceArea = componentAreaToSqft(get("Open Space Area", inventory)); const builtUpProjectArea = componentAreaToSqft(get("Apartment Built-up Area", inventory) || get("Project Built-up Area", inventory)); const amenitiesArea = componentAreaToSqft(get("Amenities Area", inventory));
  const phaseRows = [...reraPhases.matchAll(/Phase\s+(\d+)\s+Name\s*:\s*(.+)/gi)].map((match) => {
    const index = match[1]; const name = clean(match[2]); const phaseNumber = labelled(reraPhases, `Phase ${index} RERA Number`); const reraSiteUrl = labelled(reraPhases, `Phase ${index} RERA URL`);
    if (!isProvided(name) || !phaseNumber) { warnings.push(`RERA Phase ${index} was skipped because both its name and registration number are required.`); return null; }
    return { name, reraNumber: phaseNumber, reraSiteUrl: reraSiteUrl || KARNATAKA_RERA_URL, reraDocuments: [], projectDocuments: [] };
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const introduction = numberedValues(narrativeText, "Introduction Paragraph").map((item) => item.value);
  const usps = numberedValues(narrativeText, "USP").map((item) => item.value);
  const locationAdvantage = numberedValues(narrativeText, "Location Advantage").map((item) => item.value);
  const investmentReasons = numberedValues(narrativeText, "Investment Reason").map((item) => item.value);
  const keyDetails = [...keyDetailsText.matchAll(/Detail\s+(\d+)\s+Label\s*:\s*(.+)/gi)].map((match) => ({ label: clean(match[2]), value: labelled(keyDetailsText, `Detail ${match[1]} Value`) })).filter((row) => row.label && row.value);
  const featureGroups = [...featureGroupsText.matchAll(/Group\s+(\d+)\s+Title\s*:\s*(.+)/gi)].map((match) => { const index = match[1]; const title = clean(match[2]); const items = [...featureGroupsText.matchAll(new RegExp(`Group\\s+${index}\\s+Item\\s+\\d+\\s*:\\s*(.+)`, "gi"))].map((item) => clean(item[1])).filter(isProvided); return { title, items }; }).filter((group) => group.title && group.items.length);
  const masterPlanSections = [...masterPlanText.matchAll(/Section\s+(\d+)\s+Heading\s*:\s*(.+)/gi)].map((match) => ({ heading: clean(match[2]), body: labelled(masterPlanText, `Section ${match[1]} Body`) })).filter((row) => row.heading && row.body);
  const faqs = [...faqText.matchAll(/FAQ\s+(\d+)\s+Question\s*:\s*(.+)/gi)].map((match) => ({ question: clean(match[2]), answer: labelled(faqText, `FAQ ${match[1]} Answer`) })).filter((row) => row.question && row.answer);
  const projectNarrative = introduction.length || usps.length || keyDetails.length || featureGroups.length || locationAdvantage.length || investmentReasons.length ? { introduction, usps, keyDetails, featureGroups, locationAdvantage, investmentReasons } : undefined;
  const masterPlanTitle = get("Title", masterPlanText); const masterPlanSummary = get("Summary", masterPlanText);
  const masterPlan = masterPlanTitle || masterPlanSummary || masterPlanSections.length ? { title: masterPlanTitle, summary: masterPlanSummary, sections: masterPlanSections } : undefined;
  const possessionStatus = get("Possession Status");
  const possessionDate = get("Expected Completion / Ready Date") || get("Expected Completion Month") || get("Ready / Launch Date") || get("Ready Since Date") || get("Ready Date");
  const patch: QuickFillPatch = { propertyType: type, title: get("Project / Property Name"), builder: get("Builder / Developer") || get("Operator / Developer") || get("Developer Name", developerText), developerDescription: get("About Developer", developerText), subtitle: get("Title / Subtitle"), description: get("Description"), price: get("Price"), pricePerSqft: get("Price Per Sqft"), area: get("Total Area"), transactionType: normalizeImportTransaction(get("Transaction Type")), listingType: get("Listing Type") || undefined, possession: possessionStatus || undefined, possessionDetails: templatePossession(possessionStatus, possessionDate), reraRegistered: /yes|true/i.test(get("RERA Registered")) || Boolean(reraNumber) || phaseRows.length > 0, reraNumber: reraNumber || phaseRows[0]?.reraNumber || undefined, reraPhases: phaseRows.length ? phaseRows : reraNumber ? [{ name: "Phase 1", reraNumber, reraSiteUrl: KARNATAKA_RERA_URL, reraDocuments: [], projectDocuments: [] }] : [], projectNarrative, masterPlan, faqs: faqs.length ? faqs : undefined, projectArea: totalProjectArea !== undefined || openSpaceArea !== undefined || builtUpProjectArea !== undefined || amenitiesArea !== undefined ? { totalAcres: totalProjectArea, openSpaceSqft: openSpaceArea, builtUpSqft: builtUpProjectArea, amenitiesSqft: amenitiesArea } : undefined, totalUnits: number(get("Total Units", inventory)), totalTowers: number(get("Total Towers", inventory)), locality: { address: get("Address", location), landmark: get("Landmark", location), city: get("City", location), zone: get("Zone", location), pinCode: get("Pincode", location) }, society: { security: get("Security", society), waterSupply: get("Water Supply", society), powerBackup: get("Power Backup", society), lift: get("Lift", society), visitorParking: get("Visitor Parking", society), maintenanceStaff: get("Maintenance Staff", society) } };
  const locality = get("Locality", location); if (locality && !patch.subtitle) patch.subtitle = locality;
  const configBlocks = [...configurations.matchAll(/Configuration\s+\d+\s*:\s*[\s\S]*?(?=\n\s*Configuration\s+\d+\s*:|$)/gi)];
  const configRows = configBlocks.map((block) => {
    const body = block[0];
    const rawBhk = get("BHK", body);
    const rawConfiguration = get("Configuration Name", body) || rawBhk;
    const parsedVilla = type === "Villa" ? parseVillaConfigurationLabel(rawConfiguration) : null;
    const configuration = type === "Villa" ? parsedVilla?.configuration : normalizeImportedApartmentConfiguration(rawConfiguration);
    const unitVariantRaw = get("Unit Variant", body);
    const unitVariant = villaUnitVariantOptions.find((option) => option.toLowerCase() === unitVariantRaw.toLowerCase()) || parsedVilla?.unitVariant;
    return configuration ? { configuration, bhk: normalizeBhkLabel(rawBhk) || parsedVilla?.bhk, unitVariant, numberOfFloors: get("Structure", body) || get("Number of Floors", body) || parsedVilla?.numberOfFloors, price: get("Price", body), plotArea: get("Plot Area", body), builtUpArea: get("Built-up Area", body), carpetArea: get("Carpet Area", body), superArea: get("Super Area", body), bedrooms: number(get("Bedrooms", body)), bathrooms: number(get("Bathrooms", body)), balconies: number(get("Balconies", body)), facing: get("Facing", body) } : null;
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  if (type === "Apartment" && configRows.length) { patch.configurationDetails = configRows.map((row) => ({ ...createConfigurationDetail(row.configuration), price: row.price, builtUpArea: row.builtUpArea, carpetArea: row.carpetArea, bedrooms: row.bedrooms || createConfigurationDetail(row.configuration).bedrooms, bathrooms: row.bathrooms || createConfigurationDetail(row.configuration).bathrooms, balconies: row.balconies ?? 0, facings: row.facing ? [row.facing] : [] })); patch.configs = configRows.map((row) => row.configuration); }
  if (type === "Villa") {
    const sharedNumberOfFloors = get("Number of Floors", villaText);
    const validSharedFloorCount = normalizeVillaFloorCount(sharedNumberOfFloors) || "";
    const gardenArea = get("Garden Area", villaText);
    patch.villaDetails = {
      ...initialVillaDetails(),
      villaType: normalizeVillaType(get("Villa Type", villaText)) || "Independent",
      configurationDetails: configRows.map((row) => ({
        ...createVillaConfigurationDetail(row.configuration),
        bhk: row.bhk,
        unitVariant: row.unitVariant,
        price: row.price,
        plotArea: row.plotArea,
        builtUpArea: row.builtUpArea,
        carpetArea: row.carpetArea,
        superArea: row.superArea,
        bedrooms: row.bedrooms ?? createVillaConfigurationDetail(row.configuration).bedrooms,
        bathrooms: row.bathrooms ?? createVillaConfigurationDetail(row.configuration).bathrooms,
        balconies: row.balconies,
        numberOfFloors: normalizeVillaFloorCount(row.numberOfFloors) || row.numberOfFloors,
        plotFacing: importedPlotFacing(row.facing, warnings, `${row.configuration} plot facing`),
      })),
      plotDimensions: get("Plot Dimensions", villaText),
      numberOfFloors: validSharedFloorCount,
      plotFacing: importedPlotFacing(get("Plot Facing", villaText), warnings, "Project plot facing"),
      cornerPlot: /yes|true/i.test(get("Corner Plot", villaText)),
      roadWidthFacing: get("Road Width", villaText),
      privateGarden: /yes|true/i.test(get("Private Garden", villaText)),
      privateGardenArea: number(gardenArea) !== undefined ? gardenArea : "",
      privatePool: /yes|true/i.test(get("Private Pool", villaText)),
      terrace: /yes|true/i.test(get("Terrace", villaText)),
      gatedCommunity: /yes|true/i.test(get("Gated Community", villaText)),
    };
    if (configRows.length) patch.configs = configRows.map((row) => row.configuration);
  }
  const facilities = [...amenityText.matchAll(/Amenity\s+\d+\s+Name\s*:\s*(.+?)(?=\n\s*Amenity\s+\d+\s+Name\s*:|$)/gis)].map((block) => { const body = block[0]; const name = labelled(body, block[0].match(/Amenity\s+\d+\s+Name/i)?.[0] || ""); const index = block[0].match(/Amenity\s+(\d+)/i)?.[1] || ""; return { name, description: labelled(amenityText, `Amenity ${index} Description`), status: (labelled(amenityText, `Amenity ${index} Status`) as any) || "Available", category: "Amenities" }; }).filter((item) => item.name);
  if (facilities.length) { patch.facilities = facilities; patch.amenities = facilities.map((facility) => facility.name); }
  const nearbyDetails: NonNullable<Property["nearbyDetails"]> = {}; (["School", "Hospital", "College", "Shopping / Mall", "Metro", "Workplace", "Park", "Road"] as const).forEach((label) => { const category = label === "School" ? "schools" : label === "Hospital" ? "hospitals" : label === "College" ? "colleges" : label === "Metro" ? "metro" : label === "Workplace" ? "workplaces" : label === "Park" ? "parks" : label === "Road" ? "roads" : "shopping"; const places = [...nearbyText.matchAll(new RegExp(`${label.replace("/", "\\/")}\\s+\\d+\\s+Name[\\t ]*:[\\t ]*([^\\r\\n]*)`, "gi"))].map((match) => { const index = match[0].match(/\d+/)?.[0] || ""; return { name: clean(match[1]), distance: labelled(nearbyText, `${label} ${index} Distance`), address: labelled(nearbyText, `${label} ${index} Address`), landmark: labelled(nearbyText, `${label} ${index} Landmark`) }; }).filter((item) => isProvided(item.name)); if (places.length) nearbyDetails[category] = { places }; });
  if (Object.keys(nearbyDetails).length) patch.nearbyDetails = nearbyDetails;
  applyModernDescriptionBlocks(source, type, patch, fields, warnings);
  Object.entries(patch).forEach(([label, value]) => { if (Array.isArray(value) ? value.length : value && typeof value === "object" ? Object.values(value).some(Boolean) : value) addField(fields, label, Array.isArray(value) ? value.join(", ") : value); });
  if (phaseRows.length) addField(fields, "RERA phases recognized", `${phaseRows.length}`);
  if (projectNarrative) addField(fields, "Project narrative entries", `${introduction.length + usps.length + keyDetails.length + featureGroups.reduce((total, group) => total + group.items.length, 0) + locationAdvantage.length + investmentReasons.length}`);
  if (masterPlan) addField(fields, "Master-plan text sections", `${masterPlanSections.length}`);
  if (faqs.length) addField(fields, "FAQs recognized", `${faqs.length}`);
  if (!type) warnings.unshift("Property Type is missing. Select it in the form before applying.");
  return { patch, fields, warnings };
}

const AMENITY_PATTERNS: Array<[string, RegExp]> = [
  ["Swimming Pool", /\b(swimming pool|pool)\b/i], ["Gymnasium", /\b(gym|gymnasium|fitness centre)\b/i],
  ["Power Backup", /\b(power backup|dg backup)\b/i], ["Lift", /\b(lift|elevator)\b/i],
  ["Security", /\b(24x7 security|security|cctv)\b/i], ["Club House", /\b(club ?house|clubhouse)\b/i],
  ["Park", /\b(park|garden|green area)\b/i], ["Reserved Parking", /\b(parking|car park)\b/i],
];

/** Deterministic, review-first extraction. It only returns details explicitly present in the pasted text. */
export function analyzePropertyDescription(text: string, preferredType?: SupportedPropertyType): QuickFillSuggestion {
  const source = clean(text);
  if (source.length < 10) throw new Error("Paste a longer property description before analyzing it.");
  if (/\[\s*PROPERTY BASICS\s*\]/i.test(source)) return analyzeStructuredDescription(source, preferredType);
  const fields: QuickFillSuggestion["fields"] = [];
  const warnings = ["Review every suggested value before applying it. The analyzer does not create photos, documents, or facts not stated in the description."];
  const type = normalizePropertyType(source) || preferredType;
  const patch: QuickFillPatch = { propertyType: type, description: source };
  const capture = (label: string, expression: RegExp, destination: keyof QuickFillPatch) => {
    const value = source.match(expression)?.[1]?.trim();
    if (value) { (patch as Record<string, unknown>)[destination] = value; addField(fields, label, value); }
  };
  capture("Project name", /(?:project|property)\s*(?:name)?\s*[:\-]\s*([^\n,.]+)/i, "title");
  capture("Builder", /(?:builder|developer)\s*[:\-]\s*([^\n,.]+)/i, "builder");
  capture("Location", /(?:location|locality|address)\s*[:\-]\s*([^\n.]+)/i, "subtitle");
  capture("RERA number", /(?:rera(?:\s*(?:no|number|registration))?)\s*[:#\-]?\s*([A-Za-z0-9/._-]{8,50})/i, "reraNumber");
  if (patch.reraNumber) patch.reraRegistered = true;
  const price = source.match(/₹\s*[\d,.]+\s*(?:cr|crore|lakh|lac|l)?(?:\s*[-–]\s*₹?\s*[\d,.]+\s*(?:cr|crore|lakh|lac|l)?)?/i)?.[0];
  if (price) { patch.price = price; addField(fields, "Price", price); }
  const area = source.match(/\b\d[\d,]*(?:\s*[-–]\s*\d[\d,]*)?\s*(?:sq\.?\s*ft\.?|sqft|square feet)\b/i)?.[0];
  if (area) { patch.area = area; addField(fields, "Area", area); }
  const possessionText = source.match(/(?:possession|completion|ready to move)[^\n.]*/i)?.[0] || "";
  const possessionDetails = completion(possessionText);
  if (possessionDetails) { patch.possessionDetails = possessionDetails; patch.possession = possessionText; addField(fields, "Possession", possessionText); }
  const amenities = AMENITY_PATTERNS.filter(([, pattern]) => pattern.test(source) && !new RegExp(`no\\s+${pattern.source}`, "i").test(source)).map(([name]) => name);
  if (amenities.length) { patch.amenities = amenities; addField(fields, "Amenities", amenities.join(", ")); }
  const bhkMatches = [...source.matchAll(/\b\d+(?:\.5)?\s*bhk(?:\s+(?:simplex|duplex|triplex|villament|pent\s*house|sky\s*villa|row\s*(?:house|villa)|independent\s*villa|twin\s*villa))?(?:\s*\(\s*(?:g\s*\+\s*\d+|\d+)\s*\))?/gi)].map((match) => match[0]);
  const standaloneVillaMatches = type === "Villa" && !bhkMatches.length
    ? [...source.matchAll(/\b(villament|pent\s*house|sky\s*villa|duplex|triplex)\b/gi)].map((match) => match[0])
    : [];
  const uniqueConfigs = [...new Set((type === "Villa" ? [...bhkMatches, ...standaloneVillaMatches].map((value) => parseVillaConfigurationLabel(value)?.configuration) : bhkMatches.map(normalizeBhkLabel)).filter((item): item is string => Boolean(item)))];
  if (type === "Apartment" && uniqueConfigs.length) {
    patch.configurationDetails = uniqueConfigs.map((configuration) => createConfigurationDetail(configuration));
    patch.configs = uniqueConfigs;
    addField(fields, "Configurations", uniqueConfigs.join(", "));
  }
  if (type === "Villa" && uniqueConfigs.length) {
    patch.villaDetails = { ...initialVillaDetails(), configurationDetails: uniqueConfigs.map((configuration) => createVillaConfigurationDetail(configuration)) };
    patch.configs = uniqueConfigs;
    addField(fields, "Villa configurations", uniqueConfigs.join(", "));
  }
  if (!type) warnings.unshift("The property type was not clear in the description. Select it in the form before applying suggestions.");
  return { patch, fields, warnings };
}

const PROTECTED_KEYS = new Set(["image", "heroVideo", "videos", "localityMapImageUrl", "brochure", "brochureName"]);

/** Merge only into empty fields by default; unsafe or deprecated media fields are always preserved. */
export function mergeQuickFill<T extends Record<string, any>>(current: T, patch: QuickFillPatch, replaceExisting = false): T {
  const merge = (existing: any, incoming: any, field?: string, path: string[] = []): any => {
    if (incoming === undefined || incoming === null || PROTECTED_KEYS.has(field || "")) return existing;
    if (field === "imageUrl" && path[path.length - 1] === "masterPlan") return existing;
    if (field === "reraRegistered" && !replaceExisting) return Boolean(existing || incoming);
    if (Array.isArray(incoming)) {
      if (field === "amenities") return [...new Set([...(existing || []), ...incoming])];
      if (!replaceExisting && ["introduction", "usps", "locationAdvantage", "investmentReasons", "items"].includes(field || "")) return [...new Set([...(existing || []), ...incoming])];
      const identityField = field === "reraPhases" ? "reraNumber" : field === "faqs" ? "question" : field === "keyDetails" ? "label" : field === "featureGroups" ? "title" : field === "sections" && path[path.length - 1] === "masterPlan" ? "heading" : "";
      if (!replaceExisting && identityField) {
        const result = [...(existing || [])];
        incoming.forEach((incomingRow) => {
          const incomingIdentity = clean(incomingRow?.[identityField]).toLowerCase();
          let index = incomingIdentity ? result.findIndex((row) => clean(row?.[identityField]).toLowerCase() === incomingIdentity) : -1;
          if (field === "reraPhases" && index < 0) {
            const incomingName = clean(incomingRow?.name).toLowerCase();
            if (incomingName) index = result.findIndex((row) => clean(row?.name).toLowerCase() === incomingName);
          }
          if (index < 0) result.push(incomingRow);
          else result[index] = merge(result[index], incomingRow, undefined, [...path, field || ""]);
        });
        return result;
      }
      return replaceExisting || !existing?.length ? incoming : existing;
    }
    if (typeof incoming === "object") {
      const base = existing && typeof existing === "object" ? existing : {};
      const merged = { ...base };
      Object.entries(incoming).forEach(([key, value]) => { merged[key] = merge(base[key], value, key, field ? [...path, field] : path); });
      return merged;
    }
    const empty = existing === undefined || existing === null || existing === "" || existing === 0;
    return replaceExisting || empty ? incoming : existing;
  };
  return merge(current, patch) as T;
}
