"use client";
import Image from "@/components/Image";
import Link from "@/components/Link";
import { MapPin, ShieldCheck } from "lucide-react";
import type { Property } from "./mock-data";
import { priceWithCharges } from "@/lib/propertyPresentation";
import FavoriteButton from "./FavoriteButton";

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

        <div className="absolute left-2.5 top-2.5 z-10 flex flex-wrap gap-1.5">
          <span className="flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 shadow-sm backdrop-blur-sm">
            <ShieldCheck className="size-3.5 text-[#1E7A46]" strokeWidth={2.4} />
            <span className="text-[9.5px] font-bold uppercase tracking-wide text-[#121B35]">Clear Title Verified</span>
          </span>
          {p.reraRegistered && (
            <span className="rounded-lg bg-white/95 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide text-[#121B35] shadow-sm backdrop-blur-sm">
              RERA
            </span>
          )}
        </div>

        {/* Favorite */}
        <FavoriteButton property={p} className="absolute top-2 right-2 size-8 rounded-full bg-white/90 hover:bg-white shadow-sm" />

        {/* A neutral scrim keeps the price readable across every photo color. */}
        {p.price && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3.5 pb-3 pt-10">
            <span className="text-[16px] font-extrabold tracking-[-0.01em] text-white drop-shadow-sm">
              {priceWithCharges(p.price)}
            </span>
          </div>
        )}
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
      </div>
    </Link>
  );
}
