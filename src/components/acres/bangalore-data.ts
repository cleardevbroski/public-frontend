export type ListingKind = "buy" | "rent" | "projects" | "plots" | "pg" | "commercial-sale" | "commercial-rent";

export type BangaloreListing = {
  id: string;
  kind: ListingKind;
  title: string;
  project: string;
  locality: string;
  microMarket: string;
  price: string;
  priceSubtext: string;
  area: string;
  configuration: string;
  status: string;
  postedBy: string;
  image: string;
  tags: string[];
  highlights: string[];
};

export type BangaloreRoute = {
  slug: string;
  kind: ListingKind | "city" | "price-trends" | "insights" | "home-loan" | "area-converter" | "rent-receipt" | "post-property";
  label: string;
  title: string;
  subtitle: string;
  resultCount?: string;
  heroStat?: string;
};

export type BangaloreZone = "East" | "West" | "North" | "South" | "Central";

export const bangaloreZones: Record<BangaloreZone, { name: string; description: string; localities: string[] }> = {
  East: {
    name: "Bangalore East",
    description: "IT corridor with major tech parks, premium residential communities",
    localities: ["Whitefield", "Marathahalli", "Bellandur", "Panathur", "Varthur", "Kadugodi", "Hoodi", "Seegehalli", "Brookefield", "KR Puram"]
  },
  West: {
    name: "Bangalore West",
    description: "Well-connected industrial and residential hub",
    localities: ["Rajajinagar", "Vijayanagar", "Basaveshwaranagar", "Kengeri", "Magadi Road", "Nagarbhavi", "Peenya", "Yeshwanthpur"]
  },
  North: {
    name: "Bangalore North",
    description: "Airport corridor with emerging residential developments",
    localities: ["Hebbal", "Yelahanka", "Jakkur", "Thanisandra", "Hennur", "Kogilu", "Bagalur", "Devanahalli"]
  },
  South: {
    name: "Bangalore South",
    description: "Premium residential belt with excellent connectivity",
    localities: ["Electronic City", "Bannerghatta Road", "Kanakapura Road", "JP Nagar", "Jayanagar", "BTM Layout", "HSR Layout", "Silk Board"]
  },
  Central: {
    name: "Bangalore Central",
    description: "Commercial and residential heart of the city",
    localities: ["MG Road", "Koramangala", "Indiranagar", "Malleshwaram", "Ulsoor", "Shivajinagar", "Vasanth Nagar", "Ashok Nagar"]
  }
};

export type LocalityInfo = {
  name: string;
  zone: BangaloreZone;
  rating: string;
  avgPrice: string;
  rent: string;
  demand: "Very High" | "High" | "Rising" | "Moderate";
  properties: number;
  appreciation: string;
  schools: string[];
  hospitals: string[];
  itParks: string[];
  metroStations: string[];
};

