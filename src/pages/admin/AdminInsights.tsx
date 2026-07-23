"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Search, Star, TrendingUp } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusControls from "@/components/admin/StatusControls";
import { fetchInsights, createInsight, updateInsight, deleteInsight } from "@/lib/api";

type Insight = {
  _id: string;
  name: string;
  rating: number;
  pricePerSqft: string;
  yoy: string;
  image: string;
  href: string;
  status?: string;
};

type FormState = Omit<Insight, "_id">;

const blank: FormState = { name: "", rating: 4, pricePerSqft: "", yoy: "", image: "", href: "" };

export default function AdminInsights() {
  const [items, setItems] = useState<Insight[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await fetchInsights();
      setItems(Array.isArray(res) ? res : []);
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

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const startAdd = () => {
    setEditing(null);
    setForm(blank);
    setShowForm(true);
  };

  const startEdit = (i: Insight) => {
    setEditing(i._id);
    const { _id: _omit, ...rest } = i;
    void _omit;
    setForm({ ...blank, ...rest });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.pricePerSqft || !form.yoy || !form.href) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateInsight(editing, form);
      } else {
        await createInsight(form);
      }
      setShowForm(false);
      load();
    } catch {
      alert("Failed to save insight");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this insight?")) return;
    await deleteInsight(id);
    load();
  };

  const setStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
    await updateInsight(id, { status });
    load();
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const input = "w-full h-11 px-3.5 rounded-xl border border-[#E4E0E7] focus:border-[#DDAA42] outline-none text-[14px] text-[#121B35] bg-white";
  const label = "block text-[12px] font-bold text-[#68646F] mb-1.5";

  if (!mounted) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}>
            Insights
          </h1>
          <p className="text-[14px] text-[#68646F] mt-1">Manage locality market insights on the homepage</p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DDAA42] to-[#273559] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-[14px]"
        >
          <Plus className="size-5" /> Add Insight
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E4E0E7]/30 overflow-hidden">
        <div className="p-4 border-b border-[#E4E0E7]/30 flex gap-4 items-center">
          <div className="flex-1 max-w-md flex items-center gap-2 bg-[#F8F7FA] rounded-xl px-4 py-2.5 border border-[#E4E0E7]/30 focus-within:border-[#DDAA42]/40">
            <Search className="size-4 text-[#68646F]" />
            <input
              type="text"
              placeholder="Search by locality name..."
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
                <th className="px-6 py-4 font-medium">Locality</th>
                <th className="px-6 py-4 font-medium">Price / sqft</th>
                <th className="px-6 py-4 font-medium">YoY</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0E7]/30">
              {loading && <tr><td colSpan={6} className="px-6 py-8 text-center text-[#68646F]">Loading...</td></tr>}
              {!loading && filtered.map((i) => (
                <tr key={i._id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-gradient-to-br from-[#DDAA42]/10 to-[#F2C052]/20 flex items-center justify-center font-bold text-[#DDAA42] overflow-hidden">
                        {i.image ? <img src={i.image} alt="" className="size-full object-cover" /> : i.name[0]}
                      </div>
                      <div className="font-bold text-[#121B35] text-[14px]">{i.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#121B35] font-bold">{i.pricePerSqft}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[13px] font-bold text-green-700">
                      <TrendingUp className="size-3.5" /> {i.yoy}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#DDAA42]">
                      <Star className="size-3.5 fill-[#DDAA42]" /> {i.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusControls status={i.status} onChange={(s) => setStatus(i._id, s)} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(i)} className="p-2 text-[#68646F] hover:text-[#DDAA42] hover:bg-[#F8F7FA] rounded-lg transition-colors">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => remove(i._id)} className="p-2 text-[#68646F] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#68646F] text-[14px]">
                    No insights found.
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
              <h2 className="text-[18px] font-bold text-[#121B35]">{editing ? "Edit Insight" : "Add Insight"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#68646F] hover:text-[#121B35]">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={label}>Locality Name *</label>
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={input} placeholder="e.g. Whitefield" />
                </div>
                <div>
                  <label className={label}>Price / sqft *</label>
                  <input required value={form.pricePerSqft} onChange={(e) => set("pricePerSqft", e.target.value)} className={input} placeholder="e.g. ₹7,200" />
                </div>
                <div>
                  <label className={label}>YoY change *</label>
                  <input required value={form.yoy} onChange={(e) => set("yoy", e.target.value)} className={input} placeholder="e.g. +8.5%" />
                </div>
                <div>
                  <label className={label}>Rating (1–5)</label>
                  <input type="number" min={1} max={5} step={0.1} value={form.rating} onChange={(e) => set("rating", parseFloat(e.target.value) || 4)} className={input} />
                </div>
                <div>
                  <label className={label}>Link (href) *</label>
                  <input required value={form.href} onChange={(e) => set("href", e.target.value)} className={input} placeholder="/localities/whitefield" />
                </div>
                <div className="col-span-2">
                  <label className={label}>Image URL</label>
                  <input value={form.image} onChange={(e) => set("image", e.target.value)} className={input} placeholder="https://..." />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E4E0E7]">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-[14px] text-[#68646F] hover:bg-[#F3F1F5] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 btn-gold rounded-xl font-bold text-[14px] shadow-md disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Insight"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
