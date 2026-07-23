"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { ChevronLeft, ChevronRight, Sparkles, User, ArrowUpRight } from "lucide-react";
import PropertyCard from "./PropertyCard";
import { getPublishedProperties } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";
import { useAuth } from "./AuthContext";
import type { Property } from "./mock-data";

export default function RecommendedProperties() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { user, setIsAuthModalOpen } = useAuth();
  const properties = useLiveProperties<Property[]>(
    () => getPublishedProperties().slice(0, 10),
    []
  );

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 660, behavior: "smooth" });
  };

  if (properties.length === 0) return null;

  return (
    <section className="bg-[#F8F7FA] py-16">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.18em] uppercase text-[#DDAA42]">
              <Sparkles className="size-4" /> Curated especially for you
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#121B35] mt-1">
              Recommended <span className="text-gold-gradient">Properties</span>
            </h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollBy(-1)} className="size-11 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center shadow-sm hover:border-[#DDAA42] hover:text-[#DDAA42] transition-all" aria-label="Scroll left">
              <ChevronLeft className="size-5 text-[#121B35]" />
            </button>
            <button onClick={() => scrollBy(1)} className="size-11 rounded-full bg-white border border-[#E4E0E7] flex items-center justify-center shadow-sm hover:border-[#DDAA42] hover:text-[#DDAA42] transition-all" aria-label="Scroll right">
              <ChevronRight className="size-5 text-[#121B35]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          <div ref={scrollerRef} className="flex gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
            {properties.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>

          {/* Guest / user activity sidebar */}
          <aside className="hidden lg:block bg-white rounded-2xl border border-[#E4E0E7]/60 shadow-md p-5 sticky top-24">
            <div className="flex items-center gap-3">
              <span className="size-11 rounded-full bg-gradient-to-br from-[#121B35] to-[#273559] flex items-center justify-center text-white">
                <User className="size-5" />
              </span>
              <div>
                <p className="text-[15px] font-bold text-[#121B35]">
                  {user ? user.name : "Guest User"}
                </p>
                <p className="text-[11px] text-[#68646F]">Your activity dashboard</p>
              </div>
            </div>

            <p className="text-[11px] font-bold tracking-wider uppercase text-[#68646F] mt-5">
              Your Recent Activity
            </p>
            <div className="mt-2 flex items-center justify-between bg-[#FFF8E8] border border-[#F2C052]/40 rounded-xl px-4 py-3">
              <span className="text-[26px] font-extrabold text-[#121B35] leading-none">3</span>
              <span className="size-7 rounded-md bg-white border border-[#F2C052]/50 flex items-center justify-center text-[#DDAA42]">
                <ArrowUpRight className="size-4" />
              </span>
            </div>
            <p className="text-[11px] text-[#68646F] mt-1">Properties viewed</p>

            {user ? (
              <Link href="/account" className="mt-5 w-full h-11 btn-gold rounded-xl flex items-center justify-center text-[13px] font-bold">
                Go to My Account
              </Link>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="mt-5 w-full h-11 btn-gold rounded-xl flex items-center justify-center text-[13px] font-bold"
              >
                Login / Register to Save Activity
              </button>
            )}
            <p className="text-[10.5px] text-[#68646F] text-center mt-2">
              & see your activity across browsers &amp; devices
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
