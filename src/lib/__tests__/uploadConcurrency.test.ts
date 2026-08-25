import { describe, expect, it } from "vitest";
import { mapWithConcurrency } from "@/lib/uploadConcurrency";

describe("mapWithConcurrency", () => {
  it("preserves result order and limits active work", async () => {
    let active = 0;
    let maximumActive = 0;
    const result = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (value) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await Promise.resolve();
      active -= 1;
      return value * 2;
    });

    expect(result).toEqual([2, 4, 6, 8, 10]);
    expect(maximumActive).toBeLessThanOrEqual(2);
  });
});
