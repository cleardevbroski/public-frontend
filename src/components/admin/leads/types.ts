export type LeadStatus = "new" | "contacted" | "qualified" | "closed";
export type LeadType = "contact" | "consultation" | "property_interest";
export type LeadSource = "website_contact" | "legal_consultation" | "property_interest" | "admin_import" | "manual";
export type QualificationLevel = "unassessed" | "low" | "warm" | "high";

export type PropertyActivity = {
  propertyId?: string;
  propertyTitle?: string;
  propertyType?: string;
  location?: string;
  priceLabel?: string;
  viewCount?: number;
  activeSeconds?: number;
  actionCount?: number;
  actions?: Record<string, number>;
  lastViewedAt?: string;
};

export type LeadActivity = {
  visitCount: number;
  totalActiveSeconds: number;
  totalPropertyViews: number;
  engagementScore: number;
  lastActivityAt?: string;
  topProperty?: PropertyActivity | null;
};

export type FollowUpEntry = {
  _id?: string;
  note: string;
  createdAt: string;
};

export type Lead = {
  _id: string;
  id?: string;
  type: LeadType;
  source: LeadSource;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  category?: string;
  propertyId?: string;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyUrl?: string;
  audience?: string;
  budget?: string;
  status: LeadStatus;
  qualificationScore: number;
  qualificationLevel: QualificationLevel;
  qualificationReasons?: string[];
  qualificationDerived?: boolean;
  followUpNote?: string;
  followUpHistory?: FollowUpEntry[];
  assignedTo?: string;
  phoneVerified?: boolean;
  verificationSource?: string;
  activity?: LeadActivity | null;
  createdAt: string;
  updatedAt?: string;
  lastContactedAt?: string;
};

export type LeadMetricsData = {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  closed: number;
  needsAttention: number;
};

export type LeadPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type LeadFiltersValue = {
  search: string;
  status: "" | LeadStatus;
  source: "" | LeadSource;
  type: "" | LeadType;
  sort: "newest" | "oldest" | "name" | "score" | "activity";
};

export const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed: "Closed",
};

export const sourceLabels: Record<LeadSource, string> = {
  website_contact: "Website enquiry",
  legal_consultation: "Legal consultation",
  property_interest: "Property interest",
  admin_import: "Admin import",
  manual: "Manual entry",
};

export const qualificationLabels: Record<QualificationLevel, string> = {
  unassessed: "Unassessed",
  low: "Low intent",
  warm: "Warm",
  high: "High intent",
};

export function leadId(lead: Lead) {
  return lead.id || lead._id;
}

