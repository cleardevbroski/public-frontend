"use client";

import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import type { MasterPlan, ProjectDownload, ProjectFaq, ProjectNarrative } from "@/components/acres/mock-data";
import { uploadPropertyMedia } from "@/lib/api";

type Props = {
  section?: "all" | "narrative" | "media" | "faqs";
  narrative?: ProjectNarrative;
  masterPlan?: MasterPlan;
  downloads?: ProjectDownload[];
  faqs?: ProjectFaq[];
  onNarrativeChange: (value: ProjectNarrative) => void;
  onMasterPlanChange: (value: MasterPlan) => void;
  onDownloadsChange: (value: ProjectDownload[]) => void;
  onFaqsChange: (value: ProjectFaq[]) => void;
};

const input = "w-full rounded-xl border border-[#E4E0E7] bg-white px-3 py-2.5 text-[12px] text-[#121B35] outline-none focus:border-[#DDAA42]";
const emptyDownloadLabels = {
  brochure: "Project Brochure",
  "master-plan": "Master Plan",
  walkthrough: "Walkthrough Video",
} as const;

function LinesEditor({ label, value = [], onChange, placeholder }: { label: string; value?: string[]; onChange: (value: string[]) => void; placeholder: string }) {
  return <label className="block text-[12px] font-semibold text-[#3F3D46]">{label}<textarea value={value.join("\n")} onChange={(event) => onChange(event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))} rows={4} className={`${input} mt-1.5 resize-y`} placeholder={`${placeholder}\nOne item per line`} /></label>;
}