export const bangaloreLocalities: LocalityInfo[] = [
  // East Bangalore
  { name: "Whitefield", zone: "East", rating: "4.3", avgPrice: "₹9,850/sqft", rent: "₹38,000/mo", demand: "Very High", properties: 2840, appreciation: "+12% YoY", schools: ["Deens Academy", "Ryan International"], hospitals: ["Manipal Hospital"], itParks: ["ITPL", "EPIP Zone"], metroStations: ["Whitefield"] },
  { name: "Marathahalli", zone: "East", rating: "4.1", avgPrice: "₹9,300/sqft", rent: "₹36,000/mo", demand: "High", properties: 1920, appreciation: "+8% YoY", schools: ["Vibgyor High"], hospitals: ["Sakra World Hospital"], itParks: ["RMZ Ecoworld"], metroStations: ["Marathahalli"] },
  { name: "Bellandur", zone: "East", rating: "4.0", avgPrice: "₹10,400/sqft", rent: "₹42,000/mo", demand: "High", properties: 2150, appreciation: "+10% YoY", schools: ["Delhi Public School"], hospitals: ["Columbia Asia"], itParks: ["RMZ Infinity", "Cessna"], metroStations: ["Bellandur"] },
  { name: "Panathur", zone: "East", rating: "4.1", avgPrice: "₹8,800/sqft", rent: "₹32,000/mo", demand: "High", properties: 980, appreciation: "+15% YoY", schools: ["Oakridge International"], hospitals: ["Sakra"], itParks: ["Ecospace"], metroStations: ["Kadubeesanahalli"] },
  { name: "Varthur", zone: "East", rating: "4.0", avgPrice: "₹7,900/sqft", rent: "₹28,000/mo", demand: "Rising", properties: 750, appreciation: "+18% YoY", schools: ["TISB"], hospitals: ["Columbia Asia"], itParks: ["ITPL Phase 2"], metroStations: ["Whitefield"] },
  { name: "KR Puram", zone: "East", rating: "3.9", avgPrice: "₹6,800/sqft", rent: "₹24,000/mo", demand: "High", properties: 1120, appreciation: "+11% YoY", schools: ["Delhi Public School East"], hospitals: ["MVJ Hospital"], itParks: ["Brigade Metropolis"], metroStations: ["KR Puram"] },
  
  // North Bangalore
  { name: "Hebbal", zone: "North", rating: "4.4", avgPrice: "₹11,200/sqft", rent: "₹45,000/mo", demand: "Very High", properties: 1680, appreciation: "+9% YoY", schools: ["Mallya Aditi", "Vidyaniketan"], hospitals: ["Columbia Asia Hebbal"], itParks: ["Manyata Tech Park"], metroStations: ["Hebbal"] },
  { name: "Thanisandra", zone: "North", rating: "4.2", avgPrice: "₹8,650/sqft", rent: "₹31,000/mo", demand: "Rising", properties: 1420, appreciation: "+16% YoY", schools: ["Vidyashilp Academy"], hospitals: ["Aster CMI"], itParks: ["Manyata"], metroStations: ["Nagawara"] },
  { name: "Yelahanka", zone: "North", rating: "4.0", avgPrice: "₹7,200/sqft", rent: "₹26,000/mo", demand: "High", properties: 1580, appreciation: "+14% YoY", schools: ["Ryan International North"], hospitals: ["Aster"], itParks: ["Embassy Manyata"], metroStations: ["Yelahanka"] },
  { name: "Jakkur", zone: "North", rating: "4.2", avgPrice: "₹9,050/sqft", rent: "₹33,000/mo", demand: "Rising", properties: 680, appreciation: "+13% YoY", schools: ["Canadian International"], hospitals: ["Cytecare"], itParks: ["Aerospace Park"], metroStations: ["Jakkur"] },
  { name: "Hennur", zone: "North", rating: "3.9", avgPrice: "₹7,400/sqft", rent: "₹25,000/mo", demand: "Rising", properties: 890, appreciation: "+17% YoY", schools: ["NPS North"], hospitals: ["Fortis"], itParks: ["Kirloskar"], metroStations: ["Hennur"] },
  
  // South Bangalore
  { name: "Electronic City", zone: "South", rating: "4.1", avgPrice: "₹7,150/sqft", rent: "₹28,000/mo", demand: "High", properties: 2240, appreciation: "+7% YoY", schools: ["TISB", "DPS South"], hospitals: ["Narayana Health"], itParks: ["Electronic City Phase 1,2"], metroStations: ["Electronic City"] },
  { name: "Bannerghatta Road", zone: "South", rating: "4.0", avgPrice: "₹7,800/sqft", rent: "₹30,000/mo", demand: "High", properties: 1680, appreciation: "+11% YoY", schools: ["IIMB", "NPS"], hospitals: ["Fortis Bannerghatta"], itParks: ["ELCIA"], metroStations: ["Jayaprakash Nagar"] },
  { name: "JP Nagar", zone: "South", rating: "4.3", avgPrice: "₹9,500/sqft", rent: "₹35,000/mo", demand: "Very High", properties: 1420, appreciation: "+8% YoY", schools: ["The Brigade School"], hospitals: ["Apollo JP Nagar"], itParks: ["Princeton"], metroStations: ["JP Nagar"] },
  { name: "HSR Layout", zone: "South", rating: "4.2", avgPrice: "₹10,200/sqft", rent: "₹40,000/mo", demand: "Very High", properties: 1180, appreciation: "+10% YoY", schools: ["NPS Koramangala"], hospitals: ["Cloudnine"], itParks: ["HSR Tech Park"], metroStations: ["HSR Layout"] },
  { name: "BTM Layout", zone: "South", rating: "4.1", avgPrice: "₹8,900/sqft", rent: "₹32,000/mo", demand: "High", properties: 1350, appreciation: "+9% YoY", schools: ["Kendriya Vidyalaya"], hospitals: ["Jayadeva"], itParks: ["BTM Tech Park"], metroStations: ["BTM Layout"] },
  
  // Central Bangalore
  { name: "Koramangala", zone: "Central", rating: "4.5", avgPrice: "₹12,800/sqft", rent: "₹52,000/mo", demand: "Very High", properties: 980, appreciation: "+6% YoY", schools: ["Bishop Cottons"], hospitals: ["St Johns"], itParks: ["Koramangala Tech Hub"], metroStations: ["Mantri Mall"] },
  { name: "Indiranagar", zone: "Central", rating: "4.4", avgPrice: "₹13,500/sqft", rent: "₹55,000/mo", demand: "Very High", properties: 760, appreciation: "+5% YoY", schools: ["NPS Indiranagar"], hospitals: ["Manipal"], itParks: ["Indiranagar Tech Park"], metroStations: ["Indiranagar"] },
  { name: "Malleshwaram", zone: "Central", rating: "4.3", avgPrice: "₹11,800/sqft", rent: "₹42,000/mo", demand: "High", properties: 840, appreciation: "+4% YoY", schools: ["Mount Carmel"], hospitals: ["KLE"], itParks: ["Orion Mall"], metroStations: ["Malleshwaram"] },
  { name: "MG Road", zone: "Central", rating: "4.2", avgPrice: "₹15,000/sqft", rent: "₹65,000/mo", demand: "Very High", properties: 420, appreciation: "+3% YoY", schools: ["Bishop Cotton"], hospitals: ["Mallya Hospital"], itParks: ["UB City"], metroStations: ["MG Road"] },
  
  // West Bangalore
  { name: "Rajajinagar", zone: "West", rating: "4.0", avgPrice: "₹8,400/sqft", rent: "₹28,000/mo", demand: "High", properties: 1120, appreciation: "+7% YoY", schools: ["National College"], hospitals: ["ESI Hospital"], itParks: ["Orion"], metroStations: ["Rajajinagar"] },
  { name: "Vijayanagar", zone: "West", rating: "3.9", avgPrice: "₹7,100/sqft", rent: "₹24,000/mo", demand: "Moderate", properties: 980, appreciation: "+8% YoY", schools: ["Marimallappa"], hospitals: ["Vijayanagar Hospital"], itParks: ["Metro Tech Park"], metroStations: ["Vijayanagar"] },
  { name: "Kengeri", zone: "West", rating: "3.8", avgPrice: "₹5,200/sqft", rent: "₹18,000/mo", demand: "Rising", properties: 1240, appreciation: "+12% YoY", schools: ["RV College"], hospitals: ["Kengeri Hospital"], itParks: ["Kengeri Tech"], metroStations: ["Kengeri"] },
  { name: "Basaveshwaranagar", zone: "West", rating: "4.0", avgPrice: "₹7,800/sqft", rent: "₹26,000/mo", demand: "High", properties: 860, appreciation: "+6% YoY", schools: ["St. Joseph's"], hospitals: ["SDS Hospital"], itParks: ["West Tech Park"], metroStations: ["Basaveshwaranagar"] },
];

