import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VillaLocationPriceComparison from "@/components/acres/VillaLocationPriceComparison";
import type { Property } from "@/components/acres/mock-data";
import { fetchLocationPriceComparison } from "@/lib/api";

vi.mock("@/lib/api", () => ({ fetchLocationPriceComparison: vi.fn() }));

function settleAsyncWork() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const property = {
  id: "comparison-property",
  title: "Comparison Property",
  subtitle: "Jakkur, Bangalore",
  price: "₹1 Cr",
  configs: ["2 BHK"],
  area: "1,000 sq. ft.",
  image: "",
  propertyType: "Apartment",
} as Property;

describe("VillaLocationPriceComparison", () => {
  beforeEach(() => vi.mocked(fetchLocationPriceComparison).mockReset());

  it("keeps a compact unavailable state instead of stretching a single current-project bar", async () => {
    vi.mocked(fetchLocationPriceComparison).mockResolvedValue({
      comparisonBasis: "nearby_data_unavailable",
      currentLocation: "Jakkur",
      comparisons: [{ key: "jakkur", location: "Jakkur", averagePricePerSqft: 10_000, projectCount: 1, distanceKm: 0 }],
    });
    const host = document.createElement("div");
    const root = createRoot(host);
    await act(async () => {
      root.render(<VillaLocationPriceComparison property={property} />);
      await settleAsyncWork();
    });

    expect(host.textContent).toContain("Location Price Comparison");
    expect(host.textContent).toContain("Nearby comparison data unavailable");
    expect(host.textContent).toContain("No estimated or example locality prices shown");
    expect([...host.querySelectorAll("div")].some((element) => element.classList.contains("h-[188px]"))).toBe(true);
    await act(async () => root.unmount());
  });

  it("shows an explicit empty state when the project has no usable rate", async () => {
    vi.mocked(fetchLocationPriceComparison).mockResolvedValue({ comparisonBasis: "nearby_data_unavailable", currentLocation: "Jakkur", comparisons: [] });
    const host = document.createElement("div");
    const root = createRoot(host);
    await act(async () => {
      root.render(<VillaLocationPriceComparison property={{ ...property, price: "", area: "" }} />);
      await settleAsyncWork();
    });

    expect(host.textContent).toContain("Nearby comparison data unavailable");
    expect(host.textContent).toContain("Verified coordinates");
    await act(async () => root.unmount());
  });

  it("renders only live values when enough comparisons exist", async () => {
    vi.mocked(fetchLocationPriceComparison).mockResolvedValue({
      comparisonBasis: "verified_nearby_localities",
      currentLocation: "Jakkur",
      comparisons: [
        { key: "jakkur", location: "Jakkur", averagePricePerSqft: 9_600, projectCount: 8, distanceKm: 0 },
        { key: "whitefield", location: "Whitefield", averagePricePerSqft: 11_200, projectCount: 21, distanceKm: 12.4 },
      ],
    });
    const host = document.createElement("div");
    const root = createRoot(host);
    await act(async () => {
      root.render(<VillaLocationPriceComparison property={property} />);
      await settleAsyncWork();
    });

    expect(host.textContent).toContain("Nearest verified areas");
    expect(host.textContent).toContain("Jakkur");
    expect(host.textContent).toContain("12.4 km");
    expect(host.textContent).not.toContain("Example");
    await act(async () => root.unmount());
  });
});
