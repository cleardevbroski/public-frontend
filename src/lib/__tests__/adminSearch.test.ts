import { describe, expect, it } from "vitest";
import type { Property } from "@/components/acres/mock-data";
import {
  buildAdminPropertySearchHref,
  matchesAdminSearch,
  matchesPropertyAdminSearch,
} from "@/lib/adminSearch";

const property = (overrides: Partial<Property> = {}): Property => ({
  id: "property-1",
  title: "Sobha Galera",
  subtitle: "Kannamangala, East Bangalore",
  builder: "Sobha Limited",
  propertyType: "Villa",
  price: "₹ 5.25 Cr",
  pricePerSqft: "₹ 15,000 / Sq.Ft.",
  configs: ["4 BHK Duplex (G+1)", "4 BHK Triplex (G+2)"],
  area: "4.08 Acres",
  image: "",
  locality: { city: "Bangalore", zone: "East", address: "Near Whitefield", landmark: "Old Madras Road", pinCode: "560067" },
  reraNumber: "PRM/KA/RERA/1251/446/PR/050123/005601",
  reraPhases: [{ name: "Galera Phase 1", reraNumber: "PRM/KA/RERA/GALERA01", reraDocuments: [], projectDocuments: [] }],
  ...overrides,
});

describe("admin search", () => {
  it("matches property names case-insensitively", () => {
    expect(matchesPropertyAdminSearch(property(), "sobha galera")).toBe(true);
  });

  it("matches location, configuration, builder, property type, pincode, and RERA values", () => {
    const row = property();
    ["whitefield", "duplex g+1", "sobha limited", "villa", "560067", "galera01"].forEach((query) => {
      expect(matchesPropertyAdminSearch(row, query), query).toBe(true);
    });
  });

  it("requires every search word while allowing words from separate fields", () => {
    expect(matchesPropertyAdminSearch(property(), "sobha east villa")).toBe(true);
    expect(matchesPropertyAdminSearch(property(), "sobha west villa")).toBe(false);
  });

  it("safely searches optional and repeated record fields", () => {
    expect(matchesAdminSearch("rahul whitefield", ["Rahul Sharma", undefined, ["Whitefield", "Hebbal"]])).toBe(true);
    expect(matchesAdminSearch("", [undefined])).toBe(true);
  });

  it("builds the dashboard URL used by the global admin search", () => {
    expect(buildAdminPropertySearchHref(" Sobha Galera ")).toBe("/admin?q=Sobha%20Galera");
    expect(buildAdminPropertySearchHref("   ")).toBe("/admin");
  });
});