export const getLocalitiesByZone = (zone: BangaloreZone) => bangaloreLocalities.filter(l => l.zone === zone);
export const getLocalityByName = (name: string) => bangaloreLocalities.find(l => l.name === name);

// Zone-specific routes
export const zoneRoutes: BangaloreRoute[] = [
  { slug: "property-in-bangalore-east-ffid", kind: "buy", label: "Buy in East", title: "Property in Bangalore East", subtitle: "Flats, villas and houses in Whitefield, Marathahalli, Bellandur and East Bangalore IT corridor.", resultCount: "18,420" },
  { slug: "property-in-bangalore-west-ffid", kind: "buy", label: "Buy in West", title: "Property in Bangalore West", subtitle: "Residential properties in Rajajinagar, Vijayanagar, Kengeri and West Bangalore.", resultCount: "8,120" },
  { slug: "property-in-bangalore-north-ffid", kind: "buy", label: "Buy in North", title: "Property in Bangalore North", subtitle: "Flats and villas near airport in Hebbal, Yelahanka, Thanisandra and North Bangalore.", resultCount: "12,340" },
  { slug: "property-in-bangalore-south-ffid", kind: "buy", label: "Buy in South", title: "Property in Bangalore South", subtitle: "Premium homes in Electronic City, JP Nagar, Bannerghatta Road and South Bangalore.", resultCount: "9,680" },
  { slug: "property-in-bangalore-central-ffid", kind: "buy", label: "Buy in Central", title: "Property in Central Bangalore", subtitle: "Luxury apartments in Koramangala, Indiranagar, MG Road and Central Bangalore.", resultCount: "4,122" },
  { slug: "flats-for-rent-in-bangalore-east-ffid", kind: "rent", label: "Rent in East", title: "Flats for Rent in Bangalore East", subtitle: "Apartments for rent near IT parks in Whitefield, Marathahalli and Bellandur.", resultCount: "6,840" },
  { slug: "flats-for-rent-in-bangalore-north-ffid", kind: "rent", label: "Rent in North", title: "Flats for Rent in Bangalore North", subtitle: "Rental apartments near Manyata Tech Park in Hebbal, Thanisandra.", resultCount: "3,920" },
  { slug: "flats-for-rent-in-bangalore-south-ffid", kind: "rent", label: "Rent in South", title: "Flats for Rent in Bangalore South", subtitle: "Rental homes in Electronic City, HSR Layout, JP Nagar and South Bangalore.", resultCount: "4,580" },
];

