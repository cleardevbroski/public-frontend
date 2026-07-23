import { describe, expect, it } from "vitest";
import {
  promotionBadgeClass,
  promotionFrameClass,
  promotionRankLabel,
} from "@/lib/promotionPresentation";

describe("promotion presentation", () => {
  it("maps slots to public rank labels without exposing tier names", () => {
    expect(promotionRankLabel("diamond")).toBe("No. 1");
    expect(promotionRankLabel("gold")).toBe("No. 2");
    expect(promotionRankLabel("silver")).toBe("No. 3");
  });

  it("provides distinct frame and badge treatments", () => {
    expect(promotionFrameClass("diamond")).not.toBe(promotionFrameClass("gold"));
    expect(promotionFrameClass("gold")).not.toBe(promotionFrameClass("silver"));
    expect(promotionBadgeClass("diamond")).toContain("gradient");
  });
});
