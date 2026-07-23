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
  it("does not duplicate /api when VITE_API_URL includes it", async () => {
    vi.stubEnv("VITE_API_URL", "https://backend.example.com/api/");
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ mode: "sms" }) }) as Response);
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();

    const { sendOtp } = await import("@/lib/api");
    await sendOtp("9876543210");

    const callArgs = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(callArgs[0]).toBe("https://backend.example.com/api/auth/send-otp");
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("adminLogin stores the returned token", async () => {
    mockFetchOnce({ token: "jwt-123", user: { role: "admin" } });
    const { adminLogin } = await import("@/lib/api");
    const res = await adminLogin("admin", "secret");
    expect(res.token).toBe("jwt-123");
    expect(localStorage.getItem("cleartitle_admin_token")).toBe("jwt-123");
  });

  it("uses the customer token for My Properties while an admin session is active", async () => {
    localStorage.setItem("cleartitle_admin_auth", "1");
    localStorage.setItem("cleartitle_admin_token", "jwt-admin");
    localStorage.setItem("cleartitle_customer_token", "jwt-customer");
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ properties: [] }) }) as Response);
    vi.stubGlobal("fetch", fetchMock);
    const { fetchMyProperties } = await import("@/lib/api");
    await fetchMyProperties();
    const callArgs = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((callArgs[1].headers as Record<string, string>)["Authorization"]).toBe("Bearer jwt-customer");
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

  it("normalizes MongoDB property _id values for frontend selectors and links", async () => {
    mockFetchOnce({
      properties: [
        { _id: "mongo-1", title: "First property" },
        { _id: "mongo-2", id: "existing-id", title: "Second property" },
      ],
      pagination: {},
    });
    const { fetchProperties } = await import("@/lib/api");
    const data = await fetchProperties();

    expect(data.properties[0]).toMatchObject({ _id: "mongo-1", id: "mongo-1" });
    expect(data.properties[1]).toMatchObject({ _id: "mongo-2", id: "existing-id" });
  });

  it("fetchHeroBanners returns the banners array", async () => {
    mockFetchOnce({ banners: [{ id: "1", title: "A" }] });
    const { fetchHeroBanners } = await import("@/lib/api");
    const data = await fetchHeroBanners();
    expect(data.banners).toHaveLength(1);
  });

  it("fetchAdminHeroBanners uses the admin hero endpoint", async () => {
    localStorage.setItem("cleartitle_admin_auth", "1");
    localStorage.setItem("cleartitle_admin_token", "jwt-admin");
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ banners: [{ id: "hidden", published: false }] }),
    }) as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { fetchAdminHeroBanners } = await import("@/lib/api");
    const data = await fetchAdminHeroBanners();
    const callArgs = fetchMock.mock.calls[0] as unknown as [string, RequestInit];

    expect(callArgs[0]).toContain("/api/hero/banners/admin");
    expect((callArgs[1].headers as Record<string, string>)["Authorization"]).toBe("Bearer jwt-admin");
    expect(data.banners[0].id).toBe("hidden");
  });

  it("updates hero ordering through the dedicated order endpoint", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ banner: { id: "slide-1", order: 3 } }),
    }) as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { updateHeroBannerOrder } = await import("@/lib/api");
    await updateHeroBannerOrder("slide-1", 3);
    const callArgs = fetchMock.mock.calls[0] as unknown as [string, RequestInit];

    expect(callArgs[0]).toContain("/api/hero/banners/slide-1/order");
    expect(callArgs[1].method).toBe("PATCH");
    expect(callArgs[1].body).toBe(JSON.stringify({ order: 3 }));
  });
});
