import { describe, expect, it } from "vitest";
import { createPlotInventoryItem, createPlotSizeDetail, initialPlotDetails, preparePlotPropertyPayload, validatePlotDraft } from "@/lib/plotDetails";

describe("plot details", () => {
  it("derives plot sizes and public summary values", () => {
    const details = initialPlotDetails();
    details.plotSizeDetails = [{ ...createPlotSizeDetail("30x40"), pricePerSqft: 6500, facings: ["East"] }];
    details.totalPlots = 1;
    details.layoutMapUrl = "https://example.com/map.png";
    details.layoutPossession = { status: "Layout Ready", readyDate: "2025-01-15" };
    details.inventory = [{ ...createPlotInventoryItem("30 × 40"), plotNumber: "A-1", isCorner: true }];
    const result = preparePlotPropertyPayload({ propertyType: "Plot", configs: ["30 × 40"], price: "", area: "", plotDetails: details, badges: [] });
    expect(result.price).toBe("₹78 L");
    expect(result.area).toBe("1200 sqft");
    expect(result.badges).toContain("Corner Plot");
  });

  it("requires map and matching inventory count", () => {
    const details = initialPlotDetails();
    details.plotSizeDetails = [{ ...createPlotSizeDetail("30 × 40"), pricePerSqft: 6500, facings: ["East"] }];
    details.totalPlots = 2;
    const errors = validatePlotDraft({ propertyType: "Plot", configs: ["30 × 40"], plotDetails: details, builder: "Builder", transactionType: "New Property", listingType: "For Sale" });
    expect(errors.layoutMapUrl).toBeTruthy();
    expect(errors.inventory).toBeTruthy();
  });
});
