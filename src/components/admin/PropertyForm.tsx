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
} from "lucide-react";
import MediaUploader from "./MediaUploader";
import ApartmentDetailsFields from "./ApartmentDetailsFields";
import VillaDetailsFields from "./VillaDetailsFields";
import PlotDetailsFields from "./PlotDetailsFields";
import CommercialDetailsFields from "./CommercialDetailsFields";
import PgDetailsFields from "./PgDetailsFields";
import { addProperty } from "@/lib/propertyStore";
import { createPublicProperty, fetchBuilders, fetchDealers, uploadPropertyMedia } from "@/lib/api";
import type { ConfigurationDetail, Property, VillaConfigurationDetail } from "@/components/acres/mock-data";
import {
  createConfigurationDetail,
  normalizeBhkLabel,
  preparePropertyPayload,
  formatPossession,
  validateApartmentDraft,
  type ApartmentErrors,
} from "@/lib/propertyDetails";
import {
  createVillaConfigurationDetail,
  initialVillaDetails,
  prepareVillaPropertyPayload,
  validateVillaDraft,
} from "@/lib/villaDetails";
import {
  createPlotSizeDetail,
  initialPlotDetails,
  normalizePlotSize,
  preparePlotPropertyPayload,
  validatePlotDraft,
} from "@/lib/plotDetails";
import { initialCommercialDetails, prepareCommercialPropertyPayload, validateCommercialDraft } from "@/lib/commercialDetails";
import { initialPgDetails, preparePgPropertyPayload, validatePgDraft } from "@/lib/pgDetails";

const steps = [
  { id: 1, label: "Basic Details", icon: Building2 },
  { id: 2, label: "Photos & Videos", icon: ImagePlus },
  { id: 3, label: "Amenities", icon: Shield },
  { id: 4, label: "Society & Locality", icon: MapPin },
  { id: 5, label: "Review & Submit", icon: Eye },
];
// Future extension point: add a Verification Documents step only after the
// product owner supplies the required document categories and approval rules.

const propertyTypes = ["Apartment", "Villa", "Penthouse", "Plot", "Commercial", "Independent House", "PG/Co-living"];
const transactionTypes = ["New Property", "Resale"];
const possessionOptions = ["Ready to Move", "Within 3 Months", "Within 6 Months", "Within 1 Year", "Dec 2026", "Mar 2027", "Jun 2027"];
const furnishingOptions = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
const facingOptions = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"];
const parkingOptions = ["None", "1 Covered", "2 Covered", "1 Covered (Private Garage)", "2 Covered (Private Garage)", "1 Open", "2 Open", "1 Covered + 1 Open"];
const ageOptions = ["Under Construction", "0-1 Years", "1-5 Years", "5-10 Years", "10+ Years"];
const badgeOptions = ["RERA", "Premium", "New Launch", "Verified", "Hot Deal", "Price Drop"];
// Values must match the backend Property.websiteSection enum
const sectionOptions = [
  { value: "None", label: "None" },
  { value: "Featured", label: "Featured Projects in Bangalore East" },
  { value: "Handpicked", label: "Handpicked Projects" },
  { value: "Recommended Insights", label: "Recommended Insights" },
  { value: "Search Trends", label: "Based on search trends" },
  { value: "Offers", label: "Offers for you" },
  { value: "Newly Launched", label: "Newly Launched" },
];

const allAmenities = [
  { name: "Power Backup", icon: Zap, color: "#D4AF37" },
  { name: "Rain Water Harvesting", icon: CloudRain, color: "#C9A24E" },
  { name: "Club House", icon: Building2, color: "#E8C66A" },
  { name: "Swimming Pool", icon: Waves, color: "#C9A24E" },
  { name: "Security", icon: Shield, color: "#D4AF37" },
  { name: "Lift", icon: Layers, color: "#C9A24E" },
  { name: "Reserved Parking", icon: Car, color: "#E8C66A" },
  { name: "Gymnasium", icon: Dumbbell, color: "#D4AF37" },
  { name: "Park", icon: TreePine, color: "#C9A24E" },
  { name: "Water Storage", icon: Droplets, color: "#C9A24E" },
];

const villaOnlyAmenities = [
  { name: "Gated Security", icon: Shield, color: "#D4AF37" },
  { name: "Landscaped Gardens", icon: TreePine, color: "#C9A24E" },
  { name: "Jogging Track", icon: Zap, color: "#E8C66A" },
  { name: "Children's Play Area", icon: Home, color: "#D4AF37" },
  { name: "EV Charging", icon: Zap, color: "#C9A24E" },
  { name: "Community Hall", icon: Building2, color: "#E8C66A" },
];

const plotOnlyAmenities = [
  { name: "Entrance Arch", icon: Home, color: "#D4AF37" },
  { name: "Jogging Track", icon: Zap, color: "#E8C66A" },
  { name: "Underground Drainage", icon: Droplets, color: "#C9A24E" },
  { name: "Street Lighting", icon: Sparkles, color: "#D4AF37" },
  { name: "Avenue Plantation", icon: TreePine, color: "#C9A24E" },
  { name: "Cauvery/Borewell Water Supply", icon: Droplets, color: "#E8C66A" },
  { name: "Security Cabin", icon: Shield, color: "#D4AF37" },
];
const commercialOnlyAmenities = [
  { name: "24x7 Security", icon: Shield, color: "#D4AF37" }, { name: "Passenger Lift", icon: Layers, color: "#C9A24E" },
  { name: "Service Lift", icon: Layers, color: "#E8C66A" }, { name: "Cafeteria", icon: Building2, color: "#D4AF37" },
  { name: "Conference Rooms", icon: Building2, color: "#C9A24E" }, { name: "DG Backup", icon: Zap, color: "#E8C66A" },
  { name: "ATM", icon: Building2, color: "#D4AF37" }, { name: "Food Court", icon: Building2, color: "#C9A24E" },
];

const isStructuredType = (propertyType?: string) => propertyType === "Apartment" || propertyType === "Villa" || propertyType === "Plot" || propertyType === "Commercial" || propertyType === "PG/Co-living";

