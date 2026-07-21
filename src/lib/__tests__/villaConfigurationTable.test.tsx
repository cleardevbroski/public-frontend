import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import VillaConfigurationTable from "@/components/acres/VillaConfigurationTable";

describe("VillaConfigurationTable", () => {
  it("renders every supplied Villa column in a responsive wrapper", () => {
    const html = renderToStaticMarkup(<VillaConfigurationTable details={[
      { configuration: "3 BHK", price: "₹2.80 Cr", plotArea: "2400 sqft", builtUpArea: "3200 sqft", superArea: "3600 sqft", bedrooms: 3, bathrooms: 3 },
    ]} />);
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("Plot area");
    expect(html).toContain("Built-up area");
    expect(html).toContain("Super area");
    expect(html).toContain("2400 sqft");
  });
});
