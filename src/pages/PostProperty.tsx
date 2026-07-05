"use client";

import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import PropertyForm from "@/components/admin/PropertyForm";
import { ShieldCheck, BadgeCheck, Clock, Gift } from "lucide-react";

export default function PostPropertyPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="relative bg-[#0B1B43] overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1B43] via-[#0B1B43]/90 to-[#0B1B43]/70" />
        </div>
        <div className="relative z-10 max-w-[1100px] mx-auto px-5 py-16 md:py-20">
          <span className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-[#D4AF37]/30 rounded-full px-4 py-1.5 text-[#E8C66A] text-[11px] font-semibold tracking-[0.2em] uppercase">
            <Gift className="size-3.5" /> List Your Property — Free
          </span>
          <h1 className="text-[34px] md:text-[48px] font-bold text-white leading-tight mt-5 max-w-2xl">
            Post Your Property on <span className="text-gold-gradient">ClearTitle One</span>
          </h1>
          <p className="text-[15px] text-white/70 mt-4 max-w-xl">
            Fill in your property details below. Our team verifies every listing for a clear title before it goes
            live — so buyers reach you with confidence.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {[
              { icon: ShieldCheck, label: "Title Verification" },
              { icon: BadgeCheck, label: "Free Listing" },
              { icon: Clock, label: "Quick Approval" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                <Icon className="size-4.5 text-[#E8C66A]" />
                <span className="text-[13px] font-bold text-white">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="bg-[#EEF3FE] py-12 md:py-16">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="mb-8 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[13.5px] text-amber-800">
              <span className="font-bold">Listings are reviewed before going live.</span> After you submit, your
              property enters our verification queue. Our team checks the details and publishes it once approved.
            </p>
          </div>
          <PropertyForm mode="public" />
        </div>
      </main>

      <Footer />
    </>
  );
}