type FormData = Omit<Property, "id">;

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
  area: "",
  possession: "",
  possessionDetails: { status: "Ready to Move", launchDate: "" },
  builder: "",
  image: "",
  badges: [],
  description: "",
  propertyType: "Apartment",
  bedrooms: 2,
  bathrooms: 2,
  parking: "1 Covered",
  furnishing: "Semi-Furnished",
  facing: "East",
  floor: "",
  floorLabel: "",
  transactionType: "New Property",
  listingType: "For Sale",
  ageOfProperty: "Under Construction",
  images: [],
  videos: [],
  virtualTourUrl: "",
  amenities: [],
  ownershipType: "Freehold",
  overlooking: [],
  bookingAmount: "",
  maintenanceCharges: "",
  maintenancePeriod: "month",
  society: {
    security: "24x7 Security",
    waterSupply: "24 Hours",
    powerBackup: "Full Backup",
    lift: "2 Lifts",
    visitorParking: "Available",
    maintenanceStaff: "Available",
  },
  locality: {
    city: "Bangalore",
    zone: "East",
    landmark: "",
  },
  nearbyAmenities: {
    schools: "",
    hospitals: "",
    shopping: "",
    metro: "",
  },
  nearbyDetails: {
    schools: { count: undefined, distance: "" },
    hospitals: { count: undefined, distance: "" },
    shopping: { count: undefined, distance: "" },
    metro: { count: undefined, distance: "" },
  },
  reraRegistered: false,
  reraNumber: "",
  verified: false,
  websiteSection: "None",
};

interface PropertyFormProps {
  /** "admin" → publishes live; "public" → submits for admin approval (pending). */
  mode?: "admin" | "public";
}

