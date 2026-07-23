"use client";

import { useRef, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import { uploadPropertyMedia } from "@/lib/api";

interface HeroImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

const MAX_HERO_IMAGES = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function HeroImageUploader({ images, onChange }: HeroImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const selectedImages = images.slice(0, MAX_HERO_IMAGES);

  const handleFiles = async (files: FileList) => {
    const availableSlots = MAX_HERO_IMAGES - selectedImages.length;
    if (availableSlots <= 0) {
      setError("Remove a main photo before uploading another one.");
      return;
    }

    const chosenFiles = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      setError(`Only ${MAX_HERO_IMAGES} main photos can be added.`);
    } else {
      setError("");
    }

    setUploading(true);
    const uploaded: string[] = [];
    const failures: string[] = [];

    for (const file of chosenFiles) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        failures.push(`${file.name}: use JPG, PNG, or WebP.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        failures.push(`${file.name}: maximum size is 5 MB.`);
        continue;
      }
      try {
        uploaded.push(await uploadPropertyMedia(file, "image"));
      } catch (uploadError) {
        failures.push(`${file.name}: ${uploadError instanceof Error ? uploadError.message : "upload failed."}`);
      }
    }

    if (uploaded.length) onChange([...selectedImages, ...uploaded]);
    if (failures.length) setError(failures.join(" "));
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selectedImages.length) return;
    const reordered = [...selectedImages];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onChange(reordered);
  };

  return (
    <section className="rounded-2xl border border-[#E4E0E7] bg-[#F8F7FA] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#DDAA42]/15">
              <ImagePlus className="size-4.5 text-[#B98428]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#121B35]">Main display photos</h3>
          </div>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#68646F]">
            Add up to 3 wide project photos. They appear in this order in the public Project Overview and rotate automatically.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[#3F3D46] shadow-sm">
          {selectedImages.length}/{MAX_HERO_IMAGES}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: MAX_HERO_IMAGES }, (_, index) => {
          const photo = selectedImages[index];
          return photo ? (
            <div key={`${photo}-${index}`} className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-[#E4E0E7] bg-[#0B1328]">
              <img src={photo} alt={`Main display photo ${index + 1}`} className="h-full w-full object-contain" />
              <span className="absolute left-2 top-2 rounded-md bg-[#0B1328]/85 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                SLIDE {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onChange(selectedImages.filter((_, imageIndex) => imageIndex !== index))}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-red-600"
                aria-label={`Remove main display photo ${index + 1}`}
              >
                <X className="size-4" />
              </button>
              <div className="absolute inset-x-2 bottom-2 flex justify-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-[#121B35] disabled:opacity-35" aria-label="Move photo left">
                  <ChevronLeft className="size-4" />
                </button>
                <button type="button" disabled={index === selectedImages.length - 1} onClick={() => move(index, 1)} className="flex size-7 items-center justify-center rounded-lg bg-white/90 text-[#121B35] disabled:opacity-35" aria-label="Move photo right">
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              key={`empty-${index}`}
              type="button"
              disabled={uploading || index !== selectedImages.length}
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[16/9] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D8D2DB] bg-white text-[#68646F] transition-all enabled:hover:border-[#DDAA42] enabled:hover:bg-[#DDAA42]/5 disabled:cursor-default"
            >
              {uploading && index === selectedImages.length ? <Loader2 className="mb-2 size-5 animate-spin text-[#DDAA42]" /> : <ImagePlus className="mb-2 size-5 text-[#DDAA42]" />}
              <span className="text-[12px] font-semibold">{uploading && index === selectedImages.length ? "Uploading..." : `Add slide ${index + 1}`}</span>
            </button>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => event.target.files && void handleFiles(event.target.files)}
      />

      {error && (
        <p className="mt-3 flex items-start gap-2 text-[12px] text-red-600">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}
      <p className="mt-3 text-[11px] text-[#68646F]">Recommended: landscape 16:9, JPG/PNG/WebP, maximum 5 MB each.</p>
    </section>
  );
}
