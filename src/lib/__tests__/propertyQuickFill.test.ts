import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { analyzePropertyDescription, mergeQuickFill, parsePropertyExcel } from "@/lib/propertyQuickFill";

describe("admin property quick fill", () => {
  it("imports the legacy apartment BHK triplets without losing repeated configurations", async () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ["PROJECTS ", "price upto", "COMPANY ", "SQFt starts from ", "LOCATION ", "POSSEION Year ", "bhk ", "SQFt", "price", "BHK", "sqft", "PRICE "],
      ["Mahindra Sadahalli", "₹ 1.12 Cr - 2.38 Cr", "Mahindra Lifespace", "800 - 1700 sqft", "Sadahalli", "Dec 2030", "2BHK", "800 sqft", "₹1.12 Cr", "3.5 BHK", "1500 sqft", "₹2.10 Cr"],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
    const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = { name: "sample.xlsx", size: bytes.byteLength, arrayBuffer: async () => bytes } as File;
    const result = await parsePropertyExcel(file, "Apartment");
    expect(result.patch).toMatchObject({ title: "Mahindra Sadahalli", builder: "Mahindra Lifespace", propertyType: "Apartment" });
    expect(result.patch.configurationDetails).toMatchObject([
      { configuration: "2 BHK", builtUpArea: "800 sqft", price: "₹1.12 Cr" },
      { configuration: "3.5 BHK", builtUpArea: "1500 sqft", price: "₹2.10 Cr", bedrooms: 3 },
    ]);
    expect(result.patch.possessionDetails).toMatchObject({ status: "Under Construction", expectedCompletionDate: "2030-12" });
  });

  it("extracts only explicit description facts and leaves manual media untouched", () => {
    const result = analyzePropertyDescription("Apartment project: Lakeview Heights. Builder: Clear Homes. Location: Whitefield. RERA: PRM/KA/RERA/1251/446/PR/12345678. 3 BHK, ₹ 1.2 Cr, 1450 sqft with gym, swimming pool and power backup. Possession Dec 2030.", "Apartment");
    expect(result.patch).toMatchObject({ title: "Lakeview Heights", builder: "Clear Homes", propertyType: "Apartment", amenities: ["Swimming Pool", "Gymnasium", "Power Backup"] });
    const merged = mergeQuickFill({ title: "Manual title", heroImages: ["hero.jpg"], images: ["image.jpg"], amenities: ["Lift"] }, result.patch, false);
    expect(merged.title).toBe("Manual title");
    expect(merged.heroImages).toEqual(["hero.jpg"]);
    expect(merged.images).toEqual(["image.jpg"]);
    expect(merged.amenities).toEqual(expect.arrayContaining(["Lift", "Gymnasium", "Swimming Pool"]));
  });

  it("reads the downloadable structured format including society, amenity descriptions, and nearby places", () => {
    const result = analyzePropertyDescription(`PROPERTY IMPORT FORMAT

[PROPERTY BASICS]
Property Type: Apartment
Project / Property Name: Structured Heights
Builder / Developer: Clear Homes
Price: ₹ 1.5 Cr
Possession Status: Under Construction
Expected Completion / Ready Date: Dec 2030

[PROJECT AREA AND INVENTORY]
Total Project Area: 8.07 Acres
Total Units: 534
Total Towers: 2

[RERA PHASES]
Phase 1 Name: Regent Park Main Phase
Phase 1 RERA Number: PRM/KA/RERA/1251/308/PR/150726/008810

[LOCATION]
Locality: Whitefield
City: Bangalore

[CONFIGURATIONS]
Configuration 1:
BHK: 3.5 BHK
Price: ₹ 1.5 Cr
Built-up Area: 1600 sqft
Carpet Area: 1200 sqft
Bathrooms: 3
Facing: East

[SOCIETY]
Security: 24x7 security
Water Supply: 24x7 water
Power Backup: DG backup
Lift: 2 lifts
Visitor Parking: Available
Maintenance Staff: Available

[AMENITIES]
Amenity 1 Name: Swimming Pool
Amenity 1 Description: Temperature controlled pool
Amenity 1 Status: Available

[NEARBY PLACES]
School 1 Name: Example School
School 1 Distance: 1 km
School 1 Address: Whitefield
Hospital 1 Name: Example Hospital
Hospital 1 Distance: 2 km
Workplace 1 Name: Embassy TechVillage
Workplace 1 Distance: Not provided
Road 1 Name: Sarjapur Road
Road 1 Distance: 2.5 km`, "Apartment");
    expect(result.patch.configurationDetails?.[0]).toMatchObject({ configuration: "3.5 BHK", bedrooms: 3, carpetArea: "1200 sqft", facings: ["East"] });
    expect(result.patch.society).toMatchObject({ security: "24x7 security", lift: "2 lifts" });
    expect(result.patch.facilities).toMatchObject([{ name: "Swimming Pool", description: "Temperature controlled pool", status: "Available" }]);
    expect(result.patch.nearbyDetails?.schools?.places).toMatchObject([{ name: "Example School", distance: "1 km" }]);
    expect(result.patch.nearbyDetails?.hospitals?.places).toMatchObject([{ name: "Example Hospital", distance: "2 km" }]);
    expect(result.patch.reraPhases).toMatchObject([{ name: "Regent Park Main Phase", reraNumber: "PRM/KA/RERA/1251/308/PR/150726/008810" }]);
    expect(result.patch.projectArea).toMatchObject({ totalAcres: 8.07 });
    expect(result.patch.totalUnits).toBe(534);
    expect(result.patch.totalTowers).toBe(2);
    expect(result.patch.nearbyDetails?.workplaces?.places).toMatchObject([{ name: "Embassy TechVillage" }]);
    expect(result.patch.nearbyDetails?.roads?.places).toMatchObject([{ name: "Sarjapur Road", distance: "2.5 km" }]);
  });

  it("imports matching society, amenities, and nearby sheets from the full Excel template", async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Project Name", "Property Type"], ["Complete Heights", "Apartment"]]), "Properties");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Project Name", "Security", "Water Supply"], ["Complete Heights", "24x7", "Borewell + Cauvery"]]), "Society");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Project Name", "Amenity", "Description", "Status"], ["Complete Heights", "Gymnasium", "Well equipped", "Available"]]), "Amenities");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Project Name", "Category", "Name", "Distance"], ["Complete Heights", "Metro", "Whitefield Metro", "800 m"]]), "Nearby Places");
    const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const result = await parsePropertyExcel({ name: "complete.xlsx", size: bytes.byteLength, arrayBuffer: async () => bytes } as File);
    expect(result.patch.society).toMatchObject({ security: "24x7", waterSupply: "Borewell + Cauvery" });
    expect(result.patch.facilities).toMatchObject([{ name: "Gymnasium", description: "Well equipped", status: "Available" }]);
    expect(result.patch.nearbyDetails?.metro?.places).toMatchObject([{ name: "Whitefield Metro", distance: "800 m" }]);
  });
});
