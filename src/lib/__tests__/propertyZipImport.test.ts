import JSZip from "jszip";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { uploadPropertyMedia } = vi.hoisted(() => ({
  uploadPropertyMedia: vi.fn(async (_file?: File, kind?: string) => `https://res.cloudinary.com/demo/${kind || "unknown"}/asset`),
}));
vi.mock("@/lib/api", () => ({ uploadPropertyMedia }));

import { importPropertyZip, officialDetailsFromCertificate } from "@/lib/propertyZipImport";

const propertyText = `[PROPERTY BASICS]
Property Type: Apartment
Project / Property Name: ZIP Heights
Builder / Developer: ZIP Group
Transaction Type: New Property
Listing Type: For Sale
Description: ZIP Heights is a verified apartment project description with enough information for a property draft.
Possession Status: Under Construction
Expected Completion Month: 2027-03

[RERA]
RERA Registered: Yes

[RERA PHASE]
Phase Name: Phase 1
RERA Number: PRM/KA/RERA/1251/310/PR/220922/005266
RERA Website: https://rera.karnataka.gov.in

[LOCATION]
Locality: Kengeri
City: Bangalore

[CONFIGURATION]
Configuration Name: 2 BHK Apartment 964 Sq. Ft.
Price: ₹74.71 Lac
Built-up Area: 964 Sq. Ft.
Carpet Area: 800 Sq. Ft.
Bedrooms: 2
Bathrooms: 2
Balconies: 1`;

