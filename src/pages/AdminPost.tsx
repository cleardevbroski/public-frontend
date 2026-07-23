"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import PropertyForm from "@/components/admin/PropertyForm";
import { fetchAdminProperty } from "@/lib/api";
import type { Property } from "@/components/acres/mock-data";

export default function PostPropertyPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(Boolean(editId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editId) {
      setProperty(null);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    fetchAdminProperty(editId)
      .then((data) => {
        if (!cancelled) setProperty(data.property as Property);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load property.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editId]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1
          className="text-[28px] font-bold text-[#121B35]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {editId ? "Edit Property" : "Post New Property"}
        </h1>
        <p className="text-[14px] text-[#68646F] mt-1">
          {editId ? "Update this property listing. Its current publication status will be kept." : "Fill in the details to publish a new property listing"}
        </p>
      </div>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="size-8 rounded-full border-3 border-[#DDAA42] border-t-transparent animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</div>
      ) : (
        <PropertyForm key={editId || "new"} initialData={property || undefined} submissionId={editId || undefined} />
      )}
    </AdminLayout>
  );
}