// Generate locality-specific routes dynamically
export const generateLocalityRoutes = (): BangaloreRoute[] => {
  const localities = bangaloreLocalities.slice(0, 15); // Top 15 localities
  return localities.flatMap(loc => [
    {
      slug: `property-in-${loc.name.toLowerCase().replace(/\s+/g, '-')}-bangalore-ffid`,
      kind: "buy",
      label: `Buy in ${loc.name}`,
      title: `Property in ${loc.name}, Bangalore`,
      subtitle: `Flats, apartments and houses for sale in ${loc.name}, Bangalore ${loc.zone}.`,
      resultCount: loc.properties.toLocaleString()
    },
    {
      slug: `flats-for-rent-in-${loc.name.toLowerCase().replace(/\s+/g, '-')}-bangalore-ffid`,
      kind: "rent",
      label: `Rent in ${loc.name}`,
      title: `Flats for Rent in ${loc.name}, Bangalore`,
      subtitle: `Apartments and homes for rent in ${loc.name}, Bangalore.`,
      resultCount: Math.floor(loc.properties * 0.4).toLocaleString()
    }
  ]);
};

export const bangaloreRoutes: BangaloreRoute[] = [
  { slug: "Bangalore-Real-Estate.htm", kind: "city", label: "Bangalore city page", title: "Bangalore Real Estate", subtitle: "Explore Bangalore property markets, popular localities, price trends and verified projects.", heroStat: "52K+ verified listings" },
  { slug: "property-in-bangalore-ffid", kind: "buy", label: "Buy property", title: "Property in Bangalore", subtitle: "Verified flats, villas, houses and builder floors for sale across Bangalore.", resultCount: "52,682" },
  { slug: "flats-in-bangalore-ffid", kind: "buy", label: "Flats for sale", title: "Flats for Sale in Bangalore", subtitle: "Apartments in Whitefield, Sarjapur Road, Hebbal, Marathahalli and more.", resultCount: "38,240" },
  { slug: "independent-house-in-bangalore-ffid", kind: "buy", label: "House for sale", title: "Independent House/Villa in Bangalore", subtitle: "Premium villas and independent homes in Bangalore gated communities.", resultCount: "5,918" },
  { slug: "property-for-rent-in-bangalore-ffid", kind: "rent", label: "Rent property", title: "Property for Rent in Bangalore", subtitle: "Owner and dealer flats, houses and apartments for rent in Bangalore.", resultCount: "18,406" },
  { slug: "flats-for-rent-in-bangalore-ffid", kind: "rent", label: "Flats for rent", title: "Flats for Rent in Bangalore", subtitle: "Furnished and semi-furnished apartments near IT parks and metro corridors.", resultCount: "14,922" },
  { slug: "new-projects-in-bangalore-ffid", kind: "projects", label: "New projects", title: "New Projects in Bangalore", subtitle: "Upcoming and under-construction residential projects from leading Bangalore builders.", resultCount: "1,237" },
  { slug: "residential-land-in-bangalore-ffid", kind: "plots", label: "Plots/Land", title: "Residential Plots in Bangalore", subtitle: "Approved plots and gated plotted developments in and around Bangalore.", resultCount: "7,842" },
  { slug: "pg-in-bangalore-ffid", kind: "pg", label: "PG in Bangalore", title: "PG and Co-living in Bangalore", subtitle: "Paying guest and co-living options near offices, colleges and metro stations.", resultCount: "3,594" },
  { slug: "commercial-property-in-bangalore-ffid", kind: "commercial-sale", label: "Commercial sale", title: "Commercial Property for Sale in Bangalore", subtitle: "Office spaces, shops, showrooms and commercial land for sale in Bangalore.", resultCount: "6,214" },
  { slug: "commercial-property-for-rent-in-bangalore-ffid", kind: "commercial-rent", label: "Commercial rent", title: "Commercial Property for Rent in Bangalore", subtitle: "Lease ready offices, retail shops, warehouses and co-working spaces in Bangalore.", resultCount: "9,318" },
  { slug: "property-rates-and-price-trends-in-bangalore-prffid", kind: "price-trends", label: "Price trends", title: "Property Rates & Price Trends in Bangalore", subtitle: "Track locality-wise sale and rental trends before shortlisting a property.", heroStat: "8 localities tracked" },
  { slug: "real-estate-city-insights-lrffid", kind: "insights", label: "Locality insights", title: "Bangalore Locality Insights", subtitle: "Ratings, liveability scores and market signals for Bangalore localities.", heroStat: "4.2 average city rating" },
  { slug: "apply-for-home-loan-hlpg", kind: "home-loan", label: "Home loans", title: "Home Loan Tools for Bangalore Buyers", subtitle: "Estimate EMI, check eligibility and compare loan options for Bangalore homes.", heroStat: "Rates from 8.35%" },
  { slug: "area-converter-utyp", kind: "area-converter", label: "Area converter", title: "Area Unit Converter", subtitle: "Convert sqft, sqyd, acres, grounds, cents and hectares for property calculations.", heroStat: "Instant conversion" },
  { slug: "online-rent-receipt", kind: "rent-receipt", label: "Rent receipt", title: "Online Rent Receipt Generator", subtitle: "Create monthly rent receipts for Bangalore rental homes and PG stays.", heroStat: "Free tool" },
  { slug: "postproperty", kind: "post-property", label: "Post property", title: "Post Property in Bangalore", subtitle: "List your Bangalore property for sale or rent and reach verified buyers and tenants.", heroStat: "Post for FREE" },
  ...zoneRoutes,
  ...generateLocalityRoutes(),
];

