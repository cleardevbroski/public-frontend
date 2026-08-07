import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import PlotSizeTable from "@/components/acres/PlotSizeTable";

describe("PlotSizeTable", () => {
  it("uses the apartment-style price columns and supports unit conversion and charges", async () => {
    const host = document.createElement("div");
    const root = createRoot(host);
    const onChargesClick = vi.fn();
    await act(async () => root.render(<PlotSizeTable details={[{
      plotSize: "30 × 40",
      width: 30,
      length: 40,
      areaSqft: 1200,
      pricePerSqft: 5000,
      totalPrice: 6_000_000,
      facings: ["East", "North"],
    }]} onChargesClick={onChargesClick} />));

    expect(host.textContent).toContain("Plot Type (Saleable)");
    expect(host.textContent).toContain("30 × 40 Plot");
    expect(host.textContent).toContain("₹5,000 / Sq. Ft.");
    expect(host.textContent).toContain("₹60 L");
    expect(host.textContent).toContain("East, North facing");

    const select = host.querySelector("select") as HTMLSelectElement;
    await act(async () => {
      select.value = "sqm";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(host.textContent).toContain("₹53,820 / Sq. Metres");

    await act(async () => [...host.querySelectorAll("button")].find((button) => button.textContent?.includes("+ Charges"))?.click());
    expect(onChargesClick).toHaveBeenCalledOnce();
    await act(async () => root.unmount());
  });
});
