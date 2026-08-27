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

  it.each([
    ["Electricity_Permission_Letter.pdf", "electricity-permission-letter"],
    ["Water_Permission_Letter.pdf", "water-permission-letter"],
    ["Approved_Layout_Plan.pdf", "approved-layout-plan"],
    ["Existing_Layout_Plan.pdf", "existing-layout-plan"],
    ["Existing_Section_Plan_and_Specification.pdf", "existing-section-plan"],
    ["Approved_Section_Of_Building_Infrastructure_Plan_of_Plotting.pdf", "approved-section-plan"],
    ["Area_Development_Plan_Of_Project_Area.pdf", "area-development-plan"],
    ["Advocate_Search_Report.pdf", "advocate-search-report"],
    ["Urban_Land_Ceiling.pdf", "urban-land-ceiling"],
    ["Collaboration_Agreement_Development_Agreement_Joint_Development_Agreement_Other_Agreement.pdf", "development-agreement"],
    ["Change_of_Land_Use.pdf", "change-of-land-use"],
    ["District_Magistrate.pdf", "district-magistrate"],
    ["Conversion_Certificate_under_section_95_of_the_KLR_Act_1964.pdf", "conversion-certificate"],
    ["Any_other_document_Rights_Title_Interest_Name.pdf", "title-rights-document"],
  ])("maps imported package document %s", (fileName, key) => {
    expect(classifyReraFileName(fileName).definition?.key).toBe(key);
  });
});
