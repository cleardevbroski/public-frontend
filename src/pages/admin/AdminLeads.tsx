"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Calendar, Phone, Mail, Filter, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusControls from "@/components/admin/StatusControls";
import { fetchLeads, updateLeadStatus, deleteLead } from "@/lib/api";

type Lead = {
  _id: string;
  type: "contact" | "consultation";
  name: string;
  email: string;
  phone: string;
  message: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "contact" | "consultation">("all");

  const load = async () => {
    try {
      const res = await fetchLeads();
      setLeads(res.leads || []);
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

  const filtered = leads.filter((l) => filterType === "all" || l.type === filterType);

  const setStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
    await updateLeadStatus(id, status);
    load();
  };
  const remove = async (id: string) => {
    if (!window.confirm("Delete this lead?")) return;
    await deleteLead(id);
    load();
  };

  if (!mounted) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}>
            Leads & Enquiries
          </h1>
          <p className="text-[14px] text-[#68646F] mt-1">Manage contact requests and legal consultations</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E4E0E7]/30 overflow-hidden">
        <div className="p-4 border-b border-[#E4E0E7]/30 flex gap-4 items-center bg-[#F8FAFC]">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E4E0E7]/50 rounded-lg shadow-sm">
            <Filter className="size-4 text-[#68646F]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-[13px] text-[#121B35] font-bold bg-transparent outline-none cursor-pointer"
            >
              <option value="all">All Enquiries</option>
              <option value="contact">Contact Forms</option>
              <option value="consultation">Legal Consultations</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E4E0E7]/50 text-[12px] font-bold text-[#68646F] uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">User Details</th>
                <th className="px-6 py-4 font-medium">Type / Category</th>
                <th className="px-6 py-4 font-medium">Message</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0E7]/30">
              {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-[#68646F]">Loading...</td></tr>}
              {!loading && filtered.map((l) => (
                <tr key={l._id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2 text-[13px] text-[#121B35] font-medium whitespace-nowrap">
                      <Calendar className="size-4 text-[#DDAA42]" />
                      {new Date(l.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="font-bold text-[#121B35] text-[14px]">{l.name}</div>
                    <div className="mt-1 space-y-1">
                      {l.phone && <div className="text-[12px] text-[#68646F] flex items-center gap-1.5"><Phone className="size-3" /> {l.phone}</div>}
                      {l.email && <div className="text-[12px] text-[#68646F] flex items-center gap-1.5"><Mail className="size-3" /> {l.email}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${l.type === 'consultation' ? 'bg-[#121B35]/10 text-[#121B35]' : 'bg-[#DDAA42]/10 text-[#DDAA42]'}`}>
                      {l.type}
                    </span>
                    {l.category && <div className="mt-2 text-[13px] text-[#121B35] font-medium">{l.category}</div>}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className="text-[13px] text-[#68646F] line-clamp-3 max-w-[300px]">
                      {l.message || <span className="italic opacity-50">No message provided.</span>}
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      <StatusControls status={l.status} onChange={(s) => setStatus(l._id, s)} />
                      <button onClick={() => remove(l._id)} className="ml-2 p-1.5 text-[#68646F] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete lead">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#68646F] text-[14px]">
                    <MessageSquare className="size-8 mx-auto mb-3 text-[#E4E0E7]" />
                    No leads or enquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
