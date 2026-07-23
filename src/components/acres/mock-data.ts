export type CityTab = "Buy" | "Rent" | "PG/Co-living" | "Commercial Buy" | "Commercial Lease";

export type PlanPoint = {
  x: number;
  y: number;
};

export type ApartmentRoom = {
  id?: string;
  name: string;
  category?: "bedroom" | "bathroom" | "kitchen" | "living" | "dining" | "balcony" | "utility" | "other";
  length?: number;
  width?: number;
  area?: number;
  unit?: "ft" | "m";
  description?: string;
  flooring?: string;
  polygon?: PlanPoint[];
};

export type ConfigurationDetail = {
  id?: string;
  configuration: string;
  price: string;
  superBuiltUpArea: string;
  carpetArea: string;
  builtUpArea?: string;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  facings: string[];
  floorPlan2dUrl?: string;
  floorPlan3dUrl?: string;
  rooms?: ApartmentRoom[];
};

export type FacilityDetail = {
  id?: string;
  name: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  status?: "Available" | "Planned" | "Under Construction";
  hours?: string;
};

export type VillaType = "Independent" | "Row Villa" | "Twin Villa";
export type PlotFacing = "East" | "West" | "North" | "South" | "North-East" | "North-West" | "South-East" | "South-West";

export type VillaConfigurationDetail = {
  configuration: string;
  price: string;
  plotArea: string;
  builtUpArea: string;
  superArea: string;
  bedrooms: number;
  bathrooms: number;
};

export type VillaDetails = {
  villaType: VillaType;
  configurationDetails: VillaConfigurationDetail[];
  plotDimensions?: string;
  numberOfFloors?: string;
  plotFacing: PlotFacing;
  cornerPlot: boolean;
  roadWidthFacing?: string;
  privateGarden: boolean;
  privateGardenArea?: string;
  privatePool: boolean;
  terrace: boolean;
  terraceDetails?: string;
  gatedCommunity: boolean;
};

export type PlotSizeDetail = {
  plotSize: string;
  width: number;
  length: number;
  areaSqft: number;
  pricePerSqft: number;
  totalPrice: number;
  facings: PlotFacing[];
};

export type PlotInventoryItem = {
  plotNumber: string;
  plotSize: string;
  facing: PlotFacing;
  status: "Available" | "Booked" | "Sold";
  isCorner: boolean;
};

export type PlotDetails = {
  plotSizeDetails: PlotSizeDetail[];
  totalPlots: number;
  approvalAuthority: "BMRDA" | "BDA" | "DTCP" | "Panchayat";
  approvalNumber?: string;
  roadWidth?: string;
  civicInfrastructure: {
    undergroundDrainage: "Ready" | "Under Development";
    electricity: "Ready" | "Under Development";
    water: "Ready" | "Under Development";
  };
  layoutMapUrl: string;
  layoutMapType: "image" | "pdf";
  layoutPossession: {
    status: "Layout Ready" | "Under Development";
    readyDate?: string;
    expectedCompletionDate?: string;
  };
  inventory: PlotInventoryItem[];
};

export type CommercialSubtype = "Office Space" | "Shop/Showroom" | "Warehouse" | "Industrial Shed" | "Co-working";
export type CommercialDetails = {
  commercialSubtype: CommercialSubtype;
  carpetArea?: string;
  builtUpArea?: string;
  superArea?: string;
  floor: string;
  totalFloors: number;
  frontage?: string;
  zoneType: "IT/ITES SEZ" | "Non-SEZ" | "Retail" | "Industrial";
  seatingCapacity: number;
  cabins: number;
  meetingRooms: number;
  buildingGrade: "Grade A" | "Grade B" | "Grade C" | "Not Applicable";
  structure?: string;
  pantry: "None" | "Shared Pantry" | "Private Pantry";
  washrooms?: string;
  parking?: string;
  powerBackup?: string;
  sanctionedLoadKva: number;
  fireSafetyCompliance?: string;
  furnishing: "Bare Shell" | "Warm Shell" | "Fully Furnished";
};
export type PgSharingDetail = { sharingType: "Single occupancy" | "Double sharing" | "Triple sharing" | "Four sharing"; rentPerBed: number; deposit: number; bedsAvailable: number };
export type PgDetails = { genderPreference: "Men only" | "Women only" | "Co-ed"; sharingDetails: PgSharingDetail[]; mealsIncluded: "Breakfast + Dinner" | "All 3 meals" | "No meals"; foodType?: "" | "Veg only" | "Veg + Non-veg"; wifiIncluded: boolean; laundryIncluded: boolean; laundrySchedule?: string; housekeeping?: string; curfewEntryTiming?: string; visitorsAllowed?: string; noticePeriod?: string; lockInPeriod?: string; idProofRequired?: string; utilitiesIncluded?: string; availableFrom: string; commonAmenities: string[]; contactType: "Owner" | "PG Manager" | "Company-run" };
export type RentDetails = { rentalPropertyType: "Apartment" | "Villa" | "Independent House"; configuration: string; monthlyRent: number; securityDeposit: number; maintenanceMode: "Included" | "Extra"; maintenanceAmount: number; availableFrom: string; lockInPeriod?: string; preferredTenantTypes: string[]; superArea?: string; carpetArea?: string; bedrooms: number; bathrooms: number; floor?: string; totalFloors?: number; facing?: string; parking?: string; furnishing: "Unfurnished" | "Semi-Furnished" | "Fully Furnished"; petFriendly: boolean; nonVegAllowed: boolean; contactType: "Owner" | "Broker" };
export type LeaseDetails = { leasePropertyType: "Commercial" | "Residential"; carpetArea: string; superArea: string; leaseRent: number; rentPerSqft: number; leaseTenure: string; lockInPeriod: string; rentEscalation: string; securityDeposit: number; availableFrom: string; camCharges: string; furnishing: string; preferredTenantType: string; subLeasingAllowed: boolean; registrationStampDutyResponsibility: string; contactType: string };

