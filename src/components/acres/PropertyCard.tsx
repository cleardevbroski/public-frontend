"use client";
import Image from "@/components/Image";
import Link from "@/components/Link";
import { Heart, BedDouble, Maximize2, Calendar, MapPin, ShieldCheck } from "lucide-react";
import type { Property } from "./mock-data";
import { formatPossession } from "@/lib/propertyDetails";

const isBase64 = (src: string) => src.startsWith("data:");

export default function PropertyCard({ p }: { p: Property }) {
  return (
    <Link
      href={`/property/${p.id}`}
      className="group block w-[280px] sm:w-[340px] max-w-[86vw] shrink-0 bg-white border border-[#D5DEF2]/70 hover:border-[#D4AF37]/60 shadow-sm hover:shadow-md transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-[170px] bg-[#E2E9FB] overflow-hidden">
        {isBase64(p.image) ? (
          <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <Image src={p.image} alt={p.title} fill sizes="340px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        )}

        {/* Verified tag */}
        <span className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/95 px-2 py-1 shadow-sm">
          <ShieldCheck className="size-3.5 text-[#1E7A46]" strokeWidth={2.4} />
          <span className="text-[9.5px] font-bold tracking-wide text-[#1E3A8A] uppercase">Clear Title Verified</span>
        </span>

        {/* Badge */}
        {p.badges && p.badges.length > 0 && (
          <span className="absolute top-2.5 right-11 bg-[#1E3A8A] text-[#E8C66A] text-[9.5px] font-bold px-2 py-1 uppercase">
            {p.badges[0]}
          </span>
        )}

        {/* Favorite */}
        <button
          className="absolute top-2 right-2 size-8 bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          aria-label="Shortlist property"
        >
          <Heart className="size-4 text-[#1E3A8A] group-hover:text-red-500 transition-colors" />
        </button>

        {/* Price chip */}
        <span className="absolute bottom-0 left-0 bg-[#1E3A8A]/90 text-white text-[15px] font-bold px-3 py-1.5">
          {p.price}
        </span>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <h3 className="text-[15.5px] font-bold text-[#1E3A8A] truncate group-hover:text-[#D4AF37] transition-colors">
          {p.title}
        </h3>
        <p className="text-[12px] text-[#6E7488] truncate mt-0.5 flex items-center gap-1">
          <MapPin className="size-3.5 text-[#D4AF37] shrink-0" />
          {p.subtitle}
        </p>

        {/* Config row */}
        <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-[#E2E9FB] text-[12px] text-[#243559]">
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-4 text-[#D4AF37]" /> {p.configs.join(", ")}
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize2 className="size-4 text-[#D4AF37]" /> {p.area}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[11px] text-[#6E7488] flex items-center gap-1">
            <><Calendar className="size-3.5 text-[#D4AF37]" /> {formatPossession(p)}</>
          </span>
          {p.pricePerSqft && (
            <span className="text-[11px] text-[#6E7488] font-medium">{p.pricePerSqft}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
