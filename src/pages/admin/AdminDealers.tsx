"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Search, Phone, Mail } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusControls from "@/components/admin/StatusControls";
import { getDealers, registerDealer, editDealer, removeDealer, type Dealer } from "@/lib/dealerStore";
import { useLiveData } from "@/lib/useLiveProperties";

type FormState = Omit<Dealer, "id" | "slug" | "source" | "buyersThisWeek" | "memberSince">;

const blank: FormState = {
  name: "",
  agency: "",
  phone: "",
  email: "",
  about: "",
  operatingSince: "",
  localities: [],
  dealsIn: ["RESALE"],
  logo: "",
};

export default function AdminDealers() {
  const dealers = useLiveData(() => getDealers(), [] as Dealer[], ["cleartitle:dealers-changed"]);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const startAdd = () => {
    setEditing(null);
    setForm(blank);
    setShowForm(true);
  };

  const startEdit = (d: Dealer) => {
    setEditing(d.id);
    const { id: _id, slug: _slug, source: _source, memberSince: _ms, buyersThisWeek: _btw, ...rest } = d;
    void _id; void _slug; void _source; void _ms; void _btw;
    setForm({ ...blank, ...rest, localities: rest.localities || [] });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.agency) return;
    setSubmitting(true);
    try {
      if (editing) {
        await editDealer(editing, form);
      } else {
        await registerDealer(form);
      }
      setShowForm(false);
      setForm(blank);
      setEditing(null);
    } catch (err) {
      alert("Failed to save dealer");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this dealer?")) return;
    await removeDealer(id);
  };

  const setStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
    await editDealer(id, { status });
  };

  const filtered = dealers.filter((d) => {
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.agency.toLowerCase().includes(q);
  });

  const input = "w-full h-11 px-3.5 rounded-xl border border-[#E4E0E7] focus:border-[#DDAA42] outline-none text-[14px] text-[#121B35] bg-white";
  const label = "block text-[12px] font-bold text-[#68646F] mb-1.5";

  if (!mounted) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}>
            Dealers
          </h1>
          <p className="text-[14px] text-[#68646F] mt-1">Manage broker and agency profiles</p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DDAA42] to-[#273559] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-[14px]"
        >
          <Plus className="size-5" /> Add Dealer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E4E0E7]/30 overflow-hidden">
        <div className="p-4 border-b border-[#E4E0E7]/30 flex gap-4 items-center">
          <div className="flex-1 max-w-md flex items-center gap-2 bg-[#F8F7FA] rounded-xl px-4 py-2.5 border border-[#E4E0E7]/30 focus-within:border-[#DDAA42]/40">
            <Search className="size-4 text-[#68646F]" />
            <input
              type="text"
              placeholder="Search by name or agency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-[#121B35] placeholder-[#68646F] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E4E0E7]/50 text-[12px] font-bold text-[#68646F] uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Dealer / Agency</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Deal Types</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0E7]/30">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gradient-to-br from-[#DDAA42]/10 to-[#F2C052]/20 flex items-center justify-center font-bold text-[#DDAA42]">
                        {d.logo ? <img src={d.logo} alt="" className="size-full rounded-full object-cover" /> : d.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-[#121B35] text-[14px]">{d.name}</div>
                        <div className="text-[12.5px] text-[#68646F]">{d.agency}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {d.phone && <div className="text-[12.5px] text-[#68646F] flex items-center gap-1.5"><Phone className="size-3" /> {d.phone}</div>}
                      {d.email && <div className="text-[12.5px] text-[#68646F] flex items-center gap-1.5"><Mail className="size-3" /> {d.email}</div>}
                      {!d.phone && !d.email && <span className="text-[12.5px] text-[#68646F] italic">No contact info</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {d.dealsIn.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-[#F8F7FA] text-[#121B35] text-[10px] font-bold">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusControls status={(d as any).status} onChange={(s) => setStatus(d.id, s)} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(d)} className="p-2 text-[#68646F] hover:text-[#DDAA42] hover:bg-[#F8F7FA] rounded-lg transition-colors">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => remove(d.id)} className="p-2 text-[#68646F] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#68646F] text-[14px]">
                    No dealers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[#0B1328]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="px-6 py-4 border-b border-[#E4E0E7] flex items-center justify-between bg-white rounded-t-2xl">
              <h2 className="text-[18px] font-bold text-[#121B35]">{editing ? "Edit Dealer" : "Add Dealer"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#68646F] hover:text-[#121B35]">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Name *</label>
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={input} placeholder="e.g. Rahul Sharma" />
                </div>
                <div>
                  <label className={label}>Agency Name *</label>
                  <input required value={form.agency} onChange={(e) => set("agency", e.target.value)} className={input} placeholder="e.g. RS Properties" />
                </div>
                <div>
                  <label className={label}>Phone Number</label>
                  <input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} className={input} placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className={label}>Email Address</label>
                  <input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} className={input} placeholder="rahul@example.com" />
                </div>
                <div>
                  <label className={label}>Operating Since</label>
                  <input value={form.operatingSince || ""} onChange={(e) => set("operatingSince", e.target.value)} className={input} placeholder="e.g. 2012" />
                </div>
                <div>
                  <label className={label}>Localities (comma separated)</label>
                  <input
                    value={form.localities?.join(", ") || ""}
                    onChange={(e) => set("localities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    className={input}
                    placeholder="Whitefield, Indiranagar"
                  />
                </div>
              </div>
              <div>
                <label className={label}>About / Description</label>
                <textarea
                  value={form.about || ""}
                  onChange={(e) => set("about", e.target.value)}
                  className={`${input} h-24 py-3 resize-none`}
                  placeholder="Short bio or description of the agency..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E4E0E7]">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-[14px] text-[#68646F] hover:bg-[#F3F1F5] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 btn-gold rounded-xl font-bold text-[14px] shadow-md disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Dealer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
