import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PropertyDetail from "@/components/acres/PropertyDetail";
import PropertyReraSections from "@/components/acres/PropertyReraSections";
import { AuthProvider } from "@/components/acres/AuthContext";
import type { Property } from "@/components/acres/mock-data";

vi.mock("qrcode", () => ({ default: { toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,local-qr") } }));

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
    reraSiteUrl: "https://rera.karnataka.gov.in/project/phase-1",
    reraDocuments: [{
      _id: "rera-document-1",
      key: "registration-certificate",
      label: "Registration Certificate",
      annexure: "Annexure 1",
      fileName: "registration.pdf",
      mimeType: "application/pdf",
      fileSize: 1_300_234,
      uploadedAt: "2024-10-17T00:00:00.000Z",
    }],
    projectDocuments: [{
      _id: "project-document-1",
      key: "approved-building-plan",
      label: "Approved Building Plan",
      annexure: "Annexure 81",
      fileName: "building-plan.pdf",
      mimeType: "application/pdf",
      fileSize: 2_600_000,
      uploadedAt: "2024-09-10T00:00:00.000Z",
    }],
  }, {
    _id: "phase-2",
    name: "Phase 2",
    reraNumber: "PRM/KA/RERA/5678",
    reraSiteUrl: "https://rera.karnataka.gov.in/project/phase-2",
    reraDocuments: [],
    projectDocuments: [{
      _id: "project-document-2",
      key: "commencement-certificate",
      label: "Phase 2 Commencement Certificate",
      fileName: "phase-2-commencement.pdf",
      mimeType: "application/pdf",
      fileSize: 2048,
      uploadedAt: "2025-01-02T00:00:00.000Z",
    }],
  }],
};

describe("phase-wise RERA presentation", () => {
  it("adds the unified workspace and both sticky navigation entries", () => {
    const html = renderToStaticMarkup(<MemoryRouter><AuthProvider><PropertyDetail property={property} /></AuthProvider></MemoryRouter>);
    expect(html).toContain("RERA &amp; Project Details");
    expect(html).toContain("RERA Details");
    expect(html).toContain("Project Details");
    expect(html).toContain("RERA record");
    expect(html).toContain("2 phases");
    expect(html).toContain("RERA details");
    expect(html).toContain("Project details");
    expect(html).toContain("Selected project phase");
    expect(html).toContain('data-testid="rera-workspace-column"');
    expect(html).toContain('data-testid="phase-verification"');
    expect(html).toContain('data-testid="download-disclosure"');
    expect(html).toContain('aria-label="View RERA downloads"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("Verify on Karnataka RERA");
    expect(html).not.toContain("Registration Certificate");
    expect(html).not.toContain("17 Oct 2024");
    expect(html).not.toContain("1.24 MB");
    expect(html).toContain("https://rera.karnataka.gov.in/project/phase-1");
    expect(html).not.toContain("Document storage links stay private");
    expect(html).not.toContain("Linked Dealer");
  });

  it("reveals downloads from the corner control and keeps disclosure state phase-specific", async () => {
    const host = document.createElement("div");
    const root = createRoot(host);
    await act(async () => root.render(<AuthProvider><PropertyReraSections property={property} setSectionRef={() => () => {}} /></AuthProvider>));

    const button = (label: string) => [...host.querySelectorAll("button")].find((item) => item.textContent?.includes(label)) as HTMLButtonElement;
    const disclosure = (label: string) => host.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;

    expect(host.textContent).not.toContain("Registration Certificate");
    expect(host.querySelector('[data-testid="phase-verification"] button[aria-label="View RERA downloads"]')).toBeNull();
    expect(host.querySelector('[data-testid="download-disclosure"] button[aria-label="View RERA downloads"]')).toBeTruthy();
    await act(async () => disclosure("View RERA downloads").click());
    expect(host.textContent).toContain("Registration Certificate");
    expect(host.textContent).toContain("17 Oct 2024");
    expect(host.textContent).toContain("1.24 MB");
    expect(disclosure("Hide RERA downloads").getAttribute("aria-expanded")).toBe("true");

    await act(async () => button("Project Details").click());
    expect(host.textContent).not.toContain("Approved Building Plan");
    await act(async () => disclosure("View project downloads").click());
    expect(host.textContent).toContain("Approved Building Plan");
    expect(host.textContent).not.toContain("Registration Certificate");

    await act(async () => button("Phase 2").click());
    expect(host.textContent).not.toContain("Phase 2 Commencement Certificate");
    await act(async () => disclosure("View project downloads").click());
    expect(host.textContent).toContain("Phase 2 Commencement Certificate");
    expect(host.textContent).toContain("2 KB");
    expect(host.querySelector('[data-testid="selected-phase-summary"]')?.textContent).toContain("Phase 2");
    expect(host.querySelector('[data-testid="phase-verification"]')?.textContent).toContain("PRM/KA/RERA/5678");
    expect(host.querySelector('[data-testid="phase-verification"] a')?.getAttribute("href")).toBe("https://rera.karnataka.gov.in/project/phase-2");
    expect(host.querySelector('img[alt*="QR code"]')?.getAttribute("src")).toContain("local-qr");

    await act(async () => root.unmount());
  });

  it("hides project-document controls and empty download states when no files were supplied", () => {
    const withoutDocuments = {
      ...property,
      reraPhases: property.reraPhases?.map((phase) => ({ ...phase, reraDocuments: [], projectDocuments: [] })),
    };
    const html = renderToStaticMarkup(<AuthProvider><PropertyReraSections property={withoutDocuments} setSectionRef={() => () => {}} /></AuthProvider>);

    expect(html).toContain("RERA Details");
    expect(html).not.toContain(">Project Details</button>");
    expect(html).not.toContain("View downloads");
    expect(html).not.toContain("No documents uploaded");
  });
});
