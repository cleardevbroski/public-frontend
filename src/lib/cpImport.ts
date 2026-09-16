import * as XLSX from "xlsx";

export type CPImportRow = Record<string, string>;
export type CPImportField = { key: string; label: string; required?: boolean; aliases: string[] };

export const cpImportFields: CPImportField[] = [
  { key: "partnerType", label: "Partner type", aliases: ["partner type", "cp type", "type"] },
  { key: "companyName", label: "Company / partner name", aliases: ["company name", "firm name", "partner name", "cp name", "company"] },
  { key: "businessType", label: "Business type", aliases: ["business type", "firm type"] },
  { key: "yearEstablished", label: "Year established", aliases: ["year established", "establishment year", "year of establishment"] },
  { key: "panNumber", label: "PAN number", aliases: ["pan", "pan number", "pan no"] },
  { key: "gstNumber", label: "GST number", aliases: ["gst", "gst number", "gst no"] },
  { key: "reraNumber", label: "RERA number", aliases: ["rera", "rera number", "rera no", "rera registration no"] },
  { key: "contactName", label: "Contact person", aliases: ["contact name", "contact person", "name", "cp contact"] },
  { key: "designation", label: "Designation", aliases: ["designation", "position", "role"] },
  { key: "mobile", label: "Mobile number", required: true, aliases: ["mobile", "mobile number", "phone", "phone number", "contact number", "primary mobile"] },
  { key: "alternateMobile", label: "Alternate mobile", aliases: ["alternate mobile", "alternate number", "secondary mobile", "other mobile"] },
  { key: "email", label: "Email", aliases: ["email", "email id", "email address"] },
  { key: "addressLine1", label: "Office address", aliases: ["office address", "address", "address line 1", "address1"] },
  { key: "addressLine2", label: "Address line 2", aliases: ["address line 2", "address2", "landmark"] },
  { key: "city", label: "City", aliases: ["city", "district"] },
  { key: "state", label: "State", aliases: ["state"] },
  { key: "pinCode", label: "PIN code", aliases: ["pin", "pin code", "pincode", "postal code"] },
  { key: "areasOfOperation", label: "Working areas", aliases: ["areas of operation", "working areas", "area", "areas", "locality", "location", "locations"] },
  { key: "currentProjects", label: "Current projects", aliases: ["current projects", "projects currently selling", "projects"] },
  { key: "developerAssociations", label: "Developer associations", aliases: ["developer associations", "developers", "builders"] },
  { key: "teamStrength", label: "Team strength", aliases: ["team strength", "team size"] },
  { key: "preferredSegments", label: "Property types", aliases: ["preferred segments", "property types", "property type", "segments", "deals in"] },
  { key: "accountHolderName", label: "Account holder", aliases: ["account holder", "account holder name"] },
  { key: "bankName", label: "Bank name", aliases: ["bank", "bank name"] },
  { key: "branch", label: "Bank branch", aliases: ["branch", "bank branch"] },
  { key: "accountNumber", label: "Account number", aliases: ["account number", "account no", "bank account"] },
  { key: "ifscCode", label: "IFSC code", aliases: ["ifsc", "ifsc code"] },
  { key: "signatoryName", label: "Signatory name", aliases: ["signatory name", "authorized signatory"] },
  { key: "signatoryDesignation", label: "Signatory designation", aliases: ["signatory designation"] },
  { key: "signedDate", label: "Signed date", aliases: ["signed date", "signature date"] },
];

const normalized = (value: unknown) => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

export async function readCPImportFile(file: File) {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json<Array<string | number | Date>>(sheet, { header: 1, defval: "", raw: false });
  const headers = (matrix[0] || []).map((value) => String(value).trim()).filter(Boolean);
  const rows = matrix.slice(1).filter((row) => row.some((value) => String(value).trim())).map((row) => Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? "").trim()])));
  const mapping = Object.fromEntries(cpImportFields.map((field) => {
    const aliases = new Set([field.key, field.label, ...field.aliases].map(normalized));
    return [field.key, headers.find((header) => aliases.has(normalized(header))) || ""];
  }));
  return { headers, rows, mapping };
}

export function mapCPImportRows(rows: CPImportRow[], mapping: Record<string, string>) {
  return rows.map((row) => Object.fromEntries(cpImportFields.map((field) => [field.key, mapping[field.key] ? row[mapping[field.key]] || "" : ""])));
}

export function downloadCPImportTemplate() {
  const headers = cpImportFields.map((field) => field.label);
  const example = ["Company", "Example Realty", "Partnership", "2020", "", "", "", "Ravi Kumar", "Partner", "9876543210", "", "ravi@example.com", "12 Main Road", "", "Bengaluru", "Karnataka", "560001", "Whitefield; Sarjapur", "Project One", "Builder One", "3-5", "Apartments; Villas", "", "", "", "", "", "", "", ""];
  const worksheet = XLSX.utils.aoa_to_sheet([headers, example]);
  worksheet["!cols"] = headers.map((header) => ({ wch: Math.max(header.length + 2, 16) }));
  const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "CP Contacts");
  XLSX.writeFile(workbook, "cp-contact-import-template.xlsx");
}
