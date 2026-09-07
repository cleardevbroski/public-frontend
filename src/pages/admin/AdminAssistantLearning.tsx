import { useEffect, useMemo, useState } from "react";
import { Archive, BookCheck, CheckCircle2, FileSearch, Loader2, MessageSquareWarning, RefreshCw, Search, Trash2, XCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  deactivateProjectKnowledge,
  discoverPropertyDocuments,
  dismissAssistantQuestion,
  fetchAllAdminProperties,
  fetchAssistantLearningStats,
  fetchAssistantQuestions,
  fetchDocumentExtraction,
  fetchDocumentExtractions,
  fetchProjectAssistantEvidence,
  fetchProjectKnowledge,
  processDocumentExtraction,
  resolveAssistantQuestion,
  reviewDocumentExtraction,
} from "@/lib/api";
import type { Property } from "@/components/acres/mock-data";

type ProjectRef = { _id?: string; id?: string; title?: string; builder?: string; propertyType?: string };
type Question = { _id: string; question: string; category: string; status: string; occurrences: number; lastAskedAt: string; lastFeedbackReason?: string; property: ProjectRef };
type Evidence = { id: string; type: string; label: string; excerpt: string; phase?: string; pageNumber?: number };
type Knowledge = { _id: string; canonicalQuestion: string; answer: string; aliases: string[]; active: boolean; stale: boolean; useCount: number; updatedAt: string; property: ProjectRef; evidenceRefs: Array<{ label: string; pageNumber?: number }> };
type ExtractionPage = { pageNumber: number; originalText: string; reviewedText: string; method: "embedded_text" | "ocr" };
type Extraction = { _id: string; property: ProjectRef; label: string; fileName: string; phaseName?: string; status: string; extractionMethod?: string; pageCount: number; characterCount: number; error?: string; pages?: ExtractionPage[]; updatedAt: string };

const tabs = [
  { id: "questions", label: "Question queue", icon: MessageSquareWarning },
  { id: "knowledge", label: "Approved answers", icon: BookCheck },
  { id: "documents", label: "Document extraction", icon: FileSearch },
] as const;
type Tab = typeof tabs[number]["id"];
const inputClass = "w-full rounded-xl border border-[#DED9E1] bg-white px-3 py-2.5 text-[12px] text-[#121B35] outline-none transition focus:border-[#C99732] focus:ring-2 focus:ring-[#DDAA42]/10";

function projectId(project?: ProjectRef) { return String(project?._id || project?.id || ""); }
function statusClass(status: string) {
  if (["approved", "answered"].includes(status)) return "bg-emerald-50 text-emerald-700";
  if (["failed", "needs_review", "rejected"].includes(status)) return "bg-red-50 text-red-700";
  if (["review_required", "unanswered"].includes(status)) return "bg-amber-50 text-amber-800";
  return "bg-[#F1EFF2] text-[#68646F]";
}

