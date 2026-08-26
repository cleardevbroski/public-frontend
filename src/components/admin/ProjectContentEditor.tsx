"use client";

import { ExternalLink, Loader2, Play, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import type { MasterPlan, ProjectDownload, ProjectFaq, ProjectNarrative } from "@/components/acres/mock-data";
import { uploadPropertyMedia } from "@/lib/api";
import { PROPERTY_DOCUMENT_MAX_BYTES, PROPERTY_DOCUMENT_MAX_MB } from "@/lib/propertyMediaLimits";
import { canonicalYoutubeUrl, youtubeThumbnail, youtubeVideoId } from "@/lib/youtube";

type Props = {
  section?: "all" | "narrative" | "media" | "faqs";
  narrative?: ProjectNarrative;
  masterPlan?: MasterPlan;
  downloads?: ProjectDownload[];
  walkthroughVideoUrl?: string;
  faqs?: ProjectFaq[];
  onNarrativeChange: (value: ProjectNarrative) => void;
  onMasterPlanChange: (value: MasterPlan) => void;
  onDownloadsChange: (value: ProjectDownload[]) => void;
  onWalkthroughVideoUrlChange: (value: string) => void;
  onFaqsChange: (value: ProjectFaq[]) => void;
};

const input = "w-full rounded-xl border border-[#E4E0E7] bg-white px-3 py-2.5 text-[12px] text-[#121B35] outline-none focus:border-[#DDAA42]";
const emptyDownloadLabels = { "master-plan": "Master Plan" } as const;

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

  const uploadDownload = async (file?: File) => {
    if (!file) return;
    const kind = "master-plan" as const;
    const expected = "application/pdf" as const;
    if (file.type !== expected || file.size > PROPERTY_DOCUMENT_MAX_BYTES) {
      setError(`Master Plan must be a PDF no larger than ${PROPERTY_DOCUMENT_MAX_MB} MB.`);
      return;
    }
    setUploading(kind);
    setError("");
    try {
      const fileUrl = await uploadPropertyMedia(file, "project-document-pdf");
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

  const videoId = youtubeVideoId(props.walkthroughVideoUrl);
  const videoUrl = canonicalYoutubeUrl(props.walkthroughVideoUrl);
  const videoThumbnail = youtubeThumbnail(props.walkthroughVideoUrl);

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
          <h4 className="text-[13px] font-bold text-[#121B35]">Download Hub</h4>
          <p className="mb-3 mt-1 text-[10px] text-[#68646F]">The project brochure is linked automatically from RERA → Project Documents. Upload it only once there.</p>
          <div className="rounded-xl border border-[#D9D2BF] bg-[#FFFDF7] p-3 text-[10px] font-semibold text-[#795A18]">Project Brochure · linked from the saved RERA project document</div>
          {(() => {
            const current = props.downloads?.find((row) => row.kind === "master-plan");
            return <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#E4E0E7] bg-white p-3"><div className="min-w-0 flex-1"><p className="text-[12px] font-bold text-[#121B35]">Master Plan</p><p className="truncate text-[10px] text-[#68646F]">{current?.fileName || "Not uploaded"}</p></div>{current && <button type="button" onClick={() => props.onDownloadsChange((props.downloads || []).filter((row) => row.kind !== "master-plan"))} className="text-[10px] font-bold text-red-600">Remove</button>}<label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#121B35] px-3 py-2 text-[10px] font-bold text-white">{uploading === "master-plan" ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}{current ? "Replace" : "Upload"}<input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => void uploadDownload(event.target.files?.[0])} /></label></div>;
          })()}
          <div className="mt-3 rounded-xl border border-[#E4E0E7] bg-white p-3">
            <label className="text-[12px] font-bold text-[#121B35]">YouTube walkthrough link</label>
            <p className="mt-1 text-[10px] text-[#68646F]">Paste a YouTube, youtu.be, Shorts, Live or Embed URL. The public thumbnail opens YouTube.</p>
            <input type="url" value={props.walkthroughVideoUrl || ""} onChange={(event) => props.onWalkthroughVideoUrlChange(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={`${input} mt-2`} />
            {props.walkthroughVideoUrl && !videoId && <p className="mt-2 text-[10px] font-semibold text-red-600">Enter a valid YouTube video URL.</p>}
            {videoId && <a href={videoUrl} target="_blank" rel="noreferrer" className="group relative mt-3 block aspect-video overflow-hidden rounded-lg bg-[#121B35]">
              <img src={videoThumbnail} alt="YouTube walkthrough thumbnail" className="size-full object-cover" />
              <span className="absolute inset-0 grid place-items-center bg-black/20"><span className="grid size-12 place-items-center rounded-full bg-red-600 text-white shadow-lg"><Play className="size-5 fill-current" /></span></span>
              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-black/75 px-2 py-1 text-[9px] font-bold text-white">Open YouTube <ExternalLink className="size-3" /></span>
            </a>}
          </div>
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
