"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Search, Star, FileCheck2, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusControls from "@/components/admin/StatusControls";
import { fetchAdminLawyers, createLawyer, updateLawyer, deleteLawyer, uploadPropertyMedia } from "@/lib/api";

type Lawyer = {
  _id: string;
  name: string;
  qualification: string;
  college: string;
  graduationYear: string;
  experience: string;
  barCouncil: string;
  rating: number;
  cases: string;
  specialty: string;
  languages: string;
  city: string;
  bio: string;
  whatsappNumber: string;
  legalDocumentType: string;
  legalDocumentNumber: string;
  legalDocumentUrl: string;
  image: string;
  status?: string;
};

type FormState = Omit<Lawyer, "_id">;

const blank: FormState = {
  name: "", qualification: "", college: "", graduationYear: "", experience: "", barCouncil: "",
  rating: 5, cases: "", specialty: "", languages: "", city: "", bio: "", whatsappNumber: "",
  legalDocumentType: "Bar Council Enrollment Certificate", legalDocumentNumber: "", legalDocumentUrl: "", image: "",
};

export default function AdminLawyers() {
  const [items, setItems] = useState<Lawyer[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const load = async () => {
    try {
      const res = await fetchAdminLawyers();
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

  const startEdit = (l: Lawyer) => {
    setEditing(l._id);
    const { _id: _omit, ...rest } = l;
    void _omit;
    setForm({ ...blank, ...rest });
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.qualification || !form.college || !form.experience || !form.barCouncil || !form.cases || !form.specialty || !form.languages || !form.city || !form.whatsappNumber || !form.legalDocumentType || !form.legalDocumentNumber || !form.legalDocumentUrl) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateLawyer(editing, form);
      } else {
        await createLawyer(form);
      }
      setShowForm(false);
      load();
    } catch {
      alert("Failed to save lawyer");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lawyer?")) return;
    await deleteLawyer(id);
    load();
  };

  const setStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
    await updateLawyer(id, { status });
    load();
  };

  const filtered = items.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.specialty.toLowerCase().includes(search.toLowerCase()) || l.college?.toLowerCase().includes(search.toLowerCase())
  );

  const uploadLegalDocument = async (file?: File) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf";
    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if ((!isPdf && !isImage) || file.size > 5 * 1024 * 1024) {
      alert("Verification document must be a PDF, JPG, PNG or WebP file no larger than 5 MB.");
      return;
    }
    setUploadingDocument(true);
    try {
      set("legalDocumentUrl", await uploadPropertyMedia(file, isPdf ? "legal-document-pdf" : "legal-document-image"));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Document upload failed");
    } finally {
      setUploadingDocument(false);
    }
  };

  const input = "w-full h-11 px-3.5 rounded-xl border border-[#E4E0E7] focus:border-[#DDAA42] outline-none text-[14px] text-[#121B35] bg-white";
  const label = "block text-[12px] font-bold text-[#68646F] mb-1.5";

  if (!mounted) return null;

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}>
            Lawyers
          </h1>
          <p className="text-[14px] text-[#68646F] mt-1">Manage the verified legal consultation panel</p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DDAA42] to-[#273559] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-[14px]"
        >
          <Plus className="size-5" /> Add Lawyer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#E4E0E7]/30 overflow-hidden">
        <div className="p-4 border-b border-[#E4E0E7]/30 flex gap-4 items-center">
          <div className="flex-1 max-w-md flex items-center gap-2 bg-[#F8F7FA] rounded-xl px-4 py-2.5 border border-[#E4E0E7]/30 focus-within:border-[#DDAA42]/40">
            <Search className="size-4 text-[#68646F]" />
            <input
              type="text"
              placeholder="Search by name, specialty or college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[14px] text-[#121B35] placeholder-[#68646F] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E4E0E7]/50 text-[12px] font-bold text-[#68646F] uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Lawyer</th>
                <th className="px-6 py-4 font-medium">Specialty</th>
                <th className="px-6 py-4 font-medium">Education</th>
                <th className="px-6 py-4 font-medium">Experience</th>
                <th className="px-6 py-4 font-medium">WhatsApp</th>
                <th className="px-6 py-4 font-medium">Bar Council</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E0E7]/30">
              {loading && <tr><td colSpan={9} className="px-6 py-8 text-center text-[#68646F]">Loading...</td></tr>}
              {!loading && filtered.map((l) => (
                <tr key={l._id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gradient-to-br from-[#DDAA42]/10 to-[#F2C052]/20 flex items-center justify-center font-bold text-[#DDAA42] overflow-hidden">
                        {l.image ? <img src={l.image} alt="" className="size-full object-cover" /> : l.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-[#121B35] text-[14px]">{l.name}</div>
                        <div className="text-[12.5px] text-[#68646F]">{l.cases} cases</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#121B35]">{l.specialty}</td>
                  <td className="px-6 py-4 text-[13px] text-[#68646F]"><span className="block font-semibold text-[#121B35]">{l.qualification || "—"}</span><span className="block max-w-[180px] truncate">{l.college || "—"}</span></td>
                  <td className="px-6 py-4 text-[13px] text-[#68646F]">{l.experience}</td>
                  <td className="px-6 py-4 text-[13px] text-[#68646F] whitespace-nowrap">{l.whatsappNumber || "Not added"}</td>
                  <td className="px-6 py-4 text-[13px] text-[#68646F]">{l.barCouncil}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#DDAA42]">
                      <Star className="size-3.5 fill-[#DDAA42]" /> {l.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusControls status={l.status} onChange={(s) => setStatus(l._id, s)} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(l)} className="p-2 text-[#68646F] hover:text-[#DDAA42] hover:bg-[#F8F7FA] rounded-lg transition-colors">
                        <Pencil className="size-4" />
                      </button>
                      <button onClick={() => remove(l._id)} className="p-2 text-[#68646F] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-[#68646F] text-[14px]">
                    No lawyers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[#0B1328]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-4xl my-auto">
            <div className="px-6 py-4 border-b border-[#E4E0E7] flex items-center justify-between bg-white rounded-t-2xl">
              <h2 className="text-[18px] font-bold text-[#121B35]">{editing ? "Edit Lawyer" : "Add Lawyer"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#68646F] hover:text-[#121B35]">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={label}>Name *</label>
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={input} placeholder="e.g. Adv. Srinivasan" />
                </div>
                <div>
                  <label className={label}>Specialty *</label>
                  <input required value={form.specialty} onChange={(e) => set("specialty", e.target.value)} className={input} placeholder="e.g. Title Verification" />
                </div>
                <div>
                  <label className={label}>Law qualification *</label>
                  <input required value={form.qualification} onChange={(e) => set("qualification", e.target.value)} className={input} placeholder="e.g. B.A. LL.B., LL.M." />
                </div>
                <div>
                  <label className={label}>College / University *</label>
                  <input required value={form.college} onChange={(e) => set("college", e.target.value)} className={input} placeholder="e.g. National Law School of India University" />
                </div>
                <div>
                  <label className={label}>Graduation year</label>
                  <input value={form.graduationYear} onChange={(e) => set("graduationYear", e.target.value.replace(/\D/g, "").slice(0, 4))} className={input} placeholder="e.g. 2010" inputMode="numeric" />
                </div>
                <div>
                  <label className={label}>Experience *</label>
                  <input required value={form.experience} onChange={(e) => set("experience", e.target.value)} className={input} placeholder="e.g. 15+ years" />
                </div>
                <div>
                  <label className={label}>Bar Council *</label>
                  <input required value={form.barCouncil} onChange={(e) => set("barCouncil", e.target.value)} className={input} placeholder="e.g. KA/1234/2008" />
                </div>
                <div>
                  <label className={label}>Cases (count/label) *</label>
                  <input required value={form.cases} onChange={(e) => set("cases", e.target.value)} className={input} placeholder="e.g. 1200+" />
                </div>
                <div>
                  <label className={label}>Rating (1–5)</label>
                  <input type="number" min={1} max={5} value={form.rating} onChange={(e) => set("rating", parseInt(e.target.value) || 5)} className={input} />
                </div>
                <div>
                  <label className={label}>Languages *</label>
                  <input required value={form.languages} onChange={(e) => set("languages", e.target.value)} className={input} placeholder="e.g. English, Kannada, Hindi" />
                </div>
                <div>
                  <label className={label}>Consultation city *</label>
                  <input required value={form.city} onChange={(e) => set("city", e.target.value)} className={input} placeholder="e.g. Bengaluru" />
                </div>
                <div className="col-span-2">
                  <label className={label}>WhatsApp number with country code *</label>
                  <input required value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value.replace(/[^\d+]/g, ""))} className={input} placeholder="e.g. +919876543210" inputMode="tel" pattern="\+?[1-9][0-9]{9,14}" />
                  <p className="mt-1 text-[11px] text-[#68646F]">Property consultation messages will open directly to this number.</p>
                </div>
                <div className="col-span-2">
                  <label className={label}>Image URL</label>
                  <input value={form.image} onChange={(e) => set("image", e.target.value)} className={input} placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className={label}>Public profile / consultation summary</label>
                  <textarea value={form.bio} onChange={(e) => set("bio", e.target.value.slice(0, 1000))} rows={3} className="w-full px-3.5 py-3 rounded-xl border border-[#E4E0E7] focus:border-[#DDAA42] outline-none text-[14px] text-[#121B35] bg-white resize-y" placeholder="Describe title-verification expertise, practice areas and consultation approach." />
                </div>
                <div className="col-span-2 rounded-2xl border border-[#DDAA42]/30 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2"><FileCheck2 className="size-5 text-[#DDAA42]" /><div><h3 className="text-[14px] font-bold text-[#121B35]">Professional verification document *</h3><p className="text-[11px] text-[#68646F]">Stored for admin verification. The document file and number are not displayed publicly.</p></div></div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div><label className={label}>Document type *</label><select required value={form.legalDocumentType} onChange={(e) => set("legalDocumentType", e.target.value)} className={input}><option>Bar Council Enrollment Certificate</option><option>Law Degree Certificate</option><option>Advocate Identity Card</option><option>Government Identity Proof</option><option>Other Professional Document</option></select></div>
                    <div><label className={label}>Document / enrollment number *</label><input required value={form.legalDocumentNumber} onChange={(e) => set("legalDocumentNumber", e.target.value)} className={input} placeholder="Enter the document number" /></div>
                    <div className="md:col-span-2"><label className={label}>Document URL *</label><input required value={form.legalDocumentUrl} onChange={(e) => set("legalDocumentUrl", e.target.value)} className={input} placeholder="Upload a file or paste its secure URL" /></div>
                    <label className="md:col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#DDAA42]/40 bg-[#FFF8E5] px-4 py-4 text-[13px] font-bold text-[#121B35] hover:border-[#DDAA42]">
                      {uploadingDocument ? <Loader2 className="size-4 animate-spin" /> : <FileCheck2 className="size-4 text-[#DDAA42]" />}{uploadingDocument ? "Uploading document..." : form.legalDocumentUrl ? "Replace verification document" : "Upload PDF or image (max 5 MB)"}
                      <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp" className="hidden" disabled={uploadingDocument} onChange={(e) => { void uploadLegalDocument(e.target.files?.[0]); e.target.value = ""; }} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E4E0E7]">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-[14px] text-[#68646F] hover:bg-[#F3F1F5] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 btn-gold rounded-xl font-bold text-[14px] shadow-md disabled:opacity-50">
                  {submitting ? "Saving..." : "Save Lawyer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
