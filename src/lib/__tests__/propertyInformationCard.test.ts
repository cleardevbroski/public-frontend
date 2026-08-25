import { describe, expect, it } from "vitest";
import { getPropertyLedgerInformation } from "@/components/acres/VillaPropertyInformationCard";
import type { Property } from "@/components/acres/mock-data";

const property = {
  id: "property-1",
  title: "Test Property",
  subtitle: "Bangalore",
  price: "₹4.29 Cr - ₹4.42 Cr + Charges",
  area: "",
  image: "",
  configs: ["3 BHK", "4 BHK"],
  propertyType: "Apartment",
  possessionDetails: { status: "New Launch", launchDate: "2026-08-01" },
  projectArea: { totalAcres: 12.45, builtUpAcres: 6.2, openSpaceAcres: 4.1, amenitiesAcres: 2.15 },
  totalUnits: 184,
} as Property;

describe("getPropertyLedgerInformation", () => {
  it("maps submitted project values into six labelled summary items", () => {
    expect(getPropertyLedgerInformation(property)).toEqual({
      items: [
        { key: "price", label: "Price", value: "₹4.29 Cr - ₹4.42 Cr", showCharges: true },
        { key: "propertyType", label: "Project Type", value: "Apartment" },
        { key: "area", label: "Total Land Area", value: "12.45 acres" },
        { key: "configuration", label: "Unit Variants", value: "3 BHK, 4 BHK" },
        { key: "availability", label: "Possession", value: "New Launch" },
        { key: "scale", label: "Total Units", value: "184" },
      ],
      landBreakdown: [
        { label: "Building area", value: "6.2 acres" },
        { label: "Empty / open space", value: "4.1 acres" },
        { label: "Amenities area", value: "2.15 acres" },
      ],
    });
  });

  it("omits missing land-breakdown values instead of adding placeholders", () => {
    const result = getPropertyLedgerInformation({ ...property, projectArea: { totalAcres: 12.45 } });
    expect(result.landBreakdown).toEqual([]);
    expect(JSON.stringify(result)).not.toContain("Not provided");
  });

  it("uses property-type-specific alternatives when the main summary values are absent", () => {
    const result = getPropertyLedgerInformation({
      ...property,
      price: "",
      configs: [],
      possessionDetails: undefined,
      projectArea: undefined,
      totalUnits: undefined,
      propertyType: "Plot",
      plotDetails: {
        plotSizeDetails: [{ plotSize: "30 × 40", width: 30, length: 40, areaSqft: 1200, pricePerSqft: 5000, totalPrice: 6_000_000, facings: ["East"] }],
        totalPlots: 48,
        approvalAuthority: "BMRDA",
        civicInfrastructure: { undergroundDrainage: "Ready", electricity: "Ready", water: "Ready" },
        layoutMapUrl: "",
        layoutMapType: "image",
        layoutPossession: { status: "Layout Ready", readyDate: "2026-08-01" },
        inventory: [],
      },
    });

    expect(result.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "price", value: "₹60 L" }),
      expect.objectContaining({ key: "area", label: "Plot Area", value: "1,200 sq. ft." }),
      expect.objectContaining({ key: "configuration", label: "Plot Sizes", value: "30 × 40" }),
      expect.objectContaining({ key: "availability", value: "Layout Ready" }),
      expect.objectContaining({ key: "scale", label: "Total Plots", value: "48" }),
    ]));
  });

  it("returns no summary facts when no real values exist", () => {
    const result = getPropertyLedgerInformation({ ...property, price: "", propertyType: "", configs: [], possessionDetails: undefined, projectArea: undefined, totalUnits: undefined });
    expect(result.items).toEqual([]);
    expect(result.landBreakdown).toEqual([]);
  });
});
