import { describe, expect, it } from "vitest";
import { mapCPImportRows, parseCPImportMatrix } from "../cpImport";

describe("CP contact imports", () => {
  it("keeps the first contact in a headerless name and mobile spreadsheet", () => {
    const parsed = parseCPImportMatrix([
      ["First Broker", "9876543210"],
      ["Second Broker", "9876543211"],
    ]);

    expect(parsed.rows).toHaveLength(2);
    expect(parsed.mapping).toMatchObject({ contactName: "Contact person", mobile: "Mobile number" });
    expect(mapCPImportRows(parsed.rows, parsed.mapping)).toEqual([
      expect.objectContaining({ contactName: "First Broker", mobile: "9876543210" }),
      expect.objectContaining({ contactName: "Second Broker", mobile: "9876543211" }),
    ]);
  });

  it("uses a normal header row when one is present", () => {
    const parsed = parseCPImportMatrix([
      ["Name", "Phone Number"],
      ["First Broker", "9876543210"],
    ]);

    expect(parsed.rows).toHaveLength(1);
    expect(parsed.mapping).toMatchObject({ contactName: "Name", mobile: "Phone Number" });
  });
});
