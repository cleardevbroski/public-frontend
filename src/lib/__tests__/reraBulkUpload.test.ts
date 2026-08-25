import { describe, expect, it } from "vitest";
import { classifyReraFileName, normalizeUploadFileName } from "@/lib/reraBulkUpload";

describe("RERA bulk filename classification", () => {
  it("normalizes downloaded filenames", () => {
    expect(normalizeUploadFileName("  Approved_Building-Plan (Final).PDF"))
      .toBe("approved building plan final");
  });

  it.each([
    ["Registration_Certificate.pdf", "registration-certificate"],
    ["Annexure-15_MOA.pdf", "memorandum-of-association"],
    ["AOA Annexure 16.pdf", "articles-of-association"],
    ["Commencement_Certificate_Annexure_80.pdf", "commencement-certificate"],
    ["Approved-Building-Plan-81.pdf", "approved-building-plan"],
    ["Agreement For Sale.pdf", "agreement-for-sale"],
    ["Proforma_of_Allotment_Letter.pdf", "allotment-letter"],
  ])("matches %s", (fileName, key) => {
    const match = classifyReraFileName(fileName);
    expect(match.definition?.key).toBe(key);
    expect(match.confidence).toBe("high");
  });

  it("does not guess a generic certificate filename", () => {
    expect(classifyReraFileName("certificate.pdf").confidence).toBe("none");
  });
});
