import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import ProjectAbout from "@/components/acres/ProjectAbout";
import type { Property } from "@/components/acres/mock-data";

const property = {
  id: "overview-1",
  title: "Compact Homes",
  subtitle: "Bangalore",
  price: "₹ 1 Cr",
  area: "1,200 Sq.Ft.",
  image: "",
  configs: ["2 BHK"],
  propertyType: "Apartment",
  description: "A concise project description.",
} as Property;

describe("ProjectAbout", () => {
  it("shows compact facts immediately, removes empty values, and expands only overflow content", async () => {
    const host = document.createElement("div");
    const root = createRoot(host);
    const facts = [
      { label: "Property type", val: "Apartment" },
      { label: "Configuration", val: "2 BHK" },
      { label: "Area", val: "1,200 Sq.Ft." },
      { label: "Facing", val: "East" },
      { label: "Parking", val: "Covered" },
      { label: "Possession", val: "Ready to Move" },
      { label: "RERA", val: "PRM/123" },
      { label: "Empty detail", val: "" },
    ];

    await act(async () => root.render(<ProjectAbout property={property} title="Apartment overview" facts={facts} />));
    expect(host.textContent).toContain("A concise project description.");
    expect(host.textContent).toContain("1,200 Sq.Ft.");
    expect(host.textContent).not.toContain("Empty detail");
    expect(host.textContent).not.toContain("PRM/123");

    const expand = [...host.querySelectorAll("button")].find((button) => button.textContent?.includes("View All Details"));
    await act(async () => expand?.click());
    expect(host.textContent).toContain("PRM/123");
    await act(async () => root.unmount());
  });

  it("renders no section when neither narrative nor facts were provided", async () => {
    const host = document.createElement("div");
    const root = createRoot(host);
    await act(async () => root.render(<ProjectAbout property={{ ...property, description: "" }} title="Apartment overview" facts={[]} />));
    expect(host.innerHTML).toBe("");
    await act(async () => root.unmount());
  });
});
