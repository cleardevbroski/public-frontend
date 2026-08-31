import { describe, expect, it } from "vitest";
import { reloadLatestVersion } from "@/components/SectionErrorBoundary";

describe("SectionErrorBoundary", () => {
  it("reloads the latest application version for every section error", () => {
    let calls = 0;
    reloadLatestVersion(() => { calls += 1; });
    expect(calls).toBe(1);
  });
});