export type PossessionStatus = "Ready to Move" | "Under Construction" | "New Launch";

export type PossessionDetails = {
  status: PossessionStatus;
  launchDate?: string;
  expectedCompletionDate?: string;
};

export type NearbyDetail = { count?: number; distance?: string };

export type Property = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  pricePerSqft?: string;
  configs: string[];
  configurationDetails?: ConfigurationDetail[];
  villaDetails?: VillaDetails;
  plotDetails?: PlotDetails;
  commercialDetails?: CommercialDetails;
  pgDetails?: PgDetails;
  rentDetails?: RentDetails;
  leaseDetails?: LeaseDetails;
  area: string;
  possession?: string;
  possessionDetails?: PossessionDetails;
  builder?: string;
  builderId?: string | null;
  dealerId?: string | null;
  developerLogoUrl?: string;
  localityMapImageUrl?: string;
  image: string;
  badges?: string[];
  // Extended fields for admin-posted properties
  description?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: string;
  furnishing?: string;
  facing?: string;
  floor?: string;
  floorLabel?: string;
  totalFloors?: number;
  transactionType?: string;
  ageOfProperty?: string;
  /** Ordered project-overview images. The public hero rotates through at most three. */
  heroImages?: string[];
  images?: string[];
  amenities?: string[];
  facilities?: FacilityDetail[];
  ownershipType?: string;
  overlooking?: string[];
  bookingAmount?: string;
  maintenanceCharges?: string;
  maintenancePeriod?: "month" | "quarter" | "year" | "";
  society?: {
    security?: string;
    waterSupply?: string;
    powerBackup?: string;
    lift?: string;
    visitorParking?: string;
    maintenanceStaff?: string;
  };
  locality?: {
    city?: string;
    zone?: string;
    landmark?: string;
    pinCode?: string;
  };
  nearbyAmenities?: {
    schools?: string;
    hospitals?: string;
    shopping?: string;
    metro?: string;
  };
  nearbyDetails?: {
    schools?: NearbyDetail;
    hospitals?: NearbyDetail;
    shopping?: NearbyDetail;
    metro?: NearbyDetail;
  };
  reraRegistered?: boolean;
  reraNumber?: string;
  verified?: boolean;
  postedDate?: string;
  // Downloadable brochure (data URL or external link) + display name
  brochure?: string;
  brochureName?: string;
  // Admin workflow: only published listings appear on the public site
  published?: boolean;
  featured?: boolean;
  /** Which homepage carousel/section this belongs to (matches backend enum) */
  websiteSection?: string;
  /** "For Sale" | "For Rent" — routes the property to Buy vs Rent listing pages. */
  listingType?: string;
  status?: string;
  submissionVersion?: number;
  lastSubmittedAt?: string;
  reviewedAt?: string;
  publishedAt?: string;
  rejectionReason?: string;
  reviewMessages?: Array<{ _id?: string; senderRole: "admin" | "user"; message: string; createdAt?: string }>;
  source?: "admin" | "mock" | "public";
  submittedBy?: "user" | "admin";
  postedBy?: {
    _id?: string;
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
    role?: string;
  };
};

const baseImages = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
];

