"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, PlayCircle, UploadCloud, X } from "lucide-react";
import { uploadPropertyMedia } from "@/lib/api";
import { mapWithConcurrency } from "@/lib/uploadConcurrency";
import type { ProjectDownload } from "@/components/acres/mock-data";
import { PROPERTY_IMAGE_MAX_BYTES, PROPERTY_IMAGE_MAX_MB, PROPERTY_WALKTHROUGH_MAX_BYTES, PROPERTY_WALKTHROUGH_MAX_MB } from "@/lib/propertyMediaLimits";

type Destination = "hero" | "gallery" | "walkthrough";
type MediaItem = { id: string; file: File; destination: Destination; status: "queued" | "uploading" | "uploaded" | "error"; message: string };
type Props = {
  heroImages: string[];
  galleryImages: string[];
  walkthrough?: ProjectDownload;
  onHeroImagesChange: (images: string[]) => void;
  onGalleryImagesChange: (images: string[]) => void;
  onWalkthroughChange: (download: ProjectDownload) => void;
  onBusyChange?: (busy: boolean) => void;
};

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const heroPattern = /(?:^|[\s_.-])(hero|cover|banner|main|featured)(?:[\s_.-]|$)/i;
const mediaId = (file: File, index: number) => `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`;

export default function BulkPropertyMediaImporter({
  heroImages,
  galleryImages,
  walkthrough,
  onHeroImagesChange,
  onGalleryImagesChange,
  onWalkthroughChange,
  onBusyChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  const mediaRef = useRef({ heroImages, galleryImages, walkthrough });
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => { mediaRef.current = { heroImages, galleryImages, walkthrough }; }, [galleryImages, heroImages, walkthrough]);
  useEffect(() => () => { mountedRef.current = false; onBusyChange?.(false); }, [onBusyChange]);
  const busy = items.some((item) => item.status === "uploading");
  useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);

  const upload = async (batch: MediaItem[]) => {
    const queued = batch.filter((item) => item.status === "queued" || item.status === "error");
    if (!queued.length || busy) return;
    const ids = new Set(queued.map((item) => item.id));
    setItems((current) => current.map((item) => ids.has(item.id) ? { ...item, status: "uploading", message: "Uploading to linked storage…" } : item));

    const results = await mapWithConcurrency(queued, 3, async (item) => {
      try {
        const fileUrl = await uploadPropertyMedia(item.file, item.destination === "walkthrough" ? "project-walkthrough" : "image");
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
      return result.fileUrl ? { ...item, status: "uploaded", message: "Uploaded and assigned." } : { ...item, status: "error", message: result.error || "Upload failed." };
    }));

    const nextHero = [...mediaRef.current.heroImages];
    const nextGallery = [...mediaRef.current.galleryImages];
    let nextWalkthrough: ProjectDownload | undefined;
    for (const result of results) {
      if (!result.fileUrl) continue;
      if (result.item.destination === "hero") nextHero.push(result.fileUrl);
      else if (result.item.destination === "gallery") nextGallery.push(result.fileUrl);
      else nextWalkthrough = { kind: "walkthrough", label: "Walkthrough Video", fileName: result.item.file.name, fileUrl: result.fileUrl, mimeType: "video/mp4", fileSize: result.item.file.size };
    }
    const uniqueHero = [...new Set(nextHero)].slice(0, 3);
    const uniqueGallery = [...new Set(nextGallery)];
    mediaRef.current = { heroImages: uniqueHero, galleryImages: uniqueGallery, walkthrough: nextWalkthrough || mediaRef.current.walkthrough };
    onHeroImagesChange(uniqueHero);
    onGalleryImagesChange(uniqueGallery);
    if (nextWalkthrough) onWalkthroughChange(nextWalkthrough);
  };

  const addFiles = (files: FileList | File[]) => {
    const source = Array.from(files);
    const imageFiles = source.filter((file) => imageTypes.has(file.type) && file.size <= PROPERTY_IMAGE_MAX_BYTES);
    const availableHeroSlots = Math.max(0, 3 - heroImages.length);
    const heroCandidates = [
      ...imageFiles.filter((file) => heroPattern.test(file.name)),
      ...imageFiles.filter((file) => !heroPattern.test(file.name)),
    ].slice(0, availableHeroSlots);
    const heroFiles = new Set(heroCandidates);
    let videoAssigned = false;
    const prepared = source.map((file, index): MediaItem => {
      if (imageTypes.has(file.type)) {
        if (file.size > PROPERTY_IMAGE_MAX_BYTES) return { id: mediaId(file, index), file, destination: "gallery", status: "error", message: `Images must be ${PROPERTY_IMAGE_MAX_MB} MB or smaller.` };
        const destination = heroFiles.has(file) ? "hero" : "gallery";
        return { id: mediaId(file, index), file, destination, status: "queued", message: destination === "hero" ? "Assigned to main display photos." : "Assigned to the property gallery." };
      }
      if (file.type === "video/mp4") {
        if (file.size > PROPERTY_WALKTHROUGH_MAX_BYTES) return { id: mediaId(file, index), file, destination: "walkthrough", status: "error", message: `Walkthrough videos must be ${PROPERTY_WALKTHROUGH_MAX_MB} MB or smaller.` };
        if (videoAssigned) return { id: mediaId(file, index), file, destination: "walkthrough", status: "error", message: "Only one walkthrough video can be attached." };
        videoAssigned = true;
        return { id: mediaId(file, index), file, destination: "walkthrough", status: "queued", message: walkthrough ? "Will replace the current walkthrough video." : "Assigned as the walkthrough video." };
      }
      return { id: mediaId(file, index), file, destination: "gallery", status: "error", message: "Use JPG, PNG, WebP, or MP4." };
    });
    setItems((current) => [...current, ...prepared]);
    const uploadable = prepared.filter((item) => item.status === "queued");
    if (uploadable.length) void upload(uploadable);
    if (inputRef.current) inputRef.current.value = "";
  };

  return <section className="mb-8 rounded-2xl border border-[#D8C88F] bg-[#FFFDF7] p-4 md:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><UploadCloud className="size-5 text-[#A87519]" /><h3 className="text-[15px] font-bold text-[#121B35]">Smart property media import</h3></div><p className="mt-1 max-w-2xl text-[11px] leading-5 text-[#68646F]">Drop all photos and one MP4 together. Files named hero, cover, banner or main are prioritized for the three display slots; remaining images go to the gallery.</p></div>{items.length > 0 && <button type="button" disabled={busy} onClick={() => setItems((current) => current.filter((item) => item.status === "uploading"))} className="text-[10px] font-bold text-[#68646F] disabled:opacity-40">Clear queue</button>}</div>
    <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); if (!busy) addFiles(event.dataTransfer.files); }} className={`mt-4 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors ${dragging ? "border-[#DDAA42] bg-[#FFF7DF]" : "border-[#D9D2BF] bg-white hover:border-[#DDAA42]"} disabled:cursor-wait disabled:opacity-60`}>
      {busy ? <Loader2 className="size-7 animate-spin text-[#DDAA42]" /> : <ImagePlus className="size-7 text-[#DDAA42]" />}<span className="mt-2 text-[13px] font-bold text-[#121B35]">{busy ? "Uploading media…" : "Drop all property photos and walkthrough video here"}</span><span className="mt-1 text-[10px] text-[#68646F]">JPG, PNG, WebP up to {PROPERTY_IMAGE_MAX_MB} MB · one MP4 up to {PROPERTY_WALKTHROUGH_MAX_MB} MB</span>
    </button>
    <input ref={inputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp,.mp4,image/jpeg,image/png,image/webp,video/mp4" className="hidden" onChange={(event) => event.target.files && addFiles(event.target.files)} />
    {items.length > 0 && <div className="mt-4 grid gap-2 md:grid-cols-2">{items.map((item) => <div key={item.id} className="flex items-start gap-2 rounded-xl border border-[#E5E0D2] bg-white p-3">{item.status === "uploading" ? <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-[#DDAA42]" /> : item.status === "uploaded" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : item.status === "error" ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" /> : item.destination === "walkthrough" ? <PlayCircle className="mt-0.5 size-4 shrink-0 text-[#A87519]" /> : <ImagePlus className="mt-0.5 size-4 shrink-0 text-[#A87519]" />}<div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-[#121B35]">{item.file.name}</p><p className={`mt-0.5 text-[9px] ${item.status === "error" ? "text-red-600" : item.status === "uploaded" ? "text-emerald-700" : "text-[#68646F]"}`}>{item.message}</p></div>{item.status !== "uploading" && <button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F5F3F5] text-[#68646F]"><X className="size-3.5" /></button>}</div>)}</div>}
  </section>;
}
