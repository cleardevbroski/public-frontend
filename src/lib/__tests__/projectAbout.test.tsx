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

    const expand = [...host.querySelectorAll("button")].find((button) => button.textContent?.includes("View More"));
    await act(async () => expand?.click());
    expect(host.textContent).toContain("PRM/123");
    expect(host.textContent).toContain("Project details at a glance");
    expect(host.textContent).toContain("Property type");
    await act(async () => root.unmount());
  });

  it("renders no section when neither narrative nor facts were provided", async () => {
    const host = document.createElement("div");
    const root = createRoot(host);
    await act(async () => root.render(<ProjectAbout property={{ ...property, description: "" }} title="Apartment overview" facts={[]} />));
    expect(host.innerHTML).toBe("");
    await act(async () => root.unmount());
  });

  it("shows View More when a long description is clamped without extra narrative", async () => {
    const host = document.createElement("div");
    const root = createRoot(host);
    const longDescription = "Sobha Altair is a residential project by Sobha located in Chikkakannalli near Sarjapur Main Road, East Bangalore. The project spans 3.37 acres and includes 1 tower with around 207 homes. It offers spacious 3 and 4 BHK apartments ranging from 1894 Sq.Ft. to 2570 Sq.Ft., with landscaped surroundings and a low-density planning approach. The project is currently in the New Launch stage, with possession expected around May 2031.";
    await act(async () => root.render(<ProjectAbout property={{ ...property, description: longDescription }} title="Apartment overview" facts={[]} />));
    expect(host.textContent).toContain("View More");
    const expand = [...host.querySelectorAll("button")].find((button) => button.textContent?.includes("View More"));
    await act(async () => expand?.click());
    expect(host.textContent).toContain("possession expected around May 2031");
    await act(async () => root.unmount());
  });
});
