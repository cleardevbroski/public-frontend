import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => { localStorage.clear(); vi.resetModules(); });

describe("heroStore (backend-backed)", () => {
  it("serves backend banners when present", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true, status: 200,
      json: async () => ({ banners: [{ id: "1", image: "a.jpg", title: "Live", linkType: "custom", linkValue: "/x" }] }),
    }) as Response));
    const store = await import("@/lib/heroStore");
    store.getHeroSlides();
    await vi.waitFor(() => expect(store.getHeroSlides().some((s) => s.title === "Live")).toBe(true));
  });

  it("falls back to default slides when the backend has none", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ banners: [] }) }) as Response));
    const store = await import("@/lib/heroStore");
    await vi.waitFor(() => expect(store.getHeroSlides().length).toBeGreaterThan(0));
  });
});