const bangaloreProjects: { name: string; locality: string; builder: string; type: "Apartment" | "Villa" | "Penthouse" | "Plot" }[] = [
  { name: "Prestige Lakeside Habitat", locality: "Varthur, Whitefield", builder: "Prestige Group", type: "Apartment" },
  { name: "Sobha Dream Acres", locality: "Panathur, Balagere", builder: "Sobha Limited", type: "Apartment" },
  { name: "Brigade Cornerstone Utopia", locality: "Varthur Road, Whitefield", builder: "Brigade Group", type: "Apartment" },
  { name: "Godrej Splendour", locality: "Belathur, Whitefield", builder: "Godrej Properties", type: "Apartment" },
  { name: "Purva Atmosphere", locality: "Thanisandra Main Road", builder: "Puravankara", type: "Apartment" },
  { name: "Embassy Lake Terraces", locality: "Hebbal", builder: "Embassy Group", type: "Penthouse" },
  { name: "Mantri Webcity", locality: "Kuvempu Layout, Hennur", builder: "Mantri Developers", type: "Apartment" },
  { name: "Total Environment Pursuit of a Radical Rhapsody", locality: "Whitefield", builder: "Total Environment", type: "Villa" },
  { name: "Adarsh Palm Retreat", locality: "Bellandur, Outer Ring Road", builder: "Adarsh Developers", type: "Villa" },
  { name: "Salarpuria Sattva Magnus", locality: "Jakkur", builder: "Sattva Group", type: "Apartment" },
  { name: "Assetz Marq 2.0", locality: "Whitefield", builder: "Assetz Property", type: "Apartment" },
  { name: "DivyaSree 77 Place", locality: "Marathahalli", builder: "DivyaSree Developers", type: "Apartment" },
];

const bangaloreSample = (i: number): Property => {
  const p = bangaloreProjects[i % bangaloreProjects.length];
  return {
    id: `blr-${i}`,
    title: p.name,
    subtitle: `${p.locality}, Bangalore`,
    price: `₹ ${(0.85 + i * 0.32).toFixed(2)} Cr`,
    pricePerSqft: `₹ ${(7800 + i * 420).toLocaleString("en-IN")}/sqft`,
    configs: p.type === "Villa" ? ["3 BHK", "4 BHK"] : ["2 BHK", "3 BHK", "4 BHK"].slice(0, (i % 3) + 1),
    area: `${1180 + i * 165} sqft`,
    possession: ["Ready to Move", "Dec 2026", "Mar 2027", "Jun 2025"][i % 4],
    builder: p.builder,
    image: baseImages[i % baseImages.length],
    badges: i % 2 === 0 ? ["RERA", "Premium"] : ["New Launch"],
  };
};

export const cityListings: Record<string, Property[]> = {
  Bangalore: Array.from({ length: bangaloreProjects.length }, (_, i) => bangaloreSample(i)),
};

export const cities = Object.keys(cityListings);

export const tiles = [
  { label: "Buying a home", img: "/cleartitleone/tile-buy.webp", isNew: false, href: "/property-in-bangalore-ffid" },
  { label: "Renting a home", img: "/cleartitleone/tile-rent.webp", isNew: false, href: "/property-for-rent-in-bangalore-ffid" },
  { label: "New Projects", img: "/cleartitleone/tile-invest.webp", isNew: true, href: "/new-projects-in-bangalore-ffid" },
  { label: "Sell/Rent/Lease your property", img: "/cleartitleone/tile-sell.png", isNew: false, href: "/postproperty" },
  { label: "Plots/Land", img: "/cleartitleone/tile-plot.webp", isNew: false, href: "/residential-land-in-bangalore-ffid" },
  { label: "Explore Insights", img: "/cleartitleone/tile-insights.webp", isNew: true, href: "/property-rates-and-price-trends-in-bangalore-prffid" },
  { label: "PG and co-living", img: "/cleartitleone/tile-pg.webp", isNew: false, href: "/pg-in-bangalore-ffid" },
  { label: "Buying commercial spaces", img: "/cleartitleone/tile-com-buy.webp", isNew: false, href: "/commercial-property-in-bangalore-ffid" },
  { label: "Lease commercial spaces", img: "/cleartitleone/tile-com-lease.webp", isNew: false, href: "/commercial-property-for-rent-in-bangalore-ffid" },
];

export const searchTabs = [
  "Buy",
  "Rent",
  "Lease",
  "New Projects",
  "PG / Co-Living",
  "Commercial",
  "Plots/Land",
  "Post free property ad",
];

// Header dropdown menu data
export type DropdownMenuItem = {
  label: string;
  href: string;
  badge?: string;
};

export type DropdownSection = {
  title: string;
  items: DropdownMenuItem[];
};

export type DropdownMenu = {
  leftSections: DropdownSection[];
  centerSections?: DropdownSection[];
  rightCard?: {
    title: string;
    subtitle?: string;
    items?: string[];
    ctaText?: string;
    ctaHref?: string;
    image?: string;
  };
  contactInfo?: {
    tollFree: string;
    email?: string;
    timing?: string;
  };
};

