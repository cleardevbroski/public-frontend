"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  ImagePlus,
  Shield,
  MapPin,
  Eye,
  Sparkles,
  Zap,
  CloudRain,
  Waves,
  Layers,
  Car,
  Dumbbell,
  TreePine,
  Droplets,
  Bed,
  Bath,
  Maximize,
  Home,
  Clock,
  Verified,
  Loader2,
  FileText,
  CheckSquare,
  Square,
  AlertTriangle,
} from "lucide-react";
import MediaUploader from "./MediaUploader";
import HeroImageUploader from "./HeroImageUploader";
import OptionalMediaField from "./OptionalMediaField";
import ProjectContentEditor from "./ProjectContentEditor";
import ApartmentDetailsFields from "./ApartmentDetailsFields";
import VillaDetailsFields from "./VillaDetailsFields";
import PlotDetailsFields from "./PlotDetailsFields";
import CommercialDetailsFields from "./CommercialDetailsFields";
import PgDetailsFields from "./PgDetailsFields";
import PropertyQuickFill from "./PropertyQuickFill";
import ReraPhasesEditor, { KARNATAKA_RERA_URL } from "./ReraPhasesEditor";
import BulkPropertyMediaImporter from "./BulkPropertyMediaImporter";
import { addProperty, setPropertyStatus, updateProperty } from "@/lib/propertyStore";
import { analyzeProjectLocation, confirmProjectLocation, createPropertyDraft, createPublicProperty, fetchBuilders, resolveNearbyPlaceLocation, resubmitProperty, uploadPropertyMedia } from "@/lib/api";
import { trackAnalytics } from "@/lib/analytics";
import type { ConfigurationDetail, FacilityDetail, NearbyPlace, PlotDetails, Property, VillaConfigurationDetail } from "@/components/acres/mock-data";
import {
  createConfigurationDetail,
  normalizeBhkLabel,
  formatPossession,
  type ApartmentErrors,
} from "@/lib/propertyDetails";
import {
  createVillaConfigurationDetail,
  initialVillaDetails,
  parseVillaConfigurationLabel,
  validateVillaDraft,
} from "@/lib/villaDetails";
import {
  createPlotSizeDetail,
  initialPlotDetails,
  normalizePlotSize,
  validatePlotDraft,
} from "@/lib/plotDetails";
import { initialCommercialDetails } from "@/lib/commercialDetails";
import { initialPgDetails } from "@/lib/pgDetails";
import { mergeQuickFill, type QuickFillPatch } from "@/lib/propertyQuickFill";
import { mergeUploadedMedia } from "@/lib/propertyMediaState";
import type { PropertySubmissionProfileInput } from "@/components/property/PropertyPosterProfileForm";
import { PROPERTY_DOCUMENT_MAX_BYTES, PROPERTY_DOCUMENT_MAX_MB } from "@/lib/propertyMediaLimits";

const steps = [
  { id: 1, label: "Basic Details", icon: Building2 },
  { id: 2, label: "Photos", icon: ImagePlus },
  { id: 3, label: "Amenities", icon: Shield },
  { id: 4, label: "Society & Locality", icon: MapPin },
  { id: 5, label: "Review & Submit", icon: Eye },
];
// Future extension point: add a Verification Documents step only after the
// product owner supplies the required document categories and approval rules.

const propertyTypes = ["Apartment", "Villa", "Plot", "Commercial", "PG/Co-living"];
const transactionTypes = ["New Property"];
const possessionOptions = ["Ready to Move", "Within 3 Months", "Within 6 Months", "Within 1 Year", "Dec 2026", "Mar 2027", "Jun 2027"];
const furnishingOptions = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
const facingOptions = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];
const parkingOptions = ["None", "1 Covered", "2 Covered", "1 Covered (Private Garage)", "2 Covered (Private Garage)", "1 Open", "2 Open", "1 Covered + 1 Open"];
const ageOptions = ["Under Construction", "0-1 Years", "1-5 Years", "5-10 Years", "10+ Years"];
const badgeOptions = ["RERA", "Premium", "New Launch", "Verified", "Hot Deal", "Price Drop"];
// Values must match the backend Property.websiteSection enum
const sectionOptions = [
  { value: "None", label: "None" },
  { value: "Featured", label: "Featured Property Recommendations" },
  { value: "Handpicked", label: "Feature in Handpicked Projects" },
  { value: "Recommended Insights", label: "Recommended Insights" },
  { value: "Search Trends", label: "Based on search trends" },
  { value: "Offers", label: "Offers for you" },
  { value: "Newly Launched", label: "Newly Launched" },
];

const allAmenities = [
  { name: "Power Backup", icon: Zap, color: "#DDAA42" },
  { name: "Rain Water Harvesting", icon: CloudRain, color: "#DDAA42" },
  { name: "Club House", icon: Building2, color: "#F2C052" },
  { name: "Swimming Pool", icon: Waves, color: "#DDAA42" },
  { name: "Security", icon: Shield, color: "#DDAA42" },
  { name: "Lift", icon: Layers, color: "#DDAA42" },
  { name: "Reserved Parking", icon: Car, color: "#F2C052" },
  { name: "Gymnasium", icon: Dumbbell, color: "#DDAA42" },
  { name: "Park", icon: TreePine, color: "#DDAA42" },
  { name: "Water Storage", icon: Droplets, color: "#DDAA42" },
  { name: "Badminton Court(s)", icon: Sparkles, color: "#DDAA42" },
  { name: "Kids' Play Areas / Sand Pits", icon: Home, color: "#DDAA42" },
  { name: "Yoga Areas", icon: Sparkles, color: "#DDAA42" },
  { name: "Jogging / Cycle Track", icon: Zap, color: "#F2C052" },
  { name: "Table Tennis", icon: Sparkles, color: "#DDAA42" },
  { name: "Snooker/Pool/Billiards", icon: Sparkles, color: "#DDAA42" },
  { name: "AC Waiting Lobby", icon: Building2, color: "#DDAA42" },
  { name: "24x7 Water Supply", icon: Droplets, color: "#DDAA42" },
  { name: "CCTV / Video Surveillance", icon: Shield, color: "#DDAA42" },
  { name: "Intercom Facility", icon: Shield, color: "#DDAA42" },
  { name: "Party Hall", icon: Building2, color: "#F2C052" },
  { name: "Indoor Games", icon: Sparkles, color: "#DDAA42" },
  { name: "Luxurious Clubhouse", icon: Building2, color: "#F2C052" },
  { name: "Senior Citizen Area", icon: Home, color: "#DDAA42" },
  { name: "Large Green Area", icon: TreePine, color: "#DDAA42" },
];

const villaOnlyAmenities = [
  { name: "Gated Security", icon: Shield, color: "#DDAA42" },
  { name: "Landscaped Gardens", icon: TreePine, color: "#DDAA42" },
  { name: "Jogging Track", icon: Zap, color: "#F2C052" },
  { name: "Children's Play Area", icon: Home, color: "#DDAA42" },
  { name: "EV Charging", icon: Zap, color: "#DDAA42" },
  { name: "Community Hall", icon: Building2, color: "#F2C052" },
];

const plotOnlyAmenities = [
  { name: "Entrance Arch", icon: Home, color: "#DDAA42" },
  { name: "Jogging Track", icon: Zap, color: "#F2C052" },
  { name: "Underground Drainage", icon: Droplets, color: "#DDAA42" },
  { name: "Street Lighting", icon: Sparkles, color: "#DDAA42" },
  { name: "Avenue Plantation", icon: TreePine, color: "#DDAA42" },
  { name: "Cauvery/Borewell Water Supply", icon: Droplets, color: "#F2C052" },
  { name: "Security Cabin", icon: Shield, color: "#DDAA42" },
];
const commercialOnlyAmenities = [
  { name: "24x7 Security", icon: Shield, color: "#DDAA42" }, { name: "Passenger Lift", icon: Layers, color: "#DDAA42" },
  { name: "Service Lift", icon: Layers, color: "#F2C052" }, { name: "Cafeteria", icon: Building2, color: "#DDAA42" },
  { name: "Conference Rooms", icon: Building2, color: "#DDAA42" }, { name: "DG Backup", icon: Zap, color: "#F2C052" },
  { name: "ATM", icon: Building2, color: "#DDAA42" }, { name: "Food Court", icon: Building2, color: "#DDAA42" },
];

const isStructuredType = (propertyType?: string) => propertyType === "Apartment" || propertyType === "Villa" || propertyType === "Plot" || propertyType === "Commercial" || propertyType === "PG/Co-living";

type FormData = Omit<Property, "id">;
type NearbyCategory = "schools" | "colleges" | "hospitals" | "shopping" | "metro" | "workplaces" | "parks" | "roads";
const nearbyCategories: NearbyCategory[] = ["schools", "colleges", "hospitals", "shopping", "metro", "workplaces", "parks", "roads"];

const initialFormData: FormData = {
  title: "",
  subtitle: "",
  price: "",
  pricePerSqft: "",
  configs: [],
  configurationDetails: [],
  villaDetails: undefined,
  plotDetails: undefined,
  commercialDetails: undefined,
  pgDetails: undefined,
  rentDetails: undefined,
  leaseDetails: undefined,
  area: "",
  projectArea: undefined,
  totalUnits: undefined,
  totalTowers: undefined,
  projectNarrative: undefined,
  masterPlan: undefined,
  projectDownloads: [],
  walkthroughVideoUrl: "",
  faqs: [],
  possession: "",
  possessionDetails: undefined,
  builder: "",
  developerLogoUrl: "",
  developerDescription: "",
  localityMapImageUrl: "",
  image: "",
  badges: [],
  description: "",
  propertyType: "",
  bedrooms: undefined,
  bathrooms: undefined,
  parking: "",
  furnishing: "",
  facing: "",
  floor: "",
  floorLabel: "",
  transactionType: "",
  listingType: "" as Property["listingType"],
  ageOfProperty: "",
  heroImages: [],
  images: [],
  amenities: [],
  facilities: [],
  society: {
    security: "",
    waterSupply: "",
    powerBackup: "",
    lift: "",
    visitorParking: "",
    maintenanceStaff: "",
  },
  locality: {
    city: "",
    zone: "",
    address: "",
    landmark: "",
    pinCode: "",
    latitude: undefined,
    longitude: undefined,
  },
  nearbyAmenities: {
    schools: "",
    colleges: "",
    hospitals: "",
    shopping: "",
    metro: "",
  },
  nearbyDetails: {
    schools: { count: undefined, distance: "" },
    colleges: { count: undefined, distance: "" },
    hospitals: { count: undefined, distance: "" },
    shopping: { count: undefined, distance: "" },
    metro: { count: undefined, distance: "" },
    workplaces: { count: undefined, distance: "" },
    parks: { count: undefined, distance: "" },
    roads: { count: undefined, distance: "" },
  },
  reraRegistered: false,
  reraNumber: "",
  reraPhases: [],
  verified: false,
  websiteSection: "None",
};

interface PropertyFormProps {
  /** "admin" publishes live; "public" enters the customer moderation workflow. */
  mode?: "admin" | "public";
  initialData?: Partial<FormData>;
  submissionId?: string;
  submissionProfile?: PropertySubmissionProfileInput;
}

/** Keep only information entered in the form. Empty fields must not become
 * fallback text, defaults, or empty nested records in a property listing. */
function compactPropertyPayload<T>(value: T): T | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return (trimmed ? trimmed : undefined) as T | undefined;
  }
  if (Array.isArray(value)) {
    const entries = value.map((item) => compactPropertyPayload(item)).filter((item) => item !== undefined);
    return (entries.length ? entries : undefined) as T | undefined;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, compactPropertyPayload(item)] as const)
      .filter(([, item]) => item !== undefined);
    return (entries.length ? Object.fromEntries(entries) : undefined) as T | undefined;
  }
  return value;
}

