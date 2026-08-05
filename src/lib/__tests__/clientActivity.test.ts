import { beforeEach, describe, expect, it, vi } from "vitest";

const submitClientActivityVisit = vi.fn(async (_data: Record<string, unknown>) => ({ message: "Visit recorded" }));
const submitClientActivityEngagement = vi.fn(async (_data: Record<string, unknown>) => ({ message: "Engagement recorded" }));

vi.mock("@/lib/api", () => ({ submitClientActivityVisit, submitClientActivityEngagement }));

describe("compact client activity tracking", () => {
  beforeEach(async () => {
    localStorage.clear();
    submitClientActivityVisit.mockClear();
    submitClientActivityEngagement.mockClear();
    const { resetClientActivityForTests } = await import("@/lib/clientActivity");
    resetClientActivityForTests();
  });

  it("reuses a visit inside 30 minutes and creates a new visit after inactivity", async () => {
    const { getVisitState } = await import("@/lib/clientActivity");
    const first = getVisitState(1_000_000);
    const continued = getVisitState(1_000_000 + 29 * 60 * 1000);
    const returning = getVisitState(1_000_000 + 60 * 60 * 1000);

    expect(continued.id).toBe(first.id);
    expect(returning.id).not.toBe(first.id);
  });

  it("records one visit per session but can force a post-login identity link", async () => {
    const { recordClientVisit } = await import("@/lib/clientActivity");
    recordClientVisit("/property/p1");
    recordClientVisit("/property/p2");
    recordClientVisit("/property/p2", true);
    await Promise.resolve();

    expect(submitClientActivityVisit).toHaveBeenCalledTimes(2);
    expect(submitClientActivityVisit).toHaveBeenLastCalledWith(expect.objectContaining({ path: "/property/p2" }));
  });

  it("sends property attention and action summaries with stable identities", async () => {
    const { submitPropertyActivity } = await import("@/lib/clientActivity");
    const property = { propertyId: "p1", propertyTitle: "Home One", propertyType: "Apartment", location: "Whitefield", priceLabel: "₹1.2 Cr" };
    submitPropertyActivity(property, 95);
    submitPropertyActivity(property, 0, "brochure");
    await Promise.resolve();

    expect(submitClientActivityEngagement).toHaveBeenCalledTimes(2);
    const first = submitClientActivityEngagement.mock.calls[0][0];
    const second = submitClientActivityEngagement.mock.calls[1][0];
    expect(first).toMatchObject({ ...property, activeSeconds: 95, action: "" });
    expect(second).toMatchObject({ ...property, activeSeconds: 0, action: "brochure", visitorId: first.visitorId, visitId: first.visitId });
  });

  it("does not track admin routes", async () => {
    const { recordClientVisit } = await import("@/lib/clientActivity");
    recordClientVisit("/admin/client-activity");
    expect(submitClientActivityVisit).not.toHaveBeenCalled();
  });
});
