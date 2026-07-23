"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { createAdvertisement, deleteAdvertisement, fetchAdvertisements, updateAdvertisement } from "@/lib/api";

type Advertisement = { id: string; image: string; alt: string; link: string; placement: "left" | "right"; order: number; active: boolean };
type FormState = Omit<Advertisement, "id">;
const blank: FormState = { image: "", alt: "", link: "", placement: "left", order: 0, active: true };

export default function AdminAdvertisements() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try { setAds((await fetchAdvertisements(true)).advertisements || []); } catch (err) { setError(err instanceof Error ? err.message : "Unable to load advertisements."); }
  };
  useEffect(() => { void load(); }, []);

  const upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file.");
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.image) return setError("Upload an advertisement image.");
    setLoading(true); setError("");
    try { await createAdvertisement(form); setForm(blank); await load(); } catch (err) { setError(err instanceof Error ? err.message : "Unable to upload advertisement."); } finally { setLoading(false); }
  };
  const toggle = async (ad: Advertisement) => { await updateAdvertisement(ad.id, { active: !ad.active }); await load(); };
  const remove = async (id: string) => { if (window.confirm("Delete this advertisement?")) { await deleteAdvertisement(id); await load(); } };
  const input = "mt-1.5 w-full rounded-xl border border-[#E4E0E7] px-3.5 py-2.5 text-sm outline-none focus:border-[#DDAA42]";

  return <AdminLayout><div className="mb-8"><h1 className="text-[28px] font-bold text-[#121B35]">Advertisements</h1><p className="mt-1 text-sm text-[#68646F]">Upload ads for the left or right rail on property overview pages. Empty slots remain plain white.</p></div>
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]"><form onSubmit={save} className="rounded-2xl border border-[#E4E0E7] bg-white p-5 shadow-sm space-y-4"><h2 className="font-bold text-[#121B35]">Upload advertisement</h2><label className="block text-xs font-bold text-[#68646F]">Advertisement image<input type="file" accept="image/*" onChange={upload} className="mt-1.5 block w-full text-sm" /></label>{form.image && <img src={form.image} alt="Preview" className="h-48 w-full rounded-xl object-cover" />}<label className="block text-xs font-bold text-[#68646F]">Alt text<input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} placeholder="Describe the advertisement" className={input} /></label><label className="block text-xs font-bold text-[#68646F]">Click-through link (optional)<input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://example.com" className={input} /></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold text-[#68646F]">Placement<select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value as "left" | "right" })} className={input}><option value="left">Left rail</option><option value="right">Right rail</option></select></label><label className="block text-xs font-bold text-[#68646F]">Order<input type="number" min={0} value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className={input} /></label></div>{error && <p className="text-sm text-red-600">{error}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}Upload advertisement</button></form>
      <div className="space-y-4">{ads.length === 0 ? <div className="rounded-2xl border border-dashed border-[#E4E0E7] bg-white p-12 text-center"><ImagePlus className="mx-auto size-10 text-[#B8B1BD]" /><p className="mt-3 font-bold text-[#121B35]">No advertisements uploaded</p></div> : ads.map((ad) => <div key={ad.id} className="flex flex-col gap-4 rounded-2xl border border-[#E4E0E7] bg-white p-4 shadow-sm sm:flex-row"><img src={ad.image} alt={ad.alt} className="h-32 w-full rounded-xl object-cover sm:w-48" /><div className="flex-1"><p className="font-bold text-[#121B35]">{ad.alt || "Advertisement"}</p><p className="mt-1 text-sm text-[#68646F]">{ad.placement} rail · order {ad.order}</p><p className="mt-1 break-all text-xs text-[#68646F]">{ad.link || "No click-through link"}</p><div className="mt-4 flex gap-2"><button onClick={() => void toggle(ad)} className="rounded-lg border border-[#DDAA42] px-3 py-2 text-xs font-bold text-[#121B35]">{ad.active ? "Hide" : "Show"}</button><button onClick={() => void remove(ad.id)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"><Trash2 className="mr-1 inline size-3.5" />Delete</button></div></div></div>)}</div></div>
  </AdminLayout>;
}
