"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  Layers3,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import type { Property } from "@/components/acres/mock-data";
import { fetchProperties } from "@/lib/api";
import {
  addHeroSlide,
  deleteHeroSlide,
  getAdminHeroSlides,
  updateHeroSlide,
  type HeroLinkType,
  type HeroSlide,
  type PromotionSlot,
} from "@/lib/heroStore";
import { promotionBadgeClass, promotionFrameClass, promotionRankLabel } from "@/lib/promotionPresentation";

type EditorSection = "overview" | "photos" | "structure" | "amenities" | "society" | "extra" | "display";
type FormState = Omit<HeroSlide, "id" | "source">;
type FieldOption = { key: string; label: string; value: string; section: Exclude<EditorSection, "photos" | "extra" | "display"> };

const editorSections: Array<{ id: EditorSection; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "photos", label: "Photos" },
  { id: "structure", label: "Configuration / Structure" },
  { id: "amenities", label: "Amenities" },
  { id: "society", label: "Society & Locality" },
  { id: "extra", label: "Additional Information" },
  { id: "display", label: "Display Settings" },
];

const slots: Array<{ id: PromotionSlot; label: string; rank: 1 | 2 | 3 }> = [
  { id: "diamond", label: "Diamond", rank: 1 },
  { id: "gold", label: "Gold", rank: 2 },
  { id: "silver", label: "Silver", rank: 3 },
];

const createBlank = (promotionSlot?: PromotionSlot): FormState => ({
  image: "",
  builderName: "",
  title: "",
  tagline: "",
  location: "",
  priceText: "",
  rera: "",
  badge: "Featured",
  ctaText: "Explore Now",
  linkType: "property",
  linkValue: "",
  propertyId: null,
  promotionSlot: promotionSlot || null,
  displayOnHomepage: true,
  selectedFields: ["title", "builder", "location", "price", "propertyType", "configuration"],
  fieldOverrides: {},
  extraDetails: [],
  additionalInformation: { enabled: false, values: {} },
  order: promotionSlot ? slots.find((slot) => slot.id === promotionSlot)!.rank - 1 : 0,
  published: true,
});

function joinObject(value?: Record<string, unknown>) {
  if (!value) return "";
  return Object.entries(value)
    .filter(([, item]) => item !== undefined && item !== null && item !== "")
    .map(([key, item]) => `${key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}: ${String(item)}`)
    .join(" · ");
}

function structureValue(property?: Property) {
  if (!property) return "";
  if (property.propertyType === "Villa" && property.villaDetails) {
    const details = property.villaDetails;
    return [details.villaType, details.plotDimensions, details.numberOfFloors && `${details.numberOfFloors} floors`].filter(Boolean).join(" · ");
  }
  if (property.propertyType === "Plot" && property.plotDetails) {
    const details = property.plotDetails;
    const sizes = details.plotSizeDetails?.map((item) => item.plotSize).filter(Boolean).join(", ");
    return [sizes, details.totalPlots && `${details.totalPlots} plots`, details.approvalAuthority].filter(Boolean).join(" · ");
  }
  if (property.propertyType === "Commercial" && property.commercialDetails) {
    const details = property.commercialDetails;
    return [details.commercialSubtype, details.buildingGrade, details.structure, details.frontage].filter(Boolean).join(" · ");
  }
  if (property.propertyType === "Rent" && property.rentDetails) {
    return [property.rentDetails.rentalPropertyType, property.rentDetails.configuration, property.rentDetails.floor].filter(Boolean).join(" · ");
  }
  if (property.propertyType === "Lease" && property.leaseDetails) {
    return [property.leaseDetails.leasePropertyType, property.leaseDetails.carpetArea, property.leaseDetails.superArea].filter(Boolean).join(" · ");
  }
  if (property.propertyType === "PG/Co-living" && property.pgDetails) {
    return [property.pgDetails.genderPreference, property.pgDetails.mealsIncluded, property.pgDetails.contactType].filter(Boolean).join(" · ");
  }
  return [property.floorLabel || property.floor, property.totalFloors && `${property.totalFloors} total floors`].filter(Boolean).join(" · ");
}

