import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ConfigurationTable from "@/components/acres/ConfigurationTable";

describe("ConfigurationTable", () => {
  it("renders every configuration with pricing and specifications in a mobile-scroll container", () => {
    const html = renderToStaticMarkup(
      <ConfigurationTable details={[
        { configuration: "2 BHK", price: "₹1.70 Cr", superBuiltUpArea: "1280 sqft", carpetArea: "915 sqft", bedrooms: 2, bathrooms: 2, balconies: 1, facings: ["East"] },
        { configuration: "3 BHK", price: "₹2.30 Cr", superBuiltUpArea: "1730 sqft", carpetArea: "1245 sqft", bedrooms: 3, bathrooms: 3, balconies: 2, facings: ["South"] },
      ]} />
    );
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("2 BHK");
    expect(html).toContain("3 BHK");
    expect(html).toContain("₹2.30 Cr");
    expect(html).toContain("1245 sqft");
  });
});