export default function ProjectContentEditor(props: Props) {
  const narrative = props.narrative || {};
  const masterPlan = props.masterPlan || {};
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const showNarrative = !props.section || props.section === "all" || props.section === "narrative";
  const showMedia = !props.section || props.section === "all" || props.section === "media";
  const showFaqs = !props.section || props.section === "all" || props.section === "faqs";
  const sectionTitle = props.section === "media" ? "Project Media & Download Hub" : props.section === "faqs" ? "Frequently Asked Questions" : "Project Content";

  const uploadDownload = async (kind: ProjectDownload["kind"], file?: File) => {
    if (!file) return;
    const expected = kind === "walkthrough" ? "video/mp4" : "application/pdf";
    if (file.type !== expected || file.size > 15 * 1024 * 1024) {
      setError(`${emptyDownloadLabels[kind]} must be ${kind === "walkthrough" ? "an MP4" : "a PDF"} no larger than 15 MB.`);
      return;
    }
    setUploading(kind);
    setError("");
    try {
      const fileUrl = await uploadPropertyMedia(file, kind === "walkthrough" ? "project-walkthrough" : "project-document-pdf");
      props.onDownloadsChange([
        ...(props.downloads || []).filter((row) => row.kind !== kind),
        { kind, label: emptyDownloadLabels[kind], fileName: file.name, fileUrl, mimeType: expected, fileSize: file.size },
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setUploading("");
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-[#E4E0E7] bg-[#F8F7FA]/60 p-5">
      <div><h3 className="text-[15px] font-bold text-[#121B35]">{sectionTitle}</h3><p className="mt-1 text-[11px] text-[#68646F]">Only enter verified project facts. Empty groups will not appear publicly.</p></div>
      {showNarrative && <>
      <div className="grid gap-4 md:grid-cols-2">
        <LinesEditor label="Introduction paragraphs" value={narrative.introduction} onChange={(introduction) => props.onNarrativeChange({ ...narrative, introduction })} placeholder="Project introduction" />
        <LinesEditor label="Project USPs" value={narrative.usps} onChange={(usps) => props.onNarrativeChange({ ...narrative, usps })} placeholder="One verified USP" />
        <LinesEditor label="Location advantages" value={narrative.locationAdvantage} onChange={(locationAdvantage) => props.onNarrativeChange({ ...narrative, locationAdvantage })} placeholder="Connectivity or location fact" />
        <LinesEditor label="Why invest" value={narrative.investmentReasons} onChange={(investmentReasons) => props.onNarrativeChange({ ...narrative, investmentReasons })} placeholder="Verified investment reason" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between"><h4 className="text-[13px] font-bold text-[#121B35]">Key details</h4><button type="button" onClick={() => props.onNarrativeChange({ ...narrative, keyDetails: [...(narrative.keyDetails || []), { label: "", value: "" }] })} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9A741E]"><Plus className="size-3.5" /> Add row</button></div>
        <div className="space-y-2">{(narrative.keyDetails || []).map((row, index) => <div key={index} className="grid grid-cols-[1fr_1.6fr_auto] gap-2"><input className={input} value={row.label} onChange={(event) => props.onNarrativeChange({ ...narrative, keyDetails: narrative.keyDetails?.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) })} placeholder="Category" /><input className={input} value={row.value} onChange={(event) => props.onNarrativeChange({ ...narrative, keyDetails: narrative.keyDetails?.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item) })} placeholder="Details" /><button type="button" onClick={() => props.onNarrativeChange({ ...narrative, keyDetails: narrative.keyDetails?.filter((_, itemIndex) => itemIndex !== index) })} className="px-2 text-red-500"><Trash2 className="size-4" /></button></div>)}</div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between"><h4 className="text-[13px] font-bold text-[#121B35]">Feature groups</h4><button type="button" onClick={() => props.onNarrativeChange({ ...narrative, featureGroups: [...(narrative.featureGroups || []), { title: "", items: [] }] })} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9A741E]"><Plus className="size-3.5" /> Add group</button></div>
        <div className="grid gap-3 md:grid-cols-2">{(narrative.featureGroups || []).map((group, index) => <div key={index} className="rounded-xl border border-[#E4E0E7] bg-white p-3"><div className="flex gap-2"><input className={input} value={group.title} onChange={(event) => props.onNarrativeChange({ ...narrative, featureGroups: narrative.featureGroups?.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) })} placeholder="e.g. Outdoor and Green Spaces" /><button type="button" onClick={() => props.onNarrativeChange({ ...narrative, featureGroups: narrative.featureGroups?.filter((_, itemIndex) => itemIndex !== index) })} className="px-2 text-red-500"><Trash2 className="size-4" /></button></div><textarea className={`${input} mt-2 resize-y`} rows={4} value={group.items.join("\n")} onChange={(event) => props.onNarrativeChange({ ...narrative, featureGroups: narrative.featureGroups?.map((item, itemIndex) => itemIndex === index ? { ...item, items: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) } : item) })} placeholder="One feature per line" /></div>)}</div>
      </div>
      </>}

      {showMedia && <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h4 className="text-[13px] font-bold text-[#121B35]">Master plan</h4>
          <input className={input} value={masterPlan.title || ""} onChange={(event) => props.onMasterPlanChange({ ...masterPlan, title: event.target.value })} placeholder="Master plan section title" />
          <textarea className={`${input} resize-y`} rows={5} value={masterPlan.summary || ""} onChange={(event) => props.onMasterPlanChange({ ...masterPlan, summary: event.target.value })} placeholder="Verified master-plan description" />
          <div className="flex items-center justify-between"><span className="text-[11px] font-bold text-[#68646F]">Detail sections</span><button type="button" onClick={() => props.onMasterPlanChange({ ...masterPlan, sections: [...(masterPlan.sections || []), { heading: "", body: "" }] })} className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9A741E]"><Plus className="size-3" /> Add</button></div>
          {(masterPlan.sections || []).map((section, index) => <div key={index} className="rounded-xl border border-[#E4E0E7] bg-white p-3"><div className="flex gap-2"><input className={input} value={section.heading} onChange={(event) => props.onMasterPlanChange({ ...masterPlan, sections: masterPlan.sections?.map((item, itemIndex) => itemIndex === index ? { ...item, heading: event.target.value } : item) })} placeholder="Section heading" /><button type="button" onClick={() => props.onMasterPlanChange({ ...masterPlan, sections: masterPlan.sections?.filter((_, itemIndex) => itemIndex !== index) })} className="px-2 text-red-500"><Trash2 className="size-4" /></button></div><textarea className={`${input} mt-2 resize-y`} rows={3} value={section.body} onChange={(event) => props.onMasterPlanChange({ ...masterPlan, sections: masterPlan.sections?.map((item, itemIndex) => itemIndex === index ? { ...item, body: event.target.value } : item) })} placeholder="Verified section details" /></div>)}
        </div>
        <div>
          <h4 className="mb-3 text-[13px] font-bold text-[#121B35]">Download Hub files</h4>
          <div className="space-y-2">{(["brochure", "master-plan", "walkthrough"] as const).map((kind) => {
            const current = props.downloads?.find((row) => row.kind === kind);
            return <div key={kind} className="flex items-center gap-3 rounded-xl border border-[#E4E0E7] bg-white p-3"><div className="min-w-0 flex-1"><p className="text-[12px] font-bold text-[#121B35]">{emptyDownloadLabels[kind]}</p><p className="truncate text-[10px] text-[#68646F]">{current?.fileName || "Not uploaded"}</p></div>{current && <button type="button" onClick={() => props.onDownloadsChange((props.downloads || []).filter((row) => row.kind !== kind))} className="text-[10px] font-bold text-red-600">Remove</button>}<label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#121B35] px-3 py-2 text-[10px] font-bold text-white">{uploading === kind ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}{current ? "Replace" : "Upload"}<input type="file" accept={kind === "walkthrough" ? "video/mp4,.mp4" : "application/pdf,.pdf"} className="hidden" onChange={(event) => void uploadDownload(kind, event.target.files?.[0])} /></label></div>;
          })}</div>
          {error && <p className="mt-2 text-[10px] text-red-600">{error}</p>}
        </div>
      </div>}

      {showFaqs && <div>
        <div className="mb-2 flex items-center justify-between"><h4 className="text-[13px] font-bold text-[#121B35]">Frequently asked questions</h4><button type="button" onClick={() => props.onFaqsChange([...(props.faqs || []), { question: "", answer: "" }])} className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9A741E]"><Plus className="size-3.5" /> Add FAQ</button></div>
        <div className="space-y-3">{(props.faqs || []).map((faq, index) => <div key={index} className="rounded-xl border border-[#E4E0E7] bg-white p-3"><div className="flex gap-2"><input className={input} value={faq.question} onChange={(event) => props.onFaqsChange((props.faqs || []).map((item, itemIndex) => itemIndex === index ? { ...item, question: event.target.value } : item))} placeholder="Question" /><button type="button" onClick={() => props.onFaqsChange((props.faqs || []).filter((_, itemIndex) => itemIndex !== index))} className="px-2 text-red-500"><Trash2 className="size-4" /></button></div><textarea className={`${input} mt-2 resize-y`} rows={3} value={faq.answer} onChange={(event) => props.onFaqsChange((props.faqs || []).map((item, itemIndex) => itemIndex === index ? { ...item, answer: event.target.value } : item))} placeholder="Answer based on verified listing data" /></div>)}</div>
      </div>}
    </div>
  );
}