export const headerDropdowns: Record<string, DropdownMenu> = {
  "For Buyers": {
    leftSections: [
      {
        title: "BUY A HOME",
        items: [
          { label: "Flats", href: "/flats-in-bangalore-ffid" },
          { label: "House/Villa", href: "/independent-house-in-bangalore-ffid" },
          { label: "Land/Plot", href: "/residential-land-in-bangalore-ffid" },
          { label: "Commercial", href: "/commercial-property-in-bangalore-ffid" },
        ],
      },
      {
        title: "BANGALORE ZONES",
        items: [
          { label: "East Bangalore", href: "/property-in-bangalore-east-ffid" },
          { label: "West Bangalore", href: "/property-in-bangalore-west-ffid" },
          { label: "North Bangalore", href: "/property-in-bangalore-north-ffid" },
          { label: "South Bangalore", href: "/property-in-bangalore-south-ffid" },
          { label: "Central Bangalore", href: "/property-in-bangalore-central-ffid" },
        ],
      },
    ],
    centerSections: [
      {
        title: "POPULAR LOCALITIES",
        items: [
          { label: "Whitefield", href: "/property-in-whitefield-bangalore-ffid" },
          { label: "Hebbal", href: "/property-in-hebbal-bangalore-ffid" },
          { label: "Electronic City", href: "/property-in-electronic-city-bangalore-ffid" },
          { label: "Marathahalli", href: "/property-in-marathahalli-bangalore-ffid" },
          { label: "Koramangala", href: "/property-in-koramangala-bangalore-ffid" },
          { label: "JP Nagar", href: "/property-in-jp-nagar-bangalore-ffid" },
          { label: "HSR Layout", href: "/property-in-hsr-layout-bangalore-ffid" },
          { label: "Bellandur", href: "/property-in-bellandur-bangalore-ffid" },
        ],
      },
      {
        title: "POPULAR SEARCHES",
        items: [
          { label: "New Projects", href: "/new-projects-in-bangalore-ffid" },
          { label: "Ready to Move", href: "/property-in-bangalore-ffid" },
          { label: "Under Construction", href: "/property-in-bangalore-ffid" },
          { label: "Budget Homes", href: "/property-in-bangalore-ffid" },
          { label: "Luxury Homes", href: "/property-in-bangalore-ffid" },
        ],
      },
    ],
    rightCard: {
      title: "INTRODUCING",
      subtitle: "Insights",
      items: ["Understand localities", "Read Resident Reviews", "Check Price Trends", "Tools, Utilities & more"],
      ctaText: "Learn more",
      ctaHref: "/real-estate-city-insights-lrffid",
    },
    contactInfo: {
      tollFree: "1800 41 99099",
      email: "services@cleartitleone.com",
      timing: "9AM-11PM IST",
    },
  },
  "For Tenants": {
    leftSections: [
      {
        title: "RENT A HOME",
        items: [
          { label: "Flats for Rent", href: "/flats-for-rent-in-bangalore-ffid" },
          { label: "House for Rent", href: "/property-for-rent-in-bangalore-ffid" },
          { label: "PG/Co-Living", href: "/pg-in-bangalore-ffid" },
        ],
      },
      {
        title: "LEASE",
        items: [
          { label: "Commercial Lease", href: "/commercial-property-for-rent-in-bangalore-ffid" },
          { label: "Land Lease", href: "/residential-land-in-bangalore-ffid" },
        ],
      },
      {
        title: "RENT BY ZONE",
        items: [
          { label: "East Bangalore", href: "/flats-for-rent-in-bangalore-east-ffid" },
          { label: "North Bangalore", href: "/flats-for-rent-in-bangalore-north-ffid" },
          { label: "South Bangalore", href: "/flats-for-rent-in-bangalore-south-ffid" },
        ],
      },
    ],
    centerSections: [
      {
        title: "POPULAR RENTAL AREAS",
        items: [
          { label: "Whitefield", href: "/flats-for-rent-in-whitefield-bangalore-ffid" },
          { label: "Marathahalli", href: "/flats-for-rent-in-marathahalli-bangalore-ffid" },
          { label: "HSR Layout", href: "/flats-for-rent-in-hsr-layout-bangalore-ffid" },
          { label: "Koramangala", href: "/flats-for-rent-in-koramangala-bangalore-ffid" },
          { label: "Electronic City", href: "/flats-for-rent-in-electronic-city-bangalore-ffid" },
          { label: "Bellandur", href: "/flats-for-rent-in-bellandur-bangalore-ffid" },
        ],
      },
      {
        title: "POPULAR SEARCHES",
        items: [
          { label: "Bachelor Friendly", href: "/property-for-rent-in-bangalore-ffid" },
          { label: "Furnished Homes", href: "/property-for-rent-in-bangalore-ffid" },
          { label: "With Parking", href: "/property-for-rent-in-bangalore-ffid" },
          { label: "Near Metro", href: "/property-for-rent-in-bangalore-ffid" },
        ],
      },
    ],
    rightCard: {
      title: "INTRODUCING",
      subtitle: "Insights",
      items: ["Understand localities", "Read Resident Reviews", "Check Price Trends", "Tools, Utilities & more"],
      ctaText: "Learn more",
      ctaHref: "/real-estate-city-insights-lrffid",
    },
    contactInfo: {
      tollFree: "1800 41 99099",
      email: "services@cleartitleone.com",
      timing: "9AM-11PM IST",
    },
  },
  "For Owners": {
    leftSections: [
      {
        title: "OWNER OFFERINGS",
        items: [
          { label: "Post Property", href: "/postproperty", badge: "FREE" },
          { label: "Owner Services", href: "/Bangalore-Real-Estate.htm" },
          { label: "Mycleartitleone", href: "/Bangalore-Real-Estate.htm" },
          { label: "View Responses", href: "/Bangalore-Real-Estate.htm" },
        ],
      },
      {
        title: "INSIGHTS",
        items: [
          { label: "Insights", href: "/property-rates-and-price-trends-in-bangalore-prffid", badge: "NEW" },
        ],
      },
      {
        title: "ARTICLES & NEWS",
        items: [
          { label: "Articles", href: "/Bangalore-Real-Estate.htm" },
          { label: "News", href: "/Bangalore-Real-Estate.htm" },
        ],
      },
    ],
    rightCard: {
      title: "Sell, rent, or lease faster at the right price!",
      subtitle: "List your property now for FREE",
      ctaText: "Post Property",
      ctaHref: "/postproperty",
    },
    contactInfo: {
      tollFree: "1800 41 99099",
      timing: "9AM-11PM IST",
    },
  },
  "For Dealers / Builders": {
    leftSections: [
      {
        title: "DEALER OFFERINGS",
        items: [
          { label: "Post Property", href: "/postproperty" },
          { label: "Dealer Services", href: "/Bangalore-Real-Estate.htm" },
          { label: "Mycleartitleone", href: "/Bangalore-Real-Estate.htm" },
          { label: "View Responses", href: "/Bangalore-Real-Estate.htm" },
        ],
      },
      {
        title: "RESEARCH AND ADVICE",
        items: [
          { label: "Price Trends", href: "/property-rates-and-price-trends-in-bangalore-prffid" },
          { label: "Insights", href: "/real-estate-city-insights-lrffid", badge: "NEW" },
          { label: "Articles", href: "/Bangalore-Real-Estate.htm" },
        ],
      },
    ],
    centerSections: [
      {
        title: "PROPERTY SERVICES",
        items: [
          { label: "Post Property", href: "/postproperty" },
          { label: "Dealer Services", href: "/Bangalore-Real-Estate.htm" },
          { label: "Mycleartitleone", href: "/Bangalore-Real-Estate.htm" },
          { label: "View Responses", href: "/Bangalore-Real-Estate.htm" },
        ],
      },
    ],
    rightCard: {
      title: "Sell, rent, or lease faster at the right price!",
      subtitle: "List your property now for FREE",
      ctaText: "Post Property",
      ctaHref: "/postproperty",
    },
    contactInfo: {
      tollFree: "1800 41 99099",
      email: "services@cleartitleone.com",
      timing: "9AM-11PM IST",
    },
  },
  Insights: {
    leftSections: [
      {
        title: "RESEARCH",
        items: [
          { label: "Price Trends", href: "/property-rates-and-price-trends-in-bangalore-prffid" },
          { label: "Locality Insights", href: "/real-estate-city-insights-lrffid" },
          { label: "Compare Localities", href: "/Bangalore-Real-Estate.htm" },
          { label: "City Insights", href: "/Bangalore-Real-Estate.htm" },
        ],
      },
      {
        title: "TOOLS",
        items: [
          { label: "Area Converter", href: "/area-converter-utyp" },
          { label: "Home Loan Calculator", href: "/apply-for-home-loan-hlpg" },
          { label: "Rent Receipt", href: "/online-rent-receipt" },
          { label: "EMI Calculator", href: "/apply-for-home-loan-hlpg" },
        ],
      },
    ],
    centerSections: [
      {
        title: "RESOURCES",
        items: [
          { label: "Articles", href: "/Bangalore-Real-Estate.htm" },
          { label: "News", href: "/Bangalore-Real-Estate.htm" },
          { label: "Guides", href: "/Bangalore-Real-Estate.htm" },
          { label: "Reviews", href: "/Bangalore-Real-Estate.htm" },
        ],
      },
    ],
    rightCard: {
      title: "INTRODUCING",
      subtitle: "Insights",
      items: ["Understand localities", "Read Resident Reviews", "Check Price Trends", "Tools, Utilities & more"],
      ctaText: "Explore Insights",
      ctaHref: "/real-estate-city-insights-lrffid",
    },
  },
};

