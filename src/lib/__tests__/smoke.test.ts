import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("has a jsdom window with localStorage", () => {
    expect(typeof window).toBe("object");
    localStorage.setItem("k", "v");
    expect(localStorage.getItem("k")).toBe("v");
  });
});
