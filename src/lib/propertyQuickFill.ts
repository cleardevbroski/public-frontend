import * as XLSX from "xlsx";
import type {
  CommercialDetails,
  ConfigurationDetail,
  PgDetails,
  PlotDetails,
  Property,
  VillaConfigurationDetail,
} from "@/components/acres/mock-data";
import { createConfigurationDetail, normalizeBhkLabel } from "@/lib/propertyDetails";
import { createVillaConfigurationDetail, initialVillaDetails } from "@/lib/villaDetails";
import { createPlotSizeDetail, initialPlotDetails, normalizePlotSize } from "@/lib/plotDetails";
import { initialCommercialDetails } from "@/lib/commercialDetails";
import { initialPgDetails } from "@/lib/pgDetails";

export type SupportedPropertyType = "Apartment" | "Villa" | "Plot" | "Commercial" | "PG/Co-living";
export type QuickFillPatch = Partial<Property>;
export type QuickFillSuggestion = {
  patch: QuickFillPatch;
  fields: Array<{ label: string; value: string }>;
  warnings: string[];
};

const MAX_ROWS = 250;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

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
function list(value: unknown): string[] {
  return clean(value).split(/[,;|\n]/).map((item) => item.trim()).filter(Boolean);
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
  if (normalized.includes("villa")) return "Villa";
  if (normalized.includes("plot") || normalized.includes("land")) return "Plot";
  if (normalized.includes("commercial") || normalized.includes("office") || normalized.includes("warehouse") || normalized.includes("showroom")) return "Commercial";
  if (normalized.includes("pg") || normalized.includes("coliving") || normalized.includes("hostel")) return "PG/Co-living";
  return undefined;
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
    transactionType: read(["transactiontype", "transaction"]) || undefined,
    listingType: read(["listingtype", "listing", "saleorrent"]) || undefined,
    furnishing: read(["furnishing", "furnished"]),
    parking: read(["parking", "carparking"]),
    facing: read(["facing", "direction"]),
    floor: read(["floor", "propertyfloor"]),
    totalFloors: number(read(["totalfloors", "nofloors", "numberoffloors"])),
    amenities,
    projectNarrative,
    faqs,
    heroImages,
    images: galleryImages,
    developerLogoUrl,
    projectDownloads: safeDownloads,
    reraRegistered: Boolean(reraNumber) || /yes|true|registered/i.test(read(["reraregistered"])),
    reraNumber: reraNumber || undefined,
    reraPhases: reraPhasesJson || (reraNumber ? [{ name: reraPhaseName || "Phase 1", reraNumber, reraDocuments: [], projectDocuments: [] }] : []),
    projectArea: number(read(["totalprojectarea", "projectarea", "totalarea", "sitearea"])) !== undefined ? {
      totalAcres: number(read(["totalprojectarea", "projectarea", "totalarea", "sitearea"])),
      openSpaceAcres: number(read(["openspacearea", "emptyopenspacearea"])),
      builtUpAcres: number(read(["apartmentbuiltuparea", "buildingarea"])),
      amenitiesAcres: number(read(["amenitiesarea"])),
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
    const configuration = normalizeBhkLabel(clean(row[index]));
    if (!configuration) return;
    configurations.push({ configuration, area: clean(row[index + 1]), price: clean(row[index + 2]) });
  });
  if (!configurations.length) {
    const fromSingle = list(valueAt(row, getHeaders([rawHeaders]), ["configurations", "bhkconfigurations", "bhk"]));
    fromSingle.forEach((item) => {
      const configuration = normalizeBhkLabel(item);
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
    const details: VillaConfigurationDetail[] = configs.map((item) => ({ ...createVillaConfigurationDetail(item.configuration), price: item.price, builtUpArea: item.area, plotArea: read(["plotarea"]), superArea: read(["superarea", "area"]) }));
    suggestion.patch.villaDetails = { ...initialVillaDetails(), villaType: (read(["villatype"]) as "Independent" | "Row Villa" | "Twin Villa") || "Independent", configurationDetails: details, plotDimensions: read(["plotdimensions", "dimensions"]), numberOfFloors: read(["numberoffloors", "totalfloors"]), roadWidthFacing: read(["roadwidth"]), privateGarden: /yes|true/i.test(read(["privategarden"])), privatePool: /yes|true/i.test(read(["privatepool"])), terrace: /yes|true/i.test(read(["terrace"])), gatedCommunity: /yes|true/i.test(read(["gatedcommunity"])) };
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
      const configuration = normalizeBhkLabel(recordValue(record, ["configuration", "bhk"]));
      return configuration ? { configuration, price: recordValue(record, ["price"]), builtUpArea: recordValue(record, ["builtuparea", "area", "sqft"]), carpetArea: recordValue(record, ["carpetarea"]), plotArea: recordValue(record, ["plotarea"]), superArea: recordValue(record, ["superarea"]), bathrooms: number(recordValue(record, ["bathrooms"])) } : null;
    }).filter((item): item is NonNullable<typeof item> => Boolean(item));
    if (type === "Apartment" && rows.length) suggestion.patch.configurationDetails = rows.map((row) => ({ ...createConfigurationDetail(row.configuration), price: row.price, builtUpArea: row.builtUpArea, carpetArea: row.carpetArea, bathrooms: row.bathrooms || createConfigurationDetail(row.configuration).bathrooms }));
    if (type === "Villa" && rows.length) suggestion.patch.villaDetails = { ...(suggestion.patch.villaDetails || initialVillaDetails()), configurationDetails: rows.map((row) => ({ ...createVillaConfigurationDetail(row.configuration), price: row.price, builtUpArea: row.builtUpArea, plotArea: row.plotArea, superArea: row.superArea, bathrooms: row.bathrooms || createVillaConfigurationDetail(row.configuration).bathrooms })) };
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
  const typeDetail = matching(`${type} Details`)[0];
  if (typeDetail && type === "Villa") suggestion.patch.villaDetails = { ...(suggestion.patch.villaDetails || initialVillaDetails()), villaType: (recordValue(typeDetail, ["villatype"]) as any) || "Independent", plotDimensions: recordValue(typeDetail, ["plotdimensions"]), numberOfFloors: recordValue(typeDetail, ["numberoffloors"]), plotFacing: (recordValue(typeDetail, ["plotfacing"]) as any) || "East", cornerPlot: /yes|true/i.test(recordValue(typeDetail, ["cornerplot"])), roadWidthFacing: recordValue(typeDetail, ["roadwidth"]), privateGarden: /yes|true/i.test(recordValue(typeDetail, ["privategarden"])), privateGardenArea: recordValue(typeDetail, ["gardenarea"]), privatePool: /yes|true/i.test(recordValue(typeDetail, ["privatepool"])), terrace: /yes|true/i.test(recordValue(typeDetail, ["terrace"])), gatedCommunity: /yes|true/i.test(recordValue(typeDetail, ["gatedcommunity"])) };
  if (typeDetail && type === "Plot") suggestion.patch.plotDetails = { ...(suggestion.patch.plotDetails || initialPlotDetails()), totalPlots: number(recordValue(typeDetail, ["totalplots"])) || 0, approvalAuthority: recordValue(typeDetail, ["approvalauthority"]) || "BMRDA", approvalNumber: recordValue(typeDetail, ["approvalnumber"]), roadWidth: recordValue(typeDetail, ["roadwidth"]), civicInfrastructure: { undergroundDrainage: (recordValue(typeDetail, ["undergrounddrainage"]) as any) || "Ready", electricity: (recordValue(typeDetail, ["electricity"]) as any) || "Ready", water: (recordValue(typeDetail, ["water"]) as any) || "Ready" }, layoutPossession: /under/i.test(recordValue(typeDetail, ["layoutpossessionstatus"])) ? { status: "Under Development", expectedCompletionDate: recordValue(typeDetail, ["layoutdate"]) } : { status: "Layout Ready", readyDate: recordValue(typeDetail, ["layoutdate"]) } };
  if (typeDetail && type === "Commercial") suggestion.patch.commercialDetails = { ...(suggestion.patch.commercialDetails || initialCommercialDetails()), commercialSubtype: (recordValue(typeDetail, ["commercialsubtype"]) as any) || "Office Space", zoneType: (recordValue(typeDetail, ["zonetype"]) as any) || "Non-SEZ", carpetArea: recordValue(typeDetail, ["carpetarea"]), builtUpArea: recordValue(typeDetail, ["builtuparea"]), superArea: recordValue(typeDetail, ["superarea"]), floor: recordValue(typeDetail, ["floor"]), totalFloors: number(recordValue(typeDetail, ["totalfloors"])) || 0, frontage: recordValue(typeDetail, ["frontage"]), seatingCapacity: number(recordValue(typeDetail, ["seatingcapacity"])) || 0, cabins: number(recordValue(typeDetail, ["cabins"])) || 0, meetingRooms: number(recordValue(typeDetail, ["meetingrooms"])) || 0, buildingGrade: (recordValue(typeDetail, ["buildinggrade"]) as any) || "Not Applicable", pantry: (recordValue(typeDetail, ["pantry"]) as any) || "None", washrooms: recordValue(typeDetail, ["washrooms"]), parking: recordValue(typeDetail, ["parking"]), powerBackup: recordValue(typeDetail, ["powerbackup"]), sanctionedLoadKva: number(recordValue(typeDetail, ["sanctionedloadkva"])) || 0, fireSafetyCompliance: recordValue(typeDetail, ["firesafety"]), furnishing: (recordValue(typeDetail, ["furnishing"]) as any) || "Bare Shell" };
  if (typeDetail && type === "PG/Co-living") suggestion.patch.pgDetails = { ...(suggestion.patch.pgDetails || initialPgDetails()), genderPreference: (recordValue(typeDetail, ["genderpreference"]) as any) || "Co-ed", availableFrom: recordValue(typeDetail, ["availablefrom"]), mealsIncluded: (recordValue(typeDetail, ["mealsincluded"]) as any) || "No meals", foodType: (recordValue(typeDetail, ["foodtype"]) as any) || "", wifiIncluded: /yes|true|included/i.test(recordValue(typeDetail, ["wifiincluded"])), laundryIncluded: /yes|true|included/i.test(recordValue(typeDetail, ["laundryincluded"])), housekeeping: recordValue(typeDetail, ["housekeeping"]), curfewEntryTiming: recordValue(typeDetail, ["curfewentrytiming"]), visitorsAllowed: recordValue(typeDetail, ["visitorsallowed"]), noticePeriod: recordValue(typeDetail, ["noticeperiod"]), lockInPeriod: recordValue(typeDetail, ["lockinperiod"]), contactType: (recordValue(typeDetail, ["contacttype"]) as any) || "PG Manager", commonAmenities: list(recordValue(typeDetail, ["commonamenities"])) };
  if (typeDetail) addField(suggestion.fields, `${type} details sheet`, "Type-specific details");
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
export function downloadPropertyExcelTemplate() {
  const workbook = XLSX.utils.book_new();
  const properties = XLSX.utils.aoa_to_sheet([
    ["Project Name", "Property Type", "Builder", "Location", "City", "Zone", "Address", "Landmark", "Pincode", "Price", "Price Per Sqft", "Area", "Total Project Area", "Open Space Area", "Apartment Built Up Area", "Amenities Area", "Total Units", "Total Towers", "Possession Year", "Transaction Type", "Listing Type", "RERA Registered", "RERA Number", "RERA Phase Name", "Furnishing", "Parking", "Facing", "Floor", "Total Floors", "Description", "Project Narrative JSON", "FAQs JSON", "Hero Images", "Gallery Images", "Developer Logo URL", "Project Downloads JSON", "RERA Phases JSON", "Source References JSON"],
    ["Example Project", "Apartment", "Example Builder", "Whitefield", "Bangalore", "East", "", "", "", "₹ 1.25 Cr", "₹ 8,500/sqft", "1200 sqft", "", "", "", "", "", "", "Dec 2030", "New Property", "For Sale", "Yes", "", "Phase 1", "", "", "", "", "", "", "", "[]", "", "", "", "[]", "[]", "[]"],
  ]);
  const configurations = XLSX.utils.aoa_to_sheet([["Project Name", "Configuration", "Price", "Built Up Area", "Carpet Area", "Plot Area", "Super Area", "Bathrooms"], ["Example Project", "2 BHK", "₹ 1.25 Cr", "1200 sqft", "900 sqft", "", "", "2"]]);
  const society = XLSX.utils.aoa_to_sheet([["Project Name", "Security", "Water Supply", "Power Backup", "Lift", "Visitor Parking", "Maintenance Staff"], ["Example Project", "24x7 security", "24x7 water", "DG backup", "2 lifts", "Available", "Available"]]);
  const amenities = XLSX.utils.aoa_to_sheet([["Project Name", "Amenity", "Description", "Status"], ["Example Project", "Swimming Pool", "Temperature controlled pool", "Available"]]);
  const nearby = XLSX.utils.aoa_to_sheet([["Project Name", "Category", "Name", "Distance", "Address", "Landmark"], ["Example Project", "Schools", "Example School", "1 km", "", ""]]);
  const villa = XLSX.utils.aoa_to_sheet([["Project Name", "Villa Type", "Plot Dimensions", "Number Of Floors", "Plot Facing", "Corner Plot", "Road Width", "Private Garden", "Garden Area", "Private Pool", "Terrace", "Gated Community"], ["Example Villa", "Independent", "30 x 40", "G+2", "East", "No", "30 ft", "Yes", "200 sqft", "No", "Yes", "Yes"]]);
  const plots = XLSX.utils.aoa_to_sheet([["Project Name", "Plot Dimensions", "Price Per Sqft", "Total Plots", "Approval Authority", "Approval Number", "Road Width", "Underground Drainage", "Electricity", "Water", "Layout Possession Status", "Layout Date"], ["Example Plot", "30 x 40", "8500", "50", "BMRDA", "", "30 ft", "Ready", "Ready", "Ready", "Under Development", "2030-12"]]);
  const commercial = XLSX.utils.aoa_to_sheet([["Project Name", "Commercial Subtype", "Zone Type", "Carpet Area", "Built Up Area", "Super Area", "Floor", "Total Floors", "Frontage", "Seating Capacity", "Cabins", "Meeting Rooms", "Building Grade", "Pantry", "Washrooms", "Parking", "Power Backup", "Sanctioned Load Kva", "Fire Safety", "Furnishing"], ["Example Office", "Office Space", "Non-SEZ", "1000 sqft", "1200 sqft", "", "2", "10", "", "50", "3", "1", "Grade A", "Private Pantry", "2", "2 Covered", "DG backup", "20", "Compliant", "Fully Furnished"]]);
  const pg = XLSX.utils.aoa_to_sheet([["Project Name", "Gender Preference", "Available From", "Sharing Type", "Rent Per Bed", "Deposit", "Beds Available", "Meals Included", "Food Type", "Wifi Included", "Laundry Included", "Housekeeping", "Curfew Entry Timing", "Visitors Allowed", "Notice Period", "Lock In Period", "Contact Type", "Common Amenities"], ["Example PG", "Co-ed", "2030-01-01", "Double sharing", "12000", "24000", "4", "Breakfast + Dinner", "Veg only", "Yes", "Yes", "Daily", "10 PM", "Yes", "30 days", "3 months", "PG Manager", "Wi-Fi, Washing machine"]]);
  XLSX.utils.book_append_sheet(workbook, properties, "Properties");
  XLSX.utils.book_append_sheet(workbook, configurations, "Configurations");
  XLSX.utils.book_append_sheet(workbook, society, "Society");
  XLSX.utils.book_append_sheet(workbook, amenities, "Amenities");
  XLSX.utils.book_append_sheet(workbook, nearby, "Nearby Places");
  XLSX.utils.book_append_sheet(workbook, villa, "Villa Details");
  XLSX.utils.book_append_sheet(workbook, plots, "Plot Details");
  XLSX.utils.book_append_sheet(workbook, commercial, "Commercial Details");
  XLSX.utils.book_append_sheet(workbook, pg, "PG Details");
  XLSX.writeFile(workbook, "property-import-template.xlsx", { bookType: "xlsx", compression: true });
}

export const PROPERTY_IMPORT_DESCRIPTION_FORMAT = `PROPERTY IMPORT FORMAT

[PROPERTY BASICS]
Property Type: Apartment | Villa | Plot | Commercial | PG/Co-living
Project / Property Name:
Builder / Developer:
Transaction Type: New Property | Resale
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

[LOCATION]
Address:
Landmark:
Locality:
Zone:
City:
Pincode:

[CONFIGURATIONS]
Configuration 1:
BHK:
Price:
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

[NEARBY PLACES]
School 1 Name:
School 1 Distance:
School 1 Address:
Hospital 1 Name:
Hospital 1 Distance:
Hospital 1 Address:
College 1 Name:
College 1 Distance:
Shopping / Mall 1 Name:
Shopping / Mall 1 Distance:
Metro 1 Name:
Metro 1 Distance:
Workplace 1 Name:
Workplace 1 Distance:
Park 1 Name:
Park 1 Distance:
Road 1 Name:
Road 1 Distance:

[VILLA DETAILS — only for Villa]
Villa Type:
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

export function downloadPropertyDescriptionFormat() {
  const blob = new Blob([PROPERTY_IMPORT_DESCRIPTION_FORMAT], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "property-import-description-format.txt";
  link.click();
  URL.revokeObjectURL(url);
}

function isProvided(value: string) { return Boolean(value && !/^not\s*(provided|available)|n\/?a$/i.test(value.trim())); }
function section(text: string, name: string) {
  const match = text.match(new RegExp(`\\[${name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}[^\\]]*\\]([\\s\\S]*?)(?=\\n\\s*\\[[^\\]]+\\]|$)`, "i"));
  return match?.[1] || "";
}
function labelled(text: string, label: string) {
  const match = text.match(new RegExp(`^\\s*${label.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\s*:\\s*(.+?)\\s*$`, "im"));
  const value = clean(match?.[1]);
  return isProvided(value) ? value : "";
}

function analyzeStructuredDescription(source: string, preferredType?: SupportedPropertyType): QuickFillSuggestion {
  const basics = section(source, "PROPERTY BASICS"); const location = section(source, "LOCATION"); const configurations = section(source, "CONFIGURATIONS");
  const society = section(source, "SOCIETY"); const amenityText = section(source, "AMENITIES"); const nearbyText = section(source, "NEARBY PLACES"); const inventory = section(source, "PROJECT AREA AND INVENTORY"); const reraPhases = section(source, "RERA PHASES");
  const get = (label: string, body = basics) => labelled(body, label);
  const fields: QuickFillSuggestion["fields"] = []; const warnings = ["Only fields supplied in this format are filled. Complete missing fields and all photo/document uploads manually."];
  const type = normalizePropertyType(get("Property Type")) || preferredType;
  const reraNumber = get("RERA Number");
  const totalProjectArea = number(get("Total Project Area", inventory)); const openSpaceArea = number(get("Open Space Area", inventory)); const builtUpProjectArea = number(get("Apartment Built-up Area", inventory)); const amenitiesArea = number(get("Amenities Area", inventory));
  const phaseRows = [...reraPhases.matchAll(/Phase\s+(\d+)\s+Name\s*:\s*(.+)/gi)].map((match) => { const index = match[1]; const name = clean(match[2]); const phaseNumber = labelled(reraPhases, `Phase ${index} RERA Number`); return isProvided(name) && phaseNumber ? { name, reraNumber: phaseNumber, reraDocuments: [], projectDocuments: [] } : null; }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const patch: QuickFillPatch = { propertyType: type, title: get("Project / Property Name"), builder: get("Builder / Developer"), subtitle: get("Title / Subtitle"), description: get("Description"), price: get("Price"), pricePerSqft: get("Price Per Sqft"), area: get("Total Area"), transactionType: get("Transaction Type") || undefined, listingType: get("Listing Type") || undefined, possession: get("Possession Status") || undefined, possessionDetails: completion(`${get("Possession Status")} ${get("Expected Completion / Ready Date")}`), reraRegistered: /yes|true/i.test(get("RERA Registered")) || Boolean(reraNumber), reraNumber: reraNumber || phaseRows[0]?.reraNumber || undefined, reraPhases: phaseRows.length ? phaseRows : reraNumber ? [{ name: "Phase 1", reraNumber, reraDocuments: [], projectDocuments: [] }] : [], projectArea: totalProjectArea !== undefined || openSpaceArea !== undefined || builtUpProjectArea !== undefined || amenitiesArea !== undefined ? { totalAcres: totalProjectArea, openSpaceAcres: openSpaceArea, builtUpAcres: builtUpProjectArea, amenitiesAcres: amenitiesArea } : undefined, totalUnits: number(get("Total Units", inventory)), totalTowers: number(get("Total Towers", inventory)), locality: { address: get("Address", location), landmark: get("Landmark", location), city: get("City", location), zone: get("Zone", location), pinCode: get("Pincode", location) }, society: { security: get("Security", society), waterSupply: get("Water Supply", society), powerBackup: get("Power Backup", society), lift: get("Lift", society), visitorParking: get("Visitor Parking", society), maintenanceStaff: get("Maintenance Staff", society) } };
  const locality = get("Locality", location); if (locality && !patch.subtitle) patch.subtitle = locality;
  const configBlocks = [...configurations.matchAll(/Configuration\s+\d+\s*:\s*[\s\S]*?(?=\n\s*Configuration\s+\d+\s*:|$)/gi)];
  const configRows = configBlocks.map((block) => { const body = block[0]; const config = normalizeBhkLabel(get("BHK", body)); return config ? { configuration: config, price: get("Price", body), builtUpArea: get("Built-up Area", body), carpetArea: get("Carpet Area", body), superArea: get("Super Area", body), bedrooms: number(get("Bedrooms", body)), bathrooms: number(get("Bathrooms", body)), balconies: number(get("Balconies", body)), facing: get("Facing", body) } : null; }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  if (type === "Apartment" && configRows.length) { patch.configurationDetails = configRows.map((row) => ({ ...createConfigurationDetail(row.configuration), price: row.price, builtUpArea: row.builtUpArea, carpetArea: row.carpetArea, bedrooms: row.bedrooms || createConfigurationDetail(row.configuration).bedrooms, bathrooms: row.bathrooms || createConfigurationDetail(row.configuration).bathrooms, balconies: row.balconies ?? 0, facings: row.facing ? [row.facing] : [] })); patch.configs = configRows.map((row) => row.configuration); }
  if (type === "Villa" && configRows.length) { patch.villaDetails = { ...initialVillaDetails(), configurationDetails: configRows.map((row) => ({ ...createVillaConfigurationDetail(row.configuration), price: row.price, builtUpArea: row.builtUpArea, superArea: row.superArea, bedrooms: row.bedrooms || createVillaConfigurationDetail(row.configuration).bedrooms, bathrooms: row.bathrooms || createVillaConfigurationDetail(row.configuration).bathrooms })) }; patch.configs = configRows.map((row) => row.configuration); }
  const facilities = [...amenityText.matchAll(/Amenity\s+\d+\s+Name\s*:\s*(.+?)(?=\n\s*Amenity\s+\d+\s+Name\s*:|$)/gis)].map((block) => { const body = block[0]; const name = labelled(body, block[0].match(/Amenity\s+\d+\s+Name/i)?.[0] || ""); const index = block[0].match(/Amenity\s+(\d+)/i)?.[1] || ""; return { name, description: labelled(amenityText, `Amenity ${index} Description`), status: (labelled(amenityText, `Amenity ${index} Status`) as any) || "Available", category: "Amenities" }; }).filter((item) => item.name);
  if (facilities.length) { patch.facilities = facilities; patch.amenities = facilities.map((facility) => facility.name); }
  const nearbyDetails: NonNullable<Property["nearbyDetails"]> = {}; (["School", "Hospital", "College", "Shopping / Mall", "Metro", "Workplace", "Park", "Road"] as const).forEach((label) => { const category = label === "School" ? "schools" : label === "Hospital" ? "hospitals" : label === "College" ? "colleges" : label === "Metro" ? "metro" : label === "Workplace" ? "workplaces" : label === "Park" ? "parks" : label === "Road" ? "roads" : "shopping"; const places = [...nearbyText.matchAll(new RegExp(`${label.replace("/", "\\/")}\\s+\\d+\\s+Name\\s*:\\s*(.+)`, "gi"))].map((match) => { const index = match[0].match(/\d+/)?.[0] || ""; return { name: clean(match[1]), distance: labelled(nearbyText, `${label} ${index} Distance`), address: labelled(nearbyText, `${label} ${index} Address`) }; }).filter((item) => isProvided(item.name)); if (places.length) nearbyDetails[category] = { places }; });
  if (Object.keys(nearbyDetails).length) patch.nearbyDetails = nearbyDetails;
  Object.entries(patch).forEach(([label, value]) => { if (Array.isArray(value) ? value.length : value && typeof value === "object" ? Object.values(value).some(Boolean) : value) addField(fields, label, Array.isArray(value) ? value.join(", ") : value); });
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
  const bhkMatches = [...source.matchAll(/\b(\d+(?:\.5)?)\s*bhk\b/gi)].map((match) => normalizeBhkLabel(match[0])).filter((item): item is string => Boolean(item));
  const uniqueConfigs = [...new Set(bhkMatches)];
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

const PROTECTED_KEYS = new Set(["image", "heroVideo", "videos", "localityMapImageUrl", "masterPlan", "brochure", "brochureName"]);

/** Merge only into empty fields by default; unsafe or deprecated media fields are always preserved. */
export function mergeQuickFill<T extends Record<string, any>>(current: T, patch: QuickFillPatch, replaceExisting = false): T {
  const merge = (existing: any, incoming: any, field?: string): any => {
    if (incoming === undefined || incoming === null || PROTECTED_KEYS.has(field || "")) return existing;
    if (Array.isArray(incoming)) {
      if (field === "amenities") return [...new Set([...(existing || []), ...incoming])];
      return replaceExisting || !existing?.length ? incoming : existing;
    }
    if (typeof incoming === "object") {
      const base = existing && typeof existing === "object" ? existing : {};
      const merged = { ...base };
      Object.entries(incoming).forEach(([key, value]) => { merged[key] = merge(base[key], value, key); });
      return merged;
    }
    const empty = existing === undefined || existing === null || existing === "" || existing === 0;
    return replaceExisting || empty ? incoming : existing;
  };
  return merge(current, patch) as T;
}
