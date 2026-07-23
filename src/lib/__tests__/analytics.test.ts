import { beforeEach, describe, expect, it, vi } from "vitest";

const submitAnalyticsEvent = vi.fn(async () => ({ message: "Event tracked" }));
vi.mock("@/lib/api", () => ({ submitAnalyticsEvent }));

describe("privacy-safe analytics tracking", () => {
  beforeEach(() => {
    localStorage.clear();
    submitAnalyticsEvent.mockClear();
    window.history.pushState({}, "", "/property/p1");
  });

  it("reuses an anonymous session and suppresses immediate duplicate effects", async () => {
    const { getAnalyticsSessionId, trackAnalytics } = await import("@/lib/analytics");
    expect(getAnalyticsSessionId()).toBe(getAnalyticsSessionId());
    trackAnalytics("property_view", { propertyId: "p1", propertyTitle: "Home One" }, "p1-test");
    trackAnalytics("property_view", { propertyId: "p1", propertyTitle: "Home One" }, "p1-test");
    await Promise.resolve();
    expect(submitAnalyticsEvent).toHaveBeenCalledTimes(1);
    expect(submitAnalyticsEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "property_view",
      path: "/property/p1",
      meta: { propertyId: "p1", propertyTitle: "Home One" },
    }));
  });

  it("does not track admin navigation", async () => {
    const { trackAnalytics } = await import("@/lib/analytics");
    window.history.pushState({}, "", "/admin/analytics");
    trackAnalytics("page_view", { source: "route" }, "admin-test");
    expect(submitAnalyticsEvent).not.toHaveBeenCalled();
  });
});
