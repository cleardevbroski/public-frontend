"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, RefreshCw, UploadCloud, X } from "lucide-react";
import { uploadPropertyMedia } from "@/lib/api";
import { mapWithConcurrency } from "@/lib/uploadConcurrency";
import { detectFileType, fileFingerprint } from "@/lib/fileTypeDetection";
import { PROPERTY_IMAGE_MAX_BYTES, PROPERTY_IMAGE_MAX_MB } from "@/lib/propertyMediaLimits";

type Destination = "hero" | "gallery";
type MediaItem = { id: string; fingerprint: string; file: File; destination: Destination; status: "queued" | "uploading" | "uploaded" | "error"; message: string; notice?: string };
type Props = {
  heroImages: string[];
  galleryImages: string[];
  onHeroImagesChange: (images: string[]) => void;
  onGalleryImagesChange: (images: string[]) => void;
  onBusyChange?: (busy: boolean) => void;
};

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const heroPattern = /(?:^|[\s_.-])(hero|cover|banner|main|featured)(?:[\s_.-]|$)/i;
const mediaId = (file: File, index: number) => `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`;

export default function BulkPropertyMediaImporter({
  heroImages,
  galleryImages,
  onHeroImagesChange,
  onGalleryImagesChange,
  onBusyChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const mediaRef = useRef({ heroImages, galleryImages });
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => { mediaRef.current = { heroImages, galleryImages }; }, [galleryImages, heroImages]);
  useEffect(() => () => { mountedRef.current = false; onBusyChange?.(false); }, [onBusyChange]);
  const busy = items.some((item) => item.status === "uploading");
  useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);

  const upload = async (batch: MediaItem[]) => {
    const queued = batch.filter((item) => item.status === "queued" || item.status === "error");
    if (!queued.length || busy) return;
    const ids = new Set(queued.map((item) => item.id));
    setItems((current) => current.map((item) => ids.has(item.id) ? { ...item, status: "uploading", message: `${item.notice ? `${item.notice} ` : ""}Uploading to linked storage…` } : item));

    const results = await mapWithConcurrency(queued, 3, async (item) => {
      try {
        const fileUrl = await uploadPropertyMedia(item.file, "image");
        return { item, fileUrl };
      } catch (cause) {
        return { item, error: cause instanceof Error ? cause.message : "Upload failed." };
      }
    });
    if (!mountedRef.current) return;

    const byId = new Map(results.map((result) => [result.item.id, result]));
    setItems((current) => current.map((item) => {
      const result = byId.get(item.id);
      if (!result) return item;
      return result.fileUrl ? { ...item, status: "uploaded", message: `${item.notice ? `${item.notice} ` : ""}Uploaded and assigned.` } : { ...item, status: "error", message: `${item.notice ? `${item.notice} ` : ""}${result.error || "Upload failed."}` };
    }));

    const nextHero = [...mediaRef.current.heroImages];
    const nextGallery = [...mediaRef.current.galleryImages];
    for (const result of results) {
      if (!result.fileUrl) continue;
      if (result.item.destination === "hero") nextHero.push(result.fileUrl);
      else nextGallery.push(result.fileUrl);
    }
    const uniqueHero = [...new Set(nextHero)].slice(0, 3);
    const uniqueGallery = [...new Set(nextGallery)];
    mediaRef.current = { heroImages: uniqueHero, galleryImages: uniqueGallery };
    onHeroImagesChange(uniqueHero);
    onGalleryImagesChange(uniqueGallery);
  };

  const addFiles = async (files: FileList | File[]) => {
    const source = Array.from(files);
    const existingFingerprints = new Set(items.map((item) => item.fingerprint));
    const uniqueSource = source.filter((file) => {
      const fingerprint = fileFingerprint(file);
      if (existingFingerprints.has(fingerprint)) return false;
      existingFingerprints.add(fingerprint);
      return true;
    });
    const inspected = await Promise.all(uniqueSource.map(async (file) => ({ file, detected: await detectFileType(file) })));
    const imageFiles = inspected.filter(({ file, detected }) => imageTypes.has(detected.mime) && file.size <= PROPERTY_IMAGE_MAX_BYTES).map(({ file }) => file);
    const availableHeroSlots = Math.max(0, 3 - heroImages.length);
    const heroCandidates = [
      ...imageFiles.filter((file) => heroPattern.test(file.name)),
      ...imageFiles.filter((file) => !heroPattern.test(file.name)),
    ].slice(0, availableHeroSlots);
    const heroFiles = new Set(heroCandidates);
    const prepared = inspected.map(({ file, detected }, index): MediaItem => {
      const namedExtension = file.name.split(".").pop()?.toUpperCase() || detected.declaredMime || "another type";
      const notice = detected.mismatch ? `This file is ${detected.label} content but is named ${namedExtension}.` : undefined;
      const base = { id: mediaId(file, index), fingerprint: fileFingerprint(file), file, notice };
      if (imageTypes.has(detected.mime)) {
        if (file.size > PROPERTY_IMAGE_MAX_BYTES) return { ...base, destination: "gallery", status: "error", message: `Images must be ${PROPERTY_IMAGE_MAX_MB} MB or smaller.` };
        const destination = heroFiles.has(file) ? "hero" : "gallery";
        return { ...base, destination, status: "queued", message: `${notice ? `${notice} ` : ""}${destination === "hero" ? "Assigned to main display photos." : "Assigned to the property gallery."}` };
      }
      return { ...base, destination: "gallery", status: "error", message: detected.mime === "image/avif" || detected.mime === "image/heic" ? `${detected.label} conversion is not available in this browser. Export it as JPEG, PNG, or WebP.` : "Use JPG, PNG, or WebP." };
    });
    if (!prepared.length) return;
    setItems((current) => [...current, ...prepared]);
    const uploadable = prepared.filter((item) => item.status === "queued");
    if (uploadable.length) void upload(uploadable);
    if (inputRef.current) inputRef.current.value = "";
  };

  return <section className="mb-8 rounded-2xl border border-[#D8C88F] bg-[#FFFDF7] p-4 md:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><UploadCloud className="size-5 text-[#A87519]" /><h3 className="text-[15px] font-bold text-[#121B35]">Smart property photo import</h3></div><p className="mt-1 max-w-2xl text-[11px] leading-5 text-[#68646F]">Drop all photos together. Files named hero, cover, banner or main are prioritized for the three display slots; remaining images go to the gallery.</p></div>{items.length > 0 && <button type="button" disabled={busy} onClick={() => setItems((current) => current.filter((item) => item.status === "uploading"))} className="text-[10px] font-bold text-[#68646F] disabled:opacity-40">Clear queue</button>}</div>
    <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); if (!busy) void addFiles(event.dataTransfer.files); }} className={`mt-4 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors ${dragging ? "border-[#DDAA42] bg-[#FFF7DF]" : "border-[#D9D2BF] bg-white hover:border-[#DDAA42]"} disabled:cursor-wait disabled:opacity-60`}>
      {busy ? <Loader2 className="size-7 animate-spin text-[#DDAA42]" /> : <ImagePlus className="size-7 text-[#DDAA42]" />}<span className="mt-2 text-[13px] font-bold text-[#121B35]">{busy ? "Uploading photos…" : "Drop all property photos here"}</span><span className="mt-1 text-[10px] text-[#68646F]">JPG, PNG or WebP up to {PROPERTY_IMAGE_MAX_MB} MB each · three uploads at a time</span>
    </button>
    <input ref={inputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp,.avif,.heic,.heif,image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" className="hidden" onChange={(event) => event.target.files && void addFiles(event.target.files)} />
    {items.length > 0 && <div className="mt-4 grid gap-2 md:grid-cols-2">{items.map((item) => <div key={item.id} className="flex items-start gap-2 rounded-xl border border-[#E5E0D2] bg-white p-3">{item.status === "uploading" ? <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-[#DDAA42]" /> : item.status === "uploaded" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : item.status === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" /> : <ImagePlus className="mt-0.5 size-4 shrink-0 text-[#A87519]" />}<div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-[#121B35]">{item.file.name}</p><p className={`mt-0.5 text-[9px] ${item.status === "error" ? "text-red-600" : item.status === "uploaded" ? "text-emerald-700" : "text-[#68646F]"}`}>{item.message}</p></div>{item.status === "error" && <button type="button" disabled={busy} onClick={() => void upload([{ ...item, status: "queued" }])} className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 disabled:opacity-40" title="Retry this file"><RefreshCw className="size-3.5" /></button>}{item.status !== "uploading" && <button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F5F3F5] text-[#68646F]"><X className="size-3.5" /></button>}</div>)}</div>}
  </section>;
}