const images = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
];

const base = [
  ["Prestige Lakeside Habitat", "Whitefield", "Varthur Road", "Prestige Group"],
  ["Sobha Dream Acres", "Panathur", "Outer Ring Road", "Sobha Limited"],
  ["Brigade Cornerstone Utopia", "Whitefield", "Varthur", "Brigade Group"],
  ["Godrej Splendour", "Belathur", "Whitefield", "Godrej Properties"],
  ["Purva Atmosphere", "Thanisandra", "North Bangalore", "Puravankara"],
  ["Embassy Lake Terraces", "Hebbal", "Airport Road", "Embassy Group"],
  ["Adarsh Palm Retreat", "Bellandur", "Outer Ring Road", "Adarsh Developers"],
  ["Assetz Marq 2.0", "Whitefield", "East Bangalore", "Assetz Property"],
  ["DSR Elixir", "Whitefield", "East Bangalore", "DSR Infrastructure"],
  ["Sumadhura Solace", "Marathahalli", "ORR", "Sumadhura Group"],
  ["Mantri Webcity", "Hennur", "North Bangalore", "Mantri Developers"],
  ["Salarpuria Sattva Magnus", "Jakkur", "North Bangalore", "Sattva Group"],
];

const kindConfig: Record<ListingKind, { config: string; price: string; sub: string; area: string; status: string; tag: string }> = {
  buy: { config: "2, 3 BHK Apartment", price: "₹1.18 - 2.84 Cr", sub: "₹9,450 /sqft", area: "1,180 - 2,240 sqft", status: "Ready To Move", tag: "RESALE" },
  rent: { config: "2, 3 BHK Flat", price: "₹32,000 - 78,000 /month", sub: "Maintenance extra", area: "1,050 - 1,920 sqft", status: "Furnished", tag: "OWNER" },
  projects: { config: "2, 3, 4 BHK Apartment", price: "₹95 Lac - 3.75 Cr", sub: "New booking", area: "980 - 2,850 sqft", status: "Completion in 2027", tag: "NEW LAUNCH" },
  plots: { config: "Residential Plot", price: "₹54 Lac - 1.86 Cr", sub: "₹4,800 /sqyd", area: "1,200 - 3,600 sqft", status: "Gated plotted development", tag: "PLOT" },
  pg: { config: "Single, Double Sharing", price: "₹8,500 - 22,000 /month", sub: "Food included options", area: "Near offices/metro", status: "Available now", tag: "PG" },
  "commercial-sale": { config: "Office, Shop, Showroom", price: "₹82 Lac - 6.4 Cr", sub: "₹12,200 /sqft", area: "520 - 5,400 sqft", status: "Ready business spaces", tag: "COMMERCIAL" },
  "commercial-rent": { config: "Managed Office, Retail", price: "₹55,000 - 9.8 Lac /month", sub: "Bare shell & furnished", area: "650 - 18,000 sqft", status: "Immediate lease", tag: "LEASE" },
};

