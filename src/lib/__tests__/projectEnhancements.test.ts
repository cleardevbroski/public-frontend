import { describe, expect, it } from "vitest";
import type { Property } from "@/components/acres/mock-data";
import {
  calculateUnitPriceRange,
  convertAreaRange,
  formatAreaMeasurement,
  formatAreaValue,
  formatAreaRange,
  formatInrUnitRate,
  formatPossessionDateOnly,
  parseAreaRange,
  parseInrPriceRange,
  projectFaqs,
  propertyAreaRange,
  propertyDensity,
  rankComparableProperties,
} from "../projectEnhancements";

const property = (overrides: Partial<Property> = {}): Property => ({
  id: "current",
  title: "Current Project",
  subtitle: "Whitefield, Bangalore",
  price: "₹1.20 Cr - 2.20 Cr",
  configs: ["2 BHK", "3 BHK"],
  configurationDetails: [
    { configuration: "3 BHK", price: "₹2.2 Cr", carpetArea: "1800 sq ft", builtUpArea: "2000 sq ft", bedrooms: 3, bathrooms: 3, balconies: 2, facings: ["East"] },
    { configuration: "2 BHK", price: "₹1.2 Cr", carpetArea: "1100 sq ft", builtUpArea: "1200 sq ft", bedrooms: 2, bathrooms: 2, balconies: 1, facings: ["North"] },
  ],
  area: "1200 - 2000 sq ft",
  propertyType: "Apartment",
  locality: { city: "Bangalore", zone: "Whitefield" },
  possessionDetails: { status: "Under Construction", expectedCompletionDate: "2029-11" },
  possession: "Under Construction",
  image: "",
  ...overrides,
});

describe("project enhancements", () => {
  it("derives an unordered configuration range and converts display units", () => {
    const range = propertyAreaRange(property());
    expect(range).toEqual([1200, 2000]);
    expect(formatAreaRange(range, "sqft")).toBe("1,200 to 2,000 Sq. Ft.");
    expect(formatAreaRange(range, "sqm")).toBe("111.48 to 185.81 Sq. Metre");
    expect(formatAreaRange(range, "sqyd")).toBe("133.33 to 222.22 Sq. Yard");
  });

  it("converts 1097 square feet to the requested display units", () => {
    const area = parseAreaRange("1,097");
    expect(area).toMatchObject({ min: 1097, max: 1097, sourceUnit: "sqft" });
    expect(formatAreaMeasurement(area!, "sqft")).toBe("1,097 Sq. Ft.");
    expect(formatAreaMeasurement(area!, "sqm")).toBe("101.91 Sq. Metres");
    expect(formatAreaMeasurement(area!, "sqyd")).toBe("121.89 Sq. Yards");
    expect(formatAreaValue(area!, "sqm")).toBe("101.91");
  });

  it("normalizes explicit square metre and square yard inputs back to square feet", () => {
    expect(convertAreaRange(parseAreaRange("101.91463488 sq.m")!, "sqft").min).toBeCloseTo(1097, 5);
    expect(convertAreaRange(parseAreaRange("121.88888889 sq yards")!, "sqft").min).toBeCloseTo(1097, 5);
  });

  it("calculates exact base-price rates in all three units", () => {
    const area = parseAreaRange("1097")!;
    const price = parseInrPriceRange("₹1.21 Cr")!;
    expect(formatInrUnitRate(calculateUnitPriceRange(price, area, "sqft")!, "sqft")).toBe("₹11,030 / Sq. Ft.");
    expect(formatInrUnitRate(calculateUnitPriceRange(price, area, "sqm")!, "sqm")).toBe("₹1,18,727 / Sq. Metres");
    expect(formatInrUnitRate(calculateUnitPriceRange(price, area, "sqyd")!, "sqyd")).toBe("₹99,271 / Sq. Yards");
  });

  it("uses valid mathematical bounds for price and area ranges", () => {
    const area = parseAreaRange("1174-1756")!;
    const price = parseInrPriceRange("1.21 - 1.65 Cr")!;
    const rate = calculateUnitPriceRange(price, area, "sqft")!;
    expect(rate.min).toBeCloseTo(12_100_000 / 1756, 5);
    expect(rate.max).toBeCloseTo(16_500_000 / 1174, 5);
  });

  it("fails safely for missing, zero, and invalid values", () => {
    expect(parseAreaRange("not supplied")).toBeUndefined();
    expect(parseAreaRange("0 sqft")).toBeUndefined();
    expect(parseInrPriceRange("Price on request")).toBeUndefined();
  });

  it("shows only the possession date in the hero formatter", () => {
    expect(formatPossessionDateOnly(property())).toBe("Nov 2029");
    expect(formatPossessionDateOnly(property({ possessionDetails: { status: "Ready to Move", launchDate: "2026-07-31" } }))).toBe("31 Jul 2026");
  });

  it("ranks same-city comparable projects deterministically and excludes unpublished rows", () => {
    const close = property({ id: "close", title: "A Close Match", builder: "Builder A" });
    const distant = property({ id: "distant", title: "B Distant Match", locality: { city: "Bangalore", zone: "Hebbal" }, configs: ["4 BHK"], price: "₹5 Cr", area: "4000 sq ft", configurationDetails: undefined });
    const hidden = property({ id: "hidden", title: "Hidden", published: false });
    const results = rankComparableProperties(property(), [hidden, distant, close]);
    expect(results.map((row) => row.property.id)).toEqual(["close", "distant"]);
    expect(results[0].reasons).toContain("same locality");
  });

  it("calculates density only with complete data and builds grounded fallback FAQs", () => {
    const complete = property({ totalUnits: 638, projectArea: { totalAcres: 12.7, openSpaceAcres: 5, builtUpAcres: 7.7 }, builder: "Example Builder", reraRegistered: true, reraNumber: "PRM/KA/12345678" });
    expect(propertyDensity(complete)).toBe("50 Units/Acre");
    expect(propertyDensity(property())).toBe("Not provided");
    const answers = projectFaqs(complete).map((faq) => faq.answer).join(" ");
    expect(answers).toContain("Example Builder");
    expect(answers).toContain("PRM/KA/12345678");
    expect(answers).not.toContain("undefined");
  });
});
