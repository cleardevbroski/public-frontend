import { useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, X } from "lucide-react";
import { uploadChannelPartnerDocument } from "@/lib/api";
import type { PartnerDocument, PartnerDocumentKind } from "@/lib/channelPartnerTypes";

export default function DocumentUpload({ label, kind, required, value, onChange, imageOnly = false }: {
  label: string;
  kind: PartnerDocumentKind;
  required?: boolean;
  value?: PartnerDocument;
  onChange: (value?: PartnerDocument) => void;
  imageOnly?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file?: File) => {
    if (!file) return;
    setError("");
    if (file.size > 10 * 1024 * 1024) { setError("File must be 10 MB or smaller."); return; }
    const allowed = imageOnly ? ["image/jpeg", "image/png"] : ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) { setError(imageOnly ? "Upload a JPG or PNG file." : "Upload a JPG, PNG, or PDF file."); return; }
    setBusy(true);
    try { onChange(await uploadChannelPartnerDocument(file, kind)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed"); }
    finally { setBusy(false); }
  };

  return <div>
    <label className="block text-[12px] font-bold text-[#3F3D46] mb-1.5">{label}{required && <span className="text-red-600"> *</span>}</label>
    {value ? <div className="h-14 rounded-xl border border-emerald-200 bg-emerald-50 px-3 flex items-center gap-2">
      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
      <span className="text-[12px] text-emerald-900 truncate flex-1">{value.originalName}</span>
      <button type="button" onClick={() => onChange(undefined)} className="p-1 text-emerald-800 hover:text-red-600" aria-label={`Remove ${label}`}><X className="size-4" /></button>
    </div> : <button type="button" disabled={busy} onClick={() => input.current?.click()} className="w-full h-14 rounded-xl border border-dashed border-[#C9C5CC] bg-[#F8F7FA] hover:border-[#DDAA42] px-3 flex items-center justify-center gap-2 text-[12px] font-semibold text-[#68646F] disabled:opacity-60">
      {busy ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4 text-[#DDAA42]" />}{busy ? "Uploading..." : "Choose file"}
    </button>}
    <input ref={input} type="file" className="sr-only" accept={imageOnly ? ".jpg,.jpeg,.png" : ".jpg,.jpeg,.png,.pdf"} onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }} />
    <p className="text-[10.5px] text-[#8A8690] mt-1">{imageOnly ? "JPG or PNG" : "JPG, PNG or PDF"} · maximum 10 MB</p>
    {error && <p role="alert" className="text-[11px] text-red-700 mt-1">{error}</p>}
  </div>;
}
