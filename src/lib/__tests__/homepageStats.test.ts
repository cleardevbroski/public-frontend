import { describe, expect, it } from "vitest";
import { getHomepageStats } from "../homepageStats";
import type { Property } from "@/components/acres/mock-data";

const property = (overrides: Partial<Property>): Property => ({
  id: "property",
  title: "Project",
  subtitle: "Bangalore",
  price: "1 Cr",
  configs: [],
  area: "",
  image: "",
  propertyType: "Apartment",
  published: true,
  ...overrides,
});

describe("homepage live statistics", () => {
  it("counts each published project once per BHK bucket, including half BHK values", () => {
    const stats = getHomepageStats([
      property({ id: "one", configs: ["2 BHK", "2.5 BHK"] }),
      property({ id: "two", configs: ["3.5 BHK"] }),
      property({ id: "hidden", configs: ["2 BHK"], published: false }),
    ]);

    expect(stats.publishedCount).toBe(2);
    expect(stats.bhk.map((item) => [item.label, item.count])).toEqual([["2 BHK", 1], ["3 BHK", 1]]);
  });

  it("uses real possession status and legacy possession values", () => {
    const stats = getHomepageStats([
      property({ id: "ready", possessionDetails: { status: "Ready to Move" } }),
      property({ id: "legacy-ready", possession: "Ready to Move" }),
      property({ id: "future", possessionDetails: { status: "Under Construction", expectedCompletionDate: "2099-06" } }),
    ]);

    expect(stats.possession.find((item) => item.label === "Ready to move")?.count).toBe(2);
    expect(stats.possession.find((item) => item.label === "Possession in 2099")?.count).toBe(1);
  });
});
