"use client";

import Link from "@/components/Link";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  IndianRupee,
  Search,
  SlidersHorizontal,
  Star,
  School,
  Hospital,
  Train,
  Building,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { trackAnalytics } from "@/lib/analytics";
import Header from "./Header";
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";
import PostPropertyRail from "./PostPropertyRail";
import {
  bangaloreLocalities,
  bangaloreZones,
  getListingsByKind,
  type BangaloreRoute,
  type BangaloreZone,
  getLocalitiesByZone,
  getLocalityByName,
  bangaloreRoutes,
} from "./bangalore-data";
import { getPublishedProperties } from "@/lib/propertyStore";
import { useLiveProperties } from "@/lib/useLiveProperties";
import type { Property } from "./mock-data";
import PropertyListingRow from "./PropertyListingRow";
import { filterListingProperties } from "@/lib/listingFilter";
import type { ListingKind } from "./bangalore-data";

const filterGroups = [
  ["Verified Only", "Direct Owner", "RERA Mandated", "With Photos"],
  ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Villa Portfolio"],
  ["Ready To Move", "Under Construction", "New Project Launch"],
  ["Power Backup", "Swimming Pool", "Parking Spot", "Gymnasium"],
];

const featureLinks = bangaloreRoutes.filter((route) =>
  [
    "property-in-bangalore-ffid",
    "property-for-rent-in-bangalore-ffid",
    "new-projects-in-bangalore-ffid",
    "residential-land-in-bangalore-ffid",
    "pg-in-bangalore-ffid",
    "commercial-property-in-bangalore-ffid",
    "commercial-property-for-rent-in-bangalore-ffid",
    "property-rates-and-price-trends-in-bangalore-prffid",
    "postproperty",
  ].includes(route.slug)
);

function extractZoneFromSlug(slug: string): BangaloreZone | null {
  if (slug.includes("east")) return "East";
  if (slug.includes("west")) return "West";
  if (slug.includes("north")) return "North";
  if (slug.includes("south")) return "South";
  if (slug.includes("central")) return "Central";
  return null;
}

