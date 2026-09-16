import type { CRMEmployee, CRMTemplate } from "./cpCrmTypes";

export type CPVerificationStatus = "pending" | "active" | "inactive" | "callback_requested" | "no_answer" | "busy" | "wrong_number" | "not_channel_partner" | "duplicate" | "do_not_contact" | "other";

export type CPProspect = {
  id: string;
  prospectType: "channel_partner" | "broker";
  importBatchId: string;
  batch: { id: string; name: string; originalFileName: string } | null;
  sourceRowNumber: number;
  existingPartner: { id: string; applicationNumber: string; companyName: string } | null;
  assignedEmployeeId: string;
  assignedEmployee: Pick<CRMEmployee, "id" | "employeeId" | "name" | "isActive"> | null;
  assignedAt: string | null;
  verificationStatus: CPVerificationStatus;
  verifiedAt: string | null;
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;
  callAttempts: number;
  whatsappOpened: number;
  whatsappSent: number;
  profileCompletion: number;
  broker: {
    lastCallOutcome: "" | "answered" | "callback_requested" | "no_answer" | "busy" | "wrong_number";
    projectInterest: "" | "interested" | "not_interested";
    followUpAgenda: string;
  };
  partnerType: "" | "company" | "individual";
  company: { name: string; businessType: string; yearEstablished: string | number; panMasked: string; gstNumber: string; reraNumber: string };
  contact: { name: string; designation: string; mobile: string; alternateMobile: string; email: string };
  address: { line1: string; line2: string; city: string; state: string; pinCode: string };
  business: { areasOfOperation: string[]; currentProjects: string; developerAssociations: string; teamStrength: string; preferredSegments: string[] };
  bank: { accountHolderName: string; bankName: string; branch: string; accountNumberMasked: string; ifscCode: string };
  signatory: { name: string; designation: string; signedDate: string | null };
  createdAt: string;
  updatedAt: string;
};

export type CPProspectInteraction = {
  id: string; action: "call_started" | "verification_result" | "broker_call_result" | "profile_updated" | "whatsapp_opened" | "whatsapp_result" | "note";
  outcome: string; note: string; messageBody: string; callbackAt: string | null; changedFields: string[];
  metadata?: { projectInterest?: string; followUpAgenda?: string; areasOfOperation?: string[]; preferredSegments?: string[]; openedInteractionId?: string };
  createdAt: string;
  employee: { id: string; employeeId: string; name: string } | null;
};

export type CPProspectFollowUp = {
  id: string; scheduledAt: string; note: string; status: "pending" | "completed" | "cancelled";
  completedAt: string | null; createdAt: string; employee: { id: string; employeeId: string; name: string } | null;
};

export type CPProspectDetail = { prospect: CPProspect; interactions: CPProspectInteraction[]; followUps: CPProspectFollowUp[]; templates: CRMTemplate[] };

export type CPImportBatch = {
  id: string; prospectType: "channel_partner" | "broker"; name: string; originalFileName: string; totalRows: number; processedRows: number;
  importedCount: number; duplicateCount: number; invalidCount: number; matchedRegisteredCount: number;
  status: "importing" | "completed" | "failed"; errorSamples: Array<{ rowNumber: number; message: string }>;
  createdAt: string; completedAt: string | null;
};

export type CPProspectMetrics = {
  total: number; assigned: number; unassigned: number; pending: number; active: number; inactive: number;
  callback: number; unreachable: number; completed: number; overdue: number;
  interested: number; notInterested: number; whatsappOpened: number; whatsappSent: number;
};

export type CPLocationCount = { state: string; city: string; area: string; total: number; active: number; unassigned: number };

export const verificationLabels: Record<CPVerificationStatus, string> = {
  pending: "Pending", active: "Active", inactive: "Inactive", callback_requested: "Callback requested",
  no_answer: "No answer", busy: "Busy", wrong_number: "Wrong number", not_channel_partner: "Not a CP / broker",
  duplicate: "Duplicate", do_not_contact: "Do not contact", other: "Other",
};
