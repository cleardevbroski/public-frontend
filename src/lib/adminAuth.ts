import { adminLogin as apiAdminLogin, hasAdminToken, removeAdminToken } from "@/lib/api";

const ADMIN_FLAG = "cleartitle_admin_auth";
let lastAdminLoginError = "";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  // Authed only when both the admin flag and a JWT are present.
  return localStorage.getItem(ADMIN_FLAG) === "1" && hasAdminToken();
}

/** Backend-backed admin login. Resolves true on success and persists the session. */
export async function adminLogin(username: string, password: string): Promise<boolean> {
  try {
    await apiAdminLogin(username, password); // stores the JWT (cleartitle_token) on success
    lastAdminLoginError = "";
    localStorage.setItem(ADMIN_FLAG, "1");
    window.dispatchEvent(new Event("cleartitle:admin-auth-changed"));
    return true;
  } catch (error) {
    lastAdminLoginError = error instanceof Error ? error.message : "Unable to sign in. Please try again.";
    return false;
  }
}

export function getAdminLoginError(): string {
  return lastAdminLoginError;
}

export function adminLogout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_FLAG);
  removeAdminToken();
  window.dispatchEvent(new Event("cleartitle:admin-auth-changed"));
}
