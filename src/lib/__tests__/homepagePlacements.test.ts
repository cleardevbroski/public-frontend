import { describe, expect, it } from "vitest";
import {
  getBangaloreZone,
  getHandpickedProjectsByZone,
  getHomepageSections,
  isInHomepageSection,
} from "../homepagePlacements";
import type { Property } from "@/components/acres/mock-data";

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

  it("normalizes supported Bangalore zone labels", () => {
    expect(getBangaloreZone("East")).toBe("East");
    expect(getBangaloreZone("Bangalore West")).toBe("West");
    expect(getBangaloreZone("South Bangalore")).toBe("South");
    expect(getBangaloreZone("Central")).toBeNull();
  });

  it("returns only published handpicked sale projects for the selected zone", () => {
    const property = (overrides: Partial<Property>): Property => ({
      id: "property",
      title: "Test project",
      subtitle: "Bangalore",
      price: "1 Cr",
      configs: [],
      area: "",
      image: "",
      homepageSections: ["Handpicked"],
      locality: { zone: "East" },
      published: true,
      propertyType: "Apartment",
      ...overrides,
    });
    const east = property({ id: "east" });
    const west = property({ id: "west", locality: { zone: "West" } });
    const hidden = property({ id: "hidden", published: false });
    const notHandpicked = property({ id: "regular", homepageSections: [] });
    const rental = property({ id: "rental", propertyType: "Rent" });

    expect(getHandpickedProjectsByZone([east, west, hidden, notHandpicked, rental], "East"))
      .toEqual([east]);
  });
});
