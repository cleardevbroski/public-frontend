"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropertyDetail from "@/components/acres/PropertyDetail";
import { cityListings } from "@/components/acres/mock-data";
import type { Property } from "@/components/acres/mock-data";
import { fetchPropertyById } from "@/lib/api";
import { getPublishedProperties } from "@/lib/propertyStore";

export default function PropertyPage() {
  const params = useParams();
  const id = params?.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    async function resolveProperty() {
      // Legacy mock-data properties — still linked from BangalorePages.tsx
      // and LocalProperties.tsx via blr-* ids.
      const allMockProperties = Object.values(cityListings).flat();
      const mockMatch = allMockProperties.find((p) => p.id === id);
      if (mockMatch) {
        if (!cancelled) {
          setProperty(mockMatch);
          setRelatedProperties(
            (cityListings.Bangalore || []).filter((p) => p.id !== id).slice(0, 4)
          );
          setLoading(false);
        }
        return;
      }

      // Real, backend-posted properties (admin or public submissions).
      try {
        const data = await fetchPropertyById(id);
        if (cancelled) return;
        setProperty(data.property as Property);
        setRelatedProperties(
          getPublishedProperties().filter((p) => p.id !== id).slice(0, 4)
        );
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    resolveProperty();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#DDAA42] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-[#68646F]">Loading property...</p>
        </div>
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen bg-[#F8F7FA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[24px] font-bold text-[#121B35] mb-2">Property Not Found</h1>
          <p className="text-[14px] text-[#68646F]">The property you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return <PropertyDetail property={property} relatedProperties={relatedProperties} />;
}