function mergeInitialData(initialData?: Partial<FormData>): FormData {
  if (!initialData) return initialFormData;
  const reraPhases = initialData.reraPhases?.length
    ? initialData.reraPhases.map((phase) => ({ ...phase, reraSiteUrl: phase.reraSiteUrl || KARNATAKA_RERA_URL }))
    : initialData.reraRegistered && initialData.reraNumber
      ? [{ name: "Phase 1", reraNumber: initialData.reraNumber, reraSiteUrl: KARNATAKA_RERA_URL, reraDocuments: [], projectDocuments: [] }]
      : [];
  return {
    ...initialFormData,
    ...initialData,
    society: { ...initialFormData.society, ...initialData.society },
    locality: { ...initialFormData.locality, ...initialData.locality },
    nearbyAmenities: { ...initialFormData.nearbyAmenities, ...initialData.nearbyAmenities },
    nearbyDetails: { ...initialFormData.nearbyDetails, ...initialData.nearbyDetails },
    reraPhases,
  };
}

export default function PropertyForm({ mode = "admin", initialData, submissionId, submissionProfile }: PropertyFormProps) {
  const navigate = useNavigate();
  const isPublic = mode === "public";
  const isAdminEdit = !isPublic && Boolean(submissionId);
  const isResubmission = Boolean(submissionId && initialData?.status !== "draft");
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(() => mergeInitialData(initialData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<"pending" | "publish" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [configInput, setConfigInput] = useState("");
  const [builders, setBuilders] = useState<{ id: string; name: string }[]>([]);
  const [validationErrors, setValidationErrors] = useState<ApartmentErrors>({});
  const [configError, setConfigError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [resolvingNearby, setResolvingNearby] = useState("");
  const [nearbyResolveErrors, setNearbyResolveErrors] = useState<Record<string, string>>({});
  const [geocodeInput, setGeocodeInput] = useState(() => Number.isFinite(initialData?.locality?.latitude) && Number.isFinite(initialData?.locality?.longitude)
    ? `${initialData?.locality?.latitude}, ${initialData?.locality?.longitude}`
    : "");
  const [analyzingLocation, setAnalyzingLocation] = useState(false);
  const [confirmingLocation, setConfirmingLocation] = useState(false);
  const [locationVerificationError, setLocationVerificationError] = useState("");
  const [coordinatePublishAcknowledgement, setCoordinatePublishAcknowledgement] = useState("");

  const latitude = Number(formData.locality?.latitude);
  const longitude = Number(formData.locality?.longitude);
  const hasProjectCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const locationVerificationMatches = formData.locationVerification?.status === "admin_verified"
    && Math.abs(Number(formData.locationVerification.inputLatitude) - latitude) < 0.0000001
    && Math.abs(Number(formData.locationVerification.inputLongitude) - longitude) < 0.0000001;
  const unverifiedCoordinateKey = hasProjectCoordinates && !locationVerificationMatches
    ? `${latitude.toFixed(7)},${longitude.toFixed(7)}`
    : "";

  const buildPropertyPayload = () => compactPropertyPayload({
    ...formData,
    ingestion: undefined,
    // Normalize legacy floor and brochure fields at submit time. Existing records
    // remain readable, while new saves use the current workflow fields only.
    floorLabel: undefined,
    projectDownloads: formData.projectDownloads?.length || !formData.brochure
      ? formData.projectDownloads
      : [{ kind: "brochure", label: "Project Brochure", fileName: formData.brochureName || "Brochure.pdf", fileUrl: formData.brochure, mimeType: "application/pdf" }],
    heroImages: (formData.heroImages || []).slice(0, 3),
    // Retain the original submitter when an admin edits a customer listing.
    submittedBy: formData.submittedBy || (isPublic ? "user" : "admin"),
    ...(isPublic && submissionProfile ? { submissionProfile } : {}),
  }) || {};

  useEffect(() => {
    if (isPublic) return;
    fetchBuilders({ limit: 200 })
      .then((data) => setBuilders(data.builders))
      .catch(() => {});
  }, [isPublic]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const applyQuickFill = (patch: QuickFillPatch, replaceExisting: boolean) => {
    const importedType = patch.propertyType;
    if (importedType && importedType !== formData.propertyType && formData.propertyType) {
      const proceed = window.confirm(`Apply this ${importedType} import? Existing ${formData.propertyType} structured details will be replaced.`);
      if (!proceed) return;
    }
    setFormData((previous) => {
      const changingType = Boolean(importedType && importedType !== previous.propertyType);
      const base = changingType
        ? {
            ...previous,
            propertyType: importedType,
            configs: [],
            configurationDetails: undefined,
            villaDetails: undefined,
            plotDetails: undefined,
            commercialDetails: undefined,
            pgDetails: undefined,
            possessionDetails: undefined,
          }
        : previous;
      return mergeQuickFill(base, patch, replaceExisting);
    });
    setValidationErrors({});
    setConfigError("");
  };

  const setPlotDetails = (value: PlotDetails | ((current: PlotDetails) => PlotDetails)) => {
    setFormData((previous) => {
      const current = previous.plotDetails || initialPlotDetails();
      return { ...previous, plotDetails: typeof value === "function" ? value(current) : value };
    });
  };

  const updateNestedField = <K extends keyof FormData>(
    parent: K,
    key: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] as Record<string, string>), [key]: value },
    }));
  };

  const updateNearbyPlace = (
    category: NearbyCategory,
    index: number,
    updates: Partial<NearbyPlace>
  ) => {
    setFormData((prev) => {
      const places = [...(prev.nearbyDetails?.[category]?.places || [])];
      places[index] = { ...places[index], ...updates };
      return {
        ...prev,
        nearbyDetails: {
          ...(prev.nearbyDetails || {}),
          [category]: { places },
        },
      };
    });
  };

  const clearResolvedNearbyPlaces = (details: FormData["nearbyDetails"]) => details
    ? Object.fromEntries(Object.entries(details).map(([category, detail]) => [category, detail ? {
        ...detail,
        places: detail.places?.map(({ latitude, longitude, osmId, mapUrl, resolvedAddress, approximateDistanceMeters, ...place }) => place),
      } : detail])) as FormData["nearbyDetails"]
    : details;

  const updateProjectCoordinates = (latitude?: number, longitude?: number) => {
    setFormData((previous) => ({
      ...previous,
      locality: { ...previous.locality, latitude, longitude },
      locationVerification: undefined,
      nearbyDetails: clearResolvedNearbyPlaces(previous.nearbyDetails),
    }));
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) setGeocodeInput(`${latitude}, ${longitude}`);
    setLocationVerificationError("");
  };

  const updateLocationTextField = (key: "address" | "landmark" | "city" | "pinCode", value: string) => {
    setFormData((previous) => ({
      ...previous,
      locality: { ...previous.locality, [key]: value },
      locationVerification: undefined,
    }));
    setLocationVerificationError("");
  };

  const analyzeLocation = async () => {
    setAnalyzingLocation(true);
    setLocationVerificationError("");
    try {
      const analysis = await analyzeProjectLocation({
        geocode: geocodeInput,
        latitude: Number.isFinite(formData.locality?.latitude) ? formData.locality?.latitude : undefined,
        longitude: Number.isFinite(formData.locality?.longitude) ? formData.locality?.longitude : undefined,
        locality: formData.locality,
        reraAddresses: (formData.reraPhases || []).map((phase) => phase.officialDetails?.registeredAddress || "").filter(Boolean),
      });
      setGeocodeInput(`${analysis.inputLatitude}, ${analysis.inputLongitude}`);
      setFormData((previous) => {
        const coordinatesChanged = previous.locality?.latitude !== analysis.inputLatitude || previous.locality?.longitude !== analysis.inputLongitude;
        return {
          ...previous,
          locality: { ...previous.locality, latitude: analysis.inputLatitude, longitude: analysis.inputLongitude },
          locationVerification: analysis,
          nearbyDetails: coordinatesChanged ? clearResolvedNearbyPlaces(previous.nearbyDetails) : previous.nearbyDetails,
        };
      });
    } catch (cause) {
      setLocationVerificationError(cause instanceof Error ? cause.message : "Could not analyze this project location.");
    } finally {
      setAnalyzingLocation(false);
    }
  };

  const confirmLocation = async () => {
    if (!formData.locationVerification) return;
    setConfirmingLocation(true);
    setLocationVerificationError("");
    try {
      const verification = await confirmProjectLocation(formData.locationVerification);
      setFormData((previous) => ({ ...previous, locationVerification: verification }));
    } catch (cause) {
      setLocationVerificationError(cause instanceof Error ? cause.message : "Could not confirm this project location.");
    } finally {
      setConfirmingLocation(false);
    }
  };

  const applyResolvedLocation = () => {
    const verification = formData.locationVerification;
    if (!verification) return;
    const components = verification.components || {};
    setFormData((previous) => ({
      ...previous,
      locality: {
        ...previous.locality,
        address: verification.resolvedAddress || previous.locality?.address,
        landmark: components.neighbourhood || components.suburb || previous.locality?.landmark,
        city: components.city || previous.locality?.city,
        pinCode: /^\d{6}$/.test(components.pinCode || "") ? components.pinCode : previous.locality?.pinCode,
      },
      locationVerification: undefined,
    }));
    setLocationVerificationError("Resolved details applied. Analyze again to compare and confirm the updated address.");
  };

  const addNearbyPlace = (category: NearbyCategory) => {
    setFormData((prev) => ({
      ...prev,
      nearbyDetails: {
        ...(prev.nearbyDetails || {}),
        [category]: {
          places: [...(prev.nearbyDetails?.[category]?.places || []), { name: "", address: "", distance: "", landmark: "" }],
        },
      },
    }));
  };

  const removeNearbyPlace = (category: NearbyCategory, index: number) => {
    setFormData((prev) => ({
      ...prev,
      nearbyDetails: {
        ...(prev.nearbyDetails || {}),
        [category]: {
          places: (prev.nearbyDetails?.[category]?.places || []).filter((_, placeIndex) => placeIndex !== index),
        },
      },
    }));
  };

  const resolveNearbyMapPlace = async (category: NearbyCategory, index: number) => {
    const place = formData.nearbyDetails?.[category]?.places?.[index];
    const latitude = formData.locality?.latitude;
    const longitude = formData.locality?.longitude;
    const rowKey = `${category}-${index}`;
    if (!place?.name.trim()) return;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setNearbyResolveErrors((previous) => ({ ...previous, [rowKey]: "Enter the property latitude and longitude first." }));
      return;
    }
    setResolvingNearby(rowKey);
    setNearbyResolveErrors((previous) => ({ ...previous, [rowKey]: "" }));
    try {
      const resolved = await resolveNearbyPlaceLocation({
        query: [place.name, place.address, formData.locality?.city].filter(Boolean).join(", "),
        latitude: latitude as number,
        longitude: longitude as number,
      });
      updateNearbyPlace(category, index, resolved);
    } catch (cause) {
      setNearbyResolveErrors((previous) => ({ ...previous, [rowKey]: cause instanceof Error ? cause.message : "Could not resolve this place." }));
    } finally {
      setResolvingNearby("");
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...(prev.amenities || []), amenity],
      facilities: prev.amenities?.includes(amenity)
        ? prev.facilities?.filter((facility) => facility.name !== amenity)
        : prev.facilities,
    }));
  };

  const updateFacility = (name: string, updates: Partial<FacilityDetail>) => {
    setFormData((prev) => {
      const facilities = [...(prev.facilities || [])];
      const index = facilities.findIndex((facility) => facility.name === name);
      const current: FacilityDetail = index >= 0 ? facilities[index] : { id: `facility-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name, category: "Amenities", status: "Available" };
      if (index >= 0) facilities[index] = { ...current, ...updates };
      else facilities.push({ ...current, ...updates });
      return { ...prev, facilities };
    });
  };

  const visibleAmenities = formData.propertyType === "Villa"
    ? [...allAmenities, ...villaOnlyAmenities]
    : formData.propertyType === "Plot"
      ? [...allAmenities, ...plotOnlyAmenities]
      : formData.propertyType === "Commercial"
        ? commercialOnlyAmenities
      : allAmenities;
  const allAmenitiesSelected = visibleAmenities.every((item) => formData.amenities?.includes(item.name));

  const toggleAllAmenities = () => {
    setFormData((prev) => ({
      ...prev,
      amenities: allAmenitiesSelected
        ? (prev.amenities || []).filter((name) => !visibleAmenities.some((item) => item.name === name))
        : [...new Set([...(prev.amenities || []), ...visibleAmenities.map((item) => item.name)])],
      facilities: allAmenitiesSelected
        ? prev.facilities?.filter((facility) => !visibleAmenities.some((item) => item.name === facility.name))
        : prev.facilities,
    }));
  };

  const toggleBadge = (badge: string) => {
    setFormData((prev) => ({
      ...prev,
      badges: prev.badges?.includes(badge)
        ? prev.badges.filter((b) => b !== badge)
        : [...(prev.badges || []), badge],
    }));
  };

  const addConfig = () => {
    const raw = configInput.trim();
    if (!raw) return;
    const plotSize = formData.propertyType === "Plot" ? normalizePlotSize(raw) : null;
    const config = formData.propertyType === "Plot"
      ? plotSize?.plotSize || ""
      : formData.propertyType === "Villa"
        ? parseVillaConfigurationLabel(raw)?.configuration || ""
        : isStructuredType(formData.propertyType) ? normalizeBhkLabel(raw) : raw;
    if (!config) {
      setConfigError(formData.propertyType === "Plot"
        ? "Use positive width × length values, for example 30 × 40."
        : formData.propertyType === "Villa"
          ? "Use a Villa configuration such as 4 BHK Duplex (G+1), Villament, or Penthouse."
          : "Use a positive BHK label, for example 2 BHK or 3.5 BHK.");
      return;
    }
    if (formData.propertyType !== "Apartment" && formData.propertyType !== "Villa" && formData.configs.some((item) => item.toLowerCase() === config.toLowerCase())) {
      setConfigError(`${config} has already been added.`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      configs: [...prev.configs, config],
      configurationDetails: prev.propertyType === "Apartment"
        ? [...(prev.configurationDetails || []), createConfigurationDetail(config)]
        : prev.configurationDetails,
      villaDetails: prev.propertyType === "Villa"
        ? { ...(prev.villaDetails || initialVillaDetails()), configurationDetails: [...(prev.villaDetails?.configurationDetails || []), createVillaConfigurationDetail(config)] }
        : prev.villaDetails,
      plotDetails: prev.propertyType === "Plot"
        ? { ...(prev.plotDetails || initialPlotDetails()), plotSizeDetails: [...(prev.plotDetails?.plotSizeDetails || []), createPlotSizeDetail(config)] }
        : prev.plotDetails,
    }));
    setConfigError("");
    setValidationErrors((prev) => ({ ...prev, configurations: "" }));
    setConfigInput("");
  };

  const removeConfig = (config: string, occurrence = 0) => {
    const findOccurrence = <T extends { configuration?: string; plotSize?: string }>(rows: T[] | undefined) =>
      rows?.filter((item) => (item.configuration || item.plotSize) === config)[occurrence];
    const removeOccurrence = <T extends { configuration?: string; plotSize?: string }>(rows: T[] | undefined) => {
      let matches = 0;
      return rows?.filter((item) => {
        if ((item.configuration || item.plotSize) !== config) return true;
        const shouldRemove = matches === occurrence;
        matches += 1;
        return !shouldRemove;
      });
    };
    const targetConfigIndex = formData.configs.findIndex((value, index) => value === config && formData.configs.slice(0, index + 1).filter((item) => item === config).length === occurrence + 1);
    const apartmentRow = findOccurrence(formData.configurationDetails);
    const villaRow = findOccurrence(formData.villaDetails?.configurationDetails);
    const plotRow = formData.plotDetails?.plotSizeDetails.find((item) => item.plotSize === config);
    const populated = apartmentRow
      ? Boolean(apartmentRow.price || apartmentRow.builtUpArea || apartmentRow.carpetArea || apartmentRow.facings.length)
      : villaRow
        ? Boolean(villaRow.price || villaRow.plotArea || villaRow.builtUpArea || villaRow.carpetArea || villaRow.superArea || villaRow.bedrooms || villaRow.bathrooms || villaRow.balconies !== undefined)
        : Boolean(plotRow?.pricePerSqft || plotRow?.facings.length);
    if (populated && !window.confirm(`Remove ${config} and all details entered for it?`)) return;
    setFormData((prev) => ({
      ...prev,
      configs: prev.configs.filter((value, index) => index !== targetConfigIndex),
      configurationDetails: removeOccurrence(prev.configurationDetails),
      villaDetails: prev.villaDetails
        ? { ...prev.villaDetails, configurationDetails: removeOccurrence(prev.villaDetails.configurationDetails) || [] }
        : undefined,
      plotDetails: prev.plotDetails
        ? { ...prev.plotDetails, plotSizeDetails: prev.plotDetails.plotSizeDetails.filter((item) => item.plotSize !== config), inventory: prev.plotDetails.inventory.filter((item) => item.plotSize !== config) }
        : undefined,
    }));
  };

  const updateConfigurationDetail = (index: number, updates: Partial<ConfigurationDetail>) => {
    setFormData((prev) => ({
      ...prev,
      configurationDetails: prev.configurationDetails?.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...updates } : row
      ),
    }));
  };

  const updateVillaConfigurationDetail = (index: number, updates: Partial<VillaConfigurationDetail>) => {
    setFormData((prev) => ({
      ...prev,
      villaDetails: prev.villaDetails
        ? { ...prev.villaDetails, configurationDetails: prev.villaDetails.configurationDetails.map((row, rowIndex) => rowIndex === index ? { ...row, ...updates } : row) }
        : undefined,
    }));
  };

  const changePropertyType = (propertyType: string) => {
    if (propertyType === formData.propertyType) return;
    const apartmentPopulated = Boolean(formData.configurationDetails?.some((row) => row.price || row.builtUpArea || row.carpetArea));
    const villaPopulated = Boolean(formData.villaDetails?.configurationDetails.some((row) => row.price || row.plotArea || row.builtUpArea || row.carpetArea || row.superArea || row.bedrooms || row.bathrooms || row.balconies !== undefined));
    const plotPopulated = Boolean(formData.plotDetails?.plotSizeDetails.some((row) => row.pricePerSqft || row.facings.length) || formData.plotDetails?.inventory.length);
    const commercialPopulated = Boolean(formData.commercialDetails?.carpetArea || formData.commercialDetails?.builtUpArea || formData.commercialDetails?.superArea);
    const pgPopulated = Boolean(formData.pgDetails?.sharingDetails.length);
    if ((apartmentPopulated || villaPopulated || plotPopulated || commercialPopulated || pgPopulated) && !window.confirm("Changing property type will remove the populated structured details. Continue?")) return;
    setValidationErrors({});
    setConfigError("");
    setFormData((prev) => ({
      ...prev,
      propertyType,
      ...(propertyType === "Apartment"
        ? {
            configs: [],
            configurationDetails: [],
            villaDetails: undefined,
            plotDetails: undefined,
            commercialDetails: undefined,
            pgDetails: undefined,
            possessionDetails: undefined,
          }
        : propertyType === "Villa"
          ? {
              configs: [],
              configurationDetails: undefined,
              villaDetails: undefined,
              plotDetails: undefined,
              commercialDetails: undefined,
              pgDetails: undefined,
              possessionDetails: undefined,
            }
          : propertyType === "Plot"
            ? {
                configs: [],
                configurationDetails: undefined,
                villaDetails: undefined,
                plotDetails: undefined,
                commercialDetails: undefined,
                pgDetails: undefined,
                possessionDetails: undefined,
              }
          : propertyType === "Commercial"
            ? {
                configs: [], configurationDetails: undefined, villaDetails: undefined, plotDetails: undefined,
                commercialDetails: undefined, possessionDetails: undefined,
              }
          : propertyType === "PG/Co-living" ? { configs: [], configurationDetails: undefined, villaDetails: undefined, plotDetails: undefined, commercialDetails: undefined, pgDetails: undefined, possessionDetails: undefined }
          : {
              ...(isStructuredType(prev.propertyType) ? { configs: [] } : {}),
              configurationDetails: undefined,
              villaDetails: undefined,
              plotDetails: undefined,
              commercialDetails: undefined,
              pgDetails: undefined,
              possessionDetails: undefined,
            }),
      ...(!isStructuredType(propertyType) ? {
        floorLabel: undefined,
        totalFloors: undefined,
        overlooking: undefined,
        reraNumber: undefined,
        reraPhases: undefined,
        nearbyDetails: undefined,
      } : {}),
      overlooking: undefined,
      ...(!["Apartment", "Villa"].includes(propertyType) ? { projectArea: undefined, totalUnits: undefined, totalTowers: undefined } : {}),
      amenities: propertyType === "Villa"
        ? prev.amenities
        : propertyType === "Plot"
          ? prev.amenities?.filter((name) => !villaOnlyAmenities.some((item) => item.name === name))
          : propertyType === "Commercial"
            ? prev.amenities?.filter((name) => ![...villaOnlyAmenities, ...plotOnlyAmenities].some((item) => item.name === name))
            : prev.amenities?.filter((name) => ![...villaOnlyAmenities, ...plotOnlyAmenities, ...commercialOnlyAmenities].some((item) => item.name === name)),
    }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.propertyType) return;
    if (uploadInProgress) {
      setSubmitError("Wait for all file uploads to finish before continuing.");
      return;
    }
    setValidationErrors({});
    setCurrentStep((s) => Math.min(s + 1, 5));
  };
  const prevStep = () => {
    if (uploadInProgress) {
      setSubmitError("Wait for all file uploads to finish before leaving this step.");
      return;
    }
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (action: "pending" | "publish" = "publish") => {
    if (isSubmitting) return;
    if (uploadInProgress) {
      setSubmitError("Wait for all file uploads to finish before publishing.");
      return;
    }
    if (action === "publish" && formData.propertyType === "Plot") {
      const plotErrors = validatePlotDraft(formData);
      if (Object.keys(plotErrors).length) {
        const rowCount = formData.plotDetails?.inventory.length || 0;
        const totalPlots = formData.plotDetails?.totalPlots || 0;
        setValidationErrors(plotErrors);
        setSubmitError(plotErrors.inventory && rowCount !== totalPlots
          ? `Plot inventory has ${rowCount} row${rowCount === 1 ? "" : "s"}, but total plots is ${totalPlots}.`
          : "Complete the highlighted plot details before publishing.");
        setCurrentStep(1);
        return;
      }
    }
    if (action === "publish" && formData.propertyType === "Villa") {
      const villaErrors = validateVillaDraft(formData);
      if (Object.keys(villaErrors).length) {
        setValidationErrors(villaErrors);
        const facingError = Object.entries(villaErrors).find(([field]) => field.endsWith("plotFacing"))?.[1];
        setSubmitError(facingError || Object.values(villaErrors)[0] || "Complete the highlighted Villa details.");
        setCurrentStep(1);
        return;
      }
    }
    if (action === "publish" && formData.reraRegistered && (!formData.reraPhases?.length || formData.reraPhases.some((phase) => !phase.name.trim() || !/^[A-Za-z0-9/._-]{8,50}$/.test(phase.reraNumber.trim())))) {
      setValidationErrors((previous) => ({ ...previous, reraPhases: "Every phase needs a name and a valid 8–50 character RERA registration number." }));
      setCurrentStep(1);
      return;
    }
    if (!isPublic && action === "publish" && unverifiedCoordinateKey && coordinatePublishAcknowledgement !== unverifiedCoordinateKey) {
      setCoordinatePublishAcknowledgement(unverifiedCoordinateKey);
      setSubmitError("");
      return;
    }
    setIsSubmitting(true);
    setSubmitAction(action);
    setSubmitError("");
    try {
      const propertyPayload = buildPropertyPayload();

      if (isPublic) {
        if (submissionId) await resubmitProperty(submissionId, propertyPayload as any);
        else await createPublicProperty(propertyPayload as any);
        trackAnalytics("public_property_submitted", { propertyTitle: formData.title, location: formData.subtitle, propertyType: formData.propertyType, source: submissionId ? "customer_resubmission" : "customer_submission" });
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        let property;
        if (isAdminEdit) {
          // Editing must not overwrite the customer account or any moderation
          // state that belongs to the existing listing.
          const {
            id: _id,
            _id: _mongoId,
            postedBy: _postedBy,
            propertyPoster: _propertyPoster,
            submissionProfile: _submissionProfile,
            postedDate: _postedDate,
            submittedBy: _submittedBy,
            published: _published,
            status: _status,
            verified: _verified,
            featured: _featured,
            source: _source,
            submissionVersion: _submissionVersion,
            lastSubmittedAt: _lastSubmittedAt,
            reviewedAt: _reviewedAt,
            publishedAt: _publishedAt,
            rejectionReason: _rejectionReason,
            reviewMessages: _reviewMessages,
            reviewReadiness: _reviewReadiness,
            workflowHistory: _workflowHistory,
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            __v: _version,
            ...editablePayload
          } = propertyPayload as Record<string, unknown>;
          property = await updateProperty(submissionId!, editablePayload);
          const currentStatus = String(initialData?.status || (initialData?.published === false ? "pending" : "approved"));
          if (action === "publish" && !["approved", "published"].includes(currentStatus)) {
            property = await setPropertyStatus(submissionId!, "approved");
          } else if (action === "pending" && currentStatus !== "pending") {
            property = await setPropertyStatus(submissionId!, "pending");
          }
        } else {
          property = await addProperty({ ...propertyPayload, status: action === "pending" ? "pending" : "approved", published: action === "publish" } as any);
        }
        if (property) {
          navigate(`/admin?${isAdminEdit ? "updated" : "posted"}=${property.id}`);
        }
      }
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : "Unable to submit the property. Please try again.");
      setIsSubmitting(false);
      setSubmitAction(null);
    }
  };

  const handleSaveDraft = async () => {
    if (isSubmitting || !isPublic || submissionId) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await createPropertyDraft(buildPropertyPayload() as any);
      navigate("/postproperty?view=my");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save draft");
      setIsSubmitting(false);
    }
  };

  if (submitted && isPublic) {
    return (
      <div className="max-w-2xl mx-auto text-center bg-white rounded-3xl p-10 md:p-14 shadow-md border border-[#E4E0E7]/40">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#F2C052] to-[#DDAA42] flex items-center justify-center shadow-lg">
          <Check className="w-10 h-10 text-[#121B35]" strokeWidth={3} />
        </div>
        <h2 className="text-[26px] md:text-[32px] font-bold text-[#121B35] mt-6">
          Property Submitted for Review
        </h2>
        <p className="text-[15px] text-[#68646F] mt-3 leading-relaxed">
          Thank you! Your property <span className="font-bold text-[#121B35]">{formData.title || "listing"}</span> has
          been submitted. Our team will verify the details and publish it on ClearTitle One shortly. You&apos;ll be
          notified once it goes live.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-[13px] font-bold px-4 py-2 rounded-full">
          <Clock className="w-4 h-4" /> Status: {isResubmission ? "Resubmitted" : "Submitted"}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              setFormData(initialFormData);
              setCurrentStep(1);
              setSubmitted(false);
            }}
            className="px-6 py-3 rounded-xl text-[14px] font-bold border border-[#E4E0E7] text-[#121B35] hover:border-[#DDAA42] transition-all"
          >
            Submit Another Property
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl text-[14px] font-bold bg-[#121B35] text-[#F2C052] hover:bg-[#273559] transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const previewData = compactPropertyPayload(formData) || {};

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Progress Bar */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-[#E4E0E7]/30">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => {
                    if (step.id >= currentStep) return;
                    if (uploadInProgress) {
                      setSubmitError("Wait for all file uploads to finish before leaving this step.");
                      return;
                    }
                    setCurrentStep(step.id);
                  }}
                  className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                    step.id < currentStep ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#DDAA42] text-[#0B1328] shadow-md"
                        : isActive
                        ? "bg-gradient-to-br from-[#DDAA42] to-[#273559] text-white shadow-lg scale-110"
                        : "bg-[#F8F7FA] text-[#68646F] border border-[#E4E0E7]/30"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-[11px] font-medium hidden sm:block ${
                      isActive ? "text-[#DDAA42]" : isCompleted ? "text-[#DDAA42]" : "text-[#68646F]"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="flex-1 mx-2 h-0.5 rounded-full overflow-hidden bg-[#F3F1F5]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-[#DDAA42] w-full" : "bg-transparent w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[13px] text-[#68646F] text-center">
          Step {currentStep} of {steps.length} — {steps[currentStep - 1].label}
        </p>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E4E0E7]/30 overflow-hidden">
        <div className="p-6 lg:p-8">
          {/* STEP 1: Basic Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-[20px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}>
                Property Basic Details
              </h2>
              {!isPublic && <PropertyQuickFill propertyType={formData.propertyType} onApply={applyQuickFill} />}
              {Object.values(validationErrors).some(Boolean) && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
                  Please correct the highlighted {formData.propertyType} details before continuing.
                </div>
              )}

              {/* Property Type */}
              <div>
                <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">
                  Property Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {propertyTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      disabled={uploadInProgress}
                      onClick={() => changePropertyType(type)}
                      className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border ${
                        formData.propertyType === type
                          ? "bg-[#DDAA42] text-[#0B1328] border-[#DDAA42] shadow-md"
                          : "bg-[#F8F7FA] text-[#3F3D46] border-[#E4E0E7]/30 hover:border-[#DDAA42]/40"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {!formData.propertyType ? (
                <div className="rounded-2xl border border-dashed border-[#DDAA42]/50 bg-[#FFFBF1] px-5 py-6 text-center">
                  <Building2 className="mx-auto size-7 text-[#B98428]" />
                  <p className="mt-3 text-[14px] font-semibold text-[#121B35]">Select a property type to continue</p>
                  <p className="mt-1 text-[13px] text-[#68646F]">The relevant property details will open after you choose an option above.</p>
                </div>
              ) : (
                <div className="space-y-6">
              {/* Title & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">
                    Property / Project Name
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g. Prestige Lakeside Habitat"
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">
                    Location / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                    placeholder="e.g. Whitefield, Bangalore"
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  />
                </div>
              </div>

              {/* Configs (BHK) */}
              {formData.propertyType === "Apartment" ? (
                <ApartmentDetailsFields
                  configInput={configInput}
                  setConfigInput={setConfigInput}
                  addConfig={addConfig}
                  removeConfig={removeConfig}
                  details={formData.configurationDetails || []}
                  updateDetail={updateConfigurationDetail}
                  possession={formData.possessionDetails || { status: "Ready to Move", launchDate: "" }}
                  setPossession={(value) => updateField("possessionDetails", value)}
                  totalFloors={formData.totalFloors}
                  setTotalFloors={(value) => updateField("totalFloors", value)}
                  projectArea={formData.projectArea}
                  setProjectArea={(value) => updateField("projectArea", value)}
                  totalUnits={formData.totalUnits}
                  setTotalUnits={(value) => updateField("totalUnits", value)}
                  totalTowers={formData.totalTowers}
                  setTotalTowers={(value) => updateField("totalTowers", value)}
                  errors={validationErrors}
                  configError={configError}
                />
              ) : formData.propertyType === "Villa" ? (
                <VillaDetailsFields
                  configInput={configInput}
                  setConfigInput={setConfigInput}
                  addConfig={addConfig}
                  removeConfig={removeConfig}
                  details={formData.villaDetails || initialVillaDetails()}
                  setDetails={(value) => updateField("villaDetails", value)}
                  updateDetail={updateVillaConfigurationDetail}
                  possession={formData.possessionDetails || { status: "Ready to Move", launchDate: "" }}
                  setPossession={(value) => updateField("possessionDetails", value)}
                  projectArea={formData.projectArea}
                  setProjectArea={(value) => updateField("projectArea", value)}
                  totalUnits={formData.totalUnits}
                  setTotalUnits={(value) => updateField("totalUnits", value)}
                  totalTowers={formData.totalTowers}
                  setTotalTowers={(value) => updateField("totalTowers", value)}
                  errors={validationErrors}
                  configError={configError}
                />
              ) : formData.propertyType === "Plot" ? (
                <PlotDetailsFields
                  configInput={configInput}
                  setConfigInput={setConfigInput}
                  addConfig={addConfig}
                  removeConfig={removeConfig}
                  details={formData.plotDetails || initialPlotDetails()}
                  setDetails={setPlotDetails}
                  errors={validationErrors}
                  configError={configError}
                />
              ) : formData.propertyType === "Commercial" ? (
                <CommercialDetailsFields
                  details={formData.commercialDetails || initialCommercialDetails()}
                  setDetails={(value) => updateField("commercialDetails", value)}
                  possession={formData.possessionDetails || { status: "Ready to Move", launchDate: "" }}
                  setPossession={(value) => updateField("possessionDetails", value)}
                  errors={validationErrors}
                />
              ) : formData.propertyType === "PG/Co-living" ? (
                <PgDetailsFields details={formData.pgDetails || initialPgDetails()} setDetails={(value) => updateField("pgDetails", value)} errors={validationErrors} />
              ) : (
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Configurations</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={configInput} onChange={(e) => setConfigInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addConfig())} placeholder="e.g. 3 BHK" className="flex-1 px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42]" />
                    <button type="button" onClick={addConfig} className="px-4 py-3 bg-[#DDAA42] text-[#0B1328] rounded-xl text-[13px] font-medium">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">{formData.configs.map((config) => <span key={config} className="inline-flex items-center gap-1 bg-[#F3F1F5] text-[#DDAA42] px-3 py-1.5 rounded-lg text-[13px] font-medium">{config}<button type="button" onClick={() => removeConfig(config)}>×</button></span>)}</div>
                </div>
              )}

              {/* Price & Area */}
              {(!isStructuredType(formData.propertyType) || formData.propertyType === "Commercial") && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">
                    Price
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="e.g. ₹ 1.25 Cr"
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Price per Sqft</label>
                  <input
                    type="text"
                    value={formData.pricePerSqft || ""}
                    onChange={(e) => updateField("pricePerSqft", e.target.value)}
                    placeholder="e.g. ₹ 8,500/sqft"
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => updateField("area", e.target.value)}
                    placeholder="e.g. 1500 sqft"
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  />
                </div>
              </div>}

              {/* Bedrooms, Bathrooms, Floor */}
              {!isStructuredType(formData.propertyType) && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Bedrooms</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateField("bedrooms", n)}
                        className={`w-11 h-11 rounded-xl text-[14px] font-semibold transition-all duration-200 border ${
                          formData.bedrooms === n
                            ? "bg-[#DDAA42] text-[#0B1328] border-[#DDAA42] shadow-md"
                            : "bg-[#F8F7FA] text-[#3F3D46] border-[#E4E0E7]/30 hover:border-[#DDAA42]/40"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Bathrooms</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateField("bathrooms", n)}
                        className={`w-11 h-11 rounded-xl text-[14px] font-semibold transition-all duration-200 border ${
                          formData.bathrooms === n
                            ? "bg-[#DDAA42] text-[#0B1328] border-[#DDAA42] shadow-md"
                            : "bg-[#F8F7FA] text-[#3F3D46] border-[#E4E0E7]/30 hover:border-[#DDAA42]/40"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Floor</label>
                  <input
                    type="text"
                    value={formData.floor || ""}
                    onChange={(e) => updateField("floor", e.target.value)}
                    placeholder="e.g. 3rd of 12 Floors"
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  />
                </div>
              </div>}

              {/* Possession, Builder, Transaction Type, Listing Type */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {!isStructuredType(formData.propertyType) && <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Possession</label>
                  <select
                    value={formData.possession || ""}
                    onChange={(e) => updateField("possession", e.target.value)}
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  >
                    <option value="">Select</option>
                    {possessionOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>}
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Builder / Developer</label>
                  <input
                    type="text"
                    list={!isPublic ? "builder-options" : undefined}
                    value={formData.builder || ""}
                    onChange={(e) => updateField("builder", e.target.value)}
                    placeholder="e.g. Prestige Group"
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  />
                  {!isPublic && <datalist id="builder-options">{builders.map((builder) => <option key={builder.id} value={builder.name} />)}</datalist>}
                  {validationErrors.builder && <p className="text-[12px] text-red-600 mt-1">{validationErrors.builder}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Transaction Type</label>
                  <div className="flex gap-2">
                    {transactionTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, transactionType: type }))}
                        className={`flex-1 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 border ${
                          formData.transactionType === type
                            ? "bg-[#DDAA42] text-[#0B1328] border-[#DDAA42] shadow-md"
                            : "bg-[#F8F7FA] text-[#3F3D46] border-[#E4E0E7]/30 hover:border-[#DDAA42]/40"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {validationErrors.transactionType && <p className="text-[12px] text-red-600 mt-1">{validationErrors.transactionType}</p>}
                </div>
                {formData.propertyType !== "Apartment" && <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Listing Type</label>
                  <div className="flex gap-2">
                    {["For Sale", "For Rent"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateField("listingType", type)}
                        className={`flex-1 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 border ${
                          formData.listingType === type
                            ? "bg-[#DDAA42] text-[#0B1328] border-[#DDAA42] shadow-md"
                            : "bg-[#F8F7FA] text-[#3F3D46] border-[#E4E0E7]/30 hover:border-[#DDAA42]/40"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {validationErrors.listingType && <p className="text-[12px] text-red-600 mt-1">{validationErrors.listingType}</p>}
                </div>}
              </div>

              {/* Furnishing, Facing, Parking */}
              {!['Plot', 'Commercial'].includes(formData.propertyType || "") && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Furnishing</label>
                  <select
                    value={formData.furnishing || ""}
                    onChange={(e) => updateField("furnishing", e.target.value)}
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  >
                    {furnishingOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                {!isStructuredType(formData.propertyType) && <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Facing <span className="font-normal text-[#68646F]">(optional)</span></label>
                  <select
                    value={formData.facing || ""}
                    onChange={(e) => updateField("facing", e.target.value)}
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  >
                    <option value="">Not specified</option>
                    {facingOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>}
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Parking</label>
                  <select
                    value={formData.parking || ""}
                    onChange={(e) => updateField("parking", e.target.value)}
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  >
                    {parkingOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>}

              {/* Age & Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isStructuredType(formData.propertyType) && <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Age of Property</label>
                  <select
                    value={formData.ageOfProperty || ""}
                    onChange={(e) => updateField("ageOfProperty", e.target.value)}
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  >
                    {ageOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>}
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Badges</label>
                  <div className="flex flex-wrap gap-2">
                    {badgeOptions.map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => toggleBadge(badge)}
                        className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 border ${
                          formData.badges?.includes(badge)
                            ? badge === "RERA"
                              ? "bg-[#DDAA42] text-[#0B1328] border-[#DDAA42]"
                              : badge === "Premium"
                              ? "bg-gradient-to-r from-[#DDAA42] to-[#273559] text-white border-[#DDAA42]"
                              : "bg-[#F2C052] text-[#0B1328] border-[#F2C052]"
                            : "bg-[#F8F7FA] text-[#68646F] border-[#E4E0E7]/30 hover:border-[#DDAA42]/40"
                        }`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Homepage Placement (admin only) */}
              {!isPublic && (
                <div>
                  <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Homepage Placement</label>
                  <select
                    value={formData.websiteSection || "None"}
                    onChange={(e) => updateField("websiteSection", e.target.value)}
                    className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                  >
                    {sectionOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className="text-[12px] text-[#68646F] mt-1.5">Choose which homepage section this property appears in</p>
                </div>
              )}

              {/* RERA */}
              <div className="flex items-center gap-3 p-4 bg-[#F8F7FA] rounded-xl border border-[#E4E0E7]/30">
                <button
                  type="button"
                  disabled={uploadInProgress}
                  onClick={() => setFormData((prev) => ({
                    ...prev,
                    reraRegistered: !prev.reraRegistered,
                    reraNumber: "",
                    reraPhases: prev.reraRegistered ? [] : (prev.reraPhases?.length ? prev.reraPhases.map((phase) => ({ ...phase, reraSiteUrl: phase.reraSiteUrl || KARNATAKA_RERA_URL })) : [{ name: "Phase 1", reraNumber: "", reraSiteUrl: KARNATAKA_RERA_URL, reraDocuments: [], projectDocuments: [] }]),
                  }))}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.reraRegistered
                      ? "bg-[#DDAA42] text-[#0B1328]"
                      : "border-2 border-[#E4E0E7] bg-white"
                  }`}
                >
                  {formData.reraRegistered && <Check className="w-4 h-4" />}
                </button>
                <div>
                  <p className="text-[14px] font-semibold text-[#121B35]">RERA Registered</p>
                  <p className="text-[12px] text-[#68646F]">This property is registered under RERA guidelines</p>
                </div>
              </div>
              {isStructuredType(formData.propertyType) && formData.reraRegistered && (
                <ReraPhasesEditor phases={formData.reraPhases || []} onUploadingChange={setUploadInProgress} onChange={(reraPhases) => setFormData((prev) => ({ ...prev, reraPhases: reraPhases.map((phase) => ({ ...phase, reraSiteUrl: phase.reraSiteUrl || KARNATAKA_RERA_URL })), reraNumber: reraPhases[0]?.reraNumber || "" }))} error={validationErrors.reraPhases || validationErrors.reraNumber} />
              )}

              {/* Description */}
              <div>
                <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Property Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the property in detail — location benefits, features, nearby landmarks..."
                  rows={4}
                  className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all resize-none"
                />
                {formData.propertyType === "Apartment" && <p className={`text-[12px] mt-1 ${validationErrors.description ? "text-red-600" : "text-[#68646F]"}`}>{validationErrors.description || `${(formData.description || "").trim().length}/50 minimum characters`}</p>}
              </div>
              {isStructuredType(formData.propertyType) && (
                <ProjectContentEditor
                  section="narrative"
                  narrative={formData.projectNarrative}
                  masterPlan={formData.masterPlan}
                  downloads={formData.projectDownloads}
                  walkthroughVideoUrl={formData.walkthroughVideoUrl}
                  faqs={formData.faqs}
                  onNarrativeChange={(value) => updateField("projectNarrative", value)}
                  onMasterPlanChange={(value) => updateField("masterPlan", value)}
                  onDownloadsChange={(value) => updateField("projectDownloads", value)}
                  onWalkthroughVideoUrlChange={(value) => updateField("walkthroughVideoUrl", value)}
                  onFaqsChange={(value) => updateField("faqs", value)}
                />
              )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Photos */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-[20px] font-bold text-[#121B35] mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
                Property Photos
              </h2>
              <BulkPropertyMediaImporter
                heroImages={formData.heroImages || []}
                galleryImages={formData.images || []}
                onBusyChange={setUploadInProgress}
                onHeroImagesChange={(heroImages) => updateField("heroImages", heroImages)}
                onGalleryImagesChange={(images) => updateField("images", images)}
              />
              <HeroImageUploader
                images={formData.heroImages || []}
                onChange={(imgs) => updateField("heroImages", imgs)}
                onImagesAdd={(imgs) => setFormData((previous) => ({
                  ...previous,
                  heroImages: mergeUploadedMedia(previous.heroImages, imgs, 3),
                }))}
              />
              <div className="my-8 border-t border-[#E4E0E7]" />
              <MediaUploader
                images={formData.images || []}
                onImagesChange={(imgs) => updateField("images", imgs)}
                onImagesAdd={(imgs) => setFormData((previous) => ({
                  ...previous,
                  images: mergeUploadedMedia(previous.images, imgs),
                }))}
              />
              <div className="mt-8 border-t border-[#F3F1F5] pt-6">
                <div className="mb-4">
                  <h3 className="text-[15px] font-bold text-[#121B35]">Optional Project Presentation</h3>
                  <p className="mt-1 text-[12px] text-[#68646F]">Add project overview photos, a gallery, and a brochure when available.</p>
                </div>
                {isStructuredType(formData.propertyType) && (
                  <ProjectContentEditor
                    section="media"
                    narrative={formData.projectNarrative}
                    masterPlan={formData.masterPlan}
                    downloads={formData.projectDownloads}
                    walkthroughVideoUrl={formData.walkthroughVideoUrl}
                    faqs={formData.faqs}
                    onNarrativeChange={(value) => updateField("projectNarrative", value)}
                    onMasterPlanChange={(value) => updateField("masterPlan", value)}
                    onDownloadsChange={(value) => updateField("projectDownloads", value)}
                    onWalkthroughVideoUrlChange={(value) => updateField("walkthroughVideoUrl", value)}
                    onFaqsChange={(value) => updateField("faqs", value)}
                  />
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <OptionalMediaField
                    label="Developer logo"
                    value={formData.developerLogoUrl}
                    onChange={(value) => updateField("developerLogoUrl", value)}
                    description="Displayed in the Developer Profile section when provided."
                  />
                  <div className="rounded-xl border border-[#E4E0E7] bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <label htmlFor="developer-description" className="text-[12px] font-bold text-[#3F3D46]">About Developer</label>
                        <span className="ml-2 rounded-full bg-[#F3F1F5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#68646F]">Optional</span>
                        <p className="mt-1 text-[10px] leading-4 text-[#68646F]">Shown beside the logo in the public Developer Profile section.</p>
                      </div>
                      <span className="shrink-0 text-[9px] text-[#8A8690]">{(formData.developerDescription || "").length}/5000</span>
                    </div>
                    <textarea
                      id="developer-description"
                      value={formData.developerDescription || ""}
                      onChange={(event) => updateField("developerDescription", event.target.value)}
                      maxLength={5000}
                      rows={6}
                      placeholder="Enter a verified introduction, history, expertise, and notable achievements of the developer."
                      className="mt-3 min-h-28 w-full resize-y rounded-lg border border-[#E4E0E7] bg-[#F8F7FA] px-3 py-2.5 text-[11px] leading-5 text-[#121B35] outline-none focus:border-[#DDAA42] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {formData.propertyType === "Plot" && (
                <div className="mt-8 pt-6 border-t border-[#F3F1F5]">
                  <h3 className="text-[15px] font-bold text-[#121B35] mb-1">Master Plan / Layout Map</h3>
                  <p className="text-[13px] text-[#68646F] mb-4">Required for buyers to verify plot numbers and availability. Upload JPG, PNG, WebP, or PDF (max {PROPERTY_DOCUMENT_MAX_MB} MB).</p>
                  {formData.plotDetails?.layoutMapUrl ? <div className="flex items-center gap-3 p-4 bg-[#F8F7FA] border border-[#E4E0E7]/40 rounded-2xl"><FileText className="w-6 h-6 text-[#DDAA42]" /><span className="flex-1 text-[13px] font-semibold text-[#121B35]">Layout map attached</span><button type="button" onClick={() => updateField("plotDetails", { ...(formData.plotDetails || initialPlotDetails()), layoutMapUrl: "" })} className="text-[12px] font-bold text-red-500">Remove</button></div> : <label className="flex flex-col items-center justify-center gap-2 p-7 border-2 border-dashed border-[#E4E0E7] rounded-2xl cursor-pointer hover:border-[#DDAA42]/60"><FileText className="w-7 h-7 text-[#DDAA42]" /><span className="text-[14px] font-semibold text-[#121B35]">Upload master plan / layout map</span><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const isPdf = file.type === "application/pdf"; const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type); if ((!isPdf && !isImage) || file.size > PROPERTY_DOCUMENT_MAX_BYTES) { setSubmitError(`Layout map must be a JPG, PNG, WebP, or PDF no larger than ${PROPERTY_DOCUMENT_MAX_MB} MB.`); event.target.value = ""; return; } try { const url = await uploadPropertyMedia(file, isPdf ? "layout-map-pdf" : "layout-map-image"); updateField("plotDetails", { ...(formData.plotDetails || initialPlotDetails()), layoutMapUrl: url, layoutMapType: isPdf ? "pdf" : "image" }); setSubmitError(""); } catch (error) { setSubmitError(error instanceof Error ? error.message : "Layout-map upload failed."); } }} /></label>}
                  {validationErrors.layoutMapUrl && <p className="text-[12px] text-red-600 mt-2">{validationErrors.layoutMapUrl}</p>}
                </div>
              )}

            </div>
          )}

          {/* STEP 3: Amenities */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-[#121B35] mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
                    Select Amenities
                  </h2>
                  <p className="text-[14px] text-[#68646F]">Choose all the amenities available in this property</p>
                </div>
                <button
                  type="button"
                  onClick={toggleAllAmenities}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
                    allAmenitiesSelected
                      ? "bg-[#DDAA42] text-[#0B1328] border-[#DDAA42] shadow-md"
                      : "bg-white text-[#121B35] border-[#E4E0E7] hover:border-[#DDAA42]/50"
                  }`}
                >
                  {allAmenitiesSelected ? (
                    <CheckSquare className="w-4.5 h-4.5" />
                  ) : (
                    <Square className="w-4.5 h-4.5" />
                  )}
                  {allAmenitiesSelected ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {visibleAmenities.map(({ name, icon: Icon, color }) => {
                  const isSelected = formData.amenities?.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => toggleAmenity(name)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                        isSelected
                          ? "border-[#DDAA42] bg-[#F3F1F5] shadow-md scale-[1.02]"
                          : "border-[#E4E0E7]/30 bg-[#F8F7FA] hover:border-[#DDAA42]/40 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isSelected ? "bg-white shadow-sm" : "bg-white"
                        }`}
                      >
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                      <span className="text-[12px] font-medium text-[#3F3D46] text-center leading-tight">
                        {name}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-[#DDAA42] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {(formData.amenities?.length || 0) > 0 && (
                <div className="mt-6 space-y-4 border-t border-[#F3F1F5] pt-5">
                  <div><p className="text-[13px] font-bold text-[#121B35]">About selected amenities</p><p className="mt-1 text-[12px] text-[#68646F]">Optional. If left empty, the property page will provide a helpful description automatically.</p></div>
                  {formData.amenities?.map((name) => {
                    const facility = formData.facilities?.find((item) => item.name === name);
                    return (
                      <div key={name} className="rounded-xl border border-[#E4E0E7] bg-[#F8F7FA] p-4">
                        <label className="text-[12px] font-bold text-[#3F3D46]">{name}
                          <textarea rows={3} value={facility?.description || ""} onChange={(event) => updateFacility(name, { description: event.target.value })} placeholder={`Add details about ${name} (optional)`} className="mt-2 w-full resize-y rounded-lg border border-[#E4E0E7] bg-white px-3 py-2.5 text-[12px]" />
                        </label>
                      </div>
                    );
                  })}
                  <p className="text-[12px] font-medium text-[#DDAA42]">✓ {formData.amenities?.length} amenities selected</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Society & Locality */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-[20px] font-bold text-[#121B35] mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
                  Society Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "security", label: "Security", placeholder: "e.g. 24x7 Security" },
                    { key: "waterSupply", label: "Water Supply", placeholder: "e.g. 24 Hours" },
                    { key: "powerBackup", label: "Power Backup", placeholder: "e.g. Full Backup" },
                    { key: "lift", label: "Lift", placeholder: "e.g. 2 Lifts" },
                    { key: "visitorParking", label: "Visitor Parking", placeholder: "e.g. Available" },
                    { key: "maintenanceStaff", label: "Maintenance Staff", placeholder: "e.g. Available" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">{label}</label>
                      <input
                        type="text"
                        value={(formData.society as Record<string, string>)?.[key] || ""}
                        onChange={(e) => updateNestedField("society", key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#F3F1F5] pt-8">
                <h2 className="text-[20px] font-bold text-[#121B35] mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
                  Locality & Nearby
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">City</label>
                    <input
                      type="text"
                      value={formData.locality?.city || ""}
                      onChange={(e) => updateLocationTextField("city", e.target.value)}
                      placeholder="e.g. Bangalore"
                      className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Locality Address</label>
                    <input
                      type="text"
                      value={formData.locality?.address || ""}
                      onChange={(e) => updateLocationTextField("address", e.target.value)}
                      placeholder="Street, area or full address"
                      className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Zone</label>
                    <select
                      value={formData.locality?.zone || ""}
                      onChange={(e) => updateNestedField("locality", "zone", e.target.value)}
                      className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                    >
                      <option value="">Select Zone</option>
                      {["East", "West", "North", "South", "Central"].map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Landmark</label>
                    <input
                      type="text"
                      value={formData.locality?.landmark || ""}
                      onChange={(e) => updateLocationTextField("landmark", e.target.value)}
                      placeholder="e.g. Near Whitefield Metro"
                      className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                    />
                  </div>
                  {isStructuredType(formData.propertyType) && <div>
                    <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">PIN Code</label>
                    <input inputMode="numeric" maxLength={6} value={formData.locality?.pinCode || ""} onChange={(e) => updateLocationTextField("pinCode", e.target.value.replace(/\D/g, ""))} placeholder="e.g. 560066" className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px]" />
                    {validationErrors.pinCode && <p className="text-[12px] text-red-600 mt-1">{validationErrors.pinCode}</p>}
                  </div>}
                  {isStructuredType(formData.propertyType) && <div>
                    <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Property Latitude</label>
                    <input type="number" step="any" min={-90} max={90} value={formData.locality?.latitude ?? ""} onChange={(event) => updateProjectCoordinates(event.target.value === "" ? undefined : Number(event.target.value), formData.locality?.longitude)} placeholder="e.g. 12.9716" className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px]" />
                  </div>}
                  {isStructuredType(formData.propertyType) && <div>
                    <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Property Longitude</label>
                    <input type="number" step="any" min={-180} max={180} value={formData.locality?.longitude ?? ""} onChange={(event) => updateProjectCoordinates(formData.locality?.latitude, event.target.value === "" ? undefined : Number(event.target.value))} placeholder="e.g. 77.5946" className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px]" />
                  </div>}
                </div>

                {!isPublic && isStructuredType(formData.propertyType) && (
                  <section className="mb-7 overflow-hidden rounded-2xl border border-[#D8DDE8] bg-white">
                    <div className="border-b border-[#E7EAF0] bg-[#F7F8FB] p-4 md:flex md:items-start md:justify-between md:gap-5">
                      <div>
                        <h3 className="flex items-center gap-2 text-[15px] font-bold text-[#121B35]"><MapPin className="size-4 text-[#DDAA42]" />Project Geocode Verification</h3>
                        <p className="mt-1 max-w-3xl text-[11px] leading-5 text-[#68646F]">Paste latitude/longitude or a Google Maps URL containing coordinates. Automatic resolution finds the nearest mapped address; an admin must inspect the pin before it becomes verified.</p>
                      </div>
                      <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-bold md:mt-0 ${formData.locationVerification?.status === "admin_verified" ? "bg-emerald-100 text-emerald-800" : formData.locationVerification?.status === "mismatch" ? "bg-red-100 text-red-700" : formData.locationVerification ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                        {formData.locationVerification?.status === "admin_verified" ? "ADMIN VERIFIED" : formData.locationVerification?.status === "mismatch" ? "MISMATCH FOUND" : formData.locationVerification ? "RESOLVED — CONFIRM REQUIRED" : "NOT CHECKED"}
                      </span>
                    </div>
                    <div className="space-y-4 p-4">
                      <div className="flex flex-col gap-2 md:flex-row">
                        <input value={geocodeInput} onChange={(event) => { setGeocodeInput(event.target.value); setFormData((previous) => ({ ...previous, locationVerification: undefined })); setLocationVerificationError(""); }} placeholder="12.971600, 77.594600 or paste a Google Maps URL" className="min-w-0 flex-1 rounded-xl border border-[#D8DDE8] px-4 py-3 text-[13px] focus:border-[#DDAA42] focus:outline-none" />
                        <button type="button" onClick={() => void analyzeLocation()} disabled={analyzingLocation || !geocodeInput.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#121B35] px-5 py-3 text-[12px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                          {analyzingLocation ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}Analyze location
                        </button>
                      </div>
                      {locationVerificationError && <p className={`text-[11px] ${locationVerificationError.startsWith("Resolved details applied") ? "text-amber-700" : "text-red-600"}`}>{locationVerificationError}</p>}

                      {formData.locationVerification && (
                        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                          <div className="space-y-3 rounded-xl border border-[#E4E7ED] bg-[#FAFBFC] p-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wide text-[#85808A]">Resolved address</p>
                              <p className="mt-1 text-[13px] font-semibold leading-5 text-[#273559]">{formData.locationVerification.resolvedAddress}</p>
                              <p className="mt-1 text-[10px] text-[#68646F]">Pin: {formData.locationVerification.inputLatitude}, {formData.locationVerification.inputLongitude} · Match score: {formData.locationVerification.matchScore}%</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px] md:grid-cols-4">
                              <div><span className="block text-[#85808A]">Locality</span><strong className="text-[#273559]">{formData.locationVerification.components?.neighbourhood || formData.locationVerification.components?.suburb || "—"}</strong></div>
                              <div><span className="block text-[#85808A]">City</span><strong className="text-[#273559]">{formData.locationVerification.components?.city || "—"}</strong></div>
                              <div><span className="block text-[#85808A]">District</span><strong className="text-[#273559]">{formData.locationVerification.components?.district || "—"}</strong></div>
                              <div><span className="block text-[#85808A]">PIN code</span><strong className="text-[#273559]">{formData.locationVerification.components?.pinCode || "—"}</strong></div>
                            </div>
                            {(formData.locationVerification.comparisons || []).length > 0 && <div className="space-y-1.5 border-t border-[#E4E7ED] pt-3">{formData.locationVerification.comparisons?.map((comparison) => <div key={comparison.key} className="flex items-start justify-between gap-3 text-[10px]"><span className="text-[#68646F]">{comparison.label}</span><span className={`font-bold ${comparison.passed ? "text-emerald-700" : comparison.strong ? "text-red-600" : "text-amber-700"}`}>{comparison.passed ? "MATCH" : comparison.strong ? "MISMATCH" : "CHECK MANUALLY"}</span></div>)}</div>}
                            {(formData.locationVerification.warnings || []).map((warning) => <p key={warning} className="flex gap-2 text-[10px] leading-4 text-amber-700"><AlertTriangle className="mt-0.5 size-3 shrink-0" />{warning}</p>)}
                            <div className="flex flex-wrap gap-2 pt-1">
                              <button type="button" onClick={applyResolvedLocation} className="rounded-lg border border-[#CCD2DE] bg-white px-3 py-2 text-[10px] font-bold text-[#273559]">Apply resolved address</button>
                              {formData.locationVerification.mapUrl && <a href={formData.locationVerification.mapUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-[#CCD2DE] bg-white px-3 py-2 text-[10px] font-bold text-[#273559]">Open exact pin</a>}
                              {formData.locationVerification.status !== "admin_verified" && <button type="button" onClick={() => void confirmLocation()} disabled={confirmingLocation || formData.locationVerification.status === "mismatch"} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{confirmingLocation ? <Loader2 className="size-3 animate-spin" /> : <Verified className="size-3" />}Confirm exact project location</button>}
                            </div>
                          </div>
                          <div className="overflow-hidden rounded-xl border border-[#E4E7ED] bg-[#F1F3F6]">
                            <iframe title="Project coordinate preview" loading="lazy" className="h-64 w-full border-0" src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.locationVerification.inputLongitude - 0.005}%2C${formData.locationVerification.inputLatitude - 0.003}%2C${formData.locationVerification.inputLongitude + 0.005}%2C${formData.locationVerification.inputLatitude + 0.003}&layer=mapnik&marker=${formData.locationVerification.inputLatitude}%2C${formData.locationVerification.inputLongitude}`} />
                            <p className="px-3 py-2 text-[9px] text-[#68646F]">Map data © OpenStreetMap contributors. Confirm the project entrance or parcel using official project/RERA records.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <h3 className="text-[15px] font-semibold text-[#3F3D46] mb-3">Nearby Amenities</h3>
                {isStructuredType(formData.propertyType) ? <div className="grid grid-cols-1 gap-4">
                  {nearbyCategories.map((key) => (
                    <div key={key} className="rounded-xl border border-[#E4E0E7] bg-[#F8F7FA]/40 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <label className="block text-[13px] font-semibold text-[#3F3D46] capitalize">{key === "metro" ? "Metro / Train" : key === "workplaces" ? "IT Parks / Workplaces" : key === "roads" ? "Roads / Connectivity" : key}</label>
                        <button type="button" onClick={() => addNearbyPlace(key)} className="rounded-lg border border-[#DDAA42] bg-white px-3 py-1.5 text-[11px] font-bold text-[#121B35]">+ Add {key === "metro" ? "station" : key === "workplaces" ? "workplace" : key === "roads" ? "road" : key.slice(0, -1)}</button>
                      </div>
                      {(formData.nearbyDetails?.[key]?.places || []).length === 0 && <p className="text-[11px] text-[#68646F]">Optional — add as many nearby places as needed.</p>}
                      <div className="space-y-3">
                        {(formData.nearbyDetails?.[key]?.places || []).map((place, index) => (
                          <div key={`${key}-${index}`} className="grid gap-2 rounded-xl border border-[#E4E0E7] bg-white p-3 md:grid-cols-2 lg:grid-cols-[1fr_1.4fr_0.8fr_1fr_auto]">
                            <div><input value={place.name} onChange={(e) => updateNearbyPlace(key, index, { name: e.target.value, latitude: undefined, longitude: undefined, mapUrl: "", osmId: "", resolvedAddress: "", approximateDistanceMeters: undefined })} onBlur={() => void resolveNearbyMapPlace(key, index)} placeholder="Name *" className="w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 text-[13px]" />{validationErrors[`nearby.${key}.places.${index}.name`] && <p className="mt-1 text-[10px] text-red-600">{validationErrors[`nearby.${key}.places.${index}.name`]}</p>}{resolvingNearby === `${key}-${index}` && <p className="mt-1 text-[10px] text-[#68646F]">Finding map marker…</p>}{place.latitude !== undefined && place.longitude !== undefined && <p className="mt-1 text-[10px] text-emerald-700">Map marker resolved</p>}{nearbyResolveErrors[`${key}-${index}`] && <p className="mt-1 text-[10px] text-red-600">{nearbyResolveErrors[`${key}-${index}`]}</p>}</div>
                            <input value={place.address || ""} onChange={(e) => updateNearbyPlace(key, index, { address: e.target.value, latitude: undefined, longitude: undefined, mapUrl: "", osmId: "", resolvedAddress: "", approximateDistanceMeters: undefined })} onBlur={() => void resolveNearbyMapPlace(key, index)} placeholder="Address (optional)" className="w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 text-[13px]" />
                            <input value={place.distance || ""} onChange={(e) => updateNearbyPlace(key, index, { distance: e.target.value })} placeholder="Distance (optional)" className="w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 text-[13px]" />
                            <input value={place.landmark || ""} onChange={(e) => updateNearbyPlace(key, index, { landmark: e.target.value })} placeholder="Landmark (optional)" className="w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 text-[13px]" />
                            <button type="button" onClick={() => removeNearbyPlace(key, index)} className="rounded-lg px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50">Remove</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "schools", label: "Schools", placeholder: "e.g. 3 within 2 km" },
                    { key: "colleges", label: "Colleges", placeholder: "e.g. 2 within 4 km" },
                    { key: "hospitals", label: "Hospitals", placeholder: "e.g. 2 within 3 km" },
                    { key: "shopping", label: "Shopping", placeholder: "e.g. 5 within 1 km" },
                    { key: "metro", label: "Metro / Train", placeholder: "e.g. 1.5 km away" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">{label}</label>
                      <input
                        type="text"
                        value={(formData.nearbyAmenities as Record<string, string>)?.[key] || ""}
                        onChange={(e) => updateNestedField("nearbyAmenities", key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/10 transition-all"
                      />
                    </div>
                  ))}
                </div>}
              </div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#DDAA42] to-[#273559] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}>
                    Review Your Property
                  </h2>
                  <p className="text-[13px] text-[#68646F]">Verify all details before publishing</p>
                </div>
              </div>

              {isAdminEdit && formData.reviewReadiness && (
                <div className={`mb-6 rounded-2xl border p-4 ${formData.reviewReadiness.canPublish ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><p className={`flex items-center gap-2 text-[13px] font-bold ${formData.reviewReadiness.canPublish ? "text-emerald-800" : "text-red-800"}`}>{formData.reviewReadiness.canPublish ? <Check className="size-4" /> : <AlertTriangle className="size-4" />}Saved review readiness</p><p className="mt-1 text-[11px] text-[#68646F]">Based on the last saved version. Saving changes recalculates this report.</p></div>
                    <span className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${formData.reviewReadiness.canPublish ? "bg-emerald-700 text-white" : "bg-red-700 text-white"}`}>{formData.reviewReadiness.score}%</span>
                  </div>
                  {formData.reviewReadiness.blockers.length > 0 && <p className="mt-3 text-[11px] font-semibold text-red-800">Required: {formData.reviewReadiness.blockers.join(", ")}</p>}
                  {formData.reviewReadiness.warnings.length > 0 && <p className="mt-1 text-[11px] text-amber-800">Recommended: {formData.reviewReadiness.warnings.join(", ")}</p>}
                  <p className="mt-2 text-[10px] text-[#68646F]">{formData.reviewReadiness.configurationCount} configurations · {formData.reviewReadiness.phaseCount} RERA phases · {formData.reviewReadiness.documentCount} documents · {formData.reviewReadiness.photoCount} photos</p>
                </div>
              )}

              {isAdminEdit && (formData.workflowHistory?.length || 0) > 0 && (
                <div className="mb-6 rounded-2xl border border-[#E4E0E7] bg-white p-4">
                  <p className="text-[13px] font-bold text-[#121B35]">Workflow history</p>
                  <div className="mt-2 space-y-2">{formData.workflowHistory!.slice(-5).reverse().map((entry, index) => <div key={`${entry.at || index}-${entry.action}`} className="flex flex-wrap items-center gap-2 text-[10px]"><span className="rounded-md bg-[#F3F1F5] px-2 py-1 font-bold text-[#3F3D46]">{entry.fromStatus} → {entry.toStatus}</span><span className="font-semibold text-[#68646F]">{entry.action.replace(/_/g, " ")}</span>{entry.at && <span className="ml-auto text-[#8A8690]">{new Date(entry.at).toLocaleString("en-IN")}</span>}</div>)}</div>
                </div>
              )}

              {isStructuredType(formData.propertyType) && (
                <div className="mt-6">
                  <ProjectContentEditor
                    section="faqs"
                    narrative={formData.projectNarrative}
                    masterPlan={formData.masterPlan}
                    downloads={formData.projectDownloads}
                    walkthroughVideoUrl={formData.walkthroughVideoUrl}
                    faqs={formData.faqs}
                    onNarrativeChange={(value) => updateField("projectNarrative", value)}
                    onMasterPlanChange={(value) => updateField("masterPlan", value)}
                    onDownloadsChange={(value) => updateField("projectDownloads", value)}
                    onWalkthroughVideoUrlChange={(value) => updateField("walkthroughVideoUrl", value)}
                    onFaqsChange={(value) => updateField("faqs", value)}
                  />
                </div>
              )}

              {/* Preview Card */}
              <div className="bg-[#F8F7FA] rounded-2xl p-6 border border-[#E4E0E7]/30 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    {formData.title && <h3 className="text-[20px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}>
                      {formData.title}
                    </h3>}
                    {formData.subtitle && <p className="text-[14px] text-[#68646F] flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-[#DDAA42]" />
                      {formData.subtitle}
                    </p>}
                  </div>
                  {(previewData as Property).price && <div className="text-right">
                    <p className="text-[22px] font-bold text-[#DDAA42]">{(previewData as Property).price}</p>
                    {formData.pricePerSqft && (
                      <p className="text-[13px] text-[#68646F]">{formData.pricePerSqft}</p>
                    )}
                  </div>}
                </div>

                {/* Key Details */}
                {(previewData as Property).bedrooms !== undefined || (previewData as Property).bathrooms !== undefined || Boolean((previewData as Property).area) || Boolean((previewData as Property).possession) ? <div className="grid grid-cols-4 gap-3">
                  {(previewData as Property).bedrooms !== undefined && <div className="bg-white rounded-xl p-3 text-center">
                    <Bed className="w-5 h-5 text-[#DDAA42] mx-auto mb-1" />
                    <p className="text-[16px] font-semibold text-[#121B35]">{(previewData as Property).bedrooms}</p>
                    <p className="text-[11px] text-[#68646F]">Bedrooms</p>
                  </div>}
                  {(previewData as Property).bathrooms !== undefined && <div className="bg-white rounded-xl p-3 text-center">
                    <Bath className="w-5 h-5 text-[#DDAA42] mx-auto mb-1" />
                    <p className="text-[16px] font-semibold text-[#121B35]">{(previewData as Property).bathrooms}</p>
                    <p className="text-[11px] text-[#68646F]">Bathrooms</p>
                  </div>}
                  {Boolean((previewData as Property).area) && <div className="bg-white rounded-xl p-3 text-center">
                    <Maximize className="w-5 h-5 text-[#F2C052] mx-auto mb-1" />
                    <p className="text-[16px] font-semibold text-[#121B35]">{(previewData as Property).area}</p>
                    <p className="text-[11px] text-[#68646F]">Sq.ft</p>
                  </div>}
                  {Boolean((previewData as Property).possession) && <div className="bg-white rounded-xl p-3 text-center">
                    <Home className="w-5 h-5 text-[#B98428] mx-auto mb-1" />
                    <p className="text-[13px] font-semibold text-[#121B35]">{formatPossession(previewData as Property)}</p>
                    <p className="text-[11px] text-[#68646F]">Possession</p>
                  </div>}
                </div> : null}

                {formData.propertyType === "Apartment" && (formData.configurationDetails?.length || 0) > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-[#E4E0E7] bg-white">
                    <table className="w-full min-w-[850px] text-left text-[12px]">
                      <thead className="bg-[#121B35] text-white"><tr>{["Config", "Price", "Built-up area", "Carpet area", "Bedrooms", "Bathrooms", "Balconies", "Facing (optional)"].map((label) => <th key={label} className="px-3 py-2.5">{label}</th>)}</tr></thead>
                      <tbody>{formData.configurationDetails!.map((row) => <tr key={row.configuration} className="border-t border-[#F3F1F5]"><td className="px-3 py-2 font-bold">{row.configuration}</td><td className="px-3 py-2">{row.price}</td><td className="px-3 py-2">{row.builtUpArea}</td><td className="px-3 py-2">{row.carpetArea}</td><td className="px-3 py-2">{row.bedrooms}</td><td className="px-3 py-2">{row.bathrooms}</td><td className="px-3 py-2">{row.balconies}</td><td className="px-3 py-2">{row.facings.join(", ") || "Not specified"}</td></tr>)}</tbody>
                    </table>
                  </div>
                )}

                {formData.propertyType === "Villa" && (formData.villaDetails?.configurationDetails.length || 0) > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-[#E4E0E7] bg-white">
                    <table className="w-full min-w-[760px] text-left text-[12px]">
                      <thead className="bg-[#121B35] text-white"><tr>{["Config", "Price", "Plot area", "Built-up area", "Super area", "Bedrooms", "Bathrooms"].map((label) => <th key={label} className="px-3 py-2.5">{label}</th>)}</tr></thead>
                      <tbody>{formData.villaDetails!.configurationDetails.map((row) => <tr key={row.configuration} className="border-t border-[#F3F1F5]"><td className="px-3 py-2 font-bold">{row.configuration}</td><td className="px-3 py-2">{row.price}</td><td className="px-3 py-2">{row.plotArea}</td><td className="px-3 py-2">{row.builtUpArea}</td><td className="px-3 py-2">{row.superArea}</td><td className="px-3 py-2">{row.bedrooms}</td><td className="px-3 py-2">{row.bathrooms}</td></tr>)}</tbody>
                    </table>
                  </div>
                )}

                {formData.propertyType === "Villa" && formData.villaDetails && (
                  <div>
                    <p className="text-[13px] font-semibold text-[#3F3D46] mb-2">Villa & Plot Details</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
                      {[
                        ["Villa Type", formData.villaDetails.villaType],
                        ["Plot Dimensions", formData.villaDetails.plotDimensions],
                        ["Floors", formData.villaDetails.numberOfFloors],
                        ["Plot Facing", formData.villaDetails.plotFacing],
                        ["Corner Plot", formData.villaDetails.cornerPlot ? "Yes" : "No"],
                        ["Road Width", formData.villaDetails.roadWidthFacing],
                        ["Private Garden", formData.villaDetails.privateGarden ? `Yes${formData.villaDetails.privateGardenArea ? ` · ${formData.villaDetails.privateGardenArea}` : ""}` : "No"],
                        ["Private Pool", formData.villaDetails.privatePool ? "Yes" : "No"],
                        ["Terrace", formData.villaDetails.terrace ? `Yes${formData.villaDetails.terraceDetails ? ` · ${formData.villaDetails.terraceDetails}` : ""}` : "No"],
                        ["Gated Community", formData.villaDetails.gatedCommunity ? "Yes" : "No"],
                        ["Transaction", formData.transactionType],
                        ["Listing", formData.listingType],
                      ].filter(([, value]) => value).map(([label, value]) => <div key={String(label)} className="bg-white rounded-lg p-2.5"><span className="text-[#68646F] text-[10px]">{label}</span><p className="font-medium text-[#121B35]">{value}</p></div>)}
                    </div>
                  </div>
                )}

                {formData.propertyType === "Villa" && (
                  <div>
                    <p className="text-[13px] font-semibold text-[#3F3D46] mb-2">Society, Locality & Media</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
                      {[
                        ["Security", formData.society?.security],
                        ["Water Supply", formData.society?.waterSupply],
                        ["Power Backup", formData.society?.powerBackup],
                        ["Lift", formData.society?.lift],
                        ["Visitor Parking", formData.society?.visitorParking],
                        ["Maintenance Staff", formData.society?.maintenanceStaff],
                        ["City", formData.locality?.city],
                        ["Zone", formData.locality?.zone],
                        ["PIN Code", formData.locality?.pinCode],
                        ["Landmark", formData.locality?.landmark],
                        ["Brochure", formData.brochure ? formData.brochureName || "Added" : "Not added"],
                      ].filter(([, value]) => value).map(([label, value]) => <div key={String(label)} className="bg-white rounded-lg p-2.5"><span className="text-[#68646F] text-[10px]">{label}</span><p className="font-medium text-[#121B35] break-words">{value}</p></div>)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px] mt-3">
                      {nearbyCategories.map((key) => {
                        const item = formData.nearbyDetails?.[key];
                        if (!item || (!item.places?.length && item.count === undefined && !item.distance)) return null;
                        return <div key={key} className="bg-white rounded-lg p-2.5"><span className="text-[#68646F] text-[10px] capitalize">{key === "metro" ? "Metro / Train" : key === "workplaces" ? "IT Parks / Workplaces" : key === "roads" ? "Roads / Connectivity" : key}</span><p className="font-medium text-[#121B35]">{item.places?.length ? item.places.map((place) => place.name).join(", ") : `${item.count ?? "—"} · ${item.distance || "—"}`}</p></div>;
                      })}
                    </div>
                  </div>
                )}

                {/* Main display photos preview */}
                {(formData.heroImages?.length || 0) > 0 && (
                  <div>
                    <p className="mb-2 text-[13px] font-semibold text-[#3F3D46]">
                      🖼️ {formData.heroImages!.length}/3 Project Overview photos
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {formData.heroImages!.map((img, i) => (
                        <div key={`${img}-${i}`} className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-[#0B1328]">
                          <img src={img} alt={`Project Overview slide ${i + 1}`} className="h-full w-full object-contain" />
                          <span className="absolute bottom-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-bold text-white">{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery photos preview */}
                {(formData.images?.length || 0) > 0 && (
                  <div>
                    <p className="text-[13px] font-semibold text-[#3F3D46] mb-2">
                      📷 {formData.images!.length} Gallery photos uploaded
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {formData.images!.slice(0, 5).map((img, i) => (
                        <img key={i} src={img} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
                      ))}
                      {formData.images!.length > 5 && (
                        <div className="w-20 h-14 rounded-lg bg-[#F3F1F5] flex items-center justify-center text-[13px] font-medium text-[#68646F] flex-shrink-0">
                          +{formData.images!.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Configs & Badges */}
                <div className="flex flex-wrap gap-2">
                  {formData.configs.map((c) => (
                    <span key={c} className="bg-[#F3F1F5] text-[#DDAA42] text-[12px] font-medium px-3 py-1 rounded-lg">
                      {c}
                    </span>
                  ))}
                  {formData.badges?.map((b) => (
                    <span key={b} className="bg-gradient-to-r from-[#DDAA42] to-[#273559] text-white text-[12px] font-semibold px-3 py-1 rounded-lg">
                      {b}
                    </span>
                  ))}
                </div>

                {/* Amenities */}
                {(formData.amenities?.length || 0) > 0 && (
                  <div>
                    <p className="text-[13px] font-semibold text-[#3F3D46] mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities!.map((a) => (
                        <span key={a} className="text-[12px] text-[#3F3D46] bg-white px-3 py-1.5 rounded-lg border border-[#E4E0E7]/30">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
                  {formData.propertyType && (
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-[#68646F] text-[11px]">Type</span>
                      <p className="font-medium text-[#121B35]">{formData.propertyType}</p>
                    </div>
                  )}
                  {formData.furnishing && (
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-[#68646F] text-[11px]">Furnishing</span>
                      <p className="font-medium text-[#121B35]">{formData.furnishing}</p>
                    </div>
                  )}
                  {formData.facing && (
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-[#68646F] text-[11px]">Facing</span>
                      <p className="font-medium text-[#121B35]">{formData.facing}</p>
                    </div>
                  )}
                  {formData.parking && (
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-[#68646F] text-[11px]">Parking</span>
                      <p className="font-medium text-[#121B35]">{formData.parking}</p>
                    </div>
                  )}
                  {formData.builder && (
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-[#68646F] text-[11px]">Builder</span>
                      <p className="font-medium text-[#121B35]">{formData.builder}</p>
                    </div>
                  )}
                  {formData.reraRegistered && (
                    <div className="bg-white rounded-lg p-2.5 flex items-center gap-1">
                      <Verified className="w-4 h-4 text-[#DDAA42]" />
                      <p className="font-medium text-[#121B35]">RERA {formData.reraPhases?.length ? `${formData.reraPhases.length} phase${formData.reraPhases.length === 1 ? "" : "s"}` : "Registered"}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {formData.description && (
                  <div>
                    <p className="text-[13px] font-semibold text-[#3F3D46] mb-1">Description</p>
                    <p className="text-[13px] text-[#3F3D46] leading-relaxed">{formData.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        {!isPublic && currentStep === 5 && unverifiedCoordinateKey && coordinatePublishAcknowledgement === unverifiedCoordinateKey && (
          <div role="status" className="mx-6 mb-2 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900 lg:mx-8">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p><strong>Coordinate verification warning:</strong> The project can still be published. Its public page will be visible, but the map pin will not be marked as Verified Pin. Click <strong>Publish anyway</strong> to continue.</p>
          </div>
        )}
        {submitError && <div role="alert" className="mx-6 lg:mx-8 mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{submitError}</div>}
        <div className="px-6 lg:px-8 py-4 bg-[#F8F7FA]/50 border-t border-[#F3F1F5] flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ${
              currentStep === 1
                ? "text-[#E4E0E7] cursor-not-allowed"
                : "text-[#3F3D46] hover:bg-white border border-[#E4E0E7]/30"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-3">
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && !formData.propertyType}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 bg-gradient-to-r from-[#DDAA42] to-[#273559] text-white shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                {isPublic && !submissionId && <button onClick={handleSaveDraft} disabled={isSubmitting} className="px-5 py-3 rounded-xl border border-[#E4E0E7] bg-white text-[#121B35] text-[14px] font-bold disabled:opacity-60">Save Draft</button>}
                {!isPublic && <button onClick={() => void handleSubmit("pending")} disabled={isSubmitting} className="flex items-center gap-2 rounded-xl border border-[#D8DEE8] bg-white px-5 py-3 text-[14px] font-bold text-[#172039] transition-all duration-200 hover:bg-[#F8FAFC] disabled:opacity-60">{isSubmitting && submitAction === "pending" ? <><Loader2 className="h-5 w-5 animate-spin" />Saving Pending...</> : "Move to Pending"}</button>}
                <button
                  onClick={() => void handleSubmit("publish")}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#F2C052] to-[#FBBF24] text-white rounded-xl text-[14px] font-bold shadow-lg hover:shadow-xl hover:from-[#B98428] hover:to-[#F2C052] transition-all duration-200 disabled:opacity-60"
                >
                  {isSubmitting && submitAction === "publish" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />{isPublic ? "Submitting..." : "Publishing..."}</>
                  ) : (
                    <><Sparkles className="w-5 h-5" />{isPublic ? (isResubmission ? "Resubmit Property" : "Submit for Review") : unverifiedCoordinateKey && coordinatePublishAcknowledgement === unverifiedCoordinateKey ? "Publish anyway" : "Publish Property"}</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
