import { useState } from "react";
import { AlertTriangle, FileSpreadsheet, LoaderCircle, Upload, X } from "lucide-react";
import * as XLSX from "xlsx";

type ImportResult = { imported: number; rejected: number; errors?: { row: number; error: string }[] };
type Props = { open: boolean; onClose: () => void; onImport: (rows: Record<string, unknown>[]) => Promise<ImportResult> };

const aliases: Record<string, string> = {
  name: "name", customer: "name", customername: "name", fullname: "name",
  phone: "phone", mobile: "phone", mobilenumber: "phone", phonenumber: "phone",
  email: "email", emailaddress: "email",
  property: "propertyTitle", project: "propertyTitle", propertyname: "propertyTitle", projectname: "propertyTitle", interestedproperty: "propertyTitle",
  propertyid: "propertyId", projectid: "propertyId",
  location: "propertyLocation", propertylocation: "propertyLocation",
  budget: "budget", message: "message", notes: "message", enquiry: "message",
  category: "category", status: "status", source: "source", type: "type", audience: "audience",
};

function normalizedRows(workbook: XLSX.WorkBook) {
  const first = workbook.SheetNames[0];
  if (!first) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[first], { defval: "" });
  return rows.map((row) => Object.entries(row).reduce<Record<string, unknown>>((result, [header, value]) => {
    const key = aliases[header.toLowerCase().replace(/[^a-z0-9]/g, "")];
    if (key) result[key] = value;
    return result;
  }, {})).filter((row) => Object.values(row).some(Boolean));
}

export default function LeadImportDialog({ open, onClose, onImport }: Props) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    if (submitting) return;
    setFileName(""); setRows([]); setError(""); setResult(null); onClose();
  };

  const readFile = async (file?: File) => {
    setError(""); setResult(null); setRows([]);
    if (!file) return;
    setFileName(file.name);
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) return setError("Choose a CSV, XLSX or XLS file.");
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const parsed = normalizedRows(workbook);
      if (!parsed.length) return setError("No usable lead rows were found. Include a Name and Phone or Email column.");
      if (parsed.length > 2000) return setError("One import can contain at most 2,000 rows.");
      setRows(parsed);
    } catch {
      setError("This spreadsheet could not be read. Save it again as CSV or XLSX and retry.");
    }
  };

  const submit = async () => {
    setSubmitting(true); setError("");
    try { setResult(await onImport(rows)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Import failed"); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-[90] grid place-items-end bg-[#091024]/50 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Import leads">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-5 shadow-2xl sm:max-w-[560px] sm:rounded-[24px] sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9A7427]">Bulk entry</p><h2 className="mt-1 text-[20px] font-bold text-[#121B35]">Import leads</h2><p className="mt-1 text-[12px] leading-5 text-[#77727D]">Upload the customer list you already have. Existing phone numbers or emails are skipped.</p></div><button type="button" onClick={resetAndClose} className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#E5E2E7] text-[#68646F]" aria-label="Close"><X className="size-4" /></button></div>

        <label className="mt-5 grid min-h-[170px] cursor-pointer place-items-center rounded-[18px] border border-dashed border-[#CFC9D2] bg-[#FBFAFC] px-6 py-8 text-center transition hover:border-[#DDAA42] hover:bg-[#FFFCF5]">
          <input type="file" accept=".csv,.xlsx,.xls" className="sr-only" onChange={(event) => void readFile(event.target.files?.[0])} />
          <span><span className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#FFF4D9] text-[#8A620F]"><FileSpreadsheet className="size-5" /></span><span className="mt-3 block text-[13px] font-bold text-[#29253B]">{fileName || "Choose CSV or spreadsheet"}</span><span className="mt-1 block text-[11px] text-[#85808A]">Recognised columns: name, phone, email, property, location, budget and notes</span></span>
        </label>

        {rows.length > 0 && !result && <div className="mt-4 rounded-xl border border-[#CDE7D7] bg-[#F1FBF5] p-3 text-[12px] font-semibold text-[#14633F]">{rows.length.toLocaleString("en-IN")} rows are ready to import.</div>}
        {error && <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#F0C9C5] bg-[#FFF3F1] p-3 text-[12px] leading-5 text-[#A83832]"><AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}</div>}
        {result && <div className="mt-4 rounded-xl border border-[#D8D5DB] bg-[#F7F6F8] p-4"><p className="text-[13px] font-bold text-[#121B35]">Import complete</p><p className="mt-1 text-[12px] text-[#5E5964]">Added {result.imported} leads. Skipped {result.rejected} duplicate or invalid rows.</p>{result.errors?.length ? <details className="mt-3"><summary className="cursor-pointer text-[11px] font-bold text-[#8A620F]">Review skipped rows</summary><div className="mt-2 max-h-32 space-y-1 overflow-y-auto">{result.errors.slice(0, 20).map((item) => <p key={`${item.row}-${item.error}`} className="text-[10.5px] text-[#77727D]">Row {item.row}: {item.error}</p>)}</div></details> : null}</div>}

        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={resetAndClose} className="h-10 rounded-xl border border-[#E1DEE5] px-4 text-[12px] font-bold text-[#5E5964]">{result ? "Done" : "Cancel"}</button>{!result && <button type="button" disabled={!rows.length || submitting} onClick={() => void submit()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#DDAA42] px-4 text-[12px] font-bold text-[#121B35] disabled:opacity-45">{submitting ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />} Import {rows.length || ""} leads</button>}</div>
      </div>
    </div>
  );
}

