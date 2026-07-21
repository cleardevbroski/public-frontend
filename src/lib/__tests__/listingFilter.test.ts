import { describe, it, expect } from "vitest";
import type { Property } from "@/components/acres/mock-data";
import {
  matchesKind,
  matchesFilters,
  matchesQuery,
  matchesZone,
  matchesLocality,
  filterListingProperties,
} from "@/lib/listingFilter";

function makeProp(overrides: Partial<Property> = {}): Property {
  return {
    id: "x",
    title: "Test Home",
    subtitle: "Whitefield, Bangalore",
    price: "₹1 Cr",
    configs: ["2 BHK"],
    area: "1200 sqft",
    image: "https://img/x.jpg",
    propertyType: "Apartment",
    listingType: "For Sale",
    bedrooms: 2,
    locality: { city: "Bangalore", zone: "East", landmark: "Whitefield" },
    ...overrides,
  } as Property;
}

describe("matchesKind", () => {
  it("buy matches a residential For Sale property, not a For Rent one", () => {
    expect(matchesKind(makeProp({ listingType: "For Sale" }), "buy")).toBe(true);
    expect(matchesKind(makeProp({ listingType: "For Rent" }), "buy")).toBe(false);
  });
  it("rent matches only residential For Rent", () => {
    expect(matchesKind(makeProp({ listingType: "For Rent" }), "rent")).toBe(true);
    expect(matchesKind(makeProp({ listingType: "For Sale" }), "rent")).toBe(false);
  });
  it("treats missing listingType as For Sale (legacy)", () => {
    expect(matchesKind(makeProp({ listingType: undefined }), "buy")).toBe(true);
    expect(matchesKind(makeProp({ listingType: undefined }), "rent")).toBe(false);
  });
  it("projects require a new-construction signal", () => {
    expect(matchesKind(makeProp({ ageOfProperty: "Under Construction" }), "projects")).toBe(true);
    expect(matchesKind(makeProp({ badges: ["New Launch"] }), "projects")).toBe(true);
    expect(matchesKind(makeProp({ ageOfProperty: "5-10 Years", badges: [] }), "projects")).toBe(false);
  });
  it("plots / commercial / pg match by propertyType", () => {
    expect(matchesKind(makeProp({ propertyType: "Plot" }), "plots")).toBe(true);
    expect(matchesKind(makeProp({ propertyType: "Commercial", listingType: "For Sale" }), "commercial-sale")).toBe(true);
    expect(matchesKind(makeProp({ propertyType: "Commercial", listingType: "For Rent" }), "commercial-rent")).toBe(true);
    expect(matchesKind(makeProp({ propertyType: "PG/Co-living" }), "pg")).toBe(true);
  });
});

describe("matchesZone / matchesLocality", () => {
  it("matches zone case-insensitively via locality.zone", () => {
    expect(matchesZone(makeProp({ locality: { zone: "East" } }), "east")).toBe(true);
    expect(matchesZone(makeProp({ locality: { zone: "North" } }), "East")).toBe(false);
  });
  it("matches locality by landmark/subtitle substring", () => {
    expect(matchesLocality(makeProp({ locality: { landmark: "Whitefield" } }), "Whitefield")).toBe(true);
    expect(matchesLocality(makeProp({ subtitle: "Hebbal, Bangalore", locality: {} }), "Hebbal")).toBe(true);
    expect(matchesLocality(makeProp({ subtitle: "Hebbal", locality: {} }), "Koramangala")).toBe(false);
  });
});

