import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import VillaPropertyInformationCard from "@/components/acres/VillaPropertyInformationCard";
import type { Property } from "@/components/acres/mock-data";

const property = {
  id: "project-1",
  title: "Century Jakkur",
  subtitle: "Bangalore",
  price: "₹4.29 Cr - ₹4.42 Cr + Charges",
  area: "",
  image: "",
  configs: ["3 BHK", "4 BHK"],
  propertyType: "Apartment",
  possessionDetails: { status: "New Launch", launchDate: "2026-08-01" },
  projectArea: { totalAcres: 12.45, builtUpAcres: 6.2, openSpaceAcres: 4.1, amenitiesAcres: 2.15 },
  totalUnits: 184,
} as Property;

describe("VillaPropertyInformationCard", () => {
  it("renders six compact facts with separate plain contact actions below", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const onCharges = vi.fn();
    const onRequestCall = vi.fn();
    const onContactLawyer = vi.fn();
    await act(async () => root.render(<VillaPropertyInformationCard property={property} onCharges={onCharges} onRequestCall={onRequestCall} onContactLawyer={onContactLawyer} />));

    expect(host.textContent).toContain("Price");
    expect(host.textContent).toContain("Project Type");
    expect(host.textContent).toContain("Total Land Area");
    expect(host.textContent).toContain("Unit Variants");
    expect(host.textContent).toContain("Possession");
    expect(host.textContent).toContain("Total Units");
    expect(host.textContent).toContain("184");
    expect(host.textContent).toContain("Contact Lawyer");
    expect(host.textContent).toContain("Request Call");
    expect(host.textContent).not.toContain("View Number");
    expect(host.textContent).not.toContain("Bedroom");
    expect(host.textContent).not.toContain("Balcony");

    const buttons = [...host.querySelectorAll("button")];
    await act(async () => buttons.find((button) => button.textContent?.includes("+ Charges"))?.click());
    expect(onCharges).toHaveBeenCalledOnce();
    await act(async () => buttons.find((button) => button.textContent?.includes("Request Call"))?.click());
    await act(async () => buttons.find((button) => button.textContent?.includes("Contact Lawyer"))?.click());
    expect(onRequestCall).toHaveBeenCalledOnce();
    expect(onContactLawyer).toHaveBeenCalledOnce();

    const landButton = buttons.find((button) => button.textContent?.includes("Total Land Area"));
    await act(async () => landButton?.click());
    expect(landButton?.getAttribute("aria-expanded")).toBe("true");
    expect(host.textContent).toContain("Building area");
    expect(host.textContent).toContain("Empty / open space");
    expect(host.textContent).toContain("Amenities area");

    await act(async () => {
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    expect(landButton?.getAttribute("aria-expanded")).toBe("false");

    await act(async () => root.unmount());
    host.remove();
  });
});
