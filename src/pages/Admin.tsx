"use client";

import { useState, useEffect } from "react";
import Link from "@/components/Link";
import {
  PlusCircle,
  Building2,
  TrendingUp,
  Clock,
  BarChart3,
  Sparkles,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import PropertyTable from "@/components/admin/PropertyTable";
import { fetchAdminProperties } from "@/lib/api";
import { isAdminAuthed } from "@/lib/adminAuth";
import type { Property } from "@/components/acres/mock-data";

export default function AdminDashboard() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [adminProperties, setAdminProperties] = useState<Property[]>([]);
  const [counts, setCounts] = useState({ total: 0, admin: 0, mock: 0, published: 0, pending: 0 });
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchAdminProperties({ limit: 1000 });
      const properties: Property[] = data.properties;
      setAllProperties(properties);
      
      const adminProps = properties.filter((p) => p.postedBy?.role === "admin" || (!p.postedBy && p.source === "admin"));
      setAdminProperties(adminProps);

      const published = properties.filter((p) => ["approved", "published"].includes(p.status || "") || (!p.status && p.published !== false)).length;
      setCounts({
        total: properties.length,
        admin: adminProps.length,
        mock: 0,
        published,
        pending: properties.length - published,
      });
    } catch (error) {
      console.error(error);
      setLoadError(error instanceof Error ? error.message : "Unable to load properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const refreshWhenAuthenticated = () => {
      // AdminDashboard mounts behind AdminLayout, so its first effect can run
      // before an admin signs in. Do not make an unauthenticated request; retry
      // as soon as AdminLayout's successful login broadcasts this event.
      if (!isAdminAuthed()) return;
      loadData().finally(() => setMounted(true));
    };

    refreshWhenAuthenticated();
    window.addEventListener("cleartitle:admin-auth-changed", refreshWhenAuthenticated);
    return () => window.removeEventListener("cleartitle:admin-auth-changed", refreshWhenAuthenticated);
  }, []);

  if (!mounted || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-[#DDAA42] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-[28px] font-bold text-[#121B35]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Dashboard
          </h1>
          <p className="text-[14px] text-[#68646F] mt-1">
            Manage your property listings
          </p>
        </div>
        <Link
          href="/admin/post"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DDAA42] to-[#273559] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#B98428] hover:to-[#DDAA42] transition-all duration-200 text-[14px]"
        >
          <PlusCircle className="w-5 h-5" />
          Post New Property
        </Link>
      </div>

      {loadError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {loadError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E4E0E7]/30 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#EEEFF4] to-[#E1E3EC] rounded-xl flex items-center justify-center group-hover:shadow-md transition-all">
              <Building2 className="w-5 h-5 text-[#DDAA42]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#DDAA42]" />
          </div>
          <p className="text-[28px] font-bold text-[#121B35]">{counts.total}</p>
          <p className="text-[13px] text-[#68646F]">Total Properties</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E4E0E7]/30 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FFF0ED] to-[#FFE0DA] rounded-xl flex items-center justify-center group-hover:shadow-md transition-all">
              <Sparkles className="w-5 h-5 text-[#F2C052]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#DDAA42]" />
          </div>
          <p className="text-[28px] font-bold text-[#121B35]">{counts.admin}</p>
          <p className="text-[13px] text-[#68646F]">Admin Posted</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E4E0E7]/30 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FFF8E8] to-[#FAEBC8] rounded-xl flex items-center justify-center group-hover:shadow-md transition-all">
              <BarChart3 className="w-5 h-5 text-[#DDAA42]" />
            </div>
          </div>
          <p className="text-[28px] font-bold text-[#121B35]">{counts.published}</p>
          <p className="text-[13px] text-[#68646F]">Live on Site</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E4E0E7]/30 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#F3F1F5] to-[#F3F1F5] rounded-xl flex items-center justify-center group-hover:shadow-md transition-all">
              <Clock className="w-5 h-5 text-[#B98428]" />
            </div>
          </div>
          <p className="text-[28px] font-bold text-[#121B35]">{counts.pending}</p>
          <p className="text-[13px] text-[#68646F]">Pending Approval</p>
        </div>
      </div>

      {/* Properties Table */}
      <div>
        <h2
          className="text-[18px] font-bold text-[#121B35] mb-4"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          All Properties
        </h2>
        <PropertyTable
          properties={allProperties}
          adminProperties={adminProperties}
          onPropertyDeleted={loadData}
        />
      </div>
    </AdminLayout>
  );
}
