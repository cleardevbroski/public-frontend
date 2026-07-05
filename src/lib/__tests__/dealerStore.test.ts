import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => { localStorage.clear(); vi.resetModules(); });

describe("dealerStore (backend-backed)", () => {
  it("hydrates dealers from the API", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true, status: 200,
      json: async () => ({ dealers: [{ id: "1", slug: "ravi", name: "Ravi", agency: "R", dealsIn: [], buyersThisWeek: 0, memberSince: "" }], pagination: {} }),
    }) as Response));
    const store = await import("@/lib/dealerStore");
    store.getDealers();
    await vi.waitFor(() => expect(store.getDealers().map((d) => d.slug)).toContain("ravi"));
  });
});
