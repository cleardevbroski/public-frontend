import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

function stubList(properties: unknown[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ properties, pagination: {} }) }) as Response)
  );
}

describe("propertyStore (backend-backed)", () => {
  it("hydrates published properties from the API", async () => {
    stubList([
      { id: "a", title: "A", subtitle: "", price: "1", configs: [], area: "", image: "", published: true },
      { id: "b", title: "B", subtitle: "", price: "1", configs: [], area: "", image: "", published: false },
    ]);
    const store = await import("@/lib/propertyStore");
    store.getPublishedProperties(); // kick off hydration
    await vi.waitFor(() => expect(store.getPublishedProperties().map((p) => p.id)).toEqual(["a"]));
  });

  it("addProperty POSTs and returns the created property", async () => {
    const created = { id: "new", title: "New", subtitle: "", price: "1", configs: [], area: "", image: "" };
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 201, json: async () => ({ property: created }) }) as Response));
    const store = await import("@/lib/propertyStore");
    const result = await store.addProperty({ title: "New", subtitle: "", price: "1", configs: [], area: "", image: "" } as never);
    expect(result?.id).toBe("new");
  });

  it("getBuilders groups by real builderId link when one resolves fetched Builder", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).includes("/api/builders")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ builders: [{ id: "b1", name: "Prestige Group", slug: "prestige-group", verified: true }], pagination: {} }),
          } as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            properties: [
              { id: "1", title: "A", subtitle: "", price: "1", configs: [], area: "", image: "", published: true, builder: "Other Builder", builderId: "b1" },
            ],
            pagination: {},
          }),
        } as Response;
      })
    );
    const store = await import("@/lib/propertyStore");
    store.getPublishedProperties();
    store.getBuilders();
    await vi.waitFor(() => expect(store.getBuilders().length).toBeGreaterThan(0));
    expect(store.getBuilders()[0]).toMatchObject({ slug: "prestige-group", verified: true });
  });

  it("getBuilders falls back to free-text builder grouping when no link exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).includes("/api/builders")) {
          return { ok: true, status: 200, json: async () => ({ builders: [], pagination: {} }) } as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            properties: [{ id: "p1", title: "A", subtitle: "", price: "1", configs: [], area: "", image: "", published: true, builder: "Sobha Limited" }],
            pagination: {},
          }),
        } as Response;
      })
    );
    const store = await import("@/lib/propertyStore");
    store.getPublishedProperties();
    store.getBuilders();
    await vi.waitFor(() => expect(store.getBuilders().length).toBeGreaterThan(0));
    expect(store.getBuilders()[0]).toMatchObject({ name: "Sobha Limited", total: 1 });
  });

  it("getPropertiesByBuilder matches by real builderId link even when free-text builder name differs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).includes("/api/builders")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ builders: [{ id: "b1", name: "Prestige Group", slug: "prestige-group" }], pagination: {} }),
          } as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            properties: [
              { id: "p1", title: "A", subtitle: "", price: "1", configs: [], area: "", image: "", published: true, builder: "Prestige (old name)", builderId: "b1" },
            ],
            pagination: {},
          }),
        } as Response;
      })
    );
    const store = await import("@/lib/propertyStore");
    store.getPublishedProperties();
    await vi.waitFor(() => expect(store.getPropertiesByBuilder("prestige-group").length).toBe(1));
  });

  it("getPropertiesByBuilder falls back to free text when builderId points at a builder that no longer resolves", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (String(url).includes("/api/builders")) {
          return { ok: true, status: 200, json: async () => ({ builders: [], pagination: {} }) } as Response;
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            properties: [
              { id: "p1", title: "A", subtitle: "", price: "1", configs: [], area: "", image: "", published: true, builder: "Old Name", builderId: "stale-id" },
            ],
            pagination: {},
          }),
        } as Response;
      })
    );
    const store = await import("@/lib/propertyStore");
    store.getPublishedProperties();
    await vi.waitFor(() => expect(store.getPropertiesByBuilder("old-name").length).toBe(1));
  });
});
