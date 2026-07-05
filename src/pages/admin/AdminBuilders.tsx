"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Search, ShieldCheck, Star } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchBuilders, createBuilder, updateBuilder, deleteBuilder } from "@/lib/api";

type Builder = {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  established: string;
  description: string;
  city: string;
  projectCount: number;
  verified: boolean;
  featured: boolean;
};

type FormState = Omit<Builder, "_id" | "slug">;

const blank: FormState = {
  name: "",
  logo: "",
  established: "",
  description: "",
  city: "",
  projectCount: 0,
  verified: false,
  featured: false,
};

export default function AdminBuilders() {
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetchBuilders();
      setBuilders(res.data || []);
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

  const startEdit = (b: Builder) => {
    setEditing(b._id);
    const { _id: __id, slug: _slug, ...rest } = b;
    void __id; void _slug;
    setForm({ ...blank, ...rest });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateBuilder(editing, form);
      } else {
        await createBuilder(form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      alert("Failed to save builder");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this builder?")) return;
    await deleteBuilder(id);
    load();
  };

  const filtered = builders.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  const input = "w-full h-11 px-3.5 rounded-xl border border-[#D5DEF2] focus:border-[#C9A24E] outline-none text-[14px] text-[#1E3A8A] bg-white";
  const label = "block text-[12px] font-bold text-[#6E7488] mb-1.5";

  if (!mounted) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E3A8A]" style={{ fontFamily: "var(--font-outfit)" }}>
            Builders
          </h1>
          <p className="text-[14px] text-[#6E7488] mt-1">Manage real estate developers</p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A24E] to-[#E3C25A] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-[14px]"
        >
          <Plus className="size-5" /> Add Builder
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#D5DEF2]/30 overflow-hidden">
        <div className="p-4 border-b border-[#D5DEF2]/30 flex gap-4 items-center">
          <div className="flex-1 max-w-md flex items-center gap-2 bg-[#F1F5FF] rounded-xl px-4 py-2.5 border border-[#D5DEF2]/30 focus-within:border-[#C9A24E]/40">
            <Search className="size-4 text-[#6E7488]" />
            <input
              type="text"
              placeholder="Search by builder name..."
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
                <th className="px-6 py-4 font-medium">Builder Name</th>
                <th className="px-6 py-4 font-medium">City</th>
                <th className="px-6 py-4 font-medium">Projects</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5DEF2]/30">
              {loading && <tr><td colSpan={5} className="px-6 py-8 text-center text-[#6E7488]">Loading...</td></tr>}
              {!loading && filtered.map((b) => (
                <tr key={b._id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#E8C66A]/20 flex items-center justify-center font-bold text-[#C9A24E] overflow-hidden">
                        {b.logo ? <img src={b.logo} alt="" className="size-full object-cover" /> : b.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-[#1E3A8A] text-[14px]">{b.name}</div>
                        <div className="text-[12.5px] text-[#6E7488]">Est. {b.established || "N/A"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#1E3A8A]">{b.city || "-"}</td>
                  <td className="px-6 py-4 text-[13px] text-[#1E3A8A] font-bold">{b.projectCount}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {b.verified && <span className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded"><ShieldCheck className="size-3" /> Verified</span>}
                      {b.featured && <span className="flex items-center gap-1 text-[11px] font-bold text-[#C9A24E] bg-[#C9A24E]/10 px-2 py-1 rounded"><Star className="size-3" /> Featured</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(b)} className="p-2 text-[#6E7488] hover:text-[#C9A24E] hover:bg-[#F1F5FF] rounded-lg transition-colors">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => remove(b._id)} className="p-2 text-[#6E7488] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#6E7488] text-[14px]">
                    No builders found.
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
              <h2 className="text-[18px] font-bold text-[#1E3A8A]">{editing ? "Edit Builder" : "Add Builder"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#6E7488] hover:text-[#1E3A8A]">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={label}>Name *</label>
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={input} placeholder="e.g. Prestige Group" />
                </div>
                <div>
                  <label className={label}>Established Year</label>
                  <input value={form.established || ""} onChange={(e) => set("established", e.target.value)} className={input} placeholder="e.g. 1986" />
                </div>
                <div>
                  <label className={label}>City</label>
                  <input value={form.city || ""} onChange={(e) => set("city", e.target.value)} className={input} placeholder="e.g. Bangalore" />
                </div>
                <div>
                  <label className={label}>Project Count</label>
                  <input type="number" value={form.projectCount} onChange={(e) => set("projectCount", parseInt(e.target.value) || 0)} className={input} />
                </div>
                <div>
                  <label className={label}>Logo URL</label>
                  <input value={form.logo || ""} onChange={(e) => set("logo", e.target.value)} className={input} placeholder="https://..." />
                </div>
                <div className="col-span-2 flex gap-6 mt-2">
                  <label className="flex items-center gap-2 text-[14px] text-[#1E3A8A] font-bold cursor-pointer">
                    <input type="checkbox" checked={form.verified} onChange={(e) => set("verified", e.target.checked)} className="size-4 accent-[#C9A24E]" />
                    Verified Builder
                  </label>
                  <label className="flex items-center gap-2 text-[14px] text-[#1E3A8A] font-bold cursor-pointer">
                    <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="size-4 accent-[#C9A24E]" />
                    Featured Builder
                  </label>
                </div>
                <div className="col-span-2">
                  <label className={label}>Description</label>
                  <textarea
                    value={form.description || ""}
                    onChange={(e) => set("description", e.target.value)}
                    className={`${input} h-24 py-3 resize-none`}
                    placeholder="Short description about the developer..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#D5DEF2]">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-[14px] text-[#6E7488] hover:bg-[#E2E9FB] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 btn-gold rounded-xl font-bold text-[14px] shadow-md disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Builder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
