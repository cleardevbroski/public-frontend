export type CRMStage = "new" | "attempted" | "callback" | "interested" | "has_clients" | "not_interested" | "do_not_contact";
export type CallOutcome = "no_answer" | "busy" | "connected" | "callback_requested" | "interested" | "has_clients" | "needs_project_details" | "not_interested" | "wrong_number" | "do_not_contact" | "other";

export type CRMEmployee = {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  email: string;
  role: "employee" | "manager";
  permissions: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  metrics?: CRMMetrics;
};

export type CRMMetrics = {
  assigned: number;
  pending: number;
  contacted: number;
  callResults: number;
  callbacksScheduled: number;
  callbacksCompleted: number;
  callbacksDueToday: number;
  callbacksOverdue: number;
  whatsappSent: number;
  registeredAssigned?: number;
  importedAssigned?: number;
  active?: number;
  inactive?: number;
  callbackRequested?: number;
};

export type CRMPartner = {
  id: string;
  partner: {
    id: string;
    applicationNumber: string;
    partnerType: string;
    companyName: string;
    contactName: string;
    designation: string;
    mobile: string;
    alternateMobile: string;
    email: string;
    city: string;
    state: string;
    areasOfOperation: string[];
    preferredSegments: string[];
    status: string;
    registeredAt: string;
  };
  assignedEmployee: CRMEmployee | null;
  assignedEmployeeId: string;
  stage: CRMStage;
  priority: "normal" | "important" | "urgent";
  lastInteractionAt: string | null;
  lastContactedAt: string | null;
  nextFollowUpAt: string | null;
  callAttempts: number;
  completedCalls: number;
  whatsappOpened: number;
  whatsappSent: number;
  whatsappMobile: string;
  whatsappUpdatedAt: string | null;
};

export type CRMInteraction = {
  id: string;
  action: "call_started" | "call_result" | "whatsapp_number_updated" | "whatsapp_opened" | "whatsapp_result" | "note";
  outcome: string;
  note: string;
  messageBody: string;
  callbackAt: string | null;
  createdAt: string;
  employee: { id: string; employeeId: string; name: string } | null;
};

export type CRMFollowUp = {
  id: string;
  scheduledAt: string;
  priority: string;
  note: string;
  status: "pending" | "completed" | "cancelled";
  completedAt: string | null;
  employee: { id: string; employeeId: string; name: string } | null;
};

export type CRMAttachment = { _id?: string; title: string; url: string; mimeType: string; bytes: number };
export type CRMTemplate = { id: string; name: string; kind: "project" | "follow_up"; audience: "all" | "registered_cp" | "imported_cp" | "broker"; projectName: string; body: string; attachments: CRMAttachment[]; isActive: boolean; createdAt: string };
export type CRMTask = { id: string; title: string; instructions: string; targetCount: number; assignedCount: number; completedCount: number; dueAt: string | null; status: string; employee?: { id: string; employeeId: string; name: string } };
export type CRMPartnerDetail = { profile: CRMPartner; interactions: CRMInteraction[]; followUps: CRMFollowUp[]; clientsCount: number; templates: CRMTemplate[] };

export const stageLabels: Record<CRMStage, string> = {
  new: "New", attempted: "Attempted", callback: "Callback", interested: "Interested",
  has_clients: "Has clients", not_interested: "Not interested", do_not_contact: "Do not contact",
};

export const callOutcomeLabels: Record<CallOutcome, string> = {
  no_answer: "No answer", busy: "Busy", connected: "Answered / connected", callback_requested: "Callback requested", interested: "Interested",
  has_clients: "Has clients", needs_project_details: "Needs project details", not_interested: "Not interested",
  wrong_number: "Wrong number", do_not_contact: "Do not contact", other: "Other",
};
