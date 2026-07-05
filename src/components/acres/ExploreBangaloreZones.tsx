"use client";
import { useState } from "react";
import Link from "@/components/Link";
import { MapPin, ArrowRight, TrendingUp, Building2, Landmark, ShieldCheck } from "lucide-react";
import { bangaloreZones, bangaloreLocalities, type BangaloreZone } from "./bangalore-data";

export default function ExploreBangaloreZones() {
  const [activeZone, setActiveZone] = useState<BangaloreZone>("East");
  const zones = Object.keys(bangaloreZones) as BangaloreZone[];
  const currentZone = bangaloreZones[activeZone];

  // Calculate stats dynamically for the selected zone
  const zoneLocalities = bangaloreLocalities.filter(l => l.zone === activeZone);
  const totalProperties = zoneLocalities.reduce((sum, l) => sum + l.properties, 0);
  const avgPriceSum = zoneLocalities.reduce((sum, l) => sum + parseInt(l.avgPrice.replace(/[^0-9]/g, "")), 0);
  const avgPrice = zoneLocalities.length > 0 ? Math.round(avgPriceSum / zoneLocalities.length) : 0;
  const highestAppreciating = zoneLocalities.reduce((prev, current) => {
    const prevVal = parseInt(prev.appreciation.replace(/[^0-9]/g, ""));
    const currVal = parseInt(current.appreciation.replace(/[^0-9]/g, ""));
    return currVal > prevVal ? current : prev;
  }, zoneLocalities[0] || { name: "N/A", appreciation: "0%" });

  return (
    <section className="bg-white py-16">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <p className="acres-overline">Geographic Insights</p>
          <h2 className="text-[28px] font-bold text-[#1E3A8A] mt-1" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
            Explore Regions & Localities
          </h2>
          <p className="text-[14px] text-[#6E7488] mt-1 max-w-2xl mx-auto">
            Switch between Bangalore zones to explore live listings, real-time rates, and investment heatmaps.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 bg-[#F1F5FF]/35 border border-[#D5DEF2]/40 rounded-3xl p-6 md:p-8 shadow-md">
          
          {/* Left Side: Interactive Menu List */}
          <div className="flex flex-col gap-2 border-r border-[#E2E9FB]/60 pr-0 lg:pr-6">
            <span className="text-[10px] font-bold tracking-widest text-[#6E7488] uppercase mb-2">Select Territory</span>
            {zones.map((z) => (
              <button
                key={z}
                onClick={() => setActiveZone(z)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[14px] font-bold text-left transition-all duration-300 ${
                  activeZone === z
                    ? "bg-[#1E3A8A] text-[#E8C66A] shadow-md scale-[1.02]"
                    : "bg-white text-[#243559] hover:bg-[#E2E9FB]/30 hover:text-[#C9A24E] border border-[#D5DEF2]/30"
                }`}
              >
                <span>{z} Bangalore</span>
                <ChevronRightIcon className="size-4" />
              </button>
            ))}
          </div>

          {/* Right Side: Dynamic Presentation Panel */}
          <div className="flex flex-col justify-between animate-in fade-in duration-500">
            <div>
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-[22px] font-bold text-[#1E3A8A]">{currentZone.name}</h3>
                  <p className="text-[14px] text-[#243559]/80 mt-1">{currentZone.description}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#E2E9FB] text-[#C9A24E] text-[11px] font-bold px-3 py-1.5 rounded-full border border-[#D5DEF2]/40">
                  <TrendingUp className="size-3.5" />
                  {activeZone === "East" || activeZone === "North" || activeZone === "Central" ? "PREMIUM GROWTH ZONE" : "STABLE YIELD ZONE"}
                </div>
              </div>

              {/* Stats Block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4.5 rounded-2xl border border-[#D5DEF2]/30 shadow-sm">
                  <div className="flex items-center gap-2 text-[#6E7488] text-[11px] font-bold uppercase tracking-wider">
                    <Building2 className="size-4 text-[#C9A24E]" />
                    Total Properties
                  </div>
                  <p className="text-[22px] font-extrabold text-[#1E3A8A] mt-2">
                    {totalProperties.toLocaleString()}+ Listings
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-[#D5DEF2]/30 shadow-sm">
                  <div className="flex items-center gap-2 text-[#6E7488] text-[11px] font-bold uppercase tracking-wider">
                    <Landmark className="size-4 text-[#D4AF37]" />
                    Avg Market Rate
                  </div>
                  <p className="text-[22px] font-extrabold text-[#1E3A8A] mt-2">
                    ₹{avgPrice.toLocaleString("en-IN")}/sqft
                  </p>
                </div>

                <div className="bg-white p-4.5 rounded-2xl border border-[#D5DEF2]/30 shadow-sm">
                  <div className="flex items-center gap-2 text-[#6E7488] text-[11px] font-bold uppercase tracking-wider">
                    <ShieldCheck className="size-4 text-[#C9A24E]" />
                    Top Performer
                  </div>
                  <p className="text-[15px] font-bold text-[#1E3A8A] mt-2 leading-none">
                    {highestAppreciating.name}
                  </p>
                  <p className="text-[11px] text-[#C9A24E] font-semibold mt-1">
                    {highestAppreciating.appreciation} Growth
                  </p>
                </div>
              </div>

              {/* Localities Tags */}
              <div className="mb-6">
                <span className="text-[11px] font-bold tracking-wider text-[#6E7488] uppercase block mb-3">
                  Signature Localities in {activeZone} Bangalore
                </span>
                <div className="flex flex-wrap gap-2">
                  {zoneLocalities.map((loc) => (
                    <Link
                      key={loc.name}
                      href={`/property-in-${loc.name.toLowerCase().replace(/\s+/g, "-")}-bangalore-ffid`}
                      className="text-[12px] bg-white border border-[#D5DEF2]/40 text-[#243559] hover:border-[#C9A24E] hover:text-[#C9A24E] px-3 py-2 rounded-xl transition-all shadow-sm hover:shadow"
                    >
                      <span className="font-semibold">{loc.name}</span>
                      <span className="text-white/0 select-none px-0.5">•</span>
                      <span className="text-[11px] text-[#6E7488]">{loc.avgPrice}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="mt-4 pt-4 border-t border-[#E2E9FB]/60 flex items-center justify-between flex-wrap gap-4">
              <span className="text-[12px] text-[#6E7488] flex items-center gap-1.5">
                <MapPin className="size-4 text-[#C9A24E]" />
                All local developers and agencies verified by ClearTitle 1.
              </span>
              
              <Link
                href={`/property-in-bangalore-${activeZone.toLowerCase()}-ffid`}
                className="inline-flex items-center gap-2 bg-[#1E3A8A] text-[#E8C66A] hover:bg-[#C9A24E] hover:text-white font-bold text-[13px] px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:scale-[1.02]"
              >
                Browse {activeZone} Bangalore Portfolio
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
