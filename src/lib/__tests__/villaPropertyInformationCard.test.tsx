import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import VillaPropertyInformationCard, { getVillaInformation } from "@/components/acres/VillaPropertyInformationCard";
import type { Property } from "@/components/acres/mock-data";

const villa = {
  id: "villa-1",
  title: "Parkside Villa",
  subtitle: "Bangalore",
  price: "₹ 4 Cr + Charges",
  area: "",
  image: "",
  configs: ["4 BHK"],
  propertyType: "Villa",
  overlooking: ["Park View"],
  possessionDetails: { status: "Under Construction" },
  villaDetails: {
    villaType: "Independent",
    configurationDetails: [{ configuration: "4 BHK", price: "₹ 3.85 Cr", plotArea: "3200 Sq.Ft.", builtUpArea: "3500 Sq.Ft.", superArea: "3850 Sq.Ft.", bedrooms: 4, bathrooms: 4, privateGarden: true }],
    plotFacing: "East",
    cornerPlot: false,
    privateGarden: true,
    privatePool: false,
    terrace: false,
    gatedCommunity: true,
  },
} as Property;

describe("VillaPropertyInformationCard", () => {
  it("maps the primary villa configuration and villa features", () => {
    expect(getVillaInformation(villa)).toEqual({
      price: "₹ 3.85 Cr",
      area: "3850 Sq.Ft.",
      bedrooms: "4 Bedrooms",
      additionalSpaces: "Private Garden",
      bathrooms: "4 Bathrooms",
      view: "Park View",
      possession: "Under Construction",
    });
  });

  it("renders live values and wires all three actions", async () => {
    const host = document.createElement("div");
    const root = createRoot(host);
    const onCharges = vi.fn();
    const onViewNumber = vi.fn();
    const onRequestCall = vi.fn();
    await act(async () => root.render(<VillaPropertyInformationCard property={villa} onCharges={onCharges} onViewNumber={onViewNumber} onRequestCall={onRequestCall} />));

    expect(host.textContent).toContain("3850 Sq.Ft.");
    expect(host.textContent).toContain("4 Bedrooms");
    expect(host.textContent).toContain("Park View");
    const buttons = [...host.querySelectorAll("button")];
    await act(async () => buttons.find((button) => button.textContent?.includes("+ Charges"))?.click());
    await act(async () => buttons.find((button) => button.textContent?.includes("View Number"))?.click());
    await act(async () => buttons.find((button) => button.textContent?.includes("Request for Call"))?.click());
    expect(onCharges).toHaveBeenCalledOnce();
    expect(onViewNumber).toHaveBeenCalledOnce();
    expect(onRequestCall).toHaveBeenCalledOnce();
    await act(async () => root.unmount());
  });
});
