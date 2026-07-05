const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Get stored JWT token
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cleartitle_token");
}

/**
 * Store JWT token
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("cleartitle_token", token);
}

/**
 * Remove JWT token
 */
export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cleartitle_token");
}

/**
 * Check if user is logged in (has a token)
 */
export function hasToken(): boolean {
  return !!getToken();
}

/**
 * Core fetch wrapper with auth header injection and error handling
 */
async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

// ─── Auth API ───────────────────────────────────────────────────

export async function sendOtp(phone: string) {
  const res = await apiFetch("/api/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to send OTP");
  return data;
}

export async function verifyOtp(phone: string, otp: string) {
  const res = await apiFetch("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to verify OTP");

  // Store the JWT token
  if (data.token) {
    setToken(data.token);
  }

  return data;
}

export async function getMe() {
  const res = await apiFetch("/api/auth/me");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get profile");
  return data;
}

export async function updateProfile(updates: { name?: string; email?: string }) {
  const res = await apiFetch("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update profile");
  return data;
}

// ─── Properties API ─────────────────────────────────────────────

export interface PropertyFilters {
  page?: number;
  limit?: number;
  city?: string;
  propertyType?: string;
  bedrooms?: number;
  search?: string;
  sort?: string;
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
  return data;
}

export async function fetchPropertyById(id: string) {
  const res = await apiFetch(`/api/properties/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch property");
  return data;
}

export async function createProperty(propertyData: Record<string, unknown>) {
  const res = await apiFetch("/api/properties", {
    method: "POST",
    body: JSON.stringify(propertyData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create property");
  return data;
}

export async function updateProperty(id: string, updates: Record<string, unknown>) {
  const res = await apiFetch(`/api/properties/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update property");
  return data;
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

async function readJson(res: Response, fallback: string) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || fallback);
  return data;
}

// ─── Admin auth ─────────────────────────────────────────────────
export async function adminLogin(username: string, password: string) {
  const res = await apiFetch("/api/auth/admin-login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const data = await readJson(res, "Admin login failed");
  if (data.token) setToken(data.token);
  return data;
}

// ─── Dealers ────────────────────────────────────────────────────
export async function fetchDealers(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/dealers${toQuery(params)}`), "Failed to fetch dealers");
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

// ─── Hero banners ───────────────────────────────────────────────
export async function fetchHeroBanners() {
  return readJson(await apiFetch("/api/hero/banners"), "Failed to fetch hero banners");
}
export async function createHeroBanner(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/hero/banners", { method: "POST", body: JSON.stringify(data) }), "Failed to create hero banner");
}
export async function updateHeroBanner(id: string, data: Record<string, unknown>) {
  return readJson(await apiFetch(`/api/hero/banners/${id}`, { method: "PUT", body: JSON.stringify(data) }), "Failed to update hero banner");
}
export async function deleteHeroBanner(id: string) {
  return readJson(await apiFetch(`/api/hero/banners/${id}`, { method: "DELETE" }), "Failed to delete hero banner");
}

// ─── Leads ──────────────────────────────────────────────────────
export async function submitContactLead(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/leads/contact", { method: "POST", body: JSON.stringify(data) }), "Failed to submit enquiry");
}
export async function submitConsultationLead(data: Record<string, unknown>) {
  return readJson(await apiFetch("/api/leads/consultation", { method: "POST", body: JSON.stringify(data) }), "Failed to submit request");
}

// ─── Search ─────────────────────────────────────────────────────
export async function searchProperties(params: Record<string, unknown> = {}) {
  return readJson(await apiFetch(`/api/search${toQuery(params)}`), "Search failed");
}

