import { correctedFile, detectFileType } from "./fileTypeDetection";
import type { LocationVerification } from "@/components/acres/mock-data";

/**
 * API URLs are configured per frontend deployment.  People commonly paste the
 * backend URL from Render with `/api` on the end; every endpoint below already
 * includes that segment, so normalize it here to avoid requests such as
 * duplicate `/api/api/...` paths (which Render correctly returns as a 404).
 */
function getApiBase() {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (!configured) return "http://localhost:5000";
  return configured.replace(/\/+$/, "").replace(/\/api$/, "");
}

const API_BASE = getApiBase();
const CUSTOMER_TOKEN_KEY = "cleartitle_token";
const CUSTOMER_TOKEN_BACKUP_KEY = "cleartitle_customer_token";
const ADMIN_TOKEN_KEY = "cleartitle_admin_token";
const ADMIN_FLAG_KEY = "cleartitle_admin_auth";
const CHANNEL_PARTNER_TOKEN_KEY = "cleartitle_channel_partner_token";
const CRM_STAFF_TOKEN_KEY = "cleartitle_crm_staff_token";

/**
 * Get the token for the currently active application area. Admin and customer
 * sessions intentionally live separately so an admin review cannot replace a
 * customer's My Properties session in the same browser.
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem(ADMIN_FLAG_KEY) === "1") {
    // The fallback retains compatibility with an existing admin session until
    // that administrator signs in again after this update.
    return localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(CUSTOMER_TOKEN_KEY);
  }
  return getCustomerToken();
}

function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  const customerToken = localStorage.getItem(CUSTOMER_TOKEN_BACKUP_KEY);
  if (customerToken) return customerToken;
  // Do not accidentally use an old, shared admin token for customer-only APIs.
  return localStorage.getItem(ADMIN_FLAG_KEY) === "1" ? null : localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

/**
 * Store a customer JWT without disturbing a separate administrator session.
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_FLAG_KEY);
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  localStorage.setItem(CUSTOMER_TOKEN_BACKUP_KEY, token);
}

export function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  // Preserve a pre-existing customer session before the admin session becomes active.
  if (!localStorage.getItem(CUSTOMER_TOKEN_BACKUP_KEY)) {
    const customerToken = localStorage.getItem(CUSTOMER_TOKEN_KEY);
    if (customerToken) localStorage.setItem(CUSTOMER_TOKEN_BACKUP_KEY, customerToken);
  }
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

/**
 * Remove only the customer JWT.
 */
export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_TOKEN_BACKUP_KEY);
}

export function removeAdminToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

/**
 * Check whether a customer is logged in.
 */
export function hasToken(): boolean {
  return !!getCustomerToken();
}

export function hasAdminToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(ADMIN_TOKEN_KEY) || (localStorage.getItem(ADMIN_FLAG_KEY) === "1" && !!localStorage.getItem(CUSTOMER_TOKEN_KEY));
}

/**
 * Core fetch wrapper with auth header injection and error handling
 */
async function apiFetchWithToken(
  endpoint: string,
  options: RequestInit = {},
  token: string | null
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    return await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Cannot reach the API. Check VITE_API_URL and confirm the backend FRONTEND_URL allows this website origin.");
  }
}

async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  return apiFetchWithToken(endpoint, options, getToken());
}

async function customerApiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  return apiFetchWithToken(endpoint, options, getCustomerToken());
}

function crmStaffApiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window === "undefined" ? null : localStorage.getItem(CRM_STAFF_TOKEN_KEY);
  return apiFetchWithToken(endpoint, options, token);
}

// ─── Channel Partners ─────────────────────────────────────────
export async function uploadChannelPartnerDocument(file: File, kind: import("./channelPartnerTypes").PartnerDocumentKind) {
  const res = await apiFetch(`/api/channel-partner-media?kind=${encodeURIComponent(kind)}`, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Document upload failed");
  return { url: data.url, originalName: file.name, mimeType: data.mimeType || file.type, bytes: data.bytes || file.size };
}

export async function submitChannelPartner(data: Record<string, unknown>, idempotencyKey: string) {
  return readJson(await apiFetch("/api/channel-partners", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(data),
  }), "Failed to submit channel partner application");
}

export async function fetchChannelPartners(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/channel-partners${toQuery(params)}`), "Failed to fetch channel partners");
}

export async function fetchChannelPartner(id: string) {
  return readJson(await apiFetch(`/api/channel-partners/${encodeURIComponent(id)}`), "Failed to fetch channel partner application");
}

export async function updateChannelPartnerStatus(id: string, status: string, note = "") {
  return readJson(await apiFetch(`/api/channel-partners/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }), "Failed to update channel partner application");
}

export async function resendChannelPartnerRegistrationEmail(id: string) {
  return readJson(await apiFetch(`/api/channel-partners/${encodeURIComponent(id)}/resend-registration-email`, { method: "POST" }), "Failed to resend registration email");
}

export async function addChannelPartnerNote(id: string, note: string) {
  return readJson(await apiFetch(`/api/channel-partners/${encodeURIComponent(id)}/notes`, { method: "POST", body: JSON.stringify({ note }) }), "Failed to add internal note");
}

export async function deleteChannelPartner(id: string) {
  return readJson(await apiFetch(`/api/channel-partners/${encodeURIComponent(id)}`, { method: "DELETE" }), "Failed to delete channel partner");
}

export async function verifyChannelPartnerCode(partnerCode: string) {
  const data = await readJson(await apiFetch("/api/channel-partner-leads/session", {
    method: "POST",
    body: JSON.stringify({ partnerCode }),
  }), "Unable to verify Channel Partner code");
  if (data.token && typeof window !== "undefined") sessionStorage.setItem(CHANNEL_PARTNER_TOKEN_KEY, data.token);
  return data;
}

export function setChannelPartnerSession(token: string) {
  if (typeof window !== "undefined" && token) sessionStorage.setItem(CHANNEL_PARTNER_TOKEN_KEY, token);
}

