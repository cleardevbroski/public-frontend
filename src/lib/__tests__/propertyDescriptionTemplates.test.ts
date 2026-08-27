import { describe, expect, it } from "vitest";
import { PROPERTY_DESCRIPTION_TEMPLATES } from "@/lib/propertyDescriptionTemplates";

describe("property description templates", () => {
  it("provides a separate AI-readable template for every supported type", () => {
    expect(Object.keys(PROPERTY_DESCRIPTION_TEMPLATES)).toEqual(["Apartment", "Villa", "Plot", "Commercial", "PG/Co-living"]);
    Object.entries(PROPERTY_DESCRIPTION_TEMPLATES).forEach(([type, template]) => {
      expect(template).toContain("Use only facts present in the source");
      expect(template).toContain(`Property Type: ${type}`);
      expect(template.match(/^\[RERA PHASE\]$/gm)).toHaveLength(2);
      expect(template).toContain("About Developer:");
      expect(template).toContain("[PROJECT INTRODUCTION]");
      expect(template).toContain("[PROJECT USPS]");
      expect(template).toContain("[WHY INVEST]");
      expect(template).toContain("[LOCATION ADVANTAGES]");
      expect(template).toContain("Master Plan Section Title:");
      expect(template).toContain("Verified Master Plan Description:");
      expect(template).toContain("[MASTER PLAN DETAIL]");
      expect(template).toContain("[FAQ]");
      expect(template).not.toContain("RERA Registered: Yes | No");
    });
  });

  it("contains only the matching structured property block", () => {
    expect(PROPERTY_DESCRIPTION_TEMPLATES.Apartment).toContain("[CONFIGURATION]");
    expect(PROPERTY_DESCRIPTION_TEMPLATES.Apartment).not.toContain("[VILLA DETAILS]");
    expect(PROPERTY_DESCRIPTION_TEMPLATES.Villa).toContain("[VILLA DETAILS]");
    expect(PROPERTY_DESCRIPTION_TEMPLATES.Plot).toContain("[PLOT INVENTORY ITEM]");
    expect(PROPERTY_DESCRIPTION_TEMPLATES.Commercial).toContain("[COMMERCIAL DETAILS]");
    expect(PROPERTY_DESCRIPTION_TEMPLATES["PG/Co-living"]).toContain("[PG SHARING OPTION]");
  });
});
