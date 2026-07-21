import { describe, expect, it } from "vitest";
import { initialCommercialDetails, prepareCommercialPropertyPayload, validateCommercialDraft } from "@/lib/commercialDetails";

describe("commercial details", () => {
  it("derives commercial summary fields", () => {
    const details = initialCommercialDetails(); details.superArea = "2400 sqft"; details.floor = "5";
    const result = prepareCommercialPropertyPayload({ propertyType: "Commercial", configs: [], price: "₹2.4 Cr", area: "", commercialDetails: details, possessionDetails: { status: "Ready to Move", launchDate: "2025-01-15" } });
    expect(result.area).toBe("2400 sqft"); expect(result.configs).toEqual(["Office Space"]);
  });
  it("requires shop frontage", () => {
    const details = initialCommercialDetails(); details.commercialSubtype = "Shop/Showroom"; details.superArea = "1000 sqft"; details.floor = "1";
    expect(validateCommercialDraft({ commercialDetails: details, builder: "Builder", transactionType: "New Property", listingType: "For Sale", possessionDetails: { status: "Ready to Move", launchDate: "2025-01-15" } }).frontage).toBeTruthy();
  });
});
