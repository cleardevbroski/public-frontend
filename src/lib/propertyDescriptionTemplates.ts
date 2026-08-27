export type PropertyImportType = "Apartment" | "Villa" | "Plot" | "Commercial" | "PG/Co-living";

const AI_INSTRUCTIONS = `PROPERTY IMPORT TEMPLATE

[AI INSTRUCTIONS]
1. Convert the supplied source information into this exact format.
2. Keep every section heading and field label unchanged.
3. Use only facts present in the source. Never guess or invent details.
4. Leave unavailable fields blank. Do not write N/A, Not Available, or explanations in fields.
5. Repeat record blocks such as [RERA PHASE], [CONFIGURATION], [AMENITY], [NEARBY PLACE], [FAQ], [MASTER PLAN DETAIL], [PLOT SIZE], [PLOT INVENTORY ITEM], and [PG SHARING OPTION] as many times as required.
6. Put only one value in a single-choice field. Do not combine Villa facings such as East / North / West; leave it blank if one exact direction is unknown.
7. Do not include image, PDF, brochure, plan, certificate, or document URLs. Those files are uploaded manually.
8. Return only the completed template without commentary.`;

const developerAndRera = `[DEVELOPER DETAILS]
Developer Name:
About Developer:

[RERA]
Allowed RERA Values: Yes | No
RERA Registered:

[RERA PHASE]
Phase Name:
RERA Number:
RERA Website:

[RERA PHASE]
Phase Name:
RERA Number:
RERA Website:`;

const projectContent = `[PROJECT INTRODUCTION]
Paragraph:
Paragraph:

[PROJECT USPS]
USP:
USP:

[WHY INVEST]
Reason:
Reason:

[LOCATION ADVANTAGES]
Advantage:
Advantage:

[PROJECT KEY DETAIL]
Label:
Value:

[PROJECT FEATURE GROUP]
Group Title:
Item:
Item:

[MASTER PLAN]
Master Plan Section Title:
Verified Master Plan Description:

[MASTER PLAN DETAIL]
Section Title:
Section Description:

[FAQ]
Question:
Answer:`;

const location = `[LOCATION]
Address:
Landmark:
Locality:
Zone:
City:
Pincode:`;

const projectArea = `[PROJECT AREA AND INVENTORY]
Total Project Area:
Open Space Area:
Project Built-up Area:
Amenities Area:
Total Units:
Total Towers:`;

const plotProjectArea = `[PROJECT AREA AND INVENTORY]
Total Project Area:
Open Space Area:
Amenities Area:`;

const amenitiesNearby = `[AMENITY]
Amenity Name:
Amenity Description:
Allowed Amenity Statuses: Available | Planned | Under Construction
Amenity Status:

[NEARBY PLACE]
Allowed Categories: School | College | Hospital | Shopping | Metro | Workplace | Park | Road
Category:
Place Name:
Distance:
Address:
Landmark:`;

const societyAmenitiesNearby = `[SOCIETY]
Security:
Water Supply:
Power Backup:
Lift:
Visitor Parking:
Maintenance Staff:

${amenitiesNearby}`;

const apartment = `${AI_INSTRUCTIONS}

[PROPERTY BASICS]
Property Type: Apartment
Project / Property Name:
Builder / Developer:
Transaction Type: New Property
Allowed Listing Types: For Sale | For Rent
Listing Type:
Title / Subtitle:
Description:
Allowed Possession Statuses: Ready to Move | Under Construction | New Launch
Possession Status:
Date Format: YYYY-MM-DD; month format: YYYY-MM
Ready / Launch Date:
Expected Completion Month:
Allowed Furnishing Values: Unfurnished | Semi-Furnished | Fully Furnished
Furnishing:
Parking:

${developerAndRera}

${projectArea}

${location}

[CONFIGURATION]
Configuration Name:
Price:
Built-up Area:
Carpet Area:
Bedrooms:
Bathrooms:
Balconies:
Allowed Facings: East, West, North, South, North-East, North-West, South-East, South-West
Facings:

${societyAmenitiesNearby}

${projectContent}`;

const villa = `${AI_INSTRUCTIONS}

[PROPERTY BASICS]
Property Type: Villa
Project / Property Name:
Builder / Developer:
Transaction Type: New Property
Allowed Listing Types: For Sale | For Rent
Listing Type:
Title / Subtitle:
Description:
Allowed Possession Statuses: Ready to Move | Under Construction
Possession Status:
Date Format: YYYY-MM-DD; month format: YYYY-MM
Ready Since Date:
Expected Completion Month:
Allowed Furnishing Values: Unfurnished | Semi-Furnished | Fully Furnished
Furnishing:
Parking:

${developerAndRera}

${projectArea}

${location}

[VILLA DETAILS]
Allowed Villa Types: Independent | Row Villa | Twin Villa | Villament | Penthouse | Duplex Villa | Triplex Villa | Luxury Villa | Mansion | Mixed Villa Development
Villa Type:
Plot Dimensions:
Number of Floors:
Allowed Project Plot Facings: East | West | North | South | North-East | North-West | South-East | South-West
Project Plot Facing:
Corner Plot:
Road Width:
Private Garden:
Garden Area:
Private Pool:
Terrace:
Terrace Details:
Gated Community:

[CONFIGURATION]
Configuration Name:
BHK:
Allowed Unit Variants: Simplex | Duplex | Triplex | Villament | Penthouse | Row House | Independent Villa | Twin Villa | Sky Villa | Luxury Villa | Mansion | Custom
Unit Variant:
Structure:
Price:
Plot Area:
Built-up Area:
Carpet Area:
Super Area:
Bedrooms:
Bathrooms:
Balconies:
Plot Dimensions:
Allowed Plot Facings: East | West | North | South | North-East | North-West | South-East | South-West
Plot Facing:
Corner Plot:
Road Width:
Private Garden:
Garden Area:
Private Pool:
Terrace:
Terrace Details:
Gated Community:

${societyAmenitiesNearby}

${projectContent}`;

