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
  Waves,
  Dumbbell,
  TreePine,
  Droplets,
  CloudRain,
  Zap,
  Scale,
  ShieldCheck,
  Download,
  Images,
  Play,
  FileText,
  Sparkles,
  Compass,
  Heart as HeartIcon,
  Star,
  TrendingUp,
  Home,
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
import { useAuth } from "./AuthContext";
import { useLiveProperties } from "@/lib/useLiveProperties";
import { embedUrl, isDirectVideo } from "@/lib/video";
import { formatPossession } from "@/lib/propertyDetails";
import ConfigurationTable from "./ConfigurationTable";
import VillaConfigurationTable from "./VillaConfigurationTable";
import PlotSizeTable from "./PlotSizeTable";
import PlotInventoryTable from "./PlotInventoryTable";

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

const amenityIcons: Record<string, React.ReactNode> = {
  "Power Backup": <Zap className="w-5 h-5 text-[#D4AF37]" />,
  "Rain Water Harvesting": <CloudRain className="w-5 h-5 text-[#D4AF37]" />,
  "Club House": <Building2 className="w-5 h-5 text-[#D4AF37]" />,
  "Swimming Pool": <Waves className="w-5 h-5 text-[#D4AF37]" />,
  Security: <Shield className="w-5 h-5 text-[#D4AF37]" />,
  Lift: <Layers className="w-5 h-5 text-[#D4AF37]" />,
  "Reserved Parking": <Car className="w-5 h-5 text-[#D4AF37]" />,
  Gymnasium: <Dumbbell className="w-5 h-5 text-[#D4AF37]" />,
  Park: <TreePine className="w-5 h-5 text-[#D4AF37]" />,
  "Water Storage": <Droplets className="w-5 h-5 text-[#D4AF37]" />,
  "Gated Security": <Shield className="w-5 h-5 text-[#D4AF37]" />,
  "Landscaped Gardens": <TreePine className="w-5 h-5 text-[#D4AF37]" />,
  "Jogging Track": <Zap className="w-5 h-5 text-[#D4AF37]" />,
  "Children's Play Area": <HeartIcon className="w-5 h-5 text-[#D4AF37]" />,
  "EV Charging": <Zap className="w-5 h-5 text-[#D4AF37]" />,
  "Community Hall": <Building2 className="w-5 h-5 text-[#D4AF37]" />,
  "Entrance Arch": <Home className="w-5 h-5 text-[#D4AF37]" />,
  "Underground Drainage": <Droplets className="w-5 h-5 text-[#D4AF37]" />,
  "Street Lighting": <Sparkles className="w-5 h-5 text-[#D4AF37]" />,
  "Avenue Plantation": <TreePine className="w-5 h-5 text-[#D4AF37]" />,
  "Cauvery/Borewell Water Supply": <Droplets className="w-5 h-5 text-[#D4AF37]" />,
  "Security Cabin": <Shield className="w-5 h-5 text-[#D4AF37]" />,
  "24x7 Security": <Shield className="w-5 h-5 text-[#D4AF37]" />,
  "Passenger Lift": <Layers className="w-5 h-5 text-[#D4AF37]" />,
  "Service Lift": <Layers className="w-5 h-5 text-[#D4AF37]" />,
  Cafeteria: <Building2 className="w-5 h-5 text-[#D4AF37]" />,
  "Conference Rooms": <Building2 className="w-5 h-5 text-[#D4AF37]" />,
  "DG Backup": <Zap className="w-5 h-5 text-[#D4AF37]" />,
  ATM: <Building2 className="w-5 h-5 text-[#D4AF37]" />,
  "Food Court": <Building2 className="w-5 h-5 text-[#D4AF37]" />,
};

