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
  it("maps only the approved project-ledger values", () => {
    expect(getPropertyLedgerInformation(property)).toEqual({
      price: "₹4.29 Cr - ₹4.42 Cr",
      projectType: "Apartment",
      totalLandArea: "12.45 acres",
      unitVariants: "3 BHK, 4 BHK",
      possession: "New Launch",
      totalUnits: "184",
      landBreakdown: {
        buildingArea: "6.2 acres",
        openSpaceArea: "4.1 acres",
        amenitiesArea: "2.15 acres",
      },
    });
  });

  it("never invents missing land-breakdown values", () => {
    const result = getPropertyLedgerInformation({ ...property, projectArea: { totalAcres: 12.45 } });
    expect(result.landBreakdown).toEqual({
      buildingArea: "Not provided",
      openSpaceArea: "Not provided",
      amenitiesArea: "Not provided",
    });
  });
});
