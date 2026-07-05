"use client";

import { useState, useEffect } from "react";
import { LineChart, Users, Eye, ArrowUpRight, Activity, MessageSquare } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchAnalyticsDashboard } from "@/lib/api";

type DashboardStats = {
  totalProperties: number;
  totalLeads: number;
  leadsByStatus: { status: string; count: number }[];
  eventCounts: { eventType: string; count: number }[];
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetchAnalyticsDashboard();
      setStats(res);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    load();
  }, []);

  if (!mounted) return null;

  const totalEvents = stats?.eventCounts.reduce((acc, e) => acc + e.count, 0) || 0;
  const newLeads = stats?.leadsByStatus.find((s) => s.status === "new")?.count || 0;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E3A8A]" style={{ fontFamily: "var(--font-outfit)" }}>
            Analytics Dashboard
          </h1>
          <p className="text-[14px] text-[#6E7488] mt-1">Platform metrics and engagement tracking</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="size-8 border-3 border-[#C9A24E] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5DEF2]/30 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-[#F1F5FF] rounded-xl flex items-center justify-center">
                  <Eye className="size-5 text-[#1E3A8A]" />
                </div>
                <ArrowUpRight className="size-4 text-[#C9A24E]" />
              </div>
              <p className="text-[28px] font-bold text-[#1E3A8A]">{totalEvents}</p>
              <p className="text-[13px] text-[#6E7488]">Total Interactions</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5DEF2]/30 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#FFF0ED] to-[#FFE0DA] rounded-xl flex items-center justify-center">
                  <MessageSquare className="size-5 text-[#E8C66A]" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-[#1E3A8A]">{stats.totalLeads}</p>
              <p className="text-[13px] text-[#6E7488]">Total Leads Generated</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5DEF2]/30 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gradient-to-br from-[#EEF3FE] to-[#E2E9FB] rounded-xl flex items-center justify-center">
                  <Users className="size-5 text-[#A8842C]" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-[#1E3A8A]">{newLeads}</p>
              <p className="text-[13px] text-[#6E7488]">Uncontacted Leads</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#D5DEF2]/30 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-[#F8FAFC] rounded-xl flex items-center justify-center">
                  <Activity className="size-5 text-[#6E7488]" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-[#1E3A8A]">{stats.totalProperties}</p>
              <p className="text-[13px] text-[#6E7488]">Total Properties</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#D5DEF2]/30 overflow-hidden">
              <div className="p-5 border-b border-[#D5DEF2]/30">
                <h2 className="text-[16px] font-bold text-[#1E3A8A] flex items-center gap-2">
                  <LineChart className="size-4 text-[#C9A24E]" />
                  Event Breakdown
                </h2>
              </div>
              <div className="p-5">
                {stats.eventCounts.length === 0 ? (
                  <p className="text-[#6E7488] text-[13px] text-center py-8">No events tracked yet.</p>
                ) : (
                  <div className="space-y-4">
                    {stats.eventCounts.map((e) => (
                      <div key={e.eventType} className="flex items-center justify-between">
                        <span className="text-[14px] text-[#1E3A8A] font-medium">{e.eventType}</span>
                        <span className="text-[14px] font-bold text-[#6E7488]">{e.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#D5DEF2]/30 overflow-hidden">
              <div className="p-5 border-b border-[#D5DEF2]/30">
                <h2 className="text-[16px] font-bold text-[#1E3A8A] flex items-center gap-2">
                  <MessageSquare className="size-4 text-[#C9A24E]" />
                  Leads by Status
                </h2>
              </div>
              <div className="p-5">
                {stats.leadsByStatus.length === 0 ? (
                  <p className="text-[#6E7488] text-[13px] text-center py-8">No leads tracked yet.</p>
                ) : (
                  <div className="space-y-4">
                    {stats.leadsByStatus.map((s) => (
                      <div key={s.status} className="flex items-center justify-between">
                        <span className="text-[14px] text-[#1E3A8A] font-medium capitalize">{s.status}</span>
                        <span className="text-[14px] font-bold text-[#6E7488]">{s.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
