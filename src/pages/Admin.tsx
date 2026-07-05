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
import type { Property } from "@/components/acres/mock-data";

export default function AdminDashboard() {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [adminProperties, setAdminProperties] = useState<Property[]>([]);
  const [counts, setCounts] = useState({ total: 0, admin: 0, mock: 0, published: 0, pending: 0 });
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminProperties({ limit: 1000 });
      const properties: Property[] = data.properties;
      setAllProperties(properties);
      
      const adminProps = properties.filter((p) => p.postedBy?.role === "admin" || (!p.postedBy && p.source === "admin"));
      setAdminProperties(adminProps);

      const published = properties.filter((p) => p.published !== false).length;
      setCounts({
        total: properties.length,
        admin: adminProps.length,
        mock: 0,
        published,
        pending: properties.length - published,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData().then(() => setMounted(true));
  }, []);

  if (!mounted || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-[#C9A24E] border-t-transparent rounded-full animate-spin" />
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
            className="text-[28px] font-bold text-[#1E3A8A]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Dashboard
          </h1>
          <p className="text-[14px] text-[#6E7488] mt-1">
            Manage your property listings
          </p>
        </div>
        <Link
          href="/admin/post"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A24E] to-[#E3C25A] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-[#A8842C] hover:to-[#C9A24E] transition-all duration-200 text-[14px]"
        >
          <PlusCircle className="w-5 h-5" />
          Post New Property
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5DEF2]/30 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#EEEFF4] to-[#E1E3EC] rounded-xl flex items-center justify-center group-hover:shadow-md transition-all">
              <Building2 className="w-5 h-5 text-[#C9A24E]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#C9A24E]" />
          </div>
          <p className="text-[28px] font-bold text-[#1E3A8A]">{counts.total}</p>
          <p className="text-[13px] text-[#6E7488]">Total Properties</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5DEF2]/30 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FFF0ED] to-[#FFE0DA] rounded-xl flex items-center justify-center group-hover:shadow-md transition-all">
              <Sparkles className="w-5 h-5 text-[#E8C66A]" />
            </div>
            <TrendingUp className="w-4 h-4 text-[#C9A24E]" />
          </div>
          <p className="text-[28px] font-bold text-[#1E3A8A]">{counts.admin}</p>
          <p className="text-[13px] text-[#6E7488]">Admin Posted</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5DEF2]/30 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#FAF3E2] to-[#F5EACC] rounded-xl flex items-center justify-center group-hover:shadow-md transition-all">
              <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
            </div>
          </div>
          <p className="text-[28px] font-bold text-[#1E3A8A]">{counts.published}</p>
          <p className="text-[13px] text-[#6E7488]">Live on Site</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5DEF2]/30 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#EEF3FE] to-[#E2E9FB] rounded-xl flex items-center justify-center group-hover:shadow-md transition-all">
              <Clock className="w-5 h-5 text-[#A8842C]" />
            </div>
          </div>
          <p className="text-[28px] font-bold text-[#1E3A8A]">{counts.pending}</p>
          <p className="text-[13px] text-[#6E7488]">Pending Approval</p>
        </div>
      </div>

      {/* Properties Table */}
      <div>
        <h2
          className="text-[18px] font-bold text-[#1E3A8A] mb-4"
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
