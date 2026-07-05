"use client";
import Link from "@/components/Link";
import Image from "@/components/Image";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { getFeaturedProperties } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";
import type { Property } from "./mock-data";

const isBase64 = (src: string) => src.startsWith("data:");

function statusOf(p: Property): string {
  if (p.possession === "Ready to Move") return "Ready to Move";
  if (p.ageOfProperty === "Under Construction") return "Under Construction";
  return p.badges?.[0] || "New Launch";
}

export default function FeaturedPropertyShowcase() {
  const featured = useLiveProperties<Property[]>(() => getFeaturedProperties(6), []);

  return (
    <section className="relative bg-[#0B1B43] py-20 overflow-hidden">
      {/* subtle texture */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_20%_20%,#D4AF37_0,transparent_40%),radial-gradient(circle_at_80%_60%,#2E54B8_0,transparent_45%)]" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-[32px] md:text-[40px] font-bold text-white">
            Explore <span className="text-gold-gradient">Featured Projects</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="text-[15px] text-white/65 mt-4">
            Handpicked Premium Properties with <span className="text-[#E8C66A]">Clear Titles</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => (
            <Link
              key={p.id}
              href={`/property/${p.id}`}
              className="group relative rounded-2xl overflow-hidden bg-[#1E3A8A] border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-[210px] overflow-hidden">
                {isBase64(p.image) ? (
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <Image src={p.image} alt={p.title} fill sizes="380px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A] via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-[#D4AF37] text-[#1E3A8A] text-[10px] font-bold px-2.5 py-1 rounded-md shadow">
                  {statusOf(p)}
                </span>
                <span className="absolute top-3 right-3 bg-[#0B1B43]/80 backdrop-blur-sm text-[#E8C66A] text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-[#D4AF37]/30">
                  <ShieldCheck className="size-3" /> CLEAR TITLE
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-[18px] font-bold text-white group-hover:text-[#E8C66A] transition-colors leading-snug">
                  {p.title}
                </h3>
                <p className="text-[12px] text-white/55 mt-1 flex items-center gap-1">
                  <MapPin className="size-3.5 text-[#D4AF37]" /> {p.subtitle}
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-white/45 uppercase tracking-wider font-bold">Starts from</p>
                    <p className="text-[20px] font-extrabold text-[#E8C66A] leading-none mt-1">{p.price}</p>
                  </div>
                  <span className="size-9 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                    <ArrowRight className="size-4 text-[#E8C66A] group-hover:text-[#1E3A8A] transition-colors" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/property-in-bangalore-ffid"
            className="inline-flex items-center gap-2 btn-gold px-8 py-3.5 rounded-xl text-[14px]"
          >
            View All Projects
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
