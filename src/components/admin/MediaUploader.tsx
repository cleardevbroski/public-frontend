"use client";

import { useState, useRef, useCallback } from "react";
import {
  X,
  ImagePlus,
  Video,
  GripVertical,
  Eye,
  AlertCircle,
  Plus,
  Link2,
} from "lucide-react";
import { youtubeThumb, isEmbeddable } from "@/lib/video";

interface MediaUploaderProps {
  images: string[];
  videos: string[];
  onImagesChange: (images: string[]) => void;
  onVideosChange: (videos: string[]) => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export default function MediaUploader({
  images,
  videos,
  onImagesChange,
  onVideosChange,
}: MediaUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [videoDragOver, setVideoDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const addVideoUrl = () => {
    const url = videoUrl.trim();
    if (!url) return;
    if (!isEmbeddable(url) && !/^https?:\/\//i.test(url)) {
      setErrors(["Enter a valid YouTube/Vimeo link or a direct video URL."]);
      setTimeout(() => setErrors([]), 4000);
      return;
    }
    if (videos.includes(url)) {
      setVideoUrl("");
      return;
    }
    onVideosChange([...videos, url]);
    setVideoUrl("");
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageFiles = useCallback(
    async (files: FileList | File[]) => {
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
          const base64 = await fileToBase64(file);
          newImages.push(base64);
        } catch {
          newErrors.push(`${file.name}: Failed to process.`);
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
      if (newErrors.length > 0) {
        setErrors(newErrors);
        setTimeout(() => setErrors([]), 5000);
      }
    },
    [images, onImagesChange]
  );

  const handleVideoFiles = useCallback(
    async (files: FileList | File[]) => {
      const newErrors: string[] = [];
      const newVideos: string[] = [];

      for (const file of Array.from(files)) {
        if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
          newErrors.push(`${file.name}: Invalid type. Use MP4 or WebM.`);
          continue;
        }
        if (file.size > MAX_VIDEO_SIZE) {
          newErrors.push(`${file.name}: Too large. Max 50MB per video.`);
          continue;
        }
        try {
          const base64 = await fileToBase64(file);
          newVideos.push(base64);
        } catch {
          newErrors.push(`${file.name}: Failed to process.`);
        }
      }

      if (newVideos.length > 0) {
        onVideosChange([...videos, ...newVideos]);
      }
      if (newErrors.length > 0) {
        setErrors(newErrors);
        setTimeout(() => setErrors([]), 5000);
      }
    },
    [videos, onVideosChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "image" | "video") => {
      e.preventDefault();
      setDragOver(false);
      setVideoDragOver(false);
      if (type === "image") {
        handleImageFiles(e.dataTransfer.files);
      } else {
        handleVideoFiles(e.dataTransfer.files);
      }
    },
    [handleImageFiles, handleVideoFiles]
  );

  const handleImageDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;
    const newImages = [...images];
    const draggedImage = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setDraggedImageIndex(index);
    onImagesChange(newImages);
  };

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null);
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    onVideosChange(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-[13px] text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {err}
            </div>
          ))}
        </div>
      )}

      {/* PHOTOS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[16px] font-bold text-[#1E3A8A]" style={{ fontFamily: "var(--font-outfit)" }}>
            Photos
          </h3>
          <span className="text-[12px] text-[#6E7488]">{images.length} uploaded</span>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => handleDrop(e, "image")}
          onClick={() => imageInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-[#C9A24E] bg-[#C9A24E]/5 scale-[1.01]"
              : "border-[#D5DEF2] hover:border-[#C9A24E]/50 hover:bg-[#F1F5FF]/50"
          }`}
        >
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
          />
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            dragOver
              ? "bg-[#C9A24E]/10 shadow-lg"
              : "bg-gradient-to-br from-[#E2E9FB] to-[#D5DEF2]"
          }`}>
            <ImagePlus className={`w-7 h-7 transition-colors ${dragOver ? "text-[#C9A24E]" : "text-[#C9A24E]/60"}`} />
          </div>
          <p className="text-[15px] font-semibold text-[#1E3A8A] mb-1">
            {dragOver ? "Drop your photos here" : "Drag & drop photos here"}
          </p>
          <p className="text-[13px] text-[#6E7488]">
            or <span className="text-[#C9A24E] font-medium">browse files</span> — JPG, PNG, WebP up to 5MB each
          </p>
        </div>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={() => handleImageDragStart(idx)}
                onDragOver={(e) => handleImageDragOver(e, idx)}
                onDragEnd={handleImageDragEnd}
                className={`relative group aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                  draggedImageIndex === idx
                    ? "border-[#C9A24E] opacity-50 scale-95"
                    : idx === 0
                    ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/20"
                    : "border-[#D5DEF2]/30 hover:border-[#C9A24E]/40"
                }`}
              >
                <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                {/* Cover badge */}
                {idx === 0 && (
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-[#D4AF37] to-[#E8C66A] text-[#1E3A8A] text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                    COVER
                  </span>
                )}
                {/* Drag handle */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-7 h-7 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(img);
                    }}
                    className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Eye className="w-4 h-4 text-[#1E3A8A]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="w-8 h-8 bg-red-500/90 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {images.length > 0 && (
          <p className="mt-2 text-[12px] text-[#6E7488] flex items-center gap-1">
            <GripVertical className="w-3 h-3" /> Drag to reorder. First image is the cover photo.
          </p>
        )}
      </div>

      {/* VIDEOS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[16px] font-bold text-[#1E3A8A]" style={{ fontFamily: "var(--font-outfit)" }}>
            Videos
          </h3>
          <span className="text-[12px] text-[#6E7488]">{videos.length} added</span>
        </div>

        {/* YouTube / video link */}
        <div className="mb-4 p-4 bg-[#F1F5FF] border border-[#D5DEF2]/50 rounded-2xl">
          <label className="flex items-center gap-2 text-[13px] font-bold text-[#1E3A8A] mb-2">
            <Video className="w-4.5 h-4.5 text-red-600" />
            Paste a YouTube / Vimeo link
          </label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white border border-[#D5DEF2] rounded-xl px-3 focus-within:border-[#C9A24E]">
              <Link2 className="w-4 h-4 text-[#6E7488] shrink-0" />
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addVideoUrl())}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 py-2.5 text-[14px] text-[#1E3A8A] outline-none bg-transparent placeholder:text-[#6E7488]/70"
              />
            </div>
            <button
              type="button"
              onClick={addVideoUrl}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E3A8A] text-[#E8C66A] font-bold text-[13px] rounded-xl hover:bg-[#25459E] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <p className="text-[11.5px] text-[#6E7488] mt-2">
            The video will play directly inside the property page&apos;s Videos tab.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setVideoDragOver(true);
          }}
          onDragLeave={() => setVideoDragOver(false)}
          onDrop={(e) => handleDrop(e, "video")}
          onClick={() => videoInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            videoDragOver
              ? "border-[#E8C66A] bg-[#E8C66A]/5 scale-[1.01]"
              : "border-[#D5DEF2] hover:border-[#E8C66A]/50 hover:bg-[#FFF0ED]/30"
          }`}
        >
          <input
            ref={videoInputRef}
            type="file"
            multiple
            accept=".mp4,.webm"
            className="hidden"
            onChange={(e) => e.target.files && handleVideoFiles(e.target.files)}
          />
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            videoDragOver
              ? "bg-[#E8C66A]/10 shadow-lg"
              : "bg-gradient-to-br from-[#FFF0ED] to-[#FFE0DA]"
          }`}>
            <Video className={`w-7 h-7 transition-colors ${videoDragOver ? "text-[#E8C66A]" : "text-[#E8C66A]/60"}`} />
          </div>
          <p className="text-[15px] font-semibold text-[#1E3A8A] mb-1">
            {videoDragOver ? "Drop your videos here" : "Drag & drop videos here"}
          </p>
          <p className="text-[13px] text-[#6E7488]">
            or <span className="text-[#E8C66A] font-medium">browse files</span> — MP4, WebM up to 50MB each
          </p>
        </div>

        {/* Video Preview Grid */}
        {videos.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((vid, idx) => {
              const ytThumb = youtubeThumb(vid);
              const isLink = isEmbeddable(vid) || /^https?:\/\//i.test(vid);
              return (
                <div key={idx} className="relative group rounded-xl overflow-hidden border-2 border-[#D5DEF2]/30 hover:border-[#E8C66A]/30 transition-all">
                  {ytThumb ? (
                    <div className="relative w-full aspect-video bg-black">
                      <img src={ytThumb} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="w-12 h-12 text-red-600 drop-shadow-lg" fill="currentColor" />
                      </div>
                    </div>
                  ) : isLink ? (
                    <div className="w-full aspect-video bg-[#1E3A8A] flex flex-col items-center justify-center text-white gap-2">
                      <Link2 className="w-7 h-7 text-[#E8C66A]" />
                      <span className="text-[11px] px-3 text-center break-all line-clamp-2">{vid}</span>
                    </div>
                  ) : (
                    <video
                      src={vid}
                      className="w-full aspect-video object-cover bg-black"
                      muted
                      onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={(e) => {
                        const v = e.target as HTMLVideoElement;
                        v.pause();
                        v.currentTime = 0;
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {!isLink && (
                      <button
                        onClick={() => setPreviewVideo(vid)}
                        className="w-10 h-10 bg-white/90 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Eye className="w-5 h-5 text-[#1E3A8A]" />
                      </button>
                    )}
                    <button
                      onClick={() => removeVideo(idx)}
                      className="w-10 h-10 bg-red-500/90 rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1">
                    {ytThumb && <Video className="w-3 h-3 text-red-500" fill="currentColor" />}
                    {ytThumb ? "YouTube" : `Video ${idx + 1}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <img src={previewImage} alt="Preview" className="w-full h-full object-contain rounded-2xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-5 h-5 text-[#1E3A8A]" />
            </button>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewVideo(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <video src={previewVideo} controls autoPlay className="w-full rounded-2xl" />
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
            >
              <X className="w-5 h-5 text-[#1E3A8A]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
