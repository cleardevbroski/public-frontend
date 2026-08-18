import { describe, expect, it } from "vitest";
import { countdownLabel } from "@/pages/ChannelPartnerDashboard";

describe("Channel Partner dashboard countdown", () => {
  it("shows the exact remaining credit time", () => {
    const now = new Date("2026-08-18T06:00:00.000Z").getTime();
    expect(countdownLabel("2026-08-18T18:00:00.000Z", now)).toBe("12:00:00 until credit");
  });

  it("changes to the credited message when the timer completes", () => {
    const now = new Date("2026-08-18T18:00:00.000Z").getTime();
    expect(countdownLabel("2026-08-18T18:00:00.000Z", now)).toBe("Amount credited to your account");
  });
});
