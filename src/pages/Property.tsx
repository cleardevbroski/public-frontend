"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropertyDetail from "@/components/acres/PropertyDetail";
import { cityListings } from "@/components/acres/mock-data";
import type { Property } from "@/components/acres/mock-data";

export default function PropertyPage() {
  const params = useParams();
  const id = params?.id as string;
  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Check mock data first
    const allMockProperties = Object.values(cityListings).flat();
    let found = allMockProperties.find((p) => p.id === id);

    // Check localStorage (admin-posted properties)
    if (!found) {
      try {
        const stored = localStorage.getItem("cleartitle_admin_properties");
        if (stored) {
          const adminProperties: Property[] = JSON.parse(stored);
          found = adminProperties.find((p) => p.id === id);
        }
      } catch {
        // ignore parse errors
      }
    }

    if (found) {
      setProperty(found);
      // Get related properties
      const related = (cityListings.Bangalore || [])
        .filter((p) => p.id !== id)
        .slice(0, 4);
      setRelatedProperties(related);
    } else {
      setNotFound(true);
    }

    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#C9A24E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-[#6E7488]">Loading property...</p>
        </div>
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen bg-[#F1F5FF] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-[24px] font-bold text-[#1E3A8A] mb-2">Property Not Found</h1>
          <p className="text-[14px] text-[#6E7488]">The property you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return <PropertyDetail property={property} relatedProperties={relatedProperties} />;
}
