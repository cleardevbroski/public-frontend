import { describe, expect, it } from "vitest";
import { getHomepageSections, isInHomepageSection } from "../homepagePlacements";

describe("homepage placements", () => {
  it("reads multiple section assignments", () => {
    const property = {
      homepageSections: ["Handpicked", "Offers"],
      websiteSection: "None",
    };

    expect(getHomepageSections(property)).toEqual(["Handpicked", "Offers"]);
    expect(isInHomepageSection(property, "Offers")).toBe(true);
  });

  it("keeps legacy single-section placements visible without duplicates", () => {
    expect(
      getHomepageSections({
        homepageSections: ["Handpicked"],
        websiteSection: "Handpicked",
      })
    ).toEqual(["Handpicked"]);

    expect(
      getHomepageSections({
        homepageSections: [],
        websiteSection: "Search Trends",
      })
    ).toEqual(["Search Trends"]);
  });
});