export async function requestChannelPartnerCodeOtp(email: string) {
  return readJson(await apiFetch("/api/channel-partner-auth/forgot-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  }), "Unable to send the recovery OTP");
}

export async function resendChannelPartnerCodeOtp(email: string) {
  return readJson(await apiFetch("/api/channel-partner-auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  }), "Unable to resend the recovery OTP");
}

export async function verifyChannelPartnerRecoveryOtp(email: string, otp: string) {
  return readJson(await apiFetch("/api/channel-partner-auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  }), "Unable to verify the recovery OTP");
}

function channelPartnerFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window === "undefined" ? null : sessionStorage.getItem(CHANNEL_PARTNER_TOKEN_KEY);
  return apiFetchWithToken(endpoint, options, token);
}

export function hasChannelPartnerSession() {
  return typeof window !== "undefined" && Boolean(sessionStorage.getItem(CHANNEL_PARTNER_TOKEN_KEY));
}

export function clearChannelPartnerSession() {
  if (typeof window !== "undefined") sessionStorage.removeItem(CHANNEL_PARTNER_TOKEN_KEY);
}

export async function fetchChannelPartnerProjects() {
  return readJson(await channelPartnerFetch("/api/channel-partner-leads/projects"), "Unable to load projects");
}

export async function fetchChannelPartnerProfile() {
  return readJson(await channelPartnerFetch("/api/channel-partner-leads/mine/profile"), "Unable to load Channel Partner profile");
}

export async function fetchMyChannelPartnerClients() {
  return readJson(await channelPartnerFetch("/api/channel-partner-leads/mine"), "Unable to load registered clients");
}

export async function fetchChannelPartnerDashboard() {
  return readJson(await channelPartnerFetch("/api/channel-partner-leads/mine/dashboard"), "Unable to load Channel Partner dashboard");
}

export async function fetchChannelPartnerClientHistory(params: Record<string, unknown> = {}) {
  return readJson(await channelPartnerFetch(`/api/channel-partner-leads/mine/clients${toQuery(params)}`), "Unable to load client history");
}

export async function fetchChannelPartnerClashes(params: Record<string, unknown> = {}) {
  return readJson(await channelPartnerFetch(`/api/channel-partner-leads/mine/clashes${toQuery(params)}`), "Unable to load clash history");
}

export async function registerChannelPartnerClient(data: Record<string, unknown>, idempotencyKey: string) {
  return readJson(await channelPartnerFetch("/api/channel-partner-leads", {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(data),
  }), "Unable to register client");
}

export async function fetchAdminChannelPartnerClients(partnerId: string) {
  return readJson(await apiFetch(`/api/channel-partner-leads/admin/partners/${encodeURIComponent(partnerId)}`), "Unable to load Channel Partner clients");
}

export async function fetchAdminCPClients(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/channel-partner-leads/admin/clients${toQuery(params)}`), "Unable to load CP clients");
}

export async function resendCPClientConfirmationEmail(clientId: string) {
  return readJson(await apiFetch(`/api/channel-partner-leads/admin/clients/${encodeURIComponent(clientId)}/resend-email`, { method: "POST" }), "Unable to resend client confirmation email");
}

export async function updateAdminCPClientStatus(clientId: string, data: Record<string, unknown>) {
  return readJson(await apiFetch(`/api/channel-partner-leads/admin/clients/${encodeURIComponent(clientId)}/status`, { method: "PATCH", body: JSON.stringify(data) }), "Unable to update CP client status");
}

// ─── Auth API ───────────────────────────────────────────────────

export async function createManualSession(details: { name: string; email: string; phone: string }) {
  const data = await readJson(await apiFetch("/api/auth/manual-session", {
    method: "POST",
    body: JSON.stringify({ ...details, consent: true }),
  }), "Unable to save your details");
  if (data.token) setToken(data.token);
  return data;
}

export type TruecallerPurpose = "login" | "enquiry" | "brochure" | "site_visit" | "contact";

export async function startTruecallerVerification(purpose: TruecallerPurpose = "login") {
  return readJson(await apiFetch("/api/auth/truecaller/start", {
    method: "POST",
    body: JSON.stringify({ purpose }),
  }), "Unable to start Truecaller verification");
}

export async function getTruecallerVerificationStatus(requestId: string) {
  const data = await readJson(await apiFetch(`/api/auth/truecaller/status/${encodeURIComponent(requestId)}`), "Unable to complete Truecaller verification");
  if (data.token) setToken(data.token);
  return data;
}

export async function getMe() {
  return readJson(await customerApiFetch("/api/auth/me"), "Failed to get profile");
}

export async function requestPropertyEmailOtp(email: string) {
  return readJson(await apiFetch("/api/property-auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  }), "Unable to send the email verification code");
}

export async function verifyPropertyEmailOtp(email: string, otp: string) {
  return readJson(await apiFetch("/api/property-auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  }), "Unable to verify the email code");
}

export async function updateProfile(updates: { name?: string; email?: string }) {
  return readJson(await customerApiFetch("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(updates),
  }), "Failed to update profile");
}

export async function customerRegister(input: { name: string; phone: string; email: string; password: string }) {
  const data = await readJson(await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(input) }), "Registration failed");
  if (data.token) setToken(data.token);
  return data;
}

export async function customerLogin(email: string, password: string) {
  const data = await readJson(await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }), "Login failed");
  if (data.token) setToken(data.token);
  return data;
}

export async function forgotPassword(email: string) {
  return readJson(await apiFetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }), "Unable to request password reset");
}

export async function resetPassword(email: string, token: string, password: string) {
  return readJson(await apiFetch("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ email, token, password }) }), "Unable to reset password");
}

// ─── Properties API ─────────────────────────────────────────────

export interface PropertyFilters {
  page?: number;
  limit?: number;
  city?: string;
  propertyType?: string;
  bedrooms?: number;
  status?: string;
  search?: string;
  sort?: string;
}

/**
 * Mongo-backed property responses expose `_id`, while the frontend consistently
 * uses `id`. Keep the wire value for compatibility and add the frontend alias at
 * the API boundary so selects, links and mutations receive a real identifier.
 */
function normalizePropertyRecord(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const record = value as Record<string, unknown>;
  const normalizeMediaUrl = (media: unknown) => {
    if (typeof media !== "string") return media;
    const url = media.trim();
    if (url.startsWith("//")) return `https:${url}`;
    if (url.startsWith("/")) return `${API_BASE}${url}`;
    return url;
  };
  const normalizeMediaList = (media: unknown) =>
    Array.isArray(media) ? media.map(normalizeMediaUrl).filter(Boolean) : media;

  return {
    ...record,
    ...(!record.id && record._id ? { id: String(record._id) } : {}),
    title: typeof record.title === "string" && record.title.trim() ? record.title.trim() : "Untitled property",
    subtitle: typeof record.subtitle === "string" ? record.subtitle : "",
    builder: typeof record.builder === "string" ? record.builder : "",
    price: typeof record.price === "string" ? record.price : "",
    configs: Array.isArray(record.configs) ? record.configs.filter((item): item is string => typeof item === "string") : [],
    image: normalizeMediaUrl(record.image),
    heroImages: normalizeMediaList(record.heroImages),
    images: normalizeMediaList(record.images),
    masterPlan: record.masterPlan && typeof record.masterPlan === "object"
      ? { ...(record.masterPlan as Record<string, unknown>), imageUrl: normalizeMediaUrl((record.masterPlan as Record<string, unknown>).imageUrl) }
      : record.masterPlan,
  };
}

function normalizePropertyResponse<T>(value: T): T {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const response = value as Record<string, unknown>;
  const normalized = { ...response };
  if (Array.isArray(response.properties)) {
    normalized.properties = response.properties.map(normalizePropertyRecord);
  }
  if (response.property) {
    normalized.property = normalizePropertyRecord(response.property);
  }
  return normalized as T;
}

export async function fetchProperties(filters: PropertyFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const res = await apiFetch(`/api/properties?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch properties");
  return normalizePropertyResponse(data);
}

export async function fetchPropertyById(id: string) {
  const res = await apiFetch(`/api/properties/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch property");
  return normalizePropertyResponse(data);
}

export type LocationPriceComparison = {
  comparisonMetric?: "pricePerSqft" | "monthlyRentPerBed";
  comparisonBasis?: "verified_nearby_localities" | "nearby_data_unavailable";
  currentLocation: string;
  comparisons: Array<{ key: string; location: string; averagePricePerSqft: number; projectCount: number; distanceKm?: number }>;
};

export async function fetchLocationPriceComparison(id: string): Promise<LocationPriceComparison> {
  return readJson(await apiFetch(`/api/properties/price-comparison/${encodeURIComponent(id)}`), "Failed to load location price comparison");
}

export async function fetchAdminProperties(filters: PropertyFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const res = await apiFetch(`/api/properties/admin?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch admin properties");
  return normalizePropertyResponse(data);
}

async function fetchAllPages<T>(
  fetchPage: (params: Record<string, unknown>) => Promise<Record<string, any>>,
  collectionKey: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const pageSize = 100;
  const first = await fetchPage({ ...params, page: 1, limit: pageSize });
  const records = Array.isArray(first[collectionKey]) ? [...first[collectionKey]] : [];
  const pages = Math.max(1, Number(first.pagination?.pages) || 1);
  for (let page = 2; page <= pages; page += 1) {
    const response = await fetchPage({ ...params, page, limit: pageSize });
    if (Array.isArray(response[collectionKey])) records.push(...response[collectionKey]);
  }
  const seen = new Set<string>();
  return records.filter((record: Record<string, unknown>) => {
    const id = String(record?.id || record?._id || "");
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  }) as T[];
}

/** Fetch every lightweight admin property page so local dashboard search is complete. */
export function fetchAllAdminProperties(filters: Omit<PropertyFilters, "page" | "limit"> = {}) {
  return fetchAllPages<any>((params) => fetchAdminProperties(params), "properties", filters);
}

export type RecheckPackage = {
  packageName: string;
  packageSize: number;
  packageKey: string;
  batchName: string;
};

export async function preflightRecheckPackages(packages: RecheckPackage[]) {
  return readJson(await apiFetch("/api/properties/admin/recheck-imports/preflight", {
    method: "POST",
    body: JSON.stringify({ packages }),
  }), "Failed to check ZIP packages");
}

export async function createRecheckImport(packageInfo: RecheckPackage, property: Record<string, unknown>) {
  const data = await readJson(await apiFetch("/api/properties/admin/recheck-imports", {
    method: "POST",
    body: JSON.stringify({ package: packageInfo, property }),
  }), "Failed to create Recheck property");
  return normalizePropertyResponse(data);
}

export async function reviewRecheckProperty(id: string, action: "move_to_pending" | "publish") {
  const data = await readJson(await apiFetch(`/api/properties/admin/recheck-imports/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  }), "Failed to update Recheck property");
  return normalizePropertyResponse(data);
}

export async function fetchPropertyImportBatches() {
  return readJson(await apiFetch("/api/property-import-batches"), "Failed to load batch reports");
}

export async function fetchPropertyImportBatch(id: string) {
  return readJson(await apiFetch(`/api/property-import-batches/${encodeURIComponent(id)}`), "Failed to load batch report");
}

export async function fetchPropertyImportReraConflicts() {
  return readJson(await apiFetch("/api/property-import-batches/rera-conflicts"), "Failed to load RERA conflicts");
}

/** Fetch one listing with its complete media and workflow data for admin editing. */
export async function fetchAdminProperty(id: string) {
  const data = await readJson(
    await apiFetch(`/api/properties/admin/property/${encodeURIComponent(id)}`),
    "Failed to fetch property"
  );
  return normalizePropertyResponse(data);
}

export async function fetchPropertyIngestionReview(id: string) {
  return readJson(await apiFetch(`/api/properties/admin/property/${encodeURIComponent(id)}/ingestion-review`), "Failed to fetch ingestion review");
}

export async function reviewPropertyIngestionCandidate(id: string, candidateId: string, decision: "accepted" | "rejected", reason: string) {
  return readJson(await apiFetch(`/api/properties/admin/property/${encodeURIComponent(id)}/ingestion-candidates/${encodeURIComponent(candidateId)}`, { method: "PATCH", body: JSON.stringify({ decision, reason }) }), "Failed to review ingestion candidate");
}

export async function fetchFavoritePropertyIds() {
  return readJson(await customerApiFetch("/api/favorites/ids"), "Failed to load saved properties");
}

export async function fetchFavoriteProperties() {
  const data = await readJson(await customerApiFetch("/api/favorites"), "Failed to load saved properties");
  return normalizePropertyResponse(data);
}

export async function saveFavoriteProperty(propertyId: string) {
  return readJson(await customerApiFetch(`/api/favorites/${encodeURIComponent(propertyId)}`, { method: "POST" }), "Failed to save property");
}

export async function removeFavoriteProperty(propertyId: string) {
  return readJson(await customerApiFetch(`/api/favorites/${encodeURIComponent(propertyId)}`, { method: "DELETE" }), "Failed to remove saved property");
}

export type AffordabilitySettings = {
  defaultInterestRate: number;
  defaultTenureYears: number;
  comfortableIncomeRatioMin: number;
  comfortableIncomeRatioMax: number;
  defaultState: string;
  disclaimer: string;
};

export type AffordabilityRule = {
  _id?: string;
  id?: string;
  name: string;
  code: string;
  state: string;
  city?: string;
  propertyTypes: string[];
  possessionStatuses: string[];
  calculationType: "percentage" | "fixed" | "per_sqft" | "slab";
  basis: "base_price" | "agreement_value" | "built_up_area";
  rate: number;
  fixedAmount: number;
  slabs: Array<{ minValue: number; maxValue: number | null; rate: number; fixedAmount: number }>;
  minPropertyValue: number;
  maxPropertyValue: number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  sourceLabel?: string;
  sourceUrl?: string;
  notes?: string;
  priority: number;
  active: boolean;
};

export type AffordabilityLine = {
  code: string;
  label: string;
  amount: number | null;
  sourceType: "exact_project_value" | "developer_supplied" | "government_rule_estimate" | "user_assumption" | "missing";
  sourceNote?: string;
  sourceUrl?: string;
  timing?: string;
  optional?: boolean;
  calculationType?: string;
};

export type AffordabilityResult = {
  available: boolean;
  configurationName?: string;
  basePrice?: number;
  basePriceSourceType?: "exact_project_value" | "developer_supplied";
  priceUpdatedAt?: string | null;
  area?: number;
  projectCharges?: AffordabilityLine[];
  governmentCharges?: AffordabilityLine[];
  monthlyCharges?: AffordabilityLine[];
  lineItems?: AffordabilityLine[];
  totalCharges?: number;
  totalPurchaseCost?: number;
  initialPayment?: number;
  loanAmount?: number;
  interestRate?: number;
  tenureYears?: number;
  monthlyEmi?: number;
  suggestedMonthlyIncome?: { min: number; max: number } | null;
  assumptions?: Record<string, number | string>;
  disclaimer?: string;
  missing?: string[];
};

export async function fetchAffordabilitySettings(): Promise<AffordabilitySettings> {
  const data = await readJson(await apiFetch("/api/affordability/settings"), "Unable to load affordability settings");
  return data.settings;
}

export async function saveAffordabilitySettings(settings: AffordabilitySettings) {
  return readJson(await apiFetch("/api/affordability/settings", { method: "PUT", body: JSON.stringify(settings) }), "Unable to save affordability settings");
}

export async function fetchAffordabilityRules(): Promise<AffordabilityRule[]> {
  const data = await readJson(await apiFetch("/api/affordability/rules"), "Unable to load affordability rules");
  return data.rules;
}

export async function createAffordabilityRule(rule: AffordabilityRule) {
  return readJson(await apiFetch("/api/affordability/rules", { method: "POST", body: JSON.stringify(rule) }), "Unable to create affordability rule");
}

export async function updateAffordabilityRule(id: string, rule: AffordabilityRule) {
  return readJson(await apiFetch(`/api/affordability/rules/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(rule) }), "Unable to update affordability rule");
}

export async function deactivateAffordabilityRule(id: string) {
  return readJson(await apiFetch(`/api/affordability/rules/${encodeURIComponent(id)}`, { method: "DELETE" }), "Unable to deactivate affordability rule");
}

export async function calculatePropertyAffordability(propertyId: string, input: Record<string, unknown>): Promise<AffordabilityResult> {
  const data = await readJson(await apiFetch(`/api/affordability/properties/${encodeURIComponent(propertyId)}/calculate`, { method: "POST", body: JSON.stringify(input) }), "Unable to calculate complete affordability");
  return data.affordability;
}

export type HomeFinderInput = {
  purpose: "self_use" | "family_upgrade" | "investment" | "rental";
  destination: { query: string; resolvedAddress?: string; latitude?: number; longitude?: number };
  maxMonthlyEmi: number;
  downPayment: number;
  bhk: number;
  deadline: string;
};

export async function resolveBuyerDestination(query: string) {
  const data = await readJson(await apiFetch("/api/home-finder/destination", { method: "POST", body: JSON.stringify({ query }) }), "Unable to locate destination");
  return data.destination as { latitude: number; longitude: number; resolvedAddress: string; provider: string };
}

export async function findHomeRecommendations(input: HomeFinderInput) {
  const data = await readJson(await apiFetch("/api/home-finder/recommendations", { method: "POST", body: JSON.stringify(input) }), "Unable to find matching homes");
  return normalizePropertyResponse(data);
}

function workspaceFetch(endpoint: string, token: string, options: RequestInit = {}) {
  return apiFetch(endpoint, { ...options, headers: { ...(options.headers as Record<string, string>), "X-Workspace-Token": token } });
}

function workspaceParticipantFetch(endpoint: string, token: string, participantId: string, options: RequestInit = {}) {
  return workspaceFetch(endpoint, token, { ...options, headers: { ...(options.headers as Record<string, string>), "X-Participant-Id": participantId } });
}

export async function createDecisionWorkspace(propertyIds: string[] = []) {
  return readJson(await apiFetch("/api/decision-workspaces", { method: "POST", body: JSON.stringify({ propertyIds }) }), "Unable to create family workspace");
}

export async function fetchDecisionWorkspace(id: string, token: string) {
  const data = await readJson(await workspaceFetch(`/api/decision-workspaces/${encodeURIComponent(id)}`, token), "Unable to load family workspace");
  return normalizePropertyResponse(data);
}

export async function addDecisionWorkspaceProperty(id: string, token: string, propertyId: string) {
  const data = await readJson(await workspaceFetch(`/api/decision-workspaces/${encodeURIComponent(id)}/properties`, token, { method: "POST", body: JSON.stringify({ propertyId }) }), "Unable to add property to workspace");
  return normalizePropertyResponse(data);
}

export async function removeDecisionWorkspaceProperty(id: string, token: string, propertyId: string) {
  const data = await readJson(await workspaceFetch(`/api/decision-workspaces/${encodeURIComponent(id)}/properties/${encodeURIComponent(propertyId)}`, token, { method: "DELETE" }), "Unable to remove property from workspace");
  return normalizePropertyResponse(data);
}

export async function updateDecisionWorkspaceProperty(id: string, token: string, propertyId: string, input: { note?: string; questions?: string[] }) {
  const data = await readJson(await workspaceFetch(`/api/decision-workspaces/${encodeURIComponent(id)}/properties/${encodeURIComponent(propertyId)}`, token, { method: "PATCH", body: JSON.stringify(input) }), "Unable to update workspace notes");
  return normalizePropertyResponse(data);
}

export async function voteInDecisionWorkspace(id: string, token: string, propertyId: string, input: { participantId: string; nickname: string; vote: "prefer" | "maybe" | "not_preferred" }) {
  const data = await readJson(await workspaceFetch(`/api/decision-workspaces/${encodeURIComponent(id)}/properties/${encodeURIComponent(propertyId)}/votes`, token, { method: "POST", body: JSON.stringify(input) }), "Unable to save family vote");
  return normalizePropertyResponse(data);
}

export async function fetchDecisionWorkspaceSummary(id: string, token: string) {
  return readJson(await workspaceFetch(`/api/decision-workspaces/${encodeURIComponent(id)}/summary`, token), "Unable to prepare comparison summary");
}

export type DecisionWorkspaceMessage = {
  id: string;
  nickname: string;
  message: string;
  propertyId: string;
  propertyTitle: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isMine: boolean;
  canDelete: boolean;
};

export async function fetchDecisionWorkspaceMessages(id: string, token: string, participantId: string, after = "") {
  return readJson(await workspaceParticipantFetch(`/api/decision-workspaces/${encodeURIComponent(id)}/messages${toQuery({ after })}`, token, participantId), "Unable to load family chat");
}

export async function sendDecisionWorkspaceMessage(id: string, token: string, participantId: string, input: { nickname: string; message: string; propertyId?: string }) {
  return readJson(await workspaceParticipantFetch(`/api/decision-workspaces/${encodeURIComponent(id)}/messages`, token, participantId, { method: "POST", body: JSON.stringify(input) }), "Unable to send family message");
}

export async function deleteDecisionWorkspaceMessage(id: string, token: string, participantId: string, messageId: string) {
  return readJson(await workspaceParticipantFetch(`/api/decision-workspaces/${encodeURIComponent(id)}/messages/${encodeURIComponent(messageId)}`, token, participantId, { method: "DELETE" }), "Unable to remove family message");
}

export async function askProject(propertyId: string, question: string) {
  return readJson(await apiFetch(`/api/project-assistant/${encodeURIComponent(propertyId)}/ask`, { method: "POST", body: JSON.stringify({ question }) }), "Unable to answer this project question");
}

export async function reportProjectAnswer(propertyId: string, questionId: string, reason = "") {
  return readJson(await apiFetch(`/api/project-assistant/${encodeURIComponent(propertyId)}/feedback`, { method: "POST", body: JSON.stringify({ questionId, reason }) }), "Unable to report this answer");
}

export async function fetchAssistantLearningStats() {
  return readJson(await apiFetch("/api/project-assistant/admin/stats"), "Unable to load assistant review totals");
}

export async function fetchAssistantQuestions(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/project-assistant/admin/questions${toQuery(params)}`), "Unable to load project questions");
}

export async function dismissAssistantQuestion(id: string) {
  return readJson(await apiFetch(`/api/project-assistant/admin/questions/${encodeURIComponent(id)}/dismiss`, { method: "PATCH" }), "Unable to dismiss question");
}

export async function fetchProjectAssistantEvidence(propertyId: string) {
  return readJson(await apiFetch(`/api/project-assistant/admin/properties/${encodeURIComponent(propertyId)}/evidence`), "Unable to load project evidence");
}

export async function resolveAssistantQuestion(id: string, input: { canonicalQuestion: string; aliases: string[]; answer: string; evidenceIds: string[] }) {
  return readJson(await apiFetch(`/api/project-assistant/admin/questions/${encodeURIComponent(id)}/resolve`, { method: "POST", body: JSON.stringify(input) }), "Unable to approve answer");
}

export async function fetchProjectKnowledge(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/project-assistant/admin/knowledge${toQuery(params)}`), "Unable to load approved answers");
}

export async function updateProjectKnowledge(id: string, input: { canonicalQuestion: string; aliases: string[]; answer: string; evidenceIds: string[] }) {
  return readJson(await apiFetch(`/api/project-assistant/admin/knowledge/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) }), "Unable to update approved answer");
}

export async function deactivateProjectKnowledge(id: string) {
  return readJson(await apiFetch(`/api/project-assistant/admin/knowledge/${encodeURIComponent(id)}`, { method: "DELETE" }), "Unable to deactivate approved answer");
}

export async function fetchDocumentExtractions(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/project-assistant/admin/documents${toQuery(params)}`), "Unable to load document extractions");
}

export async function fetchDocumentExtraction(id: string) {
  return readJson(await apiFetch(`/api/project-assistant/admin/documents/${encodeURIComponent(id)}`), "Unable to load extracted document text");
}

export async function discoverPropertyDocuments(propertyId: string) {
  return readJson(await apiFetch("/api/project-assistant/admin/documents/discover", { method: "POST", body: JSON.stringify({ propertyId }) }), "Unable to discover project documents");
}

export async function processDocumentExtraction(id: string) {
  return readJson(await apiFetch(`/api/project-assistant/admin/documents/${encodeURIComponent(id)}/process`, { method: "POST" }), "Unable to extract document text");
}

export async function reviewDocumentExtraction(id: string, action: "approve" | "reject", pages?: Array<{ pageNumber: number; text: string }>) {
  return readJson(await apiFetch(`/api/project-assistant/admin/documents/${encodeURIComponent(id)}/review`, { method: "PATCH", body: JSON.stringify({ action, pages }) }), "Unable to review extracted text");
}

export async function createProperty(propertyData: Record<string, unknown>) {
  const data = await readJson(
    await apiFetch("/api/properties", {
      method: "POST",
      body: JSON.stringify(propertyData),
    }),
    "Failed to create property"
  );
  return normalizePropertyResponse(data);
}

export async function createPublicProperty(propertyData: Record<string, unknown>) {
  return readJson(
    await customerApiFetch("/api/properties/public", {
      method: "POST",
      body: JSON.stringify(propertyData),
    }),
    "Failed to submit property"
  );
}

export async function createPropertyDraft(propertyData: Record<string, unknown>) {
  return readJson(await customerApiFetch("/api/properties/draft", { method: "POST", body: JSON.stringify(propertyData) }), "Failed to save draft");
}

export async function fetchMyProperties() {
  return readJson(await customerApiFetch("/api/properties/my"), "Failed to fetch your properties");
}

export async function fetchMyProperty(id: string) {
  return readJson(await customerApiFetch(`/api/properties/my/${id}`), "Failed to fetch your property");
}

export async function resubmitProperty(id: string, propertyData: Record<string, unknown>) {
  return readJson(await customerApiFetch(`/api/properties/my/${id}/resubmit`, { method: "PUT", body: JSON.stringify(propertyData) }), "Failed to resubmit property");
}

export async function fetchPublicSubmissions(status = "all") {
  return readJson(await apiFetch(`/api/properties/admin/submissions?status=${encodeURIComponent(status)}`), "Failed to fetch public submissions");
}

export async function fetchPublicSubmission(id: string) {
  return readJson(await apiFetch(`/api/properties/admin/submissions/${id}`), "Failed to fetch submission");
}

export async function reviewPublicSubmission(id: string, action: "start_review" | "request_changes" | "publish" | "reject", message = "") {
  return readJson(await apiFetch(`/api/properties/admin/submissions/${id}/review`, { method: "PUT", body: JSON.stringify({ action, message }) }), "Failed to update submission");
}

export async function uploadPropertyMedia(file: File, kind: "image" | "brochure" | "layout-map-image" | "layout-map-pdf" | "project-document-image" | "project-document-pdf" | "project-walkthrough" | "legal-document-image" | "legal-document-pdf" | "rera-document-image" | "rera-document-pdf"): Promise<string> {
  const detected = await detectFileType(file);
  const source = correctedFile(file, detected);
  const res = await apiFetch(`/api/property-media?kind=${kind}`, {
    method: "POST",
    headers: { "Content-Type": source.type || "application/octet-stream" },
    body: source,
  });
  const data = await res.json();
  if (!res.ok) {
    const mismatch = detected.mismatch
      ? ` Detected ${detected.label} content although the file was declared as ${detected.declaredMime || "another type"}.`
      : "";
    throw new Error(`${data.error || "Media upload failed"}${mismatch}`);
  }
  return data.url;
}

export type ResolvedNearbyPlace = {
  latitude: number;
  longitude: number;
  osmId: string;
  mapUrl: string;
  resolvedAddress: string;
  approximateDistanceMeters: number;
};

export async function resolveNearbyPlaceLocation(input: { query: string; latitude: number; longitude: number }): Promise<ResolvedNearbyPlace> {
  const data = await readJson(await apiFetch("/api/geocoding/nearby-place", {
    method: "POST",
    body: JSON.stringify(input),
  }), "Failed to resolve nearby place") as { place: ResolvedNearbyPlace };
  return data.place;
}

export type ProjectLocationAnalysisInput = {
  geocode?: string;
  latitude?: number;
  longitude?: number;
  locality?: { address?: string; landmark?: string; city?: string; pinCode?: string };
  reraAddresses?: string[];
};

export async function analyzeProjectLocation(input: ProjectLocationAnalysisInput): Promise<LocationVerification> {
  const data = await readJson(await apiFetch("/api/geocoding/project-location/analyze", {
    method: "POST",
    body: JSON.stringify(input),
  }), "Failed to analyze project location") as { analysis: LocationVerification };
  return data.analysis;
}

export async function confirmProjectLocation(analysis: LocationVerification): Promise<LocationVerification> {
  const data = await readJson(await apiFetch("/api/geocoding/project-location/confirm", {
    method: "POST",
    body: JSON.stringify({ analysis }),
  }), "Failed to confirm project location") as { verification: LocationVerification };
  return data.verification;
}

export type PropertyVerificationPurpose = "company-pan" | "company-rera" | "company-registration" | "individual-pan" | "individual-aadhaar" | "individual-ownership";
export type PropertyVerificationDocument = { id: string; purpose: PropertyVerificationPurpose; fileName: string; mimeType: string; bytes: number };

export async function uploadPropertyVerificationDocument(file: File, purpose: PropertyVerificationPurpose): Promise<PropertyVerificationDocument> {
  const res = await customerApiFetch(`/api/property-media?kind=property-verification-document&purpose=${encodeURIComponent(purpose)}`, {
    method: "POST",
    headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) },
    body: file,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Verification document upload failed");
  return data.document;
}

export async function downloadPropertyVerificationDocument(documentId: string, fileName: string) {
  const res = await apiFetch(`/api/property-media/poster-documents/${encodeURIComponent(documentId)}/download`, { method: "GET" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Verification document download failed");
  }
  const url = URL.createObjectURL(await res.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadProjectFile(propertyId: string, documentId: string, fileName: string) {
  const res = await customerApiFetch(`/api/properties/${encodeURIComponent(propertyId)}/project-downloads/${encodeURIComponent(documentId)}/download`, { method: "GET" });
  if (!res.ok) {
    let message = "Project download failed";
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {}
    throw new Error(message);
  }
  const url = URL.createObjectURL(await res.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadPropertyDocument(propertyId: string, phaseId: string, documentId: string, fileName: string) {
  const res = await customerApiFetch(`/api/properties/${encodeURIComponent(propertyId)}/documents/${encodeURIComponent(phaseId)}/${encodeURIComponent(documentId)}/download`, {
    method: "GET",
  });
  if (!res.ok) {
    let message = "Document download failed";
    try {
      const data = await res.json();
      message = data.error || message;
    } catch {}
    throw new Error(message);
  }
  const url = URL.createObjectURL(await res.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function updateProperty(id: string, updates: Record<string, unknown>) {
  const res = await apiFetch(`/api/properties/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update property");
  return normalizePropertyResponse(data);
}

export async function updatePropertyWorkflow(id: string, updates: Record<string, unknown>) {
  const res = await apiFetch(`/api/properties/${id}/workflow`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update property workflow");
  return normalizePropertyResponse(data);
}

export async function deleteProperty(id: string) {
  const res = await apiFetch(`/api/properties/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete property");
  return data;
}

// ─── Helpers ────────────────────────────────────────────────────
function toQuery(params: Record<string, unknown> = {}): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function readJson<T = any>(res: Response, fallback: string): Promise<T> {
  let data: { error?: string } = {};
  try {
    data = await res.json();
  } catch {
    throw new Error("The API returned an invalid response. Check VITE_API_URL is your Render backend URL, not the website URL.");
  }
  if (res.status === 404 && (!data.error || data.error === "Route not found")) {
    throw new Error("API route not found. Check VITE_API_URL points to the Render backend service.");
  }
  if (!res.ok) throw new Error(data.error || fallback);
  return data as T;
}

// ─── Admin auth ─────────────────────────────────────────────────
export async function adminLogin(username: string, password: string) {
  const res = await apiFetch("/api/auth/admin-login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const data = await readJson(res, "Admin login failed");
  if (data.token) setAdminToken(data.token);
  return data;
}

// ─── CP Management CRM ─────────────────────────────────────────
export async function crmEmployeeLogin(employeeId: string, password: string) {
  const data = await readJson(await apiFetch("/api/cp-crm/auth/login", { method: "POST", body: JSON.stringify({ employeeId, password }) }), "Employee login failed");
  if (data.token && typeof window !== "undefined") localStorage.setItem(CRM_STAFF_TOKEN_KEY, data.token);
  return data;
}
export function hasCRMEmployeeSession() { return typeof window !== "undefined" && Boolean(localStorage.getItem(CRM_STAFF_TOKEN_KEY)); }
export function crmEmployeeLogout() { if (typeof window !== "undefined") localStorage.removeItem(CRM_STAFF_TOKEN_KEY); }
export async function fetchCRMEmployeeMe() { return readJson(await crmStaffApiFetch("/api/cp-crm/auth/me"), "Unable to load employee session"); }
export async function fetchCRMEmployees() { return readJson(await apiFetch("/api/cp-crm/admin/employees"), "Unable to load employees"); }
export async function fetchCRMEmployeeActivity(id: string) { return readJson(await apiFetch(`/api/cp-crm/admin/employees/${encodeURIComponent(id)}/activity`), "Unable to load employee activity"); }
export async function createCRMEmployee(data: Record<string, unknown>) { return readJson(await apiFetch("/api/cp-crm/admin/employees", { method: "POST", body: JSON.stringify(data) }), "Unable to create employee"); }
export async function updateCRMEmployee(id: string, data: Record<string, unknown>) { return readJson(await apiFetch(`/api/cp-crm/admin/employees/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }), "Unable to update employee"); }
export async function deleteCRMEmployee(id: string) { return readJson(await apiFetch(`/api/cp-crm/admin/employees/${encodeURIComponent(id)}`, { method: "DELETE" }), "Unable to delete employee"); }
export async function resetCRMEmployeePassword(id: string, password: string) { return readJson(await apiFetch(`/api/cp-crm/admin/employees/${encodeURIComponent(id)}/reset-password`, { method: "POST", body: JSON.stringify({ password }) }), "Unable to reset password"); }
export async function fetchCRMTasks() { return readJson(await apiFetch("/api/cp-crm/admin/tasks"), "Unable to load assignments"); }
export async function createCRMTask(data: Record<string, unknown>) { return readJson(await apiFetch("/api/cp-crm/admin/tasks", { method: "POST", body: JSON.stringify(data) }), "Unable to assign Channel Partners"); }
export async function fetchAdminCRMPartners(params: Record<string, unknown> = {}) { return readJson(await apiFetch(`/api/cp-crm/admin/partners${toQuery(params)}`), "Unable to load CP Management"); }
export async function fetchAdminCRMPartner(id: string) { return readJson(await apiFetch(`/api/cp-crm/admin/partners/${encodeURIComponent(id)}`), "Unable to load CP details"); }
export async function assignCRMPartner(partnerId: string, employeeId: string) { return readJson(await apiFetch(`/api/cp-crm/admin/partners/${encodeURIComponent(partnerId)}/assign`, { method: "PATCH", body: JSON.stringify({ employeeId: employeeId || null }) }), "Unable to update assignment"); }
export async function fetchCRMTemplates() { return readJson(await apiFetch("/api/cp-crm/admin/templates"), "Unable to load message templates"); }
export async function createCRMTemplate(data: Record<string, unknown>) { return readJson(await apiFetch("/api/cp-crm/admin/templates", { method: "POST", body: JSON.stringify(data) }), "Unable to create message template"); }
export async function updateCRMTemplate(id: string, data: Record<string, unknown>) { return readJson(await apiFetch(`/api/cp-crm/admin/templates/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) }), "Unable to update message template"); }
export async function uploadCRMMaterial(file: File) {
  const response = await apiFetchWithToken("/api/cp-crm-media", { method: "POST", headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) }, body: file }, getToken());
  return readJson(response, "Unable to upload project material");
}
export async function fetchMyCRMDashboard() { return readJson(await crmStaffApiFetch("/api/cp-crm/mine/dashboard"), "Unable to load CRM dashboard"); }
export async function fetchMyCRMPartners(params: Record<string, unknown> = {}) { return readJson(await crmStaffApiFetch(`/api/cp-crm/mine/partners${toQuery(params)}`), "Unable to load assigned CPs"); }
export async function fetchMyCRMPartner(id: string) { return readJson(await crmStaffApiFetch(`/api/cp-crm/mine/partners/${encodeURIComponent(id)}`), "Unable to load CP details"); }
export async function startCRMCall(partnerId: string) { return readJson(await crmStaffApiFetch(`/api/cp-crm/mine/partners/${encodeURIComponent(partnerId)}/call-start`, { method: "POST" }), "Unable to start call"); }
export async function saveCRMCallResult(partnerId: string, data: Record<string, unknown>) { return readJson(await crmStaffApiFetch(`/api/cp-crm/mine/partners/${encodeURIComponent(partnerId)}/call-result`, { method: "POST", body: JSON.stringify(data) }), "Unable to save call result"); }
export async function openCRMWhatsApp(partnerId: string, data: Record<string, unknown>) { return readJson(await crmStaffApiFetch(`/api/cp-crm/mine/partners/${encodeURIComponent(partnerId)}/whatsapp-open`, { method: "POST", body: JSON.stringify(data) }), "Unable to open WhatsApp"); }
export async function saveCRMWhatsAppResult(partnerId: string, data: Record<string, unknown>) { return readJson(await crmStaffApiFetch(`/api/cp-crm/mine/partners/${encodeURIComponent(partnerId)}/whatsapp-result`, { method: "POST", body: JSON.stringify(data) }), "Unable to save WhatsApp result"); }
export async function addCRMPartnerNote(partnerId: string, note: string) { return readJson(await crmStaffApiFetch(`/api/cp-crm/mine/partners/${encodeURIComponent(partnerId)}/notes`, { method: "POST", body: JSON.stringify({ note }) }), "Unable to save note"); }

// ─── Imported CP verification ──────────────────────────────────
export async function fetchCPImportBatches(params: Record<string, unknown> = {}) { return readJson(await apiFetch(`/api/cp-prospects/admin/imports${toQuery(params)}`), "Unable to load CP import batches"); }
export async function createCPImportBatch(data: Record<string, unknown>) { return readJson(await apiFetch("/api/cp-prospects/admin/imports", { method: "POST", body: JSON.stringify(data) }), "Unable to begin CP import"); }
export async function uploadCPImportRows(batchId: string, data: Record<string, unknown>) { return readJson(await apiFetch(`/api/cp-prospects/admin/imports/${encodeURIComponent(batchId)}/rows`, { method: "POST", body: JSON.stringify(data) }), "Unable to import spreadsheet rows"); }
export async function completeCPImportBatch(batchId: string) { return readJson(await apiFetch(`/api/cp-prospects/admin/imports/${encodeURIComponent(batchId)}/complete`, { method: "POST" }), "Unable to complete CP import"); }
export async function fetchCPProspectAnalytics(params: Record<string, unknown> = {}) { return readJson(await apiFetch(`/api/cp-prospects/admin/analytics${toQuery(params)}`), "Unable to load CP verification analytics"); }
export async function fetchAdminCPProspects(params: Record<string, unknown> = {}) { return readJson(await apiFetch(`/api/cp-prospects/admin/prospects${toQuery(params)}`), "Unable to load imported CP contacts"); }
export async function fetchAdminCPProspect(id: string) { return readJson(await apiFetch(`/api/cp-prospects/admin/prospects/${encodeURIComponent(id)}`), "Unable to load imported CP details"); }
export async function assignCPProspect(id: string, employeeId: string) { return readJson(await apiFetch(`/api/cp-prospects/admin/prospects/${encodeURIComponent(id)}/assign`, { method: "PATCH", body: JSON.stringify({ employeeId: employeeId || null }) }), "Unable to update imported CP assignment"); }
export async function allocateCPProspects(data: Record<string, unknown>) { return readJson(await apiFetch("/api/cp-prospects/admin/prospects/allocate", { method: "PATCH", body: JSON.stringify(data) }), "Unable to allocate imported CP contacts"); }
export async function exportCPProspects(params: Record<string, unknown> = {}) {
  const response = await apiFetch(`/api/cp-prospects/admin/prospects/export${toQuery(params)}`);
  if (!response.ok) return readJson(response, "Unable to export imported CP contacts");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = `verified-cp-contacts-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
  URL.revokeObjectURL(url);
}
export async function fetchMyCPProspects(params: Record<string, unknown> = {}) { return readJson(await crmStaffApiFetch(`/api/cp-prospects/mine/prospects${toQuery(params)}`), "Unable to load CP verification queue"); }
export async function fetchMyCPProspect(id: string) { return readJson(await crmStaffApiFetch(`/api/cp-prospects/mine/prospects/${encodeURIComponent(id)}`), "Unable to load imported CP details"); }
export async function startCPProspectCall(id: string) { return readJson(await crmStaffApiFetch(`/api/cp-prospects/mine/prospects/${encodeURIComponent(id)}/call-start`, { method: "POST" }), "Unable to start call"); }
export async function updateCPProspectProfile(id: string, data: Record<string, unknown>) { return readJson(await crmStaffApiFetch(`/api/cp-prospects/mine/prospects/${encodeURIComponent(id)}/profile`, { method: "PATCH", body: JSON.stringify(data) }), "Unable to update CP information"); }
export async function saveCPProspectVerification(id: string, data: Record<string, unknown>) { return readJson(await crmStaffApiFetch(`/api/cp-prospects/mine/prospects/${encodeURIComponent(id)}/verification`, { method: "POST", body: JSON.stringify(data) }), "Unable to save CP verification"); }
export async function saveBrokerCallResult(id: string, data: Record<string, unknown>) { return readJson(await crmStaffApiFetch(`/api/cp-prospects/mine/prospects/${encodeURIComponent(id)}/broker-result`, { method: "POST", body: JSON.stringify(data) }), "Unable to save broker call result"); }
export async function openCPProspectWhatsApp(id: string, data: Record<string, unknown>) { return readJson(await crmStaffApiFetch(`/api/cp-prospects/mine/prospects/${encodeURIComponent(id)}/whatsapp-open`, { method: "POST", body: JSON.stringify(data) }), "Unable to open WhatsApp"); }
export async function saveCPProspectWhatsAppResult(id: string, data: Record<string, unknown>) { return readJson(await crmStaffApiFetch(`/api/cp-prospects/mine/prospects/${encodeURIComponent(id)}/whatsapp-result`, { method: "POST", body: JSON.stringify(data) }), "Unable to save WhatsApp result"); }
export async function addCPProspectNote(id: string, note: string) { return readJson(await crmStaffApiFetch(`/api/cp-prospects/mine/prospects/${encodeURIComponent(id)}/notes`, { method: "POST", body: JSON.stringify({ note }) }), "Unable to save note"); }

// ─── Dealers ────────────────────────────────────────────────────
export async function fetchDealers(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/dealers${toQuery(params)}`), "Failed to fetch dealers");
}
export function fetchAllDealers(params: Record<string, unknown> = {}) {
  return fetchAllPages<any>((pageParams) => fetchDealers(pageParams), "dealers", params);
}
export async function createDealer(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/dealers", { method: "POST", body: JSON.stringify(data) }), "Failed to create dealer");
}
export async function updateDealer(id: string, data: Record<string, unknown>) {
  return readJson(await apiFetch(`/api/dealers/${id}`, { method: "PUT", body: JSON.stringify(data) }), "Failed to update dealer");
}
export async function deleteDealer(id: string) {
  return readJson(await apiFetch(`/api/dealers/${id}`, { method: "DELETE" }), "Failed to delete dealer");
}

// ─── Builders ───────────────────────────────────────────────────
export async function fetchBuilders(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/builders${toQuery(params)}`), "Failed to fetch builders");
}
export function fetchAllBuilders(params: Record<string, unknown> = {}) {
  return fetchAllPages<any>((pageParams) => fetchBuilders(pageParams), "builders", params);
}
export async function fetchBuilder(slug: string) {
  return readJson(await apiFetch(`/api/builders/${encodeURIComponent(slug)}`), "Failed to fetch builder");
}
export async function createBuilder(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/builders", { method: "POST", body: JSON.stringify(data) }), "Failed to create builder");
}
export async function updateBuilder(id: string, data: Record<string, unknown>) {
  return readJson(await apiFetch(`/api/builders/${id}`, { method: "PUT", body: JSON.stringify(data) }), "Failed to update builder");
}
export async function deleteBuilder(id: string) {
  return readJson(await apiFetch(`/api/builders/${id}`, { method: "DELETE" }), "Failed to delete builder");
}

// ─── Hero banners ───────────────────────────────────────────────
export async function fetchHeroBanners() {
  return readJson(await apiFetch("/api/hero/banners"), "Failed to fetch hero banners");
}
export async function fetchAdminHeroBanners() {
  return readJson(await apiFetch("/api/hero/banners/admin"), "Failed to fetch hero banners");
}
export async function createHeroBanner(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/hero/banners", { method: "POST", body: JSON.stringify(data) }), "Failed to create hero banner");
}
export async function updateHeroBanner(id: string, data: Record<string, unknown>) {
  return readJson(await apiFetch(`/api/hero/banners/${id}`, { method: "PUT", body: JSON.stringify(data) }), "Failed to update hero banner");
}
export async function updateHeroBannerOrder(id: string, order: number) {
  return readJson(await apiFetch(`/api/hero/banners/${id}/order`, { method: "PATCH", body: JSON.stringify({ order }) }), "Failed to update hero banner order");
}
export async function deleteHeroBanner(id: string) {
  return readJson(await apiFetch(`/api/hero/banners/${id}`, { method: "DELETE" }), "Failed to delete hero banner");
}

// ─── Advertisements ────────────────────────────────────────────
export async function fetchAdvertisements(admin = false) {
  return readJson(await apiFetch(`/api/advertisements${admin ? "/admin" : ""}`), "Failed to fetch advertisements");
}
export async function createAdvertisement(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/advertisements", { method: "POST", body: JSON.stringify(data) }), "Failed to create advertisement");
}
export async function updateAdvertisement(id: string, data: Record<string, unknown>) {
  return readJson(await apiFetch(`/api/advertisements/${id}`, { method: "PUT", body: JSON.stringify(data) }), "Failed to update advertisement");
}
export async function deleteAdvertisement(id: string) {
  return readJson(await apiFetch(`/api/advertisements/${id}`, { method: "DELETE" }), "Failed to delete advertisement");
}

export async function fetchLoginReports(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/login-reports${toQuery(params)}`), "Failed to fetch login reports");
}

// ─── Leads ──────────────────────────────────────────────────────
export async function fetchLeads(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/leads${toQuery(params)}`), "Failed to fetch leads");
}
export async function fetchLeadMetrics(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/leads/metrics${toQuery(params)}`), "Failed to fetch lead metrics");
}
export async function fetchLead(id: string) {
  return readJson(await apiFetch(`/api/leads/${id}`), "Failed to fetch lead details");
}
export async function importLeads(rows: Record<string, unknown>[]) {
  return readJson(await apiFetch("/api/leads/import", { method: "POST", body: JSON.stringify({ rows }) }), "Failed to import leads");
}
export async function submitContactLead(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/leads/contact", { method: "POST", body: JSON.stringify(data) }), "Failed to submit enquiry");
}
export async function submitConsultationLead(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/leads/consultation", { method: "POST", body: JSON.stringify(data) }), "Failed to submit request");
}
export async function submitPropertyConsultation(data: Record<string, unknown>) {
  return readJson(await customerApiFetch("/api/leads/consultation/property", { method: "POST", body: JSON.stringify(data) }), "Failed to submit consultation request");
}
export async function submitPropertyInterest(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/leads/property-interest", { method: "POST", body: JSON.stringify(data) }), "Failed to submit verified property request");
}

// ─── Analytics ──────────────────────────────────────────────────
export async function fetchAnalyticsDashboard(days: 7 | 30 | 90 = 30) {
  return readJson(await apiFetch(`/api/analytics/dashboard?days=${days}`), "Failed to fetch analytics dashboard");
}
export async function submitAnalyticsEvent(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/analytics/track", { method: "POST", body: JSON.stringify(data), keepalive: true }), "Failed to track analytics event");
}

// Client activity uses the customer token when available so an anonymous
// browser history can be joined to the customer after login.
export async function submitClientActivityVisit(data: Record<string, unknown>) {
  return readJson(await customerApiFetch("/api/client-activity/visit", {
    method: "POST",
    body: JSON.stringify(data),
    keepalive: true,
  }), "Failed to record client visit");
}

export async function submitClientActivityEngagement(data: Record<string, unknown>) {
  return readJson(await customerApiFetch("/api/client-activity/engagement", {
    method: "POST",
    body: JSON.stringify(data),
    keepalive: true,
  }), "Failed to record property activity");
}

export async function fetchClientActivityVisitors(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/client-activity/admin/visitors${toQuery(params)}`), "Failed to fetch client activity");
}

export async function fetchClientActivityVisitor(id: string) {
  return readJson(await apiFetch(`/api/client-activity/admin/visitors/${encodeURIComponent(id)}`), "Failed to fetch visitor details");
}

// ─── Application error notifications ──────────────────────────
export async function reportApplicationError(data: Record<string, unknown>) {
  const response = await apiFetch("/api/system-notifications/report", {
    method: "POST",
    body: JSON.stringify(data),
    keepalive: true,
  });
  if (!response.ok) throw new Error("Unable to report application error");
}

export async function fetchSystemNotifications(limit = 20) {
  return readJson(await apiFetch(`/api/system-notifications/admin?limit=${limit}`), "Failed to fetch notifications");
}

export async function markSystemNotificationRead(id: string) {
  return readJson(await apiFetch(`/api/system-notifications/admin/${encodeURIComponent(id)}/read`, { method: "PATCH" }), "Failed to update notification");
}

export async function markAllSystemNotificationsRead() {
  return readJson(await apiFetch("/api/system-notifications/admin/read-all", { method: "PATCH" }), "Failed to update notifications");
}

// ─── Search ─────────────────────────────────────────────────────
export async function searchProperties(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/search${toQuery(params)}`), "Search failed");
}

