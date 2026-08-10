import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import PropertyCard from "@/components/acres/PropertyCard";

describe("public property card content", () => {
  it("shows only the approved compact summary and hides secondary property details", () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <PropertyCard p={{
          id: "64b7f3f3f3f3f3f3f3f3f3f3",
          title: "Century Jakkur",
          subtitle: "Jakkur, Bengaluru",
          price: "₹ 1.5 Cr",
          pricePerSqft: "₹ 9,500 / sq.ft",
          configs: ["3 BHK"],
          area: "1,650 sq.ft",
          possession: "Ready to Move",
          image: "https://example.com/project.jpg",
          badges: ["New Launch"],
          reraRegistered: true,
        }} />
      </MemoryRouter>
    );

    expect(markup).toContain("Century Jakkur");
    expect(markup).toContain("Jakkur, Bengaluru");
    expect(markup).toContain("Clear Title Verified");
    expect(markup).toContain("RERA");
    expect(markup).toContain("Save property");
    expect(markup).not.toContain("3 BHK");
    expect(markup).not.toContain("1,650 sq.ft");
    expect(markup).not.toContain("9,500 / sq.ft");
    expect(markup).not.toContain("Ready to Move");
    expect(markup).not.toContain("New Launch");
  });
});
