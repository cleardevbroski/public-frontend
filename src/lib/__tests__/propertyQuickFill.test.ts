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
School 1 Landmark: Near Central Avenue
Hospital 1 Name: Example Hospital
Hospital 1 Distance: 2 km
Workplace 1 Name: Embassy TechVillage
Workplace 1 Distance: Not provided
Road 1 Name: Sarjapur Road
Road 1 Distance: 2.5 km`, "Apartment");
    expect(result.patch.configurationDetails?.[0]).toMatchObject({ configuration: "3.5 BHK", bedrooms: 3, carpetArea: "1200 sqft", facings: ["East"] });
    expect(result.patch.society).toMatchObject({ security: "24x7 security", lift: "2 lifts" });
    expect(result.patch.facilities).toMatchObject([{ name: "Swimming Pool", description: "Temperature controlled pool", status: "Available" }]);
    expect(result.patch.nearbyDetails?.schools?.places).toMatchObject([{ name: "Example School", distance: "1 km", landmark: "Near Central Avenue" }]);
    expect(result.patch.nearbyDetails?.hospitals?.places).toMatchObject([{ name: "Example Hospital", distance: "2 km" }]);
    expect(result.patch.reraPhases).toMatchObject([{ name: "Regent Park Main Phase", reraNumber: "PRM/KA/RERA/1251/308/PR/150726/008810" }]);
    expect(result.patch.projectArea).toMatchObject({ totalAcres: 8.07 });
    expect(result.patch.totalUnits).toBe(534);
    expect(result.patch.totalTowers).toBe(2);
    expect(result.patch.nearbyDetails?.workplaces?.places).toMatchObject([{ name: "Embassy TechVillage" }]);
    expect(result.patch.nearbyDetails?.roads?.places).toMatchObject([{ name: "Sarjapur Road", distance: "2.5 km" }]);
  });

  it("imports descriptive Villa configurations and optional inventory fields", () => {
    const result = analyzePropertyDescription(`[PROPERTY BASICS]
Property Type: Villa
Project / Property Name: Sobha Galera
Builder / Developer: Sobha Limited
Transaction Type: New Property
Listing Type: For Sale
Possession Status: Under Construction
Expected Completion / Ready Date: Dec 2026

[CONFIGURATIONS]
Configuration 1:
BHK: 4 BHK Duplex (G+1)
Price: ₹ 5.25 Cr
Built-up Area: 3009 Sq. Ft.
Carpet Area: 2443 Sq. Ft.
Super Area: 3009 Sq. Ft.
Bedrooms: 4
Bathrooms: 4
Balconies: 2

Configuration 2:
BHK: 4 BHK Triplex (G+2)
Price: ₹ 7.57 Cr
Built-up Area: 4340 Sq. Ft.
Carpet Area: 3348 Sq. Ft.
Super Area: 4340 Sq. Ft.
Bedrooms: 4
Bathrooms: 4
Balconies: 3

[VILLA DETAILS — only for Villa]
Villa Type: Spanish-Style Row House (Duplex / Triplex)
Number of Floors: G+1 (Duplex) / G+2 (Triplex)
Road Width: 9.10 M to 10.50 M
Private Garden: Yes
Garden Area: Built-in private garden per unit
Private Pool: No
Terrace: Yes
Gated Community: Yes`);

    expect(result.patch.configs).toEqual(["4 BHK Duplex (G+1)", "4 BHK Triplex (G+2)"]);
    expect(result.patch.villaDetails).toMatchObject({
      villaType: "Row Villa",
      numberOfFloors: "",
      roadWidthFacing: "9.10 M to 10.50 M",
      privateGarden: true,
      privateGardenArea: "",
      terrace: true,
      gatedCommunity: true,
      configurationDetails: [
        { configuration: "4 BHK Duplex (G+1)", bhk: "4 BHK", unitVariant: "Duplex", numberOfFloors: "G+1", builtUpArea: "3009 Sq. Ft.", carpetArea: "2443 Sq. Ft.", superArea: "3009 Sq. Ft.", bedrooms: 4, bathrooms: 4, balconies: 2 },
        { configuration: "4 BHK Triplex (G+2)", bhk: "4 BHK", unitVariant: "Triplex", numberOfFloors: "G+2", builtUpArea: "4340 Sq. Ft.", carpetArea: "3348 Sq. Ft.", superArea: "4340 Sq. Ft.", bedrooms: 4, bathrooms: 4, balconies: 3 },
      ],
    });
  });

  it("imports and merges multiple RERA phases, developer copy, and human-readable project content", () => {
    const result = analyzePropertyDescription(`[PROPERTY BASICS]
Property Type: Villa
Project / Property Name: Complete Project
RERA Registered: Yes

[DEVELOPER DETAILS]
Developer Name: Complete Developer
About Developer: A verified developer profile covering history and expertise.

[RERA PHASES]
Phase 1 Name: North Phase
Phase 1 RERA Number: PRM/KA/RERA/NORTH001
Phase 1 RERA URL: https://rera.karnataka.gov.in/viewAllProjects

