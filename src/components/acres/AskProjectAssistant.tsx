import { useState } from "react";
import { BookOpen, Flag, Loader2, MessageSquareText, Send } from "lucide-react";
import { askProject, reportProjectAnswer } from "@/lib/api";

type Answer = {
  answer: string;
  unavailable: boolean;
  questionId?: string;
  generatedBy?: string;
  sources: Array<{ id: string; type: string; label: string; phase?: string; pageNumber?: number; excerpt?: string; updatedAt?: string; uploadedAt?: string }>;
};

const suggestions = ["What configurations and prices are available?", "What is the RERA number and possession date?", "Which amenities are listed?", "What documents are available?"];

export default function AskProjectAssistant({ propertyId, propertyTitle }: { propertyId: string; propertyTitle: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);

  const submit = async (event?: React.FormEvent, suppliedQuestion?: string) => {
    event?.preventDefault();
    const nextQuestion = (suppliedQuestion || question).trim();
    if (!nextQuestion) return;
    setQuestion(nextQuestion); setLoading(true); setError(""); setAnswer(null); setReported(false);
    try { setAnswer(await askProject(propertyId, nextQuestion) as Answer); }
    catch (askError) { setError(askError instanceof Error ? askError.message : "Unable to answer this project question"); }
    finally { setLoading(false); }
  };

  const report = async () => {
    if (!answer?.questionId || reporting || reported) return;
    setReporting(true);
    try { await reportProjectAnswer(propertyId, answer.questionId); setReported(true); }
    catch (reportError) { setError(reportError instanceof Error ? reportError.message : "Unable to report this answer"); }
    finally { setReporting(false); }
  };

  return <section className="rounded-2xl border border-[#D9D2C5] bg-[#FBF9F4] p-4 shadow-[0_10px_30px_rgba(18,27,53,.05)]" aria-labelledby="ask-project-title">
    <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#172039] text-[#E2B757]"><MessageSquareText className="size-[18px]" /></span><div><h3 id="ask-project-title" className="text-[17px] font-extrabold tracking-[-.02em] text-[#172039]">Ask this project</h3><p className="mt-0.5 text-[11px] leading-5 text-[#687080]">Answers use only {propertyTitle}&apos;s saved details and document records.</p></div></div>
    <div className="mt-3 flex flex-wrap gap-1.5">{suggestions.map((suggestion) => <button key={suggestion} type="button" disabled={loading} onClick={() => void submit(undefined, suggestion)} className="rounded-lg border border-[#DED8CE] bg-white px-2.5 py-2 text-left text-[10px] font-semibold text-[#4D5564] transition hover:border-[#C28C25]">{suggestion}</button>)}</div>
    <form onSubmit={(event) => void submit(event)} className="mt-3 flex gap-2"><input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} placeholder="Ask about price, RERA, possession, amenities…" className="h-11 min-w-0 flex-1 rounded-xl border border-[#D8DCE4] bg-white px-3 text-[12px] text-[#30394D] outline-none focus:border-[#C28C25]" /><button disabled={loading || !question.trim()} aria-label="Ask project question" className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#DDAA42] text-[#172039] disabled:opacity-50">{loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</button></form>
    {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-[10px] font-semibold text-red-700">{error}</p>}
    {answer && <div className={`mt-3 rounded-xl border p-3 ${answer.unavailable ? "border-amber-200 bg-amber-50" : "border-[#E0D4B9] bg-white"}`}><p className="whitespace-pre-line text-[12px] leading-6 text-[#30394D]">{answer.answer}</p>{answer.sources.length > 0 && <div className="mt-3 border-t border-[#ECE6DA] pt-3"><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#805A0B]"><BookOpen className="size-3.5" />Sources used</p><div className="mt-2 space-y-2">{answer.sources.map((source) => <div key={source.id} className="rounded-lg bg-[#F8F6F1] p-2"><p className="text-[10px] font-bold text-[#172039]">{source.label}{source.phase ? ` · ${source.phase}` : ""}{source.pageNumber ? ` · Page ${source.pageNumber}` : ""}</p>{source.excerpt && <p className="mt-1 line-clamp-3 text-[10px] leading-5 text-[#68646F]">{source.excerpt}</p>}</div>)}</div></div>}<div className="mt-3 flex items-end justify-between gap-3"><p className="max-w-[75%] text-[10px] leading-4 text-[#68646F]">The assistant does not provide legal conclusions, guaranteed returns or information outside the saved project evidence.</p>{answer.questionId && !answer.unavailable && <button type="button" onClick={() => void report()} disabled={reporting || reported} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold text-[#6B6570] transition hover:bg-[#F3F1F5] hover:text-[#9E3329] disabled:opacity-60"><Flag className="size-3" />{reported ? "Sent for review" : reporting ? "Reporting…" : "Report answer"}</button>}</div></div>}
  </section>;
}
