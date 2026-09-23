import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, CalendarClock, CheckCircle2, ChevronRight, Clock3, ExternalLink, FileSpreadsheet, FileText, LayoutList, Loader2, LogOut, MessageCircle, NotebookPen, PhoneCall, Search, Send, UserRoundCheck, UsersRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmployeeWorkspaceNav from "@/components/crm/EmployeeWorkspaceNav";
import WhatsAppNumberEditor from "@/components/crm/WhatsAppNumberEditor";
import { addCRMPartnerNote, crmEmployeeLogout, fetchMyCRMDashboard, fetchMyCRMPartner, fetchMyCRMPartners, hasCRMEmployeeSession, openCRMWhatsApp, saveCRMCallResult, saveCRMWhatsAppResult, startCRMCall, updateCRMWhatsAppNumber } from "@/lib/api";
import { callOutcomeLabels, stageLabels, type CallOutcome, type CRMEmployee, type CRMMetrics, type CRMPartner, type CRMPartnerDetail, type CRMStage, type CRMTask, type CRMTemplate } from "@/lib/cpCrmTypes";
import { useDocumentTitle } from "@/useDocumentTitle";

const outcomes = Object.keys(callOutcomeLabels) as CallOutcome[];
const stages: Array<"" | CRMStage> = ["", "new", "attempted", "callback", "interested", "has_clients", "not_interested", "do_not_contact"];
const when = (value?: string | null) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not scheduled";
const initialMetrics: CRMMetrics = { assigned: 0, pending: 0, contacted: 0, callResults: 0, callbacksScheduled: 0, callbacksCompleted: 0, callbacksDueToday: 0, callbacksOverdue: 0, whatsappSent: 0 };