function propertyFields(property?: Property): FieldOption[] {
  if (!property) return [];
  const configuration = property.configs?.join(", ")
    || property.configurationDetails?.map((item) => item.configuration).join(", ")
    || property.villaDetails?.configurationDetails?.map((item) => item.configuration).join(", ")
    || property.rentDetails?.configuration
    || "";

  const fields: FieldOption[] = [
    { key: "title", label: "Property title", value: property.title, section: "overview" },
    { key: "builder", label: "Builder", value: property.builder || "", section: "overview" },
    { key: "location", label: "Location", value: property.subtitle || joinObject(property.locality), section: "overview" },
    { key: "price", label: "Price", value: property.price, section: "overview" },
    { key: "propertyType", label: "Property type", value: property.propertyType || "", section: "overview" },
    { key: "possession", label: "Possession", value: property.possessionDetails?.status || property.possession || "", section: "overview" },
    { key: "reraNumber", label: "RERA number", value: property.reraNumber || "", section: "overview" },
    { key: "area", label: "Area", value: property.area || "", section: "overview" },
    { key: "configuration", label: "Configuration", value: configuration, section: "structure" },
    { key: "structure", label: `${property.propertyType || "Property"} structure`, value: structureValue(property), section: "structure" },
    { key: "facing", label: "Facing", value: property.facing || "", section: "structure" },
    { key: "furnishing", label: "Furnishing", value: property.furnishing || "", section: "structure" },
    { key: "parking", label: "Parking", value: property.parking || "", section: "structure" },
    { key: "bedrooms", label: "Bedrooms", value: property.bedrooms ? String(property.bedrooms) : "", section: "structure" },
    { key: "bathrooms", label: "Bathrooms", value: property.bathrooms ? String(property.bathrooms) : "", section: "structure" },
    { key: "amenities", label: "Amenities", value: property.amenities?.join(", ") || "", section: "amenities" },
    { key: "society", label: "Society details", value: joinObject(property.society), section: "society" },
    { key: "locality", label: "Locality details", value: joinObject(property.locality), section: "society" },
  ];
  return fields.filter((field) => field.value);
}

