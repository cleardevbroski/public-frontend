import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ApartmentDetailsFields from "@/components/admin/ApartmentDetailsFields";
import type { PossessionDetails } from "@/components/acres/mock-data";

function renderPossession(possession: PossessionDetails) {
  return renderToStaticMarkup(
    <ApartmentDetailsFields
      configInput=""
      setConfigInput={() => {}}
      addConfig={() => {}}
      removeConfig={() => {}}
      details={[]}
      updateDetail={() => {}}
      possession={possession}
      setPossession={() => {}}
      floorLabel=""
      setFloorLabel={() => {}}
      setTotalFloors={() => {}}
      errors={{}}
    />
  );
}

describe("Apartment possession date controls", () => {
  it("uses a full date for Ready to Move", () => {
    const html = renderPossession({ status: "Ready to Move", launchDate: "2024-01-15" });
    expect(html).toContain("Ready Since Date (Day / Month / Year)");
    expect(html).toContain('type="date"');
  });

  it("uses only month and year for Under Construction", () => {
    const html = renderPossession({ status: "Under Construction", expectedCompletionDate: "2028-06" });
    expect(html).toContain("Expected Completion Month (Month / Year)");
    expect(html).toContain('type="month"');
    expect(html).toContain('value="2028-06"');
  });

  it("uses a full date for New Launch", () => {
    const html = renderPossession({ status: "New Launch", launchDate: "2027-01-15" });
    expect(html).toContain("Launch Date (Day / Month / Year)");
    expect(html).toContain('type="date"');
  });

  it("offers optional device uploads for 2D and 3D floor plans", () => {
    const html = renderToStaticMarkup(
      <ApartmentDetailsFields
        configInput=""
        setConfigInput={() => {}}
        addConfig={() => {}}
        removeConfig={() => {}}
        details={[{ configuration: "2 BHK", price: "₹1 Cr", superBuiltUpArea: "1200 sqft", carpetArea: "900 sqft", bedrooms: 2, bathrooms: 2, balconies: 1, facings: ["East"] }]}
        updateDetail={() => {}}
        possession={{ status: "Ready to Move", launchDate: "2024-01-15" }}
        setPossession={() => {}}
        floorLabel=""
        setFloorLabel={() => {}}
        setTotalFloors={() => {}}
        errors={{}}
      />
    );
    expect(html).toContain("2D floor plan");
    expect(html).toContain("3D floor plan");
    expect(html.match(/Optional/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain("Upload file");
  });
});