[RERA PHASES]
Phase 2 Name: South Phase
Phase 2 RERA Number: PRM/KA/RERA/SOUTH002
Phase 2 RERA URL: https://rera.karnataka.gov.in/viewAllProjects

[PROJECT NARRATIVE]
Introduction Paragraph 1: A verified introduction.
USP 1: Low-density development.
Location Advantage 1: Close to the technology corridor.
Investment Reason 1: Limited inventory.

[PROJECT KEY DETAILS]
Detail 1 Label: Architecture
Detail 1 Value: Spanish inspired

[PROJECT FEATURE GROUPS]
Group 1 Title: Outdoor Spaces
Group 1 Item 1: Central avenue
Group 1 Item 2: Private gardens

[MASTER PLAN CONTENT]
Title: Complete Master Plan
Summary: A verified master-plan summary.
Section 1 Heading: Central Zone
Section 1 Body: Clubhouse and landscaped avenue.

[FAQS]
FAQ 1 Question: Is the project RERA registered?
FAQ 1 Answer: Yes, under two registered phases.

[CONFIGURATIONS]
Configuration 1:
BHK: 4 BHK Duplex (G+1)

[VILLA DETAILS — only for Villa]
Villa Type: Row Villa`);

    expect(result.patch).toMatchObject({
      builder: "Complete Developer",
      developerDescription: "A verified developer profile covering history and expertise.",
      reraRegistered: true,
      reraPhases: [
        { name: "North Phase", reraNumber: "PRM/KA/RERA/NORTH001" },
        { name: "South Phase", reraNumber: "PRM/KA/RERA/SOUTH002" },
      ],
      projectNarrative: {
        introduction: ["A verified introduction."],
        usps: ["Low-density development."],
        keyDetails: [{ label: "Architecture", value: "Spanish inspired" }],
        featureGroups: [{ title: "Outdoor Spaces", items: ["Central avenue", "Private gardens"] }],
      },
      masterPlan: { title: "Complete Master Plan", summary: "A verified master-plan summary.", sections: [{ heading: "Central Zone", body: "Clubhouse and landscaped avenue." }] },
      faqs: [{ question: "Is the project RERA registered?", answer: "Yes, under two registered phases." }],
    });

    const merged = mergeQuickFill({
      reraRegistered: false,
      reraPhases: [{ name: "North Phase", reraNumber: "", reraSiteUrl: "https://rera.karnataka.gov.in/viewAllProjects", reraDocuments: [], projectDocuments: [] }],
      masterPlan: { imageUrl: "existing-master-plan.jpg" },
      faqs: [{ question: "Existing question?", answer: "Existing answer." }],
    }, result.patch, false);
    expect(merged.reraRegistered).toBe(true);
    expect(merged.reraPhases).toHaveLength(2);
    expect(merged.reraPhases[0].reraNumber).toBe("PRM/KA/RERA/NORTH001");
    expect(merged.masterPlan).toMatchObject({ imageUrl: "existing-master-plan.jpg", title: "Complete Master Plan" });
    expect(merged.faqs).toHaveLength(2);
  });

  it("imports the repeatable project-content Excel sheets", async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Project Name", "Property Type", "Builder", "Developer Description"],
      ["Excel Content Project", "Villa", "Excel Developer", "Verified Excel developer profile"],
    ]), "Properties");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Project Name", "Configuration Name"], ["Excel Content Project", "Penthouse"],
    ]), "Configurations");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Project Name", "Phase Name", "RERA Number", "RERA URL"],
      ["Excel Content Project", "Phase 1", "PRM/KA/RERA/EXCEL001", "https://rera.karnataka.gov.in/viewAllProjects"],
      ["Excel Content Project", "Phase 2", "PRM/KA/RERA/EXCEL002", "https://rera.karnataka.gov.in/viewAllProjects"],
    ]), "RERA Phases");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Project Name", "Introduction Paragraphs", "USPs"], ["Excel Content Project", "Intro one | Intro two", "USP one | USP two"],
    ]), "Project Narrative");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Project Name", "Title", "Summary", "Section Heading", "Section Body"], ["Excel Content Project", "Master Plan", "Summary", "Zone A", "Zone details"],
    ]), "Master Plan Content");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Project Name", "Question", "Answer"], ["Excel Content Project", "Question?", "Answer."],
    ]), "FAQs");
    const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const result = await parsePropertyExcel({ name: "content.xlsx", size: bytes.byteLength, arrayBuffer: async () => bytes } as File);
    expect(result.patch.developerDescription).toBe("Verified Excel developer profile");
    expect(result.patch.reraPhases).toHaveLength(2);
    expect(result.patch.projectNarrative?.introduction).toEqual(["Intro one", "Intro two"]);
    expect(result.patch.masterPlan).toMatchObject({ title: "Master Plan", sections: [{ heading: "Zone A", body: "Zone details" }] });
    expect(result.patch.faqs).toEqual([{ question: "Question?", answer: "Answer." }]);
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