function propertyPresentation(property: Property) {
  return {
    propertyId: property.id,
    image: property.heroImages?.[0] || property.image || "",
    title: property.title,
    builderName: property.builder || "",
    location: property.subtitle || joinObject(property.locality),
    priceText: property.price || "",
    rera: property.reraNumber || "",
    badge: property.badges?.[0] || "Featured",
    linkType: "property" as HeroLinkType,
    linkValue: property.id,
  };
}

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => createBlank());
  const [showForm, setShowForm] = useState(false);
  const [activeSection, setActiveSection] = useState<EditorSection>("overview");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef<HTMLFormElement>(null);
  const propertySelectRef = useRef<HTMLSelectElement>(null);

  const loadSlides = () => setSlides([...getAdminHeroSlides()].sort((a, b) => (a.order || 0) - (b.order || 0)));

  useEffect(() => {
    loadSlides();
    const onHeroChange = () => loadSlides();
    window.addEventListener("cleartitle:hero-changed", onHeroChange);
    fetchProperties({ limit: 100, sort: "-createdAt" })
      .then((data) => setProperties(data.properties as Property[]))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load properties"));
    return () => window.removeEventListener("cleartitle:hero-changed", onHeroChange);
  }, []);

  useEffect(() => {
    if (!showForm) return;
    const frame = window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      propertySelectRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [showForm, form.promotionSlot, editing]);

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === form.propertyId),
    [form.propertyId, properties]
  );
  const availableFields = useMemo(() => propertyFields(selectedProperty), [selectedProperty]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const startAdd = (promotionSlot: PromotionSlot) => {
    setEditing(null);
    setForm(createBlank(promotionSlot));
    setActiveSection("overview");
    setError("");
    setShowForm(true);
  };

  const startEdit = (slide: HeroSlide) => {
    const { id: _id, source: _source, ...rest } = slide;
    void _id;
    void _source;
    setEditing(slide.id);
    setForm({
      ...createBlank(slide.promotionSlot || undefined),
      ...rest,
      propertyId: slide.propertyId || null,
      selectedFields: slide.selectedFields || [],
      fieldOverrides: slide.fieldOverrides || {},
      extraDetails: slide.extraDetails || [],
      additionalInformation: slide.additionalInformation || { enabled: false, values: {} },
    });
    setActiveSection("overview");
    setError("");
    setShowForm(true);
  };

  const selectProperty = (propertyId: string) => {
    if (editing && form.propertyId && propertyId !== form.propertyId) {
      const confirmed = window.confirm("Replace the property in this promotion slot? Existing promotional overrides will be cleared.");
      if (!confirmed) return;
    }
    const assigned = slides.find((slide) =>
      slide.id !== editing
      && slide.promotionSlot
      && slide.propertyId === propertyId
    );
    if (assigned) {
      setError(`This property is already assigned to the ${assigned.promotionSlot} slot.`);
      return;
    }
    const property = properties.find((item) => item.id === propertyId);
    if (!property) {
      set("propertyId", null);
      return;
    }
    const fields = propertyFields(property);
    setForm((current) => ({
      ...current,
      ...propertyPresentation(property),
      selectedFields: current.selectedFields?.length
        ? current.selectedFields.filter((key) => fields.some((field) => field.key === key))
        : fields.slice(0, 6).map((field) => field.key),
      fieldOverrides: {},
    }));
    setError("");
  };

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("image", reader.result as string);
    reader.readAsDataURL(file);
  };

  const setOverride = (key: string, value: string) => {
    set("fieldOverrides", { ...(form.fieldOverrides || {}), [key]: value });
  };

  const resetOverride = (key: string) => {
    const next = { ...(form.fieldOverrides || {}) };
    delete next[key];
    set("fieldOverrides", next);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!form.promotionSlot && !editing) {
      setError("Choose the Diamond, Gold or Silver slot first.");
      return;
    }
    if (form.promotionSlot && !form.propertyId) {
      setError("Select a published property before adding it to the homepage.");
      setActiveSection("overview");
      return;
    }
    if (!form.image || !form.title) {
      setError("A title and banner image are required.");
      return;
    }
    const original = Object.fromEntries(availableFields.map((field) => [field.key, field.value]));
    const valueFor = (key: string, fallback: string) => form.fieldOverrides?.[key]?.trim() || original[key] || fallback;
    const payload: FormState = {
      ...form,
      title: valueFor("title", form.title),
      builderName: valueFor("builder", form.builderName || ""),
      location: valueFor("location", form.location || ""),
      priceText: valueFor("price", form.priceText || ""),
      rera: valueFor("reraNumber", form.rera || ""),
      extraDetails: (form.extraDetails || []).map((detail, index) => ({ ...detail, order: index })),
    };

    setBusy(true);
    try {
      if (editing) await updateHeroSlide(editing, payload);
      else await addHeroSlide(payload);
      setShowForm(false);
      setEditing(null);
      setForm(createBlank());
      loadSlides();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the homepage feature");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove this property from the homepage showcase? The property itself will not be deleted.")) return;
    setBusy(true);
    try {
      await deleteHeroSlide(id);
      loadSlides();
    } finally {
      setBusy(false);
    }
  };

  const toggleSlide = async (slide: HeroSlide, key: "displayOnHomepage" | "published") => {
    setBusy(true);
    try {
      await updateHeroSlide(slide.id, { [key]: slide[key] === false });
      loadSlides();
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full h-11 px-3.5 rounded-xl border border-[#E4E0E7] focus:border-[#DDAA42] outline-none text-[14px] text-[#121B35] bg-white";
  const label = "block text-[12px] font-bold text-[#68646F] mb-1.5";
  const sectionFields = availableFields.filter((field) => field.section === activeSection);
  const propertyImages = selectedProperty
    ? [...new Set([...(selectedProperty.heroImages || []), selectedProperty.image, ...(selectedProperty.images || [])].filter(Boolean))]
    : [];
  const legacySlides = slides.filter((slide) => !slide.promotionSlot);

  return (
    <AdminLayout>
      <div className="mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}>Homepage Promotional Properties</h1>
          <p className="mt-1 text-[14px] text-[#68646F]">Manage each ranked homepage slot independently. Empty slots are optional.</p>
        </div>
      </div>

      {error && !showForm && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">{error}</div>}

      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        {slots.map((slot) => {
          const slide = slides.find((item) => item.promotionSlot === slot.id);
          return (
            <div key={slot.id} className={`relative overflow-hidden rounded-2xl bg-white p-4 ${promotionFrameClass(slot.id)} ${slide && (slide.displayOnHomepage === false || slide.published === false) ? "opacity-65" : ""}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#68646F]">{slot.label} slot</p>
                  <p className="text-[15px] font-bold text-[#121B35]">Public rank {promotionRankLabel(slot.id)}</p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-[11px] font-black shadow-sm ${promotionBadgeClass(slot.id)}`}>{promotionRankLabel(slot.id)}</span>
              </div>

              {slide ? (
                <>
                  <div className="relative h-36 overflow-hidden rounded-xl bg-[#F3F1F5]">
                    <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10">
                      <p className="truncate text-[14px] font-bold text-white">{slide.title}</p>
                      <p className="truncate text-[11px] text-white/75">{slide.location || slide.builderName}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${slide.displayOnHomepage !== false && slide.published !== false ? "bg-emerald-50 text-emerald-700" : "bg-[#F3F1F5] text-[#68646F]"}`}>
                      {slide.displayOnHomepage !== false && slide.published !== false ? "Active" : "Hidden"}
                    </span>
                    <div className="flex gap-1">
                      <button disabled={busy} onClick={() => toggleSlide(slide, "displayOnHomepage")} className={`flex size-9 items-center justify-center rounded-lg ${slide.displayOnHomepage === false ? "bg-[#F3F1F5] text-[#68646F]" : "bg-emerald-50 text-emerald-700"}`} aria-label={`Toggle ${slot.label} homepage display`}>
                        {slide.displayOnHomepage === false ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                      <button disabled={busy} onClick={() => startEdit(slide)} className="flex size-9 items-center justify-center rounded-lg bg-[#F8F7FA] text-[#121B35]" aria-label={`Edit ${slot.label}`}><Pencil className="size-4" /></button>
                      <button disabled={busy} onClick={() => remove(slide.id)} className="flex size-9 items-center justify-center rounded-lg bg-[#FDEEEE] text-[#C0392B]" aria-label={`Remove ${slot.label}`}><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                </>
              ) : (
                <button type="button" onClick={() => startAdd(slot.id)} className="flex h-48 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#C9C5CF] bg-[#F8F7FA]/60 text-[#68646F] transition hover:border-[#DDAA42] hover:bg-white">
                  <Plus className="mb-2 size-6 text-[#DDAA42]" />
                  <span className="text-[13px] font-bold text-[#121B35]">Add property</span>
                  <span className="mt-1 text-[11px]">This slot is optional</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {legacySlides.length > 0 && (
        <div className="mb-8 rounded-2xl border border-[#E4E0E7] bg-white p-4">
          <p className="text-[13px] font-bold text-[#121B35]">Legacy homepage slides</p>
          <p className="mt-1 text-[11px] text-[#68646F]">These remain available as the fallback when no ranked slot is active.</p>
          <div className="mt-3 space-y-2">
            {legacySlides.map((slide) => (
              <div key={slide.id} className="flex items-center gap-3 rounded-xl bg-[#F8F7FA] p-2.5">
                <img src={slide.image} alt="" className="h-12 w-20 rounded-lg object-cover" />
                <p className="min-w-0 flex-1 truncate text-[12px] font-bold text-[#121B35]">{slide.title}</p>
                <button type="button" onClick={() => startEdit(slide)} className="flex size-8 items-center justify-center rounded-lg bg-white text-[#121B35]"><Pencil className="size-3.5" /></button>
                <button type="button" onClick={() => remove(slide.id)} className="flex size-8 items-center justify-center rounded-lg bg-[#FDEEEE] text-[#C0392B]"><Trash2 className="size-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <form ref={editorRef} onSubmit={save} className="scroll-mt-24 overflow-hidden rounded-2xl border border-[#DDAA42]/60 bg-white shadow-lg ring-2 ring-[#DDAA42]/10">
          <div className="flex items-center justify-between border-b border-[#E4E0E7] px-5 py-4">
            <div>
              <h2 className="text-[18px] font-bold text-[#121B35]">
                {editing ? "Edit" : "Add"} {form.promotionSlot ? `${form.promotionSlot[0].toUpperCase()}${form.promotionSlot.slice(1)}` : "legacy"} property
              </h2>
              <p className="mt-0.5 text-[12px] text-[#68646F]">Current property values stay live; only fields entered as overrides are stored here.</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="flex size-9 items-center justify-center rounded-lg bg-[#F8F7FA] text-[#68646F]"><X className="size-4" /></button>
          </div>

          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)]">
            <nav className="border-b border-[#E4E0E7] bg-[#F8F7FA]/70 p-3 lg:border-b-0 lg:border-r">
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
                {editorSections.map((section) => (
                  <button key={section.id} type="button" onClick={() => setActiveSection(section.id)} className={`rounded-xl px-3 py-2.5 text-left text-[12px] font-bold transition ${activeSection === section.id ? "bg-[#121B35] text-white" : "text-[#68646F] hover:bg-white"}`}>
                    {section.label}
                  </button>
                ))}
              </div>
            </nav>

            <div className="min-h-[470px] p-5 md:p-7">
              {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">{error}</div>}

              {activeSection === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#121B35]">Select a published property</h3>
                    <p className="mt-1 text-[12px] text-[#68646F]">Current property data is inherited automatically and can be overridden independently.</p>
                  </div>
                  <div>
                    <label className={label}>Property *</label>
                    <select ref={propertySelectRef} className={input} value={form.propertyId || ""} onChange={(event) => selectProperty(event.target.value)} disabled={Boolean(editing && !form.propertyId)}>
                      <option value="">Choose a property</option>
                      {properties.map((property) => <option key={property.id} value={property.id}>{property.title} — {property.subtitle}</option>)}
                    </select>
                    {editing && !form.propertyId && <p className="mt-1.5 text-[11px] text-[#68646F]">This is a legacy manual slide. Its existing settings remain available under Display Settings.</p>}
                  </div>
                  {selectedProperty && (
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-700" />
                      <div><p className="text-[13px] font-bold text-emerald-900">{selectedProperty.title}</p><p className="text-[11px] text-emerald-700">{selectedProperty.propertyType} · {selectedProperty.price} · {selectedProperty.subtitle}</p></div>
                    </div>
                  )}
                </div>
              )}

              {(["overview", "structure", "amenities", "society"] as EditorSection[]).includes(activeSection) && selectedProperty && sectionFields.length > 0 && (
                <div className={`${activeSection === "overview" ? "mt-7 border-t border-[#E4E0E7] pt-6" : ""} space-y-4`}>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#121B35]">{editorSections.find((section) => section.id === activeSection)?.label} fields</h3>
                    <p className="mt-1 text-[12px] text-[#68646F]">Leave the override empty to keep using the latest Post Property value.</p>
                  </div>
                  {sectionFields.map((field) => {
                    const override = form.fieldOverrides?.[field.key];
                    return (
                      <div key={field.key} className={`rounded-xl border p-4 ${override !== undefined ? "border-[#DDAA42]/50 bg-[#DDAA42]/5" : "border-[#E4E0E7]"}`}>
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-bold text-[#121B35]">{field.label}</p>
                            <p className="mt-0.5 truncate text-[11px] text-[#68646F]">Property value: {field.value}</p>
                            <div className="mt-3 flex gap-2">
                              <input className={input} value={override ?? ""} onChange={(event) => setOverride(field.key, event.target.value)} placeholder="Optional promotional override" />
                              {override !== undefined && <button type="button" onClick={() => resetOverride(field.key)} className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#E4E0E7] text-[#68646F]" aria-label={`Reset ${field.label}`}><RotateCcw className="size-4" /></button>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeSection !== "overview" && (["structure", "amenities", "society"] as EditorSection[]).includes(activeSection) && !selectedProperty && (
                <div className="rounded-xl border border-dashed border-[#E4E0E7] p-10 text-center text-[13px] text-[#68646F]">Select a property in Overview to configure this section.</div>
              )}

              {activeSection === "photos" && (
                <div className="space-y-6">
                  <div><h3 className="text-[17px] font-bold text-[#121B35]">Homepage image</h3><p className="mt-1 text-[12px] text-[#68646F]">Choose a Post Property image or upload a homepage-only image.</p></div>
                  {propertyImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {propertyImages.slice(0, 9).map((image) => (
                        <button key={image} type="button" onClick={() => set("image", image)} className={`relative h-28 overflow-hidden rounded-xl border-2 ${form.image === image ? "border-[#DDAA42]" : "border-transparent"}`}>
                          <img src={image} alt="" className="h-full w-full object-cover" />
                          {form.image === image && <span className="absolute right-2 top-2 rounded-full bg-[#DDAA42] p-1 text-white"><CheckCircle2 className="size-3" /></span>}
                        </button>
                      ))}
                    </div>
                  )}
                  <div>
                    <label className={label}>Image URL or uploaded image</label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input className={input} value={form.image.startsWith("data:") ? "(uploaded image)" : form.image} onChange={(event) => set("image", event.target.value)} placeholder="Image URL" />
                      <label className="inline-flex h-11 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-[#E4E0E7] px-4 text-[13px] font-semibold text-[#121B35]">
                        <ImagePlus className="size-4 text-[#DDAA42]" /> Upload
                        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                      </label>
                    </div>
                  </div>
                  {form.image && <img src={form.image} alt="Homepage preview" className="h-52 w-full rounded-xl bg-[#F3F1F5] object-cover" />}
                </div>
              )}

              {activeSection === "extra" && (
                <div className="space-y-5">
                  <div><h3 className="text-[17px] font-bold text-[#121B35]">Additional Promotional Information</h3><p className="mt-1 max-w-2xl text-[12px] text-[#68646F]">This reserves an optional extension area for the fields you will define later. No unspecified public inputs are added now.</p></div>
                  <label className="flex items-center justify-between rounded-xl border border-[#E4E0E7] p-5">
                    <span>
                      <span className="block text-[13px] font-bold text-[#121B35]">Enable future additional information</span>
                      <span className="mt-1 block text-[11px] text-[#68646F]">The specific fields and public placement will be added after you provide them.</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={form.additionalInformation?.enabled || false}
                      onChange={(event) => set("additionalInformation", { enabled: event.target.checked, values: form.additionalInformation?.values || {} })}
                      className="size-5 accent-[#DDAA42]"
                    />
                  </label>
                  <div className="rounded-xl border border-dashed border-[#C9C5CF] bg-[#F8F7FA]/60 p-8 text-center">
                    <Layers3 className="mx-auto size-7 text-[#DDAA42]" />
                    <p className="mt-2 text-[13px] font-bold text-[#121B35]">Additional field structure reserved</p>
                    <p className="mt-1 text-[11px] text-[#68646F]">No fields will display publicly until their names, types and positions are confirmed.</p>
                  </div>
                </div>
              )}

              {activeSection === "display" && (
                <div className="space-y-6">
                  <div><h3 className="text-[17px] font-bold text-[#121B35]">Display settings</h3><p className="mt-1 text-[12px] text-[#68646F]">Control homepage visibility and the existing slide destination.</p></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex items-center justify-between rounded-xl border border-[#E4E0E7] p-4"><span><span className="block text-[13px] font-bold text-[#121B35]">Display on homepage</span><span className="text-[11px] text-[#68646F]">Hide without deleting this configuration</span></span><input type="checkbox" checked={form.displayOnHomepage !== false} onChange={(event) => set("displayOnHomepage", event.target.checked)} className="size-5 accent-[#DDAA42]" /></label>
                    <label className="flex items-center justify-between rounded-xl border border-[#E4E0E7] p-4"><span><span className="block text-[13px] font-bold text-[#121B35]">Published</span><span className="text-[11px] text-[#68646F]">Keep as a draft until ready</span></span><input type="checkbox" checked={form.published !== false} onChange={(event) => set("published", event.target.checked)} className="size-5 accent-[#DDAA42]" /></label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><label className={label}>Badge</label><input className={input} value={form.badge || ""} onChange={(event) => set("badge", event.target.value)} placeholder="Featured" /></div>
                    <div><label className={label}>CTA text</label><input className={input} value={form.ctaText || ""} onChange={(event) => set("ctaText", event.target.value)} placeholder="Explore Now" /></div>
                    <div className="sm:col-span-2"><label className={label}>Tagline</label><input className={input} value={form.tagline || ""} onChange={(event) => set("tagline", event.target.value)} placeholder="Optional homepage-only tagline" /></div>
                    {!form.propertyId && (
                      <>
                        <div><label className={label}>Legacy slide title</label><input className={input} value={form.title} onChange={(event) => set("title", event.target.value)} /></div>
                        <div><label className={label}>Legacy slide location</label><input className={input} value={form.location || ""} onChange={(event) => set("location", event.target.value)} /></div>
                        <div><label className={label}>Link type</label><select className={input} value={form.linkType} onChange={(event) => set("linkType", event.target.value as HeroLinkType)}><option value="builder">Builder page</option><option value="property">Property page</option><option value="custom">Custom URL</option></select></div>
                        <div><label className={label}>Link value</label><input className={input} value={form.linkValue} onChange={(event) => set("linkValue", event.target.value)} /></div>
                      </>
                    )}
                  </div>
                  {form.image && (
                    <div className={`overflow-hidden rounded-xl ${promotionFrameClass(form.promotionSlot)}`}>
                      <div className="relative h-48 bg-[#0B1328]"><img src={form.image} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />{form.promotionSlot && <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black ${promotionBadgeClass(form.promotionSlot)}`}>{promotionRankLabel(form.promotionSlot)}</span>}<div className="absolute bottom-4 left-4 text-white"><p className="text-[18px] font-bold">{form.fieldOverrides?.title || selectedProperty?.title || form.title}</p><p className="text-[12px] text-white/80">{form.fieldOverrides?.location || selectedProperty?.subtitle || form.location}</p></div></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#E4E0E7] px-5 py-4">
            <button type="submit" disabled={busy} className="btn-gold h-12 rounded-xl px-6 text-[14px] font-bold disabled:opacity-60">{busy ? "Saving…" : editing ? "Save changes" : "Add to homepage"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="h-12 rounded-xl border border-[#E4E0E7] px-6 text-[14px] font-bold text-[#121B35]">Cancel</button>
            <div className="ml-auto hidden items-center gap-2 text-[11px] font-semibold text-[#68646F] sm:flex"><Layers3 className="size-4 text-[#DDAA42]" /> Source property remains unchanged</div>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
