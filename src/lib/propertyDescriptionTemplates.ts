export type PropertyImportType = "Apartment" | "Villa" | "Plot" | "Commercial" | "PG/Co-living";

const AI_INSTRUCTIONS = `Read this property template and convert the source information at the end into this exact template format.

[AI INSTRUCTIONS]
1. Keep every section heading and field label unchanged and use all explicit facts from the source data.
2. Leave unavailable fields blank. Do not write N/A, Not Available, explanations, or invented values in fields.
3. Even when the source has no FAQ section, create 6-10 useful project FAQs and answers using only supplied facts. FAQs may cover location, property type, configurations, price and area, possession, RERA phases, amenities, developer, connectivity, nearby places, furnishing, and parking when those facts are provided.
4. Create 4-6 [WHY INVEST] reasons by analyzing supplied project facts such as density, inventory, location, workplaces, infrastructure, amenities, developer information, RERA registration, design, connectivity, and possession timeline.
5. Why Invest reasons and FAQs must remain factual. Do not promise guaranteed returns, appreciation, rental income, legal approval, or investment safety unless the source explicitly supports the statement.
6. You may create introduction paragraphs by summarizing the source, Project USPs by identifying factual highlights, Why Invest reasons through reasonable fact-supported conclusions, FAQs by converting supplied facts into questions and answers, and location advantages from supplied distances, roads, and nearby places.
7. Never invent prices, areas, distances, RERA numbers, completion dates, amenities, developer achievements, approvals, or specifications.
8. Repeat [RERA PHASE], [CONFIGURATION], [AMENITY], [NEARBY PLACE], [PROJECT KEY DETAIL], [PROJECT FEATURE GROUP], [MASTER PLAN DETAIL], [FAQ], [PLOT SIZE], [PLOT INVENTORY ITEM], and [PG SHARING OPTION] blocks whenever multiple records are required.
9. If exactly one RERA number is supplied without a phase name, set its Phase Name to Phase 1. If multiple RERA numbers are supplied without phase names, use Phase 1, Phase 2, and so on in source order. Include every supplied RERA phase.
10. Create master-plan content only when the source contains master-plan, layout, planning, zoning, or project-design information.
11. Put only one value in a single-choice field. Do not combine Villa facings such as East / North / West; leave the field blank if one exact allowed direction is unknown. For multi-facing fields such as Facings, use only the supplied allowed directions.
12. Do not include image, PDF, brochure, plan, certificate, or document URLs. Actual files must be uploaded manually; import only their relevant text facts.
13. Return only the completed property template beginning with [PROPERTY BASICS]. Do not return instructions, explanations, citations, source data, greetings, or commentary.
14. Before returning, verify that the Project / Property Name is filled; Builder / Developer or Operator / Developer is filled when available; at least one matching type-specific configuration, size, inventory, commercial-detail, or sharing block is filled; every available RERA phase is included; Introduction, Project USPs, 4-6 Why Invest reasons, and 6-10 FAQs are generated; and no unsupported facts were added.`;

const sourceDataPlaceholder = `[SOURCE DATA START]

PASTE THE COMPLETE PROPERTY WEBSITE TEXT HERE

[SOURCE DATA END]`;

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
Official Promoter:
RERA Project ID:
Acknowledgement Number:
Registration Status:
District:
Project Approval Date:
Registered Completion Date:
Registered Address:
Promoter Address:

[RERA PHASE]
Phase Name:
RERA Number:
RERA Website:
Official Promoter:
RERA Project ID:
Acknowledgement Number:
Registration Status:
District:
Project Approval Date:
Registered Completion Date:
Registered Address:
Promoter Address:`;

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
BHK:
Price:
Built-up Area:
Carpet Area:
Bedrooms:
Bathrooms:
Balconies:
Allowed Facings: East, West, North, South, North-East, North-West, South-East, South-West
Facings:

${societyAmenitiesNearby}

${projectContent}

${sourceDataPlaceholder}`;

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

${projectContent}

${sourceDataPlaceholder}`;

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
Master plan / layout-map image or PDF must be uploaded manually after applying this template.

${sourceDataPlaceholder}`;

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

${projectContent}

${sourceDataPlaceholder}`;

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

${projectContent}

${sourceDataPlaceholder}`;

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
