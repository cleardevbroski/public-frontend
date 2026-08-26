import { describe, expect, it } from "vitest";
import { correctedFile, detectFileType } from "../fileTypeDetection";

describe("file signature detection", () => {
  it("detects WebP bytes inside a file named and declared as JPG", async () => {
    const bytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x08, 0x00, 0x00, 0x00,
      0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
    ]);
    const file = new File([bytes], "project-photo.jpg", { type: "image/jpeg" });
    const detected = await detectFileType(file);

    expect(detected).toMatchObject({ mime: "image/webp", label: "WebP", mismatch: true });
    expect(correctedFile(file, detected).type).toBe("image/webp");
  });

  it("detects PNG from its signature", async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "plan.jpg", { type: "image/jpeg" });
    expect(await detectFileType(file)).toMatchObject({ mime: "image/png", mismatch: true });
  });
});
