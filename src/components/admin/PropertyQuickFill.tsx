import { useEffect, useRef, useState } from "react";
import { FileSpreadsheet, Loader2, Sparkles, Upload, WandSparkles } from "lucide-react";
import {
  analyzePropertyDescription,
  downloadPropertyDescriptionFormat,
  downloadPropertyExcelTemplate,
  parsePropertyExcel,
  type QuickFillPatch,
  type QuickFillSuggestion,
  type SupportedPropertyType,
} from "@/lib/propertyQuickFill";

type Props = {
  propertyType?: string;
  onApply: (patch: QuickFillPatch, replaceExisting: boolean) => void;
};

function typeFor(value?: string): SupportedPropertyType | undefined {
  return ["Apartment", "Villa", "Plot", "Commercial", "PG/Co-living"].includes(value || "") ? value as SupportedPropertyType : undefined;
}

export default function PropertyQuickFill({ propertyType, onApply }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [suggestion, setSuggestion] = useState<QuickFillSuggestion | null>(null);
  const [source, setSource] = useState<"Excel" | "Description" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [templateType, setTemplateType] = useState<SupportedPropertyType>(() => typeFor(propertyType) || "Apartment");

  useEffect(() => {
    const selected = typeFor(propertyType);
    if (selected) setTemplateType(selected);
  }, [propertyType]);

  const showSuggestion = (next: QuickFillSuggestion, nextSource: "Excel" | "Description") => {
    setSuggestion(next);
    setSource(nextSource);
    setError("");
    setReplaceExisting(false);
  };

  const upload = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      showSuggestion(await parsePropertyExcel(file, typeFor(propertyType)), "Excel");
    } catch (cause) {
      setSuggestion(null);
      setError(cause instanceof Error ? cause.message : "Unable to read this Excel file.");
    } finally {
      setLoading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const analyze = () => {
    setLoading(true);
    setError("");
    try {
      showSuggestion(analyzePropertyDescription(description, typeFor(propertyType)), "Description");
    } catch (cause) {
      setSuggestion(null);
      setError(cause instanceof Error ? cause.message : "Unable to analyze this description.");
    } finally {
      setLoading(false);
    }
  };

  const projectContentChecklist = suggestion ? [
    { label: "About Developer", count: suggestion.patch.developerDescription?.trim() ? 1 : 0 },
    { label: "Introduction paragraphs", count: suggestion.patch.projectNarrative?.introduction?.length || 0 },
    { label: "Project USPs", count: suggestion.patch.projectNarrative?.usps?.length || 0 },
    { label: "Why invest", count: suggestion.patch.projectNarrative?.investmentReasons?.length || 0 },
    { label: "Location advantages", count: suggestion.patch.projectNarrative?.locationAdvantage?.length || 0 },
    { label: "Project key details", count: suggestion.patch.projectNarrative?.keyDetails?.length || 0 },
    { label: "Feature groups", count: suggestion.patch.projectNarrative?.featureGroups?.length || 0 },
    { label: "Master-plan title", count: suggestion.patch.masterPlan?.title?.trim() ? 1 : 0 },
    { label: "Master-plan description", count: suggestion.patch.masterPlan?.summary?.trim() ? 1 : 0 },
    { label: "Master-plan detail sections", count: suggestion.patch.masterPlan?.sections?.length || 0 },
    { label: "FAQs", count: suggestion.patch.faqs?.length || 0 },
  ] : [];

  return (
    <section className="rounded-2xl border border-[#DDAA42]/45 bg-[#FFFBF1] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[15px] font-bold text-[#121B35]"><Sparkles className="size-4 text-[#B98428]" /> Quick fill property details</p>
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-[#68646F]">Admin only. Import all available Excel details or analyze a pasted description, review the suggestions, then apply them. Photos, videos, plans and documents stay manual.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Template property type" value={templateType} onChange={(event) => setTemplateType(event.target.value as SupportedPropertyType)} className="rounded-xl border border-[#DDAA42] bg-white px-3 py-2.5 text-[12px] font-bold text-[#805C12]">
            {(["Apartment", "Villa", "Plot", "Commercial", "PG/Co-living"] as SupportedPropertyType[]).map((type) => <option key={type}>{type}</option>)}
          </select>
          <button type="button" onClick={() => downloadPropertyDescriptionFormat(templateType)} className="rounded-xl border border-[#DDAA42] bg-white px-3 py-2.5 text-[12px] font-bold text-[#805C12]">{templateType} text template</button>
          <button type="button" onClick={() => downloadPropertyExcelTemplate(templateType)} className="rounded-xl border border-[#DDAA42] bg-white px-3 py-2.5 text-[12px] font-bold text-[#805C12]">{templateType} Excel template</button><button type="button" onClick={() => fileInput.current?.click()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#121B35] px-4 py-2.5 text-[12px] font-bold text-white disabled:opacity-60">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload Excel
        </button></div>
        <input ref={fileInput} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
      </div>

      <div className="mt-4 rounded-xl border border-[#E9DEC7] bg-white p-3">
        <label className="block text-[12px] font-bold text-[#3F3D46]">Paste property description</label>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} placeholder="Download Description format, ask ChatGPT to convert your original description into that format, then paste the completed format here." className="mt-2 w-full resize-none rounded-lg border border-[#E4E0E7] px-3 py-2 text-[13px] outline-none focus:border-[#DDAA42]" />
        <div className="mt-2 flex justify-end"><button type="button" onClick={analyze} disabled={loading || description.trim().length < 10} className="inline-flex items-center gap-2 rounded-lg border border-[#DDAA42] px-3 py-2 text-[12px] font-bold text-[#805C12] disabled:opacity-50"><WandSparkles className="size-4" /> Analyze & prefill</button></div>
      </div>

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>}

      {suggestion && (
        <div className="mt-4 rounded-xl border border-[#D8DDE4] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="flex items-center gap-2 text-[13px] font-bold text-[#121B35]"><FileSpreadsheet className="size-4 text-[#B98428]" /> {source} suggestions ready</p><p className="mt-0.5 text-[11px] text-[#68646F]">{suggestion.fields.length} field{suggestion.fields.length === 1 ? "" : "s"} found. Nothing is saved until you submit the property.</p></div><button type="button" onClick={() => { onApply(suggestion.patch, replaceExisting); setSuggestion(null); }} className="rounded-lg bg-[#DDAA42] px-4 py-2 text-[12px] font-bold text-[#121B35]">Apply to form</button></div>
          <div className="mt-3 rounded-lg border border-[#E9DEC7] bg-[#FFFBF1] p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#805C12]">Import confirmation</p>
            <div className="mt-2 grid gap-1.5 text-[11px] sm:grid-cols-2 lg:grid-cols-3">
              <p className={(suggestion.patch.reraPhases?.length || 0) > 0 ? "text-emerald-700" : "text-amber-700"}>{(suggestion.patch.reraPhases?.length || 0) > 0 ? "✓" : "⚠"} RERA phases: {suggestion.patch.reraPhases?.length || 0}</p>
              {projectContentChecklist.map((item) => <p key={item.label} className={item.count > 0 ? "text-emerald-700" : "text-amber-700"}>{item.count > 0 ? "✓" : "⚠"} {item.label}: {item.count || "not found"}</p>)}
            </div>
          </div>
          <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-[#EEF0F3] text-[12px]">
            {suggestion.fields.length ? suggestion.fields.map((field, index) => <div key={`${field.label}-${index}`} className="grid grid-cols-[130px_1fr] gap-3 border-b border-[#F0F1F3] px-3 py-2 last:border-0"><span className="font-semibold text-[#68646F]">{field.label}</span><span className="break-words text-[#121B35]">{field.value}</span></div>) : <p className="p-3 text-[#68646F]">No recognized fields were found. You can still enter the details manually.</p>}
          </div>
          <label className="mt-3 flex cursor-pointer items-start gap-2 text-[11px] text-[#3F3D46]"><input type="checkbox" checked={replaceExisting} onChange={(event) => setReplaceExisting(event.target.checked)} className="mt-0.5" /><span>Replace existing non-empty form values. Leave unchecked to fill only blank values; amenities are added without removing current selections.</span></label>
          {suggestion.warnings.map((warning) => <p key={warning} className="mt-2 text-[11px] leading-relaxed text-[#9A741E]">• {warning}</p>)}
        </div>
      )}
    </section>
  );
}
