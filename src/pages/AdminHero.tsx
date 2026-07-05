"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Trash2, Pencil, Plus, X, ExternalLink, GripVertical } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getAdminHeroSlides,
  addHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  type HeroSlide,
  type HeroLinkType,
} from "@/lib/heroStore";

type FormState = Omit<HeroSlide, "id" | "source">;

const blank: FormState = {
  image: "",
  builderName: "",
  title: "",
  tagline: "",
  location: "",
  priceText: "",
  rera: "",
  badge: "Featured",
  ctaText: "Explore Now",
  linkType: "builder",
  linkValue: "",
};

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [showForm, setShowForm] = useState(false);

  const load = () => setSlides(getAdminHeroSlides());
  useEffect(() => {
    load();
    setMounted(true);
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("image", reader.result as string);
    reader.readAsDataURL(file);
  };

  const startAdd = () => {
    setEditing(null);
    setForm(blank);
    setShowForm(true);
  };

  const startEdit = (s: HeroSlide) => {
    setEditing(s.id);
    const { id: _id, source: _source, ...rest } = s;
    void _id; void _source;
    setForm({ ...blank, ...rest });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image || !form.title) return;
    if (editing) await updateHeroSlide(editing, form);
    else await addHeroSlide(form);
    load();
    setShowForm(false);
    setForm(blank);
    setEditing(null);
  };

  const remove = async (id: string) => {
    await deleteHeroSlide(id);
    load();
  };

  const input = "w-full h-11 px-3.5 rounded-xl border border-[#D5DEF2] focus:border-[#C9A24E] outline-none text-[14px] text-[#1E3A8A] bg-white";
  const label = "block text-[12px] font-bold text-[#6E7488] mb-1.5";

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1E3A8A]" style={{ fontFamily: "var(--font-outfit)" }}>
            Hero Showcase
          </h1>
          <p className="text-[14px] text-[#6E7488] mt-1">
            Manage the homepage banner — feature big projects, builders or properties.
          </p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A24E] to-[#E3C25A] text-white font-semibold rounded-xl shadow-lg hover:from-[#A8842C] hover:to-[#C9A24E] transition-all text-[14px]"
        >
          <Plus className="w-5 h-5" /> Add Slide
        </button>
      </div>

      {mounted && slides.length === 0 && !showForm && (
        <div className="bg-white border border-[#D5DEF2]/40 rounded-2xl p-12 text-center shadow-sm">
          <ImagePlus className="size-12 text-[#D5DEF2] mx-auto mb-3" />
          <p className="text-[16px] font-bold text-[#1E3A8A]">No custom hero slides yet</p>
          <p className="text-[13px] text-[#6E7488] mt-1">
            The homepage is showing the default showcase. Add a slide to override it.
          </p>
          <button onClick={startAdd} className="mt-5 inline-flex items-center gap-2 btn-gold px-6 py-3 rounded-xl text-[13px]">
            <Plus className="size-4" /> Add your first slide
          </button>
        </div>
      )}

      {/* Slide list */}
      {slides.length > 0 && (
        <div className="space-y-3 mb-8">
          {slides.map((s) => (
            <div key={s.id} className="flex items-center gap-4 bg-white border border-[#D5DEF2]/40 rounded-2xl p-3 shadow-sm">
              <GripVertical className="size-5 text-[#D5DEF2] shrink-0 hidden sm:block" />
              <div className="w-28 h-16 rounded-lg overflow-hidden bg-[#E2E9FB] shrink-0">
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[#1E3A8A] truncate">{s.title}</p>
                <p className="text-[12px] text-[#6E7488] truncate">{s.location || s.builderName}</p>
                <p className="text-[11px] text-[#C9A24E] font-semibold mt-0.5 flex items-center gap-1">
                  <ExternalLink className="size-3" /> {s.linkType}: {s.linkValue || "—"}
                </p>
              </div>
              <button onClick={() => startEdit(s)} className="size-9 rounded-lg bg-[#F1F5FF] hover:bg-[#E2E9FB] flex items-center justify-center text-[#1E3A8A]" aria-label="Edit">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => remove(s.id)} className="size-9 rounded-lg bg-[#FDEEEE] hover:bg-[#FBD9D9] flex items-center justify-center text-[#C0392B]" aria-label="Delete">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add / edit form */}
      {showForm && (
        <form onSubmit={save} className="bg-white border border-[#D5DEF2]/40 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[18px] font-bold text-[#1E3A8A]">{editing ? "Edit slide" : "New slide"}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="size-9 rounded-lg bg-[#F1F5FF] flex items-center justify-center text-[#6E7488]">
              <X className="size-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className={label}>Banner image</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input className={input} value={form.image.startsWith("data:") ? "(uploaded image)" : form.image} onChange={(e) => set("image", e.target.value)} placeholder="Image URL" />
                <label className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-[#D5DEF2] cursor-pointer text-[13px] font-semibold text-[#1E3A8A] hover:bg-[#F1F5FF] whitespace-nowrap">
                  <ImagePlus className="size-4 text-[#C9A24E]" /> Upload
                  <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                </label>
              </div>
              {form.image && (
                <div className="mt-3 h-32 rounded-xl overflow-hidden bg-[#E2E9FB]">
                  <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className={label}>Title *</label>
              <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Prestige Lakeside Habitat" required />
            </div>
            <div>
              <label className={label}>Builder / Project name</label>
              <input className={input} value={form.builderName} onChange={(e) => set("builderName", e.target.value)} placeholder="Prestige Group" />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Tagline</label>
              <input className={input} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Lakefront living where every day begins with calm" />
            </div>
            <div>
              <label className={label}>Location / status</label>
              <input className={input} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Varthur, Whitefield — Ready to Move" />
            </div>
            <div>
              <label className={label}>Price text</label>
              <input className={input} value={form.priceText} onChange={(e) => set("priceText", e.target.value)} placeholder="Apartments starting at ₹1.2 Cr" />
            </div>
            <div>
              <label className={label}>RERA no.</label>
              <input className={input} value={form.rera} onChange={(e) => set("rera", e.target.value)} placeholder="PRM/KA/RERA/..." />
            </div>
            <div>
              <label className={label}>Badge</label>
              <input className={input} value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Featured / New Launch" />
            </div>
            <div>
              <label className={label}>CTA text</label>
              <input className={input} value={form.ctaText} onChange={(e) => set("ctaText", e.target.value)} placeholder="Explore Now" />
            </div>
            <div>
              <label className={label}>Link type</label>
              <select className={input} value={form.linkType} onChange={(e) => set("linkType", e.target.value as HeroLinkType)}>
                <option value="builder">Builder page</option>
                <option value="property">Property page</option>
                <option value="custom">Custom URL</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={label}>
                Link value{" "}
                <span className="font-normal text-[#6E7488]">
                  {form.linkType === "builder" ? "(builder slug, e.g. prestige-group)" : form.linkType === "property" ? "(property id)" : "(full URL or path)"}
                </span>
              </label>
              <input className={input} value={form.linkValue} onChange={(e) => set("linkValue", e.target.value)} placeholder={form.linkType === "builder" ? "prestige-group" : form.linkType === "property" ? "blr-3" : "/new-projects-in-bangalore-ffid"} />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn-gold px-6 h-12 rounded-xl font-bold text-[14px]">
              {editing ? "Save changes" : "Add slide"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 h-12 rounded-xl border border-[#D5DEF2] text-[#1E3A8A] font-bold text-[14px]">
              Cancel
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