const sections = [
  { id: "overview", label: "Overview" },
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
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold tracking-[0.16em] uppercase text-[#D4AF37]">
            <Icon className="size-4" /> {subtitle}
          </span>
          <h3 className="text-[24px] md:text-[28px] font-bold text-[#1E3A8A] mt-1">{title}</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scrollBy(-1)}
            className="size-10 rounded-full bg-white border border-[#D5DEF2] flex items-center justify-center shadow-sm hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-5 text-[#1E3A8A]" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="size-10 rounded-full bg-white border border-[#D5DEF2] flex items-center justify-center shadow-sm hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-5 text-[#1E3A8A]" />
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mediaTab, setMediaTab] = useState<"photos" | "videos">("photos");
  const [videoIndex, setVideoIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("overview");
  const [showContactForm, setShowContactForm] = useState(false);
  const [isTabBarSticky, setIsTabBarSticky] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // DBG006: Reset media state when navigating to a different property to prevent out-of-bounds crash
  useEffect(() => {
    setCurrentImageIndex(0);
    setVideoIndex(0);
    setMediaTab("photos");
  }, [property.id]);
  const { user, setIsAuthModalOpen } = useAuth();
  const requireLogin = (action: () => void) => {
    if (!user) { setIsAuthModalOpen(true); return; }
    action();
  };

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

  const videos = property.videos && property.videos.length > 0 ? property.videos : [];
  const hasVideos = videos.length > 0;
  const possessionLabel = formatPossession(property);
  const floorDisplay = property.floorLabel
    ? `${property.floorLabel}${property.totalFloors ? ` of ${property.totalFloors}` : ""}`
    : property.floor || "";
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

  useEffect(() => {
    const handleScroll = () => {
      if (tabBarRef.current) {
        const tabBarRect = tabBarRef.current.getBoundingClientRect();
        setIsTabBarSticky(tabBarRect.top <= 72);
      }
      const scrollPosition = window.scrollY + 220;
      for (const section of sections) {
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
  }, []);

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
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isPdfBrochure = property.brochure?.startsWith("data:application/pdf");

  const handleDownloadBrochure = () => {
    if (!user) { setIsAuthModalOpen(true); return; }
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
  body{font-family:Georgia,serif;color:#1E3A8A;margin:0;padding:48px;background:#F1F5FF}
  .seal{display:inline-block;background:linear-gradient(135deg,#E0B84A,#D4AF37);color:#1E3A8A;font-weight:bold;padding:6px 16px;border-radius:999px;font-size:12px;letter-spacing:1px}
  h1{font-size:34px;margin:18px 0 4px}
  .muted{color:#6E7488}
  .price{font-size:30px;color:#D4AF37;font-weight:bold;margin:18px 0}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}
  .card{background:#fff;border:1px solid #D5DEF2;border-radius:12px;padding:14px}
  table{width:100%;border-collapse:collapse;background:#fff;margin:20px 0;font-family:Arial,sans-serif;font-size:12px}th,td{border:1px solid #D5DEF2;padding:8px;text-align:left}th{background:#1E3A8A;color:#fff}
  .label{font-size:11px;text-transform:uppercase;color:#6E7488;letter-spacing:1px}
  .val{font-size:16px;font-weight:bold}
  img{width:100%;border-radius:14px;margin:16px 0;max-height:320px;object-fit:cover}
  .foot{margin-top:32px;border-top:1px solid #D5DEF2;padding-top:14px;color:#6E7488;font-size:12px}
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
    <div className="min-h-screen bg-[#EEF3FE]">
      <Header />

      {/* Cinematic Hero Header */}
      <section className="relative w-full h-[420px] md:h-[520px] overflow-hidden bg-[#0B1B43]">
        {isBase64(property.image) ? (
          <img src={property.image} alt={property.title} className="absolute inset-0 w-full h-full object-cover animate-kenburns" />
        ) : (
          <Image src={property.image} alt={property.title} fill priority className="object-cover animate-kenburns" />
        )}
        {/* Bottom-only scrim so the property image stays visible while the title remains legible */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0B1B43] via-[#0B1B43]/45 to-transparent" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 h-full flex flex-col justify-end pb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-[#1E3A8A] text-[11px] font-bold px-3 py-1 rounded-full">
              <ShieldCheck className="size-3.5" /> CLEAR TITLE VERIFIED
            </span>
            {property.badges?.map((b) => (
              <span key={b} className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {b}
              </span>
            ))}
          </div>

          <h1 className="text-[32px] md:text-[50px] font-bold text-white leading-[1.05] max-w-3xl text-shadow-lg">
            {property.title}
          </h1>
          <p className="text-[14px] md:text-[16px] text-white/80 flex items-center gap-2 mt-3">
            <MapPin className="size-4.5 text-[#E8C66A]" /> {property.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-6">
            <div>
              <span className="text-[11px] text-white/50 uppercase font-bold tracking-wider block">Starting Price</span>
              <span className="text-[34px] md:text-[42px] font-extrabold text-gold-gradient leading-none">{property.price}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-white">
              {[
                { icon: Bed, label: `${beds} Beds` },
                { icon: Bath, label: `${property.bathrooms ?? "—"} Baths` },
                { icon: Maximize, label: property.area },
                { icon: Clock, label: possessionLabel },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <Icon className="size-4.5 text-[#E8C66A]" />
                  <span className="text-[13px] font-bold">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => { setShowContactForm(true); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }}
              className="btn-gold flex items-center gap-2 px-6 py-3 rounded-xl text-[14px]"
            >
              <Phone className="size-4.5" /> Enquire Now
            </button>
            <button
              onClick={handleDownloadBrochure}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold text-white bg-white/10 backdrop-blur-md border border-[#E8C66A]/40 hover:bg-white/15 transition-all"
            >
              <Download className="size-4.5 text-[#E8C66A]" /> Download Brochure
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-white/60 text-[11px] font-semibold tracking-widest uppercase animate-float-soft hidden md:block">
          Scroll to explore ↓
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E2E9FB]/65">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-[12px] text-[#6E7488] font-medium tracking-wide">
            <Link href="/" className="text-[#C9A24E] hover:text-[#A8842C] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/property-in-bangalore-ffid" className="text-[#C9A24E] hover:text-[#A8842C] transition-colors">Bangalore Portfolio</Link>
            <span>/</span>
            <span className="text-[#1E3A8A] font-bold">{property.title}</span>
          </div>
        </div>
      </div>

      {/* Sticky TabBar */}
      <div
        ref={tabBarRef}
        className={`${isTabBarSticky ? "fixed top-[64px] md:top-[72px] left-0 right-0 z-40 shadow-md border-b border-[#D5DEF2]/20" : ""} bg-white transition-all duration-300`}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-4 py-3 text-[13px] font-bold tracking-wide uppercase transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeSection === section.id
                    ? "text-[#C9A24E] border-[#C9A24E]"
                    : "text-[#6E7488] border-transparent hover:text-[#1E3A8A]"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          {/* Left Block */}
          <div className="space-y-8">
            {/* Gallery Module with Photos / Videos tabs */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-[#D5DEF2]/30 p-2">
              {/* Media tabs */}
              <div className="flex items-center gap-2 p-2">
                <button
                  onClick={() => setMediaTab("photos")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                    mediaTab === "photos" ? "bg-[#1E3A8A] text-white" : "bg-[#F1F5FF] text-[#1E3A8A] hover:bg-[#E2E9FB]"
                  }`}
                >
                  <Images className="size-4" /> Photos ({images.length})
                </button>
                <button
                  onClick={() => setMediaTab("videos")}
                  disabled={!hasVideos}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
                    !hasVideos
                      ? "bg-[#F1F5FF] text-[#6E7488]/50 cursor-not-allowed"
                      : mediaTab === "videos"
                      ? "bg-[#1E3A8A] text-white"
                      : "bg-[#F1F5FF] text-[#1E3A8A] hover:bg-[#E2E9FB]"
                  }`}
                >
                  <Play className="size-4" /> Videos ({videos.length})
                </button>
              </div>

              {mediaTab === "photos" ? (
                <>
                  <div className="relative aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden">
                    {isBase64(images[currentImageIndex]) ? (
                      <img src={images[currentImageIndex]} alt={property.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <Image src={images[currentImageIndex]} alt={property.title} fill className="object-cover" priority />
                    )}
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all" aria-label="Previous image">
                      <ChevronLeft className="w-6 h-6 text-[#1E3A8A]" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all" aria-label="Next image">
                      <ChevronRight className="w-6 h-6 text-[#1E3A8A]" />
                    </button>
                    <div className="absolute bottom-4 right-4 bg-[#1E3A8A]/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[12px] font-bold">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2.5">
                      <button onClick={handleShare} className="w-10 h-10 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all" title="Copy Link">
                        <Share2 className="w-5 h-5 text-[#1E3A8A]" />
                      </button>
                      <button className="w-10 h-10 bg-white/90 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                        <Heart className="w-5 h-5 text-[#1E3A8A] hover:fill-red-500" />
                      </button>
                    </div>
                    {copiedLink && (
                      <div className="absolute top-16 right-4 bg-white text-[#1E3A8A] text-[12px] font-bold px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in duration-300">
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
                          currentImageIndex === idx ? "border-[#C9A24E] scale-[1.03] shadow-md" : "border-transparent opacity-70 hover:opacity-100"
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
              ) : (
                <>
                  {/* Video player */}
                  <div className="relative aspect-[16/9] bg-black rounded-2xl overflow-hidden">
                    {(() => {
                      const v = videos[videoIndex];
                      const embed = embedUrl(v);
                      if (embed) {
                        return (
                          <iframe
                            src={embed}
                            title={`${property.title} video`}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      }
                      if (isDirectVideo(v)) {
                        return <video src={v} controls className="absolute inset-0 w-full h-full object-contain bg-black" />;
                      }
                      return (
                        <a href={v} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center text-white gap-2">
                          <Play className="size-6 text-[#E8C66A]" /> Open video
                        </a>
                      );
                    })()}
                  </div>
                  {videos.length > 1 && (
                    <div className="flex gap-2.5 p-4 overflow-x-auto no-scrollbar">
                      {videos.map((v, idx) => {
                        const yt = embedUrl(v);
                        return (
                          <button
                            key={idx}
                            onClick={() => setVideoIndex(idx)}
                            className={`relative w-24 h-14 rounded-xl overflow-hidden border-2 shrink-0 bg-[#1E3A8A] flex items-center justify-center transition-all ${
                              videoIndex === idx ? "border-[#C9A24E] scale-[1.03]" : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            <Play className="size-5 text-[#E8C66A]" />
                            <span className="absolute bottom-0.5 right-1 text-[9px] text-white/70">{yt ? "▶" : ""} {idx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {property.virtualTourUrl && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#D5DEF2]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div><h2 className="text-[20px] font-bold text-[#1E3A8A]">Virtual Tour / 3D Walkthrough</h2><p className="text-[13px] text-[#6E7488] mt-1">Explore the project in an external interactive viewer.</p></div>
                <a href={property.virtualTourUrl} target="_blank" rel="noreferrer" className="btn-gold px-5 py-3 rounded-xl text-[13px] font-bold">Open Virtual Tour</a>
              </div>
            )}

            {/* ── POLISHED PROPERTY DETAILS ── */}
            <div className="bg-white rounded-3xl shadow-md border border-[#D5DEF2]/30 overflow-hidden">
              {/* gold accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#E8C66A] to-[#D4AF37]" />
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 bg-[#1E3A8A] text-[#E8C66A] text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <Building2 className="size-3" /> {property.propertyType || "Residence"}
                      </span>
                      {property.reraRegistered && (
                        <span className="inline-flex items-center gap-1 bg-[#F1F5FF] border border-[#D5DEF2] text-[#1E3A8A] text-[11px] font-bold px-2.5 py-1 rounded-full">
                          <ShieldCheck className="size-3 text-[#D4AF37]" /> RERA
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 bg-[#F1F5FF] border border-[#D5DEF2] text-[#1E3A8A] text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <Clock className="size-3 text-[#D4AF37]" /> {possessionLabel}
                      </span>
                    </div>
                    <h2 className="text-[24px] md:text-[30px] font-bold text-[#1E3A8A] leading-tight">{property.title}</h2>
                    <p className="text-[14px] text-[#6E7488] flex items-center gap-1.5 mt-1.5">
                      <MapPin className="w-4.5 h-4.5 text-[#D4AF37]" /> {property.subtitle}
                    </p>
                    {/* config chips */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {property.configs.map((c) => (
                        <span key={c} className="text-[12px] font-bold text-[#1E3A8A] bg-[#F1F5FF] border border-[#D5DEF2]/60 px-3 py-1.5 rounded-lg">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* price card */}
                  <div className="shrink-0 bg-gradient-to-br from-[#1E3A8A] to-[#25459E] rounded-2xl p-5 text-center min-w-[180px] shadow-lg">
                    <span className="text-[10px] text-white/55 uppercase font-bold tracking-wider block">Price</span>
                    <p className="text-[28px] font-extrabold text-gold-gradient leading-none mt-1">{property.price}</p>
                    {property.pricePerSqft && (
                      <p className="text-[12px] text-white/65 font-semibold mt-2">{property.pricePerSqft}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-[10px] text-white/45 uppercase font-bold tracking-wider">Est. EMI</p>
                      <p className="text-[13px] text-[#E8C66A] font-bold">On request</p>
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
                    <div key={label} className="flex items-center gap-3 p-3.5 bg-[#F1F5FF] border border-[#D5DEF2]/50 rounded-2xl">
                      <div className="w-11 h-11 rounded-xl bg-white border border-[#D5DEF2]/60 flex items-center justify-center shrink-0 shadow-sm">
                        <Icon className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-[#6E7488] uppercase font-bold tracking-wider">{label}</p>
                        <p className="text-[15px] font-bold text-[#1E3A8A] truncate">{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {property.configurationDetails && property.configurationDetails.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#D5DEF2]/30">
                <h2 className="text-[20px] font-bold text-[#1E3A8A] flex items-center gap-2 mb-5">
                  <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> Configuration & Pricing
                </h2>
                <ConfigurationTable details={property.configurationDetails} />
              </div>
            )}

            {property.villaDetails?.configurationDetails.length ? (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#D5DEF2]/30">
                <h2 className="text-[20px] font-bold text-[#1E3A8A] flex items-center gap-2 mb-5">
                  <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> Villa Configuration & Pricing
                </h2>
                <VillaConfigurationTable details={property.villaDetails.configurationDetails} />
              </div>
            ) : null}

            {property.plotDetails?.plotSizeDetails.length ? (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#D5DEF2]/30 space-y-7">
                <div><h2 className="text-[20px] font-bold text-[#1E3A8A] flex items-center gap-2 mb-5"><div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> Plot Sizes & Pricing</h2><PlotSizeTable details={property.plotDetails.plotSizeDetails} /></div>
                <div><h3 className="text-[17px] font-bold text-[#1E3A8A] mb-4">Plot availability</h3><PlotInventoryTable inventory={property.plotDetails.inventory} /></div>
                <div className="pt-2"><h3 className="text-[17px] font-bold text-[#1E3A8A] mb-4">Master Plan / Layout Map</h3>{property.plotDetails.layoutMapType === "image" ? <img src={property.plotDetails.layoutMapUrl} alt={`${property.title} layout map`} className="w-full max-h-[540px] object-contain bg-[#F1F5FF] rounded-2xl border border-[#D5DEF2]" /> : <a href={property.plotDetails.layoutMapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-[#1E3A8A] text-white rounded-xl text-[13px] font-bold"><FileText className="w-4 h-4" /> View layout-map PDF</a>}</div>
              </div>
            ) : null}

            {/* Overview Section */}
            <div ref={setSectionRef("overview")} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#D5DEF2]/30 space-y-6">
              <h2 className="text-[20px] font-bold text-[#1E3A8A] flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> Property Overview
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Property Type", val: property.propertyType || "Residential" },
                  { label: "Facing", val: property.facing || "—" },
                  { label: "Furnishing", val: property.furnishing || "—" },
                  { label: "Parking", val: property.parking || "—" },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-[#F1F5FF]/60 border border-[#D5DEF2]/40 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-[#6E7488] uppercase font-bold tracking-wider">{label}</span>
                    <p className="text-[14px] font-bold text-[#1E3A8A] mt-1">{val}</p>
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
                  ].filter((item) => item.val).map(({ label, val }) => <div key={label} className="bg-[#F1F5FF]/60 border border-[#D5DEF2]/40 p-3.5 rounded-2xl"><span className="text-[10px] text-[#6E7488] uppercase font-bold tracking-wider">{label}</span><p className="text-[14px] font-bold text-[#1E3A8A] mt-1">{val}</p></div>)}
                </div>
              )}

              {villaOverviewFacts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {villaOverviewFacts.map(({ label, val }) => <div key={label} className="bg-[#F1F5FF]/60 border border-[#D5DEF2]/40 p-3.5 rounded-2xl"><span className="text-[10px] text-[#6E7488] uppercase font-bold tracking-wider">{label}</span><p className="text-[14px] font-bold text-[#1E3A8A] mt-1">{val}</p></div>)}
                </div>
              )}
              {plotOverviewFacts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {plotOverviewFacts.map(({ label, val }) => <div key={label} className="bg-[#F1F5FF]/60 border border-[#D5DEF2]/40 p-3.5 rounded-2xl"><span className="text-[10px] text-[#6E7488] uppercase font-bold tracking-wider">{label}</span><p className="text-[14px] font-bold text-[#1E3A8A] mt-1">{val}</p></div>)}
                </div>
              )}
              {commercialOverviewFacts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {commercialOverviewFacts.map(({ label, val }) => <div key={label} className="bg-[#F1F5FF]/60 border border-[#D5DEF2]/40 p-3.5 rounded-2xl"><span className="text-[10px] text-[#6E7488] uppercase font-bold tracking-wider">{label}</span><p className="text-[14px] font-bold text-[#1E3A8A] mt-1">{val}</p></div>)}
                </div>
              )}
              {property.pgDetails?.sharingDetails.length ? <div><h3 className="text-[17px] font-bold text-[#1E3A8A] mb-3">Sharing options & availability</h3><div className="overflow-x-auto"><table className="min-w-[580px] w-full text-[13px]"><thead className="bg-[#1E3A8A] text-white"><tr><th className="p-3 text-left">Sharing type</th><th>Rent / bed / month</th><th>Deposit</th><th>Beds available</th></tr></thead><tbody>{property.pgDetails.sharingDetails.map((row) => <tr key={row.sharingType} className="border-b border-[#E2E9FB]"><td className="p-3 font-semibold">{row.sharingType}</td><td className="text-center">₹{row.rentPerBed.toLocaleString("en-IN")}</td><td className="text-center">₹{row.deposit.toLocaleString("en-IN")}</td><td className="text-center">{row.bedsAvailable}</td></tr>)}</tbody></table></div></div> : null}
              {pgOverviewFacts.length > 0 && <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{pgOverviewFacts.map(({ label, val }) => <div key={label} className="bg-[#F1F5FF]/60 border border-[#D5DEF2]/40 p-3.5 rounded-2xl"><span className="text-[10px] text-[#6E7488] uppercase font-bold tracking-wider">{label}</span><p className="text-[14px] font-bold text-[#1E3A8A] mt-1">{val}</p></div>)}</div>}

              <div>
                <span className="text-[11px] text-[#6E7488] uppercase font-bold tracking-wider">About this property</span>
                <p className="text-[14.5px] text-[#243559]/90 leading-relaxed mt-2.5">
                  {property.description || (property.villaDetails || property.plotDetails || property.commercialDetails || property.pgDetails ? "—" :
                    `This elegant signature space in ${property.subtitle} delivers modern architecture and high-end layouts. Spanning ${property.area}, it offers well-ventilated rooms, designer fittings, and spacious interiors. Located in a prime zone with quick access to tech parks, schools, and healthcare. Verified clear-title documentation guarantees a safe investment.`
                  )}
                </p>
              </div>

              {amenities.length > 0 && <div className="pt-6 border-t border-[#E2E9FB]/60">
                <span className="text-[11px] text-[#6E7488] uppercase font-bold tracking-wider block mb-4">Amenities Included</span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {amenities.map((amenity) => (
                    <div key={amenity} className="flex flex-col items-center gap-2 p-3.5 bg-[#F1F5FF]/40 hover:bg-[#F1F5FF] border border-[#D5DEF2]/40 rounded-2xl text-center transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#D5DEF2]/40 flex items-center justify-center shadow-sm">
                        {amenityIcons[amenity] || <Check className="w-5 h-5 text-[#D4AF37]" />}
                      </div>
                      <span className="text-[11px] font-bold text-[#243559] tracking-tight">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>}
            </div>

            {/* Brochure Section */}
            <div ref={setSectionRef("brochure")} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#D5DEF2]/30 space-y-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-[20px] font-bold text-[#1E3A8A] flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> Property Brochure
                </h2>
                <button onClick={handleDownloadBrochure} className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px]">
                  <Download className="size-4" /> Download Brochure
                </button>
              </div>

              {isPdfBrochure ? (
                <div className="rounded-2xl overflow-hidden border border-[#D5DEF2]/50 bg-[#F1F5FF]">
                  <iframe src={property.brochure} title="Brochure preview" className="w-full h-[560px]" />
                </div>
              ) : (
                <div className="relative rounded-2xl border border-[#D5DEF2]/50 overflow-hidden bg-gradient-to-br from-[#1E3A8A] to-[#25459E] p-8 md:p-10 text-white">
                  <div className="absolute -right-8 -top-8 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-[150px] h-[200px] bg-white rounded-xl shadow-2xl shrink-0 overflow-hidden -rotate-2">
                      <img src={isBase64(property.image) ? property.image : `${property.image}`} alt="" className="w-full h-28 object-cover" />
                      <div className="p-3">
                        <div className="h-2 w-3/4 bg-[#D5DEF2] rounded mb-1.5" />
                        <div className="h-2 w-1/2 bg-[#D5DEF2] rounded mb-3" />
                        <div className="text-[10px] font-bold text-[#D4AF37]">{property.price}</div>
                      </div>
                      <span className="absolute top-2 left-2 bg-[#D4AF37] text-[#1E3A8A] text-[7px] font-bold px-1.5 py-0.5 rounded">CLEAR TITLE</span>
                    </div>
                    <div className="text-center md:text-left">
                      <FileText className="size-7 text-[#E8C66A] mx-auto md:mx-0 mb-2" />
                      <h3 className="text-[20px] font-bold">{property.title} — Digital Brochure</h3>
                      <p className="text-[13.5px] text-white/65 mt-1.5 max-w-md">
                        Full specifications, floor plans, pricing and amenities — packaged in a shareable brochure.
                      </p>
                      <button onClick={handleDownloadBrochure} className="mt-4 inline-flex items-center gap-2 btn-gold px-5 py-2.5 rounded-xl text-[13px]">
                        <Download className="size-4" /> Get the Brochure
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Society & Maintenance */}
            {societyFacts.length > 0 && <div ref={setSectionRef("society")} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#D5DEF2]/30 space-y-6">
              <h2 className="text-[20px] font-bold text-[#1E3A8A] flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> Society & Maintenance
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {societyFacts.map(({ label, val }) => (
                  <div key={label} className="p-4 bg-[#F1F5FF]/60 border border-[#D5DEF2]/40 rounded-2xl">
                    <span className="text-[10px] text-[#6E7488] uppercase font-bold tracking-wider">{label}</span>
                    <p className="text-[14px] font-bold text-[#1E3A8A] mt-1">{val}</p>
                  </div>
                ))}
              </div>
            </div>}

            {/* Developer Profile */}
            <div ref={setSectionRef("dealer")} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#D5DEF2]/30 space-y-6">
              <h2 className="text-[20px] font-bold text-[#1E3A8A] flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> Developer Profile
              </h2>
              <div className="flex items-center gap-4.5 bg-[#F1F5FF]/60 border border-[#D5DEF2]/40 p-5 rounded-2xl flex-wrap">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#2E54B8] rounded-2xl flex items-center justify-center text-[#E8C66A] font-extrabold text-[20px] shadow">
                  {property.builder ? property.builder.split(" ").map((w) => w[0]).join("") : "CT"}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-bold text-[#1E3A8A]">{property.builder || "ClearTitle Verified Owner"}</h3>
                    <Verified className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <p className="text-[12px] text-[#6E7488] font-semibold tracking-wide uppercase mt-0.5">Corporate Developer Partner</p>
                  <div className="flex items-center gap-4 mt-3 text-[12px] text-[#243559]/85">
                    <span className="flex items-center gap-1"><Check className="size-4 text-[#D4AF37]" /> Verified titles</span>
                    {property.reraRegistered && <span className="flex items-center gap-1"><Check className="size-4 text-[#D4AF37]" /> RERA Registered</span>}
                  </div>
                </div>
                {property.builder && (
                  <Link href={`/builder/${builderSlug(property.builder)}`} className="px-5 py-3 border border-[#D4AF37] text-[#D4AF37] font-bold text-[13px] rounded-xl hover:bg-[#D4AF37] hover:text-white transition-all shadow-sm">
                    View All Projects
                  </Link>
                )}
              </div>
            </div>

            {/* Dealers for this property */}
            {propertyDealers.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#D5DEF2]/30 space-y-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-[20px] font-bold text-[#1E3A8A] flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> Dealers for this property
                  </h2>
                  <Link href="/dealers" className="text-[13px] font-bold text-[#D4AF37] hover:underline">View all dealers</Link>
                </div>
                <p className="text-[13px] text-[#6E7488] -mt-2">Contact a verified channel partner handling this listing.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {propertyDealers.map((d) => (
                    <div key={d.id} className="flex items-center gap-4 p-4 bg-[#F1F5FF]/60 border border-[#D5DEF2]/50 rounded-2xl">
                      <div className="relative shrink-0">
                        <span className="size-14 rounded-full bg-white border border-[#D4AF37]/40 flex items-center justify-center text-[#1E3A8A] font-bold overflow-hidden">
                          {d.logo ? <img src={d.logo} alt={d.agency} className="w-full h-full object-cover" /> : d.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                        </span>
                        <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-gradient-to-br from-[#E8C66A] to-[#D4AF37] flex items-center justify-center shadow">
                          <ShieldCheck className="size-3.5 text-[#1E3A8A]" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-bold text-[#1E3A8A] truncate">{d.name}</p>
                        <p className="text-[12px] text-[#6E7488] truncate">{d.agency}</p>
                        <p className="text-[11px] text-[#6E7488]">Member since {d.memberSince}</p>
                      </div>
                      <Link href={`/dealer/${d.slug}`} className="shrink-0 px-4 py-2.5 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-bold text-[12.5px] rounded-xl transition-colors flex items-center gap-1.5">
                        <Phone className="size-3.5" /> Contact
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locality Guide */}
            <div ref={setSectionRef("locality")} className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-[#D5DEF2]/30 space-y-6">
              <h2 className="text-[20px] font-bold text-[#1E3A8A] flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full" /> Locality & Neighbourhood
              </h2>
              <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-[#F1F5FF] to-[#E2E9FB]/40 rounded-2xl overflow-hidden border border-[#D5DEF2]/50 flex items-center justify-center">
                <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "radial-gradient(#D4AF37 1.5px, transparent 1.5px), radial-gradient(#D4AF37 1.5px, transparent 1.5px)", backgroundSize: "24px 24px", backgroundPosition: "0 0, 12px 12px" }} />
                <div className="text-center z-10 p-4">
                  <Navigation className="w-12 h-12 text-[#D4AF37] mx-auto mb-3" />
                  <p className="text-[15px] font-extrabold text-[#1E3A8A] uppercase tracking-wider">{property.subtitle.split(",")[0] || "Bangalore"}</p>
                  <p className="text-[12px] text-[#6E7488] font-semibold mt-1">Prime connectivity & infrastructure</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: School, label: "Schools", val: nearbyValue("schools", property.nearbyAmenities?.schools) },
                  { icon: Hospital, label: "Hospitals", val: nearbyValue("hospitals", property.nearbyAmenities?.hospitals) },
                  { icon: ShoppingBag, label: "Shopping", val: nearbyValue("shopping", property.nearbyAmenities?.shopping) },
                  { icon: Train, label: "Metro", val: nearbyValue("metro", property.nearbyAmenities?.metro) },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex gap-2.5 p-3.5 bg-[#F1F5FF]/60 border border-[#D5DEF2]/40 rounded-2xl">
                    <Icon className="w-5 h-5 text-[#D4AF37] shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#6E7488] uppercase font-bold tracking-wider block">{label}</span>
                      <span className="text-[13px] font-bold text-[#1E3A8A] mt-0.5 block">{val}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price-trend insight strip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#F1F5FF] to-[#FAF3E2] border border-[#D5DEF2]/60 rounded-2xl">
                <div className="flex items-center gap-3">
                  <img src={insight.image} alt={insight.name} className="size-14 rounded-full object-cover border border-[#D5DEF2]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-bold text-[#1E3A8A]">{insight.name}</p>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#1E7A46] bg-[#E6F2EA] px-1.5 py-0.5 rounded">
                        {insight.rating} <Star className="size-3 fill-current" />
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6E7488]">Avg. <span className="font-semibold text-[#243559]">{insight.pricePerSqft}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1 text-[14px] font-bold text-[#1E7A46]">
                    <TrendingUp className="size-4" /> {insight.yoy}
                  </span>
                  <Link href={insight.href} className="text-[13px] font-bold text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-white px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
                    View Insights
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sticky Contact Card */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="bg-[#1E3A8A] rounded-3xl p-6 text-white border border-[#C9A24E]/35 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-gradient-to-br from-[#E8C66A]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3.5 mb-6 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20 font-bold">
                  {property.builder ? property.builder.slice(0, 2) : "CT"}
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#E8C66A]">{property.builder || "ClearTitle One Verified Owner"}</h4>
                  <p className="text-[11px] text-white/50">Verified Lister</p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <button onClick={() => requireLogin(() => setShowContactForm(true))} className="w-full btn-gold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-[14px]">
                  <Phone className="w-4.5 h-4.5" /> {user ? "Reveal Contact Number" : "Login to View Contact"}
                </button>
                <button onClick={handleDownloadBrochure} className="w-full bg-white/10 hover:bg-white/15 border border-[#E8C66A]/40 text-[#E8C66A] font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Download className="w-4.5 h-4.5" /> Download Brochure
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("legal-console");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    else setShowContactForm(true);
                  }}
                  className="w-full bg-[#C9A24E] hover:bg-[#A8842C] text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Scale className="w-4.5 h-4.5 text-[#E8C66A]" /> Consult Lawyer on Title
                </button>
                <button onClick={() => setShowContactForm(true)} className="w-full border-2 border-white/10 hover:bg-white/10 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4.5 h-4.5" /> Leave Message
                </button>
              </div>

              {showContactForm && (
                <div className="mt-5 p-4.5 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 relative z-10">
                  <p className="text-[13px] font-bold text-[#E8C66A] mb-3">Submit Enquiry</p>
                  <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert("Enquiry submitted successfully!"); setShowContactForm(false); }}>
                    <input type="text" required placeholder="Your Name" className="w-full h-10 px-3 bg-white/10 border border-white/15 rounded-xl text-[13px] text-white outline-none focus:border-[#E8C66A] placeholder:text-white/40" />
                    <input type="tel" required placeholder="Phone Number" className="w-full h-10 px-3 bg-white/10 border border-white/15 rounded-xl text-[13px] text-white outline-none focus:border-[#E8C66A] placeholder:text-white/40" />
                    <textarea placeholder="I'd like to schedule a site visit..." rows={3} required className="w-full p-3 bg-white/10 border border-white/15 rounded-xl text-[13px] text-white outline-none focus:border-[#E8C66A] resize-none placeholder:text-white/40" />
                    <button type="submit" className="w-full bg-[#C9A24E] hover:bg-[#A8842C] text-white font-bold py-2.5 rounded-xl text-[12.5px] transition-colors shadow">Book Visit / Request Documents</button>
                  </form>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-white/10 space-y-3 relative z-10">
                <div className="flex items-center gap-2.5 text-[12.5px] text-[#E8C66A]">
                  <Scale className="w-4 h-4 shrink-0" /> <span className="font-extrabold">Title deed audited by Legal Panel</span>
                </div>
                <div className="flex items-center gap-2.5 text-[12.5px] text-white/80">
                  <Shield className="w-4 h-4 text-[#E8C66A] shrink-0" /> <span>{property.reraRegistered ? "RERA Registered development" : "Clear-title documentation review"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[12.5px] text-white/80">
                  <Check className="w-4 h-4 text-[#C9A24E] shrink-0" /> <span>100% Genuine Media verified</span>
                </div>
              </div>
            </div>

            {/* Listed by verified dealer */}
            {listedBy && (
              <Link href={`/dealer/${listedBy.slug}`} className="block bg-white rounded-2xl p-5 shadow-sm border border-[#D5DEF2]/40 hover:border-[#D4AF37]/60 hover:shadow-md transition-all group">
                <p className="text-[10px] text-[#6E7488] uppercase font-bold tracking-wider mb-3">Listed by Verified Dealer</p>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <span className="size-14 rounded-full bg-[#F1F5FF] border border-[#D4AF37]/40 flex items-center justify-center text-[#1E3A8A] overflow-hidden">
                      {listedBy.logo ? (
                        <img src={listedBy.logo} alt={listedBy.agency} className="w-full h-full object-cover" />
                      ) : (
                        <Verified className="size-6 text-[#D4AF37]" />
                      )}
                    </span>
                    <span className="absolute -bottom-1 -right-1 size-6 rounded-full bg-gradient-to-br from-[#E8C66A] to-[#D4AF37] flex items-center justify-center shadow">
                      <ShieldCheck className="size-3.5 text-[#1E3A8A]" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[#1E3A8A] group-hover:text-[#D4AF37] transition-colors truncate">{listedBy.name}</p>
                    <p className="text-[12px] text-[#6E7488] truncate">{listedBy.agency}</p>
                    <p className="text-[11px] text-[#6E7488] mt-0.5">Member since {listedBy.memberSince}</p>
                  </div>
                </div>
                <span className="mt-4 w-full h-10 rounded-xl border border-[#D4AF37] text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white font-bold text-[13px] flex items-center justify-center transition-colors">
                  View Dealer Profile
                </span>
              </Link>
            )}

            <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-[#D5DEF2]/30 text-center">
              <p className="text-[12px] text-[#6E7488] font-semibold">Spotted an error in this listing?</p>
              <button className="text-[12.5px] text-[#D4AF37] font-bold hover:underline mt-1">Report listing</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── EXPLORE MORE: multiple property rails ── */}
      <div ref={setSectionRef("explore")} className="bg-[#EEF3FE] border-t border-[#D5DEF2]/50">
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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1E3A8A]/95 backdrop-blur-md border-t border-[#D4AF37]/30 shadow-2xl">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider truncate">{property.title}</p>
            <p className="text-[20px] font-extrabold text-gold-gradient leading-none">{property.price}</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button onClick={handleDownloadBrochure} className="hidden sm:flex items-center gap-2 border border-[#E8C66A]/40 text-[#E8C66A] font-bold text-[13px] px-5 py-2.5 rounded-xl hover:bg-white/5 transition-all">
              <Download className="size-4" /> Brochure
            </button>
            <a
              href={user ? "tel:+919876543210" : undefined}
              onClick={(e) => { if (!user) { e.preventDefault(); setIsAuthModalOpen(true); } }}
              className="hidden sm:flex items-center gap-2 border border-white/20 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl hover:bg-white/10 transition-all"
            >
              <Phone className="size-4" /> Call
            </a>
            <button onClick={() => { setShowContactForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn-gold flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px]">
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
