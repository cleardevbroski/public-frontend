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
});
