import { adminLogin as apiAdminLogin, hasAdminToken, removeAdminToken } from "@/lib/api";

const ADMIN_FLAG = "cleartitle_admin_auth";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  // Authed only when both the admin flag and a JWT are present.
  return localStorage.getItem(ADMIN_FLAG) === "1" && hasAdminToken();
}

/** Backend-backed admin login. Resolves true on success and persists the session. */
export async function adminLogin(username: string, password: string): Promise<boolean> {
  try {
    await apiAdminLogin(username, password); // stores the JWT (cleartitle_token) on success
    localStorage.setItem(ADMIN_FLAG, "1");
    window.dispatchEvent(new Event("cleartitle:admin-auth-changed"));
    return true;
  } catch {
    return false;
  }
}

export function adminLogout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_FLAG);
  removeAdminToken();
  window.dispatchEvent(new Event("cleartitle:admin-auth-changed"));
}
