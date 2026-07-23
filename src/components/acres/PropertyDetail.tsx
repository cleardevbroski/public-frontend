"use client";

import Image from "@/components/Image";
import Link from "@/components/Link";
import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Share2,
  Heart,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  Shield,
  Verified,
  Clock,
  Maximize,
  Building2,
  Layers,
  Train,
  School,
  Hospital,
  ShoppingBag,
  Navigation,
  Scale,
  ShieldCheck,
  Download,
  Images,
  FileText,
  Sparkles,
  Compass,
  Heart as HeartIcon,
  Star,
  TrendingUp,
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import PropertyCard from "./PropertyCard";
import PopularBuilders from "./PopularBuilders";
import type { Property } from "./mock-data";
import { localityInsights } from "./mock-data";
import {
  getPublishedProperties,
  getFeaturedProperties,
  getPropertiesByBuilder,
  builderSlug,
} from "@/lib/propertyStore";
import { getPublishedDealers, type Dealer } from "@/lib/dealerStore";
import { useLiveProperties } from "@/lib/useLiveProperties";
import { formatPossession } from "@/lib/propertyDetails";
import VillaConfigurationTable from "./VillaConfigurationTable";
import PlotSizeTable from "./PlotSizeTable";
import PlotInventoryTable from "./PlotInventoryTable";
import FloorPlanExplorer from "./FloorPlanExplorer";
import FacilityExplorer from "./FacilityExplorer";
import AdRail from "./AdRail";
import VerifiedPropertyActionModal, { type PropertyAction } from "./VerifiedPropertyActionModal";
import LawyerConsultationModal from "./LawyerConsultationModal";
import { getProjectHeroImages } from "@/lib/propertyPresentation";
import { trackAnalytics } from "@/lib/analytics";
import { useHomepagePromotion } from "@/lib/useHomepagePromotion";

type Pools = {
  recommended: Property[];
  similar: Property[];
  featured: Property[];
  interests: Property[];
  builderMore: Property[];
};
const EMPTY_POOLS: Pools = { recommended: [], similar: [], featured: [], interests: [], builderMore: [] };

/** Build the recommendation rails for a property from the live store. */
function buildPools(property: Property): Pools {
  const all = getPublishedProperties().filter((p) => p.id !== property.id);
  const featured = getFeaturedProperties(12).filter((p) => p.id !== property.id);
  const sameType = property.propertyType
    ? all.filter((p) => p.propertyType === property.propertyType)
    : [];
  const zone = property.locality?.zone || property.subtitle?.split(",")[0]?.trim();
  const sameZone = all.filter(
    (p) => (p.locality?.zone || p.subtitle?.split(",")[0]?.trim()) === zone
  );
  const builderMore = property.builder
    ? getPropertiesByBuilder(builderSlug(property.builder)).filter((p) => p.id !== property.id)
    : [];
  return {
    recommended: [...featured, ...all].slice(0, 8),
    similar: (sameType.length ? sameType : all).slice(0, 8),
    featured: featured.slice(0, 8),
    interests: (sameZone.length ? sameZone : all).slice(0, 8),
    builderMore: builderMore.slice(0, 8),
  };
}

const isBase64 = (src: string) => src.startsWith("data:");

interface PropertyDetailProps {
  property: Property;
  relatedProperties?: Property[];
}

const sections = [
  { id: "overview", label: "Overview" },
  { id: "plans", label: "Floor Plans" },
  { id: "facilities", label: "Facilities" },
  { id: "brochure", label: "Brochure" },
  { id: "society", label: "Amenities & Society" },
  { id: "dealer", label: "Developer" },
  { id: "locality", label: "Locality" },
  { id: "explore", label: "Explore More" },
];

