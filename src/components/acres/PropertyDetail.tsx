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
  Home,
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
  BarChart3,
  Play,
  Tag,
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
import { useLiveProperties } from "@/lib/useLiveProperties";
import { formatPossession } from "@/lib/propertyDetails";
import VillaConfigurationTable from "./VillaConfigurationTable";
import PlotSizeTable from "./PlotSizeTable";
import PlotInventoryTable from "./PlotInventoryTable";
import FloorPlanExplorer from "./FloorPlanExplorer";
import ApartmentPriceList from "./ApartmentPriceList";
import FacilityExplorer from "./FacilityExplorer";
import AdRail from "./AdRail";
import VerifiedPropertyActionModal, { type PropertyAction } from "./VerifiedPropertyActionModal";
import LawyerConsultationModal from "./LawyerConsultationModal";
import { configurationPriceRange, getProjectHeroImages, priceWithCharges } from "@/lib/propertyPresentation";
import { trackAnalytics } from "@/lib/analytics";
import { useHomepagePromotion } from "@/lib/useHomepagePromotion";
import PropertyReraSections from "./PropertyReraSections";

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
  { id: "overview", label: "About" },
  { id: "price-list", label: "Price List" },
  { id: "floor-plans", label: "Floor Plans" },
  { id: "photos-videos", label: "Photos & Videos" },
  { id: "facilities", label: "Amenities" },
  { id: "society", label: "Specifications" },
  { id: "brochure", label: "Download Hub" },
  { id: "locality", label: "Map & Landmarks" },
  { id: "rera-details", label: "RERA Details" },
  { id: "dealer", label: "About Builder" },
  { id: "explore", label: "Similar Projects" },
];

