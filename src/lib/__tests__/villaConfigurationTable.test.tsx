import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import VillaConfigurationTable from "@/components/acres/VillaConfigurationTable";

describe("VillaConfigurationTable", () => {
  it("renders villa pricing in the apartment-style price list", () => {
    const html = renderToStaticMarkup(<VillaConfigurationTable details={[
      { configuration: "3 BHK", price: "₹2.80 Cr", plotArea: "2400 sqft", builtUpArea: "3200 sqft", superArea: "3600 sqft", bedrooms: 3, bathrooms: 3 },
    ]} />);
    expect(html).toContain("Unit Type (Saleable)");
    expect(html).toContain("Price per Unit");
    expect(html).toContain("3 BHK Villa");
    expect(html).toContain("3,600");
    expect(html).toContain("Plot 2400 sqft");
    expect(html).toContain("Built-up 3200 sqft");
    expect(html).toContain("₹2.80 Cr");
    expect(html).toContain("+ Charges");
  });
});
