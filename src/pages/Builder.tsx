"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Link from "@/components/Link";
import { Building2, MapPin, ArrowLeft, ShieldCheck } from "lucide-react";
import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import PropertyCard from "@/components/acres/PropertyCard";
import { getPropertiesByBuilder, getBuilderName } from "@/lib/propertyStore";
import type { Property } from "@/components/acres/mock-data";

export default function BuilderPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [properties, setProperties] = useState<Property[]>([]);
  const [name, setName] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setProperties(getPropertiesByBuilder(slug));
    setName(getBuilderName(slug) || slug.replace(/-/g, " "));
    setMounted(true);
  }, [slug]);

  return (
    <>
      <Header />

      {/* Builder hero */}
      <section className="relative bg-[#0B1B43] py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_15%_20%,#D4AF37_0,transparent_40%),radial-gradient(circle_at_85%_70%,#2E54B8_0,transparent_45%)]" />
        <div className="relative z-10 max-w-[1200px] mx-auto px-5">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-[#E8C66A] text-[13px] font-semibold mb-6 transition-colors">
            <ArrowLeft className="size-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-5">
            <div className="size-[84px] rounded-full bg-white/5 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
              <span className="text-[26px] font-bold text-[#E8C66A] capitalize">
                {name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}
              </span>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] uppercase text-[#D4AF37]">
                <Building2 className="size-3.5" /> Developer
              </span>
              <h1 className="text-[32px] md:text-[44px] font-bold text-white capitalize leading-tight">{name}</h1>
              <p className="text-[14px] text-white/65 mt-1 flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#E8C66A]" />
                {mounted ? properties.length : "—"} verified clear-title{" "}
                {properties.length === 1 ? "project" : "projects"} · Bangalore
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-[#F1F5FF] min-h-[50vh] py-14">
        <div className="max-w-[1200px] mx-auto px-5">
          <h2 className="text-[24px] font-bold text-[#1E3A8A] mb-6 flex items-center gap-2">
            <MapPin className="size-5 text-[#D4AF37]" /> Projects by{" "}
            <span className="text-gold-gradient capitalize">{name}</span>
          </h2>

          {!mounted ? (
            <div className="flex items-center justify-center h-48">
              <div className="size-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              {properties.map((p) => (
                <PropertyCard key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#D5DEF2]/40 rounded-2xl p-12 text-center shadow-sm">
              <Building2 className="size-12 text-[#D5DEF2] mx-auto mb-3" />
              <p className="text-[16px] font-bold text-[#1E3A8A]">No projects found for this builder</p>
              <p className="text-[13px] text-[#6E7488] mt-1">Check back soon — new listings are added regularly.</p>
              <Link
                href="/property-in-bangalore-ffid"
                className="mt-5 inline-block btn-gold px-6 py-3 rounded-xl text-[13px]"
              >
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
