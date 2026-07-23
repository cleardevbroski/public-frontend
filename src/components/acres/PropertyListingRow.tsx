"use client";
import Image from "@/components/Image";
import Link from "@/components/Link";
import { Heart, MapPin, ShieldCheck, Star } from "lucide-react";
import type { Property } from "./mock-data";
import { formatPossession } from "@/lib/propertyDetails";

const isBase64 = (src?: string) => !!src && src.startsWith("data:");

function statusOf(p: Property): string {
  if (p.possession || p.possessionDetails) return formatPossession(p);
  if (p.ageOfProperty) return p.ageOfProperty;
  return p.badges?.[0] || "Available";
}

/** Wide listing-row card for a real posted Property (used in the listing feed). */
export default function PropertyListingRow({ p }: { p: Property }) {
  const cover = p.image || p.images?.[0] || "";
  return (
    <Link
      href={`/property/${p.id}`}
      className="block bg-white rounded-2xl border border-[#E4E0E7]/30 hover:border-[#DDAA42]/50 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <article className="grid md:grid-cols-[250px_1fr] gap-0">
        <div className="relative h-[220px] md:h-full min-h-[220px] bg-[#F3F1F5] overflow-hidden">
          {isBase64(cover) ? (
            <img src={cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
          ) : (
            <Image src={cover} alt={p.title} fill sizes="250px" className="object-cover group-hover:scale-103 transition-transform duration-500" />
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
            <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm pl-1 pr-2.5 py-1 rounded-full shadow-md border border-[#DDAA42]/40">
              <span className="size-5 rounded-full bg-gradient-to-br from-[#F2C052] to-[#DDAA42] flex items-center justify-center">
                <ShieldCheck className="size-3 text-[#121B35]" strokeWidth={2.5} />
              </span>
              <span className="text-[9px] font-extrabold tracking-wide text-[#121B35] uppercase">Clear Title Verified</span>
            </span>
            {p.badges?.slice(0, 1).map((tag) => (
              <span key={tag} className="bg-[#DDAA42] text-[#0B1328] text-[9px] font-bold px-2.5 py-1 rounded-md shadow-sm">{tag}</span>
            ))}
          </div>
          <button
            className="absolute right-3 top-3 size-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center shadow"
            aria-label="Shortlist property"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <Heart className="size-4 text-[#121B35] hover:text-red-500 transition-colors" />
          </button>
        </div>

        <div className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                {p.builder && (
                  <p className="text-[10px] text-[#68646F] font-extrabold uppercase tracking-widest">{p.builder}</p>
                )}
                <h2 className="text-[18px] font-bold text-[#121B35] mt-1 group-hover:text-[#DDAA42] transition-colors leading-snug">{p.title}</h2>
                <p className="text-[13px] text-[#3F3D46]/80 mt-1 flex items-center gap-1">
                  <MapPin className="size-4 text-[#DDAA42]" />
                  {p.subtitle}
                </p>
              </div>
              {p.reraRegistered && (
                <span className="text-[11px] text-[#DDAA42] font-bold bg-[#F3F1F5] border border-[#E4E0E7]/30 px-3 py-1 rounded-full shrink-0 flex items-center gap-1">
                  <Star className="size-3 fill-[#DDAA42] text-transparent" />
                  RERA
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 border-y border-[#F3F1F5]/55 py-3.5 text-left">
              <div>
                <span className="text-[9px] text-[#68646F] font-bold uppercase tracking-wider block">Estimated Price</span>
                <span className="text-[16px] font-extrabold text-[#DDAA42] block mt-0.5">{p.price}</span>
                {p.pricePerSqft && <span className="text-[11px] text-[#68646F] block mt-0.5">{p.pricePerSqft}</span>}
              </div>
              <div>
                <span className="text-[9px] text-[#68646F] font-bold uppercase tracking-wider block">Carpet Area</span>
                <span className="text-[14px] font-bold text-[#121B35] block mt-0.5">{p.area || "—"}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#68646F] font-bold uppercase tracking-wider block">Configuration</span>
                <span className="text-[14px] font-bold text-[#121B35] block mt-0.5">{p.configs?.join(", ") || "—"}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#68646F] font-bold uppercase tracking-wider block">Status</span>
                <span className="text-[14px] font-bold text-[#121B35] block mt-0.5">{statusOf(p)}</span>
              </div>
            </div>

            {(p.amenities?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {p.amenities!.slice(0, 4).map((h) => (
                  <span key={h} className="text-[11px] font-medium text-[#3F3D46]/90 bg-[#F8F7FA] border border-[#E4E0E7]/30 px-3 py-0.5 rounded-lg">{h}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-[#F3F1F5]/40">
            <p className="text-[12px] text-[#68646F]">
              Listed by: <span className="font-bold text-[#121B35]">{p.submittedBy === "user" ? "Owner" : p.builder || "ClearTitle One"}</span>
            </p>
            <div className="flex gap-2.5 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-[#DDAA42] text-[#DDAA42] hover:bg-[#F3F1F5] text-[13px] font-bold transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>View Number</button>
              <button className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-gradient-to-r from-[#DDAA42] to-[#F2C052] hover:from-[#B98428] hover:to-[#DDAA42] text-white text-[13px] font-bold shadow-sm hover:shadow transition-all" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>Submit Enquiry</button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
