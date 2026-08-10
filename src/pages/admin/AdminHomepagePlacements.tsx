"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, LayoutGrid, MapPin, Search, Sparkles } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import type { Property } from "@/components/acres/mock-data";
import { fetchAdminProperties } from "@/lib/api";
import {
  getHomepageSections,
  getBangaloreZone,
  BANGALORE_ZONES,
  HOMEPAGE_SECTIONS,
  type BangaloreZone,
  type HomepageSection,
} from "@/lib/homepagePlacements";
import { updateProperty } from "@/lib/propertyStore";

export default function AdminHomepagePlacements() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminProperties({ limit: 1000, sort: "-createdAt" })
      .then((data) => setProperties(data.properties as Property[]))
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Unable to load properties")
      )
      .finally(() => setLoading(false));
  }, []);

  const visibleProperties = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return properties;
    return properties.filter((property) =>
      [property.title, property.subtitle, property.builder, property.propertyType, property.locality?.zone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [properties, search]);

  const placementCounts = useMemo(
    () =>
      Object.fromEntries(
        HOMEPAGE_SECTIONS.map((section) => [
          section.id,
          properties.filter((property) => getHomepageSections(property).includes(section.id)).length,
        ])
      ) as Record<HomepageSection, number>,
    [properties]
  );

  const handpickedZoneCounts = useMemo(
    () => Object.fromEntries(
      BANGALORE_ZONES.map((zone) => [
        zone,
        properties.filter(
          (property) =>
            getHomepageSections(property).includes("Handpicked") &&
            getBangaloreZone(property.locality?.zone) === zone
        ).length,
      ])
    ) as Record<BangaloreZone, number>,
    [properties]
  );

  const togglePlacement = async (property: Property, section: HomepageSection) => {
    const current = getHomepageSections(property);
    const homepageSections = current.includes(section)
      ? current.filter((item) => item !== section)
      : [...current, section];

    setSavingId(property.id);
    setError("");
    try {
      const saved = await updateProperty(property.id, {
        homepageSections,
        websiteSection: "None",
      });
      setProperties((items) =>
        items.map((item) =>
          item.id === property.id
            ? {
                ...item,
                ...(saved || {}),
                homepageSections,
                websiteSection: "None",
              }
            : item
        )
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to update homepage placement"
      );
    } finally {
      setSavingId("");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-[#B98428]">
            <LayoutGrid className="size-4" /> Homepage management
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-[#121B35] md:text-[30px]">
            Homepage Placement
          </h1>
          <p className="mt-1 max-w-2xl text-[13px] text-[#68646F]">
            See every property&apos;s homepage sections and place one property in multiple
            sections.
          </p>
        </div>

        <label className="flex h-11 w-full items-center gap-2 rounded-xl border border-[#E4E0E7] bg-white px-3.5 shadow-sm lg:w-[320px]">
          <Search className="size-4 text-[#77717E]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search property, builder or location"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#121B35] outline-none"
          />
        </label>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-7">
        {HOMEPAGE_SECTIONS.map((section) => (
          <div
            key={section.id}
            className="rounded-xl border border-[#E4E0E7]/70 bg-white px-3.5 py-3 shadow-sm"
          >
            <p className="line-clamp-2 min-h-8 text-[11px] font-bold leading-4 text-[#68646F]">
              {section.label}
            </p>
            <p className="mt-1 text-[22px] font-extrabold leading-none text-[#121B35]">
              {placementCounts[section.id]}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-5 rounded-2xl border border-[#E4E0E7]/80 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="size-4 text-[#B98428]" />
          <div>
            <h2 className="text-[14px] font-bold text-[#121B35]">Featured Handpicked Projects by zone</h2>
            <p className="text-[11px] text-[#77717E]">A selected property appears under the public tab matching its saved zone.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BANGALORE_ZONES.map((zone) => (
            <div key={zone} className="rounded-xl bg-[#F8F7FA] px-3 py-2.5">
              <p className="text-[11px] font-semibold text-[#68646F]">{zone} Bangalore</p>
              <p className="mt-0.5 text-xl font-extrabold text-[#121B35]">{handpickedZoneCounts[zone]}</p>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#E4E0E7]/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E4E0E7]/70 px-4 py-3.5">
          <div>
            <h2 className="text-[15px] font-bold text-[#121B35]">Property placement matrix</h2>
            <p className="text-[11px] text-[#77717E]">
              Select any number of sections for each property.
            </p>
          </div>
          <span className="rounded-full bg-[#FFF8E8] px-2.5 py-1 text-[11px] font-bold text-[#8A6414]">
            {visibleProperties.length} properties
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-3 border-[#DDAA42] border-t-transparent" />
          </div>
        ) : visibleProperties.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Sparkles className="mx-auto size-7 text-[#DDAA42]" />
            <p className="mt-2 text-[14px] font-bold text-[#121B35]">No properties found</p>
            <p className="text-[12px] text-[#77717E]">Try a different search.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E0E7]/65">
            {visibleProperties.map((property) => {
              const assigned = getHomepageSections(property);
              const saving = savingId === property.id;
              const zone = getBangaloreZone(property.locality?.zone);
              const handpickedWithoutPublicZone = assigned.includes("Handpicked") && !zone;
              return (
                <article
                  key={property.id}
                  className="grid gap-3 px-4 py-4 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={property.image}
                      alt=""
                      className="size-14 shrink-0 rounded-xl bg-[#F3F4F6] object-cover"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[13.5px] font-bold text-[#121B35]">
                          {property.title || "Untitled property"}
                        </h3>
                        {property.published === false && (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[11.5px] text-[#77717E]">
                        {[property.subtitle, property.propertyType].filter(Boolean).join(" · ")}
                      </p>
                      <p className={`mt-0.5 inline-flex items-center gap-1 text-[10.5px] font-semibold ${zone ? "text-[#315F8C]" : "text-amber-700"}`}>
                        {handpickedWithoutPublicZone && <AlertTriangle className="size-3" />}
                        {zone ? `${zone} Bangalore` : property.locality?.zone ? `${property.locality.zone} (not shown in public tabs)` : "Zone required for Handpicked"}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-[#B98428]">
                        {assigned.length
                          ? `${assigned.length} section${assigned.length === 1 ? "" : "s"}`
                          : "Not placed"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                    {HOMEPAGE_SECTIONS.map((section) => {
                      const selected = assigned.includes(section.id);
                      const missingHandpickedZone = section.id === "Handpicked" && !zone && !selected;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          disabled={saving || missingHandpickedZone}
                          onClick={() => togglePlacement(property, section.id)}
                          title={missingHandpickedZone ? "Choose East, West, South, or North in the property Zone field first." : undefined}
                          className={`flex min-h-11 items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[10.5px] font-bold leading-3.5 transition ${
                            selected
                              ? "border-[#DDAA42] bg-[#FFF8E8] text-[#6E4F0D]"
                              : "border-[#E4E0E7] bg-white text-[#68646F] hover:border-[#DDAA42]/60"
                          } disabled:opacity-50`}
                          aria-pressed={selected}
                        >
                          <span
                            className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                              selected
                                ? "border-[#DDAA42] bg-[#DDAA42] text-[#0B1328]"
                                : "border-[#C9C5CE] bg-white"
                            }`}
                          >
                            {selected && <Check className="size-3" />}
                          </span>
                          <span>{section.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
