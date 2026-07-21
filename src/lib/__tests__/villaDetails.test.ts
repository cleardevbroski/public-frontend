import { describe, expect, it } from "vitest";
import type { Property } from "@/components/acres/mock-data";
import { formatPossession } from "@/lib/propertyDetails";
import {
  createVillaConfigurationDetail,
  initialVillaDetails,
  prepareVillaPropertyPayload,
  validateVillaDraft,
  villaDisplayRange,
} from "@/lib/villaDetails";

function villa(): Partial<Property> {
  const details = initialVillaDetails();
  details.villaType = "Row Villa";
  details.plotFacing = "East";
  details.plotDimensions = "40 ft × 60 ft";
  details.numberOfFloors = "G+2";
  details.privateGarden = true;
  details.privateGardenArea = "400 sqft";
  details.configurationDetails = [
    { ...createVillaConfigurationDetail("3 BHK"), price: "₹95 L", plotArea: "2400 sqft", builtUpArea: "3200 sqft", superArea: "3600 sqft" },
    { ...createVillaConfigurationDetail("4 BHK"), price: "₹2.80 Cr", plotArea: "3000 sqft", builtUpArea: "4100 sqft", superArea: "4600 sqft" },
  ];
  return {
    propertyType: "Villa",
    title: "Windmills Villa Estate",
    subtitle: "Sarjapur Road, Bangalore",
    configs: ["3 BHK", "4 BHK"],
    villaDetails: details,
    possessionDetails: { status: "Under Construction", expectedCompletionDate: "2028-12-01" },
    builder: "Total Environment",
    transactionType: "New Property",
    listingType: "For Sale",
  };
}

describe("Villa property helpers", () => {
  it("creates rows from normalized BHK values", () => {
    expect(createVillaConfigurationDetail("4 BHK")).toMatchObject({ configuration: "4 BHK", bedrooms: 4, bathrooms: 4 });
  });

  it("orders mixed lakh/crore prices and derives compatibility summaries", () => {
    const draft = villa();
    expect(villaDisplayRange(draft.villaDetails?.configurationDetails, "price")).toBe("₹95 L - ₹2.80 Cr");
    const payload = prepareVillaPropertyPayload(draft);
    expect(payload.configs).toEqual(["3 BHK", "4 BHK"]);
    expect(payload.price).toBe("₹95 L - ₹2.80 Cr");
    expect(payload.area).toBe("3600 sqft - 4600 sqft");
    expect(payload.bedrooms).toBe(3);
    expect(payload.facing).toBe("East");
  });

  it("reports row, bedroom, garden, possession, builder, and RERA errors", () => {
    const draft = villa();
    draft.villaDetails!.configurationDetails[0].bedrooms = 2;
    draft.villaDetails!.configurationDetails[0].plotArea = "";
    draft.villaDetails!.privateGardenArea = "";
    draft.possessionDetails = { status: "Under Construction", expectedCompletionDate: "" };
    draft.builder = "";
    draft.reraRegistered = true;
    draft.reraNumber = "bad value";
    const errors = validateVillaDraft(draft);
    expect(errors["villaConfiguration.3 BHK.bedrooms"]).toBeTruthy();
    expect(errors["villaConfiguration.3 BHK.plotArea"]).toBeTruthy();
    expect(errors.privateGardenArea).toBeTruthy();
    expect(errors.possessionDate).toBeTruthy();
    expect(errors.builder).toBeTruthy();
    expect(errors.reraNumber).toBeTruthy();
  });

  it("uses Villa-specific Ready Since possession wording", () => {
    expect(formatPossession({ propertyType: "Villa", possessionDetails: { status: "Ready to Move", launchDate: "2024-01-15" } })).toBe("Ready to move · Ready since 15 Jan 2024");
  });
});
