import { submitAnalyticsEvent } from "@/lib/api";

export type AnalyticsEventType =
  | "page_view"
  | "property_view"
  | "property_share"
  | "search"
  | "brochure_download"
  | "contact_reveal"
  | "enquiry_submitted"
  | "contact_form_submitted"
  | "legal_query_submitted"
  | "lawyer_consultation_opened"
  | "lawyer_consultation_submitted"
  | "whatsapp_consultation_opened"
  | "public_property_submitted";

type AnalyticsMeta = Partial<Record<
  "propertyId" | "propertyTitle" | "location" | "propertyType" | "query" | "searchType" |
  "lawyerId" | "lawyerName" | "topic" | "source",
  string
>>;

const SESSION_KEY = "cleartitle_analytics_session";
const SESSION_TTL = 30 * 24 * 60 * 60 * 1000;
const recentEvents = new Map<string, number>();

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().replace(/-/g, "");
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
}

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as { id?: string; expiresAt?: number } | null;
    if (stored?.id && Number(stored.expiresAt) > Date.now()) return stored.id;
  } catch {
    // Replace invalid or legacy values below.
  }
  const session = { id: createSessionId(), expiresAt: Date.now() + SESSION_TTL };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session.id;
}

export function trackAnalytics(eventType: AnalyticsEventType, meta: AnalyticsMeta = {}, dedupeKey = "") {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/admin")) return;
  const now = Date.now();
  if (dedupeKey) {
    const key = `${eventType}:${dedupeKey}`;
    if (now - (recentEvents.get(key) || 0) < 1500) return;
    recentEvents.set(key, now);
  }
  void submitAnalyticsEvent({
    eventType,
    sessionId: getAnalyticsSessionId(),
    path: `${window.location.pathname}${window.location.search}`.slice(0, 500),
    meta,
  }).catch(() => {
    // Analytics must never interrupt the customer journey.
  });
}