export default function CPManagement() {
  useDocumentTitle("CP Management | ClearTitle One", "Employee Channel Partner management workspace.", { robots: "noindex, nofollow, noarchive" });
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<CRMEmployee | null>(null);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [partners, setPartners] = useState<CRMPartner[]>([]);
  const [selected, setSelected] = useState<CRMPartnerDetail | null>(null);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [callPanel, setCallPanel] = useState(false);
  const [callOutcome, setCallOutcome] = useState<CallOutcome>("no_answer");
  const [callbackAt, setCallbackAt] = useState("");
  const [priority, setPriority] = useState("normal");
  const [callNote, setCallNote] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [message, setMessage] = useState("");
  const [whatsappInteractionId, setWhatsappInteractionId] = useState("");
  const [whatsappPanel, setWhatsappPanel] = useState(false);
  const [note, setNote] = useState("");

  const handleSessionError = useCallback((reason: unknown) => {
    const messageText = reason instanceof Error ? reason.message : "Unable to load the CRM.";
    if (/employee login|required|session expired|invalid employee session|inactive/i.test(messageText)) { crmEmployeeLogout(); navigate("/employee-login", { replace: true }); return; }
    setError(messageText);
  }, [navigate]);
  const loadDashboard = useCallback(async () => {
    try { const data = await fetchMyCRMDashboard(); setEmployee(data.employee); setMetrics({ ...initialMetrics, ...data.metrics }); setTasks(data.tasks || []); }
    catch (reason) { handleSessionError(reason); }
  }, [handleSessionError]);
  const loadPartners = useCallback(async () => {
    setBusy("partners");
    try { const data = await fetchMyCRMPartners({ search, stage, due }); setPartners(data.partners || []); }
    catch (reason) { handleSessionError(reason); }
    finally { setBusy(""); }
  }, [search, stage, due, handleSessionError]);
  useEffect(() => {
    window.localStorage.setItem("crm-employee-last-workspace", "/cp-management");
    if (!hasCRMEmployeeSession()) navigate("/employee-login", { replace: true }); else void loadDashboard();
  }, [navigate, loadDashboard]);
  useEffect(() => { const timer = window.setTimeout(() => void loadPartners(), 250); return () => window.clearTimeout(timer); }, [loadPartners]);

  const openPartner = async (partnerId: string) => {
    setBusy(partnerId); setError(""); setNotice("");
    try {
      const detail = await fetchMyCRMPartner(partnerId); setSelected(detail);
      const first = detail.templates?.[0]; setTemplateId(first?.id || ""); setMessage(first ? renderMessage(first, detail.profile, employee) : "");
      setCallPanel(true); setWhatsappPanel(false); setNote("");
      if (window.matchMedia("(max-width: 1279px)").matches) window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) { handleSessionError(reason); }
    finally { setBusy(""); }
  };
  const refreshSelected = async () => {
    await Promise.all([loadDashboard(), loadPartners()]);
    if (selected) setSelected(await fetchMyCRMPartner(selected.profile.partner.id));
  };
  const call = async () => {
    if (!selected) return; setBusy("call"); setError("");
    try {
      const result = await startCRMCall(selected.profile.partner.id); setCallPanel(true); setNotice("Call opened. Save the result after returning to this page.");
      window.location.href = `tel:${String(result.dialNumber).replace(/[^+\d]/g, "")}`;
    } catch (reason) { handleSessionError(reason); }
    finally { setBusy(""); }
  };
  const saveCall = async (event: React.FormEvent) => {
    event.preventDefault(); if (!selected) return; setBusy("call-result"); setError("");
    const goNext = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value === "next";
    const currentIndex = partners.findIndex((item) => item.partner.id === selected.profile.partner.id);
    const next = [...partners.slice(currentIndex + 1), ...partners.slice(0, Math.max(currentIndex, 0))].find((item) => item.stage === "new");
    try {
      await saveCRMCallResult(selected.profile.partner.id, { outcome: callOutcome, callbackAt: callbackAt ? new Date(callbackAt).toISOString() : null, priority, note: callNote });
      setNotice(callOutcome === "callback_requested" ? "Call saved and callback scheduled." : "Call result saved."); setCallOutcome("no_answer"); setCallbackAt(""); setCallNote("");
      if (goNext) {
        await Promise.all([loadDashboard(), loadPartners()]);
        if (next) await openPartner(next.partner.id); else { setSelected(null); setNotice("All new assigned contacts are completed."); }
      } else await refreshSelected();
    } catch (reason) { handleSessionError(reason); }
    finally { setBusy(""); }
  };
  const chooseTemplate = (id: string) => {
    setTemplateId(id); const template = selected?.templates.find((item) => item.id === id); if (template && selected) setMessage(renderMessage(template, selected.profile, employee));
  };
  const openWhatsApp = async () => {
    if (!selected || !message.trim()) return; setBusy("whatsapp"); setError("");
    try {
      const result = await openCRMWhatsApp(selected.profile.partner.id, { templateId: templateId || null, messageBody: message });
      setWhatsappInteractionId(result.interactionId); setWhatsappPanel(true); setNotice("WhatsApp opened with the prepared message. Press Send there, then confirm the result here.");
      window.location.href = result.whatsappUrl;
    } catch (reason) { handleSessionError(reason); }
    finally { setBusy(""); }
  };
  const saveWhatsApp = async (outcome: "sent" | "not_sent" | "failed") => {
    if (!selected) return; setBusy("whatsapp-result");
    try { await saveCRMWhatsAppResult(selected.profile.partner.id, { outcome, interactionId: whatsappInteractionId }); setNotice(`WhatsApp marked ${outcome.replace("_", " ")}.`); setWhatsappPanel(false); await refreshSelected(); }
    catch (reason) { handleSessionError(reason); }
    finally { setBusy(""); }
  };
  const saveWhatsAppNumber = async (whatsappMobile: string) => {
    if (!selected) return; setBusy("whatsapp-number"); setError("");
    try { const result = await updateCRMWhatsAppNumber(selected.profile.partner.id, whatsappMobile); setNotice(result.message); await refreshSelected(); }
    catch (reason) { handleSessionError(reason); throw reason; } finally { setBusy(""); }
  };
  const saveNote = async () => {
    if (!selected || !note.trim()) return; setBusy("note");
    try { await addCRMPartnerNote(selected.profile.partner.id, note); setNote(""); setNotice("Internal note saved."); await refreshSelected(); }
    catch (reason) { handleSessionError(reason); }
    finally { setBusy(""); }
  };
  const completion = useMemo(() => metrics.assigned ? Math.round((metrics.contacted / metrics.assigned) * 100) : 0, [metrics]);

  return <div className="min-h-[100dvh] bg-[#EFF1F4] text-[#3F3D46] [&_input]:text-base [&_select]:text-base [&_textarea]:text-base sm:[&_input]:text-xs sm:[&_select]:text-xs sm:[&_textarea]:text-xs">
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B1328]"><div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-2 px-3 py-2 sm:px-4 md:px-6"><div className="flex min-w-0 items-center gap-3"><img src="/cleartitleone/logo.png" alt="ClearTitle One" className="size-9 shrink-0 rounded-full ring-2 ring-[#DDAA42]/60" /><div className="min-w-0"><p className="truncate text-sm font-bold text-white">CP Management</p><p className="truncate text-[10px] text-white/50">{employee ? `${employee.name} · ${employee.employeeId}` : "Employee workspace"}</p></div></div><div className="flex shrink-0 items-center justify-end gap-2"><button onClick={() => navigate("/cp-verification")} className="hidden h-9 items-center gap-2 rounded-md border border-white/15 px-3 text-[11px] font-bold text-white md:inline-flex"><FileSpreadsheet className="size-4" />Imported CPs</button><button onClick={() => navigate("/broker-verification")} className="hidden h-9 items-center gap-2 rounded-md border border-white/15 px-3 text-[11px] font-bold text-white md:inline-flex"><UsersRound className="size-4" />Brokers</button><button onClick={() => { crmEmployeeLogout(); navigate("/employee-login", { replace: true }); }} className="grid size-11 place-items-center rounded-md border border-white/15 text-white md:size-9" title="Sign out" aria-label="Sign out"><LogOut className="size-4" /></button></div></div></header>
    <main className="mx-auto max-w-[1500px] space-y-5 px-3 py-4 pb-28 sm:px-4 md:px-6 md:py-6 md:pb-6">
      <section className={`${selected ? "hidden xl:flex" : "flex"} flex-col gap-4 border-b border-[#D6D9DF] pb-5 md:flex-row md:items-end md:justify-between`}><div><p className="text-[10px] font-bold uppercase text-[#805A0B]">Today’s work queue</p><h1 className="mt-1 text-2xl font-bold text-[#121B35] sm:text-[28px]">Channel Partner outreach</h1><p className="mt-1 text-xs text-[#68646F]">Open a partner, make the call, record the result, and complete due callbacks.</p></div><div className="min-w-0 md:min-w-[230px]"><div className="flex justify-between text-[10px] font-bold uppercase text-[#68646F]"><span>Assignment progress</span><span>{completion}%</span></div><div className="mt-2 h-2 overflow-hidden rounded bg-white"><div className="h-full bg-[#DDAA42]" style={{ width: `${completion}%` }} /></div></div></section>
      {error && <div role="alert" className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700"><AlertCircle className="size-4" />{error}</div>}{notice && <div role="status" className="flex items-start justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700"><span className="flex gap-2"><CheckCircle2 className="size-4 shrink-0" />{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X className="size-4" /></button></div>}
      <section className={`${selected ? "hidden xl:grid" : "grid"} grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#D8DCE2] bg-[#D8DCE2] lg:grid-cols-6`}><Metric label="Assigned" value={metrics.assigned} icon={UsersRound} /><Metric label="Pending" value={metrics.pending} icon={LayoutList} /><Metric label="Calls saved" value={metrics.callResults} icon={PhoneCall} /><Metric label="Due today" value={metrics.callbacksDueToday} icon={Clock3} /><Metric label="Overdue" value={metrics.callbacksOverdue} icon={CalendarClock} danger={metrics.callbacksOverdue > 0} /><Metric label="WhatsApp sent" value={metrics.whatsappSent} icon={Send} /></section>
      {tasks.length > 0 && <section className={`${selected ? "hidden xl:block" : "block"} border-l-4 border-[#DDAA42] bg-white px-4 py-3`}><p className="text-[10px] font-bold uppercase text-[#805A0B]">Current assignment</p><div className="mt-1 flex flex-wrap items-center justify-between gap-2"><div><strong className="text-sm text-[#121B35]">{tasks[0].title}</strong><p className="text-[11px] text-[#68646F]">{tasks[0].instructions || "Contact the assigned Channel Partners and record every result."}</p></div><span className="text-xs font-bold text-[#121B35]">{tasks[0].completedCount} / {tasks[0].assignedCount}</span></div></section>}
      <div className={`${selected ? "hidden xl:grid" : "grid"} gap-3 rounded-lg border border-[#D8DCE2] bg-white p-3 sm:p-4 md:grid-cols-[minmax(220px,1fr)_180px_160px]`}><label className="relative"><Search className="absolute left-3 top-3.5 size-4 text-[#8A8690]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assigned CPs..." className="h-11 w-full rounded-md border border-[#D8D3DA] pl-9 pr-3 sm:h-10" /></label><select value={stage} onChange={(event) => setStage(event.target.value)} className="h-11 rounded-md border border-[#D8D3DA] px-3 sm:h-10"><option value="">All stages</option>{stages.filter(Boolean).map((item) => <option key={item} value={item}>{stageLabels[item as CRMStage]}</option>)}</select><select value={due} onChange={(event) => setDue(event.target.value)} className="h-11 rounded-md border border-[#D8D3DA] px-3 sm:h-10"><option value="">All callbacks</option><option value="today">Due today</option><option value="overdue">Overdue</option></select></div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_520px]"><section className={`${selected ? "hidden xl:block" : "block"} overflow-hidden rounded-lg border border-[#D8DCE2] bg-white`}><div className="divide-y divide-[#ECEEF1]">{busy === "partners" && !partners.length ? <div className="grid place-items-center py-16"><Loader2 className="size-6 animate-spin text-[#DDAA42]" /></div> : partners.map((profile) => <button key={profile.id} onClick={() => void openPartner(profile.partner.id)} className={`grid min-h-20 w-full items-center gap-3 px-4 py-4 text-left sm:grid-cols-[minmax(0,1fr)_140px_150px_28px] ${selected?.profile.partner.id === profile.partner.id ? "bg-[#FFF8E8]" : "hover:bg-[#FAFAFB]"}`}><div className="min-w-0"><strong className="block truncate text-[13px] text-[#121B35]">{profile.partner.companyName}</strong><span className="mt-0.5 block break-words text-[11px] text-[#68646F]">{profile.partner.contactName} · {profile.partner.mobile} · {profile.partner.city}</span></div><Stage value={profile.stage} /><div className="text-[10px] text-[#68646F]"><span className="block uppercase">Next callback</span><strong className={profile.nextFollowUpAt && new Date(profile.nextFollowUpAt) < new Date() ? "text-red-700" : "text-[#3F3D46]"}>{when(profile.nextFollowUpAt)}</strong></div><ChevronRight className="hidden size-4 text-[#9A96A0] sm:block" /></button>)}{!partners.length && busy !== "partners" && <div className="py-16 text-center"><CheckCircle2 className="mx-auto size-8 text-emerald-600" /><p className="mt-2 text-sm font-bold text-[#121B35]">No CPs in this queue</p><p className="mt-1 text-xs text-[#68646F]">Change the filters or ask the administrator for an assignment.</p></div>}</div></section>
        <aside className={`${selected ? "block" : "hidden xl:block"} min-w-0 overflow-hidden rounded-lg border border-[#D8DCE2] bg-white xl:sticky xl:top-20`}>{selected ? <><button onClick={() => setSelected(null)} className="flex min-h-11 w-full items-center gap-2 border-b border-[#E4E0E7] px-4 text-xs font-bold text-[#121B35] xl:hidden"><ArrowLeft className="size-4" />Back to assigned contacts</button><PartnerWorkspace detail={selected} employee={employee} callPanel={callPanel} callOutcome={callOutcome} callbackAt={callbackAt} priority={priority} callNote={callNote} templateId={templateId} message={message} whatsappPanel={whatsappPanel} note={note} busy={busy} setCallOutcome={setCallOutcome} setCallbackAt={setCallbackAt} setPriority={setPriority} setCallNote={setCallNote} chooseTemplate={chooseTemplate} setMessage={setMessage} setNote={setNote} call={call} saveCall={saveCall} openWhatsApp={openWhatsApp} saveWhatsApp={saveWhatsApp} saveWhatsAppNumber={saveWhatsAppNumber} saveNote={saveNote} /></> : <div className="py-20 text-center"><UserRoundCheck className="mx-auto size-9 text-[#C9C5CD]" /><p className="mt-3 text-xs text-[#68646F]">Select a Channel Partner to begin.</p></div>}</aside>
      </div>
    </main>
    <EmployeeWorkspaceNav active="registered" />
  </div>;
}

