import { describe, expect, it } from "vitest";
import { analyzePropertyDescription } from "@/lib/propertyQuickFill";

describe("modern property description templates", () => {
  it("imports repeatable RERA phases and complete project content", () => {
    const result = analyzePropertyDescription(`[PROPERTY BASICS]
Property Type: Apartment
Project / Property Name: Complete Heights
Builder / Developer: Complete Builder
Transaction Type: New Property
Listing Type: For Sale
Description: A verified apartment description with enough source information for publication.
Possession Status: Under Construction
Expected Completion Month: 2030-12

[DEVELOPER DETAILS]
Developer Name: Complete Builder
About Developer: Verified developer history and delivery record.

[RERA]
RERA Registered: Yes

[RERA PHASE]
Phase Name: North Phase
RERA Number: PRM/KA/RERA/NORTH001
RERA Website: https://rera.karnataka.gov.in/viewAllProjects

[RERA PHASE]
Phase Name: South Phase
RERA Number: PRM/KA/RERA/SOUTH002
RERA Website: https://rera.karnataka.gov.in/viewAllProjects

[CONFIGURATION]
Configuration Name: 2 BHK
Price: ₹1.20 Cr
Built-up Area: 1200 sqft
Carpet Area: 900 sqft
Bedrooms: 2
Bathrooms: 2
Balconies: 1
Facings: East, North-East

[PROJECT INTRODUCTION]
Paragraph: First verified introduction.
Paragraph: Second verified introduction.

[PROJECT USPS]
USP: Low-density development.
USP: Metro connectivity.

[WHY INVEST]
Reason: Strong employment corridor.

[LOCATION ADVANTAGES]
Advantage: Ten minutes from the metro.

[PROJECT KEY DETAIL]
Label: Architecture
Value: Contemporary design

[PROJECT FEATURE GROUP]
Group Title: Outdoor spaces
Item: Central garden
Item: Walking trail

[MASTER PLAN]
Master Plan Section Title: Complete Heights Master Plan
Verified Master Plan Description: Verified planning summary.

[MASTER PLAN DETAIL]
Section Title: Central zone
Section Description: Contains the clubhouse and landscaped court.

[FAQ]
Question: What configurations are available?
Answer: Verified 2 BHK homes are available.`);

    expect(result.patch.reraPhases).toHaveLength(2);
    expect(result.patch.reraPhases?.map((phase) => phase.name)).toEqual(["North Phase", "South Phase"]);
    expect(result.patch.configurationDetails?.[0].facings).toEqual(["East", "North-East"]);
    expect(result.patch.projectNarrative).toMatchObject({ introduction: ["First verified introduction.", "Second verified introduction."], usps: ["Low-density development.", "Metro connectivity."], investmentReasons: ["Strong employment corridor."], locationAdvantage: ["Ten minutes from the metro."] });
    expect(result.patch.masterPlan).toMatchObject({ title: "Complete Heights Master Plan", summary: "Verified planning summary.", sections: [{ heading: "Central zone", body: "Contains the clubhouse and landscaped court." }] });
    expect(result.patch.developerDescription).toBe("Verified developer history and delivery record.");
    expect(result.patch.faqs).toHaveLength(1);
  });

  it("imports numbered apartment configuration blocks and descriptive BHK labels", () => {
    const result = analyzePropertyDescription(`[PROPERTY BASICS]
Property Type: Apartment
Project / Property Name: Configuration Heights
Transaction Type: New Property
Listing Type: For Sale

[CONFIGURATION 1]
Configuration Name: 2 BHK Apartment
Price: ₹1.20 Cr
Built-up Area: 1200 Sq. Ft.
Carpet Area: 900 Sq. Ft.
Bedrooms: 2
Bathrooms: 2
Balconies: 1
Facings: East, North-East

[CONFIGURATION #2]
BHK Configuration: 3BHK Premium Home
Price: ₹1.65 Cr
Built-up Area: 1550 Sq. Ft.
Carpet Area: 1180 Sq. Ft.
Bedrooms: 3
Bathrooms: 3
Balconies: 2
Facings: West`);

    expect(result.patch.configs).toEqual(["2 BHK", "3 BHK"]);
    expect(result.patch.configurationDetails).toMatchObject([
      {
        configuration: "2 BHK",
        price: "₹1.20 Cr",
        builtUpArea: "1200 Sq. Ft.",
        carpetArea: "900 Sq. Ft.",
        bedrooms: 2,
        bathrooms: 2,
        balconies: 1,
        facings: ["East", "North-East"],
      },
      {
        configuration: "3 BHK",
        price: "₹1.65 Cr",
        builtUpArea: "1550 Sq. Ft.",
        carpetArea: "1180 Sq. Ft.",
        bedrooms: 3,
        bathrooms: 3,
        balconies: 2,
        facings: ["West"],
      },
    ]);
    expect(result.fields).toContainEqual({ label: "Apartment configurations", value: "2" });
  });

  it("does not report empty configuration or RERA blocks as imported", () => {
    const result = analyzePropertyDescription(`[PROPERTY BASICS]
Property Type: Apartment
Transaction Type: New Property

[RERA PHASE]
Phase Name:
RERA Number:
RERA Website:

[CONFIGURATION]
Configuration Name:
BHK:
Price:`);

    expect(result.patch.configurationDetails).toEqual([]);
    expect(result.patch.reraPhases).toEqual([]);
    expect(result.fields.map((field) => field.label)).not.toContain("Apartment configurations");
    expect(result.fields.map((field) => field.label)).not.toContain("RERA phases recognized");
  });

  it("imports repeatable Plot size and inventory blocks", () => {
    const result = analyzePropertyDescription(`[PROPERTY BASICS]
Property Type: Plot
Project / Property Name: Green Layout
Builder / Developer: Green Developer
Transaction Type: New Property
Listing Type: For Sale

[PLOT DETAILS]
Total Plots: 2
Approval Authority: BMRDA
Approval Number: BMRDA/001
Road Width: 30 ft
Underground Drainage: Ready
Electricity: Ready
Water: Under Development
Layout Possession Status: Under Development
Expected Completion Month: 2030-12

[PLOT SIZE]
Plot Dimensions: 30 × 40
Price Per Sqft: 8500
Facings: East, North

[PLOT INVENTORY ITEM]
Plot Number: A-01
Plot Dimensions: 30 × 40
Facing: East
Status: Available
Corner Plot: Yes

[PLOT INVENTORY ITEM]
Plot Number: A-02
Plot Dimensions: 30 × 40
Facing: North
Status: Booked
Corner Plot: No`);

    expect(result.patch.configs).toEqual(["30 × 40"]);
    expect(result.patch.plotDetails).toMatchObject({ totalPlots: 2, approvalNumber: "BMRDA/001", plotSizeDetails: [{ plotSize: "30 × 40", pricePerSqft: 8500, facings: ["East", "North"] }], inventory: [{ plotNumber: "A-01", facing: "East", status: "Available", isCorner: true }, { plotNumber: "A-02", facing: "North", status: "Booked", isCorner: false }] });
  });

  it("imports Commercial and PG type-specific blocks", () => {
    const commercial = analyzePropertyDescription(`[PROPERTY BASICS]
Property Type: Commercial
Project / Property Name: Work Hub
Builder / Developer: Work Builder
Transaction Type: New Property
Listing Type: For Rent
Possession Status: Ready to Move
Ready Date: 2026-01-10

[COMMERCIAL DETAILS]
Commercial Subtype: Office Space
Zone Type: Non-SEZ
Built-up Area: 5000 sqft
Floor: 3
Total Floors: 12
Seating Capacity: 80
Cabins: 5
Meeting Rooms: 3
Building Grade: Grade A
Pantry: Private Pantry
Furnishing: Fully Furnished`);
    expect(commercial.patch.commercialDetails).toMatchObject({ commercialSubtype: "Office Space", zoneType: "Non-SEZ", builtUpArea: "5000 sqft", floor: "3", totalFloors: 12, seatingCapacity: 80, cabins: 5, meetingRooms: 3 });

    const pg = analyzePropertyDescription(`[PROPERTY BASICS]
Property Type: PG/Co-living
Project / Property Name: Urban Nest
Operator / Developer: Urban Living
Listing Type: For Rent

[PG DETAILS]
Gender Preference: Co-ed
Available From: 2026-09-01
Meals Included: Breakfast + Dinner
Food Type: Veg + Non-veg
Wi-Fi Included: Yes
Laundry Included: Yes
Laundry Schedule: Twice weekly
Contact Type: Company-run

[PG SHARING OPTION]
Sharing Type: Double sharing
Rent Per Bed: 14000
Deposit: 28000
Beds Available: 8

[PG SHARING OPTION]
Sharing Type: Triple sharing
Rent Per Bed: 11000
Deposit: 22000
Beds Available: 6`);
    expect(pg.patch.builder).toBe("Urban Living");
    expect(pg.patch.pgDetails).toMatchObject({ genderPreference: "Co-ed", availableFrom: "2026-09-01", laundryIncluded: true, laundrySchedule: "Twice weekly", sharingDetails: [{ sharingType: "Double sharing", rentPerBed: 14000, deposit: 28000, bedsAvailable: 8 }, { sharingType: "Triple sharing", rentPerBed: 11000, deposit: 22000, bedsAvailable: 6 }] });
  });
});
