import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Property } from "@/components/acres/mock-data";
import {
  createConfigurationDetail,
  displayRange,
  formatPossession,
  normalizeBhkLabel,
  preparePropertyPayload,
  validateApartmentDraft,
} from "@/lib/propertyDetails";

function apartment(): Partial<Property> {
  return {
    propertyType: "Apartment",
    title: "Lakeview Heights",
    subtitle: "Whitefield, Bangalore",
    configs: ["2 BHK", "3 BHK"],
    configurationDetails: [
      { ...createConfigurationDetail("2 BHK"), price: "₹1.70 Cr", superBuiltUpArea: "1280 sqft", carpetArea: "915 sqft", facings: ["East"] },
      { ...createConfigurationDetail("3 BHK"), price: "₹2.30 Cr", superBuiltUpArea: "1730 sqft", carpetArea: "1245 sqft", facings: ["South"] },
    ],
    possessionDetails: { status: "Under Construction", expectedCompletionDate: "2028-06-30" },
    floorLabel: "3",
    transactionType: "New Property",
    bookingAmount: "₹5,00,000",
    description: "A well-connected apartment project with spacious homes and modern shared amenities.",
  };
}

describe("Apartment property helpers", () => {
  beforeEach(() => vi.useRealTimers());

  it("normalizes arbitrary positive BHK tags and rejects invalid tags", () => {
    expect(normalizeBhkLabel(" 4bhk ")).toBe("4 BHK");
    expect(normalizeBhkLabel("studio")).toBeNull();
    expect(normalizeBhkLabel("0 BHK")).toBeNull();
  });

  it("creates independent row defaults based on each BHK tag", () => {
    expect(createConfigurationDetail("4 BHK")).toMatchObject({ configuration: "4 BHK", bedrooms: 4, bathrooms: 4, balconies: 0, facings: [] });
  });

  it("derives public price and area ranges while preserving row associations", () => {
    const source = apartment();
    expect(displayRange(source.configurationDetails, "price")).toBe("₹1.70 Cr - ₹2.30 Cr");
    const payload = preparePropertyPayload(source);
    expect(payload.price).toBe("₹1.70 Cr - ₹2.30 Cr");
    expect(payload.area).toBe("1280 sqft - 1730 sqft");
    expect(payload.configurationDetails?.[1].configuration).toBe("3 BHK");
  });

  it("orders mixed lakh/crore price displays by their real rupee value", () => {
    const rows = apartment().configurationDetails!;
    rows[0].price = "₹1.20 Cr";
    rows[1].price = "₹85 L";
    expect(displayRange(rows, "price")).toBe("₹85 L - ₹1.20 Cr");
  });

  it("formats all possession variants and uses the legacy fallback", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-21T00:00:00Z"));
    expect(formatPossession({ possessionDetails: { status: "Ready to Move", launchDate: "2024-01-15" } })).toContain("Launched on 15 Jan 2024");
    expect(formatPossession({ possessionDetails: { status: "New Launch", launchDate: "2027-01-15" } })).toContain("Launching on 15 Jan 2027");
    expect(formatPossession({ possessionDetails: { status: "Under Construction", expectedCompletionDate: "2028-06-30" } })).toContain("Completion expected by 30 Jun 2028");
    expect(formatPossession({ possession: "Within 6 Months" })).toBe("Within 6 Months");
  });

  it("reports conditional row, possession, RERA, booking, and description errors", () => {
    const draft = apartment();
    draft.configurationDetails![0].price = "";
    draft.possessionDetails = { status: "Under Construction", expectedCompletionDate: "" };
    draft.reraRegistered = true;
    draft.reraNumber = "";
    draft.bookingAmount = "";
    draft.description = "short";
    const errors = validateApartmentDraft(draft);
    expect(errors["configuration.2 BHK.price"]).toBeTruthy();
    expect(errors.possessionDate).toBeTruthy();
    expect(errors.reraNumber).toBeTruthy();
    expect(errors.bookingAmount).toBeTruthy();
    expect(errors.description).toBeTruthy();
  });
});