export const bangaloreListings: BangaloreListing[] = (Object.keys(kindConfig) as ListingKind[]).flatMap((kind) =>
  base.map(([project, locality, microMarket, postedBy], i) => {
    const c = kindConfig[kind];
    return {
      id: `${kind}-${i}`,
      kind,
      title: kind === "plots" ? `Residential Plot in ${locality}, Bangalore` : `${c.config} in ${locality}, Bangalore`,
      project,
      locality,
      microMarket,
      price: c.price,
      priceSubtext: c.sub,
      area: c.area,
      configuration: c.config,
      status: c.status,
      postedBy,
      image: images[i % images.length],
      tags: [c.tag, i % 2 === 0 ? "Verified" : "RERA", i % 3 === 0 ? "With Photos" : "No Brokerage"],
      highlights: ["Metro connectivity", "IT corridor access", "Schools nearby"],
    };
  })
);

export const getRouteBySlug = (slug: string) => bangaloreRoutes.find((route) => route.slug === slug);

export const getListingsByKind = (kind: BangaloreRoute["kind"]) =>
  kind === "city" || kind === "price-trends" || kind === "insights" || kind === "home-loan" || kind === "area-converter" || kind === "rent-receipt" || kind === "post-property"
    ? bangaloreListings.filter((item) => item.kind === "buy").slice(0, 6)
    : bangaloreListings.filter((item) => item.kind === kind);