// ─── CMS: Testimonials ──────────────────────────────────────────
export async function fetchTestimonials(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/cms/testimonials${toQuery(params)}`), "Failed to fetch testimonials");
}
export async function createTestimonial(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/cms/testimonials", { method: "POST", body: JSON.stringify(data) }), "Failed to create testimonial");
}
export async function updateTestimonial(id: string, data: Record<string, unknown>) {
  return readJson(await apiFetch(`/api/cms/testimonials/${id}`, { method: "PUT", body: JSON.stringify(data) }), "Failed to update testimonial");
}
export async function deleteTestimonial(id: string) {
  return readJson(await apiFetch(`/api/cms/testimonials/${id}`, { method: "DELETE" }), "Failed to delete testimonial");
}

// ─── CMS: Lawyers ───────────────────────────────────────────────
export async function fetchLawyers(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/cms/lawyers${toQuery(params)}`), "Failed to fetch lawyers");
}
export async function fetchAdminLawyers() {
  return readJson(await apiFetch("/api/cms/lawyers/admin"), "Failed to fetch lawyers");
}
export async function createLawyer(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/cms/lawyers", { method: "POST", body: JSON.stringify(data) }), "Failed to create lawyer");
}
export async function updateLawyer(id: string, data: Record<string, unknown>) {
  return readJson(await apiFetch(`/api/cms/lawyers/${id}`, { method: "PUT", body: JSON.stringify(data) }), "Failed to update lawyer");
}
export async function deleteLawyer(id: string) {
  return readJson(await apiFetch(`/api/cms/lawyers/${id}`, { method: "DELETE" }), "Failed to delete lawyer");
}

