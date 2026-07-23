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

  it("keeps hidden slides available to the admin editor", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      return {
        ok: true,
        status: 200,
        json: async () => url.endsWith("/admin")
          ? { banners: [{ id: "hidden", image: "hidden.jpg", title: "Hidden", linkType: "property", linkValue: "p1", displayOnHomepage: false }] }
          : { banners: [] },
      } as Response;
    }));
    const store = await import("@/lib/heroStore");
    store.getAdminHeroSlides();
    await vi.waitFor(() => expect(store.getAdminHeroSlides().some((slide) => slide.id === "hidden")).toBe(true));
  });

  it("finds an active ranked promotion by property id", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        banners: [{
          id: "ranked",
          image: "ranked.jpg",
          title: "Ranked",
          linkType: "property",
          linkValue: "property-1",
          propertyId: "property-1",
          promotionSlot: "diamond",
          rank: 1,
        }],
      }),
    }) as Response));
    const store = await import("@/lib/heroStore");
    store.getHeroSlides();
    await vi.waitFor(() => expect(store.getPropertyPromotion("property-1")?.promotionSlot).toBe("diamond"));
    expect(store.getPropertyPromotion("other")).toBeUndefined();
  });
});
