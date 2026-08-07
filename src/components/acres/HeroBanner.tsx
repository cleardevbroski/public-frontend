"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "@/components/Link";
import { Search, MapPin, ShieldCheck, Compass, BadgeCheck, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { bangaloreLocalities } from "./bangalore-data";
import { getHeroSlides, heroHref, type HeroSlide } from "@/lib/heroStore";
import { trackAnalytics } from "@/lib/analytics";

const propertyKinds = ["Apartments", "Villas", "Plots", "Commercial", "PG/Co-living"] as const;

export default function HeroBanner() {
  const [activeKind, setActiveKind] = useState<string>("Apartments");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("Bangalore, IN");
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const load = () => setSlides(getHeroSlides());
    load();
    window.addEventListener("cleartitle:hero-changed", load);
    return () => window.removeEventListener("cleartitle:hero-changed", load);
  }, []);

  const count = slides.length;
  const go = useCallback((dir: 1 | -1) => {
    setIndex((i) => (count ? (i + dir + count) % count : 0));
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  const handleSearch = () => {
    let localityName = "";
    if (selectedLocality !== "Bangalore, IN") {
      localityName = selectedLocality;
    } else {
      const matched = bangaloreLocalities.find(
        (l) => l.name.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (matched) localityName = matched.name;
    }

    let path = "/property-in-bangalore-ffid";
    if (activeKind === "Commercial") {
      path = "/commercial-property-in-bangalore-ffid";
    } else if (activeKind === "Plots") {
      path = "/residential-land-in-bangalore-ffid";
    } else if (activeKind === "PG/Co-living") {
      path = "/pg-in-bangalore-ffid";
    } else if (localityName) {
      path = `/property-in-${localityName.toLowerCase().replace(/\s+/g, "-")}-bangalore-ffid`;
    }
    if (searchQuery.trim() && !localityName) {
      path += `?q=${encodeURIComponent(searchQuery.trim())}`;
    }
    trackAnalytics("search", {
      query: searchQuery.trim() || localityName || "Bangalore",
      searchType: activeKind,
      location: localityName || selectedLocality,
      source: "home_hero",
    });
    window.location.href = path;
  };

  const slide = slides[index];

  return (
    <section className="hero-banner">
      {/* ── Showcase banner (fixed height, image fully visible) ── */}
      <div className="hero-banner__media relative h-[280px] w-full overflow-hidden sm:h-[320px] md:h-[360px]">
        {slides.map((s, i) => (
          <img
            key={s.id}
            src={s.image}
            alt={s.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {/* Whole banner is clickable → slide's destination (below the arrows/dots) */}
        {slide && (
          <Link
            href={heroHref(slide)}
            aria-label={slide.title || "View featured listing"}
            className="absolute inset-0 z-10"
          />
        )}

        {slide && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#050A16]/90 via-[#050A16]/42 to-transparent px-5 pb-10 pt-20 text-white sm:px-10 md:px-16">
              <div className="max-w-[720px]">
                {(slide.resolvedDetails?.propertyType || slide.badge) && (
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {slide.resolvedDetails?.propertyType && <span className="rounded-full border border-[#F2C052]/55 bg-[#0B1328]/65 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#F2C052] backdrop-blur-md">{slide.resolvedDetails.propertyType}</span>}
                    {slide.badge && <span className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">{slide.badge}</span>}
                  </div>
                )}
                <h2 className="text-[22px] font-extrabold leading-tight drop-shadow-md sm:text-[28px] md:text-[34px]">{slide.title}</h2>
                {(slide.location || slide.priceText) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold text-white/85 sm:text-[14px]">
                    {slide.location && <span>{slide.location}</span>}
                    {slide.priceText && <span className="text-[#F2C052]">{slide.priceText}</span>}
                  </div>
                )}
                {(slide.resolvedDetails?.configuration || slide.resolvedDetails?.structure) && (
                  <p className="mt-1.5 line-clamp-1 text-[11px] font-medium text-white/75 sm:text-[13px]">
                    {[slide.resolvedDetails.configuration, slide.resolvedDetails.structure].filter(Boolean).join(" · ")}
                  </p>
                )}
                {(slide.resolvedDetails?.area || slide.resolvedDetails?.possession) && (
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-white/65 sm:text-[12px]">
                    {slide.resolvedDetails.area && <span>{slide.resolvedDetails.area}</span>}
                    {slide.resolvedDetails.possession && <span>{slide.resolvedDetails.possession}</span>}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Arrows */}
        {count > 1 && (
          <>
            <button onClick={() => go(-1)} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 size-9 sm:size-11 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all" aria-label="Previous slide">
              <ChevronLeft className="size-5 text-white" />
            </button>
            <button onClick={() => go(1)} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 size-9 sm:size-11 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all" aria-label="Next slide">
              <ChevronRight className="size-5 text-white" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {slides.map((s, i) => (
                <button key={s.id} onClick={() => setIndex(i)} className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-[#F2C052]" : "w-2 bg-white/55"}`} aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Search + filters + trust (below banner, fully visible) ── */}
      <div className="bg-[#0B1328] pb-7">
        <div className="max-w-[920px] mx-auto px-4">
          {/* search panel overlaps banner bottom slightly without being clipped */}
          <div className="hero-search-panel -mt-8 relative z-20 bg-white border rounded-2xl p-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative sm:w-[200px]">
                <button type="button" onClick={() => setIsLocDropdownOpen((o) => !o)} className="w-full h-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[#F8F7FA] transition-colors cursor-pointer rounded-lg">
                  <MapPin className="size-5 text-[#DDAA42] shrink-0" />
                  <div className="flex-1 leading-tight min-w-0">
                    <span className="block text-[10px] text-[#68646F] font-bold uppercase tracking-wider">Location</span>
                    <span className="block text-[13px] text-[#121B35] font-bold truncate">{selectedLocality}</span>
                  </div>
                  <ChevronDown className="size-4 text-[#68646F] shrink-0" />
                </button>
                {isLocDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 max-h-64 overflow-y-auto bg-white border border-[#E4E0E7] rounded-xl shadow-2xl z-40 no-scrollbar">
                    <button type="button" onClick={() => { setSelectedLocality("Bangalore, IN"); setIsLocDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] text-[#121B35] hover:bg-[#F8F7FA] font-bold cursor-pointer">
                      All Bangalore, IN
                    </button>
                    {bangaloreLocalities.map((loc) => (
                      <button type="button" key={loc.name} onClick={() => { setSelectedLocality(loc.name); setIsLocDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-[13px] text-[#3F3D46] hover:bg-[#F8F7FA] flex justify-between items-center cursor-pointer">
                        <span className="font-medium">{loc.name}</span>
                        <span className="text-[10px] text-[#68646F]">{loc.zone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden sm:block w-px bg-[#E4E0E7] my-2" />

              <div className="flex-1 flex items-center gap-2 px-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search locality, project or property type"
                  className="w-full bg-transparent outline-none text-[14px] text-[#121B35] placeholder:text-[#68646F] py-3"
                />
              </div>

              <button onClick={handleSearch} className="btn-gold flex items-center justify-center gap-2 px-8 py-3.5 text-[14px] shrink-0 cursor-pointer rounded-lg">
                <Search className="size-4.5" strokeWidth={2.5} />
                Search
              </button>
            </div>
          </div>

          {/* Kind pills */}
          <div className="mt-4 flex flex-wrap gap-2.5 justify-center">
            {propertyKinds.map((kind) => (
              <button key={kind} onClick={() => setActiveKind(kind)} className={`px-4 py-1.5 text-[12.5px] font-semibold transition-all duration-200 cursor-pointer border rounded-lg ${activeKind === kind ? "bg-[#DDAA42] text-[#0B1328] border-[#DDAA42]" : "bg-white/10 text-white/85 border-white/15 hover:bg-white/20"}`}>
                {kind}
              </button>
            ))}
          </div>

          {/* Trust strip */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { icon: ShieldCheck, title: "Verified Properties", sub: "100% Clear Title Guarantee" },
              { icon: BadgeCheck, title: "Trusted Advisory", sub: "Expert Guidance, No Hidden Costs" },
              { icon: Compass, title: "Prime Locations", sub: "Top Properties Across Bangalore" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3.5 rounded-xl">
                <div className="size-10 bg-[#DDAA42]/20 border border-[#DDAA42]/30 flex items-center justify-center shrink-0 rounded-lg">
                  <Icon className="size-5 text-[#F2C052]" />
                </div>
                <div className="leading-tight">
                  <p className="text-[13.5px] font-bold text-white">{title}</p>
                  <p className="text-[11px] text-white/55">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