export const navItems = [
  { label: "For Buyers", hasDropdown: true, href: "/property-in-bangalore-ffid" },
  { label: "For Tenants", hasDropdown: true, href: "/property-for-rent-in-bangalore-ffid" },
  { label: "For Owners", hasDropdown: true, href: "/postproperty" },
  { label: "For Dealers / Builders", hasDropdown: true, href: "/new-projects-in-bangalore-ffid" },
  { label: "Insights", hasDropdown: true, badge: "NEW", href: "/property-rates-and-price-trends-in-bangalore-prffid" },
  { label: "Legal Shield", hasDropdown: false, badge: "UNIQUE", href: "/#legal-console" },
];

export const testimonials = [
  {
    name: "Srikanth Malleboina",
    role: "Buyer • Hyderabad",
    quote:
      "I found my dream home through cleartitleone. The verified listings saved me weeks of effort and I closed the deal in under a month.",
    rating: 5,
  },
  {
    name: "Prateek Sengar",
    role: "Buyer • Noida",
    quote:
      "Great range of properties and the response from owners was fast. The site filters are very precise for narrowing down options.",
    rating: 5,
  },
  {
    name: "SOBHA Developers",
    role: "Builder Partner",
    quote:
      "cleartitleone has been a consistent lead-generation platform for our launches. Their builder dashboard makes campaign management simple.",
    rating: 5,
  },
  {
    name: "Karvy Realty",
    role: "Channel Partner",
    quote:
      "We get high-quality buyer queries from cleartitleone. The post-property workflow is the smoothest in the industry.",
    rating: 5,
  },
  {
    name: "S. Anandan",
    role: "Owner • Chennai",
    quote:
      "Listing my flat was free and I had genuine tenants reach out within 48 hours. Very satisfied with the experience.",
    rating: 5,
  },
];