function extractLocalityFromSlug(slug: string): string | null {
  const match = slug.match(/property-in-([a-z-]+)-bangalore/);
  if (match) {
    return match[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return null;
}

function ListingPage({ route, query = "" }: { route: BangaloreRoute; query?: string }) {
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(query);
  const typeToSlug: Record<string, string> = {
    buy: "property-in-bangalore-ffid",
    rent: "property-for-rent-in-bangalore-ffid",
    lease: "commercial-property-for-rent-in-bangalore-ffid",
    projects: "new-projects-in-bangalore-ffid",
    commercial: "commercial-property-in-bangalore-ffid",
    plots: "residential-land-in-bangalore-ffid",
  };
  const zone = extractZoneFromSlug(route.slug);
  const localityName = extractLocalityFromSlug(route.slug);

  let zoneInfo = zone ? bangaloreZones[zone] : null;
  let localityInfo = localityName ? getLocalityByName(localityName) : null;
  let filteredLocalities = zone ? getLocalitiesByZone(zone) : bangaloreLocalities;

  const allProperties = useLiveProperties<Property[]>(() => getPublishedProperties(), []);
  const listings = filterListingProperties({
    properties: allProperties,
    kind: route.kind as ListingKind,
    zone,
    locality: localityInfo?.name ?? null,
    filters: activeFilters,
    query,
  });

  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-screen pb-16">
        
        {/* Listings Sub-Header */}
        <div className="bg-white border-b border-[#F3F1F5]/65">
          <div className="max-w-[1200px] mx-auto px-4 py-6">
            <div className="text-[12px] text-[#68646F] font-bold uppercase tracking-wider mb-2">
              <Link href="/" className="text-[#DDAA42] hover:underline">Home</Link>
              <span className="mx-2 text-[#68646F]/60">›</span>
              {zone && (
                <>
                  <Link href="/property-in-bangalore-ffid" className="text-[#DDAA42] hover:underline">Bangalore</Link>
                  <span className="mx-2 text-[#68646F]/60">›</span>
                  <span>{zone} Region</span>
                </>
              )}
              {localityInfo && (
                <>
                  <Link href="/property-in-bangalore-ffid" className="text-[#DDAA42] hover:underline">Bangalore</Link>
                  <span className="mx-2 text-[#68646F]/60">›</span>
                  <span>{localityInfo.name} Locality</span>
                </>
              )}
              {!zone && !localityInfo && <span>{route.title}</span>}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
              <div>
                <p className="text-[13px] text-[#68646F] font-semibold">
                  {route.resultCount || listings.length} Verified results found
                </p>
                <h1 className="text-[28px] font-bold text-[#121B35] mt-1" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
                  {route.title}
                </h1>
                <p className="text-[14px] text-[#3F3D46]/80 mt-1.5 max-w-3xl leading-relaxed">
                  {route.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[#F3F1F5] border border-[#E4E0E7]/40 px-4 py-2.5 rounded-xl text-[#DDAA42] text-[13px] font-bold shadow-sm">
                <ShieldCheck className="size-4.5 text-[#DDAA42]" />
                RERA Title Checks Mandated
              </div>
            </div>

            {/* Quick Search Row */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const sel = (e.currentTarget.elements.namedItem("type") as HTMLSelectElement)?.value || "buy";
                const base = typeToSlug[sel] ?? "property-in-bangalore-ffid";
                const q = searchInput.trim();
                trackAnalytics("search", { query: q || zone || localityInfo?.name || "Bangalore", searchType: sel, location: zone || localityInfo?.name || "Bangalore", source: "listing_search" });
                navigate(q ? `/${base}?q=${encodeURIComponent(q)}` : `/${base}`);
              }}
              className="mt-6 flex items-center bg-white rounded-xl border border-[#E4E0E7]/50 shadow-sm overflow-hidden max-w-3xl"
            >
              <div className="relative h-12 flex items-center border-r border-[#E4E0E7]/40 bg-slate-50 cursor-pointer">
                <select name="type" className="appearance-none outline-none bg-transparent pl-4.5 pr-8 text-[13px] font-bold text-[#121B35] cursor-pointer h-full w-full">
                  <option value="buy">Buy</option>
                  <option value="rent">Rent</option>
                  <option value="lease">Lease</option>
                  <option value="projects">New Projects</option>
                  <option value="commercial">Commercial</option>
                  <option value="plots">Plots</option>
                </select>
                <ChevronDown className="size-4 text-[#68646F] absolute right-2.5 pointer-events-none" />
              </div>
              <input
                name="q"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 h-12 outline-none px-4 text-[13.5px] placeholder:text-[#68646F]/80"
                placeholder={`Search builders, projects, or localities in ${zone || localityInfo?.name || "Bangalore"}...`}
              />
              <button type="submit" className="h-12 px-6 bg-[#121B35] text-[#F2C052] hover:bg-[#DDAA42] hover:text-[#0B1328] font-bold text-[14px] flex items-center gap-2 transition-colors">
                <Search className="size-4.5" />
                Find Spaces
              </button>
            </form>
          </div>
        </div>

        {/* Mobile filter toggle */}
        <div className="max-w-[1200px] mx-auto px-4 mt-6 lg:hidden">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-white border border-[#E4E0E7] text-[#121B35] font-bold text-[14px] shadow-sm"
          >
            <SlidersHorizontal className="size-4.5 text-[#DDAA42]" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {activeFilters.length > 0 && (
              <span className="ml-1 bg-[#DDAA42] text-[#0B1328] text-[11px] font-bold px-2 py-0.5 rounded-full">{activeFilters.length}</span>
            )}
          </button>
        </div>

        {/* Listings Section Layout */}
        <div className="max-w-[1200px] mx-auto px-4 mt-4 lg:mt-8 grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">

          {/* Left Filters Sidebar */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block space-y-6`}>
            <div className="bg-white border border-[#E4E0E7]/30 rounded-2xl p-5 lg:sticky lg:top-24 shadow-sm">
              <h3 className="text-[16px] font-bold text-[#121B35] flex items-center gap-2 border-b border-[#F3F1F5]/65 pb-3">
                <SlidersHorizontal className="size-4.5 text-[#DDAA42]" />
                Filter Portfolio
              </h3>
              <div className="mt-5 space-y-6">
                {filterGroups.map((group, idx) => (
                  <div key={idx}>
                    <p className="text-[11px] text-[#68646F] font-bold uppercase tracking-wider mb-2.5">
                      {["Source Type", "Unit Configuration", "Development Status", "Key Amenities"][idx]}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.map((filter) => {
                        const isActive = activeFilters.includes(filter);
                        return (
                          <button
                            key={filter}
                            onClick={() => setActiveFilters(prev => prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter])}
                            className={`text-[12px] font-semibold border ${isActive ? "border-[#DDAA42] text-[#0B1328] bg-[#DDAA42]" : "border-[#E4E0E7]/40 text-[#3F3D46]/85 hover:border-[#DDAA42] hover:text-[#DDAA42] bg-white"} rounded-xl px-3 py-1.5 transition-all shadow-sm`}
                          >
                            {filter}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Region Links */}
              {(zone || localityInfo) && (
                <div className="mt-6 pt-5 border-t border-[#F3F1F5]/65">
                  <p className="text-[11px] text-[#68646F] font-bold uppercase tracking-wider mb-2.5">
                    {zone ? "Explore Zone Localities" : "Nearby Territory Sites"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {filteredLocalities.slice(0, 6).map((loc) => (
                      <Link
                        key={loc.name}
                        href={`/property-in-${loc.name.toLowerCase().replace(/\s+/g, "-")}-bangalore-ffid`}
                        className="text-[11px] border border-[#E4E0E7]/40 text-[#3F3D46]/80 rounded-lg px-2.5 py-1 hover:border-[#DDAA42] hover:text-[#DDAA42] bg-slate-50 transition-all"
                      >
                        {loc.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right Listings Feed */}
          <section className="space-y-6">
            
            {/* Locality Profile Summary */}
            {localityInfo && (
              <div className="bg-white border border-[#E4E0E7]/30 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#121B35]">{localityInfo.name} Market Profile</h2>
                    <p className="text-[13px] text-[#68646F] mt-1">
                      Zone: {localityInfo.zone} Bangalore • Liveability score: {localityInfo.rating} ★
                    </p>
                  </div>
                  <div className="text-left md:text-right bg-[#F8F7FA] border border-[#E4E0E7]/20 rounded-xl p-3">
                    <p className="text-[20px] font-extrabold text-[#DDAA42] leading-none">{localityInfo.avgPrice}</p>
                    <p className="text-[11px] text-[#68646F] mt-1 font-semibold">Avg rent: {localityInfo.rent}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#F3F1F5]/65 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F8F7FA] flex items-center justify-center">
                      <School className="size-4.5 text-[#DDAA42]" />
                    </div>
                    <span className="text-[12px] font-bold text-[#121B35]">{localityInfo.schools.length}+ Academies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF5F3] flex items-center justify-center">
                      <Hospital className="size-4.5 text-orange-500" />
                    </div>
                    <span className="text-[12px] font-bold text-[#121B35]">{localityInfo.hospitals.length}+ Hospitals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F8F7FA] flex items-center justify-center">
                      <Building className="size-4.5 text-[#DDAA42]" />
                    </div>
                    <span className="text-[12px] font-bold text-[#121B35]">{localityInfo.itParks.length}+ IT Parks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFF9EC] flex items-center justify-center">
                      <Train className="size-4.5 text-[#DDAA42]" />
                    </div>
                    <span className="text-[12px] font-bold text-[#121B35]">{localityInfo.metroStations.length} Transit nodes</span>
                  </div>
                </div>
                <div className="mt-4 text-[12px] text-[#DDAA42] font-bold flex items-center gap-1">
                  <TrendingUp className="size-3.5" />
                  {localityInfo.appreciation} Rate Appreciation tracked YoY
                </div>
              </div>
            )}

            {/* Zone Overview Summary */}
            {zone && zoneInfo && (
              <div className="bg-white border border-[#E4E0E7]/30 rounded-2xl p-6 shadow-sm">
                <h2 className="text-[18px] font-bold text-[#121B35]">{zoneInfo.name} Regional Overview</h2>
                <p className="text-[13.5px] text-[#3F3D46]/85 mt-1.5 leading-relaxed">{zoneInfo.description}</p>
                <div className="mt-4 pt-4 border-t border-[#F3F1F5]/60">
                  <span className="text-[11px] text-[#68646F] uppercase font-bold tracking-wider block mb-2.5">Core Tech Hubs</span>
                  <div className="flex flex-wrap gap-1.5">
                    {zoneInfo.localities.slice(0, 8).map((loc) => (
                      <Link
                        key={loc}
                        href={`/property-in-${loc.toLowerCase().replace(/\s+/g, "-")}-bangalore-ffid`}
                        className="text-[11.5px] bg-[#F8F7FA] text-[#3F3D46] border border-[#E4E0E7]/20 px-3 py-1 rounded-lg hover:border-[#DDAA42] hover:text-[#DDAA42] transition-all font-semibold"
                      >
                        {loc}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Active Chips Toolbar */}
            <div className="flex items-center justify-between bg-white border border-[#E4E0E7]/30 rounded-2xl px-5 py-3.5 shadow-sm">
              <div className="flex flex-wrap gap-1.5">
                {["Direct-to-Owner", "Verified Only", "RERA Compliant"].map((chip) => (
                  <span
                    key={chip}
                    className="text-[11.5px] font-bold bg-[#F8F7FA] border border-[#E4E0E7]/20 text-[#3F3D46] px-3.5 py-1 rounded-full shadow-inner"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <button className="text-[13px] text-[#DDAA42] hover:text-[#B98428] font-bold flex items-center gap-1">
                Filter Results
                <ChevronDown className="size-4" />
              </button>
            </div>

            {/* Listings Grid */}
            <div className="space-y-6">
              {listings.length > 0 ? (
                listings.map((p) => <PropertyListingRow key={p.id} p={p} />)
              ) : (
                <div className="bg-white border border-[#E4E0E7]/30 rounded-2xl p-12 text-center shadow-sm">
                  <p className="text-[15px] font-bold text-[#121B35]">No Properties Found</p>
                  <p className="text-[13px] text-[#68646F] mt-1">There are no matched properties listed in this locality.</p>
                  <Link
                    href="/property-in-bangalore-ffid"
                    className="mt-4 inline-block bg-[#121B35] text-[#F2C052] px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#DDAA42] hover:text-[#0B1328] transition-all shadow"
                  >
                    Browse All Bangalore Portfolios
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <CookieBanner />
      <PostPropertyRail />
    </>
  );
}

function CityOverview({ route }: { route: BangaloreRoute }) {
  return (
    <>
      <Header />
      <main className="bg-white pb-16">
        
        {/* Banner Area */}
        <section className="bg-gradient-to-br from-[#121B35] via-[#273559] to-[#121B35] text-white py-16 border-b border-[#DDAA42]/25 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-gradient-to-br from-[#F2C052]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-[1200px] mx-auto px-4 grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center relative z-10">
            <div className="text-left">
              <span className="text-[11px] text-[#DDAA42] font-bold tracking-widest uppercase">ClearTitle One Municipal Guide</span>
              <h1 className="text-[36px] md:text-[46px] font-bold mt-2 leading-none" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
                {route.title}
              </h1>
              <p className="text-[15px] text-white/80 mt-3.5 max-w-2xl leading-relaxed">
                {route.subtitle}
              </p>
              
              <div className="mt-6 flex flex-wrap gap-2">
                {featureLinks.slice(1, 6).map((l) => (
                  <Link
                    key={l.slug}
                    href={`/${l.slug}`}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl text-[12.5px] font-bold transition-all"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stat Box */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-3xl p-6 shadow-2xl text-left">
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block">Aggregated Municipal Data</span>
              <p className="text-[36px] font-extrabold text-[#F2C052] mt-2.5 leading-none">{route.heroStat || "52K+ listings"}</p>
              <p className="text-[12.5px] text-white/70 mt-2">Verified listings monitored across premium East, South, and North Bangalore industrial zones.</p>
              <div className="grid grid-cols-2 gap-2 mt-5">
                {["Whitefield Hub", "Hebbal Airport Corridor", "Koramangala Suites", "Bellandur Tech Belt"].map((x) => (
                  <div key={x} className="bg-white/10 rounded-xl p-2.5 text-[12px] font-bold text-center border border-white/5">{x}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Localities Rates Grid */}
        <section className="max-w-[1200px] mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <p className="acres-overline">Price Heatmap</p>
            <h2 className="text-[26px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
              Municipal Property Benchmarks
            </h2>
            <p className="text-[13.5px] text-[#68646F] mt-1">
              Check average rates, growth ratios, and average lease demands across key locations.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mt-6 text-left">
            {bangaloreLocalities.map((loc) => (
              <div
                key={loc.name}
                className="border border-[#E4E0E7]/30 hover:border-[#DDAA42]/40 bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[#121B35] group-hover:text-[#DDAA42] transition-colors">{loc.name}</h3>
                  <span className="text-[11px] font-bold text-[#DDAA42] bg-[#F8F7FA] border border-[#E4E0E7]/30 px-2 py-0.5 rounded-full">{loc.rating} ★</span>
                </div>
                <p className="text-[22px] font-extrabold text-[#DDAA42] mt-3">{loc.avgPrice}</p>
                <p className="text-[12px] text-[#68646F] mt-0.5 font-semibold">Avg rent: {loc.rent}</p>
                
                <div className="mt-4 pt-3 border-t border-[#F3F1F5]/60 flex items-center justify-between text-[11px] text-[#68646F] font-semibold">
                  <span>Growth: <span className="text-[#DDAA42]">{loc.appreciation}</span></span>
                  <span>Demand: <span className="text-[#121B35]">{loc.demand}</span></span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <CookieBanner />
      <PostPropertyRail />
    </>
  );
}

function ToolsPage({ route }: { route: BangaloreRoute }) {
  const isLoan = route.kind === "home-loan";
  const isConverter = route.kind === "area-converter";
  const isReceipt = route.kind === "rent-receipt";
  const isPost = route.kind === "post-property";

  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-screen pb-16">
        
        {/* Banner */}
        <section className="bg-white border-b border-[#F3F1F5]/65">
          <div className="max-w-[1200px] mx-auto px-4 py-12 grid lg:grid-cols-[1fr_420px] gap-8 items-center text-left">
            <div>
              <p className="acres-overline">Calculators & Support</p>
              <h1 className="text-[32px] font-bold text-[#121B35] mt-1" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
                {route.title}
              </h1>
              <p className="text-[14.5px] text-[#68646F] mt-2 leading-relaxed max-w-2xl">
                {route.subtitle}
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/property-in-bangalore-ffid"
                  className="bg-[#121B35] text-[#F2C052] hover:bg-[#DDAA42] hover:text-[#0B1328] px-5 py-3 rounded-xl font-bold text-[13px] transition-all shadow-md"
                >
                  Browse Portfolio
                </Link>
                <Link
                  href="/property-rates-and-price-trends-in-bangalore-prffid"
                  className="border border-[#DDAA42] text-[#DDAA42] hover:bg-[#F3F1F5]/30 px-5 py-3 rounded-xl font-bold text-[13px] transition-all"
                >
                  Market Value Insights
                </Link>
              </div>
            </div>

            <div className="bg-[#121B35] rounded-3xl p-6 text-white border border-[#DDAA42]/25 shadow-xl text-left">
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block">Tool Spotlight</span>
              <p className="text-[32px] font-extrabold text-[#F2C052] mt-2 leading-none">{route.heroStat}</p>
              <p className="text-[12.5px] text-white/70 mt-2 leading-relaxed">Fully customized for Karnataka layout calculations and RERA compliant guidelines.</p>
            </div>
          </div>
        </section>

        {/* Interactive Workspace */}
        <section className="max-w-[1200px] mx-auto px-4 py-12 grid lg:grid-cols-[1fr_360px] gap-8 text-left">
          <div className="bg-white border border-[#E4E0E7]/30 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-[20px] font-bold text-[#121B35] mb-4">Interactive Tool Console</h2>
            
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {(isLoan
                ? ["Expected Property value (₹)", "Down payment amount (₹)", "Interest rate (%)", "Tenure (Years)"]
                : isConverter
                ? ["Sq.ft area value", "From layout unit (sqft)", "To target unit (acres)", "Calculated boundary"]
                : isReceipt
                ? ["Tenant Full Name", "Monthly rent paid (₹)", "Mailing address", "Receipt Cycle Month"]
                : ["Asset details", "Locality bounds", "Expected sale value", "Lister Mobile number"]
              ).map((field) => (
                <label key={field} className="block">
                  <span className="text-[11px] font-bold text-[#3F3D46]/85 uppercase tracking-wider block mb-1">{field}</span>
                  <input
                    className="w-full h-11 rounded-xl border border-[#E4E0E7]/40 px-3 outline-none text-[13.5px] focus:border-[#DDAA42] transition-colors bg-slate-50"
                    placeholder={`Enter ${field.toLowerCase()}`}
                  />
                </label>
              ))}
            </div>
            
            <button className="mt-6 bg-[#121B35] hover:bg-[#DDAA42] text-[#F2C052] hover:text-[#0B1328] font-bold h-11 px-6 rounded-xl transition-all shadow">
              {isPost ? "Post Free Layout Ad" : "Execute Calculations"}
            </button>
          </div>

          <aside className="space-y-4">
            {["RERA Monitored Records", "Direct Verification", "Zero Broker loops"].map((x) => (
              <div
                key={x}
                className="bg-white border border-[#E4E0E7]/20 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
              >
                <CheckCircle2 className="size-5 text-[#DDAA42]" />
                <span className="text-[13.5px] font-bold text-[#121B35]">{x}</span>
              </div>
            ))}
          </aside>
        </section>

      </main>
      <Footer />
      <CookieBanner />
      <PostPropertyRail />
    </>
  );
}

function TrendsPage({ route }: { route: BangaloreRoute }) {
  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-screen py-10 text-left">
        <div className="max-w-[1200px] mx-auto px-4">
          
          <div className="bg-white border border-[#E4E0E7]/30 rounded-3xl p-6 md:p-8 shadow-sm">
            <span className="text-[11px] text-[#DDAA42] font-bold tracking-widest uppercase block">Regulatory Insights</span>
            <h1 className="text-[32px] font-bold text-[#121B35] mt-2" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
              {route.title}
            </h1>
            <p className="text-[14px] text-[#68646F] mt-1">{route.subtitle}</p>
          </div>

          {/* Rates Grid */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            {bangaloreLocalities.map((loc) => (
              <div
                key={loc.name}
                className="bg-white border border-[#E4E0E7]/30 rounded-2xl p-5 shadow-sm group hover:border-[#DDAA42]/50 hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-[#121B35] group-hover:text-[#DDAA42] transition-colors">{loc.name}</h3>
                  <Star className="size-4 text-[#DDAA42] fill-[#DDAA42]" />
                </div>
                <p className="text-[22px] font-extrabold text-[#DDAA42] mt-3">{loc.avgPrice}</p>
                <p className="text-[12px] text-[#68646F] font-semibold">Rent benchmark: {loc.rent}</p>
                
                <div className="h-1.5 bg-[#F3F1F5]/60 rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#DDAA42] to-[#273559] rounded-full"
                    style={{ width: `${62 + loc.name.length * 2}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#68646F] mt-2 font-bold uppercase tracking-wider">
                  Demand: {loc.demand}
                </p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white border border-[#E4E0E7]/30 rounded-2xl p-6 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#121B35]">Real Estate Market Summary</h2>
              <p className="text-[13.5px] text-[#3F3D46]/85 mt-3 leading-relaxed">
                Whitefield, Hebbal and Sarjapur Road continue to lead municipal buyer searches due to rapid IT corridor expansion, upcoming Namma Metro Phase 2 lines, and stable commercial layouts. North Bangalore corridors near Devanahalli show emerging plotted layout demand.
              </p>
            </div>
            
            <div className="bg-white border border-[#E4E0E7]/30 rounded-2xl p-6 shadow-sm">
              <h2 className="text-[18px] font-bold text-[#121B35]">Top Verified Developments</h2>
              <div className="mt-3.5 space-y-3">
                {listingsByTrends().slice(0, 5).map((x) => (
                  <Link
                    href="/property-in-bangalore-ffid"
                    key={x.id}
                    className="flex items-center justify-between border-b border-[#F3F1F5]/45 pb-2 hover:border-[#DDAA42] transition-colors group"
                  >
                    <span className="text-[13.5px] font-bold text-[#121B35] group-hover:text-[#DDAA42] transition-colors">
                      {x.project}
                    </span>
                    <span className="text-[12px] text-[#DDAA42] font-bold group-hover:underline">View Project</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <CookieBanner />
      <PostPropertyRail />
    </>
  );
}

// Helper filter for listings
function listingsByTrends() {
  const listings = getListingsByKind("buy");
  return listings.filter((x, index, self) =>
    index === self.findIndex((t) => t.project === x.project)
  );
}

export default function BangalorePageRenderer({ route, query }: { route: BangaloreRoute; query?: string }) {
  if (
    ["buy", "rent", "projects", "plots", "pg", "commercial-sale", "commercial-rent"].includes(
      route.kind
    )
  )
    return <ListingPage route={route} query={query} />;
  if (route.kind === "city") return <CityOverview route={route} />;
  if (route.kind === "price-trends" || route.kind === "insights")
    return <TrendsPage route={route} />;
  return <ToolsPage route={route} />;
}