type WorkspaceProps = { detail: CRMPartnerDetail; employee: CRMEmployee | null; callPanel: boolean; callOutcome: CallOutcome; callbackAt: string; priority: string; callNote: string; templateId: string; message: string; whatsappPanel: boolean; note: string; busy: string; setCallOutcome: (value: CallOutcome) => void; setCallbackAt: (value: string) => void; setPriority: (value: string) => void; setCallNote: (value: string) => void; chooseTemplate: (value: string) => void; setMessage: (value: string) => void; setNote: (value: string) => void; call: () => Promise<void>; saveCall: (event: React.FormEvent) => Promise<void>; openWhatsApp: () => Promise<void>; saveWhatsApp: (outcome: "sent" | "not_sent" | "failed") => Promise<void>; saveWhatsAppNumber: (number: string) => Promise<void>; saveNote: () => Promise<void> };
function PartnerWorkspace(props: WorkspaceProps) {
  const { detail, callPanel, callOutcome, callbackAt, priority, callNote, templateId, message, whatsappPanel, note, busy } = props;
  const profile = detail.profile;
  return <div className="min-w-0"><div className="border-b border-[#E4E0E7] p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase text-[#805A0B]">{profile.partner.applicationNumber}</p><h2 className="mt-1 break-words text-lg font-bold text-[#121B35] sm:text-xl">{profile.partner.companyName}</h2><p className="mt-1 break-words text-xs leading-5 text-[#68646F]">{profile.partner.contactName} · {profile.partner.designation}<br/>{profile.partner.mobile}{profile.partner.alternateMobile ? ` / ${profile.partner.alternateMobile}` : ""}<br/>{profile.partner.email}<br/>{profile.partner.city}, {profile.partner.state}</p></div><Stage value={profile.stage} /></div><div className="mt-4 hidden grid-cols-2 gap-2 md:grid"><button onClick={() => void props.call()} disabled={busy === "call" || profile.stage === "do_not_contact"} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#121B35] text-xs font-bold text-white disabled:opacity-40">{busy === "call" ? <Loader2 className="size-4 animate-spin" /> : <PhoneCall className="size-4" />}Call CP</button><a href={`mailto:${profile.partner.email}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#D8D3DA] text-xs font-bold text-[#121B35]"><ExternalLink className="size-4" />Email</a></div></div>
    <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 grid grid-cols-2 gap-2 border-b border-[#D8DCE2] bg-white/95 p-2 shadow-[0_-6px_18px_rgba(11,19,40,0.12)] backdrop-blur md:hidden"><button onClick={() => void props.call()} disabled={busy === "call" || profile.stage === "do_not_contact"} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#121B35] text-xs font-bold text-white disabled:opacity-40">{busy === "call" ? <Loader2 className="size-4 animate-spin" /> : <PhoneCall className="size-4" />}Call</button><button onClick={() => void props.openWhatsApp()} disabled={busy === "whatsapp" || !message.trim() || profile.stage === "do_not_contact"} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#168B52] text-xs font-bold text-white disabled:opacity-40"><MessageCircle className="size-4" />WhatsApp</button></div>
    {callPanel && <form onSubmit={(event) => void props.saveCall(event)} className="border-b border-[#E4E0E7] bg-[#F8F7FA] p-5"><h3 className="text-sm font-bold text-[#121B35]">Record call result</h3><p className="mt-1 text-[10px] text-[#68646F]">Save the outcome before using WhatsApp, notes, or other contact tools.</p><label className="mt-3 block"><span className="text-[10px] font-bold uppercase text-[#68646F]">Result</span><select value={callOutcome} onChange={(event) => props.setCallOutcome(event.target.value as CallOutcome)} className="mt-1 h-10 w-full rounded-md border border-[#D8D3DA] bg-white px-3 text-xs">{outcomes.map((outcome) => <option key={outcome} value={outcome}>{callOutcomeLabels[outcome]}</option>)}</select></label>{callOutcome === "callback_requested" && <div className="mt-3 grid grid-cols-[minmax(0,1fr)_120px] gap-2"><label><span className="text-[10px] font-bold uppercase text-[#68646F]">Callback date and time</span><input required type="datetime-local" value={callbackAt} onChange={(event) => props.setCallbackAt(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-[#D8D3DA] bg-white px-2 text-xs" /></label><label><span className="text-[10px] font-bold uppercase text-[#68646F]">Priority</span><select value={priority} onChange={(event) => props.setPriority(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-[#D8D3DA] bg-white px-2 text-xs"><option value="normal">Normal</option><option value="important">Important</option><option value="urgent">Urgent</option></select></label></div>}<label className="mt-3 block"><span className="text-[10px] font-bold uppercase text-[#68646F]">Note {callOutcome === "other" ? "(required)" : "(optional)"}</span><textarea required={callOutcome === "other"} value={callNote} onChange={(event) => props.setCallNote(event.target.value)} className="mt-1 h-20 w-full resize-none rounded-md border border-[#D8D3DA] bg-white p-3 text-xs" /></label><div className="mt-3 grid grid-cols-2 gap-2"><button type="submit" value="save" disabled={busy === "call-result" || (callOutcome === "callback_requested" && !callbackAt) || (callOutcome === "other" && !callNote.trim())} className="inline-flex h-10 items-center justify-center rounded-md border border-[#D8D3DA] bg-white text-xs font-bold text-[#121B35] disabled:opacity-40">Save result</button><button type="submit" value="next" disabled={busy === "call-result" || (callOutcome === "callback_requested" && !callbackAt) || (callOutcome === "other" && !callNote.trim())} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#DDAA42] text-xs font-bold text-[#121B35] disabled:opacity-40">{busy === "call-result" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Save &amp; Next</button></div></form>}
    <section className="border-b border-[#E4E0E7] p-5"><div className="flex items-center gap-2"><MessageCircle className="size-4 text-[#168B52]" /><h3 className="text-sm font-bold text-[#121B35]">WhatsApp message</h3></div><WhatsAppNumberEditor primaryNumber={profile.partner.mobile} whatsappNumber={profile.whatsappMobile} updatedAt={profile.whatsappUpdatedAt} busy={busy === "whatsapp-number"} onSave={props.saveWhatsAppNumber} />{detail.templates.length ? <><select value={templateId} onChange={(event) => props.chooseTemplate(event.target.value)} className="mt-3 h-10 w-full rounded-md border border-[#D8D3DA] px-3 text-xs"><option value="">Choose template</option>{detail.templates.map((template) => <option key={template.id} value={template.id}>{template.name} · {template.kind.replace("_", " ")}</option>)}</select><textarea value={message} onChange={(event) => props.setMessage(event.target.value)} className="mt-2 h-40 w-full resize-y rounded-md border border-[#D8D3DA] p-3 text-xs leading-5" /><button onClick={() => void props.openWhatsApp()} disabled={busy === "whatsapp" || !message.trim() || profile.stage === "do_not_contact"} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#168B52] text-xs font-bold text-white disabled:opacity-40">{busy === "whatsapp" ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}Open WhatsApp</button></> : <p className="mt-3 rounded-md bg-[#F8F7FA] p-3 text-xs text-[#68646F]">No message template is active. Ask the administrator to create one.</p>}{whatsappPanel && <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs font-bold text-emerald-900">Did you press Send in WhatsApp?</p><div className="mt-2 grid grid-cols-3 gap-2"><button disabled={busy === "whatsapp-result"} onClick={() => void props.saveWhatsApp("sent")} className="h-9 rounded bg-emerald-700 text-[10px] font-bold text-white">Sent</button><button disabled={busy === "whatsapp-result"} onClick={() => void props.saveWhatsApp("not_sent")} className="h-9 rounded bg-white text-[10px] font-bold text-[#3F3D46]">Not sent</button><button disabled={busy === "whatsapp-result"} onClick={() => void props.saveWhatsApp("failed")} className="h-9 rounded bg-red-50 text-[10px] font-bold text-red-700">Failed</button></div></div>}</section>
    <section className="border-b border-[#E4E0E7] p-5"><div className="flex items-center gap-2"><NotebookPen className="size-4 text-[#805A0B]" /><h3 className="text-sm font-bold text-[#121B35]">Internal note</h3></div><div className="mt-2 flex gap-2"><textarea value={note} onChange={(event) => props.setNote(event.target.value)} className="h-20 min-w-0 flex-1 resize-none rounded-md border border-[#D8D3DA] p-3 text-xs" placeholder="Optional notes about this CP..." /><button onClick={() => void props.saveNote()} disabled={busy === "note" || !note.trim()} className="grid w-11 place-items-center rounded-md bg-[#121B35] text-white disabled:opacity-40" title="Save note"><Send className="size-4" /></button></div></section>
    <section className="p-5"><h3 className="text-[10px] font-bold uppercase text-[#68646F]">Recent activity</h3><div className="mt-3 max-h-[340px] space-y-3 overflow-y-auto pr-1">{detail.interactions.map((item) => <div key={item.id} className="border-l-2 border-[#DDAA42] pl-3"><strong className="block text-[11px] capitalize text-[#121B35]">{item.action.replace(/_/g, " ")}{item.outcome ? ` · ${item.outcome.replace(/_/g, " ")}` : ""}</strong>{item.note && <p className="mt-1 text-[10px] text-[#68646F]">{item.note}</p>}{item.messageBody && <p className="mt-1 line-clamp-2 text-[10px] text-[#68646F]">{item.messageBody}</p>}<time className="mt-1 block text-[9px] text-[#96909A]">{when(item.createdAt)}</time></div>)}{!detail.interactions.length && <p className="text-xs text-[#68646F]">No activity recorded yet.</p>}</div></section>
  </div>;
}

function renderMessage(template: CRMTemplate, profile: CRMPartner, employee: CRMEmployee | null) {
  const materialLinks = template.attachments.map((item) => `${item.title}: ${item.url}`).join("\n");
  const replacements: Record<string, string> = { cp_name: profile.partner.contactName, company_name: profile.partner.companyName, project_name: template.projectName, employee_name: employee?.name || "ClearTitle One", material_links: materialLinks };
  let output = template.body;
  Object.entries(replacements).forEach(([key, value]) => { output = output.replace(new RegExp(`{{\\s*${key}\\s*}}`, "gi"), value); });
  if (materialLinks && !template.body.includes("{{material_links}}")) output = `${output}\n\n${materialLinks}`;
  return output.trim();
}
function Metric({ label, value, icon: Icon, danger = false }: { label: string; value: number; icon: typeof UsersRound; danger?: boolean }) { return <div className="bg-white p-4"><div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase text-[#68646F]">{label}</span><Icon className={`size-4 ${danger ? "text-red-600" : "text-[#9A7427]"}`} /></div><strong className={`mt-2 block text-xl ${danger ? "text-red-700" : "text-[#121B35]"}`}>{value}</strong></div>; }
function Stage({ value }: { value: CRMStage }) { const tone = value === "has_clients" || value === "interested" ? "bg-emerald-50 text-emerald-700" : value === "callback" ? "bg-amber-50 text-amber-800" : value === "not_interested" || value === "do_not_contact" ? "bg-red-50 text-red-700" : "bg-[#F1F4FA] text-[#273559]"; return <span className={`inline-flex w-fit rounded px-2 py-1 text-[10px] font-bold ${tone}`}>{stageLabels[value]}</span>; }