const plot = `${AI_INSTRUCTIONS}

[PROPERTY BASICS]
Property Type: Plot
Project / Property Name:
Builder / Developer:
Transaction Type: New Property
Allowed Listing Types: For Sale | For Rent
Listing Type:
Title / Subtitle:
Description:

${developerAndRera}

${plotProjectArea}

${location}

[PLOT DETAILS]
Total Plots:
Allowed Approval Authorities: BMRDA | BDA | BBMP | DTCP | Panchayat | MPA | Other verified authority
Approval Authority:
Approval Number:
Road Width:
Allowed Infrastructure Statuses: Ready | Under Development
Underground Drainage:
Electricity:
Water:
Allowed Layout Possession Statuses: Layout Ready | Under Development
Layout Possession Status:
Date Format: YYYY-MM-DD; month format: YYYY-MM
Layout Ready Date:
Expected Completion Month:

[PLOT SIZE]
Plot Dimensions:
Price Per Sqft:
Allowed Facings: East, West, North, South, North-East, North-West, South-East, South-West
Facings:

[PLOT INVENTORY ITEM]
Plot Number:
Plot Dimensions:
Allowed Facing Values: East | West | North | South | North-East | North-West | South-East | South-West
Facing:
Allowed Inventory Statuses: Available | Booked | Sold
Status:
Corner Plot:

${amenitiesNearby}

${projectContent}

[MANUAL UPLOAD REMINDER]
Master plan / layout-map image or PDF must be uploaded manually after applying this template.`;

const commercial = `${AI_INSTRUCTIONS}

[PROPERTY BASICS]
Property Type: Commercial
Project / Property Name:
Builder / Developer:
Transaction Type: New Property
Allowed Listing Types: For Sale | For Rent
Listing Type:
Title / Subtitle:
Description:
Allowed Possession Statuses: Ready to Move | Under Construction
Possession Status:
Date Format: YYYY-MM-DD; month format: YYYY-MM
Ready Date:
Expected Completion Month:

${developerAndRera}

${projectArea}

${location}

[COMMERCIAL DETAILS]
Allowed Commercial Subtypes: Office Space | Shop/Showroom | Warehouse | Industrial Shed | Co-working
Commercial Subtype:
Allowed Zone Types: IT/ITES SEZ | Non-SEZ | Retail | Industrial
Zone Type:
Carpet Area:
Built-up Area:
Super Area:
Floor:
Total Floors:
Frontage Requirement: Required only for Shop/Showroom
Frontage:
Seating Capacity:
Cabins:
Meeting Rooms:
Allowed Building Grades: Grade A | Grade B | Grade C | Not Applicable
Building Grade:
Structure:
Allowed Pantry Values: None | Shared Pantry | Private Pantry
Pantry:
Washrooms:
Parking:
Power Backup:
Sanctioned Load KVA:
Fire Safety Compliance:
Allowed Furnishing Values: Bare Shell | Warm Shell | Fully Furnished
Furnishing:

${societyAmenitiesNearby}

${projectContent}`;

const pg = `${AI_INSTRUCTIONS}

[PROPERTY BASICS]
Property Type: PG/Co-living
Project / Property Name:
Operator / Developer:
Listing Type: For Rent
Title / Subtitle:
Description:

${developerAndRera}

${location}

[PG DETAILS]
Allowed Gender Preferences: Men only | Women only | Co-ed
Gender Preference:
Date Format: YYYY-MM-DD
Available From:
Allowed Meal Values: Breakfast + Dinner | All 3 meals | No meals
Meals Included:
Allowed Food Types: Veg only | Veg + Non-veg
Food Type:
Wi-Fi Included:
Laundry Included:
Laundry Schedule:
Housekeeping:
Curfew / Entry Timing:
Visitors Allowed:
Notice Period:
Lock-in Period:
ID Proof Required:
Utilities Included:
Allowed Contact Types: Owner | PG Manager | Company-run
Contact Type:
Common Amenities:

[PG SHARING OPTION]
Allowed Sharing Types: Single occupancy | Double sharing | Triple sharing | Four sharing
Sharing Type:
Rent Per Bed:
Deposit:
Beds Available:

[AMENITY]
Amenity Name:
Amenity Description:
Allowed Amenity Statuses: Available | Planned | Under Construction
Amenity Status:

[NEARBY PLACE]
Allowed Categories: School | College | Hospital | Shopping | Metro | Workplace | Park | Road
Category:
Place Name:
Distance:
Address:
Landmark:

${projectContent}`;

export const PROPERTY_DESCRIPTION_TEMPLATES: Record<PropertyImportType, string> = {
  Apartment: apartment,
  Villa: villa,
  Plot: plot,
  Commercial: commercial,
  "PG/Co-living": pg,
};

export const PROPERTY_TEMPLATE_FILE_NAMES: Record<PropertyImportType, string> = {
  Apartment: "apartment-property-description-template.txt",
  Villa: "villa-property-description-template.txt",
  Plot: "plot-property-description-template.txt",
  Commercial: "commercial-property-description-template.txt",
  "PG/Co-living": "pg-coliving-property-description-template.txt",
};
