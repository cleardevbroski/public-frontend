import { describe, expect, it } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import FloorPlanExplorer from "@/components/acres/FloorPlanExplorer";
import FacilityExplorer from "@/components/acres/FacilityExplorer";
import ApartmentPriceList from "@/components/acres/ApartmentPriceList";
import GovernmentChargesModal from "@/components/acres/GovernmentChargesModal";
import PropertyDetail, { PROPERTY_HERO_SECTION_ORDER } from "@/components/acres/PropertyDetail";
import { cityListings } from "@/components/acres/mock-data";
import { AuthProvider } from "@/components/acres/AuthContext";
import { MemoryRouter } from "react-router-dom";
import { configurationPriceRange, getProjectHeroImages, getPropertyCoverImage, priceWithCharges } from "@/lib/propertyPresentation";

describe("interactive property presentation", () => {
  it("keeps the hero navigation in the same order as the property content", () => {
    expect(PROPERTY_HERO_SECTION_ORDER.map((section) => section.label)).toEqual([
      "About",
      "Price List",
      "Floor Plans",
      "Master Plan",
      "Photos & Videos",
      "Amenities",
      "Download Hub",
      "Map & Landmarks",
      "RERA Details",
      "Project Details",
      "About Builder",
      "Market Comparison",
      "Similar Projects",
      "FAQ",
    ]);
  });

  it("anchors PG sharing prices and keeps About before Price List", () => {
    const base = cityListings.Bangalore[0];
    const html = renderToStaticMarkup(
      <MemoryRouter><AuthProvider><PropertyDetail property={{
        ...base,
        propertyType: "PG/Co-living",
        configs: [],
        configurationDetails: undefined,
        villaDetails: undefined,
        plotDetails: undefined,
        pgDetails: {
          genderPreference: "Co-ed",
          sharingDetails: [{ sharingType: "Double sharing", rentPerBed: 18000, deposit: 36000, bedsAvailable: 4 }],
          mealsIncluded: "Breakfast + Dinner",
          wifiIncluded: true,
          laundryIncluded: true,
          availableFrom: "2026-09-01",
          commonAmenities: ["Wi-Fi"],
          contactType: "Company-run",
        },
      }} /></AuthProvider></MemoryRouter>
    );
    const order = [...html.matchAll(/data-section-id="([^"]+)"/g)].map((match) => match[1]);

    expect(order.slice(0, 2)).toEqual(["overview", "price-list"]);
    expect(html).toContain("Choose a sharing option");
    expect(html).toContain('data-testid="property-detail-rail"');
    expect(html).toContain('class="property-detail-rail"');
    expect(html).toContain('aria-label="Property contact and financing tools"');
  });

  it("uses a main-display photo before gallery and legacy thumbnail fallbacks", () => {
    expect(getPropertyCoverImage({ heroImages: ["hero.jpg"], images: ["gallery.jpg"], image: "legacy.jpg" }))
      .toBe("hero.jpg");
  });

  it("adds the public charges suffix once", () => {
    expect(priceWithCharges("₹1.49 Cr - ₹3.14 Cr")).toBe("₹1.49 Cr - ₹3.14 Cr + Charges");
    expect(priceWithCharges("₹6 Cr + Charges")).toBe("₹6 Cr + Charges");
  });

  it("builds the public price range from apartment configurations", () => {
    expect(configurationPriceRange([
      { price: "₹ 1.79 Cr" },
      { price: "₹ 1.49 Cr" },
      { price: "₹ 3.14 Cr" },
    ], "₹ 9 Cr")).toBe("₹ 1.49 Cr - 3.14 Cr");
  });

  it("uses both endpoints from each submitted configuration price range", () => {
    expect(configurationPriceRange([
      { price: "1.89 - 2.46 Cr" },
      { price: "2.35 - 3.62 Cr" },
    ])).toBe("₹ 1.89 Cr - 3.62 Cr");
  });

  it("does not render a duplicate price range after public-price rounding", () => {
    expect(configurationPriceRange([
      { price: "₹ 2 Cr" },
      { price: "₹ 2.004 Cr" },
    ])).toBe("₹ 2 Cr");
  });

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

  it("renders the compact amenity preview", () => {
    const html = renderToStaticMarkup(<FacilityExplorer amenities={["Swimming Pool", "Security"]} facilities={[{ name: "Swimming Pool", category: "Wellness", description: "Temperature-controlled pool", status: "Available" }]} />);
    expect(html).toContain("Amenities");
    expect(html).toContain("Swimming Pool");
    expect(html).toContain("Security");
    expect(html).toContain("View More Details");
  });

  it("shows Amenities View More even without extra rows or descriptions", () => {
    const html = renderToStaticMarkup(<FacilityExplorer amenities={["Power Backup", "Security"]} />);
    expect(html).toContain("View More Details");
  });

  it("renders a compact three-column apartment price list with a unit rate", () => {
    const html = renderToStaticMarkup(<ApartmentPriceList title="Example Project" details={[{
      configuration: "2 BHK",
      price: "₹1.21 Cr",
      builtUpArea: "1097",
      carpetArea: "900",
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      facings: ["East"],
    }]} />);
    expect(html).toContain("Unit Type (Saleable)");
    expect(html).toContain("2 BHK Apartment");
    expect(html).toContain("1,097");
    expect(html.match(/<select/g)).toHaveLength(1);
    expect(html).toContain("Price per Unit");
    expect(html).toContain("₹11,030 / Sq. Ft.");
    expect(html).toContain("₹1.21 Cr");
    expect(html).toContain("+ Charges");
    expect(html).not.toContain("Built-up area");
    expect(html).not.toContain("Excludes additional charges");
  });

  it("converts one apartment row without changing other rows or prices", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => {
      root.render(<ApartmentPriceList title="Example Project" details={[
        { configuration: "2 BHK", price: "₹1.21 Cr", builtUpArea: "1097", carpetArea: "900", bedrooms: 2, bathrooms: 2, balconies: 1, facings: ["East"] },
        { configuration: "3 BHK", price: "₹1.56 Cr", builtUpArea: "1250", carpetArea: "1000", bedrooms: 3, bathrooms: 3, balconies: 2, facings: ["West"] },
      ]} />);
    });

    const selectors = host.querySelectorAll("select");
    expect(selectors).toHaveLength(2);
    await act(async () => {
      const first = selectors[0] as HTMLSelectElement;
      first.value = "sqm";
      first.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(host.textContent).toContain("101.91");
    expect(host.textContent).toContain("₹1,18,727 / Sq. Metres");
    expect(host.textContent).toContain("1,250");
    expect(host.textContent).toContain("₹1.21 Cr");

    await act(async () => {
      const first = host.querySelectorAll("select")[0] as HTMLSelectElement;
      first.value = "sqyd";
      first.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(host.textContent).toContain("121.89");
    expect(host.textContent).toContain("₹99,271 / Sq. Yards");
    expect(host.textContent).toContain("₹1.21 Cr");
    expect(host.textContent).toContain("₹1.56 Cr");

    await act(async () => { root.unmount(); });
    host.remove();
  });

  it("does not offer conversion for an invalid apartment area", () => {
    const html = renderToStaticMarkup(<ApartmentPriceList title="Example Project" details={[{
      configuration: "2 BHK",
      price: "Price on request",
      builtUpArea: "Not supplied",
      carpetArea: "",
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      facings: [],
    }]} />);
    expect(html).toContain("Not supplied");
    expect(html).not.toContain("<select");
  });

  it("shows current indicative Karnataka government charges", () => {
    const html = renderToStaticMarkup(<GovernmentChargesModal open onClose={() => undefined} onRequestCallback={() => undefined} />);
    expect(html).toContain("Applicable Government Charges");
    expect(html).toContain("Male ownership");
    expect(html).toContain("Female ownership");
    expect(html).toContain("Joint ownership");
    expect(html).toContain("Generally 2%");
    expect(html).toContain("Karnataka Kaveri Online");
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

  it("uses the gallery layout and exposes available video media", () => {
    const property = {
      ...cityListings.Bangalore[0],
      heroImages: ["https://example.com/tall-home.jpg"],
      heroVideo: "https://example.com/legacy.mp4",
      videos: ["https://example.com/legacy-gallery.mp4"],
      virtualTourUrl: "https://example.com/legacy-tour",
    } as any;
    const html = renderToStaticMarkup(<MemoryRouter><AuthProvider><PropertyDetail property={property} /></AuthProvider></MemoryRouter>);

    expect(html).toContain("object-cover");
    expect(html).not.toContain("animate-project-hero");
    expect(html).not.toContain("legacy-tour");
    expect(html).toContain("Open Video");
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
    expect(leaseHtml).toContain("Property overview");
    expect(leaseHtml).toContain("Rent per sq ft");
  });
});
