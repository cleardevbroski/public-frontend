"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Search, Star, Quote } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "@/lib/api";

type Testimonial = {
  _id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
};

type FormState = Omit<Testimonial, "_id">;

const blank: FormState = { name: "", role: "", quote: "", rating: 5 };

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await fetchTestimonials();
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

  const startEdit = (t: Testimonial) => {
    setEditing(t._id);
    const { _id: _omit, ...rest } = t;
    void _omit;
    setForm({ ...blank, ...rest });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role || !form.quote) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateTestimonial(editing, form);
      } else {
        await createTestimonial(form);
      }
      setShowForm(false);
      load();
    } catch {
      alert("Failed to save testimonial");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    await deleteTestimonial(id);
    load();
  };

  const filtered = items.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.role.toLowerCase().includes(search.toLowerCase())
  );

  const input = "w-full h-11 px-3.5 rounded-xl border border-[#D5DEF2] focus:border-[#C9A24E] outline-none text-[14px] text-[#1E3A8A] bg-white";
  const label = "block text-[12px] font-bold text-[#6E7488] mb-1.5";

  if (!mounted) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E3A8A]" style={{ fontFamily: "var(--font-outfit)" }}>
            Testimonials
          </h1>
          <p className="text-[14px] text-[#6E7488] mt-1">Manage customer reviews shown on the homepage</p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A24E] to-[#E3C25A] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-[14px]"
        >
          <Plus className="size-5" /> Add Testimonial
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#D5DEF2]/30 overflow-hidden">
        <div className="p-4 border-b border-[#D5DEF2]/30 flex gap-4 items-center">
          <div className="flex-1 max-w-md flex items-center gap-2 bg-[#F1F5FF] rounded-xl px-4 py-2.5 border border-[#D5DEF2]/30 focus-within:border-[#C9A24E]/40">
            <Search className="size-4 text-[#6E7488]" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-[#1E3A8A] placeholder-[#6E7488] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#D5DEF2]/50 text-[12px] font-bold text-[#6E7488] uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Name / Role</th>
                <th className="px-6 py-4 font-medium">Quote</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5DEF2]/30">
              {loading && <tr><td colSpan={4} className="px-6 py-8 text-center text-[#6E7488]">Loading...</td></tr>}
              {!loading && filtered.map((t) => (
                <tr key={t._id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#1E3A8A] text-[14px]">{t.name}</div>
                    <div className="text-[12.5px] text-[#6E7488]">{t.role}</div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] text-[#6E7488] line-clamp-2 max-w-[360px] flex gap-1.5">
                      <Quote className="size-3.5 shrink-0 text-[#D5DEF2]" /> {t.quote}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#C9A24E]">
                      <Star className="size-3.5 fill-[#C9A24E]" /> {t.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(t)} className="p-2 text-[#6E7488] hover:text-[#C9A24E] hover:bg-[#F1F5FF] rounded-lg transition-colors">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => remove(t._id)} className="p-2 text-[#6E7488] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#6E7488] text-[14px]">
                    No testimonials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[#0B1B43]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="px-6 py-4 border-b border-[#D5DEF2] flex items-center justify-between bg-white rounded-t-2xl">
              <h2 className="text-[18px] font-bold text-[#1E3A8A]">{editing ? "Edit Testimonial" : "Add Testimonial"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#6E7488] hover:text-[#1E3A8A]">
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
                  <label className={label}>Role *</label>
                  <input required value={form.role} onChange={(e) => set("role", e.target.value)} className={input} placeholder="e.g. Home Buyer, Whitefield" />
                </div>
                <div>
                  <label className={label}>Rating (1–5)</label>
                  <input type="number" min={1} max={5} value={form.rating} onChange={(e) => set("rating", parseInt(e.target.value) || 5)} className={input} />
                </div>
                <div className="col-span-2">
                  <label className={label}>Quote *</label>
                  <textarea
                    required
                    value={form.quote}
                    onChange={(e) => set("quote", e.target.value)}
                    className={`${input} h-24 py-3 resize-none`}
                    placeholder="What the customer said..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#D5DEF2]">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-[14px] text-[#6E7488] hover:bg-[#E2E9FB] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 btn-gold rounded-xl font-bold text-[14px] shadow-md disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