export const benefits = [
  {
    n: "01",
    title: "Over 12 Lac properties",
    desc: "10,000+ properties added every month for you to discover and buy your dream home.",
  },
  {
    n: "02",
    title: "Verified listings only",
    desc: "Every listing on our platform is verified for genuine details and authenticity.",
  },
  {
    n: "03",
    title: "Personalised property suggestions",
    desc: "Smart recommendations matching your budget, location and lifestyle preferences.",
  },
  {
    n: "04",
    title: "Free expert advice",
    desc: "Talk to home loan advisors, legal consultants and interior designers — at no cost.",
  },
];

export const footerColumns = {
  "ClearTitle One": [
    "Mobile Apps",
    "Our Services",
    "Price Trends",
    "Post your property",
    "Real Estate Investments",
    "Builders in India",
    "Area Converter",
    "Articles",
    "Rent Receipt",
    "Customer Service",
    "Sitemap",
  ],
  Company: [
    "About us",
    "Contact us",
    "Careers with us",
    "Terms & Conditions",
    "Request Info",
    "Feedback",
    "Report a problem",
    "Testimonials",
    "Privacy Policy",
    "Summons/Notices",
    "Grievances",
    "Safety Guide",
  ],
  "Popular Regions": [
    "Whitefield Real Estate",
    "Hebbal Real Estate",
    "Sarjapur Road Properties",
    "Koramangala Luxury Suites",
    "HSR Layout Rentals",
    "Electronic City Tech Parks",
    "JP Nagar Residential Belt",
    "Indiranagar Commercial Units",
  ],
};

// ── Homepage discovery data (99acres / SquareYards style) ──────────────────

export type LocalityInsight = {
  name: string;
  rating: number;
  pricePerSqft: string;
  yoy: string;
  image: string;
  href: string;
};

