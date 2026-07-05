import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => localStorage.clear());

describe("adminAuth", () => {
  it("returns true and marks authed on valid backend login", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ token: "jwt-admin" }) }) as Response));
    const { adminLogin, isAdminAuthed } = await import("@/lib/adminAuth");
    expect(await adminLogin("admin", "secret")).toBe(true);
    expect(isAdminAuthed()).toBe(true);
  });

  it("returns false and stays unauthed on rejected login", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 401, json: async () => ({ error: "Invalid admin credentials" }) }) as Response));
    const { adminLogin, isAdminAuthed } = await import("@/lib/adminAuth");
    expect(await adminLogin("admin", "wrong")).toBe(false);
    expect(isAdminAuthed()).toBe(false);
  });
});
