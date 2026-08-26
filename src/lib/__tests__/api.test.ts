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
    const fetchMock = vi.fn(async () => ({ ok: true, status: 201, json: async () => ({ token: "guest-token", user: { role: "guest" } }) }) as Response);
    vi.stubGlobal("fetch", fetchMock);
    vi.resetModules();

    const { createManualSession } = await import("@/lib/api");
    await createManualSession({ name: "Asha Rao", email: "asha@example.com", phone: "9876543210" });

    const callArgs = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(callArgs[0]).toBe("https://backend.example.com/api/auth/manual-session");
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("turns an empty manual-session response into a configuration error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 502, json: async () => { throw new SyntaxError("Unexpected end of JSON input"); } }) as unknown as Response));
    const { createManualSession } = await import("@/lib/api");
    await expect(createManualSession({ name: "Asha Rao", email: "asha@example.com", phone: "9876543210" })).rejects.toThrow(/API returned an invalid response/i);
  });

  it("adminLogin stores the returned token", async () => {
    mockFetchOnce({ token: "jwt-123", user: { role: "admin" } });
    const { adminLogin } = await import("@/lib/api");
    const res = await adminLogin("admin", "secret");
    expect(res.token).toBe("jwt-123");
    expect(localStorage.getItem("cleartitle_admin_token")).toBe("jwt-123");
  });

  it("starts Truecaller verification with a server-generated request", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 201,
      json: async () => ({ requestId: "secure-request-id", deepLink: "truecallersdk://verify" }),
    }) as Response);
    vi.stubGlobal("fetch", fetchMock);
    const { startTruecallerVerification } = await import("@/lib/api");
    const result = await startTruecallerVerification("login");
    const callArgs = fetchMock.mock.calls[0] as unknown as [string, RequestInit];

    expect(result.requestId).toBe("secure-request-id");
    expect(callArgs[0]).toBe("http://localhost:5000/api/auth/truecaller/start");
    expect(callArgs[1]).toMatchObject({ method: "POST", body: JSON.stringify({ purpose: "login" }) });
  });

  it("stores a customer token only after Truecaller status is verified", async () => {
    mockFetchOnce({ status: "verified", token: "truecaller-jwt", user: { phone: "9876543210" } });
    const { getTruecallerVerificationStatus } = await import("@/lib/api");
    await getTruecallerVerificationStatus("secure-request-id");
    expect(localStorage.getItem("cleartitle_token")).toBe("truecaller-jwt");
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

  it("preserves a specific backend message for a missing resource", async () => {
    mockFetchOnce({ error: "Property not found" }, false, 404);
    const { fetchAdminProperty } = await import("@/lib/api");
    await expect(fetchAdminProperty("missing-property")).rejects.toThrow("Property not found");
  });

  it("identifies a missing API route when the backend returns its generic 404", async () => {
    mockFetchOnce({ error: "Route not found" }, false, 404);
    const { fetchPropertyIngestionReview } = await import("@/lib/api");
    await expect(fetchPropertyIngestionReview("property-1")).rejects.toThrow(/API route not found/i);
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

  it("normalizes property media URLs so uploaded images resolve in the browser", async () => {
    mockFetchOnce({
      properties: [{
        _id: "mongo-1",
        image: "/uploads/cover.jpg",
        heroImages: ["//cdn.example.com/hero.jpg"],
        images: [" https://cdn.example.com/gallery.jpg "],
      }],
      pagination: {},
    });
    const { fetchProperties } = await import("@/lib/api");
    const data = await fetchProperties();

    expect(data.properties[0]).toMatchObject({
      image: "http://localhost:5000/uploads/cover.jpg",
      heroImages: ["https://cdn.example.com/hero.jpg"],
      images: ["https://cdn.example.com/gallery.jpg"],
    });
  });

  it("normalizes sparse legacy properties so admin filtering cannot crash", async () => {
    mockFetchOnce({ properties: [{ _id: "legacy-empty", title: null, subtitle: null, configs: null }], pagination: {} });
    const { fetchAdminProperties } = await import("@/lib/api");
    const data = await fetchAdminProperties();

    expect(data.properties[0]).toMatchObject({
      id: "legacy-empty",
      title: "Untitled property",
      subtitle: "",
      builder: "",
      price: "",
      configs: [],
    });
  });

  it("loads every paginated admin property page for complete dashboard searches", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      const page = Number(url.searchParams.get("page") || 1);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          properties: [{ _id: `property-${page}`, title: `Property ${page}` }],
          pagination: { page, limit: 100, total: 3, pages: 3 },
        }),
      } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);
    const { fetchAllAdminProperties } = await import("@/lib/api");

    const properties = await fetchAllAdminProperties({ sort: "-createdAt" });

    expect(properties.map((property: { id: string }) => property.id)).toEqual(["property-1", "property-2", "property-3"]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.map(([input]) => new URL(String(input)).searchParams.get("limit"))).toEqual(["100", "100", "100"]);
  });

  it("loads and updates customer saved properties with the customer token", async () => {
    localStorage.setItem("cleartitle_customer_token", "jwt-customer");
    const fetchMock = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () => String(input).endsWith("/api/favorites") && (!options?.method || options.method === "GET")
        ? { properties: [{ _id: "property-1", title: "Saved Home", configs: null }] }
        : { message: "Updated" },
    }) as Response);
    vi.stubGlobal("fetch", fetchMock);
    const { fetchFavoriteProperties, saveFavoriteProperty, removeFavoriteProperty } = await import("@/lib/api");

    const list = await fetchFavoriteProperties();
    await saveFavoriteProperty("property-1");
    await removeFavoriteProperty("property-1");

    expect(list.properties[0]).toMatchObject({ id: "property-1", title: "Saved Home", configs: [] });
    const calls = fetchMock.mock.calls as unknown as Array<[string, RequestInit]>;
    expect(calls.map(([url, options]) => [url, options.method || "GET"])).toEqual([
      ["http://localhost:5000/api/favorites", "GET"],
      ["http://localhost:5000/api/favorites/property-1", "POST"],
      ["http://localhost:5000/api/favorites/property-1", "DELETE"],
    ]);
    expect(calls.every(([, options]) => (options.headers as Record<string, string>).Authorization === "Bearer jwt-customer")).toBe(true);
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
