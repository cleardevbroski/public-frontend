"use client";
import Link from "@/components/Link";
import { MapPin, ArrowUpRight, Building2 } from "lucide-react";
import { getPropertiesByLocality } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";

const localityImages: Record<string, string> = {
  East: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  West: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  North: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80",
  South: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80",
  Central: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
};
const fallbackImg = "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80";

type Item = { zone: string; count: number };

export default function ExploreLocalities() {
  const groups = useLiveProperties<Item[]>(
    () => getPropertiesByLocality().map(({ zone, count }) => ({ zone, count })),
    []
  );

  const top = groups.slice(0, 6);
  if (top.length === 0) return null;

  return (
    <section className="bg-white py-20">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#D4AF37]">
            <MapPin className="size-4" /> Neighbourhoods
          </span>
          <h2 className="text-[30px] md:text-[40px] font-bold text-[#1E3A8A] mt-1">
            Explore Properties in <span className="text-gold-gradient">Your Locality</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="text-[15px] text-[#6E7488] mt-4">
            Discover homes across Bangalore&apos;s most sought-after zones.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {top.map(({ zone, count }) => (
            <Link
              key={zone}
              href={`/property-in-bangalore-${zone.toLowerCase()}-ffid`}
              className="group relative h-[180px] rounded-2xl overflow-hidden border border-[#D5DEF2]/60 shadow-sm hover:shadow-xl transition-all"
            >
              <img
                src={localityImages[zone] || fallbackImg}
                alt={zone}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B43] via-[#0B1B43]/40 to-transparent" />
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <div className="flex items-center justify-between">
                  <h3 className="text-[19px] font-bold text-white">{zone} Bangalore</h3>
                  <span className="size-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                    <ArrowUpRight className="size-4 text-white group-hover:text-[#1E3A8A]" />
                  </span>
                </div>
                <p className="text-[12px] text-[#E8C66A] font-semibold mt-1 flex items-center gap-1">
                  <Building2 className="size-3.5" />
                  {count} {count === 1 ? "property" : "properties"} available
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
