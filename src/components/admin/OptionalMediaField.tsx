"use client";

import { useRef, useState } from "react";
import { AlertCircle, ImagePlus, Link2, Loader2, Upload, X } from "lucide-react";
import { uploadPropertyMedia } from "@/lib/api";

type Props = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  description?: string;
  urlPlaceholder?: string;
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function OptionalMediaField({
  label,
  value = "",
  onChange,
  description,
  urlPlaceholder,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const maxBytes = 5 * 1024 * 1024;

  const upload = async (file?: File) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Use a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > maxBytes) {
      setError("Maximum file size is 5 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      onChange(await uploadPropertyMedia(file, "image"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-xl border border-[#E4E0E7] bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <label className="text-[12px] font-bold text-[#3F3D46]">{label}</label>
          <span className="ml-2 rounded-full bg-[#F3F1F5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#68646F]">Optional</span>
          {description && <p className="mt-1 text-[10px] leading-4 text-[#68646F]">{description}</p>}
        </div>
        {value && (
          <button type="button" onClick={() => { onChange(""); setError(""); }} className="flex size-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100" aria-label={`Remove ${label}`}>
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {value && (
        <div className="mt-3 flex h-28 items-center justify-center overflow-hidden rounded-lg bg-[#0B1328]">
          <img src={value} alt={`${label} preview`} className="h-full w-full object-contain" />
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-[#E4E0E7] bg-[#F8F7FA] px-3">
          <Link2 className="mr-2 size-3.5 shrink-0 text-[#68646F]" />
          <input
            type="url"
            value={value}
            onChange={(event) => { onChange(event.target.value); setError(""); }}
            placeholder={urlPlaceholder || "Paste an image URL"}
            className="h-10 min-w-0 flex-1 bg-transparent text-[11px] outline-none"
          />
        </div>
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#121B35] px-3 text-[11px] font-bold text-white hover:bg-[#273559] disabled:opacity-50">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? "Uploading" : value ? "Replace file" : "Upload file"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void upload(event.target.files?.[0])}
      />
      <p className="mt-2 flex items-center gap-1 text-[9px] text-[#68646F]"><ImagePlus className="size-3" /> JPG/PNG/WebP, maximum 5 MB</p>
      {error && <p className="mt-2 flex items-start gap-1 text-[10px] text-red-600"><AlertCircle className="mt-0.5 size-3 shrink-0" /> {error}</p>}
    </div>
  );
}