export const localityInsights: LocalityInsight[] = [
  { name: "KR Puram", rating: 4.2, pricePerSqft: "₹9,800/ sqft", yoy: "28.1% YoY", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80", href: "/property-in-kr-puram-bangalore-ffid" },
  { name: "Kundalahalli", rating: 4.2, pricePerSqft: "₹16,650/ sqft", yoy: "16.8% YoY", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80", href: "/property-in-kundalahalli-bangalore-ffid" },
  { name: "Whitefield", rating: 4.3, pricePerSqft: "₹14,050/ sqft", yoy: "17.6% YoY", image: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&q=80", href: "/property-in-whitefield-bangalore-ffid" },
  { name: "Sarjapur Road", rating: 4.4, pricePerSqft: "₹11,200/ sqft", yoy: "21.3% YoY", image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&q=80", href: "/property-in-sarjapur-road-bangalore-ffid" },
  { name: "Hebbal", rating: 4.1, pricePerSqft: "₹12,400/ sqft", yoy: "15.2% YoY", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80", href: "/property-in-hebbal-bangalore-ffid" },
  { name: "Electronic City", rating: 4.0, pricePerSqft: "₹6,950/ sqft", yoy: "12.7% YoY", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&q=80", href: "/property-in-electronic-city-bangalore-ffid" },
];

export type PropertyTypeTile = {
  label: string;
  count: string;
  image: string;
  tint: string;
  href: string;
};

export const propertyTypeTiles: PropertyTypeTile[] = [
  { label: "1 RK/ Studio Apartment", count: "40+ Properties", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80", tint: "#E7F0FA", href: "/studio-apartment-in-bangalore-ffid" },
  { label: "Farm House", count: "10+ Properties", image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80", tint: "#E6F2EA", href: "/farm-house-in-bangalore-ffid" },
  { label: "Serviced Apartments", count: "5 Properties", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80", tint: "#FFF8E8", href: "/serviced-apartment-in-bangalore-ffid" },
  { label: "Independent House/Villa", count: "120+ Properties", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80", tint: "#F1EAF7", href: "/independent-house-in-bangalore-ffid" },
  { label: "Residential Plots", count: "85+ Properties", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80", tint: "#FAEAEA", href: "/residential-land-in-bangalore-ffid" },
];

export type BhkOption = { label: string; count: string; href: string };

export const bhkOptions: BhkOption[] = [
  { label: "1 RK/1 BHK", count: "630+ Properties", href: "/1-bhk-flats-in-bangalore-ffid" },
  { label: "2 BHK", count: "4,800+ Properties", href: "/2-bhk-flats-in-bangalore-ffid" },
  { label: "3 BHK", count: "6,600+ Properties", href: "/3-bhk-flats-in-bangalore-ffid" },
  { label: "4 BHK", count: "1,900+ Properties", href: "/4-bhk-flats-in-bangalore-ffid" },
  { label: "5+ BHK", count: "420+ Properties", href: "/5-bhk-flats-in-bangalore-ffid" },
];

export type BudgetOption = { label: string; range: string; href: string };

export const budgetOptions: BudgetOption[] = [
  { label: "Affordable projects", range: "< ₹7,400/ sqft", href: "/property-in-bangalore-ffid" },
  { label: "Mid-Segment projects", range: "₹7,400 - 13,000/ sqft", href: "/property-in-bangalore-ffid" },
  { label: "Luxury projects", range: "> ₹13,000/ sqft", href: "/property-in-bangalore-ffid" },
];

export type PossessionTile = { label: string; count: string; image: string; tint: string; href: string };

export const possessionTiles: PossessionTile[] = [
  { label: "Ready to move", count: "13,000+ Properties", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80", tint: "#F4EFE3", href: "/ready-to-move-property-in-bangalore-ffid" },
  { label: "Possession in 2026", count: "1,400+ Properties", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80", tint: "#E7F0FA", href: "/under-construction-property-in-bangalore-ffid" },
  { label: "Possession in 2027", count: "1,400+ Properties", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80", tint: "#E6F2EA", href: "/under-construction-property-in-bangalore-ffid" },
  { label: "Possession in 2028", count: "900+ Properties", image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=80", tint: "#FFF8E8", href: "/under-construction-property-in-bangalore-ffid" },
];

export type ProjectCard = {
  id: string;
  name: string;
  locality: string;
  config: string;
  price: string;
  image: string;
  builderLogo?: string;
  status?: string;
  rera?: boolean;
  tag?: string;
  note?: string;
  priceTrend?: string;
};

export const handpickedProjects: ProjectCard[] = [
  { id: "hp-ivy", name: "Ivy County by Icon Homz", locality: "Land, Gunjur", config: "Plots", price: "₹ 1.58 - 2.52 Cr", image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&q=80", status: "Featured", rera: true },
  { id: "hp-mg", name: "MG Trident", locality: "2,3 BHK Apartment, Sarjapur", config: "2,3 BHK", price: "₹ 45.68 - 62.55 Lacs", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80", status: "Featured", rera: true },
  { id: "hp-adwaith", name: "The Adwaith by Sanjeevini", locality: "3,4 BHK Apartment, Gunjur", config: "3,4 BHK", price: "₹ 1.10 - 1.85 Cr", image: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&q=80", status: "Featured", rera: true },
];

export const newlyLaunchedProjects: ProjectCard[] = [
  { id: "nl-maruti", name: "Maruti Akrida", locality: "Sarjapur, Bangalore", config: "2, 3, 4 BHK Apartment", price: "₹70.93 L - 1.44 Cr", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80", rera: true, tag: "NEW ARRIVAL", priceTrend: "71.2% price increase in last 3 months" },
  { id: "nl-binary", name: "Binary Etania", locality: "Sarjapur Road, Bangalore", config: "3 BHK Apartment", price: "₹1.2 - 1.21 Cr", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80", rera: true, tag: "NEW LAUNCH", priceTrend: "14.7% price increase in last 3 months" },
  { id: "nl-sanjeevini", name: "Sanjeevini Aarna", locality: "Hoskote, Bangalore", config: "3 BHK Apartment", price: "₹1.11 - 1.43 Cr", image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80", rera: true, tag: "NEW ARRIVAL", priceTrend: "9.4% price increase in last 3 months" },
  { id: "nl-peram", name: "Peram Eco City", locality: "Hoskote, Bangalore", config: "4 BHK Villa", price: "₹2.49 - 2.92 Cr", image: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=400&q=80", rera: true, tag: "NEW LAUNCH", priceTrend: "5.1% price increase in last 3 months" },
];

export const searchTrendProjects: ProjectCard[] = [
  { id: "st-bollineni", name: "BSCPL Bollineni Nestor", locality: "2, 3 BHK Apartment in Yelahanka, Bangalore", config: "2,3 BHK", price: "₹ 50 - 75 L", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80", status: "Ready To Move", rera: true },
  { id: "st-sowparnika", name: "Sowparnika Whispering Petals", locality: "1, 2, 3 BHK Apartment in Hoskote, Bangalore", config: "1,2,3 BHK", price: "₹ 45.43 L - 1.1 Cr", image: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=600&q=80", status: "Possession from Sep 2032", rera: true },
  { id: "st-mgtrident", name: "MG Trident", locality: "2, 3 BHK Apartment in Sarjapur, Bangalore", config: "2,3 BHK", price: "₹ 45.68 - 62.55 L", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80", status: "Ready To Move", rera: false },
  { id: "st-adwaith", name: "The Adwaith by Sanjeevini", locality: "3, 4 BHK Apartment in Gunjur, Bangalore", config: "3,4 BHK", price: "₹ 1.10 - 1.85 Cr", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80", status: "Possession from Dec 2027", rera: true },
];

export const offerProjects: ProjectCard[] = [
  { id: "of-peram", name: "Peram Eco City", locality: "Hoskote", config: "4 BHK Villa", price: "₹ 2.49 - 2.92 Cr", image: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=400&q=80", note: "NO PRE EMI-Offer till possession" },
  { id: "of-binary", name: "Binary Etania", locality: "Sarjapur Road", config: "3 BHK Apartment", price: "₹ 1.3 - 1.32 Cr", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80", note: "No Pre-EMI Till Possession" },
  { id: "of-sanjeevini", name: "Sanjeevini Aarna", locality: "Hoskote", config: "3 BHK Apartment", price: "₹ 1.11 - 1.43 Cr", image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80", note: "Book today and save up to ₹5 L" },
  { id: "of-mg", name: "MG Trident", locality: "Sarjapur", config: "2,3 BHK Apartment", price: "₹ 45.68 - 62.55 L", image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80", note: "Assured gold coin on booking" },
];

export type Lawyer = {
  id: string;
  name: string;
  experience: string;
  barCouncil: string;
  rating: number;
  cases: string;
  specialty: string;
  image: string;
};

export const verifiedLawyers: Lawyer[] = [
  {
    id: "law-1",
    name: "Adv. R. Srinivasan",
    experience: "18+ Yrs Exp",
    barCouncil: "KA/1902/2008",
    rating: 4.9,
    cases: "240+ Deeds Audited",
    specialty: "Land Title Verification",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&q=80",
  },
  {
    id: "law-2",
    name: "Adv. Meera Chawla",
    experience: "12+ Yrs Exp",
    barCouncil: "KA/1145/2014",
    rating: 4.8,
    cases: "180+ RERA Audits",
    specialty: "Regulatory Compliance",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80",
  },
  {
    id: "law-3",
    name: "Adv. Amit K. Verma",
    experience: "15+ Yrs Exp",
    barCouncil: "KA/2021/2011",
    rating: 4.9,
    cases: "190+ Agreements Checked",
    specialty: "Encumbrance Checks",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80",
  },
];