describe("matchesFilters (OR within group, AND across groups)", () => {
  it("empty filter list matches everything", () => {
    expect(matchesFilters(makeProp(), [])).toBe(true);
  });
  it("Verified Only matches only verified properties", () => {
    expect(matchesFilters(makeProp({ verified: true }), ["Verified Only"])).toBe(true);
    expect(matchesFilters(makeProp({ verified: false }), ["Verified Only"])).toBe(false);
  });
  it("two configs in the same group are OR'd", () => {
    expect(matchesFilters(makeProp({ bedrooms: 3 }), ["2 BHK", "3 BHK"])).toBe(true);
    expect(matchesFilters(makeProp({ bedrooms: 1 }), ["2 BHK", "3 BHK"])).toBe(false);
  });
  it("matches every nested Apartment configuration, not only the legacy minimum bedroom value", () => {
    const p = makeProp({
      bedrooms: 2,
      configurationDetails: [
        { configuration: "2 BHK", price: "1", superBuiltUpArea: "1000", carpetArea: "800", bedrooms: 2, bathrooms: 2, balconies: 1, facings: ["East"] },
        { configuration: "3 BHK", price: "2", superBuiltUpArea: "1500", carpetArea: "1200", bedrooms: 3, bathrooms: 3, balconies: 2, facings: ["South"] },
      ],
    });
    expect(matchesFilters(p, ["3 BHK"])).toBe(true);
  });
  it("matches nested Villa bedrooms", () => {
    const p = makeProp({
      propertyType: "Villa",
      bedrooms: 3,
      configs: ["3 BHK", "4 BHK"],
      villaDetails: {
        villaType: "Twin Villa",
        configurationDetails: [
          { configuration: "3 BHK", price: "₹2 Cr", plotArea: "2000 sqft", builtUpArea: "2500 sqft", superArea: "2800 sqft", bedrooms: 3, bathrooms: 3 },
          { configuration: "4 BHK", price: "₹3 Cr", plotArea: "2600 sqft", builtUpArea: "3200 sqft", superArea: "3600 sqft", bedrooms: 4, bathrooms: 4 },
        ],
        plotFacing: "North-East",
        cornerPlot: false,
        privateGarden: false,
        privatePool: false,
        terrace: true,
        gatedCommunity: true,
      },
    });
    expect(matchesFilters(p, ["4 BHK"])).toBe(true);
  });
  it("filters in different groups are AND'd", () => {
    const p = makeProp({ bedrooms: 2, verified: true });
    expect(matchesFilters(p, ["2 BHK", "Verified Only"])).toBe(true);
    expect(matchesFilters(makeProp({ bedrooms: 2, verified: false }), ["2 BHK", "Verified Only"])).toBe(false);
  });
  it("amenity filters read the amenities array; Parking Spot also accepts parking field", () => {
    expect(matchesFilters(makeProp({ amenities: ["Gymnasium"] }), ["Gymnasium"])).toBe(true);
    expect(matchesFilters(makeProp({ amenities: [], parking: "1 Covered" }), ["Parking Spot"])).toBe(true);
    expect(matchesFilters(makeProp({ amenities: [], parking: "None" }), ["Parking Spot"])).toBe(false);
  });
});

describe("matchesQuery", () => {
  it("empty query matches", () => {
    expect(matchesQuery(makeProp(), "")).toBe(true);
  });
  it("matches across title, builder, locality, configs", () => {
    const p = makeProp({ builder: "Prestige Group", locality: { landmark: "Whitefield" } });
    expect(matchesQuery(p, "prestige")).toBe(true);
    expect(matchesQuery(p, "whitefield")).toBe(true);
    expect(matchesQuery(p, "2 bhk")).toBe(true);
    expect(matchesQuery(p, "penthouse")).toBe(false);
  });
  it("matches Villa type and plot facing", () => {
    const p = makeProp({
      propertyType: "Villa",
      villaDetails: {
        villaType: "Twin Villa",
        configurationDetails: [],
        plotFacing: "North-East",
        cornerPlot: false,
        privateGarden: false,
        privatePool: false,
        terrace: false,
        gatedCommunity: true,
      },
    });
    expect(matchesQuery(p, "twin villa")).toBe(true);
    expect(matchesQuery(p, "north-east")).toBe(true);
  });
});

describe("filterListingProperties", () => {
  it("composes kind + zone + filters + query", () => {
    const list = [
      makeProp({ id: "a", listingType: "For Sale", locality: { zone: "East" }, verified: true, bedrooms: 2 }),
      makeProp({ id: "b", listingType: "For Rent", locality: { zone: "East" }, verified: true, bedrooms: 2 }),
      makeProp({ id: "c", listingType: "For Sale", locality: { zone: "North" }, verified: true, bedrooms: 2 }),
      makeProp({ id: "d", listingType: "For Sale", locality: { zone: "East" }, verified: false, bedrooms: 2 }),
    ];
    const out = filterListingProperties({
      properties: list,
      kind: "buy",
      zone: "East",
      filters: ["Verified Only"],
    });
    expect(out.map((p) => p.id)).toEqual(["a"]);
  });
});
