import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import PropertyDetail from "@/components/acres/PropertyDetail";
import { AuthProvider } from "@/components/acres/AuthContext";
import type { Property } from "@/components/acres/mock-data";

describe("phase-wise RERA presentation", () => {
  it("renders separate RERA and project sections without exposing a linked dealer", () => {
    const property: Property = {
      id: "property-1",
      title: "Phase Project",
      subtitle: "Whitefield, Bangalore",
      price: "₹1 Cr",
      configs: ["2 BHK"],
      area: "1000 sqft",
      image: "https://example.com/property.jpg",
      reraRegistered: true,
      reraPhases: [{
        _id: "phase-1",
        name: "Phase 1",
        reraNumber: "PRM/KA/RERA/1234",
        reraSiteUrl: "https://rera.karnataka.gov.in/project",
        reraDocuments: [{
          _id: "rera-document-1",
          key: "registration-certificate",
          label: "Registration Certificate",
          annexure: "Annexure 1",
          fileName: "registration.pdf",
          mimeType: "application/pdf",
          fileSize: 1024,
        }],
        projectDocuments: [{
          _id: "project-document-1",
          key: "approved-building-plan",
          label: "Approved Building Plan",
          annexure: "Annexure 81",
          fileName: "building-plan.pdf",
          mimeType: "application/pdf",
          fileSize: 2048,
        }],
      }],
    };

    const html = renderToStaticMarkup(<MemoryRouter><AuthProvider><PropertyDetail property={property} /></AuthProvider></MemoryRouter>);
    expect(html).toContain("RERA Details");
    expect(html).toContain("Project Details");
    expect(html).toContain("Registration Certificate");
    expect(html).toContain("Approved Building Plan");
    expect(html).toContain("PRM/KA/RERA/1234");
    expect(html).toContain("https://rera.karnataka.gov.in");
    expect(html).not.toContain("https://rera.karnataka.gov.in/project");
    expect(html).not.toContain("Linked Dealer");
    expect(html).not.toContain("Listed by Verified Dealer");
  });
});
