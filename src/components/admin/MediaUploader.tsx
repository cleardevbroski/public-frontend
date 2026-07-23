"use client";

import { useCallback, useRef, useState } from "react";
import { AlertCircle, Eye, GripVertical, ImagePlus, X } from "lucide-react";
import { uploadPropertyMedia } from "@/lib/api";

interface MediaUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function MediaUploader({ images, onImagesChange }: MediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageFiles = useCallback(async (files: FileList | File[]) => {
    const newErrors: string[] = [];
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        newErrors.push(`${file.name}: Invalid type. Use JPG, PNG, or WebP.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        newErrors.push(`${file.name}: Too large. Max 5MB per image.`);
        continue;
      }
      try {
        newImages.push(await uploadPropertyMedia(file, "image"));
      } catch (error) {
        newErrors.push(`${file.name}: ${error instanceof Error ? error.message : "Upload failed."}`);
      }
    }

    if (newImages.length) onImagesChange([...images, ...newImages]);
    if (newErrors.length) {
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 5000);
    }
  }, [images, onImagesChange]);

  const handleImageDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;
    const reordered = [...images];
    const [draggedImage] = reordered.splice(draggedImageIndex, 1);
    reordered.splice(index, 0, draggedImage);
    setDraggedImageIndex(index);
    onImagesChange(reordered);
  };

  return (
    <div className="space-y-8">
      {errors.length > 0 && (
        <div className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-4">
          {errors.map((error) => <div key={error} className="flex items-start gap-2 text-[13px] text-red-700"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</div>)}
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}>Gallery photos</h3>
          <span className="text-[12px] text-[#68646F]">{images.length} uploaded</span>
        </div>
        <div
          onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => { event.preventDefault(); setDragOver(false); void handleImageFiles(event.dataTransfer.files); }}
          onClick={() => imageInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${dragOver ? "scale-[1.01] border-[#DDAA42] bg-[#DDAA42]/5" : "border-[#E4E0E7] hover:border-[#DDAA42]/50 hover:bg-[#F8F7FA]/50"}`}
        >
          <input ref={imageInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(event) => event.target.files && void handleImageFiles(event.target.files)} />
          <div className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl ${dragOver ? "bg-[#DDAA42]/10 shadow-lg" : "bg-gradient-to-br from-[#F3F1F5] to-[#E4E0E7]"}`}><ImagePlus className="size-7 text-[#DDAA42]" /></div>
          <p className="mb-1 text-[15px] font-semibold text-[#121B35]">{dragOver ? "Drop your photos here" : "Drag & drop photos here"}</p>
          <p className="text-[13px] text-[#68646F]">or <span className="font-medium text-[#DDAA42]">browse files</span> — JPG, PNG, WebP up to 5MB each</p>
        </div>

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image, index) => (
              <div key={`${image}-${index}`} draggable onDragStart={() => setDraggedImageIndex(index)} onDragOver={(event) => handleImageDragOver(event, index)} onDragEnd={() => setDraggedImageIndex(null)} className={`group relative aspect-[4/3] cursor-grab overflow-hidden rounded-xl border-2 transition-all duration-200 active:cursor-grabbing ${draggedImageIndex === index ? "scale-95 border-[#DDAA42] opacity-50" : index === 0 ? "border-[#DDAA42] ring-2 ring-[#DDAA42]/20" : "border-[#E4E0E7]/30 hover:border-[#DDAA42]/40"}`}>
                <img src={image} alt={`Gallery photo ${index + 1}`} className="size-full object-cover" />
                {index === 0 && <span className="absolute left-2 top-2 rounded-md bg-gradient-to-r from-[#DDAA42] to-[#F2C052] px-2 py-0.5 text-[10px] font-bold text-[#121B35] shadow-sm">GALLERY 1</span>}
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"><div className="flex size-7 items-center justify-center rounded-lg bg-black/50 backdrop-blur-sm"><GripVertical className="size-4 text-white" /></div></div>
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
                  <button type="button" onClick={(event) => { event.stopPropagation(); setPreviewImage(image); }} className="flex size-8 items-center justify-center rounded-lg bg-white/90 hover:bg-white"><Eye className="size-4 text-[#121B35]" /></button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); onImagesChange(images.filter((_, imageIndex) => imageIndex !== index)); }} className="flex size-8 items-center justify-center rounded-lg bg-red-500/90 hover:bg-red-600"><X className="size-4 text-white" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {images.length > 0 && <p className="mt-2 flex items-center gap-1 text-[12px] text-[#68646F]"><GripVertical className="size-3" />Drag to reorder. First image is the cover photo.</p>}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <div className="relative max-h-[90vh] w-full max-w-4xl"><img src={previewImage} alt="Preview" className="size-full rounded-2xl object-contain" /><button type="button" onClick={() => setPreviewImage(null)} className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white"><X className="size-5 text-[#121B35]" /></button></div>
        </div>
      )}
    </div>
  );
}