export default function AdminAssistantLearning() {
  const [tab, setTab] = useState<Tab>("questions");
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionStatus, setQuestionStatus] = useState("unanswered");
  const [questionSearch, setQuestionSearch] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [canonicalQuestion, setCanonicalQuestion] = useState("");
  const [aliases, setAliases] = useState("");
  const [approvedAnswer, setApprovedAnswer] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [documents, setDocuments] = useState<Extraction[]>([]);
  const [documentPropertyId, setDocumentPropertyId] = useState("");
  const [documentStatus, setDocumentStatus] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<Extraction | null>(null);
  const [pageEdits, setPageEdits] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadStats = async () => { const data = await fetchAssistantLearningStats(); setStats(data); };
  const loadQuestions = async () => { const data = await fetchAssistantQuestions({ status: questionStatus, search: questionSearch, limit: 100 }); setQuestions(data.questions || []); };
  const loadKnowledge = async () => { const data = await fetchProjectKnowledge(); setKnowledge(data.knowledge || []); };
  const loadDocuments = async () => { const data = await fetchDocumentExtractions({ status: documentStatus, propertyId: documentPropertyId }); setDocuments(data.documents || []); };
  const refresh = async () => {
    setLoading(true); setError("");
    try {
      const [allProperties] = await Promise.all([fetchAllAdminProperties(), loadStats(), loadQuestions(), loadKnowledge(), loadDocuments()]);
      setProperties(allProperties as Property[]);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load assistant review workspace"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, []);
  useEffect(() => { if (!loading) void loadQuestions().catch((value) => setError(value.message)); }, [questionStatus]);
  useEffect(() => { if (!loading) void loadDocuments().catch((value) => setError(value.message)); }, [documentPropertyId, documentStatus]);

  const openQuestion = async (question: Question) => {
    setSelectedQuestion(question); setCanonicalQuestion(question.question); setAliases(""); setApprovedAnswer(""); setSelectedEvidence([]); setError(""); setWorking("evidence");
    try { const data = await fetchProjectAssistantEvidence(projectId(question.property)); setEvidence(data.evidence || []); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load evidence"); }
    finally { setWorking(""); }
  };
  const approveQuestion = async () => {
    if (!selectedQuestion) return; setWorking("approve"); setError(""); setMessage("");
    try {
      await resolveAssistantQuestion(selectedQuestion._id, { canonicalQuestion, aliases: aliases.split("\n").map((value) => value.trim()).filter(Boolean), answer: approvedAnswer, evidenceIds: selectedEvidence });
      setMessage("Answer approved. Similar future questions can now reuse it without an AI API call."); setSelectedQuestion(null); await Promise.all([loadQuestions(), loadKnowledge(), loadStats()]);
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to approve answer"); }
    finally { setWorking(""); }
  };
  const dismissQuestion = async (question: Question) => {
    setWorking(question._id); setError(""); try { await dismissAssistantQuestion(question._id); if (selectedQuestion?._id === question._id) setSelectedQuestion(null); await Promise.all([loadQuestions(), loadStats()]); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to dismiss question"); } finally { setWorking(""); }
  };
  const discover = async () => {
    if (!documentPropertyId) return; setWorking("discover"); setError(""); setMessage("");
    try { const data = await discoverPropertyDocuments(documentPropertyId); setMessage(`${data.discovered} supported documents found; ${data.created} added to the extraction queue.`); await Promise.all([loadDocuments(), loadStats()]); }
    catch (value) { setError(value instanceof Error ? value.message : "Unable to discover documents"); } finally { setWorking(""); }
  };
  const processDocument = async (document: Extraction) => {
    setWorking(document._id); setError(""); setMessage("Extracting text. Scanned pages take longer because OCR runs page by page.");
    try { await processDocumentExtraction(document._id); await Promise.all([loadDocuments(), loadStats()]); const detail = await fetchDocumentExtraction(document._id); openDocument(detail.extraction); setMessage("Text extracted. Review every page before approving it for customer answers."); }
    catch (value) { setError(value instanceof Error ? value.message : "Unable to extract text"); await loadDocuments(); } finally { setWorking(""); }
  };
  const openDocument = (document: Extraction) => { setSelectedDocument(document); setPageEdits(Object.fromEntries((document.pages || []).map((page) => [page.pageNumber, page.reviewedText || page.originalText]))); };
  const loadDocument = async (document: Extraction) => { setWorking(`open-${document._id}`); try { const data = await fetchDocumentExtraction(document._id); openDocument(data.extraction); } catch (value) { setError(value instanceof Error ? value.message : "Unable to load document text"); } finally { setWorking(""); } };
  const reviewDocument = async (action: "approve" | "reject") => {
    if (!selectedDocument) return; setWorking("review-document"); setError("");
    try { await reviewDocumentExtraction(selectedDocument._id, action, action === "approve" ? Object.entries(pageEdits).map(([pageNumber, text]) => ({ pageNumber: Number(pageNumber), text })) : undefined); setMessage(action === "approve" ? "Document text approved and added to the project assistant evidence." : "Extracted text rejected and excluded from customer answers."); setSelectedDocument(null); await Promise.all([loadDocuments(), loadStats()]); }
    catch (value) { setError(value instanceof Error ? value.message : "Unable to review document"); } finally { setWorking(""); }
  };

  const documentCounts = stats?.stats?.documents || {};
  const capability = stats?.capabilities;
  const selectedProjectName = useMemo(() => properties.find((property) => property.id === documentPropertyId)?.title || "", [properties, documentPropertyId]);

  return <AdminLayout><div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#A9771F]">Trust-controlled assistant</p><h1 className="mt-1 text-[28px] font-bold tracking-[-.03em] text-[#121B35]">Question learning & document review</h1><p className="mt-1 max-w-3xl text-[13px] leading-5 text-[#68646F]">Questions reveal missing information. Only answers and extracted pages approved here become reusable customer evidence.</p></div><button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[#DED9E1] bg-white px-4 py-2.5 text-[11px] font-bold text-[#121B35] transition hover:border-[#C99732] active:scale-[.98] disabled:opacity-50"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />Refresh workspace</button></header>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[
      ["Unanswered", stats?.stats?.unanswered || 0], ["Reported answers", stats?.stats?.needsReview || 0], ["Approved answers", stats?.stats?.approvedKnowledge || 0], ["Documents to review", documentCounts.review_required || 0], ["Approved documents", documentCounts.approved || 0],
    ].map(([label, value]) => <div key={String(label)} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#E8E4EA]"><p className="text-[10px] font-semibold text-[#77717E]">{label}</p><p className="mt-1 text-[24px] font-bold tabular-nums text-[#121B35]">{String(value)}</p></div>)}</section>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-semibold text-red-700">{error}</p>}
    {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-semibold text-emerald-800">{message}</p>}
    <nav className="flex gap-1 overflow-x-auto rounded-2xl bg-[#ECE9ED] p-1.5" aria-label="Assistant review areas">{tabs.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`inline-flex min-w-max flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold transition ${tab === item.id ? "bg-white text-[#121B35] shadow-sm" : "text-[#6F6974] hover:text-[#121B35]"}`}><Icon className="size-4" />{item.label}</button>; })}</nav>

    {loading ? <div className="rounded-2xl bg-white p-16 text-center text-sm text-[#68646F]"><Loader2 className="mx-auto mb-3 size-6 animate-spin text-[#B98428]" />Loading review workspace…</div> : tab === "questions" ? <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(390px,.85fr)]">
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#E8E4EA]"><div className="flex flex-wrap gap-2"><select value={questionStatus} onChange={(event) => setQuestionStatus(event.target.value)} className={`${inputClass} max-w-[190px]`}><option value="unanswered">Unanswered</option><option value="needs_review">Reported / needs review</option><option value="answered">Answered</option><option value="dismissed">Dismissed</option><option value="all">All questions</option></select><form onSubmit={(event) => { event.preventDefault(); void loadQuestions(); }} className="flex min-w-[220px] flex-1 gap-2"><input value={questionSearch} onChange={(event) => setQuestionSearch(event.target.value)} placeholder="Search customer questions" className={inputClass} /><button className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#121B35] text-white"><Search className="size-4" /></button></form></div><div className="mt-4 space-y-2">{questions.length === 0 ? <div className="rounded-xl border border-dashed border-[#D8D3DA] p-10 text-center text-[12px] text-[#77717E]">No questions in this queue.</div> : questions.map((question) => <article key={question._id} className={`rounded-xl border p-3 transition ${selectedQuestion?._id === question._id ? "border-[#DDAA42] bg-[#FFF9EC]" : "border-[#E8E4EA] hover:border-[#CFC8D1]"}`}><div className="flex items-start justify-between gap-3"><button type="button" onClick={() => void openQuestion(question)} className="min-w-0 flex-1 text-left"><p className="text-[12px] font-bold leading-5 text-[#121B35]">{question.question}</p><p className="mt-1 text-[10px] text-[#77717E]">{question.property?.title || "Deleted project"} · asked {question.occurrences}× · {question.category.replace(/_/g, " ")}</p>{question.lastFeedbackReason && <p className="mt-2 rounded-lg bg-red-50 px-2 py-1.5 text-[10px] text-red-700">Customer report: {question.lastFeedbackReason}</p>}</button><button type="button" title="Dismiss" onClick={() => void dismissQuestion(question)} disabled={working === question._id} className="rounded-lg p-2 text-[#8B8590] transition hover:bg-red-50 hover:text-red-700"><Archive className="size-4" /></button></div></article>)}</div></section>
      <aside className="self-start rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E8E4EA] xl:sticky xl:top-24">{!selectedQuestion ? <div className="py-16 text-center"><BookCheck className="mx-auto size-8 text-[#C6C0C8]" /><p className="mt-3 text-[12px] font-semibold text-[#68646F]">Select a question to prepare an evidence-backed answer.</p></div> : <div><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#A9771F]">Admin approval</p><h2 className="mt-1 text-[17px] font-bold text-[#121B35]">{selectedQuestion.property?.title}</h2></div><button onClick={() => setSelectedQuestion(null)} className="rounded-lg p-1.5 text-[#77717E] hover:bg-[#F3F1F5]"><XCircle className="size-4" /></button></div><div className="mt-4 space-y-3"><label className="block text-[10px] font-bold text-[#68646F]">Canonical question<input value={canonicalQuestion} onChange={(event) => setCanonicalQuestion(event.target.value)} className={`${inputClass} mt-1`} /></label><label className="block text-[10px] font-bold text-[#68646F]">Similar question aliases — one per line<textarea value={aliases} onChange={(event) => setAliases(event.target.value)} rows={3} className={`${inputClass} mt-1 resize-y`} placeholder="Is this project RERA registered?" /></label><label className="block text-[10px] font-bold text-[#68646F]">Approved answer<textarea value={approvedAnswer} onChange={(event) => setApprovedAnswer(event.target.value)} rows={6} className={`${inputClass} mt-1 resize-y`} placeholder="Write only what the selected evidence supports." /></label><div><p className="text-[10px] font-bold text-[#68646F]">Evidence sources</p>{working === "evidence" ? <p className="mt-2 text-[11px] text-[#77717E]">Loading evidence…</p> : <div className="mt-2 max-h-[300px] space-y-2 overflow-y-auto pr-1">{evidence.map((source) => <label key={source.id} className={`block cursor-pointer rounded-xl border p-2.5 ${selectedEvidence.includes(source.id) ? "border-[#DDAA42] bg-[#FFF9EC]" : "border-[#E8E4EA]"}`}><div className="flex gap-2"><input type="checkbox" checked={selectedEvidence.includes(source.id)} onChange={() => setSelectedEvidence((current) => current.includes(source.id) ? current.filter((id) => id !== source.id) : [...current, source.id])} className="mt-0.5" /><span><span className="block text-[10px] font-bold text-[#121B35]">{source.label}{source.pageNumber ? ` · page ${source.pageNumber}` : ""}</span><span className="mt-1 line-clamp-3 block text-[9px] leading-4 text-[#77717E]">{source.excerpt}</span></span></div></label>)}</div>}</div><button onClick={() => void approveQuestion()} disabled={working === "approve" || !approvedAnswer.trim() || selectedEvidence.length === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-4 py-3 text-[12px] font-bold text-[#121B35] transition hover:bg-[#E5B84F] active:scale-[.99] disabled:opacity-50">{working === "approve" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Approve reusable answer</button></div></div>}</aside>
    </div> : tab === "knowledge" ? <section className="space-y-3">{knowledge.length === 0 ? <div className="rounded-2xl border border-dashed border-[#D8D3DA] bg-white p-14 text-center text-sm text-[#77717E]">No admin-approved answers yet.</div> : knowledge.map((item) => <article key={item._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E8E4EA]"><div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-3xl"><div className="flex flex-wrap items-center gap-2"><h2 className="text-[14px] font-bold text-[#121B35]">{item.canonicalQuestion}</h2><span className={`rounded-md px-2 py-1 text-[9px] font-bold uppercase ${item.stale ? statusClass("failed") : item.active ? statusClass("approved") : statusClass("inactive")}`}>{item.stale ? "Source changed" : item.active ? "Active" : "Inactive"}</span></div><p className="mt-1 text-[10px] font-semibold text-[#8A6107]">{item.property?.title}</p><p className="mt-3 whitespace-pre-line text-[12px] leading-5 text-[#4D4752]">{item.answer}</p><p className="mt-3 text-[9px] text-[#8B8590]">{item.evidenceRefs.length} sources · used {item.useCount || 0} times · {item.aliases?.length || 0} aliases</p></div>{item.active && <button onClick={async () => { setWorking(item._id); try { await deactivateProjectKnowledge(item._id); await Promise.all([loadKnowledge(), loadStats()]); } catch (value) { setError(value instanceof Error ? value.message : "Unable to deactivate answer"); } finally { setWorking(""); } }} className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-[10px] font-bold text-red-700 transition hover:bg-red-50"><Trash2 className="size-3.5" />Deactivate</button>}</div></article>)}</section> : <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,.9fr)]">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E8E4EA]"><div><h2 className="text-[16px] font-bold text-[#121B35]">Discover project documents</h2><p className="mt-1 text-[11px] leading-5 text-[#68646F]">Choose a project to find its PDFs and document images. Files remain private; only approved text pages can answer customers.</p></div><div className="mt-4 flex flex-col gap-2 sm:flex-row"><select value={documentPropertyId} onChange={(event) => setDocumentPropertyId(event.target.value)} className={`${inputClass} flex-1`}><option value="">Choose a property</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.title} · {property.builder || "Builder not set"}</option>)}</select><button onClick={() => void discover()} disabled={!documentPropertyId || working === "discover"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#121B35] px-4 py-2.5 text-[11px] font-bold text-white disabled:opacity-50">{working === "discover" ? <Loader2 className="size-4 animate-spin" /> : <FileSearch className="size-4" />}Discover</button></div><div className="mt-3 flex items-center justify-between gap-2"><p className="text-[10px] text-[#77717E]">{selectedProjectName || "All discovered project documents"}</p><select value={documentStatus} onChange={(event) => setDocumentStatus(event.target.value)} className="rounded-lg border border-[#DED9E1] bg-white px-2 py-1.5 text-[10px]"><option value="all">All statuses</option><option value="queued">Queued</option><option value="review_required">Review required</option><option value="approved">Approved</option><option value="failed">Failed</option><option value="rejected">Rejected</option></select></div>{capability && !capability.pdfText && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] font-semibold text-amber-800">PDF extraction tools are not installed on this server. Install Poppler and Tesseract before processing.</p>}<div className="mt-4 space-y-2">{documents.length === 0 ? <div className="rounded-xl border border-dashed border-[#D8D3DA] p-10 text-center text-[11px] text-[#77717E]">No documents discovered for this filter.</div> : documents.map((document) => <article key={document._id} className={`rounded-xl border p-3 ${selectedDocument?._id === document._id ? "border-[#DDAA42] bg-[#FFF9EC]" : "border-[#E8E4EA]"}`}><div className="flex items-start justify-between gap-3"><button type="button" onClick={() => void loadDocument(document)} className="min-w-0 flex-1 text-left"><p className="truncate text-[11px] font-bold text-[#121B35]">{document.label}</p><p className="mt-1 truncate text-[9px] text-[#77717E]">{document.property?.title} · {document.phaseName || "Project-wide"}</p><div className="mt-2 flex flex-wrap gap-2"><span className={`rounded-md px-2 py-1 text-[8px] font-bold uppercase ${statusClass(document.status)}`}>{document.status.replace(/_/g, " ")}</span>{document.pageCount > 0 && <span className="rounded-md bg-[#F3F1F5] px-2 py-1 text-[8px] font-bold text-[#68646F]">{document.pageCount} pages · {document.characterCount.toLocaleString("en-IN")} chars</span>}</div>{document.error && <p className="mt-2 text-[9px] text-red-700">{document.error}</p>}</button>{["queued", "failed", "rejected"].includes(document.status) && <button onClick={() => void processDocument(document)} disabled={working === document._id} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#DDAA42] px-2.5 py-2 text-[9px] font-bold text-[#121B35] disabled:opacity-50">{working === document._id ? <Loader2 className="size-3.5 animate-spin" /> : <FileSearch className="size-3.5" />}{document.status === "failed" ? "Retry" : "Extract"}</button>}</div></article>)}</div></section>
      <aside className="self-start rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E8E4EA] xl:sticky xl:top-24">{!selectedDocument ? <div className="py-16 text-center"><FileSearch className="mx-auto size-8 text-[#C6C0C8]" /><p className="mt-3 text-[12px] font-semibold text-[#68646F]">Select an extracted document to inspect its pages.</p></div> : <div><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#A9771F]">{selectedDocument.extractionMethod?.replace(/_/g, " ") || "Document"}</p><h2 className="mt-1 text-[15px] font-bold text-[#121B35]">{selectedDocument.label}</h2><p className="mt-1 text-[9px] text-[#77717E]">{selectedDocument.fileName}</p></div><button onClick={() => setSelectedDocument(null)} className="rounded-lg p-1.5 text-[#77717E] hover:bg-[#F3F1F5]"><XCircle className="size-4" /></button></div>{selectedDocument.pages?.length ? <div className="mt-4 max-h-[62vh] space-y-3 overflow-y-auto pr-1">{selectedDocument.pages.map((page) => <label key={page.pageNumber} className="block rounded-xl border border-[#E8E4EA] p-3"><span className="flex items-center justify-between text-[9px] font-bold text-[#68646F]"><span>Page {page.pageNumber}</span><span className="uppercase">{page.method.replace(/_/g, " ")}</span></span><textarea value={pageEdits[page.pageNumber] || ""} onChange={(event) => setPageEdits((current) => ({ ...current, [page.pageNumber]: event.target.value }))} rows={8} className={`${inputClass} mt-2 resize-y font-mono text-[10px] leading-4`} /></label>)}</div> : <p className="mt-6 rounded-xl bg-[#F8F7FA] p-4 text-[11px] text-[#68646F]">Run extraction before reviewing this document.</p>}{selectedDocument.pages?.length ? <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => void reviewDocument("reject")} disabled={working === "review-document"} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-[10px] font-bold text-red-700"><XCircle className="size-4" />Reject text</button><button onClick={() => void reviewDocument("approve")} disabled={working === "review-document"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-3 py-2.5 text-[10px] font-bold text-[#121B35]"><CheckCircle2 className="size-4" />Approve pages</button></div> : null}</div>}</aside>
    </div>}
  </div></AdminLayout>;
}
