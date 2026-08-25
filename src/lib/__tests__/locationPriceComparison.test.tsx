import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VillaLocationPriceComparison from "@/components/acres/VillaLocationPriceComparison";
import type { Property } from "@/components/acres/mock-data";
import { fetchLocationPriceComparison } from "@/lib/api";

vi.mock("@/lib/api", () => ({ fetchLocationPriceComparison: vi.fn() }));

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

  it("renders nothing instead of sample values when live comparison data is insufficient", async () => {
    vi.mocked(fetchLocationPriceComparison).mockResolvedValue({ currentLocation: "Jakkur", comparisons: [] });
    const host = document.createElement("div");
    const root = createRoot(host);
    await act(async () => {
      root.render(<VillaLocationPriceComparison property={property} />);
      await Promise.resolve();
    });

    expect(host.innerHTML).toBe("");
    await act(async () => root.unmount());
  });

  it("renders only live values when enough comparisons exist", async () => {
    vi.mocked(fetchLocationPriceComparison).mockResolvedValue({
      currentLocation: "Jakkur",
      comparisons: [
        { key: "jakkur", location: "Jakkur", averagePricePerSqft: 9_600, projectCount: 8 },
        { key: "whitefield", location: "Whitefield", averagePricePerSqft: 11_200, projectCount: 21 },
      ],
    });
    const host = document.createElement("div");
    const root = createRoot(host);
    await act(async () => {
      root.render(<VillaLocationPriceComparison property={property} />);
      await Promise.resolve();
    });

    expect(host.textContent).toContain("Live project averages");
    expect(host.textContent).toContain("Jakkur");
    expect(host.textContent).not.toContain("Example");
    await act(async () => root.unmount());
  });
});