export default function PropertyForm({ mode = "admin" }: PropertyFormProps) {
  const navigate = useNavigate();
  const isPublic = mode === "public";
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [configInput, setConfigInput] = useState("");
  const [builders, setBuilders] = useState<{ id: string; name: string }[]>([]);
  const [dealers, setDealers] = useState<{ id: string; name: string }[]>([]);
  const [validationErrors, setValidationErrors] = useState<ApartmentErrors>({});
  const [configError, setConfigError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (isPublic) return;
    fetchBuilders({ limit: 200 })
      .then((data) => setBuilders(data.builders))
      .catch(() => {});
    fetchDealers({ limit: 200 })
      .then((data) => setDealers(data.dealers))
      .catch(() => {});
  }, [isPublic]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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

  const updateNearbyDetail = (
    category: "schools" | "hospitals" | "shopping" | "metro",
    key: "count" | "distance",
    value: number | string | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      nearbyDetails: {
        ...(prev.nearbyDetails || {}),
        [category]: { ...(prev.nearbyDetails?.[category] || {}), [key]: value },
      },
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...(prev.amenities || []), amenity],
    }));
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
    const config = formData.propertyType === "Plot" ? plotSize?.plotSize || "" : isStructuredType(formData.propertyType) ? normalizeBhkLabel(raw) : raw;
    if (!config) {
      setConfigError(formData.propertyType === "Plot" ? "Use positive width × length values, for example 30 × 40." : "Use a positive whole-number BHK label, for example 2 BHK.");
      return;
    }
    if (formData.configs.some((item) => item.toLowerCase() === config.toLowerCase())) {
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

  const removeConfig = (config: string) => {
    const apartmentRow = formData.configurationDetails?.find((item) => item.configuration === config);
    const villaRow = formData.villaDetails?.configurationDetails.find((item) => item.configuration === config);
    const plotRow = formData.plotDetails?.plotSizeDetails.find((item) => item.plotSize === config);
    const populated = apartmentRow
      ? Boolean(apartmentRow.price || apartmentRow.superBuiltUpArea || apartmentRow.carpetArea || apartmentRow.facings.length)
      : villaRow
        ? Boolean(villaRow.price || villaRow.plotArea || villaRow.builtUpArea || villaRow.superArea)
        : Boolean(plotRow?.pricePerSqft || plotRow?.facings.length);
    if (populated && !window.confirm(`Remove ${config} and all details entered for it?`)) return;
    setFormData((prev) => ({
      ...prev,
      configs: prev.configs.filter((c) => c !== config),
      configurationDetails: prev.configurationDetails?.filter((item) => item.configuration !== config),
      villaDetails: prev.villaDetails
        ? { ...prev.villaDetails, configurationDetails: prev.villaDetails.configurationDetails.filter((item) => item.configuration !== config) }
        : undefined,
      plotDetails: prev.plotDetails
        ? { ...prev.plotDetails, plotSizeDetails: prev.plotDetails.plotSizeDetails.filter((item) => item.plotSize !== config), inventory: prev.plotDetails.inventory.filter((item) => item.plotSize !== config) }
        : undefined,
    }));
  };

  const updateConfigurationDetail = (configuration: string, updates: Partial<ConfigurationDetail>) => {
    setFormData((prev) => ({
      ...prev,
      configurationDetails: prev.configurationDetails?.map((row) =>
        row.configuration === configuration ? { ...row, ...updates } : row
      ),
    }));
  };

  const updateVillaConfigurationDetail = (configuration: string, updates: Partial<VillaConfigurationDetail>) => {
    setFormData((prev) => ({
      ...prev,
      villaDetails: prev.villaDetails
        ? { ...prev.villaDetails, configurationDetails: prev.villaDetails.configurationDetails.map((row) => row.configuration === configuration ? { ...row, ...updates } : row) }
        : undefined,
    }));
  };

  const changePropertyType = (propertyType: string) => {
    if (propertyType === formData.propertyType) return;
    const apartmentPopulated = Boolean(formData.configurationDetails?.some((row) => row.price || row.superBuiltUpArea || row.carpetArea));
    const villaPopulated = Boolean(formData.villaDetails?.configurationDetails.some((row) => row.price || row.plotArea || row.builtUpArea || row.superArea));
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
            possessionDetails: { status: "Ready to Move", launchDate: "" },
          }
        : propertyType === "Villa"
          ? {
              configs: [],
              configurationDetails: undefined,
              villaDetails: initialVillaDetails(),
              plotDetails: undefined,
              commercialDetails: undefined,
              pgDetails: undefined,
              possessionDetails: { status: "Ready to Move", launchDate: "" },
            }
          : propertyType === "Plot"
            ? {
                configs: [],
                configurationDetails: undefined,
                villaDetails: undefined,
                plotDetails: initialPlotDetails(),
                commercialDetails: undefined,
                pgDetails: undefined,
                possessionDetails: undefined,
              }
          : propertyType === "Commercial"
            ? {
                configs: [], configurationDetails: undefined, villaDetails: undefined, plotDetails: undefined,
                commercialDetails: initialCommercialDetails(), possessionDetails: { status: "Ready to Move", launchDate: "" },
              }
          : propertyType === "PG/Co-living" ? { configs: [], configurationDetails: undefined, villaDetails: undefined, plotDetails: undefined, commercialDetails: undefined, pgDetails: initialPgDetails(), possessionDetails: undefined, reraRegistered: false, reraNumber: "" }
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
        ownershipType: undefined,
        overlooking: undefined,
        bookingAmount: undefined,
        maintenanceCharges: undefined,
        maintenancePeriod: undefined,
        reraNumber: undefined,
        virtualTourUrl: undefined,
        nearbyDetails: undefined,
      } : {}),
      ...(propertyType !== "Apartment" ? { ownershipType: undefined, overlooking: undefined, bookingAmount: undefined, maintenanceCharges: undefined, maintenancePeriod: undefined } : {}),
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
    if (!isStepValid(currentStep)) {
      if (formData.propertyType === "Apartment") setValidationErrors(validateApartmentDraft(formData));
      else if (formData.propertyType === "Villa") setValidationErrors(validateVillaDraft(formData));
      else if (formData.propertyType === "Plot") setValidationErrors(validatePlotDraft(formData));
      else if (formData.propertyType === "Commercial") setValidationErrors(validateCommercialDraft(formData));
      else if (formData.propertyType === "PG/Co-living") setValidationErrors(validatePgDraft(formData));
      else setValidationErrors({ basic: "Complete all required fields before continuing." });
      return;
    }
    setValidationErrors({});
    setCurrentStep((s) => Math.min(s + 1, 5));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (formData.propertyType === "Apartment") {
      const errors = validateApartmentDraft(formData);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        setSubmitError("Some Apartment details are invalid. Return to the highlighted step and correct them.");
        return;
      }
    } else if (formData.propertyType === "Villa") {
      const errors = validateVillaDraft(formData);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        setSubmitError("Some Villa details are invalid. Return to the highlighted step and correct them.");
        return;
      }
    } else if (formData.propertyType === "Plot") {
      const errors = validatePlotDraft(formData);
      if (Object.keys(errors).length) {
        setValidationErrors(errors);
        setSubmitError("Some Plot details are invalid. Return to the highlighted step and correct them.");
        return;
      }
    } else if (formData.propertyType === "Commercial") {
      const errors = validateCommercialDraft(formData);
      if (Object.keys(errors).length) { setValidationErrors(errors); setSubmitError("Some Commercial details are invalid. Return to the highlighted step and correct them."); return; }
    } else if (formData.propertyType === "PG/Co-living") { const errors = validatePgDraft(formData); if (Object.keys(errors).length) { setValidationErrors(errors); setSubmitError("Some PG details are invalid. Return to the highlighted step and correct them."); return; }
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const propertyPayload = preparePgPropertyPayload(prepareCommercialPropertyPayload(preparePlotPropertyPayload(prepareVillaPropertyPayload(preparePropertyPayload({
        ...formData,
        image: formData.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
        // Additional metadata
        submittedBy: isPublic ? "user" : "admin",
      })))));

      if (isPublic) {
        // Public submissions go to the pending queue via public API
        await createPublicProperty(propertyPayload as any);
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Admin posts go live via admin API
        const property = await addProperty({ ...propertyPayload, published: true } as any);
        if (property) {
          navigate(`/admin?posted=${property.id}`);
        }
      }
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : "Unable to submit the property. Please try again.");
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!(formData.title.trim() && formData.subtitle.trim())) return false;
        if (formData.propertyType === "Apartment") return Object.keys(validateApartmentDraft(formData)).length === 0;
        if (formData.propertyType === "Villa") return Object.keys(validateVillaDraft(formData)).length === 0;
        if (formData.propertyType === "Plot") return Object.keys(validatePlotDraft(formData)).filter((key) => !["layoutMapUrl", "virtualTourUrl", "pinCode"].includes(key)).length === 0;
        if (formData.propertyType === "Commercial") return Object.keys(validateCommercialDraft(formData)).length === 0;
        if (formData.propertyType === "PG/Co-living") return Object.keys(validatePgDraft(formData)).length === 0;
        return !!(formData.price && formData.area && formData.configs.length > 0);
      case 2:
        if (formData.propertyType === "Apartment") return !validateApartmentDraft(formData).virtualTourUrl;
        if (formData.propertyType === "Villa") return !validateVillaDraft(formData).virtualTourUrl;
        if (formData.propertyType === "Plot") return !validatePlotDraft(formData).layoutMapUrl && !validatePlotDraft(formData).virtualTourUrl;
        if (formData.propertyType === "Commercial") return true;
        return true;
      case 3:
        return true; // amenities optional
      case 4:
        if (formData.propertyType === "Apartment") return !Object.keys(validateApartmentDraft(formData)).some((key) => key === "pinCode" || key.startsWith("nearby."));
        if (formData.propertyType === "Villa") return !Object.keys(validateVillaDraft(formData)).some((key) => key === "pinCode" || key.startsWith("nearby."));
        if (formData.propertyType === "Plot") return !Object.keys(validatePlotDraft(formData)).some((key) => key === "pinCode" || key.startsWith("nearby."));
        if (formData.propertyType === "Commercial") return true;
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  if (submitted && isPublic) {
    return (
      <div className="max-w-2xl mx-auto text-center bg-white rounded-3xl p-10 md:p-14 shadow-md border border-[#D5DEF2]/40">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#E0B84A] to-[#D4AF37] flex items-center justify-center shadow-lg">
          <Check className="w-10 h-10 text-[#1E3A8A]" strokeWidth={3} />
        </div>
        <h2 className="text-[26px] md:text-[32px] font-bold text-[#1E3A8A] mt-6">
          Property Submitted for Review
        </h2>
        <p className="text-[15px] text-[#6E7488] mt-3 leading-relaxed">
          Thank you! Your property <span className="font-bold text-[#1E3A8A]">{formData.title || "listing"}</span> has
          been submitted. Our team will verify the details and publish it on ClearTitle One shortly. You&apos;ll be
          notified once it goes live.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-[13px] font-bold px-4 py-2 rounded-full">
          <Clock className="w-4 h-4" /> Status: Pending Verification
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              setFormData(initialFormData);
              setCurrentStep(1);
              setSubmitted(false);
            }}
            className="px-6 py-3 rounded-xl text-[14px] font-bold border border-[#D5DEF2] text-[#1E3A8A] hover:border-[#D4AF37] transition-all"
          >
            Submit Another Property
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl text-[14px] font-bold bg-[#1E3A8A] text-[#E8C66A] hover:bg-[#25459E] transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const previewData = preparePgPropertyPayload(prepareCommercialPropertyPayload(preparePlotPropertyPayload(prepareVillaPropertyPayload(preparePropertyPayload(formData)))));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Progress Bar */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-[#D5DEF2]/30">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                    step.id < currentStep ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#C9A24E] text-white shadow-md"
                        : isActive
                        ? "bg-gradient-to-br from-[#C9A24E] to-[#E3C25A] text-white shadow-lg scale-110"
                        : "bg-[#F1F5FF] text-[#6E7488] border border-[#D5DEF2]/30"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-[11px] font-medium hidden sm:block ${
                      isActive ? "text-[#C9A24E]" : isCompleted ? "text-[#C9A24E]" : "text-[#6E7488]"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="flex-1 mx-2 h-0.5 rounded-full overflow-hidden bg-[#E2E9FB]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-[#C9A24E] w-full" : "bg-transparent w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[13px] text-[#6E7488] text-center">
          Step {currentStep} of {steps.length} — {steps[currentStep - 1].label}
        </p>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#D5DEF2]/30 overflow-hidden">
        <div className="p-6 lg:p-8">
          {/* STEP 1: Basic Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-[20px] font-bold text-[#1E3A8A]" style={{ fontFamily: "var(--font-outfit)" }}>
                Property Basic Details
              </h2>
              {Object.values(validationErrors).some(Boolean) && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
                  Please correct the highlighted {formData.propertyType} details before continuing.
                </div>
              )}

              {/* Property Type */}
              <div>
                <label className="block text-[13px] font-semibold text-[#243559] mb-2">
                  Property Type <span className="text-[#E8C66A]">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {propertyTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => changePropertyType(type)}
                      className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border ${
                        formData.propertyType === type
                          ? "bg-[#C9A24E] text-white border-[#C9A24E] shadow-md"
                          : "bg-[#F1F5FF] text-[#243559] border-[#D5DEF2]/30 hover:border-[#C9A24E]/40"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">
                    Property / Project Name <span className="text-[#E8C66A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g. Prestige Lakeside Habitat"
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">
                    Location / Subtitle <span className="text-[#E8C66A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                    placeholder="e.g. Whitefield, Bangalore"
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
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
                  floorLabel={formData.floorLabel || ""}
                  setFloorLabel={(value) => updateField("floorLabel", value)}
                  totalFloors={formData.totalFloors}
                  setTotalFloors={(value) => updateField("totalFloors", value)}
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
                  setDetails={(value) => updateField("plotDetails", value)}
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
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Configurations <span className="text-[#E8C66A]">*</span></label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={configInput} onChange={(e) => setConfigInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addConfig())} placeholder="e.g. 3 BHK" className="flex-1 px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E]" />
                    <button type="button" onClick={addConfig} className="px-4 py-3 bg-[#C9A24E] text-white rounded-xl text-[13px] font-medium">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">{formData.configs.map((config) => <span key={config} className="inline-flex items-center gap-1 bg-[#E2E9FB] text-[#C9A24E] px-3 py-1.5 rounded-lg text-[13px] font-medium">{config}<button type="button" onClick={() => removeConfig(config)}>×</button></span>)}</div>
                </div>
              )}

              {/* Price & Area */}
              {(!isStructuredType(formData.propertyType) || formData.propertyType === "Commercial") && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">
                    Price <span className="text-[#E8C66A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="e.g. ₹ 1.25 Cr"
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Price per Sqft</label>
                  <input
                    type="text"
                    value={formData.pricePerSqft || ""}
                    onChange={(e) => updateField("pricePerSqft", e.target.value)}
                    placeholder="e.g. ₹ 8,500/sqft"
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">
                    Area <span className="text-[#E8C66A]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => updateField("area", e.target.value)}
                    placeholder="e.g. 1500 sqft"
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  />
                </div>
              </div>}

              {/* Bedrooms, Bathrooms, Floor */}
              {!isStructuredType(formData.propertyType) && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Bedrooms</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateField("bedrooms", n)}
                        className={`w-11 h-11 rounded-xl text-[14px] font-semibold transition-all duration-200 border ${
                          formData.bedrooms === n
                            ? "bg-[#C9A24E] text-white border-[#C9A24E] shadow-md"
                            : "bg-[#F1F5FF] text-[#243559] border-[#D5DEF2]/30 hover:border-[#C9A24E]/40"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Bathrooms</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateField("bathrooms", n)}
                        className={`w-11 h-11 rounded-xl text-[14px] font-semibold transition-all duration-200 border ${
                          formData.bathrooms === n
                            ? "bg-[#D4AF37] text-white border-[#D4AF37] shadow-md"
                            : "bg-[#F1F5FF] text-[#243559] border-[#D5DEF2]/30 hover:border-[#D4AF37]/40"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Floor</label>
                  <input
                    type="text"
                    value={formData.floor || ""}
                    onChange={(e) => updateField("floor", e.target.value)}
                    placeholder="e.g. 3rd of 12 Floors"
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  />
                </div>
              </div>}

              {/* Possession, Builder, Transaction Type, Listing Type */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {!isStructuredType(formData.propertyType) && <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Possession</label>
                  <select
                    value={formData.possession || ""}
                    onChange={(e) => updateField("possession", e.target.value)}
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  >
                    <option value="">Select</option>
                    {possessionOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>}
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Builder / Developer {(formData.propertyType === "Villa" || formData.propertyType === "Plot") && <span className="text-[#E8C66A]">*</span>}</label>
                  <input
                    type="text"
                    list={!isPublic ? "builder-options" : undefined}
                    value={formData.builder || ""}
                    onChange={(e) => updateField("builder", e.target.value)}
                    placeholder="e.g. Prestige Group"
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  />
                  {!isPublic && <datalist id="builder-options">{builders.map((builder) => <option key={builder.id} value={builder.name} />)}</datalist>}
                  {validationErrors.builder && <p className="text-[12px] text-red-600 mt-1">{validationErrors.builder}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Transaction Type {(formData.propertyType === "Villa" || formData.propertyType === "Plot") && <span className="text-[#E8C66A]">*</span>}</label>
                  <div className="flex gap-2">
                    {transactionTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, transactionType: type, ...(type === "Resale" ? { bookingAmount: "" } : {}) }))}
                        className={`flex-1 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 border ${
                          formData.transactionType === type
                            ? "bg-[#C9A24E] text-white border-[#C9A24E] shadow-md"
                            : "bg-[#F1F5FF] text-[#243559] border-[#D5DEF2]/30 hover:border-[#C9A24E]/40"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {validationErrors.transactionType && <p className="text-[12px] text-red-600 mt-1">{validationErrors.transactionType}</p>}
                </div>
                {formData.propertyType !== "Apartment" && <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Listing Type {(formData.propertyType === "Villa" || formData.propertyType === "Plot") && <span className="text-[#E8C66A]">*</span>}</label>
                  <div className="flex gap-2">
                    {["For Sale", "For Rent"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateField("listingType", type)}
                        className={`flex-1 px-3 py-3 rounded-xl text-[13px] font-medium transition-all duration-200 border ${
                          formData.listingType === type
                            ? "bg-[#C9A24E] text-white border-[#C9A24E] shadow-md"
                            : "bg-[#F1F5FF] text-[#243559] border-[#D5DEF2]/30 hover:border-[#C9A24E]/40"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                  {validationErrors.listingType && <p className="text-[12px] text-red-600 mt-1">{validationErrors.listingType}</p>}
                </div>}
              </div>

              {!isPublic && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#243559] mb-2">Linked Builder</label>
                    <select
                      value={formData.builderId || ""}
                      onChange={(e) => updateField("builderId", e.target.value || null)}
                      className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                    >
                      <option value="">— None —</option>
                      {builders.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#243559] mb-2">Linked Dealer</label>
                    <select
                      value={formData.dealerId || ""}
                      onChange={(e) => updateField("dealerId", e.target.value || null)}
                      className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                    >
                      <option value="">— None —</option>
                      {dealers.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Furnishing, Facing, Parking */}
              {!['Plot', 'Commercial'].includes(formData.propertyType || "") && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Furnishing</label>
                  <select
                    value={formData.furnishing || ""}
                    onChange={(e) => updateField("furnishing", e.target.value)}
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  >
                    {furnishingOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                {!isStructuredType(formData.propertyType) && <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Facing</label>
                  <select
                    value={formData.facing || ""}
                    onChange={(e) => updateField("facing", e.target.value)}
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  >
                    {facingOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>}
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Parking</label>
                  <select
                    value={formData.parking || ""}
                    onChange={(e) => updateField("parking", e.target.value)}
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  >
                    {parkingOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>}

              {formData.propertyType === "Apartment" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-[#D5DEF2]/50 bg-[#F1F5FF]/50 p-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#243559] mb-2">Ownership Type</label>
                    <select value={formData.ownershipType || ""} onChange={(e) => updateField("ownershipType", e.target.value)} className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] bg-white">
                      {["Freehold", "Leasehold", "Co-operative Society", "Power of Attorney"].map((value) => <option key={value}>{value}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#243559] mb-2">Overlooking</label>
                    <div className="flex flex-wrap gap-2">
                      {["Club House", "Garden", "Pool", "Main Road", "Park"].map((value) => {
                        const selected = formData.overlooking?.includes(value);
                        return <button key={value} type="button" onClick={() => updateField("overlooking", selected ? formData.overlooking!.filter((item) => item !== value) : [...(formData.overlooking || []), value])} className={`px-3 py-2 rounded-lg text-[12px] border ${selected ? "bg-[#C9A24E] text-white border-[#C9A24E]" : "bg-white text-[#243559] border-[#D5DEF2]"}`}>{value}</button>;
                      })}
                    </div>
                  </div>
                  {formData.transactionType === "New Property" && <div>
                    <label className="block text-[13px] font-semibold text-[#243559] mb-2">Booking Amount <span className="text-[#E8C66A]">*</span></label>
                    <input value={formData.bookingAmount || ""} onChange={(e) => updateField("bookingAmount", e.target.value)} placeholder="e.g. ₹5,00,000" className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px]" />
                    {validationErrors.bookingAmount && <p className="text-[12px] text-red-600 mt-1">{validationErrors.bookingAmount}</p>}
                  </div>}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#243559] mb-2">Maintenance Charges</label>
                    <div className="flex gap-2">
                      <input value={formData.maintenanceCharges || ""} onChange={(e) => updateField("maintenanceCharges", e.target.value)} placeholder="e.g. ₹4/sqft" className="flex-1 min-w-0 px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px]" />
                      <select value={formData.maintenancePeriod || "month"} onChange={(e) => updateField("maintenancePeriod", e.target.value as "month" | "quarter" | "year")} className="px-3 py-3 border border-[#D5DEF2] rounded-xl text-[13px] bg-white"><option value="month">/ month</option><option value="quarter">/ quarter</option><option value="year">/ year</option></select>
                    </div>
                  </div>
                </div>
              )}

              {/* Age & Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isStructuredType(formData.propertyType) && <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Age of Property</label>
                  <select
                    value={formData.ageOfProperty || ""}
                    onChange={(e) => updateField("ageOfProperty", e.target.value)}
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  >
                    {ageOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>}
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Badges</label>
                  <div className="flex flex-wrap gap-2">
                    {badgeOptions.map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => toggleBadge(badge)}
                        className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 border ${
                          formData.badges?.includes(badge)
                            ? badge === "RERA"
                              ? "bg-[#C9A24E] text-white border-[#C9A24E]"
                              : badge === "Premium"
                              ? "bg-gradient-to-r from-[#C9A24E] to-[#E3C25A] text-white border-[#C9A24E]"
                              : "bg-[#E8C66A] text-white border-[#E8C66A]"
                            : "bg-[#F1F5FF] text-[#6E7488] border-[#D5DEF2]/30 hover:border-[#C9A24E]/40"
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
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">Homepage Placement</label>
                  <select
                    value={formData.websiteSection || "None"}
                    onChange={(e) => updateField("websiteSection", e.target.value)}
                    className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                  >
                    {sectionOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <p className="text-[12px] text-[#6E7488] mt-1.5">Choose which homepage section this property appears in</p>
                </div>
              )}

              {/* RERA */}
              <div className="flex items-center gap-3 p-4 bg-[#F1F5FF] rounded-xl border border-[#D5DEF2]/30">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, reraRegistered: !prev.reraRegistered, ...(!prev.reraRegistered ? {} : { reraNumber: "" }) }))}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.reraRegistered
                      ? "bg-[#C9A24E] text-white"
                      : "border-2 border-[#D5DEF2] bg-white"
                  }`}
                >
                  {formData.reraRegistered && <Check className="w-4 h-4" />}
                </button>
                <div>
                  <p className="text-[14px] font-semibold text-[#1E3A8A]">RERA Registered</p>
                  <p className="text-[12px] text-[#6E7488]">This property is registered under RERA guidelines</p>
                </div>
              </div>
              {isStructuredType(formData.propertyType) && formData.reraRegistered && (
                <div>
                  <label className="block text-[13px] font-semibold text-[#243559] mb-2">RERA Number <span className="text-[#E8C66A]">*</span></label>
                  <input value={formData.reraNumber || ""} onChange={(e) => updateField("reraNumber", e.target.value)} placeholder="PRM/KA/RERA/..." className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px]" />
                  {validationErrors.reraNumber && <p className="text-[12px] text-red-600 mt-1">{validationErrors.reraNumber}</p>}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-[13px] font-semibold text-[#243559] mb-2">Property Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Describe the property in detail — location benefits, features, nearby landmarks..."
                  rows={4}
                  className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all resize-none"
                />
                {formData.propertyType === "Apartment" && <p className={`text-[12px] mt-1 ${validationErrors.description ? "text-red-600" : "text-[#6E7488]"}`}>{validationErrors.description || `${(formData.description || "").trim().length}/50 minimum characters`}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: Photos & Videos */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-[20px] font-bold text-[#1E3A8A] mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
                Property Photos & Videos
              </h2>
              <MediaUploader
                images={formData.images || []}
                videos={formData.videos || []}
                onImagesChange={(imgs) => updateField("images", imgs)}
                onVideosChange={(vids) => updateField("videos", vids)}
              />

              {isStructuredType(formData.propertyType) && (
                <div className="mt-8 pt-6 border-t border-[#E2E9FB]">
                  <label className="block text-[15px] font-bold text-[#1E3A8A] mb-2">Virtual Tour / 3D Walkthrough</label>
                  <input type="url" value={formData.virtualTourUrl || ""} onChange={(e) => updateField("virtualTourUrl", e.target.value)} placeholder="https://example.com/virtual-tour" className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px]" />
                  <p className="text-[12px] text-[#6E7488] mt-1">Optional secure HTTP(S) link.</p>
                  {validationErrors.virtualTourUrl && <p className="text-[12px] text-red-600 mt-1">{validationErrors.virtualTourUrl}</p>}
                </div>
              )}

              {formData.propertyType === "Plot" && (
                <div className="mt-8 pt-6 border-t border-[#E2E9FB]">
                  <h3 className="text-[15px] font-bold text-[#1E3A8A] mb-1">Master Plan / Layout Map <span className="text-[#E8C66A]">*</span></h3>
                  <p className="text-[13px] text-[#6E7488] mb-4">Required for buyers to verify plot numbers and availability. Upload JPG, PNG, WebP, or PDF (max 5 MB).</p>
                  {formData.plotDetails?.layoutMapUrl ? <div className="flex items-center gap-3 p-4 bg-[#F1F5FF] border border-[#D5DEF2]/40 rounded-2xl"><FileText className="w-6 h-6 text-[#C9A24E]" /><span className="flex-1 text-[13px] font-semibold text-[#1E3A8A]">Layout map attached</span><button type="button" onClick={() => updateField("plotDetails", { ...(formData.plotDetails || initialPlotDetails()), layoutMapUrl: "" })} className="text-[12px] font-bold text-red-500">Remove</button></div> : <label className="flex flex-col items-center justify-center gap-2 p-7 border-2 border-dashed border-[#D5DEF2] rounded-2xl cursor-pointer hover:border-[#D4AF37]/60"><FileText className="w-7 h-7 text-[#D4AF37]" /><span className="text-[14px] font-semibold text-[#1E3A8A]">Upload master plan / layout map</span><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; const isPdf = file.type === "application/pdf"; const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type); if ((!isPdf && !isImage) || file.size > 5 * 1024 * 1024) { setSubmitError("Layout map must be a JPG, PNG, WebP, or PDF no larger than 5 MB."); event.target.value = ""; return; } try { const url = await uploadPropertyMedia(file, isPdf ? "layout-map-pdf" : "layout-map-image"); updateField("plotDetails", { ...(formData.plotDetails || initialPlotDetails()), layoutMapUrl: url, layoutMapType: isPdf ? "pdf" : "image" }); setSubmitError(""); } catch (error) { setSubmitError(error instanceof Error ? error.message : "Layout-map upload failed."); } }} /></label>}
                  {validationErrors.layoutMapUrl && <p className="text-[12px] text-red-600 mt-2">{validationErrors.layoutMapUrl}</p>}
                </div>
              )}

              {/* Brochure Upload */}
              <div className="mt-8 pt-6 border-t border-[#E2E9FB]">
                <h3 className="text-[15px] font-bold text-[#1E3A8A] mb-1">Property Brochure</h3>
                <p className="text-[13px] text-[#6E7488] mb-4">
                  Upload a PDF brochure buyers can download from the property page (optional).
                </p>

                {formData.brochure ? (
                  <div className="flex items-center gap-3 p-4 bg-[#F1F5FF] border border-[#D5DEF2]/40 rounded-2xl">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E0B84A] to-[#D4AF37] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#1E3A8A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1E3A8A] truncate">
                        {formData.brochureName || "Brochure attached"}
                      </p>
                      <p className="text-[12px] text-[#6E7488]">Ready to publish</p>
                    </div>
                    <button
                      onClick={() => {
                        updateField("brochure", "");
                        updateField("brochureName", "");
                      }}
                      className="text-[12px] font-bold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-[#D5DEF2] rounded-2xl cursor-pointer hover:border-[#D4AF37]/60 hover:bg-[#F1F5FF]/50 transition-all">
                    <FileText className="w-8 h-8 text-[#D4AF37]" />
                    <span className="text-[14px] font-semibold text-[#1E3A8A]">Click to upload brochure</span>
                    <span className="text-[12px] text-[#6E7488]">PDF, max ~5 MB</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.type !== "application/pdf" || file.size > 5 * 1024 * 1024) {
                          setSubmitError("Brochure must be a PDF no larger than 5 MB.");
                          e.target.value = "";
                          return;
                        }
                        setSubmitError("");
                        try {
                          const url = await uploadPropertyMedia(file, "brochure");
                          updateField("brochure", url);
                          updateField("brochureName", file.name);
                        } catch (error) {
                          setSubmitError(error instanceof Error ? error.message : "Brochure upload failed.");
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Amenities */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-[#1E3A8A] mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
                    Select Amenities
                  </h2>
                  <p className="text-[14px] text-[#6E7488]">Choose all the amenities available in this property</p>
                </div>
                <button
                  type="button"
                  onClick={toggleAllAmenities}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
                    allAmenitiesSelected
                      ? "bg-[#C9A24E] text-white border-[#C9A24E] shadow-md"
                      : "bg-white text-[#1E3A8A] border-[#D5DEF2] hover:border-[#C9A24E]/50"
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
                          ? "border-[#C9A24E] bg-[#E2E9FB] shadow-md scale-[1.02]"
                          : "border-[#D5DEF2]/30 bg-[#F1F5FF] hover:border-[#C9A24E]/40 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isSelected ? "bg-white shadow-sm" : "bg-white"
                        }`}
                      >
                        <Icon className="w-6 h-6" style={{ color }} />
                      </div>
                      <span className="text-[12px] font-medium text-[#243559] text-center leading-tight">
                        {name}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-[#C9A24E] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {(formData.amenities?.length || 0) > 0 && (
                <p className="mt-4 text-[13px] text-[#C9A24E] font-medium">
                  ✓ {formData.amenities?.length} amenities selected
                </p>
              )}
            </div>
          )}

          {/* STEP 4: Society & Locality */}
          {currentStep === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-[20px] font-bold text-[#1E3A8A] mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
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
                      <label className="block text-[13px] font-semibold text-[#243559] mb-2">{label}</label>
                      <input
                        type="text"
                        value={(formData.society as Record<string, string>)?.[key] || ""}
                        onChange={(e) => updateNestedField("society", key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#E2E9FB] pt-8">
                <h2 className="text-[20px] font-bold text-[#1E3A8A] mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
                  Locality & Nearby
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#243559] mb-2">City</label>
                    <input
                      type="text"
                      value={formData.locality?.city || ""}
                      onChange={(e) => updateNestedField("locality", "city", e.target.value)}
                      placeholder="e.g. Bangalore"
                      className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#243559] mb-2">Zone</label>
                    <select
                      value={formData.locality?.zone || ""}
                      onChange={(e) => updateNestedField("locality", "zone", e.target.value)}
                      className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] bg-white focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                    >
                      <option value="">Select Zone</option>
                      {["East", "West", "North", "South", "Central"].map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#243559] mb-2">Landmark</label>
                    <input
                      type="text"
                      value={formData.locality?.landmark || ""}
                      onChange={(e) => updateNestedField("locality", "landmark", e.target.value)}
                      placeholder="e.g. Near Whitefield Metro"
                      className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
                    />
                  </div>
                  {isStructuredType(formData.propertyType) && <div>
                    <label className="block text-[13px] font-semibold text-[#243559] mb-2">PIN Code</label>
                    <input inputMode="numeric" maxLength={6} value={formData.locality?.pinCode || ""} onChange={(e) => updateNestedField("locality", "pinCode", e.target.value.replace(/\D/g, ""))} placeholder="e.g. 560066" className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px]" />
                    {validationErrors.pinCode && <p className="text-[12px] text-red-600 mt-1">{validationErrors.pinCode}</p>}
                  </div>}
                </div>

                <h3 className="text-[15px] font-semibold text-[#243559] mb-3">Nearby Amenities</h3>
                {isStructuredType(formData.propertyType) ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(["schools", "hospitals", "shopping", "metro"] as const).map((key) => (
                    <div key={key} className="rounded-xl border border-[#D5DEF2] bg-[#F1F5FF]/40 p-4">
                      <label className="block text-[13px] font-semibold text-[#243559] mb-2 capitalize">{key === "metro" ? "Metro / Train" : key}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" min={0} step={1} value={formData.nearbyDetails?.[key]?.count ?? ""} onChange={(e) => updateNearbyDetail(key, "count", e.target.value ? Number(e.target.value) : undefined)} placeholder="Count" className="w-full px-3 py-2.5 border border-[#D5DEF2] rounded-lg text-[13px]" />
                        <input value={formData.nearbyDetails?.[key]?.distance || ""} onChange={(e) => updateNearbyDetail(key, "distance", e.target.value)} placeholder="Distance, e.g. 2 km" className="w-full px-3 py-2.5 border border-[#D5DEF2] rounded-lg text-[13px]" />
                      </div>
                      {(validationErrors[`nearby.${key}.count`] || validationErrors[`nearby.${key}.distance`]) && <p className="text-[11px] text-red-600 mt-1">{validationErrors[`nearby.${key}.count`] || validationErrors[`nearby.${key}.distance`]}</p>}
                    </div>
                  ))}
                </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "schools", label: "Schools", placeholder: "e.g. 3 within 2 km" },
                    { key: "hospitals", label: "Hospitals", placeholder: "e.g. 2 within 3 km" },
                    { key: "shopping", label: "Shopping", placeholder: "e.g. 5 within 1 km" },
                    { key: "metro", label: "Metro / Train", placeholder: "e.g. 1.5 km away" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[13px] font-semibold text-[#243559] mb-2">{label}</label>
                      <input
                        type="text"
                        value={(formData.nearbyAmenities as Record<string, string>)?.[key] || ""}
                        onChange={(e) => updateNestedField("nearbyAmenities", key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E] focus:ring-2 focus:ring-[#C9A24E]/10 transition-all"
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
                <div className="w-10 h-10 bg-gradient-to-br from-[#C9A24E] to-[#E3C25A] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-[#1E3A8A]" style={{ fontFamily: "var(--font-outfit)" }}>
                    Review Your Property
                  </h2>
                  <p className="text-[13px] text-[#6E7488]">Verify all details before publishing</p>
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-[#F1F5FF] rounded-2xl p-6 border border-[#D5DEF2]/30 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[20px] font-bold text-[#1E3A8A]" style={{ fontFamily: "var(--font-outfit)" }}>
                      {formData.title || "Untitled Property"}
                    </h3>
                    <p className="text-[14px] text-[#6E7488] flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-[#C9A24E]" />
                      {formData.subtitle || "Location not specified"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[22px] font-bold text-[#C9A24E]">{previewData.price || "Price TBD"}</p>
                    {formData.pricePerSqft && (
                      <p className="text-[13px] text-[#6E7488]">{formData.pricePerSqft}</p>
                    )}
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl p-3 text-center">
                    <Bed className="w-5 h-5 text-[#C9A24E] mx-auto mb-1" />
                    <p className="text-[16px] font-semibold text-[#1E3A8A]">{previewData.bedrooms}</p>
                    <p className="text-[11px] text-[#6E7488]">Bedrooms</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <Bath className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                    <p className="text-[16px] font-semibold text-[#1E3A8A]">{previewData.bathrooms}</p>
                    <p className="text-[11px] text-[#6E7488]">Bathrooms</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <Maximize className="w-5 h-5 text-[#E8C66A] mx-auto mb-1" />
                    <p className="text-[16px] font-semibold text-[#1E3A8A]">{previewData.area || "-"}</p>
                    <p className="text-[11px] text-[#6E7488]">Sq.ft</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 text-center">
                    <Home className="w-5 h-5 text-[#A8842C] mx-auto mb-1" />
                    <p className="text-[13px] font-semibold text-[#1E3A8A]">{formatPossession(previewData)}</p>
                    <p className="text-[11px] text-[#6E7488]">Possession</p>
                  </div>
                </div>

                {formData.propertyType === "Apartment" && (formData.configurationDetails?.length || 0) > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-[#D5DEF2] bg-white">
                    <table className="w-full min-w-[850px] text-left text-[12px]">
                      <thead className="bg-[#1E3A8A] text-white"><tr>{["Config", "Price", "Super area", "Carpet area", "Beds", "Baths", "Balconies", "Facing"].map((label) => <th key={label} className="px-3 py-2.5">{label}</th>)}</tr></thead>
                      <tbody>{formData.configurationDetails!.map((row) => <tr key={row.configuration} className="border-t border-[#E2E9FB]"><td className="px-3 py-2 font-bold">{row.configuration}</td><td className="px-3 py-2">{row.price}</td><td className="px-3 py-2">{row.superBuiltUpArea}</td><td className="px-3 py-2">{row.carpetArea}</td><td className="px-3 py-2">{row.bedrooms}</td><td className="px-3 py-2">{row.bathrooms}</td><td className="px-3 py-2">{row.balconies}</td><td className="px-3 py-2">{row.facings.join(", ")}</td></tr>)}</tbody>
                    </table>
                  </div>
                )}

                {formData.propertyType === "Villa" && (formData.villaDetails?.configurationDetails.length || 0) > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-[#D5DEF2] bg-white">
                    <table className="w-full min-w-[760px] text-left text-[12px]">
                      <thead className="bg-[#1E3A8A] text-white"><tr>{["Config", "Price", "Plot area", "Built-up area", "Super area", "Beds", "Baths"].map((label) => <th key={label} className="px-3 py-2.5">{label}</th>)}</tr></thead>
                      <tbody>{formData.villaDetails!.configurationDetails.map((row) => <tr key={row.configuration} className="border-t border-[#E2E9FB]"><td className="px-3 py-2 font-bold">{row.configuration}</td><td className="px-3 py-2">{row.price}</td><td className="px-3 py-2">{row.plotArea}</td><td className="px-3 py-2">{row.builtUpArea}</td><td className="px-3 py-2">{row.superArea}</td><td className="px-3 py-2">{row.bedrooms}</td><td className="px-3 py-2">{row.bathrooms}</td></tr>)}</tbody>
                    </table>
                  </div>
                )}

                {formData.propertyType === "Villa" && formData.villaDetails && (
                  <div>
                    <p className="text-[13px] font-semibold text-[#243559] mb-2">Villa & Plot Details</p>
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
                      ].filter(([, value]) => value).map(([label, value]) => <div key={String(label)} className="bg-white rounded-lg p-2.5"><span className="text-[#6E7488] text-[10px]">{label}</span><p className="font-medium text-[#1E3A8A]">{value}</p></div>)}
                    </div>
                  </div>
                )}

                {formData.propertyType === "Villa" && (
                  <div>
                    <p className="text-[13px] font-semibold text-[#243559] mb-2">Society, Locality & Media</p>
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
                        ["Virtual Tour", formData.virtualTourUrl ? "Added" : "Not added"],
                        ["Brochure", formData.brochure ? formData.brochureName || "Added" : "Not added"],
                      ].filter(([, value]) => value).map(([label, value]) => <div key={String(label)} className="bg-white rounded-lg p-2.5"><span className="text-[#6E7488] text-[10px]">{label}</span><p className="font-medium text-[#1E3A8A] break-words">{value}</p></div>)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px] mt-3">
                      {(["schools", "hospitals", "shopping", "metro"] as const).map((key) => {
                        const item = formData.nearbyDetails?.[key];
                        if (!item || (item.count === undefined && !item.distance)) return null;
                        return <div key={key} className="bg-white rounded-lg p-2.5"><span className="text-[#6E7488] text-[10px] capitalize">{key === "metro" ? "Metro / Train" : key}</span><p className="font-medium text-[#1E3A8A]">{item.count ?? "—"} · {item.distance || "—"}</p></div>;
                      })}
                    </div>
                  </div>
                )}

                {/* Photos Preview */}
                {(formData.images?.length || 0) > 0 && (
                  <div>
                    <p className="text-[13px] font-semibold text-[#243559] mb-2">
                      📷 {formData.images!.length} Photos uploaded
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {formData.images!.slice(0, 5).map((img, i) => (
                        <img key={i} src={img} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
                      ))}
                      {formData.images!.length > 5 && (
                        <div className="w-20 h-14 rounded-lg bg-[#E2E9FB] flex items-center justify-center text-[13px] font-medium text-[#6E7488] flex-shrink-0">
                          +{formData.images!.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Videos Preview */}
                {(formData.videos?.length || 0) > 0 && (
                  <p className="text-[13px] font-semibold text-[#243559]">
                    🎬 {formData.videos!.length} Video{formData.videos!.length > 1 ? "s" : ""} uploaded
                  </p>
                )}

                {/* Configs & Badges */}
                <div className="flex flex-wrap gap-2">
                  {formData.configs.map((c) => (
                    <span key={c} className="bg-[#E2E9FB] text-[#C9A24E] text-[12px] font-medium px-3 py-1 rounded-lg">
                      {c}
                    </span>
                  ))}
                  {formData.badges?.map((b) => (
                    <span key={b} className="bg-gradient-to-r from-[#C9A24E] to-[#E3C25A] text-white text-[12px] font-semibold px-3 py-1 rounded-lg">
                      {b}
                    </span>
                  ))}
                </div>

                {/* Amenities */}
                {(formData.amenities?.length || 0) > 0 && (
                  <div>
                    <p className="text-[13px] font-semibold text-[#243559] mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities!.map((a) => (
                        <span key={a} className="text-[12px] text-[#243559] bg-white px-3 py-1.5 rounded-lg border border-[#D5DEF2]/30">
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
                      <span className="text-[#6E7488] text-[11px]">Type</span>
                      <p className="font-medium text-[#1E3A8A]">{formData.propertyType}</p>
                    </div>
                  )}
                  {formData.furnishing && (
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-[#6E7488] text-[11px]">Furnishing</span>
                      <p className="font-medium text-[#1E3A8A]">{formData.furnishing}</p>
                    </div>
                  )}
                  {formData.facing && (
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-[#6E7488] text-[11px]">Facing</span>
                      <p className="font-medium text-[#1E3A8A]">{formData.facing}</p>
                    </div>
                  )}
                  {formData.parking && (
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-[#6E7488] text-[11px]">Parking</span>
                      <p className="font-medium text-[#1E3A8A]">{formData.parking}</p>
                    </div>
                  )}
                  {formData.builder && (
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-[#6E7488] text-[11px]">Builder</span>
                      <p className="font-medium text-[#1E3A8A]">{formData.builder}</p>
                    </div>
                  )}
                  {formData.reraRegistered && (
                    <div className="bg-white rounded-lg p-2.5 flex items-center gap-1">
                      <Verified className="w-4 h-4 text-[#C9A24E]" />
                      <p className="font-medium text-[#1E3A8A]">RERA {formData.reraNumber || "Registered"}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {formData.description && (
                  <div>
                    <p className="text-[13px] font-semibold text-[#243559] mb-1">Description</p>
                    <p className="text-[13px] text-[#243559] leading-relaxed">{formData.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        {submitError && <div role="alert" className="mx-6 lg:mx-8 mb-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{submitError}</div>}
        <div className="px-6 lg:px-8 py-4 bg-[#F1F5FF]/50 border-t border-[#E2E9FB] flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 ${
              currentStep === 1
                ? "text-[#D5DEF2] cursor-not-allowed"
                : "text-[#243559] hover:bg-white border border-[#D5DEF2]/30"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-3">
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 bg-gradient-to-r from-[#C9A24E] to-[#E3C25A] text-white shadow-md hover:shadow-lg"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#E8C66A] to-[#FBBF24] text-white rounded-xl text-[14px] font-bold shadow-lg hover:shadow-xl hover:from-[#A8842C] hover:to-[#E8C66A] transition-all duration-200 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isPublic ? "Submitting..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {isPublic ? "Submit for Review" : "Publish Property"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