describe("property ZIP import", () => {
  beforeEach(() => uploadPropertyMedia.mockClear());

  it("extracts official dates and addresses from a text-based RERA certificate", () => {
    const details = officialDetailsFromCertificate(`PRM/KA/RERA/1251/310/PR/220922/005266
MAHAVEER HIGHLANDS, KATHA NO. 28/25/1P, SY NO. 25/1 SITUATED IN KOMMAGHATTA VILLAGE
KENGERI HOBLI, BENGALURU SOUTH, BENGALURU URBAN
REDDY STRUCTURES PRIVATE LIMITED
#133/1, 2ND FLOOR, THE RESIDENCY
RESIDENCY ROAD, BENGALURU URBAN, KARNATAKA - 560060
22-09-2022
31-03-2027`, "MAHAVEER HIGHLANDS", "REDDY STRUCTURES PRIVATE LIMITED");

    expect(details).toEqual({
      approvalDate: "2022-09-22",
      registeredCompletionDate: "2027-03-31",
      registeredAddress: "KATHA NO. 28/25/1P, SY NO. 25/1 SITUATED IN KOMMAGHATTA VILLAGE KENGERI HOBLI, BENGALURU SOUTH, BENGALURU URBAN",
      promoterAddress: "#133/1, 2ND FLOOR, THE RESIDENCY RESIDENCY ROAD, BENGALURU URBAN, KARNATAKA - 560060",
    });
  });

  it("maps structured text, official RERA metadata, media, floor plans and protected documents", async () => {
    const zip = new JSZip();
    zip.file("property_upload.txt", propertyText);
    zip.file("project_data.json", JSON.stringify({ media: [
      { kind: "gallery", label: "Tower View", status: "downloaded", saved_as: "media/gallery/tower.jpg" },
      { kind: "floor_plan", label: "Floor plan of 2 BHK 964 Sq. Ft.", status: "downloaded", saved_as: "media/floor_plan/2bhk-964.jpg" },
      { kind: "master_plan", label: "Master Plan", status: "downloaded", saved_as: "media/master_plan/master.jpg" },
      { kind: "walkthrough", label: "Project Walkthrough", status: "downloaded", saved_as: "media/walkthrough/walkthrough.mp4" },
    ] }));
    zip.file("asset_manifest.json", JSON.stringify([]));
    zip.file("source_audit.json", JSON.stringify({ notice: "Review imported facts and asset reuse rights before publication." }));
    zip.file("media/gallery/tower.jpg", new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
    zip.file("media/floor_plan/2bhk-964.jpg", new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
    zip.file("media/master_plan/master.jpg", new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
    zip.file("media/walkthrough/walkthrough.mp4", new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112]));
    const reraRoot = "rera_documents/project";
    zip.file(`${reraRoot}/project_details.json`, JSON.stringify({
      project_id: "9960",
      rera_number: "PRM/KA/RERA/1251/310/PR/220922/005266",
      project_name: "ZIP HEIGHTS",
      promoter_name: "REDDY STRUCTURES PRIVATE LIMITED",
      acknowledgement_number: "ACK/KA/RERA/1251/310/PR/190822/006261",
      status: "APPROVED",
      district: "BENGALURU URBAN",
    }));
    zip.file(`${reraRoot}/manifest.json`, JSON.stringify({ documents: [
      { category: "RERA Details", label: "RERA Registration Certificate", status: "downloaded", saved_as: "registration.pdf" },
      { category: "Project Documents", label: "Electricity Permission Letter", status: "downloaded", saved_as: "electricity.pdf" },
    ] }));
    zip.file(`${reraRoot}/registration.pdf`, "%PDF-1.4 test");
    zip.file(`${reraRoot}/electricity.pdf`, "%PDF-1.4 test");

    const bytes = await zip.generateAsync({ type: "blob" });
    const result = await importPropertyZip(new File([bytes], "project.zip", { type: "application/zip" }), "Apartment");

    expect(result.patch.title).toBe("ZIP Heights");
    expect(result.patch.reraPhases?.[0]).toMatchObject({
      reraNumber: "PRM/KA/RERA/1251/310/PR/220922/005266",
      officialDetails: {
        promoterName: "REDDY STRUCTURES PRIVATE LIMITED",
        projectId: "9960",
        acknowledgementNumber: "ACK/KA/RERA/1251/310/PR/190822/006261",
        registrationStatus: "APPROVED",
        district: "BENGALURU URBAN",
      },
    });
    expect(result.patch.configurationDetails?.[0].floorPlan2dUrl).toContain("res.cloudinary.com");
    expect(result.patch.masterPlan?.imageUrl).toContain("res.cloudinary.com");
    expect(result.patch.heroImages?.[0]).toContain("res.cloudinary.com");
    expect(result.patch.projectDownloads?.[0]).toMatchObject({ kind: "walkthrough", mimeType: "video/mp4" });
    expect(result.patch.reraPhases?.[0].reraDocuments).toMatchObject([{ key: "registration-certificate" }]);
    expect(result.patch.reraPhases?.[0].projectDocuments).toMatchObject([{ key: "electricity-permission-letter" }]);
    expect(result.warnings).toContain("Review imported facts and asset reuse rights before publication.");
    expect(uploadPropertyMedia).toHaveBeenCalledTimes(6);
  });

  it("rejects packages without property_upload.txt", async () => {
    const missing = new JSZip();
    missing.file("project_data.json", "{}");
    const bytes = await missing.generateAsync({ type: "blob" });
    await expect(importPropertyZip(new File([bytes], "missing.zip", { type: "application/zip" }), "Apartment")).rejects.toThrow("property_upload.txt");
  });

  it("uses the original minimal media set for Recheck imports and skips legal-page duplicates", async () => {
    const zip = new JSZip();
    zip.file("property_upload.txt", propertyText);
    zip.file("project_data.json", "{}");
    zip.file("asset_manifest.json", JSON.stringify([
      { kind: "gallery", label: "Cover", status: "approved", saved_as: "gallery/cover.jpg" },
      { kind: "gallery", label: "Extra gallery", status: "approved", saved_as: "gallery/extra.jpg" },
      { kind: "master_plan", label: "Master", status: "approved", saved_as: "plans/master.jpg" },
      { kind: "developer_logo", label: "Logo", status: "approved", saved_as: "logos/developer.png" },
      { kind: "floor_plan", label: "Floor plan of 2 BHK 964 Sq. Ft.", status: "approved", saved_as: "plans/2bhk.jpg" },
      { kind: "floor_plan", label: "RERA sectional page", status: "approved", saved_as: "plans/legal-page.jpg" },
      { kind: "project_images", label: "RERA PDF page", status: "approved", saved_as: "rera/page.jpg" },
    ]));
    for (const path of ["gallery/cover.jpg", "gallery/extra.jpg", "plans/master.jpg", "plans/2bhk.jpg", "plans/legal-page.jpg", "rera/page.jpg"]) {
      zip.file(path, new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
    }
    zip.file("logos/developer.png", new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

    const bytes = await zip.generateAsync({ type: "blob" });
    const result = await importPropertyZip(new File([bytes], "recheck.zip", { type: "application/zip" }), "Apartment", undefined, { mode: "recheck" });

    expect(uploadPropertyMedia).toHaveBeenCalledTimes(4);
    expect(result.patch.heroImages).toHaveLength(1);
    expect(result.patch.developerLogoUrl).toContain("res.cloudinary.com");
    expect(result.patch.configurationDetails?.[0].floorPlan2dUrl).toContain("res.cloudinary.com");
    expect(result.patch.reraPhases?.[0].reraDocuments || []).toHaveLength(0);
    expect(result.warnings.some((warning) => warning.includes("duplicate extracted legal-page images"))).toBe(true);
  });

  it("keeps documents from separate RERA folders attached to their matching phases", async () => {
    const zip = new JSZip();
    zip.file("property_upload.txt", `${propertyText.replace("Phase 1", "North Phase")}

[RERA PHASE]
Phase Name: South Phase
RERA Number: PRM/KA/RERA/SOUTH002
RERA Website: https://rera.karnataka.gov.in`);
    zip.file("project_data.json", JSON.stringify({ media: [], rera_numbers: ["PRM/KA/RERA/1251/310/PR/220922/005266", "PRM/KA/RERA/SOUTH002"] }));
    for (const [folder, number, projectId, label, savedAs] of [
      ["north", "PRM/KA/RERA/1251/310/PR/220922/005266", "100", "Electricity Permission Letter", "electricity.pdf"],
      ["south", "PRM/KA/RERA/SOUTH002", "200", "Water Permission Letter", "water.pdf"],
    ]) {
      const root = `rera_documents/${folder}`;
      zip.file(`${root}/project_details.json`, JSON.stringify({ project_id: projectId, rera_number: number, promoter_name: "Registered Promoter" }));
      zip.file(`${root}/manifest.json`, JSON.stringify({ documents: [{ label, status: "downloaded", saved_as: savedAs }] }));
      zip.file(`${root}/${savedAs}`, "%PDF-1.4 test");
    }

    const bytes = await zip.generateAsync({ type: "blob" });
    const result = await importPropertyZip(new File([bytes], "phases.zip", { type: "application/zip" }), "Apartment");

    expect(result.patch.reraPhases).toHaveLength(2);
    expect(result.patch.reraPhases?.[0]).toMatchObject({ name: "North Phase", officialDetails: { projectId: "100" }, projectDocuments: [{ key: "electricity-permission-letter" }] });
    expect(result.patch.reraPhases?.[1]).toMatchObject({ name: "South Phase", officialDetails: { projectId: "200" }, projectDocuments: [{ key: "water-permission-letter" }] });
  });
});