/* ── Horizontal property rail ─────────────────────────────────── */
function PropertyRail({
  title,
  subtitle,
  Icon,
  items,
}: {
  title: string;
  subtitle: string;
  Icon: React.ElementType;
  items: Property[];
}) {
  const scroller = useRef<HTMLDivElement>(null);
  if (!items || items.length === 0) return null;
  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * 660, behavior: "smooth" });

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold tracking-[0.16em] uppercase text-[#DDAA42]">
            <Icon className="size-4" /> {subtitle}
          </span>
          <h3 className="text-[24px] md:text-[28px] font-bold text-[#121B35] mt-1">{title}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scrollBy(-1)}
            className="size-10 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center shadow-sm hover:border-[#DDAA42] hover:text-[#DDAA42] transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-5 text-[#121B35]" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="size-10 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center shadow-sm hover:border-[#DDAA42] hover:text-[#DDAA42] transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-5 text-[#121B35]" />
          </button>
        </div>
      </div>
      <div ref={scroller} className="flex gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
        {items.map((p) => (
          <PropertyCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}

export default function PropertyDetail({ property }: PropertyDetailProps) {
  const promotion = useHomepagePromotion(property.id);
  const isPromotedProperty = Boolean(promotion?.promotionSlot);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("overview");
  const [showContactForm, setShowContactForm] = useState(false);
  const [isTabBarSticky, setIsTabBarSticky] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [verifiedAction, setVerifiedAction] = useState<PropertyAction | null>(null);
  const [showLawyerConsultation, setShowLawyerConsultation] = useState(false);

  // DBG006: Reset media state when navigating to a different property to prevent out-of-bounds crash
  useEffect(() => {
    setCurrentImageIndex(0);
    setHeroImageIndex(0);
  }, [property.id]);

  useEffect(() => {
    trackAnalytics("property_view", {
      propertyId: property.id,
      propertyTitle: property.title,
      location: property.subtitle,
      propertyType: property.propertyType || "",
    }, property.id);
  }, [property.id, property.propertyType, property.subtitle, property.title]);
  // Property rails (computed client-side from the live store, SSR-safe)
  const pools = useLiveProperties<Pools>(() => buildPools(property), EMPTY_POOLS);

  // Pick a verified dealer to attribute this listing to (deterministic by id).
  const [listedBy, setListedBy] = useState<Dealer | null>(null);
  const [propertyDealers, setPropertyDealers] = useState<Dealer[]>([]);
  useEffect(() => {
    const dealers = getPublishedDealers();
    if (dealers.length === 0) return;
    const hash = property.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    setListedBy(dealers[hash % dealers.length]);
    // Rotate a small set of dealers for this property (starting from the primary).
    const ordered = [...dealers.slice(hash % dealers.length), ...dealers.slice(0, hash % dealers.length)];
    setPropertyDealers(ordered.slice(0, 4));
  }, [property.id]);

  // Nearest matching locality insight for the price-trend strip.
  const localityKey = (property.subtitle.split(",")[0] || "").toLowerCase();
  const insight =
    localityInsights.find((l) => localityKey.includes(l.name.toLowerCase())) ||
    localityInsights.find((l) => l.name.toLowerCase().includes(localityKey)) ||
    localityInsights[2];

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setSectionRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  const tabBarRef = useRef<HTMLDivElement>(null);

  const images =
    property.images && property.images.length > 0
      ? property.images
      : [
          property.image,
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&q=80",
          "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80",
        ];
  const heroImages = getProjectHeroImages(property);

  useEffect(() => {
    if (heroImages.length < 2) return;
    const rotation = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % heroImages.length);
    }, 6500);
    return () => window.clearInterval(rotation);
  }, [property.id, heroImages.length]);

  const possessionLabel = formatPossession(property);
  const flatFloor = property.floorLabel?.trim();
  const floorDisplay = flatFloor
    ? `${flatFloor}${property.totalFloors ? ` of ${property.totalFloors}` : ""}`
    : property.propertyType === "Apartment" ? "" : property.floor || "";
  const nearbyValue = (key: "schools" | "hospitals" | "shopping" | "metro", legacy?: string) => {
    const detail = property.nearbyDetails?.[key];
    if (detail && (detail.count !== undefined || detail.distance)) {
      return [detail.count !== undefined ? `${detail.count}` : "", detail.distance].filter(Boolean).join(" · ");
    }
    return legacy || "—";
  };

  const amenities =
    property.amenities && property.amenities.length > 0
      ? property.amenities
      : property.pgDetails?.commonAmenities?.length
      ? property.pgDetails.commonAmenities
      : property.villaDetails || property.plotDetails || property.commercialDetails || property.pgDetails
      ? []
      : [
          "Power Backup",
          "Rain Water Harvesting",
          "Club House",
          "Swimming Pool",
          "Security",
          "Lift",
          "Reserved Parking",
          "Gymnasium",
          "Park",
          "Water Storage",
        ];
  const hasFloorPlans = Boolean(property.configurationDetails?.length);
  const hasFacilities = amenities.length > 0 || Boolean(property.facilities?.length);
  const hasSociety = Boolean(
    property.society && Object.values(property.society).some(Boolean)
  ) || !property.villaDetails;
  const visibleSections = sections.filter((section) =>
    (section.id !== "plans" || hasFloorPlans) &&
    (section.id !== "facilities" || hasFacilities) &&
    (section.id !== "society" || hasSociety)
  );

  useEffect(() => {
    const handleScroll = () => {
      if (tabBarRef.current) {
        const tabBarRect = tabBarRef.current.getBoundingClientRect();
        setIsTabBarSticky(tabBarRect.top <= 72);
      }
      const scrollPosition = window.scrollY + 220;
      for (const section of visibleSections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasFacilities, hasFloorPlans, hasSociety]);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const headerOffset = 135;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - headerOffset, behavior: "smooth" });
    }
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    trackAnalytics("property_share", { propertyId: property.id, propertyTitle: property.title, location: property.subtitle });
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isPdfBrochure = property.brochure?.startsWith("data:application/pdf");

  const handleDownloadBrochure = () => {
    if (property.brochure) {
      const a = document.createElement("a");
      a.href = property.brochure;
      a.download = property.brochureName || `${property.title.replace(/\s+/g, "-")}-brochure`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    const configurationRows = property.configurationDetails?.map((row) => `<tr><td>${row.configuration}</td><td>${row.price}</td><td>${row.superBuiltUpArea}</td><td>${row.carpetArea}</td><td>${row.bedrooms}</td><td>${row.bathrooms}</td><td>${row.balconies}</td><td>${row.facings.join(", ")}</td></tr>`).join("") || "";
    const villaConfigurationRows = property.villaDetails?.configurationDetails.map((row) => `<tr><td>${row.configuration}</td><td>${row.price}</td><td>${row.plotArea}</td><td>${row.builtUpArea}</td><td>${row.superArea}</td><td>${row.bedrooms}</td><td>${row.bathrooms}</td></tr>`).join("") || "";
    const villaFacts = property.villaDetails ? [
      ["Villa type", property.villaDetails.villaType],
      ["Plot dimensions", property.villaDetails.plotDimensions],
      ["Floors", property.villaDetails.numberOfFloors],
      ["Plot facing", property.villaDetails.plotFacing],
      ["Corner plot", property.villaDetails.cornerPlot ? "Yes" : "No"],
      ["Road width", property.villaDetails.roadWidthFacing],
      ["Private garden", property.villaDetails.privateGarden ? `Yes${property.villaDetails.privateGardenArea ? ` · ${property.villaDetails.privateGardenArea}` : ""}` : "No"],
      ["Private pool", property.villaDetails.privatePool ? "Yes" : "No"],
      ["Terrace", property.villaDetails.terrace ? `Yes${property.villaDetails.terraceDetails ? ` · ${property.villaDetails.terraceDetails}` : ""}` : "No"],
      ["Gated community", property.villaDetails.gatedCommunity ? "Yes" : "No"],
    ].filter(([, value]) => value).map(([label, value]) => `<div class="card"><div class="label">${label}</div><div class="val">${value}</div></div>`).join("") : "";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${property.title} — Brochure</title>
<style>
  body{font-family:Georgia,serif;color:#121B35;margin:0;padding:48px;background:#F8F7FA}
  .seal{display:inline-block;background:linear-gradient(135deg,#F2C052,#DDAA42);color:#121B35;font-weight:bold;padding:6px 16px;border-radius:999px;font-size:12px;letter-spacing:1px}
  h1{font-size:34px;margin:18px 0 4px}
  .muted{color:#68646F}
  .price{font-size:30px;color:#DDAA42;font-weight:bold;margin:18px 0}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}
  .card{background:#fff;border:1px solid #E4E0E7;border-radius:12px;padding:14px}
  table{width:100%;border-collapse:collapse;background:#fff;margin:20px 0;font-family:Arial,sans-serif;font-size:12px}th,td{border:1px solid #E4E0E7;padding:8px;text-align:left}th{background:#121B35;color:#fff}
  .label{font-size:11px;text-transform:uppercase;color:#68646F;letter-spacing:1px}
  .val{font-size:16px;font-weight:bold}
  img{width:100%;border-radius:14px;margin:16px 0;max-height:320px;object-fit:cover}
  .foot{margin-top:32px;border-top:1px solid #E4E0E7;padding-top:14px;color:#68646F;font-size:12px}
</style></head><body>
  <span class="seal">CLEAR TITLE VERIFIED</span>
  <h1>${property.title}</h1>
  <div class="muted">${property.subtitle}</div>
  <div class="price">${property.price}</div>
  <img src="${property.image}" alt="" />
  <div class="grid">
    <div class="card"><div class="label">Configuration</div><div class="val">${property.configs.join(", ") || "—"}</div></div>
    <div class="card"><div class="label">Area</div><div class="val">${property.area}</div></div>
    <div class="card"><div class="label">Possession</div><div class="val">${possessionLabel}</div></div>
    <div class="card"><div class="label">Builder</div><div class="val">${property.builder || "ClearTitle One"}</div></div>
  </div>
  ${configurationRows ? `<table><thead><tr><th>Config</th><th>Price</th><th>Super area</th><th>Carpet area</th><th>Beds</th><th>Baths</th><th>Balconies</th><th>Facing</th></tr></thead><tbody>${configurationRows}</tbody></table>` : ""}
  ${villaConfigurationRows ? `<table><thead><tr><th>Config</th><th>Price</th><th>Plot area</th><th>Built-up area</th><th>Super area</th><th>Beds</th><th>Baths</th></tr></thead><tbody>${villaConfigurationRows}</tbody></table>` : ""}
  ${villaFacts ? `<div class="grid">${villaFacts}</div>` : ""}
  <p>${property.description || ""}</p>
  <div class="foot">Generated by ClearTitle One — Verified clear-title real estate in Bangalore.</div>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${property.title.replace(/\s+/g, "-")}-brochure.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const completeVerifiedAction = (action: PropertyAction) => {
    const eventType = action === "brochure" ? "brochure_download" : action === "call" ? "contact_reveal" : "enquiry_submitted";
    trackAnalytics(eventType, { propertyId: property.id, propertyTitle: property.title, location: property.subtitle, source: "property_detail" });
    if (action === "brochure") handleDownloadBrochure();
  };

  const beds = property.bedrooms || property.configs[0]?.split(" ")[0] || "—";
  const villaOverviewFacts = property.villaDetails ? [
    { label: "Villa Type", val: property.villaDetails.villaType },
    { label: "Plot Dimensions", val: property.villaDetails.plotDimensions },
    { label: "Number of Floors", val: property.villaDetails.numberOfFloors },
    { label: "Plot Facing", val: property.villaDetails.plotFacing },
    { label: "Corner Plot", val: property.villaDetails.cornerPlot ? "Yes" : "No" },
    { label: "Road Width Facing", val: property.villaDetails.roadWidthFacing },
    { label: "Private Garden", val: property.villaDetails.privateGarden ? `Yes${property.villaDetails.privateGardenArea ? ` · ${property.villaDetails.privateGardenArea}` : ""}` : "No" },
    { label: "Private Pool", val: property.villaDetails.privatePool ? "Yes" : "No" },
    { label: "Terrace", val: property.villaDetails.terrace ? `Yes${property.villaDetails.terraceDetails ? ` · ${property.villaDetails.terraceDetails}` : ""}` : "No" },
    { label: "Gated Community", val: property.villaDetails.gatedCommunity ? "Yes" : "No" },
    { label: "Transaction", val: property.transactionType },
    { label: "Listing", val: property.listingType },
    { label: "RERA Number", val: property.reraRegistered ? property.reraNumber : "" },
  ].filter((item) => item.val) : [];
  const plotOverviewFacts = property.plotDetails ? [
    { label: "Plots in layout", val: String(property.plotDetails.totalPlots) },
    { label: "Approval authority", val: property.plotDetails.approvalAuthority },
    { label: "Approval number", val: property.plotDetails.approvalNumber },
    { label: "Road width", val: property.plotDetails.roadWidth },
    { label: "Drainage", val: property.plotDetails.civicInfrastructure.undergroundDrainage },
    { label: "Electricity", val: property.plotDetails.civicInfrastructure.electricity },
    { label: "Water", val: property.plotDetails.civicInfrastructure.water },
    { label: "Transaction", val: property.transactionType },
    { label: "Listing", val: property.listingType },
    { label: "RERA Number", val: property.reraRegistered ? property.reraNumber : "" },
  ].filter((item) => item.val) : [];
  const commercialOverviewFacts = property.commercialDetails ? [
    { label: "Commercial type", val: property.commercialDetails.commercialSubtype }, { label: "Floor", val: `${property.commercialDetails.floor} of ${property.commercialDetails.totalFloors}` },
    { label: "Zone", val: property.commercialDetails.zoneType }, { label: "Building grade", val: property.commercialDetails.buildingGrade },
    { label: "Structure", val: property.commercialDetails.structure }, { label: "Frontage", val: property.commercialDetails.frontage },
    { label: "Seating", val: property.commercialDetails.seatingCapacity ? String(property.commercialDetails.seatingCapacity) : "" }, { label: "Cabins", val: property.commercialDetails.cabins ? String(property.commercialDetails.cabins) : "" },
    { label: "Meeting rooms", val: property.commercialDetails.meetingRooms ? String(property.commercialDetails.meetingRooms) : "" }, { label: "Pantry", val: property.commercialDetails.pantry },
    { label: "Washrooms", val: property.commercialDetails.washrooms }, { label: "Parking", val: property.commercialDetails.parking },
    { label: "Power backup", val: property.commercialDetails.powerBackup }, { label: "Sanctioned load", val: property.commercialDetails.sanctionedLoadKva ? `${property.commercialDetails.sanctionedLoadKva} KVA` : "" },
    { label: "Fire safety", val: property.commercialDetails.fireSafetyCompliance }, { label: "Furnishing", val: property.commercialDetails.furnishing },
    { label: "Ownership", val: property.ownershipType }, { label: "Maintenance", val: property.maintenanceCharges ? `${property.maintenanceCharges} / ${property.maintenancePeriod || "month"}` : "" },
  ].filter((item) => item.val) : [];
  const pgOverviewFacts = property.pgDetails ? [
    { label: "Gender preference", val: property.pgDetails.genderPreference }, { label: "Meals", val: property.pgDetails.mealsIncluded }, { label: "Food type", val: property.pgDetails.foodType },
    { label: "Wi-Fi", val: property.pgDetails.wifiIncluded ? "Included" : "Not included" }, { label: "Laundry", val: property.pgDetails.laundryIncluded ? property.pgDetails.laundrySchedule || "Included" : "Not included" },
    { label: "Housekeeping", val: property.pgDetails.housekeeping }, { label: "Curfew", val: property.pgDetails.curfewEntryTiming || "None" }, { label: "Visitors", val: property.pgDetails.visitorsAllowed },
    { label: "Notice period", val: property.pgDetails.noticePeriod }, { label: "Lock-in period", val: property.pgDetails.lockInPeriod }, { label: "Contact", val: property.pgDetails.contactType },
  ].filter((item) => item.val) : [];
  const societyFacts = [
    { label: "Security Desk", val: property.society?.security || (property.villaDetails ? "" : "24x7 Armed Guard") },
    { label: "Water Supply", val: property.society?.waterSupply || (property.villaDetails ? "" : "Borewell + Cauvery") },
    { label: "Power Backup", val: property.society?.powerBackup || (property.villaDetails ? "" : "100% DG Backup") },
    { label: "Elevators", val: property.society?.lift || (property.villaDetails ? "" : "High-Speed Elevators") },
    { label: "Visitor Parking", val: property.society?.visitorParking || (property.villaDetails ? "" : "Dedicated Slots") },
    { label: "Maintenance", val: property.society?.maintenanceStaff || (property.villaDetails ? "" : "On-Call Staff") },
  ].filter((item) => item.val);

  return (
    <div className="min-h-screen bg-[#F3F1F5]">
      <VerifiedPropertyActionModal
        action={verifiedAction}
        propertyId={property.id}
        propertyTitle={property.title}
        contactNumber={listedBy?.phone || "+919876543210"}
        onClose={() => setVerifiedAction(null)}
        onComplete={completeVerifiedAction}
      />
      <LawyerConsultationModal
        open={showLawyerConsultation}
        propertyId={property.id}
        propertyTitle={property.title}
        propertyLocation={property.subtitle}
        propertyPrice={property.price}
        onClose={() => setShowLawyerConsultation(false)}
      />
      <Header />

      {/* Main property media: every uploaded photo remains fully visible. */}
      <section className="relative h-[440px] w-full overflow-hidden bg-black md:h-[560px]">
        {heroImages.map((image, index) => {
          const isActive = index === heroImageIndex;
          return (
            <div
              key={image}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
              aria-hidden={!isActive}
            >
              <img src={image} alt="" aria-hidden="true" className="absolute inset-0 size-full scale-110 object-cover opacity-35 blur-2xl" />
              <img
                src={image}
                alt={isActive ? `${property.title} main photo ${index + 1}` : ""}
                className="relative size-full object-contain"
              />
            </div>
          );
        })}
        {/* Bottom-only scrim so the property image stays visible while the title remains legible */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0B1328] via-[#0B1328]/45 to-transparent" />

        {heroImages.length > 1 && (
          <div className="absolute right-5 top-5 z-20 flex items-center gap-2 rounded-full bg-[#0B1328]/65 px-3 py-2 backdrop-blur-md" aria-label="Project overview photos">
            {heroImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setHeroImageIndex(index)}
                className={`h-2 rounded-full transition-all ${index === heroImageIndex ? "w-7 bg-[#F2C052]" : "w-2 bg-white/65 hover:bg-white"}`}
                aria-label={`Show main photo ${index + 1}`}
                aria-current={index === heroImageIndex ? "true" : undefined}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 mx-auto flex h-full max-w-[1200px] flex-col justify-end px-5 pb-7">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-[#DDAA42] text-[#0B1328] text-[11px] font-bold px-3 py-1 rounded-full">
              <ShieldCheck className="size-3.5" /> CLEAR TITLE VERIFIED
            </span>
            {property.badges?.map((b) => (
              <span key={b} className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {b}
              </span>
            ))}
          </div>

          <h1 className="max-w-3xl text-[30px] font-bold leading-[1.08] text-white text-shadow-lg md:text-[40px]">
            {property.title}
          </h1>
          <p className="text-[14px] md:text-[16px] text-white/80 flex items-center gap-2 mt-3">
            <MapPin className="size-4.5 text-[#F2C052]" /> {property.subtitle}
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-5">
            <div>
              <span className="text-[11px] text-white/50 uppercase font-bold tracking-wider block">Starting Price</span>
              <span className="text-[30px] font-extrabold leading-none text-gold-gradient md:text-[36px]">{property.price}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-white">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Clock className="size-4.5 text-[#F2C052]" />
                <span className="text-[13px] font-bold">{possessionLabel}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setVerifiedAction("enquiry")}
              className="btn-gold flex items-center gap-2 px-6 py-3 rounded-xl text-[14px]"
            >
              <Phone className="size-4.5" /> Enquire Now
            </button>
            <button
              onClick={() => setVerifiedAction("brochure")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold text-white bg-white/10 backdrop-blur-md border border-[#F2C052]/40 hover:bg-white/15 transition-all"
            >
              <Download className="size-4.5 text-[#F2C052]" /> Download Brochure
            </button>
          </div>
        </div>

      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#F3F1F5]/65">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-[12px] text-[#68646F] font-medium tracking-wide">
            <Link href="/" className="text-[#DDAA42] hover:text-[#B98428] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/property-in-bangalore-ffid" className="text-[#DDAA42] hover:text-[#B98428] transition-colors">Bangalore Portfolio</Link>
            <span>/</span>
            <span className="text-[#121B35] font-bold">{property.title}</span>
          </div>
        </div>
      </div>

      {/* Sticky TabBar */}
      <div
        ref={tabBarRef}
        className={`${isTabBarSticky ? "fixed top-[64px] md:top-[72px] left-0 right-0 z-40 shadow-md border-b border-[#E4E0E7]/20" : ""} bg-white transition-all duration-300`}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {visibleSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-4 py-3 text-[13px] font-bold tracking-wide uppercase transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeSection === section.id
                    ? "text-[#DDAA42] border-[#DDAA42]"
                    : "text-[#68646F] border-transparent hover:text-[#121B35]"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container with desktop advertising rails */}
      <div className={isPromotedProperty
        ? "mx-auto max-w-[1580px] px-4 py-7"
        : "mx-auto grid max-w-[1580px] gap-5 px-4 py-7 min-[1500px]:grid-cols-[150px_minmax(0,1200px)_150px]"
      }>
        {!isPromotedProperty && <AdRail side="left" />}
        <div className={`grid min-w-0 grid-cols-1 items-start gap-7 ${isPromotedProperty ? "lg:grid-cols-[minmax(0,1fr)_380px]" : "lg:grid-cols-[minmax(0,1.45fr)_340px]"}`}>
          {/* Left Block */}
          <div className="space-y-8">
            {/* Photo gallery */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-[#E4E0E7]/30 p-2">
              <div className="flex items-center gap-2 p-2">
                <span className="flex items-center gap-2 rounded-xl bg-[#121B35] px-4 py-2 text-[13px] font-bold text-white"><Images className="size-4" /> Photos ({images.length})</span>
              </div>

              <>
                  <div className="relative aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden">
                    {isBase64(images[currentImageIndex]) ? (
                      <img src={images[currentImageIndex]} alt={property.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <Image src={images[currentImageIndex]} alt={property.title} fill className="object-cover" priority />
                    )}
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all" aria-label="Previous image">
                      <ChevronLeft className="w-6 h-6 text-[#121B35]" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all" aria-label="Next image">
                      <ChevronRight className="w-6 h-6 text-[#121B35]" />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-[#121B35]/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[12px] font-bold">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2.5">
                      <button onClick={handleShare} className="w-10 h-10 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all" title="Copy Link">
                        <Share2 className="w-5 h-5 text-[#121B35]" />
                      </button>
                      <button className="w-10 h-10 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                        <Heart className="w-5 h-5 text-[#121B35] hover:fill-red-500" />
                      </button>
                    </div>
                    {copiedLink && (
                      <div className="absolute top-16 right-4 bg-white text-[#121B35] text-[12px] font-bold px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in duration-300">
                        Link copied!
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2.5 p-4 overflow-x-auto no-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          currentImageIndex === idx ? "border-[#DDAA42] scale-[1.03] shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        {isBase64(img) ? (
                          <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <Image src={img} alt="" fill className="object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
              </>
            </div>

            {/* ── POLISHED PROPERTY DETAILS ── */}
            <div className="bg-white rounded-3xl shadow-md border border-[#E4E0E7]/30 overflow-hidden">
              {/* gold accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#DDAA42] via-[#F2C052] to-[#DDAA42]" />
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 bg-[#121B35] text-[#F2C052] text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <Building2 className="size-3" /> {property.propertyType || "Residence"}
                      </span>
                      {property.reraRegistered && (
                        <span className="inline-flex items-center gap-1 bg-[#F8F7FA] border border-[#E4E0E7] text-[#121B35] text-[11px] font-bold px-2.5 py-1 rounded-full">
                          <ShieldCheck className="size-3 text-[#DDAA42]" /> RERA
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 bg-[#F8F7FA] border border-[#E4E0E7] text-[#121B35] text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <Clock className="size-3 text-[#DDAA42]" /> {possessionLabel}
                      </span>
                    </div>
                    <h2 className="text-[24px] md:text-[30px] font-bold text-[#121B35] leading-tight">{property.title}</h2>
                    <p className="text-[14px] text-[#68646F] flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-4.5 h-4.5 text-[#DDAA42]" /> {property.subtitle}
                    </p>
                    {/* config chips */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {property.configs.map((c) => (
                        <span key={c} className="text-[12px] font-bold text-[#121B35] bg-[#F8F7FA] border border-[#E4E0E7]/60 px-3 py-1.5 rounded-lg">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* price card */}
                  <div className="shrink-0 bg-gradient-to-br from-[#121B35] to-[#273559] rounded-2xl p-5 text-center min-w-[180px] shadow-lg">
                    <span className="text-[10px] text-white/55 uppercase font-bold tracking-wider block">Price</span>
                    <p className="text-[28px] font-extrabold text-gold-gradient leading-none mt-1">{property.price}</p>
                    {property.pricePerSqft && (
                      <p className="text-[12px] text-white/65 font-semibold mt-2">{property.pricePerSqft}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-[10px] text-white/45 uppercase font-bold tracking-wider">Est. EMI</p>
                      <p className="text-[13px] text-[#F2C052] font-bold">On request</p>
                    </div>
                  </div>
                </div>

                {/* Key spec strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
                  {[
                    { icon: Bed, label: "Bedrooms", val: beds },
                    { icon: Bath, label: "Bathrooms", val: property.bathrooms ?? "—" },
                    { icon: Maximize, label: "Area", val: property.area },
                    { icon: Compass, label: "Facing", val: property.facing || "—" },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className="flex items-center gap-3 p-3.5 bg-[#F8F7FA] border border-[#E4E0E7]/50 rounded-2xl">
                      <div className="w-11 h-11 rounded-xl bg-white border border-[#E4E0E7]/60 flex items-center justify-center shrink-0 shadow-sm">
                        <Icon className="w-5 h-5 text-[#DDAA42]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider">{label}</p>
                        <p className="text-[15px] font-bold text-[#121B35] truncate">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {property.villaDetails?.configurationDetails.length ? (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#E4E0E7]/30">
                <h2 className="text-[20px] font-bold text-[#121B35] flex items-center gap-2 mb-5">
                  <div className="w-1.5 h-6 bg-[#DDAA42] rounded-full" /> Villa Configuration & Pricing
                </h2>
                <VillaConfigurationTable details={property.villaDetails.configurationDetails} />
              </div>
            ) : null}

            {property.plotDetails?.plotSizeDetails.length ? (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#E4E0E7]/30 space-y-7">
                <div><h2 className="text-[20px] font-bold text-[#121B35] flex items-center gap-2 mb-5"><div className="w-1.5 h-6 bg-[#DDAA42] rounded-full" /> Plot Sizes & Pricing</h2><PlotSizeTable details={property.plotDetails.plotSizeDetails} /></div>
                <div><h3 className="text-[17px] font-bold text-[#121B35] mb-4">Plot availability</h3><PlotInventoryTable inventory={property.plotDetails.inventory} /></div>
                <div className="pt-2"><h3 className="text-[17px] font-bold text-[#121B35] mb-4">Master Plan / Layout Map</h3>{property.plotDetails.layoutMapType === "image" ? <img src={property.plotDetails.layoutMapUrl} alt={`${property.title} layout map`} className="w-full max-h-[540px] object-contain bg-[#F8F7FA] rounded-2xl border border-[#E4E0E7]" /> : <a href={property.plotDetails.layoutMapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-[#121B35] text-white rounded-xl text-[13px] font-bold"><FileText className="w-4 h-4" /> View layout-map PDF</a>}</div>
              </div>
            ) : null}

            {/* Overview Section */}
            <div ref={setSectionRef("overview")} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#E4E0E7]/30 space-y-6">
              <h2 className="text-[20px] font-bold text-[#121B35] flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#DDAA42] rounded-full" /> Property Overview
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Property Type", val: property.propertyType || "Residential" },
                  { label: "Facing", val: property.facing || "—" },
                  { label: "Furnishing", val: property.furnishing || "—" },
                  { label: "Parking", val: property.parking || "—" },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-[#F8F7FA]/60 border border-[#E4E0E7]/40 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider">{label}</span>
                    <p className="text-[14px] font-bold text-[#121B35] mt-1">{val}</p>
                  </div>
                ))}
              </div>

              {(floorDisplay || property.reraNumber || property.ownershipType || property.overlooking?.length || property.bookingAmount || property.maintenanceCharges) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Floor", val: floorDisplay },
                    { label: "RERA Number", val: property.reraNumber },
                    { label: "Ownership", val: property.ownershipType },
                    { label: "Overlooking", val: property.overlooking?.join(", ") },
                    { label: "Booking Amount", val: property.transactionType === "New Property" ? property.bookingAmount : "" },
                    { label: "Maintenance", val: property.maintenanceCharges ? `${property.maintenanceCharges} / ${property.maintenancePeriod || "month"}` : "" },
                  ].filter((item) => item.val).map(({ label, val }) => <div key={label} className="bg-[#F8F7FA]/60 border border-[#E4E0E7]/40 p-3.5 rounded-2xl"><span className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider">{label}</span><p className="text-[14px] font-bold text-[#121B35] mt-1">{val}</p></div>)}
                </div>
              )}

              {villaOverviewFacts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {villaOverviewFacts.map(({ label, val }) => <div key={label} className="bg-[#F8F7FA]/60 border border-[#E4E0E7]/40 p-3.5 rounded-2xl"><span className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider">{label}</span><p className="text-[14px] font-bold text-[#121B35] mt-1">{val}</p></div>)}
                </div>
              )}
              {plotOverviewFacts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {plotOverviewFacts.map(({ label, val }) => <div key={label} className="bg-[#F8F7FA]/60 border border-[#E4E0E7]/40 p-3.5 rounded-2xl"><span className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider">{label}</span><p className="text-[14px] font-bold text-[#121B35] mt-1">{val}</p></div>)}
                </div>
              )}
              {commercialOverviewFacts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {commercialOverviewFacts.map(({ label, val }) => <div key={label} className="bg-[#F8F7FA]/60 border border-[#E4E0E7]/40 p-3.5 rounded-2xl"><span className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider">{label}</span><p className="text-[14px] font-bold text-[#121B35] mt-1">{val}</p></div>)}
                </div>
              )}
              {property.pgDetails?.sharingDetails.length ? <div><h3 className="text-[17px] font-bold text-[#121B35] mb-3">Sharing options & availability</h3><div className="overflow-x-auto"><table className="min-w-[580px] w-full text-[13px]"><thead className="bg-[#121B35] text-white"><tr><th className="p-3 text-left">Sharing type</th><th>Rent / bed / month</th><th>Deposit</th><th>Beds available</th></tr></thead><tbody>{property.pgDetails.sharingDetails.map((row) => <tr key={row.sharingType} className="border-b border-[#F3F1F5]"><td className="p-3 font-semibold">{row.sharingType}</td><td className="text-center">₹{row.rentPerBed.toLocaleString("en-IN")}</td><td className="text-center">₹{row.deposit.toLocaleString("en-IN")}</td><td className="text-center">{row.bedsAvailable}</td></tr>)}</tbody></table></div></div> : null}
              {pgOverviewFacts.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{pgOverviewFacts.map(({ label, val }) => <div key={label} className="bg-[#F8F7FA]/60 border border-[#E4E0E7]/40 p-3.5 rounded-2xl"><span className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider">{label}</span><p className="text-[14px] font-bold text-[#121B35] mt-1">{val}</p></div>)}</div>}

              <div>
                <span className="text-[11px] text-[#68646F] uppercase font-bold tracking-wider">About this property</span>
                <p className="text-[14.5px] text-[#3F3D46]/90 leading-relaxed mt-2.5">
                  {property.description || (property.villaDetails || property.plotDetails || property.commercialDetails || property.pgDetails ? "—" :
                    `This elegant signature space in ${property.subtitle} delivers modern architecture and high-end layouts. Spanning ${property.area}, it offers well-ventilated rooms, designer fittings, and spacious interiors. Located in a prime zone with quick access to tech parks, schools, and healthcare. Verified clear-title documentation guarantees a safe investment.`
                  )}
                </p>
              </div>

            </div>

            {property.configurationDetails && property.configurationDetails.length > 0 && (
              <div ref={setSectionRef("plans")}>
                <FloorPlanExplorer
                  details={property.configurationDetails}
                  status={property.possessionDetails?.status || property.possession || "Available"}
                  possession={possessionLabel}
                  onRequestCallback={() => setVerifiedAction("enquiry")}
                />
              </div>
            )}

            {(amenities.length > 0 || property.facilities?.length) && (
              <div ref={setSectionRef("facilities")}>
                <FacilityExplorer amenities={amenities} facilities={property.facilities} />
              </div>
            )}

            {/* Brochure Section */}
            <div ref={setSectionRef("brochure")} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#E4E0E7]/30 space-y-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-[20px] font-bold text-[#121B35] flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-[#DDAA42] rounded-full" /> Property Brochure
                </h2>
                <button onClick={() => setVerifiedAction("brochure")} className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px]">
                  <Download className="size-4" /> Download Brochure
                </button>
              </div>

              {isPdfBrochure ? (
                <div className="rounded-2xl overflow-hidden border border-[#E4E0E7]/50 bg-[#F8F7FA]">
                  <iframe src={property.brochure} title="Brochure preview" className="w-full h-[560px]" />
                </div>
              ) : (
                <div className="relative rounded-2xl border border-[#E4E0E7]/50 overflow-hidden bg-gradient-to-br from-[#121B35] to-[#273559] p-8 md:p-10 text-white">
                  <div className="absolute -right-8 -top-8 w-48 h-48 bg-[#DDAA42]/10 rounded-full blur-3xl" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-[150px] h-[200px] bg-white rounded-xl shadow-2xl shrink-0 overflow-hidden -rotate-2">
                      <img src={isBase64(property.image) ? property.image : `${property.image}`} alt="" className="w-full h-28 object-cover" />
                      <div className="p-3">
                        <div className="h-2 w-3/4 bg-[#E4E0E7] rounded mb-1.5" />
                        <div className="h-2 w-1/2 bg-[#E4E0E7] rounded mb-3" />
                        <div className="text-[10px] font-bold text-[#DDAA42]">{property.price}</div>
                      </div>
                      <span className="absolute top-2 left-2 bg-[#DDAA42] text-[#0B1328] text-[7px] font-bold px-1.5 py-0.5 rounded">CLEAR TITLE</span>
                    </div>
                    <div className="text-center md:text-left">
                      <FileText className="size-7 text-[#F2C052] mx-auto md:mx-0 mb-2" />
                      <h3 className="text-[20px] font-bold">{property.title} — Digital Brochure</h3>
                      <p className="text-[13.5px] text-white/65 mt-1.5 max-w-md">
                        Full specifications, floor plans, pricing and amenities — packaged in a shareable brochure.
                      </p>
                      <button onClick={() => setVerifiedAction("brochure")} className="mt-4 inline-flex items-center gap-2 btn-gold px-5 py-2.5 rounded-xl text-[13px]">
                        <Download className="size-4" /> Get the Brochure
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Society & Maintenance */}
            {societyFacts.length > 0 && <div ref={setSectionRef("society")} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#E4E0E7]/30 space-y-6">
              <h2 className="text-[20px] font-bold text-[#121B35] flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#DDAA42] rounded-full" /> Society & Maintenance
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {societyFacts.map(({ label, val }) => (
                  <div key={label} className="p-4 bg-[#F8F7FA]/60 border border-[#E4E0E7]/40 rounded-2xl">
                    <span className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider">{label}</span>
                    <p className="text-[14px] font-bold text-[#121B35] mt-1">{val}</p>
                  </div>
                ))}
              </div>
            </div>}

            {/* Developer Profile */}
            <div ref={setSectionRef("dealer")} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#E4E0E7]/30 space-y-6">
              <h2 className="text-[20px] font-bold text-[#121B35] flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#DDAA42] rounded-full" /> Developer Profile
              </h2>
              <div className="flex items-center gap-4.5 bg-[#F8F7FA]/60 border border-[#E4E0E7]/40 p-5 rounded-2xl flex-wrap">
                <div className="w-16 h-16 bg-gradient-to-br from-[#121B35] to-[#273559] rounded-2xl flex items-center justify-center text-[#F2C052] font-extrabold text-[20px] shadow overflow-hidden">
                  {property.developerLogoUrl ? <img src={property.developerLogoUrl} alt={`${property.builder || "Developer"} logo`} className="h-full w-full object-contain bg-white" /> : property.builder ? property.builder.split(" ").map((w) => w[0]).join("") : "CT"}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-bold text-[#121B35]">{property.builder || "ClearTitle Verified Owner"}</h3>
                    <Verified className="w-5 h-5 text-[#DDAA42]" />
                  </div>
                  <p className="text-[12px] text-[#68646F] font-semibold tracking-wide uppercase mt-0.5">Corporate Developer Partner</p>
                  <div className="flex items-center gap-4 mt-3 text-[12px] text-[#3F3D46]/85">
                    <span className="flex items-center gap-1"><Check className="size-4 text-[#DDAA42]" /> Verified titles</span>
                    {property.reraRegistered && <span className="flex items-center gap-1"><Check className="size-4 text-[#DDAA42]" /> RERA Registered</span>}
                  </div>
                </div>
                {property.builder && (
                  <Link href={`/builder/${builderSlug(property.builder)}`} className="px-5 py-3 border border-[#DDAA42] text-[#DDAA42] font-bold text-[13px] rounded-xl hover:bg-[#DDAA42] hover:text-[#0B1328] transition-all shadow-sm">
                    View All Projects
                  </Link>
                )}
              </div>
            </div>

            {/* Dealers for this property */}
            {propertyDealers.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#E4E0E7]/30 space-y-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-[20px] font-bold text-[#121B35] flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-[#DDAA42] rounded-full" /> Dealers for this property
                  </h2>
                  <Link href="/dealers" className="text-[13px] font-bold text-[#DDAA42] hover:underline">View all dealers</Link>
                </div>
                <p className="text-[13px] text-[#68646F] -mt-2">Contact a verified channel partner handling this listing.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {propertyDealers.map((d) => (
                    <div key={d.id} className="flex items-center gap-4 p-4 bg-[#F8F7FA]/60 border border-[#E4E0E7]/50 rounded-2xl">
                      <div className="relative shrink-0">
                        <span className="size-14 rounded-full bg-white border border-[#DDAA42]/40 flex items-center justify-center text-[#121B35] font-bold overflow-hidden">
                          {d.logo ? <img src={d.logo} alt={d.agency} className="w-full h-full object-cover" /> : d.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                        </span>
                        <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-gradient-to-br from-[#F2C052] to-[#DDAA42] flex items-center justify-center shadow">
                          <ShieldCheck className="size-3.5 text-[#121B35]" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-[#121B35] truncate">{d.name}</p>
                        <p className="text-[12px] text-[#68646F] truncate">{d.agency}</p>
                        <p className="text-[11px] text-[#68646F]">Member since {d.memberSince}</p>
                      </div>
                      <Link href={`/dealer/${d.slug}`} className="shrink-0 px-4 py-2.5 border border-[#DDAA42] text-[#DDAA42] hover:bg-[#DDAA42] hover:text-[#0B1328] font-bold text-[12.5px] rounded-xl transition-colors flex items-center gap-1.5">
                        <Phone className="size-3.5" /> Contact
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locality Guide */}
            <div ref={setSectionRef("locality")} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#E4E0E7]/30 space-y-6">
              <h2 className="text-[20px] font-bold text-[#121B35] flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#DDAA42] rounded-full" /> Locality & Neighbourhood
              </h2>
              <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-[#F8F7FA] to-[#F3F1F5]/40 rounded-2xl overflow-hidden border border-[#E4E0E7]/50 flex items-center justify-center">
                {property.localityMapImageUrl ? (
                  <img src={property.localityMapImageUrl} alt={`${property.subtitle} locality map`} className="h-full w-full object-contain bg-white" />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "radial-gradient(#DDAA42 1.5px, transparent 1.5px), radial-gradient(#DDAA42 1.5px, transparent 1.5px)", backgroundSize: "24px 24px", backgroundPosition: "0 0, 12px 12px" }} />
                    <div className="text-center z-10 p-4">
                      <Navigation className="w-12 h-12 text-[#DDAA42] mx-auto mb-3" />
                      <p className="text-[15px] font-extrabold text-[#121B35] uppercase tracking-wider">{property.subtitle.split(",")[0] || "Bangalore"}</p>
                      <p className="text-[12px] text-[#68646F] font-semibold mt-1">Prime connectivity & infrastructure</p>
                    </div>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: School, label: "Schools", val: nearbyValue("schools", property.nearbyAmenities?.schools) },
                  { icon: Hospital, label: "Hospitals", val: nearbyValue("hospitals", property.nearbyAmenities?.hospitals) },
                  { icon: ShoppingBag, label: "Shopping", val: nearbyValue("shopping", property.nearbyAmenities?.shopping) },
                  { icon: Train, label: "Metro", val: nearbyValue("metro", property.nearbyAmenities?.metro) },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex gap-2.5 p-3.5 bg-[#F8F7FA]/60 border border-[#E4E0E7]/40 rounded-2xl">
                    <Icon className="w-5 h-5 text-[#DDAA42] shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider block">{label}</span>
                      <span className="text-[13px] font-bold text-[#121B35] mt-0.5 block">{val}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price-trend insight strip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#F8F7FA] to-[#FFF8E8] border border-[#E4E0E7]/60 rounded-2xl">
                <div className="flex items-center gap-3">
                  <img src={insight.image} alt={insight.name} className="size-14 rounded-full object-cover border border-[#E4E0E7]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-bold text-[#121B35]">{insight.name}</p>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#1E7A46] bg-[#E6F2EA] px-1.5 py-0.5 rounded">
                        {insight.rating} <Star className="size-3 fill-current" />
                      </span>
                    </div>
                    <p className="text-[12px] text-[#68646F]">Avg. <span className="font-semibold text-[#3F3D46]">{insight.pricePerSqft}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1 text-[14px] font-bold text-[#1E7A46]">
                    <TrendingUp className="size-4" /> {insight.yoy}
                  </span>
                  <Link href={insight.href} className="text-[13px] font-bold text-[#DDAA42] border border-[#DDAA42]/40 hover:bg-white px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
                    View Insights
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sticky Contact Card */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="bg-[#121B35] rounded-3xl p-6 text-white border border-[#DDAA42]/35 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-gradient-to-br from-[#F2C052]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3.5 mb-6 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 font-bold">
                  {property.builder ? property.builder.slice(0, 2) : "CT"}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#F2C052]">{property.builder || "ClearTitle One Verified Owner"}</h4>
                  <p className="text-[11px] text-white/50">Verified Lister</p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <button onClick={() => setVerifiedAction("call")} className="w-full btn-gold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-[14px]">
                  <Phone className="w-4.5 h-4.5" /> Reveal Contact Number
                </button>
                <button onClick={() => setVerifiedAction("brochure")} className="w-full bg-white/10 hover:bg-white/15 border border-[#F2C052]/40 text-[#F2C052] font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Download className="w-4.5 h-4.5" /> Download Brochure
                </button>
                <button
                  onClick={() => {
                    trackAnalytics("lawyer_consultation_opened", { propertyId: property.id, propertyTitle: property.title, location: property.subtitle, source: "property_detail" });
                    setShowLawyerConsultation(true);
                  }}
                  className="w-full bg-[#DDAA42] hover:bg-[#B98428] text-[#0B1328] font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Scale className="w-4.5 h-4.5 text-[#F2C052]" /> Consult Lawyer on Title
                </button>
                <button onClick={() => setVerifiedAction("enquiry")} className="w-full border-2 border-white/10 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4.5 h-4.5" /> Leave Message
                </button>
              </div>

              {showContactForm && (
                <div className="mt-5 p-4.5 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 relative z-10">
                  <p className="text-[13px] font-bold text-[#F2C052] mb-3">Submit Enquiry</p>
                  <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert("Enquiry submitted successfully!"); setShowContactForm(false); }}>
                    <input type="text" required placeholder="Your Name" className="w-full h-10 px-3 bg-white/10 border border-white/15 rounded-xl text-[13px] text-white outline-none focus:border-[#F2C052] placeholder:text-white/40" />
                    <input type="tel" required placeholder="Phone Number" className="w-full h-10 px-3 bg-white/10 border border-white/15 rounded-xl text-[13px] text-white outline-none focus:border-[#F2C052] placeholder:text-white/40" />
                    <textarea placeholder="I'd like to schedule a site visit..." rows={3} required className="w-full p-3 bg-white/10 border border-white/15 rounded-xl text-[13px] text-white outline-none focus:border-[#F2C052] resize-none placeholder:text-white/40" />
                    <button type="submit" className="w-full bg-[#DDAA42] hover:bg-[#B98428] text-[#0B1328] font-bold py-2.5 rounded-xl text-[12.5px] transition-colors shadow">Book Visit / Request Documents</button>
                  </form>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-white/10 space-y-3 relative z-10">
                <div className="flex items-center gap-2.5 text-[12.5px] text-[#F2C052]">
                  <Scale className="w-4 h-4 shrink-0" /> <span className="font-extrabold">Title deed audited by Legal Panel</span>
                </div>
                <div className="flex items-center gap-2.5 text-[12.5px] text-white/80">
                  <Shield className="w-4 h-4 text-[#F2C052] shrink-0" /> <span>{property.reraRegistered ? "RERA Registered development" : "Clear-title documentation review"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[12.5px] text-white/80">
                  <Check className="w-4 h-4 text-[#DDAA42] shrink-0" /> <span>100% Genuine Media verified</span>
                </div>
              </div>
            </div>

            {/* Listed by verified dealer */}
            {listedBy && (
              <Link href={`/dealer/${listedBy.slug}`} className="block bg-white rounded-2xl p-5 shadow-sm border border-[#E4E0E7]/40 hover:border-[#DDAA42]/60 hover:shadow-md transition-all group">
                <p className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider mb-3">Listed by Verified Dealer</p>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <span className="size-14 rounded-full bg-[#F8F7FA] border border-[#DDAA42]/40 flex items-center justify-center text-[#121B35] overflow-hidden">
                      {listedBy.logo ? (
                        <img src={listedBy.logo} alt={listedBy.agency} className="w-full h-full object-cover" />
                      ) : (
                        <Verified className="size-6 text-[#DDAA42]" />
                      )}
                    </span>
                    <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-gradient-to-br from-[#F2C052] to-[#DDAA42] flex items-center justify-center shadow">
                      <ShieldCheck className="size-3.5 text-[#121B35]" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[#121B35] group-hover:text-[#DDAA42] transition-colors truncate">{listedBy.name}</p>
                    <p className="text-[12px] text-[#68646F] truncate">{listedBy.agency}</p>
                    <p className="text-[11px] text-[#68646F] mt-0.5">Member since {listedBy.memberSince}</p>
                  </div>
                </div>
                <span className="mt-4 w-full h-10 rounded-xl border border-[#DDAA42] text-[#DDAA42] group-hover:bg-[#DDAA42] group-hover:text-[#0B1328] font-bold text-[13px] flex items-center justify-center transition-colors">
                  View Dealer Profile
                </span>
              </Link>
            )}

            <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-[#E4E0E7]/30 text-center">
              <p className="text-[12px] text-[#68646F] font-semibold">Spotted an error in this listing?</p>
              <button className="text-[12.5px] text-[#DDAA42] font-bold hover:underline mt-1">Report listing</button>
            </div>
          </div>
        </div>
        {!isPromotedProperty && <AdRail side="right" />}
      </div>

      {/* ── EXPLORE MORE: multiple property rails ── */}
      <div ref={setSectionRef("explore")} className="bg-[#F3F1F5] border-t border-[#E4E0E7]/50">
        <div className="max-w-[1200px] mx-auto px-4 py-16 space-y-14">
          <PropertyRail title="Recommended for You" subtitle="Curated Picks" Icon={Sparkles} items={pools.recommended} />
          <PropertyRail title="Similar Properties" subtitle="Comparable Homes" Icon={Layers} items={pools.similar} />
          <PropertyRail title="Featured Properties" subtitle="Editor's Choice" Icon={Star} items={pools.featured} />
          <PropertyRail title="Based on Your Interests" subtitle={`More in ${property.subtitle.split(",")[0] || "Bangalore"}`} Icon={HeartIcon} items={pools.interests} />
          {pools.builderMore.length > 0 && (
            <PropertyRail title={`More from ${property.builder}`} subtitle="Same Developer" Icon={TrendingUp} items={pools.builderMore} />
          )}
        </div>
      </div>

      {/* Popular builders */}
      <PopularBuilders />

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121B35]/95 backdrop-blur-md border-t border-[#DDAA42]/30 shadow-2xl">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider truncate">{property.title}</p>
            <p className="text-[20px] font-extrabold text-gold-gradient leading-none">{property.price}</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button onClick={() => setVerifiedAction("brochure")} className="hidden sm:flex items-center gap-2 border border-[#F2C052]/40 text-[#F2C052] font-bold text-[13px] px-5 py-2.5 rounded-xl hover:bg-white/5 transition-all">
              <Download className="size-4" /> Brochure
            </button>
            <button onClick={() => setVerifiedAction("call")} className="hidden sm:flex items-center gap-2 border border-white/20 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all">
              <Phone className="size-4" /> Call
            </button>
            <button onClick={() => setVerifiedAction("enquiry")} className="btn-gold flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px]">
              <MessageCircle className="size-4" /> Enquire Now
            </button>
          </div>
        </div>
      </div>

      <div className="h-20" />
      <Footer />
    </div>
  );
}
