import { useMemo, useRef, useState } from "react";
import { Archive, CheckCircle2, FolderOpen, Loader2, PauseCircle, Play, RotateCcw, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import { createRecheckImport, preflightRecheckPackages, type RecheckPackage } from "@/lib/api";
import { importPropertyZip } from "@/lib/propertyZipImport";

type SelectedPackage = RecheckPackage & {
  file: File;
  exists?: boolean;
  propertyId?: string;
  status?: "ready" | "importing" | "complete" | "skipped" | "failed";
  message?: string;
};

const MAX_PACKAGES = 500;
const MAX_ZIP_BYTES = 350 * 1024 * 1024;

function packageFromFile(file: File): SelectedPackage {
  const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || "";
  const batchName = relativePath.split("/").filter(Boolean)[0] || "Admin bulk import";
  return {
    file,
    packageName: file.name,
    packageSize: file.size,
    packageKey: `${file.name.toLowerCase()}::${file.size}`,
    batchName,
    status: "ready",
  };
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export default function BulkRecheckImport({ onImported }: { onImported: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const stopRef = useRef(false);
  const [packages, setPackages] = useState<SelectedPackage[]>([]);
  const [checking, setChecking] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  const counts = useMemo(() => ({
    ready: packages.filter((item) => item.status === "ready" || item.status === "failed").length,
    complete: packages.filter((item) => item.status === "complete").length,
    skipped: packages.filter((item) => item.status === "skipped").length,
    failed: packages.filter((item) => item.status === "failed").length,
    bytes: packages.reduce((sum, item) => sum + item.packageSize, 0),
  }), [packages]);

  const selectPackages = async (list: FileList | null) => {
    if (!list?.length) return;
    setError("");
    setProgress("");
    const candidates = [...list].filter((file) => file.name.toLowerCase().endsWith(".zip"));
    const unique = [...new Map(candidates.map((file) => {
      const item = packageFromFile(file);
      return [item.packageKey, item];
    })).values()];
    if (!unique.length) return setError("The selected folder does not contain ZIP property packages.");
    if (unique.length > MAX_PACKAGES) return setError(`Select no more than ${MAX_PACKAGES} ZIP packages at one time.`);
    const oversized = unique.find((item) => item.packageSize > MAX_ZIP_BYTES);
    if (oversized) return setError(`${oversized.packageName} exceeds the 350 MB ZIP limit.`);

    setChecking(true);
    try {
      const result = await preflightRecheckPackages(unique.map(({ packageName, packageSize, packageKey, batchName }) => ({ packageName, packageSize, packageKey, batchName })));
      const checked = unique.map((item) => {
        const match = result.packages?.find((row: Record<string, unknown>) => row.packageKey === item.packageKey);
        return { ...item, exists: Boolean(match?.exists), propertyId: String(match?.propertyId || ""), status: match?.exists ? "skipped" as const : "ready" as const, message: match?.exists ? "Already imported" : "Ready" };
      });
      setPackages(checked);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to check the selected packages.");
    } finally {
      setChecking(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const start = async () => {
    if (running || !counts.ready) return;
    stopRef.current = false;
    setRunning(true);
    setError("");
    let changed = false;
    const work = packages.filter((item) => item.status === "ready" || item.status === "failed");
    for (const [index, item] of work.entries()) {
      if (stopRef.current) break;
      setPackages((current) => current.map((row) => row.packageKey === item.packageKey ? { ...row, status: "importing", message: "Reading package" } : row));
      try {
        const suggestion = await importPropertyZip(item.file, undefined, (detail) => {
          const label = `${index + 1}/${work.length} · ${item.packageName} · ${detail.completed}/${detail.total} ${detail.label}`;
          setProgress(label);
          setPackages((current) => current.map((row) => row.packageKey === item.packageKey ? { ...row, message: detail.label } : row));
        }, { mode: "recheck" });
        const result = await createRecheckImport({ packageName: item.packageName, packageSize: item.packageSize, packageKey: item.packageKey, batchName: item.batchName }, suggestion.patch as Record<string, unknown>);
        const skipped = Boolean(result.skipped);
        setPackages((current) => current.map((row) => row.packageKey === item.packageKey ? { ...row, status: skipped ? "skipped" : "complete", propertyId: result.property?.id || "", message: skipped ? "Already imported" : "Stored in Recheck" } : row));
        changed = changed || !skipped;
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Import failed";
        setPackages((current) => current.map((row) => row.packageKey === item.packageKey ? { ...row, status: "failed", message } : row));
      }
    }
    setRunning(false);
    setProgress(stopRef.current ? "Import paused. Start again to continue failed and unprocessed packages." : "Batch finished.");
    if (changed) onImported();
  };

  const reset = () => {
    if (running) return;
    setPackages([]);
    setError("");
    setProgress("");
  };

  return (
    <section className="mb-8 rounded-2xl border border-[#E4E0E7] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-[18px] font-bold text-[#121B35]"><Archive className="size-5 text-[#B98428]" />Bulk ZIP import to Recheck</h2>
          <p className="mt-1 max-w-3xl text-[12px] leading-5 text-[#68646F]">Select the folder containing the project ZIPs. Existing Pending properties are not changed. Imports stay private in Recheck until you review them.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">No image compression</span>
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">Retry-safe package check</span>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">Private until approved</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <button type="button" disabled={checking || running} onClick={() => inputRef.current?.click()} className="flex min-h-28 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D8C79F] bg-[#FFFBF1] px-4 text-center transition hover:border-[#DDAA42] disabled:opacity-50">
          {checking ? <Loader2 className="size-7 animate-spin text-[#B98428]" /> : <FolderOpen className="size-7 text-[#B98428]" />}
          <span className="mt-2 text-[13px] font-bold text-[#121B35]">{checking ? "Checking existing imports…" : "Choose ZIP files or the complete folder"}</span>
          <span className="mt-1 text-[10px] text-[#68646F]">Up to 500 packages; each ZIP can be up to 350 MB.</span>
        </button>
        <div className="min-w-64 rounded-xl border border-[#ECE9EF] bg-[#F8F7FA] p-4 text-[11px] text-[#68646F]">
          <p className="flex items-center gap-1.5 font-bold text-[#121B35]"><ShieldCheck className="size-4 text-emerald-700" />Free-tier media selection</p>
          <p className="mt-2 leading-5">Uploads one original cover, one master plan, one developer logo and matched BHK floor plans. RERA PDFs and duplicate extracted legal pages stay in the local ZIP.</p>
        </div>
      </div>
      <input ref={(node) => { inputRef.current = node; if (node) node.setAttribute("webkitdirectory", ""); }} type="file" accept=".zip,application/zip" multiple className="hidden" onChange={(event) => void selectPackages(event.target.files)} />

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>}
      {packages.length > 0 && <>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-lg bg-[#F3F1F5] px-3 py-2 font-bold text-[#121B35]">{packages.length} ZIPs · {formatBytes(counts.bytes)}</span>
          <span className="rounded-lg bg-emerald-50 px-3 py-2 font-bold text-emerald-700">{counts.complete} imported</span>
          <span className="rounded-lg bg-slate-100 px-3 py-2 font-bold text-slate-600">{counts.skipped} already present</span>
          {counts.failed > 0 && <span className="rounded-lg bg-red-50 px-3 py-2 font-bold text-red-700">{counts.failed} failed</span>}
          <div className="ml-auto flex gap-2">
            {running ? <button type="button" onClick={() => { stopRef.current = true; }} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-bold text-amber-800"><PauseCircle className="size-4" />Pause after current ZIP</button> : <button type="button" onClick={() => void start()} disabled={!counts.ready} className="inline-flex items-center gap-1.5 rounded-lg bg-[#DDAA42] px-4 py-2 font-bold text-[#121B35] disabled:opacity-40"><Play className="size-4" />{counts.failed ? "Retry / continue" : "Start import"}</button>}
            <button type="button" onClick={reset} disabled={running} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E0E7] px-3 py-2 font-bold text-[#68646F] disabled:opacity-40"><RotateCcw className="size-4" />Clear</button>
          </div>
        </div>
        {progress && <p className="mt-3 truncate rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-semibold text-blue-800">{progress}</p>}
        <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-[#ECE9EF]">
          {packages.map((item) => <div key={item.packageKey} className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-2 border-b border-[#F0EDF2] px-3 py-2 text-[11px] last:border-0">
            {item.status === "importing" ? <Loader2 className="size-4 animate-spin text-[#B98428]" /> : item.status === "complete" ? <CheckCircle2 className="size-4 text-emerald-600" /> : item.status === "failed" ? <XCircle className="size-4 text-red-600" /> : item.status === "skipped" ? <ShieldCheck className="size-4 text-slate-500" /> : <UploadCloud className="size-4 text-[#B98428]" />}
            <span className="truncate font-semibold text-[#121B35]" title={item.packageName}>{item.packageName}</span>
            <span className={`max-w-72 truncate ${item.status === "failed" ? "text-red-700" : "text-[#68646F]"}`} title={item.message}>{item.message || formatBytes(item.packageSize)}</span>
          </div>)}
        </div>
      </>}
    </section>
  );
}