/* Ã¢â€â‚¬Ã¢â€â‚¬ Horizontal property rail Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
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
  const [showAllOverviewFacts, setShowAllOverviewFacts] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [verifiedAction, setVerifiedAction] = useState<PropertyAction | null>(null);
  const [showLawyerConsultation, setShowLawyerConsultation] = useState(false);

  // DBG006: Reset media state when navigating to a different property to prevent out-of-bounds crash
  useEffect(() => {
    setCurrentImageIndex(0);
    setHeroImageIndex(0);
    setShowAllOverviewFacts(false);
    setDescriptionExpanded(false);
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

  // Nearest matching locality insight for the price-trend strip.
  const localityKey = (property.subtitle?.split(",")[0] || "").toLowerCase();
  const insight = localityKey
    ? localityInsights.find((l) => localityKey.includes(l.name.toLowerCase())) || localityInsights.find((l) => l.name.toLowerCase().includes(localityKey))
    : undefined;

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setSectionRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  const tabBarRef = useRef<HTMLDivElement>(null);
  const tabBarMarkerRef = useRef<HTMLDivElement>(null);

  const images = [...new Set([...(property.heroImages || []), ...(property.images || []), property.image].filter(Boolean))];
  const heroImages = getProjectHeroImages(property);
  const primaryImage = images[currentImageIndex] || heroImages[0] || "";
  const galleryPreviewImages = images
    .map((image, index) => ({ image, index }))
    .filter((item) => item.index !== currentImageIndex)
    .slice(0, 4);
  const floorPlanPreview = property.configurationDetails?.find((detail) => detail.floorPlan3dUrl || detail.floorPlan2dUrl);
  const propertyVideo = property.videos?.[0] || property.heroVideo;
  const mediaTiles = [
    ...galleryPreviewImages.slice(0, floorPlanPreview || propertyVideo ? 2 : 4).map((item) => ({ key: `photo-${item.index}`, type: "photo" as const, src: item.image, index: item.index, label: "" })),
    ...(floorPlanPreview ? [{ key: "floor-plan", type: "floor-plan" as const, src: floorPlanPreview.floorPlan3dUrl || floorPlanPreview.floorPlan2dUrl || "", label: "3D Floor Plans" }] : []),
    ...(propertyVideo ? [{ key: "video", type: "video" as const, src: propertyVideo, label: "Video" }] : []),
  ].slice(0, 4);

  useEffect(() => {
    if (heroImages.length < 2) return;
    const rotation = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % heroImages.length);
    }, 6500);
    return () => window.clearInterval(rotation);
  }, [property.id, heroImages.length]);

  const possessionLabel = formatPossession(property);
  const displayPrice = configurationPriceRange(property.configurationDetails, property.price);
  const flatFloor = property.floorLabel?.trim();
  const floorDisplay = flatFloor
    ? `${flatFloor}${property.totalFloors ? ` of ${property.totalFloors}` : ""}`
    : property.propertyType === "Apartment" ? "" : property.floor || "";
  const nearbyValue = (key: "schools" | "colleges" | "hospitals" | "shopping" | "metro", legacy?: string) => {
    const detail = property.nearbyDetails?.[key];
    if (detail?.places?.length) return `${detail.places.length} nearby`;
    if (detail && (detail.count !== undefined || detail.distance)) {
      return [detail.count !== undefined ? `${detail.count}` : "", detail.distance].filter(Boolean).join(" Ã‚Â· ");
    }
    return legacy || "";
  };

  const amenities =
    property.amenities && property.amenities.length > 0
      ? property.amenities
      : property.pgDetails?.commonAmenities || [];
  const hasFloorPlans = Boolean(property.configurationDetails?.some((detail) =>
    detail.floorPlan2dUrl || detail.floorPlan3dUrl || detail.rooms?.length
  ));
  const hasPriceList = Boolean(property.configurationDetails?.length || property.villaDetails?.configurationDetails?.length || property.plotDetails?.plotSizeDetails?.length);
  const hasPhotosOrVideos = Boolean(images.length || property.videos?.length || property.heroVideo);
  const hasBrochure = Boolean(property.brochure);
  const hasReraPhases = Boolean(property.reraRegistered && property.reraPhases?.length);
  const hasFacilities = amenities.length > 0 || Boolean(property.facilities?.length);
  const hasSociety = Boolean(
    property.society && Object.values(property.society).some(Boolean)
  );
  const hasLocalityContent = Boolean(
    property.localityMapImageUrl ||
    property.locality?.address ||
    insight ||
    (property.nearbyAmenities && Object.values(property.nearbyAmenities).some(Boolean)) ||
    (property.nearbyDetails && Object.values(property.nearbyDetails).some((item) => item && (item.places?.length || item.count !== undefined || item.distance)))
  );
  const visibleSections = sections.filter((section) =>
    (section.id !== "price-list" || hasPriceList) &&
    (section.id !== "floor-plans" || hasFloorPlans) &&
    (section.id !== "photos-videos" || hasPhotosOrVideos) &&
    (!["rera-details", "project-details"].includes(section.id) || hasReraPhases) &&
    (section.id !== "facilities" || hasFacilities) &&
    (section.id !== "society" || hasSociety) &&
    (section.id !== "dealer" || Boolean(property.builder || property.developerLogoUrl)) &&
    (section.id !== "brochure" || hasBrochure) &&
    (section.id !== "locality" || hasLocalityContent)
  );

  useEffect(() => {
    const handleScroll = () => {
      if (tabBarMarkerRef.current) {
        setIsTabBarSticky(tabBarMarkerRef.current.getBoundingClientRect().top <= 64);
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
  }, [hasFacilities, hasFloorPlans, hasPriceList, hasPhotosOrVideos, hasSociety]);

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
    if (!property.brochure) return;
    const a = document.createElement("a");
    a.href = property.brochure;
    a.download = property.brochureName || `${property.title?.replace(/\s+/g, "-") || "property"}-brochure`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const completeVerifiedAction = (action: PropertyAction) => {
    const eventType = action === "brochure" ? "brochure_download" : action === "call" ? "contact_reveal" : "enquiry_submitted";
    trackAnalytics(eventType, { propertyId: property.id, propertyTitle: property.title, location: property.subtitle, source: "property_detail" });
    if (action === "brochure") handleDownloadBrochure();
  };

  const bedrooms = property.bedrooms || property.configs?.[0]?.split(" ")[0] || "";
  const formatCurrency = (value?: number) =>
    value !== undefined && Number.isFinite(value) && value >= 0 ? `Ã¢â€šÂ¹${value.toLocaleString("en-IN")}` : "";
  const formatDate = (value?: string) => {
    if (!value) return "";
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(parsed);
  };
  const villaOverviewFacts = property.villaDetails ? [
    { label: "Villa Type", val: property.villaDetails.villaType },
    { label: "Plot Dimensions", val: property.villaDetails.plotDimensions },
    { label: "Number of Floors", val: property.villaDetails.numberOfFloors },
    { label: "Plot Facing", val: property.villaDetails.plotFacing },
    { label: "Corner Plot", val: property.villaDetails.cornerPlot === true ? "Yes" : property.villaDetails.cornerPlot === false ? "No" : "" },
    { label: "Road Width Facing", val: property.villaDetails.roadWidthFacing },
    { label: "Private Garden", val: property.villaDetails.privateGarden === true ? `Yes${property.villaDetails.privateGardenArea ? ` Ã‚Â· ${property.villaDetails.privateGardenArea}` : ""}` : property.villaDetails.privateGarden === false ? "No" : "" },
    { label: "Private Pool", val: property.villaDetails.privatePool === true ? "Yes" : property.villaDetails.privatePool === false ? "No" : "" },
    { label: "Terrace", val: property.villaDetails.terrace === true ? `Yes${property.villaDetails.terraceDetails ? ` Ã‚Â· ${property.villaDetails.terraceDetails}` : ""}` : property.villaDetails.terrace === false ? "No" : "" },
    { label: "Gated Community", val: property.villaDetails.gatedCommunity === true ? "Yes" : property.villaDetails.gatedCommunity === false ? "No" : "" },
    { label: "Transaction", val: property.transactionType },
    { label: "Listing", val: property.listingType },
    { label: "RERA Number", val: property.reraRegistered ? property.reraNumber : "" },
  ].filter((item) => item.val) : [];
  const plotOverviewFacts = property.plotDetails ? [
    { label: "Plots in layout", val: String(property.plotDetails.totalPlots) },
    { label: "Approval authority", val: property.plotDetails.approvalAuthority },
    { label: "Approval number", val: property.plotDetails.approvalNumber },
    { label: "Road width", val: property.plotDetails.roadWidth },
    { label: "Drainage", val: property.plotDetails.civicInfrastructure?.undergroundDrainage },
    { label: "Electricity", val: property.plotDetails.civicInfrastructure?.electricity },
    { label: "Water", val: property.plotDetails.civicInfrastructure?.water },
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
    { label: "Bathrooms / Washrooms", val: property.commercialDetails.washrooms }, { label: "Parking", val: property.commercialDetails.parking },
    { label: "Power backup", val: property.commercialDetails.powerBackup }, { label: "Sanctioned load", val: property.commercialDetails.sanctionedLoadKva ? `${property.commercialDetails.sanctionedLoadKva} KVA` : "" },
    { label: "Fire safety", val: property.commercialDetails.fireSafetyCompliance }, { label: "Furnishing", val: property.commercialDetails.furnishing },
  ].filter((item) => item.val) : [];
  const pgOverviewFacts = property.pgDetails ? [
    { label: "Gender preference", val: property.pgDetails.genderPreference }, { label: "Meals", val: property.pgDetails.mealsIncluded }, { label: "Food type", val: property.pgDetails.foodType },
    { label: "Wi-Fi", val: property.pgDetails.wifiIncluded === true ? "Included" : property.pgDetails.wifiIncluded === false ? "Not included" : "" }, { label: "Laundry", val: property.pgDetails.laundryIncluded === true ? property.pgDetails.laundrySchedule || "Included" : property.pgDetails.laundryIncluded === false ? "Not included" : "" },
    { label: "Housekeeping", val: property.pgDetails.housekeeping }, { label: "Curfew", val: property.pgDetails.curfewEntryTiming }, { label: "Visitors", val: property.pgDetails.visitorsAllowed },
    { label: "Notice period", val: property.pgDetails.noticePeriod }, { label: "Lock-in period", val: property.pgDetails.lockInPeriod }, { label: "Contact", val: property.pgDetails.contactType },
  ].filter((item) => item.val) : [];
  const rentOverviewFacts = property.rentDetails ? [
    { label: "Monthly rent", val: formatCurrency(property.rentDetails.monthlyRent) },
    { label: "Security deposit", val: formatCurrency(property.rentDetails.securityDeposit) },
    { label: "Configuration", val: property.rentDetails.configuration },
    { label: "Home type", val: property.rentDetails.rentalPropertyType },
    { label: "Available from", val: formatDate(property.rentDetails.availableFrom) },
    { label: "Lock-in period", val: property.rentDetails.lockInPeriod },
    { label: "Preferred tenants", val: property.rentDetails.preferredTenantTypes?.join(", ") },
    { label: "Super area", val: property.rentDetails.superArea },
    { label: "Carpet area", val: property.rentDetails.carpetArea },
    { label: "Floor", val: property.rentDetails.floor ? `${property.rentDetails.floor}${property.rentDetails.totalFloors ? ` of ${property.rentDetails.totalFloors}` : ""}` : "" },
    { label: "Furnishing", val: property.rentDetails.furnishing },
    { label: "Parking", val: property.rentDetails.parking },
    { label: "Pets", val: property.rentDetails.petFriendly === true ? "Allowed" : property.rentDetails.petFriendly === false ? "Not allowed" : "" },
    { label: "Food preference", val: property.rentDetails.nonVegAllowed === true ? "No restriction" : property.rentDetails.nonVegAllowed === false ? "Vegetarian only" : "" },
    { label: "Listed by", val: property.rentDetails.contactType },
  ].filter((item) => item.val) : [];
  const leaseOverviewFacts = property.leaseDetails ? [
    { label: "Monthly lease rent", val: formatCurrency(property.leaseDetails.leaseRent) },
    { label: "Rent per sq ft", val: property.leaseDetails.rentPerSqft ? `Ã¢â€šÂ¹${property.leaseDetails.rentPerSqft.toLocaleString("en-IN")} / sq ft` : "" },
    { label: "Lease use", val: property.leaseDetails.leasePropertyType },
    { label: "Available from", val: formatDate(property.leaseDetails.availableFrom) },
    { label: "Carpet area", val: property.leaseDetails.carpetArea },
    { label: "Super area", val: property.leaseDetails.superArea },
    { label: "Lease tenure", val: property.leaseDetails.leaseTenure },
    { label: "Lock-in period", val: property.leaseDetails.lockInPeriod },
    { label: "Rent escalation", val: property.leaseDetails.rentEscalation },
    { label: "Security deposit", val: formatCurrency(property.leaseDetails.securityDeposit) },
    { label: "Furnishing", val: property.leaseDetails.furnishing },
    { label: "Preferred tenant", val: property.leaseDetails.preferredTenantType },
    { label: "Sub-leasing", val: property.leaseDetails.subLeasingAllowed === true ? "Allowed" : property.leaseDetails.subLeasingAllowed === false ? "Not allowed" : "" },
    { label: "Stamp duty", val: property.leaseDetails.registrationStampDutyResponsibility },
    { label: "Contact", val: property.leaseDetails.contactType },
  ].filter((item) => item.val) : [];
  const commonOverviewFacts = [
    { label: "Property type", val: property.propertyType },
    { label: "Transaction", val: property.transactionType },
    { label: "Facing", val: property.facing },
    { label: "Furnishing", val: property.furnishing },
    { label: "Parking", val: property.parking },
    { label: "Floor", val: floorDisplay },
    { label: "RERA number", val: property.reraNumber },
    { label: "Total project area", val: property.projectArea?.totalAcres !== undefined ? `${property.projectArea.totalAcres} acres` : "" },
    { label: "Open space area", val: property.projectArea?.openSpaceAcres !== undefined ? `${property.projectArea.openSpaceAcres} acres` : "" },
    { label: "Apartment built-up area", val: property.projectArea?.builtUpAcres !== undefined ? `${property.projectArea.builtUpAcres} acres` : "" },
    { label: "Number of units", val: property.totalUnits ? property.totalUnits.toLocaleString("en-IN") : "" },
  ].filter((item) => item.val);
  const typeOverviewFacts = property.villaDetails
    ? villaOverviewFacts
    : property.plotDetails
      ? plotOverviewFacts
      : property.commercialDetails
        ? commercialOverviewFacts
        : property.pgDetails
          ? pgOverviewFacts
          : property.rentDetails
            ? rentOverviewFacts
            : property.leaseDetails
              ? leaseOverviewFacts
              : [];
  const overviewFacts = [...commonOverviewFacts, ...typeOverviewFacts].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.label === item.label && candidate.val === item.val) === index
  );
  const overviewTitle = property.villaDetails
    ? "A closer look at this villa"
    : property.plotDetails
      ? "Layout and plot overview"
      : property.commercialDetails
        ? "Workspace and building details"
        : property.pgDetails
          ? "Stay, sharing and house rules"
          : property.rentDetails
            ? "Rental terms at a glance"
            : property.leaseDetails
              ? "Lease terms at a glance"
              : "Apartment overview";
  const keySpecFacts = property.plotDetails
    ? [
        { icon: Layers, label: "Total plots", val: property.plotDetails.totalPlots },
        { icon: Maximize, label: "Area range", val: property.area },
        { icon: ShieldCheck, label: "Approved by", val: property.plotDetails.approvalAuthority },
        { icon: Clock, label: "Layout status", val: property.plotDetails.layoutPossession?.status },
      ]
    : property.pgDetails
      ? [
          { icon: Bed, label: "Stay type", val: property.pgDetails.genderPreference },
          { icon: Clock, label: "Available", val: formatDate(property.pgDetails.availableFrom) },
          { icon: Building2, label: "Sharing options", val: property.pgDetails.sharingDetails?.length },
          { icon: ShieldCheck, label: "Managed by", val: property.pgDetails.contactType },
        ]
      : property.rentDetails
        ? [
            { icon: Bed, label: "Configuration", val: property.rentDetails.configuration },
            { icon: Maximize, label: "Area", val: property.rentDetails.superArea || property.rentDetails.carpetArea || property.area },
            { icon: Clock, label: "Available", val: formatDate(property.rentDetails.availableFrom) },
            { icon: Building2, label: "Furnishing", val: property.rentDetails.furnishing },
          ]
        : property.leaseDetails
          ? [
              { icon: Building2, label: "Lease type", val: property.leaseDetails.leasePropertyType },
              { icon: Maximize, label: "Area", val: property.leaseDetails.superArea || property.leaseDetails.carpetArea || property.area },
              { icon: Clock, label: "Available", val: formatDate(property.leaseDetails.availableFrom) },
              { icon: FileText, label: "Tenure", val: property.leaseDetails.leaseTenure },
            ]
          : property.commercialDetails
            ? [
                { icon: Building2, label: "Space type", val: property.commercialDetails.commercialSubtype },
                { icon: Maximize, label: "Area", val: property.commercialDetails.superArea || property.commercialDetails.builtUpArea || property.commercialDetails.carpetArea || property.area },
                { icon: Layers, label: "Building grade", val: property.commercialDetails.buildingGrade },
                { icon: Compass, label: "Zone", val: property.commercialDetails.zoneType },
              ]
            : property.villaDetails
              ? [
                  { icon: Home, label: "Villa type", val: property.villaDetails.villaType },
                  { icon: Maximize, label: "Area", val: property.area },
                  { icon: Layers, label: "Floors", val: property.villaDetails.numberOfFloors },
                  { icon: Compass, label: "Facing", val: property.villaDetails.plotFacing },
                ]
              : [
                  { icon: Bed, label: "Unit config", val: property.configs?.length ? `${property.configs.map((item) => item.replace(/\s*BHK/i, "")).join(", ")} BHK Flats` : bedrooms },
                  { icon: Maximize, label: "Size", val: property.area },
                  { icon: Building2, label: "Number of units", val: property.totalUnits?.toLocaleString("en-IN") },
                  { icon: Layers, label: "Total area", val: property.projectArea?.totalAcres !== undefined ? `${property.projectArea.totalAcres} acres` : "" },
                ];
  const societyFacts = [
    { label: "Security Desk", val: property.society?.security },
    { label: "Water Supply", val: property.society?.waterSupply },
    { label: "Power Backup", val: property.society?.powerBackup },
    { label: "Elevators", val: property.society?.lift },
    { label: "Visitor Parking", val: property.society?.visitorParking },
    { label: "Maintenance", val: property.society?.maintenanceStaff },
  ].filter((item) => item.val);
  const whyHighlights = (property.description || "")
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (!whyHighlights.length && property.projectArea?.totalAcres) {
    whyHighlights.push(`${property.projectArea.totalAcres}-acre project with dedicated residential and open-space areas.`);
  }
  if (whyHighlights.length < 2 && property.configs?.length) {
    whyHighlights.push(`${property.configs.join(", ")} configurations are available in this project.`);
  }

  return (
    <div className="property-detail-page min-h-screen">
      <VerifiedPropertyActionModal
        action={verifiedAction}
        propertyId={property.id}
        propertyTitle={property.title}
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

      <section ref={setSectionRef("photos-videos")} className="property-detail-intro mx-auto max-w-[1440px] px-4 pb-4 pt-3 md:px-5 md:pb-5">
        <nav className="mb-3 hidden items-center gap-2 overflow-hidden text-[12px] font-medium text-[#77717E] md:flex">
          <Link href="/" className="shrink-0 hover:text-[#B98428]">Home</Link>
          <ChevronRight className="size-3.5 shrink-0 text-[#B9B5BE]" />
          <Link href="/property-in-bangalore-ffid" className="shrink-0 hover:text-[#B98428]">
            Properties in Bangalore
          </Link>
          <ChevronRight className="size-3.5 shrink-0 text-[#B9B5BE]" />
          <span className="truncate text-[#121B35]">{property.title}</span>
        </nav>

        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_64px] items-start gap-3 md:grid-cols-[minmax(0,1fr)_88px]">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              {property.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF4D8] px-2 py-1 text-[9.5px] font-extrabold uppercase tracking-wide text-[#7A5710]">
                  <ShieldCheck className="size-3" /> ClearTitle verified
                </span>
              )}
              {property.reraRegistered && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9.5px] font-extrabold uppercase tracking-wide text-emerald-700">
                  <Shield className="size-3" /> RERA
                </span>
              )}
            </div>
            <h1 className="text-[25px] font-extrabold leading-[1.14] tracking-[-0.025em] text-[#1B2235] md:text-[34px]">
              {property.title}
            </h1>
            {property.subtitle && (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#5F5A66] md:text-[15px]">
                <span>{property.subtitle}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.subtitle)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#121B35] underline decoration-[#DDAA42] underline-offset-4"
                >
                  <MapPin className="size-4" /> See on map
                </a>
              </div>
            )}
            {property.description?.trim() && (
              <div className="mt-3 max-w-[1180px]">
                <p className={`text-[13px] leading-5 text-[#625D68] md:text-[14px] md:leading-6 ${descriptionExpanded ? "" : "line-clamp-2"}`}>
                  {property.description}
                </p>
                <button
                  type="button"
                  onClick={() => setDescriptionExpanded((value) => !value)}
                  className="mt-1 text-[12.5px] font-bold text-[#121B35] underline underline-offset-4 md:hidden"
                >
                  {descriptionExpanded ? "Read Less" : "Read More"}
                </button>
              </div>
            )}
          </div>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-[#E4E0E7] bg-white text-center shadow-sm">
            {property.developerLogoUrl ? (
              <img src={property.developerLogoUrl} alt={`${property.builder || property.title} logo`} className="size-full object-contain p-2" />
            ) : (
              <span className="px-1 text-[10px] font-extrabold leading-3 text-[#121B35] md:text-[12px]">
                {(property.builder || property.title).split(" ").slice(0, 2).map((word) => word[0]).join("")}
              </span>
            )}
          </div>
        </div>

        <div className="property-media-grid">
          <div className="property-media-main relative overflow-hidden bg-[#0B1328]">
            {primaryImage ? (
              <img src={primaryImage} alt={`${property.title} photo ${currentImageIndex + 1}`} className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-white/50">
                <Images className="size-10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="property-gallery-arrow left-3" aria-label="Previous image">
                  <ChevronLeft className="size-5" />
                </button>
                <button onClick={nextImage} className="property-gallery-arrow right-3" aria-label="Next image">
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
            <div className="absolute right-3 top-3 flex gap-2">
              <button onClick={handleShare} className="property-gallery-action" aria-label="Share property">
                <Share2 className="size-4.5" />
              </button>
              <button className="property-gallery-action" aria-label="Shortlist property">
                <Heart className="size-4.5" />
              </button>
            </div>
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#121B35] shadow">
              <Images className="mr-1 inline size-3.5" /> {images.length || 1} Photos
            </div>
            {copiedLink && (
              <div className="absolute right-3 top-14 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-[#121B35] shadow-lg">
                Link copied
              </div>
            )}
            {galleryPreviewImages.slice(0, 2).map((item, previewIndex) => (
              <button
                key={`mobile-${item.index}`}
                type="button"
                onClick={() => setCurrentImageIndex(item.index)}
                className="property-mobile-preview"
                style={{ right: `${12 + previewIndex * 74}px` }}
                aria-label={`Show photo ${item.index + 1}`}
              >
                <img src={item.image} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>

          <div className="property-media-side">
            {mediaTiles.map((item, previewIndex) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  if (item.type === "photo") setCurrentImageIndex(item.index);
                  if (item.type === "floor-plan") scrollToSection("floor-plans");
                  if (item.type === "video") window.open(item.src, "_blank", "noopener,noreferrer");
                }}
                className="relative min-h-0 overflow-hidden bg-[#E9E8EB]"
                aria-label={item.type === "photo" ? `Show photo ${item.index + 1}` : `Open ${item.label}`}
              >
                {item.type === "video" ? (
                  <span className="flex size-full items-center justify-center bg-[#121B35] text-white"><Play className="size-8 fill-white" /></span>
                ) : (
                  <img src={item.src} alt="" className="size-full object-cover transition-transform duration-500 hover:scale-105" />
                )}
                {item.type !== "photo" && <span className="absolute bottom-2 left-2 rounded bg-white/95 px-2 py-1 text-[10px] font-bold text-[#121B35] shadow">{item.label}</span>}
                {item.type === "photo" && previewIndex === mediaTiles.length - 1 && images.length > mediaTiles.length + 1 && (
                  <span className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#121B35] shadow">
                    +{images.length - mediaTiles.length - 1} more photos
                  </span>
                )}
              </button>
            ))}
            {mediaTiles.length === 0 && (
              <div className="flex min-h-0 items-center justify-center bg-[#EEEDEF] text-[#8A858F]">
                <Images className="size-7" />
              </div>
            )}
          </div>
        </div>

        <div className="property-reference-summary mt-3 grid overflow-hidden rounded-xl border border-[#DDE2EA] bg-white lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E8EE] px-4 py-4 md:px-5">
              <button type="button" onClick={() => scrollToSection("price-list")} className="flex items-center gap-3 text-left">
                <Tag className="size-7 text-[#303A50]" strokeWidth={1.7} />
                <span className="text-[21px] font-extrabold text-[#172039] md:text-[24px]">{priceWithCharges(displayPrice)}</span>
              </button>
              {hasPriceList && <button type="button" onClick={() => scrollToSection("price-list")} className="inline-flex items-center gap-2 rounded-lg border border-[#E7D4A7] bg-[#FFF7E6] px-3 py-2 text-[12px] font-bold text-[#303A50]"><BarChart3 className="size-4" /> Price Insights <ChevronRight className="size-4" /></button>}
            </div>
            <div className="grid border-b border-[#E5E8EE] sm:grid-cols-2">
              <div className="flex items-center gap-3 px-4 py-4 md:px-5"><Building2 className="size-7 shrink-0 text-[#56627A]" strokeWidth={1.6} /><div><p className="text-[11px] text-[#667085]">Project Status</p><p className="text-[14px] font-extrabold text-[#172039]">{property.possessionDetails?.status || property.possession || "Available"}</p></div></div>
              <div className="flex items-center gap-3 border-t border-[#E5E8EE] px-4 py-4 sm:border-l sm:border-t-0 md:px-5"><Clock className="size-7 shrink-0 text-[#56627A]" strokeWidth={1.6} /><div><p className="text-[11px] text-[#667085]">Possession Starting From</p><p className="text-[14px] font-extrabold text-[#172039]">{possessionLabel}</p></div>{hasReraPhases && <button type="button" onClick={() => scrollToSection("rera-details")} className="ml-auto rounded-lg border border-[#E7D4A7] bg-[#FFF7E6] px-2.5 py-1.5 text-[10px] font-bold text-[#4C566A]">RERA Updates</button>}</div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-y divide-[#E5E8EE] sm:grid-cols-4 sm:divide-y-0">
              {keySpecFacts.filter((item) => item.val !== undefined && item.val !== "").map(({ icon: Icon, label, val }) => (
                <button key={label} type="button" onClick={() => ["Unit config", "Size"].includes(label) && scrollToSection("price-list")} className="flex min-h-[92px] items-center gap-3 px-4 py-3 text-left hover:bg-[#FFF9E9]"><Icon className="size-7 shrink-0 text-[#56627A]" strokeWidth={1.6} /><span><span className="block text-[11px] text-[#667085]">{label}</span><span className="mt-0.5 block text-[13px] font-extrabold leading-4 text-[#172039]">{val}</span></span></button>
              ))}
            </div>
          </div>
          <aside className="flex flex-col border-t border-[#DDE2EA] bg-[#FCFCFD] lg:border-l lg:border-t-0">
            <div className="flex-1 px-5 py-4"><h2 className="text-[17px] font-extrabold text-[#172039]">Why you should consider {property.title}?</h2>{whyHighlights.length ? <ul className="mt-3 space-y-2.5">{whyHighlights.map((highlight) => <li key={highlight} className="flex gap-2 text-[12px] leading-5 text-[#4C566A]"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#172039]" />{highlight}</li>)}</ul> : <p className="mt-3 text-[12px] leading-5 text-[#4C566A]">Explore the project details, configurations and location information available for this property.</p>}<button type="button" onClick={() => scrollToSection("overview")} className="mt-3 text-[12px] font-bold text-[#172039] underline underline-offset-4">View More</button></div>
            <button type="button" onClick={() => setVerifiedAction("enquiry")} className="m-3 inline-flex items-center justify-center gap-2 rounded-lg bg-[#E3A815] px-4 py-3 text-[13px] font-extrabold text-[#241B09]"><Phone className="size-4" /> Request More Information or a Callback</button>
          </aside>
        </div>
      </section>

      {/* Main property media: every uploaded photo remains fully visible. */}
      {false && <section className="hidden">
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
            {property.verified && <span className="inline-flex items-center gap-1.5 bg-[#DDAA42] text-[#0B1328] text-[11px] font-bold px-3 py-1 rounded-full">
              <ShieldCheck className="size-3.5" /> CLEAR TITLE VERIFIED
            </span>}
            {property.badges?.map((b) => (
              <span key={b} className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {b}
              </span>
            ))}
          </div>

          {property.title && <h1 className="max-w-3xl text-[30px] font-bold leading-[1.08] text-white text-shadow-lg md:text-[40px]">
            {property.title}
          </h1>}
          {property.subtitle && <p className="text-[14px] md:text-[16px] text-white/80 flex items-center gap-2 mt-3">
            <MapPin className="size-4.5 text-[#F2C052]" /> {property.subtitle}
          </p>}

          {(property.price || possessionLabel !== "Ã¢â‚¬â€") && <div className="mt-4 flex flex-wrap items-end gap-5">
            {property.price && <div>
              <span className="text-[11px] text-white/50 uppercase font-bold tracking-wider block">Starting Price</span>
              <span className="text-[30px] font-extrabold leading-none text-gold-gradient md:text-[36px]">{priceWithCharges(property.price)}</span>
            </div>}
            {possessionLabel !== "Ã¢â‚¬â€" && <div className="flex flex-wrap gap-3 text-white">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Clock className="size-4.5 text-[#F2C052]" />
                <span className="text-[13px] font-bold">{possessionLabel}</span>
              </div>
            </div>}
          </div>}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setVerifiedAction("enquiry")}
              className="btn-gold flex items-center gap-2 px-6 py-3 rounded-xl text-[14px]"
            >
              <Phone className="size-4.5" /> Enquire Now
            </button>
            {hasBrochure && <button
              onClick={() => setVerifiedAction("brochure")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold text-white bg-white/10 backdrop-blur-md border border-[#F2C052]/40 hover:bg-white/15 transition-all"
            >
              <Download className="size-4.5 text-[#F2C052]" /> Download Brochure
            </button>}
          </div>
        </div>

      </section>}

      {/* Breadcrumb */}
      {false && <div className="hidden">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-[12px] text-[#68646F] font-medium tracking-wide">
            <Link href="/" className="text-[#DDAA42] hover:text-[#B98428] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/property-in-bangalore-ffid" className="text-[#DDAA42] hover:text-[#B98428] transition-colors">Bangalore Portfolio</Link>
            <span>/</span>
            <span className="text-[#121B35] font-bold">{property.title}</span>
          </div>
        </div>
      </div>}

      {/* Sticky TabBar */}
      <div ref={tabBarMarkerRef} className="h-px" aria-hidden="true" />
      <div
        ref={tabBarRef}
        className={`${isTabBarSticky ? "fixed top-[60px] md:top-[64px] left-0 right-0 z-40 shadow-md border-b border-[#E4E0E7]/20" : ""} bg-white transition-all duration-300`}
      >
        <div className="mx-auto max-w-[1440px] px-4 md:px-5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {visibleSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-4 py-3 text-[13px] font-bold transition-all duration-200 border-b-2 whitespace-nowrap ${
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
      {isTabBarSticky && <div className="h-[53px]" aria-hidden="true" />}

      {/* Main Container with desktop advertising rails */}
      <div className={isPromotedProperty
        ? "mx-auto max-w-[1580px] px-4 py-5"
        : "mx-auto grid max-w-[1580px] gap-5 px-4 py-5 min-[1500px]:grid-cols-[150px_minmax(0,1200px)_150px]"
      }>
        {!isPromotedProperty && <AdRail side="left" />}
        <div className={`grid min-w-0 grid-cols-1 items-start gap-4 ${isPromotedProperty ? "lg:grid-cols-[minmax(0,1fr)_380px]" : "lg:grid-cols-[minmax(0,1.45fr)_340px]"}`}>
          {/* Left Block */}
          <div className="space-y-4">
            {/* Photo gallery */}
            {false && <div className="hidden">
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
            </div>}

            {/* POLISHED PROPERTY DETAILS */}
            <div className="hidden property-summary-card bg-white rounded-2xl shadow-sm border border-[#E4E0E7] overflow-hidden">
              {/* gold accent bar */}
              <div className="h-1 bg-gradient-to-r from-[#DDAA42] via-[#F2C052] to-[#DDAA42]" />
              <div className="p-4 md:p-5">
                <div className="flex flex-col-reverse gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {property.propertyType && <span className="inline-flex items-center gap-1 bg-[#121B35] text-[#F2C052] text-[11px] font-bold px-2.5 py-1 rounded-full">
                          <Building2 className="size-3" /> {property.propertyType}
                        </span>}
                        {property.reraRegistered && (
                          <span className="inline-flex items-center gap-1 bg-[#F8F7FA] border border-[#E4E0E7] text-[#121B35] text-[11px] font-bold px-2.5 py-1 rounded-full">
                            <ShieldCheck className="size-3 text-[#DDAA42]" /> RERA
                          </span>
                        )}
                        {possessionLabel !== "—" && <span className="inline-flex items-center gap-1 bg-[#F8F7FA] border border-[#E4E0E7] text-[#121B35] text-[11px] font-bold px-2.5 py-1 rounded-full">
                          <Clock className="size-3 text-[#DDAA42]" /> {possessionLabel}
                        </span>}
                      </div>
                      {property.title && <h2 className="hidden">{property.title}</h2>}
                      {property.subtitle && <p className="text-[14px] font-bold text-[#68646F] flex items-center gap-1.5 mt-2.5">
                        <MapPin className="w-4.5 h-4.5 text-[#DDAA42]" /> {property.subtitle}
                      </p>}
                      {/* config chips */}
                      {!!property.configs?.length && <div className="flex flex-wrap gap-2 mt-4">
                        {property.configs.map((c) => (
                          <span key={c} className="text-[12px] font-bold text-[#121B35] bg-[#F8F7FA] border border-[#E4E0E7]/60 px-3 py-1.5 rounded-lg">
                            {c}
                          </span>
                        ))}
                      </div>}
                    </div>
  
                    {/* price card */}
                    {property.price && <button type="button" onClick={() => scrollToSection("price-list")} className="shrink-0 rounded-xl border border-[#E4E0E7] bg-[#FFFDF7] p-4 text-left min-w-[180px] transition hover:border-[#DDAA42] hover:shadow-sm">
                      <span className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider block">Price</span>
                      <p className="text-[25px] font-extrabold text-[#121B35] leading-none mt-1">{priceWithCharges(property.price)}</p>
                      {property.pricePerSqft && (
                        <p className="text-[11.5px] text-[#68646F] font-semibold mt-2">{property.pricePerSqft}</p>
                      )}
                    </button>}
                  </div>
  
                  {/* Key spec strip */}
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-px overflow-hidden rounded-xl bg-[#E4E0E7] mt-4">
                    {keySpecFacts.filter((item) => item.val !== undefined && item.val !== "").map(({ icon: Icon, label, val }) => (
                      <button key={label} type="button" onClick={() => ["Unit config", "Size"].includes(label) && scrollToSection("price-list")} className={`flex min-h-20 items-center gap-2.5 bg-white p-3 text-left ${["Unit config", "Size"].includes(label) ? "hover:bg-[#FFF9E9]" : "cursor-default"}`}>
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF8E8]">
                          <Icon className="w-5 h-5 text-[#DDAA42]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider">{label}</p>
                          <p className="line-clamp-2 text-[13px] font-bold leading-4 text-[#121B35]">{val}</p>
                        </div>
                      </button>
                    ))}
                  </div>
              </div>
            </div>

            {property.villaDetails?.configurationDetails?.length ? (
              <div ref={setSectionRef("price-list")} className="bg-white rounded-3xl p-5 md:p-6 shadow-md border border-[#E4E0E7]/30">
                <h2 className="text-[20px] font-bold text-[#121B35] flex items-center gap-2 mb-5">
                  <div className="w-1.5 h-6 bg-[#DDAA42] rounded-full" /> Villa Configuration & Pricing
                </h2>
                <VillaConfigurationTable details={property.villaDetails.configurationDetails} />
              </div>
            ) : null}

            {property.plotDetails?.plotSizeDetails?.length ? (
              <div ref={setSectionRef("price-list")} className="bg-white rounded-3xl p-5 md:p-6 shadow-md border border-[#E4E0E7]/30 space-y-5">
                <div><h2 className="text-[20px] font-bold text-[#121B35] flex items-center gap-2 mb-5"><div className="w-1.5 h-6 bg-[#DDAA42] rounded-full" /> Plot Sizes & Pricing</h2><PlotSizeTable details={property.plotDetails.plotSizeDetails} /></div>
                {property.plotDetails.inventory?.length ? <div><h3 className="text-[17px] font-bold text-[#121B35] mb-4">Plot availability</h3><PlotInventoryTable inventory={property.plotDetails.inventory} /></div> : null}
                {property.plotDetails.layoutMapUrl ? <div className="pt-2"><h3 className="text-[17px] font-bold text-[#121B35] mb-4">Master Plan / Layout Map</h3>{property.plotDetails.layoutMapType === "image" ? <img src={property.plotDetails.layoutMapUrl} alt={`${property.title} layout map`} className="w-full max-h-[540px] object-contain bg-[#F8F7FA] rounded-2xl border border-[#E4E0E7]" /> : <a href={property.plotDetails.layoutMapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-[#121B35] text-white rounded-xl text-[13px] font-bold"><FileText className="w-4 h-4" /> View layout-map PDF</a>}</div> : null}
              </div>
            ) : null}

            {/* Overview Section */}
            <div ref={setSectionRef("overview")} className="bg-white rounded-3xl p-5 md:p-6 shadow-md border border-[#E4E0E7]/30 space-y-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#B98428]">{property.propertyType ? `${property.propertyType} details` : "Details"}</p>
                <h2 className="mt-1.5 text-[22px] font-extrabold leading-tight text-[#121B35] md:text-[26px]">{overviewTitle}</h2>
                {property.description?.trim() && (
                  <p className="mt-3 max-w-3xl whitespace-pre-line text-[14.5px] leading-7 text-[#514C57]">{property.description}</p>
                )}
              </div>

              {property.pgDetails?.sharingDetails?.length ? (
                <div>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <h3 className="text-[17px] font-bold text-[#121B35]">Choose a sharing option</h3>
                    <span className="text-[11px] font-semibold text-[#77717E]">Rent shown per bedroom space / month</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {property.pgDetails.sharingDetails.map((row) => (
                      <article key={row.sharingType} className="overflow-hidden rounded-2xl border border-[#E4E0E7] bg-[#FCFBFC]">
                        <div className="flex items-start justify-between gap-3 bg-[#121B35] px-4 py-3.5 text-white">
                          <div>
                            <p className="text-[15px] font-extrabold">{row.sharingType}</p>
                            <p className="mt-1 text-[10px] font-semibold text-white/55">{row.bedsAvailable} bedroom spaces currently available</p>
                          </div>
                          <p className="text-[17px] font-extrabold text-[#F2C052]">Ã¢â€šÂ¹{row.rentPerBed.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 text-[12px]">
                          <span className="font-semibold text-[#77717E]">Refundable deposit</span>
                          <span className="font-extrabold text-[#121B35]">Ã¢â€šÂ¹{row.deposit.toLocaleString("en-IN")}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {overviewFacts.length > 0 && (
                <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#E4E0E7] bg-[#EAE7ED] gap-px md:grid-cols-3">
                  {overviewFacts.slice(0, showAllOverviewFacts ? overviewFacts.length : 9).map(({ label, val }, index) => (
                    <div key={`${label}-${index}`} className="min-h-[82px] bg-white px-4 py-3.5">
                      <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-[#77717E]">{label}</span>
                      <p className="mt-1 text-[13.5px] font-extrabold leading-snug text-[#121B35]">{val}</p>
                    </div>
                  ))}
                </div>
              )}
              {overviewFacts.length > 9 && (
                <button type="button" onClick={() => setShowAllOverviewFacts((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-[#DDAA42]/45 px-4 py-2 text-[12px] font-extrabold text-[#9A741E] transition-colors hover:bg-[#FFF8E8]">
                  {showAllOverviewFacts ? "Show fewer details" : `View all ${overviewFacts.length} details`}
                </button>
              )}

            </div>

            {property.configurationDetails?.length ? (
              <div ref={setSectionRef("price-list")}>
                <ApartmentPriceList title={property.title} details={property.configurationDetails} />
              </div>
            ) : null}

            {hasFloorPlans && property.configurationDetails && (
              <div ref={setSectionRef("floor-plans")}>
                <FloorPlanExplorer
                  details={property.configurationDetails}
                  status={property.possessionDetails?.status || property.possession}
                  possession={possessionLabel}
                  onRequestCallback={() => setVerifiedAction("enquiry")}
                />
              </div>
            )}

            {(amenities.length > 0 || property.facilities?.length) && (
              <div ref={setSectionRef("facilities")}>
                <FacilityExplorer title={property.title} amenities={amenities} facilities={property.facilities} />
              </div>
            )}

            {/* Brochure Section */}
            {hasBrochure && <div ref={setSectionRef("brochure")} className="bg-white rounded-3xl p-5 md:p-6 shadow-md border border-[#E4E0E7]/30 space-y-5">
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
              ) : null}
            </div>}

            {/* Society & Maintenance */}
            {societyFacts.length > 0 && <div ref={setSectionRef("society")} className="bg-white rounded-3xl p-5 md:p-6 shadow-md border border-[#E4E0E7]/30 space-y-4">
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
            {(property.builder || property.developerLogoUrl) && <div ref={setSectionRef("dealer")} className="bg-white rounded-3xl p-5 md:p-6 shadow-md border border-[#E4E0E7]/30 space-y-4">
              <h2 className="text-[20px] font-bold text-[#121B35] flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#DDAA42] rounded-full" /> Developer Profile
              </h2>
              <div className="flex items-center gap-4.5 bg-[#F8F7FA]/60 border border-[#E4E0E7]/40 p-5 rounded-2xl flex-wrap">
                <div className="w-16 h-16 bg-gradient-to-br from-[#121B35] to-[#273559] rounded-2xl flex items-center justify-center text-[#F2C052] font-extrabold text-[20px] shadow overflow-hidden">
                  {property.developerLogoUrl ? <img src={property.developerLogoUrl} alt={property.builder ? `${property.builder} logo` : "Developer logo"} className="h-full w-full object-contain bg-white" /> : property.builder ? property.builder.split(" ").map((w) => w[0]).join("") : null}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    {property.builder && <><h3 className="text-[17px] font-bold text-[#121B35]">{property.builder}</h3><Verified className="w-5 h-5 text-[#DDAA42]" /></>}
                  </div>
                  <p className="text-[12px] text-[#68646F] font-semibold tracking-wide uppercase mt-0.5">Corporate Developer Partner</p>
                  <div className="flex items-center gap-4 mt-3 text-[12px] text-[#3F3D46]/85">
                    {property.verified && <span className="flex items-center gap-1"><Check className="size-4 text-[#DDAA42]" /> Clear-title verified</span>}
                    {property.reraRegistered && <span className="flex items-center gap-1"><Check className="size-4 text-[#DDAA42]" /> RERA Registered</span>}
                  </div>
                </div>
                {property.builder && (
                  <Link href={`/builder/${builderSlug(property.builder)}`} className="px-5 py-3 border border-[#DDAA42] text-[#DDAA42] font-bold text-[13px] rounded-xl hover:bg-[#DDAA42] hover:text-[#0B1328] transition-all shadow-sm">
                    View All Projects
                  </Link>
                )}
              </div>
            </div>}

            {/* Locality Guide */}
            {hasLocalityContent && <div ref={setSectionRef("locality")} className="bg-white rounded-3xl p-5 md:p-6 shadow-md border border-[#E4E0E7]/30 space-y-4">
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
                      {property.subtitle && <p className="text-[15px] font-extrabold text-[#121B35] uppercase tracking-wider">{property.subtitle.split(",")[0]}</p>}
                      <p className="text-[12px] text-[#68646F] font-semibold mt-1">Prime connectivity & infrastructure</p>
                    </div>
                  </>
                )}
              </div>
              {property.locality?.address && (
                <div className="flex items-start gap-3 rounded-2xl border border-[#E4E0E7]/50 bg-[#F8F7FA]/60 p-4">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-[#DDAA42]" />
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#68646F]">Locality address</p><p className="mt-1 text-[13px] font-semibold text-[#121B35]">{property.locality.address}</p></div>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: School, label: "Schools", val: nearbyValue("schools", property.nearbyAmenities?.schools) },
                  { icon: School, label: "Colleges", val: nearbyValue("colleges", property.nearbyAmenities?.colleges) },
                  { icon: Hospital, label: "Hospitals", val: nearbyValue("hospitals", property.nearbyAmenities?.hospitals) },
                  { icon: ShoppingBag, label: "Shopping", val: nearbyValue("shopping", property.nearbyAmenities?.shopping) },
                  { icon: Train, label: "Metro", val: nearbyValue("metro", property.nearbyAmenities?.metro) },
                ].filter((item) => item.val).map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex gap-2.5 p-3.5 bg-[#F8F7FA]/60 border border-[#E4E0E7]/40 rounded-2xl">
                    <Icon className="w-5 h-5 text-[#DDAA42] shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#68646F] uppercase font-bold tracking-wider block">{label}</span>
                      <span className="text-[13px] font-bold text-[#121B35] mt-0.5 block">{val}</span>
                    </div>
                  </div>
                ))}
              </div>
              {property.nearbyDetails && Object.entries(property.nearbyDetails).some(([, detail]) => detail?.places?.length) && (
                <div className="grid gap-4 md:grid-cols-2">
                  {([
                    ["schools", "Schools", School],
                    ["colleges", "Colleges", School],
                    ["hospitals", "Hospitals", Hospital],
                    ["shopping", "Shopping", ShoppingBag],
                    ["metro", "Metro / Train", Train],
                  ] as const).map(([key, label, Icon]) => {
                    const places = property.nearbyDetails?.[key]?.places || [];
                    if (!places.length) return null;
                    return <div key={key} className="rounded-2xl border border-[#E4E0E7]/60 p-4">
                      <div className="mb-3 flex items-center gap-2"><Icon className="size-4 text-[#DDAA42]" /><h3 className="text-[13px] font-bold text-[#121B35]">{label}</h3></div>
                      <div className="space-y-3">{places.map((place, index) => <div key={`${place.name}-${index}`} className="rounded-xl bg-[#F8F7FA] p-3">
                        <p className="text-[13px] font-bold text-[#121B35]">{place.name}</p>
                        {place.address && <p className="mt-1 text-[11px] text-[#68646F]">{place.address}</p>}
                        {(place.distance || place.landmark) && <p className="mt-1 text-[11px] font-semibold text-[#5A5762]">{[place.distance, place.landmark].filter(Boolean).join(" Ã‚Â· ")}</p>}
                      </div>)}</div>
                    </div>;
                  })}
                </div>
              )}

              {/* Price-trend insight strip */}
              {insight && <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#F8F7FA] to-[#FFF8E8] border border-[#E4E0E7]/60 rounded-2xl">
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
              </div>}
            </div>}
            {hasReraPhases && <PropertyReraSections property={property} setSectionRef={setSectionRef} />}
          </div>

          {/* Right Sticky Contact Card */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="bg-[#121B35] rounded-3xl p-6 text-white border border-[#DDAA42]/35 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-gradient-to-br from-[#F2C052]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              {property.builder && <div className="flex items-center gap-3.5 mb-6 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 font-bold">
                  {property.builder.slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#F2C052]">{property.builder}</h4>
                  <p className="text-[11px] text-white/50">Verified Lister</p>
                </div>
              </div>}

              <div className="space-y-3 relative z-10">
                <button onClick={() => setVerifiedAction("call")} className="w-full btn-gold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-[14px]">
                  <Phone className="w-4.5 h-4.5" /> Reveal Contact Number
                </button>
                {hasBrochure && <button onClick={() => setVerifiedAction("brochure")} className="w-full bg-white/10 hover:bg-white/15 border border-[#F2C052]/40 text-[#F2C052] font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Download className="w-4.5 h-4.5" /> Download Brochure
                </button>}
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

              {(property.verified || property.reraRegistered) && <div className="mt-6 pt-5 border-t border-white/10 space-y-3 relative z-10">
                {property.verified && <div className="flex items-center gap-2.5 text-[12.5px] text-[#F2C052]">
                  <Scale className="w-4 h-4 shrink-0" /> <span className="font-extrabold">Title deed audited by Legal Panel</span>
                </div>}
                {property.reraRegistered && <div className="flex items-center gap-2.5 text-[12.5px] text-white/80">
                  <Shield className="w-4 h-4 text-[#F2C052] shrink-0" /> <span>RERA registration supplied</span>
                </div>}
              </div>}
            </div>

            <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-[#E4E0E7]/30 text-center">
              <p className="text-[12px] text-[#68646F] font-semibold">Spotted an error in this listing?</p>
              <button className="text-[12.5px] text-[#DDAA42] font-bold hover:underline mt-1">Report listing</button>
            </div>
          </div>
        </div>
        {!isPromotedProperty && <AdRail side="right" />}
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ EXPLORE MORE: multiple property rails Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div ref={setSectionRef("explore")} className="bg-[#F3F1F5] border-t border-[#E4E0E7]/50">
        <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-8">
          <PropertyRail title="Recommended for You" subtitle="Curated Picks" Icon={Sparkles} items={pools.recommended} />
          <PropertyRail title="Similar Properties" subtitle="Comparable Homes" Icon={Layers} items={pools.similar} />
          <PropertyRail title="Featured Properties" subtitle="Editor's Choice" Icon={Star} items={pools.featured} />
          <PropertyRail title="Based on Your Interests" subtitle={property.subtitle ? `More in ${property.subtitle.split(",")[0]}` : ""} Icon={HeartIcon} items={pools.interests} />
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
            <p className="text-[20px] font-extrabold text-gold-gradient leading-none">{priceWithCharges(property.price)}</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {hasBrochure && <button onClick={() => setVerifiedAction("brochure")} className="hidden sm:flex items-center gap-2 border border-[#F2C052]/40 text-[#F2C052] font-bold text-[13px] px-5 py-2.5 rounded-xl hover:bg-white/5 transition-all">
              <Download className="size-4" /> Brochure
            </button>}
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
