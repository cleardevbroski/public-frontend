import { submitClientActivityEngagement, submitClientActivityVisit } from "@/lib/api";

const VISITOR_KEY = "cleartitle_visitor_id";
const VISIT_KEY = "cleartitle_visit_session";
const VISIT_TIMEOUT_MS = 30 * 60 * 1000;
const recordedVisits = new Set<string>();

type VisitState = { id: string; startedAt: number; lastActivityAt: number };
export type PropertyActivity = { propertyId: string; propertyTitle: string; propertyType: string; location: string; priceLabel: string };
export type PropertyActivityAction = "brochure" | "contact" | "enquiry" | "share" | "whatsapp" | "priceList" | "floorPlan" | "favorite" | "unfavorite";

function randomId(prefix: string) {
  const value = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "")
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${value}`;
}

export function getVisitorId() {
  if (typeof window === "undefined") return "visitor_server_session";
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const visitorId = randomId("visitor");
  localStorage.setItem(VISITOR_KEY, visitorId);
  return visitorId;
}

export function getVisitState(now = Date.now()): VisitState {
  if (typeof window === "undefined") return { id: "visit_server_session", startedAt: now, lastActivityAt: now };
  try {
    const existing = JSON.parse(localStorage.getItem(VISIT_KEY) || "null") as VisitState | null;
    if (existing?.id && now - existing.lastActivityAt < VISIT_TIMEOUT_MS) {
      const active = { ...existing, lastActivityAt: now };
      localStorage.setItem(VISIT_KEY, JSON.stringify(active));
      return active;
    }
  } catch {
    // Invalid browser state is replaced below.
  }
  const created = { id: randomId("visit"), startedAt: now, lastActivityAt: now };
  localStorage.setItem(VISIT_KEY, JSON.stringify(created));
  return created;
}

function deviceCategory() {
  if (typeof window === "undefined") return "unknown";
  if (/iPad|Tablet/i.test(navigator.userAgent)) return "tablet";
  if (/Android|iPhone|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768) return "mobile";
  return "desktop";
}

export function recordClientVisit(path: string, forceIdentityLink = false) {
  if (typeof window === "undefined" || path.startsWith("/admin")) return;
  const visit = getVisitState();
  if (recordedVisits.has(visit.id) && !forceIdentityLink) return;
  recordedVisits.add(visit.id);
  void submitClientActivityVisit({
    visitorId: getVisitorId(),
    visitId: visit.id,
    path: path.slice(0, 500),
    referrer: document.referrer.slice(0, 500),
    deviceCategory: deviceCategory(),
  }).catch(() => recordedVisits.delete(visit.id));
}

export function submitPropertyActivity(property: PropertyActivity, activeSeconds = 0, action: PropertyActivityAction | "" = "") {
  if (typeof window === "undefined") return;
  const visit = getVisitState();
  void submitClientActivityEngagement({
    visitorId: getVisitorId(),
    visitId: visit.id,
    ...property,
    activeSeconds,
    action,
  }).catch(() => {
    // Activity reporting must never interrupt property browsing.
  });
}

export function resetClientActivityForTests() {
  recordedVisits.clear();
}
