"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropertyDetail from "@/components/acres/PropertyDetail";
import { cityListings } from "@/components/acres/mock-data";
import type { Property } from "@/components/acres/mock-data";
import { fetchPropertyById } from "@/lib/api";
import { getPublishedProperties } from "@/lib/propertyStore";
import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import { PublicErrorState, PublicPageSkeleton } from "@/components/acres/PublicPageState";

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
      <><Header /><PublicPageSkeleton label="Loading property details" /><Footer /></>
    );
  }

  if (notFound || !property) {
    return (
      <><Header /><PublicErrorState title="Property not found" description="This project may have been removed, unpublished or moved to a different address." actionHref="/property-in-bangalore-ffid" actionLabel="Browse available properties" /><Footer /></>
    );
  }

  return <PropertyDetail property={property} relatedProperties={relatedProperties} />;
}
