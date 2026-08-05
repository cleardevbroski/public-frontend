export type PartnerDocumentKind = "pan-card" | "rera-certificate" | "gst-certificate" | "cancelled-cheque" | "visiting-card" | "company-logo" | "signature";

export type PartnerDocument = {
  url: string;
  originalName: string;
  mimeType: string;
  bytes: number;
  uploadedAt?: string;
};

export type ChannelPartnerStatus = "active" | "submitted" | "under_review" | "changes_requested" | "resubmitted" | "approved" | "rejected" | "suspended";
export type ChannelPartnerType = "company" | "individual";

export type ChannelPartnerApplication = {
  id?: string;
  _id?: string;
  applicationNumber?: string;
  partnerCode?: string;
  partnerCodeLast4?: string;
  partnerType: ChannelPartnerType;
  company: { name: string; businessType: string; yearEstablished: string | number; panNumber: string; gstNumber: string; reraApplicable: boolean; reraNumber: string };
  contact: { name: string; designation: string; mobile: string; alternateMobile: string; email: string };
  address: { line1: string; line2: string; city: string; state: string; pinCode: string };
  business: { areasOfOperation: string[]; currentProjects: string; developerAssociations: string; teamStrength?: string; preferredSegments: string[] };
  bank: { accountHolderName: string; bankName: string; branch: string; accountNumber?: string; accountNumberLast4?: string; ifscCode: string };
  documents: Partial<Record<"panCard" | "reraCertificate" | "gstCertificate" | "cancelledCheque" | "visitingCard" | "companyLogo" | "signatureUpload", PartnerDocument>>;
  declaration: { informationAccurate: boolean; partnerPolicyAccepted: boolean; leadPolicyAccepted: boolean; brokeragePolicyAccepted: boolean; approvalAcknowledged: boolean; policyVersion?: string; acceptedAt?: string };
  signatory: { name: string; designation: string; signedDate: string };
  signature: { mode: "drawn" | "uploaded" };
  status?: ChannelPartnerStatus;
  submittedAt?: string;
  reviewHistory?: Array<{ _id?: string; fromStatus: string; toStatus: string; note: string; createdAt: string }>;
  internalNotes?: Array<{ _id?: string; note: string; createdAt: string }>;
};
