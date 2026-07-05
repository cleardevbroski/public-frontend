"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import PropertyForm from "@/components/admin/PropertyForm";

export default function PostPropertyPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1
          className="text-[28px] font-bold text-[#1E3A8A]"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Post New Property
        </h1>
        <p className="text-[14px] text-[#6E7488] mt-1">
          Fill in the details to publish a new property listing
        </p>
      </div>
      <PropertyForm />
    </AdminLayout>
  );
}
