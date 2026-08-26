import { describe, expect, it } from "vitest";
import {
  PROPERTY_DOCUMENT_MAX_BYTES,
  PROPERTY_DOCUMENT_MAX_MB,
  PROPERTY_IMAGE_MAX_BYTES,
  PROPERTY_IMAGE_MAX_MB,
  PROPERTY_WALKTHROUGH_MAX_BYTES,
  PROPERTY_WALKTHROUGH_MAX_MB,
} from "@/lib/propertyMediaLimits";

describe("property media limits", () => {
  it("allows property images and documents up to 50 MB", () => {
    expect(PROPERTY_IMAGE_MAX_MB).toBe(50);
    expect(PROPERTY_IMAGE_MAX_BYTES).toBe(50 * 1024 * 1024);
    expect(PROPERTY_DOCUMENT_MAX_MB).toBe(50);
    expect(PROPERTY_DOCUMENT_MAX_BYTES).toBe(50 * 1024 * 1024);
  });

  it("keeps walkthrough video on its separate 15 MB policy", () => {
    expect(PROPERTY_WALKTHROUGH_MAX_MB).toBe(15);
    expect(PROPERTY_WALKTHROUGH_MAX_BYTES).toBe(15 * 1024 * 1024);
  });
});
