import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => localStorage.clear());

describe("cms api clients", () => {
  it("fetchTestimonials returns the array the backend sends", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true, status: 200, json: async () => [{ _id: "1", name: "A", role: "Buyer", quote: "Great", rating: 5 }],
    }) as Response));
    const { fetchTestimonials } = await import("@/lib/api");
    const rows = await fetchTestimonials();
    expect(rows).toHaveLength(1);
    expect(rows[0]._id).toBe("1");
  });

  it("createLawyer POSTs with the auth header when a token is present", async () => {
    localStorage.setItem("cleartitle_token", "jwt-xyz");
    const fetchMock = vi.fn(async () => ({ ok: true, status: 201, json: async () => ({ _id: "9" }) }) as Response);
    vi.stubGlobal("fetch", fetchMock);
    const { createLawyer } = await import("@/lib/api");
    await createLawyer({ name: "Adv X", experience: "10y", barCouncil: "KA/1", cases: "100", specialty: "Title" });
    const callArgs = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(String(callArgs[0])).toContain("/api/cms/lawyers");
    expect(callArgs[1].method).toBe("POST");
    expect((callArgs[1].headers as Record<string, string>)["Authorization"]).toBe("Bearer jwt-xyz");
  });

  it("deleteInsight throws the server error on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 500, json: async () => ({ error: "Failed to delete insight" }) }) as Response));
    const { deleteInsight } = await import("@/lib/api");
    await expect(deleteInsight("bad")).rejects.toThrow("Failed to delete insight");
  });
});
