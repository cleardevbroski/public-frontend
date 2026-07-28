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
      className="group block w-[280px] sm:w-[340px] max-w-[86vw] shrink-0 overflow-hidden rounded-2xl bg-white border border-[#E4E0E7]/70 hover:border-[#DDAA42]/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-[170px] bg-[#F3F1F5] overflow-hidden">
        {(() => {
          const coverImage = p.heroImages?.[0] || p.images?.[0] || p.image;
          if (!coverImage) return null;
          return isBase64(coverImage) ? (
            <img src={coverImage} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          ) : (
            <Image src={coverImage} alt={p.title} fill sizes="340px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          );
        })()}

        {/* Verified tag */}
        <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 shadow-sm">
          <ShieldCheck className="size-3.5 text-[#1E7A46]" strokeWidth={2.4} />
          <span className="text-[9.5px] font-bold tracking-wide text-[#121B35] uppercase">Clear Title Verified</span>
        </span>

        {/* Badge */}
        {p.badges && p.badges.length > 0 && (
          <span className="absolute top-2.5 right-11 rounded-md bg-[#121B35] text-[#F2C052] text-[9.5px] font-bold px-2 py-1 uppercase">
            {p.badges[0]}
          </span>
        )}

        {/* Favorite */}
        <button
          className="absolute top-2 right-2 size-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          aria-label="Shortlist property"
        >
          <Heart className="size-4 text-[#121B35] group-hover:text-red-500 transition-colors" />
        </button>

        {/* Price chip */}
        {p.price && <span className="absolute bottom-0 left-0 rounded-tr-lg bg-[#121B35]/90 text-white text-[15px] font-bold px-3 py-1.5">
          {p.price}
        </span>}
      </div>

      {/* Body */}
      <div className="p-3.5">
        {p.title && <h3 className="text-[15.5px] font-bold text-[#121B35] truncate group-hover:text-[#DDAA42] transition-colors">
          {p.title}
        </h3>}
        {p.subtitle && <p className="text-[12px] text-[#68646F] truncate mt-0.5 flex items-center gap-1">
          <MapPin className="size-3.5 text-[#DDAA42] shrink-0" />
          {p.subtitle}
        </p>}

        {/* Config row */}
        {(p.configs?.length || p.area) ? <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-[#F3F1F5] text-[12px] text-[#3F3D46]">
          {!!p.configs?.length && <span className="flex items-center gap-1.5">
            <BedDouble className="size-4 text-[#DDAA42]" /> {p.configs.join(", ")}
          </span>}
          {p.area && <span className="flex items-center gap-1.5">
            <Maximize2 className="size-4 text-[#DDAA42]" /> {p.area}
          </span>}
        </div> : null}

        <div className="flex items-center justify-between mt-2.5">
          {p.possession && <span className="text-[11px] text-[#68646F] flex items-center gap-1"><Calendar className="size-3.5 text-[#DDAA42]" /> {formatPossession(p)}</span>}
          {p.pricePerSqft && (
            <span className="text-[11px] text-[#68646F] font-medium">{p.pricePerSqft}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
