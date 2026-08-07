import { describe, expect, it } from "vitest";
import { getPropertyInformation } from "@/components/acres/VillaPropertyInformationCard";
import type { Property } from "@/components/acres/mock-data";

const base = {
  id: "property-1",
  title: "Test Property",
  subtitle: "Bangalore",
  price: "₹ 1 Cr + Charges",
  area: "1,000 Sq.Ft.",
  image: "",
  configs: [],
} as Property;

describe("getPropertyInformation", () => {
  it("maps apartment configuration details", () => {
    const info = getPropertyInformation({
      ...base,
      propertyType: "Apartment",
      configurationDetails: [{ configuration: "2 BHK", price: "₹ 95 L", carpetArea: "900 Sq.Ft.", builtUpArea: "1,100 Sq.Ft.", bedrooms: 2, bathrooms: 2, balconies: 1, facings: ["East"] }],
      possessionDetails: { status: "Ready to Move" },
    });
    expect(info.price).toBe("₹ 95 L");
    expect(info.facts.map(({ value }) => value)).toEqual(expect.arrayContaining(["1,100 Sq.Ft.", "2 Bedrooms", "1 Balcony", "Ready to Move"]));
  });

  it("maps plot inventory and approval details", () => {
    const info = getPropertyInformation({
      ...base,
      propertyType: "Plot",
      plotDetails: {
        plotSizeDetails: [{ plotSize: "30 × 40", width: 30, length: 40, areaSqft: 1200, pricePerSqft: 5000, totalPrice: 6_000_000, facings: ["East"] }],
        totalPlots: 2,
        approvalAuthority: "BDA",
        civicInfrastructure: { undergroundDrainage: "Ready", electricity: "Ready", water: "Ready" },
        layoutMapUrl: "",
        layoutMapType: "image",
        layoutPossession: { status: "Layout Ready" },
        inventory: [{ plotNumber: "1", plotSize: "30 × 40", facing: "East", status: "Available", isCorner: false }, { plotNumber: "2", plotSize: "30 × 40", facing: "East", status: "Sold", isCorner: false }],
      },
    });
    expect(info.facts.map(({ value }) => value)).toEqual(expect.arrayContaining(["1,200 Sq.Ft.", "1 of 2", "BDA", "Layout Ready"]));
  });

  it("maps commercial workspace details", () => {
    const info = getPropertyInformation({
      ...base,
      propertyType: "Commercial",
      commercialDetails: { commercialSubtype: "Office Space", builtUpArea: "2,500 Sq.Ft.", floor: "4", totalFloors: 10, zoneType: "Non-SEZ", seatingCapacity: 40, cabins: 3, meetingRooms: 2, buildingGrade: "Grade A", pantry: "Private Pantry", sanctionedLoadKva: 20, furnishing: "Fully Furnished", parking: "2 covered" },
    });
    expect(info.facts.map(({ value }) => value)).toEqual(expect.arrayContaining(["Office Space", "Fully Furnished", "40 seats · 3 cabins", "2 covered"]));
  });

  it("maps PG and co-living occupancy details", () => {
    const info = getPropertyInformation({
      ...base,
      price: "",
      propertyType: "PG/Co-living",
      pgDetails: { genderPreference: "Co-ed", sharingDetails: [{ sharingType: "Double sharing", rentPerBed: 12000, deposit: 24000, bedsAvailable: 4 }], mealsIncluded: "Breakfast + Dinner", foodType: "Veg + Non-veg", wifiIncluded: true, laundryIncluded: true, availableFrom: "2030-01-01", commonAmenities: [], contactType: "PG Manager" },
    });
    expect(info.price).toBe("₹12,000 / month");
    expect(info.facts.map(({ value }) => value)).toEqual(expect.arrayContaining(["Double sharing", "4", "Co-ed", "Breakfast + Dinner"]));
  });
});
