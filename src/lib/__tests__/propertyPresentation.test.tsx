import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FloorPlanExplorer from "@/components/acres/FloorPlanExplorer";
import FacilityExplorer from "@/components/acres/FacilityExplorer";
import PropertyDetail from "@/components/acres/PropertyDetail";
import { cityListings } from "@/components/acres/mock-data";
import { AuthProvider } from "@/components/acres/AuthContext";
import { MemoryRouter } from "react-router-dom";
import { getProjectHeroImages } from "@/lib/propertyPresentation";

describe("interactive property presentation", () => {
  it("renders card-based plan pricing and a 3D choice without a table", () => {
    const html = renderToStaticMarkup(<FloorPlanExplorer details={[{
      configuration: "2 BHK", price: "₹1.70 Cr", superBuiltUpArea: "1280 sqft", carpetArea: "915 sqft",
      bedrooms: 2, bathrooms: 2, balconies: 1, facings: ["East"],
      floorPlan2dUrl: "https://cdn.example.com/plan.jpg", floorPlan3dUrl: "https://cdn.example.com/plan-3d.jpg",
      rooms: [{ id: "master", name: "Master bedroom", length: 12, width: 11, unit: "ft" }],
    }]} />);
    expect(html).toContain("Floor Plans &amp; Pricing");
    expect(html).toContain("View Homes in 3D");
    expect(html).toContain("1 Floor Plan Available");
    expect(html).toContain("(85.01 sqm)");
    expect(html).toContain("Request Callback");
    expect(html).not.toContain("<table");
  });

  it("keeps legacy amenities and enriches selected facility details", () => {
    const html = renderToStaticMarkup(<FacilityExplorer amenities={["Swimming Pool", "Security"]} facilities={[{ name: "Swimming Pool", category: "Wellness", description: "Temperature-controlled pool", status: "Available" }]} />);
    expect(html).toContain("Top facilities");
    expect(html).toContain("Temperature-controlled pool");
    expect(html).toContain("Security");
  });

  it("uses up to three dedicated Project Overview photos in their selected order", () => {
    expect(getProjectHeroImages({
      image: "cover.jpg",
      images: ["gallery.jpg"],
      heroImages: ["first.jpg", "second.jpg", "third.jpg", "fourth.jpg"],
    })).toEqual(["first.jpg", "second.jpg", "third.jpg"]);
  });

  it("falls back to existing cover and gallery photos for older properties", () => {
    expect(getProjectHeroImages({
      image: "cover.jpg",
      images: ["cover.jpg", "gallery-a.jpg", "gallery-b.jpg"],
    })).toEqual(["cover.jpg", "gallery-a.jpg", "gallery-b.jpg"]);
  });

  it("keeps main photos fully visible and never renders legacy video media", () => {
    const property = {
      ...cityListings.Bangalore[0],
      heroImages: ["https://example.com/tall-home.jpg"],
      heroVideo: "https://example.com/legacy.mp4",
      videos: ["https://example.com/legacy-gallery.mp4"],
      virtualTourUrl: "https://example.com/legacy-tour",
    } as any;
    const html = renderToStaticMarkup(<MemoryRouter><AuthProvider><PropertyDetail property={property} /></AuthProvider></MemoryRouter>);

    expect(html).toContain("object-contain");
    expect(html).not.toContain("animate-project-hero");
    expect(html).not.toContain("legacy.mp4");
    expect(html).not.toContain("legacy-tour");
    expect(html).not.toContain("Videos (");
  });

  it("gives Rent and Lease listings their own compact public narratives", () => {
    const base = cityListings.Bangalore[0];
    const rentHtml = renderToStaticMarkup(
      <MemoryRouter><AuthProvider><PropertyDetail property={{
        ...base,
        propertyType: "Rent",
        configs: [],
        configurationDetails: undefined,
        rentDetails: {
          rentalPropertyType: "Apartment",
          configuration: "2 BHK",
          monthlyRent: 35000,
          securityDeposit: 100000,
          availableFrom: "2026-08-01",
          preferredTenantTypes: ["Family"],
          bedrooms: 2,
          bathrooms: 2,
          furnishing: "Semi-Furnished",
          petFriendly: true,
          nonVegAllowed: true,
          contactType: "Owner",
        },
      }} /></AuthProvider></MemoryRouter>
    );
    const leaseHtml = renderToStaticMarkup(
      <MemoryRouter><AuthProvider><PropertyDetail property={{
        ...base,
        propertyType: "Lease",
        configs: [],
        configurationDetails: undefined,
        leaseDetails: {
          leasePropertyType: "Commercial",
          carpetArea: "1800 sq ft",
          superArea: "2200 sq ft",
          leaseRent: 180000,
          rentPerSqft: 82,
          leaseTenure: "5 years",
          lockInPeriod: "3 years",
          rentEscalation: "5% yearly",
          securityDeposit: 1080000,
          availableFrom: "2026-09-01",
          furnishing: "Warm shell",
          preferredTenantType: "Corporate",
          subLeasingAllowed: false,
          registrationStampDutyResponsibility: "Tenant",
          contactType: "Owner",
        },
      }} /></AuthProvider></MemoryRouter>
    );

    expect(rentHtml).toContain("Rental terms at a glance");
    expect(rentHtml).toContain("Monthly rent");
    expect(leaseHtml).toContain("Lease terms at a glance");
    expect(leaseHtml).toContain("Rent per sq ft");
  });
});
