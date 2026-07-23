"use client";

import { useEffect, useState } from "react";
import { Clock3, FileText, Filter, ShieldCheck, Smartphone } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchLoginReports } from "@/lib/api";

type LoginReport = { id: string; phone: string; email: string; role: "user" | "admin" | ""; method: string; status: "success" | "failed"; ipAddress: string; userAgent: string; createdAt: string };

export default function AdminLoginReports() {
  const [reports, setReports] = useState<LoginReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("");
  const load = async () => { setLoading(true); try { setReports((await fetchLoginReports({ method })).reports || []); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [method]);
  return <AdminLayout><div className="mb-8"><h1 className="text-[28px] font-bold text-[#121B35]">Login Reports</h1><p className="mt-1 text-sm text-[#68646F]">Authentication audit records for OTP and password sign-ins. Passwords and OTP values are never stored.</p></div>
    <div className="overflow-hidden rounded-2xl border border-[#E4E0E7]/50 bg-white shadow-sm"><div className="flex items-center gap-2 border-b border-[#E4E0E7]/50 bg-[#F8F7FA] p-4"><Filter className="size-4 text-[#68646F]" /><select value={method} onChange={(event) => setMethod(event.target.value)} className="rounded-lg border border-[#E4E0E7] bg-white px-3 py-2 text-sm font-semibold text-[#121B35]"><option value="">All methods</option><option value="otp_requested">OTP requested</option><option value="otp">OTP verified</option><option value="password">Password sign-in</option><option value="password_registration">Password registration</option></select></div><div className="overflow-x-auto"><table className="min-w-[880px] w-full text-left"><thead className="border-b border-[#E4E0E7] bg-[#F8F7FA] text-xs uppercase tracking-wide text-[#68646F]"><tr><th className="px-5 py-4">Time</th><th className="px-5 py-4">Account</th><th className="px-5 py-4">Method</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Source</th></tr></thead><tbody>{loading ? <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-[#68646F]">Loading reports…</td></tr> : reports.map((report) => <tr key={report.id} className="border-b border-[#E4E0E7]/50"><td className="px-5 py-4 text-sm text-[#121B35]"><Clock3 className="mr-1.5 inline size-4 text-[#DDAA42]" />{new Date(report.createdAt).toLocaleString()}</td><td className="px-5 py-4"><p className="font-bold text-[#121B35]">{report.phone || "—"}</p>{report.email && <p className="mt-1 text-xs text-[#68646F]">{report.email}</p>}</td><td className="px-5 py-4"><span className="rounded-full bg-[#121B35]/8 px-2.5 py-1 text-xs font-bold text-[#121B35]">{report.method.replace(/_/g, " ")}</span></td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${report.status === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{report.status}</span></td><td className="px-5 py-4 text-xs text-[#68646F]"><Smartphone className="mr-1 inline size-3.5" />{report.ipAddress || "—"}</td></tr>)}{!loading && reports.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#68646F]"><FileText className="mx-auto mb-3 size-8 text-[#DDAA42]" />No login reports yet.</td></tr>}</tbody></table></div></div>
  </AdminLayout>;
}
