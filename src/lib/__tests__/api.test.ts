import { describe, it, expect, vi, beforeEach } from "vitest";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok, status, json: async () => body }) as Response)
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("api client", () => {
  it("adminLogin stores the returned token", async () => {
    mockFetchOnce({ token: "jwt-123", user: { role: "admin" } });
    const { adminLogin } = await import("@/lib/api");
    const res = await adminLogin("admin", "secret");
    expect(res.token).toBe("jwt-123");
    expect(localStorage.getItem("cleartitle_token")).toBe("jwt-123");
  });

  it("createDealer sends the auth header when a token is present", async () => {
    localStorage.setItem("cleartitle_token", "jwt-xyz");
    const fetchMock = vi.fn(async () => ({ ok: true, status: 201, json: async () => ({ dealer: { id: "1" } }) }) as Response);
    vi.stubGlobal("fetch", fetchMock);
    const { createDealer } = await import("@/lib/api");
    await createDealer({ name: "X", slug: "x" });
    const callArgs = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const opts = callArgs[1];
    expect(opts.method).toBe("POST");
    expect((opts.headers as Record<string, string>)["Authorization"]).toBe("Bearer jwt-xyz");
  });

  it("throws the server error message on non-2xx", async () => {
    mockFetchOnce({ error: "Slug already in use" }, false, 400);
    const { createDealer } = await import("@/lib/api");
    await expect(createDealer({ name: "X", slug: "dupe" })).rejects.toThrow("Slug already in use");
  });

  it("fetchHeroBanners returns the banners array", async () => {
    mockFetchOnce({ banners: [{ id: "1", title: "A" }] });
    const { fetchHeroBanners } = await import("@/lib/api");
    const data = await fetchHeroBanners();
    expect(data.banners).toHaveLength(1);
  });
});