// ─── CMS: Insights ──────────────────────────────────────────────
export async function fetchInsights(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/cms/insights${toQuery(params)}`), "Failed to fetch insights");
}
export async function createInsight(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/cms/insights", { method: "POST", body: JSON.stringify(data) }), "Failed to create insight");
}
export async function updateInsight(id: string, data: Record<string, unknown>) {
  return readJson(await apiFetch(`/api/cms/insights/${id}`, { method: "PUT", body: JSON.stringify(data) }), "Failed to update insight");
}
export async function deleteInsight(id: string) {
  return readJson(await apiFetch(`/api/cms/insights/${id}`, { method: "DELETE" }), "Failed to delete insight");
}

// ─── Leads: status + delete ────────────────────────────────────
export async function updateLeadStatus(id: string, status: string) {
  return readJson(await apiFetch(`/api/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }), "Failed to update lead status");
}
export async function updateLeadQualification(id: string, data: { score: number; level: string; reasons?: string[] }) {
  return readJson(await apiFetch(`/api/leads/${id}/qualification`, { method: "PATCH", body: JSON.stringify(data) }), "Failed to update lead qualification");
}
export async function updateLeadFollowUp(id: string, data: { note: string; assignedTo?: string }) {
  return readJson(await apiFetch(`/api/leads/${id}/follow-up`, { method: "PATCH", body: JSON.stringify(data) }), "Failed to save follow-up note");
}
export async function deleteLead(id: string) {
  return readJson(await apiFetch(`/api/leads/${id}`, { method: "DELETE" }), "Failed to delete lead");
}
