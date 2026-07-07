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

  it("getDealerProperties prefers a real dealerId link over legacy propertyIds/locality fallback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          properties: [
            { id: "p1", title: "A", subtitle: "Whitefield, Bangalore", price: "1", configs: [], area: "", image: "", published: true, dealerId: "d1" },
            { id: "p2", title: "B", subtitle: "Hebbal, Bangalore", price: "1", configs: [], area: "", image: "", published: true },
          ],
          pagination: {},
        }),
      }) as Response),
    );
    const propertyStore = await import("@/lib/propertyStore");
    propertyStore.getPublishedProperties();
    await vi.waitFor(() => expect(propertyStore.getPublishedProperties().length).toBe(2));

    const dealerStore = await import("@/lib/dealerStore");
    const dealer = {
      id: "d1", slug: "ravi", name: "Ravi", agency: "R", dealsIn: [], buyersThisWeek: 0, memberSince: "",
      source: "curated" as const, localities: ["Hebbal"],
    };
    expect(dealerStore.getDealerProperties(dealer).map((p) => p.id)).toEqual(["p1"]);
  });

  it("getDealerMatchCount counts real dealerId links first", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          properties: [
            { id: "p1", title: "A", subtitle: "", price: "1", configs: [], area: "", image: "", published: true, dealerId: "d1" },
            { id: "p2", title: "B", subtitle: "", price: "1", configs: [], area: "", image: "", published: true },
          ],
          pagination: {},
        }),
      }) as Response),
    );
    const propertyStore = await import("@/lib/propertyStore");
    propertyStore.getPublishedProperties();
    await vi.waitFor(() => expect(propertyStore.getPublishedProperties().length).toBe(2));

    const dealerStore = await import("@/lib/dealerStore");
    const dealer = { id: "d1", slug: "ravi", name: "Ravi", agency: "R", dealsIn: [], buyersThisWeek: 0, memberSince: "", source: "curated" as const };
    expect(dealerStore.getDealerMatchCount(dealer)).toBe(1);
  });

  it("getDealerProperties still falls back to legacy propertyIds when no dealerId link exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          properties: [{ id: "p1", title: "A", subtitle: "", price: "1", configs: [], area: "", image: "", published: true }],
          pagination: {},
        }),
      }) as Response),
    );
    const propertyStore = await import("@/lib/propertyStore");
    propertyStore.getPublishedProperties();
    await vi.waitFor(() => expect(propertyStore.getPublishedProperties().length).toBe(1));

    const dealerStore = await import("@/lib/dealerStore");
    const dealer = {
      id: "d9", slug: "legacy", name: "Legacy", agency: "L", dealsIn: [], buyersThisWeek: 0, memberSince: "",
      source: "curated" as const, propertyIds: ["p1"],
    };
    expect(dealerStore.getDealerProperties(dealer).map((p) => p.id)).toEqual(["p1"]);
  });
});
