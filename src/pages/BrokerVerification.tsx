import { useQueuePosition } from "@/components/crm/useQueuePosition";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, CalendarClock, CheckCircle2, Clock3, LayoutList, Loader2, MapPin, MessageCircle, PhoneCall, Search, Send, UserRoundCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmployeeWorkspaceNav from "@/components/crm/EmployeeWorkspaceNav";
import EmployeeHeader from "@/components/crm/EmployeeHeader";
import WhatsAppNumberEditor from "@/components/crm/WhatsAppNumberEditor";
import { crmEmployeeLogout, fetchAllMyCPProspects, fetchCRMEmployeeMe, fetchMyCPProspect, hasCRMEmployeeSession, openCPProspectWhatsApp, saveBrokerCallResult, saveCPProspectWhatsAppResult, startCPProspectCall, updateCPProspectWhatsAppNumber } from "@/lib/api";
import { verificationLabels, type CPProspect, type CPProspectDetail, type CPProspectMetrics } from "@/lib/cpProspectTypes";
import type { CRMEmployee, CRMTemplate } from "@/lib/cpCrmTypes";
import { useDocumentTitle } from "@/useDocumentTitle";

type BrokerCallOutcome = "" | "answered" | "callback_requested" | "no_answer" | "busy" | "wrong_number";
type ProjectInterest = "" | "interested" | "not_interested";

const propertyTypes = ["apartments", "villas", "plots", "commercial", "rentals", "other"];
const emptyMetrics: CPProspectMetrics = { total: 0, assigned: 0, unassigned: 0, pending: 0, active: 0, inactive: 0, callback: 0, unreachable: 0, completed: 0, overdue: 0, interested: 0, notInterested: 0, whatsappOpened: 0, whatsappSent: 0 };
const callLabels: Record<BrokerCallOutcome, string> = { "": "Choose call result", answered: "Answered", callback_requested: "Call again", no_answer: "Not picked", busy: "Busy", wrong_number: "Wrong number" };
const pendingCallKey = "crm-broker-pending-call";
const pendingWhatsAppKey = "crm-broker-pending-whatsapp";
const when = (value?: string | null) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not scheduled";
const title = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function readPending(key: string) {
  try { return JSON.parse(window.localStorage.getItem(key) || "null") as { prospectId: string; interactionId?: string; startedAt: number } | null; }
  catch { return null; }
}

export default function BrokerVerification() {
  useDocumentTitle("Broker Calls | ClearTitle One", "Employee broker calling and project follow-up workspace.", { robots: "noindex, nofollow, noarchive" });
  const navigate = useNavigate();
  const resultRef = useRef<HTMLDivElement>(null);
  const leftForCall = useRef(false);
  const [employee, setEmployee] = useState<CRMEmployee | null>(null);
  const [prospects, setProspects] = useState<CPProspect[]>([]);
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [selected, setSelected] = useState<CPProspectDetail | null>(null);
  const rememberQueuePosition = useQueuePosition(selected?.prospect.id);
  const [filters, setFilters] = useState({ search: "", status: "", city: "", area: "", propertyType: "", due: "" });
  const [resultPanel, setResultPanel] = useState(false);
  const [outcome, setOutcome] = useState<BrokerCallOutcome>("");
  const [interest, setInterest] = useState<ProjectInterest>("");
  const [callbackAt, setCallbackAt] = useState("");
  const [agenda, setAgenda] = useState("");
  const [conversationNote, setConversationNote] = useState("");
  const [areas, setAreas] = useState("");
  const [segments, setSegments] = useState<string[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [message, setMessage] = useState("");
  const [whatsappInteractionId, setWhatsappInteractionId] = useState("");
  const [whatsappPanel, setWhatsappPanel] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fail = useCallback((reason: unknown) => {
    const text = reason instanceof Error ? reason.message : "Unable to load the broker workspace.";
    if (/employee login|required|session expired|invalid employee session|inactive/i.test(text)) { crmEmployeeLogout(); navigate("/employee-login", { replace: true }); return; }
    setError(text);
  }, [navigate]);

  const loadQueue = useCallback(async () => {
    setBusy("queue");
    try {
      const data = await fetchAllMyCPProspects({ prospectType: "broker", ...filters });
      setProspects(data.prospects || []);
      setMetrics({ ...emptyMetrics, ...data.metrics });
    } catch (reason) { fail(reason); }
    finally { setBusy(""); }
  }, [fail, filters]);

  useEffect(() => {
    window.localStorage.setItem("crm-employee-last-workspace", "/broker-verification");
    if (!hasCRMEmployeeSession()) { navigate("/employee-login", { replace: true }); return; }
    fetchCRMEmployeeMe().then((data) => setEmployee(data.employee)).catch(fail);
  }, [fail, navigate]);
  useEffect(() => { const timer = window.setTimeout(() => void loadQueue(), 250); return () => window.clearTimeout(timer); }, [loadQueue]);

  const restoreCallResult = useCallback(() => {
    const pending = readPending(pendingCallKey);
    if (!pending || pending.prospectId !== selected?.prospect.id) return;
    if (!leftForCall.current && Date.now() - pending.startedAt < 1200) return;
    setResultPanel(true);
    setNotice("You are back in the CRM. Record the broker's call result below.");
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, [selected?.prospect.id]);

  useEffect(() => {
    const visibility = () => {
      if (document.visibilityState === "hidden") { if (readPending(pendingCallKey)) leftForCall.current = true; return; }
      restoreCallResult();
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("focus", restoreCallResult);
    return () => { document.removeEventListener("visibilitychange", visibility); window.removeEventListener("focus", restoreCallResult); };
  }, [restoreCallResult]);

  const refreshSelected = async () => {
    await loadQueue();
    if (selected) setSelected(await fetchMyCPProspect(selected.prospect.id));
  };

  const open = async (id: string) => {
    rememberQueuePosition();
    setBusy(id); setError(""); setNotice("");
    try {
      const detail = await fetchMyCPProspect(id) as CPProspectDetail;
      setSelected(detail);
      setResultPanel(false); setOutcome(""); setInterest(""); setCallbackAt(""); setAgenda(""); setConversationNote("");
      setAreas(detail.prospect.business.areasOfOperation.join(", ")); setSegments(detail.prospect.business.preferredSegments || []);
      const first = detail.templates.find((item) => item.kind === "project") || detail.templates[0];
      setTemplateId(first?.id || ""); setMessage(first ? renderMessage(first, detail.prospect, employee) : "Hi");
      const pendingWhatsApp = readPending(pendingWhatsAppKey);
      setWhatsappInteractionId(pendingWhatsApp?.prospectId === id ? pendingWhatsApp.interactionId || "" : "");
      setWhatsappPanel(pendingWhatsApp?.prospectId === id);
      const pendingCall = readPending(pendingCallKey);
      if (pendingCall?.prospectId === id && Date.now() - pendingCall.startedAt > 1200) setResultPanel(true);
      if (window.matchMedia("(max-width: 1279px)").matches) window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) { fail(reason); }
    finally { setBusy(""); }
  };

  const call = async () => {
    if (!selected) return;
    setBusy("call"); setError(""); leftForCall.current = false;
    try {
      const result = await startCPProspectCall(selected.prospect.id);
      window.localStorage.setItem(pendingCallKey, JSON.stringify({ prospectId: selected.prospect.id, startedAt: Date.now() }));
      setNotice("The dialer is opening. After the call, return here to record the result.");
      window.location.href = `tel:${String(result.dialNumber).replace(/[^+\d]/g, "")}`;
    } catch (reason) { fail(reason); }
    finally { setBusy(""); }
  };

  const saveResult = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setBusy("result"); setError("");
    try {
      await saveBrokerCallResult(selected.prospect.id, {
        outcome,
        projectInterest: outcome === "answered" ? interest : "",
        callbackAt: callbackAt ? new Date(callbackAt).toISOString() : null,
        followUpAgenda: agenda,
        note: conversationNote,
        areasOfOperation: areas.split(",").map((item) => item.trim()).filter(Boolean),
        preferredSegments: segments,
      });
      window.localStorage.removeItem(pendingCallKey);
      setNotice(callbackAt ? "Call result saved and follow-up scheduled." : "Broker call result saved.");
      setResultPanel(false); setOutcome(""); setInterest(""); setCallbackAt(""); setAgenda(""); setConversationNote("");
      await refreshSelected();
    } catch (reason) { fail(reason); }
    finally { setBusy(""); }
  };

  const chooseTemplate = (id: string) => {
    setTemplateId(id);
    const template = selected?.templates.find((item) => item.id === id);
    if (template && selected) setMessage(renderMessage(template, selected.prospect, employee));
  };

  const openWhatsApp = async () => {
    if (!selected || !message) return;
    setBusy("whatsapp"); setError("");
    try {
      const result = await openCPProspectWhatsApp(selected.prospect.id, { templateId, messageBody: message });
      setWhatsappInteractionId(result.interactionId); setWhatsappPanel(true);
      window.localStorage.setItem(pendingWhatsAppKey, JSON.stringify({ prospectId: selected.prospect.id, interactionId: result.interactionId, startedAt: Date.now() }));
      setNotice("WhatsApp opened with the admin message. Press Send there, then confirm it here.");
      window.location.href = result.whatsappUrl;
    } catch (reason) { fail(reason); }
    finally { setBusy(""); }
  };

  const saveWhatsApp = async (result: "sent" | "not_sent") => {
    if (!selected || !whatsappInteractionId) return;
    setBusy("whatsapp-result");
    try {
      await saveCPProspectWhatsAppResult(selected.prospect.id, { outcome: result, interactionId: whatsappInteractionId });
      window.localStorage.removeItem(pendingWhatsAppKey);
      setWhatsappPanel(false); setWhatsappInteractionId(""); setNotice(`WhatsApp marked ${result.replace("_", " ")}.`);
      await refreshSelected();
    } catch (reason) { fail(reason); }
    finally { setBusy(""); }
  };

  const saveWhatsAppNumber = async (whatsappMobile: string) => {
    if (!selected) return;
    setBusy("whatsapp-number"); setError("");
    try {
      const result = await updateCPProspectWhatsAppNumber(selected.prospect.id, whatsappMobile);
      setNotice(result.message);
      await refreshSelected();
    } catch (reason) { fail(reason); throw reason; }
    finally { setBusy(""); }
  };

  const citiesInQueue = useMemo(() => [...new Set(prospects.map((item) => item.address.city).filter(Boolean))].sort(), [prospects]);
  const areasInQueue = useMemo(() => [...new Set(prospects.flatMap((item) => item.business.areasOfOperation || []))].sort(), [prospects]);
  const needsFollowUp = outcome === "callback_requested" || (outcome === "answered" && interest === "interested");
  const needsMarketDetails = outcome === "answered" && interest === "not_interested";
  const resultValid = Boolean(outcome) && (outcome !== "answered" || Boolean(interest)) && (!needsFollowUp || Boolean(callbackAt && agenda.trim())) && (!needsMarketDetails || Boolean(areas.trim() || segments.length));
  const whatsappDisabled = selected?.prospect.verificationStatus === "wrong_number" && !selected.prospect.contact.whatsappMobile;

  return <div className="employee-workspace min-h-[100dvh] bg-[#EFF1F4] text-[#3F3D46] [&_input]:text-base [&_select]:text-base [&_textarea]:text-base sm:[&_input]:text-xs sm:[&_select]:text-xs sm:[&_textarea]:text-xs">
    <EmployeeHeader title="Broker Queue" employee={employee} filters={<><Filter value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })} label="All statuses" options={[["pending", "Pending"], ["active", "Interested"], ["inactive", "Not interested"], ["callback_requested", "Call again"], ["no_answer", "Not picked"], ["busy", "Busy"], ["wrong_number", "Wrong number"]]} /><Filter value={filters.city} onChange={(value) => setFilters({ ...filters, city: value })} label="All cities" options={citiesInQueue.map((item) => [item, item])} /><Filter value={filters.area} onChange={(value) => setFilters({ ...filters, area: value })} label="All areas" options={areasInQueue.map((item) => [item, item])} /><Filter value={filters.propertyType} onChange={(value) => setFilters({ ...filters, propertyType: value })} label="All property types" options={propertyTypes.map((item) => [item, title(item)])} /><Filter value={filters.due} onChange={(value) => setFilters({ ...filters, due: value })} label="All callbacks" options={[["overdue", "Overdue"]]} /></>} />
    <main className="mx-auto max-w-[1500px] space-y-3 px-3 py-3 pb-28 sm:px-4 md:px-6 md:pb-6">
      {error && <Notice tone="error" text={error} dismiss={() => setError("")} />}{notice && <Notice tone="success" text={notice} dismiss={() => setNotice("")} />}
      <div className={`employee-search ${selected ? "hidden xl:block" : "block"}`}><label className="relative block"><Search className="absolute left-3 top-3.5 size-4 text-[#8A8690]" /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} aria-label="Search assigned brokers" type="search" placeholder="Serial no., broker, phone or city" className="h-11 w-full rounded-md border border-[#BCA8D0] bg-white pl-9 pr-3 shadow-sm" /></label></div>
      <div className="employee-contact-layout">
        <div className={selected ? "hidden xl:block" : "block"}><BrokerQueue prospects={prospects} selectedId={selected?.prospect.id} busy={busy} onOpen={open} /></div>
        {selected ? <section className="min-w-0 space-y-5"><button onClick={() => setSelected(null)} className="flex min-h-11 w-full items-center gap-2 rounded-md border border-[#D8DCE2] bg-white px-4 text-xs font-bold text-[#121B35] xl:hidden"><ArrowLeft className="size-4" />Back to assigned brokers</button>
          <section className="rounded-lg border border-[#E4E0E7] bg-white p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><BrokerStatus item={selected.prospect} /><span className="text-[10px] font-bold text-[#805A0B]">Contact #{selected.prospect.sourceRowNumber - 1}</span></div><h2 className="mt-2 break-words text-lg font-bold text-[#121B35] sm:text-xl">{selected.prospect.contact.name || selected.prospect.company.name || "Unnamed broker"}</h2><p className="mt-1 break-words text-xs text-[#68646F]">{selected.prospect.contact.mobile} · {selected.prospect.batch?.name}</p></div><div className="hidden gap-2 md:flex"><button onClick={() => { setResultPanel(true); window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 50); }} className="inline-flex h-11 items-center gap-2 rounded-md border border-[#D8D3DA] px-4 text-xs font-bold text-[#121B35]"><CheckCircle2 className="size-4" />Record result</button><button onClick={() => void call()} disabled={busy === "call"} className="inline-flex h-11 items-center gap-2 rounded-md bg-[#121B35] px-5 text-xs font-bold text-white disabled:opacity-40">{busy === "call" ? <Loader2 className="size-4 animate-spin" /> : <PhoneCall className="size-4" />}Call broker</button></div></div><div className="mt-4 grid gap-2 bg-[#F8F7FA] p-3 text-[11px] sm:grid-cols-3"><span><strong>Calls:</strong> {selected.prospect.callAttempts}</span><span><strong>Last contacted:</strong> {when(selected.prospect.lastContactedAt)}</span><span><strong>Next follow-up:</strong> {when(selected.prospect.nextFollowUpAt)}</span></div></section>
          <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 grid grid-cols-2 gap-2 rounded-md border border-[#D8DCE2] bg-white/95 p-2 shadow-[0_-6px_18px_rgba(11,19,40,0.12)] backdrop-blur md:hidden"><button onClick={() => void call()} disabled={busy === "call"} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#121B35] text-xs font-bold text-white disabled:opacity-40"><PhoneCall className="size-4" />Call</button><button onClick={() => { setResultPanel(true); window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 50); }} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#DDAA42] text-xs font-bold text-[#121B35]"><CheckCircle2 className="size-4" />Result</button></div>
          {resultPanel && <div ref={resultRef}><form onSubmit={(event) => void saveResult(event)} className="scroll-mt-20 rounded-lg border border-[#D7C083] bg-white p-4 sm:p-5"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold text-[#121B35]">Broker call result</h3><p className="mt-1 text-[10px] text-[#68646F]">Save what happened after this call.</p></div><button type="button" onClick={() => setResultPanel(false)} className="grid size-9 place-items-center rounded-md border border-[#D8D3DA]" aria-label="Close result form"><X className="size-4" /></button></div><label className="mt-4 block"><span className="text-[10px] font-bold uppercase text-[#68646F]">Call outcome</span><select required value={outcome} onChange={(event) => { setOutcome(event.target.value as BrokerCallOutcome); setInterest(""); }} className="mt-1 h-11 w-full rounded-md border border-[#D8D3DA] px-3"><option value="">Choose call result</option>{(["answered", "callback_requested", "no_answer", "busy", "wrong_number"] as BrokerCallOutcome[]).map((item) => <option key={item} value={item}>{callLabels[item]}</option>)}</select></label>
            {outcome === "answered" && <fieldset className="mt-4"><legend className="text-[10px] font-bold uppercase text-[#68646F]">Interested in this project?</legend><div className="mt-2 grid grid-cols-2 gap-2"><Choice active={interest === "interested"} onClick={() => setInterest("interested")} label="Interested" /><Choice active={interest === "not_interested"} onClick={() => setInterest("not_interested")} label="Not interested" /></div></fieldset>}
            {needsFollowUp && <div className="mt-4 grid gap-3 md:grid-cols-2"><Field label="Follow-up date and time" type="datetime-local" value={callbackAt} onChange={setCallbackAt} /><TextArea label="What to discuss in follow-up" value={agenda} onChange={setAgenda} placeholder="Project details, pricing, client requirement..." /></div>}
            {needsMarketDetails && <div className="mt-4 rounded-md bg-[#F8F7FA] p-4"><Field label="Working areas (comma separated)" value={areas} onChange={setAreas} placeholder="Whitefield, Sarjapur" /><fieldset className="mt-3"><legend className="text-[10px] font-bold uppercase text-[#68646F]">Property types</legend><div className="mt-2 flex flex-wrap gap-2">{propertyTypes.map((property) => <label key={property} className={`flex h-10 items-center gap-2 rounded-md border px-3 text-[11px] font-bold capitalize ${segments.includes(property) ? "border-[#DDAA42] bg-[#FFF8E8]" : "border-[#D8D3DA] bg-white"}`}><input type="checkbox" checked={segments.includes(property)} onChange={() => setSegments((items) => items.includes(property) ? items.filter((item) => item !== property) : [...items, property])} className="accent-[#DDAA42]" />{property}</label>)}</div></fieldset></div>}
            {outcome && <div className="mt-4"><TextArea label="Conversation note (optional)" value={conversationNote} onChange={setConversationNote} placeholder="Short note about what was discussed" /></div>}
            <button disabled={busy === "result" || !resultValid} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#DDAA42] text-xs font-bold text-[#121B35] disabled:opacity-40">{busy === "result" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Save call result</button></form></div>}
          <section className="rounded-lg border border-[#E4E0E7] bg-white p-4 sm:p-5"><div className="flex items-center gap-2"><MessageCircle className="size-4 text-[#168B52]" /><h3 className="text-sm font-bold text-[#121B35]">WhatsApp project message</h3></div><WhatsAppNumberEditor primaryNumber={selected.prospect.contact.mobile} whatsappNumber={selected.prospect.contact.whatsappMobile} updatedAt={selected.prospect.whatsappUpdatedAt} busy={busy === "whatsapp-number"} onSave={saveWhatsAppNumber} />{selected.templates.length ? <label className="mt-4 block"><span className="text-[10px] font-bold uppercase text-[#68646F]">Admin template</span><select value={templateId} onChange={(event) => chooseTemplate(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-[#D8D3DA] px-3">{selected.templates.map((template) => <option key={template.id} value={template.id}>{template.name} · {template.kind.replace("_", " ")}</option>)}</select></label> : <p className="mt-3 rounded-md bg-[#F8F7FA] p-3 text-xs text-[#68646F]">No admin template is active. WhatsApp will open with the default message: Hi</p>}<label className="mt-3 block"><span className="text-[10px] font-bold uppercase text-[#68646F]">Message preview</span><textarea readOnly value={message || "Hi"} className="mt-1 h-32 w-full resize-y rounded-md border border-[#D8D3DA] bg-[#F8F7FA] p-3 leading-5" /></label><button onClick={() => void openWhatsApp()} disabled={busy === "whatsapp" || !message || whatsappDisabled} className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#168B52] text-xs font-bold text-white disabled:opacity-40">{busy === "whatsapp" ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}Open WhatsApp</button>{whatsappDisabled && <p className="mt-2 text-[10px] text-red-700">Add the broker's correct WhatsApp number above to send a message.</p>}{whatsappPanel && <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs font-bold text-emerald-900">Did you press Send in WhatsApp?</p><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={() => void saveWhatsApp("sent")} disabled={busy === "whatsapp-result"} className="h-10 rounded-md bg-emerald-700 text-[11px] font-bold text-white">Sent</button><button onClick={() => void saveWhatsApp("not_sent")} disabled={busy === "whatsapp-result"} className="h-10 rounded-md bg-white text-[11px] font-bold text-[#3F3D46]">Not sent</button></div></div>}</section>
          <section className="rounded-lg border border-[#E4E0E7] bg-white p-4 sm:p-5"><h3 className="text-sm font-bold text-[#121B35]">Activity history</h3><div className="mt-3 max-h-80 space-y-3 overflow-y-auto">{selected.interactions.map((activity) => <div key={activity.id} className="border-l-2 border-[#DDAA42] pl-3"><strong className="block text-[11px] capitalize text-[#121B35]">{activity.action.replace(/_/g, " ")}{activity.outcome ? ` · ${callLabels[activity.outcome as BrokerCallOutcome] || activity.outcome.replace(/_/g, " ")}` : ""}</strong>{activity.metadata?.projectInterest && <p className="mt-1 text-[10px] font-bold capitalize text-[#3F3D46]">Project: {activity.metadata.projectInterest.replace(/_/g, " ")}</p>}{activity.metadata?.followUpAgenda && <p className="mt-1 text-[10px] text-[#68646F]">Follow-up: {activity.metadata.followUpAgenda}</p>}{activity.note && <p className="mt-1 text-[10px] text-[#68646F]">{activity.note}</p>}{activity.messageBody && <p className="mt-1 line-clamp-2 text-[10px] text-[#68646F]">{activity.messageBody}</p>}<p className="mt-1 text-[9px] text-[#96909A]">{activity.employee?.name || "Employee"} · {when(activity.createdAt)}</p></div>)}{!selected.interactions.length && <p className="text-xs text-[#68646F]">No activity recorded yet.</p>}</div></section>
        </section> : <section className="hidden rounded-lg border border-[#E4E0E7] bg-white py-24 text-center xl:block"><MapPin className="mx-auto size-9 text-[#C9C5CD]" /><p className="mt-3 text-sm text-[#68646F]">Select an assigned broker to begin.</p></section>}
      </div>
    </main>
    <EmployeeWorkspaceNav active="brokers" />
  </div>;
}

function renderMessage(template: CRMTemplate, prospect: CPProspect, employee: CRMEmployee | null) {
  const materialLinks = template.attachments.map((item) => `${item.title}: ${item.url}`).join("\n");
  const brokerName = prospect.contact.name || prospect.company.name || "there";
  const replacements: Record<string, string> = { cp_name: brokerName, broker_name: brokerName, company_name: prospect.company.name || brokerName, project_name: template.projectName, employee_name: employee?.name || "ClearTitle One", material_links: materialLinks };
  let output = template.body;
  Object.entries(replacements).forEach(([key, value]) => { output = output.replace(new RegExp(`{{\\s*${key}\\s*}}`, "gi"), value); });
  if (materialLinks && !template.body.includes("{{material_links}}")) output = `${output}\n\n${materialLinks}`;
  return output.trim();
}

function BrokerQueue({ prospects, selectedId, busy, onOpen }: { prospects: CPProspect[]; selectedId?: string; busy: string; onOpen: (id: string) => Promise<void> }) {
  return <section className="employee-queue overflow-hidden rounded-lg border border-[#E4E0E7] bg-white"><div className="border-b border-[#E4E0E7] px-4 py-3"><h2 className="text-xs font-bold text-[#121B35]">Assigned brokers <span className="font-normal text-[#68646F]">({prospects.length})</span></h2></div><div className="employee-queue-scroll divide-y divide-[#F0EDF1]">{prospects.map((item) => <button key={item.id} onClick={() => void onOpen(item.id)} className={`block w-full p-4 text-left ${selectedId === item.id ? "bg-[#FFF8E8]" : "hover:bg-[#FAF9FA]"}`}><div className="flex items-start justify-between gap-2"><div className="flex min-w-0 gap-2"><span className="shrink-0 text-[10px] font-bold text-[#805A0B]">#{item.sourceRowNumber - 1}</span><div className="min-w-0"><strong className="block truncate text-[12px] text-[#121B35]">{item.contact.name || item.company.name || "Unnamed broker"}</strong><span className="mt-1 block text-[10px] text-[#68646F]">{item.contact.mobile}</span></div></div>{busy === item.id ? <Loader2 className="size-4 animate-spin" /> : <BrokerStatus item={item} compact />}</div><p className="mt-2 flex items-center gap-1 text-[10px] text-[#68646F]"><MapPin className="size-3" />{item.business.areasOfOperation[0] || item.address.city || "Area not collected"}</p>{item.nextFollowUpAt && <p className="mt-1 text-[9px] font-bold text-amber-800">Follow-up: {when(item.nextFollowUpAt)}</p>}</button>)}{!prospects.length && <p className="p-10 text-center text-xs text-[#68646F]">No assigned brokers match these filters.</p>}</div></section>;
}

function BrokerStatus({ item, compact = false }: { item: CPProspect; compact?: boolean }) {
  const label = item.broker.projectInterest === "interested" ? "Interested" : item.broker.projectInterest === "not_interested" ? "Not interested" : item.broker.lastCallOutcome ? callLabels[item.broker.lastCallOutcome] : verificationLabels[item.verificationStatus];
  const positive = item.broker.projectInterest === "interested";
  const warning = item.broker.lastCallOutcome === "callback_requested";
  const negative = item.broker.projectInterest === "not_interested" || item.broker.lastCallOutcome === "wrong_number";
  return <span className={`inline-flex shrink-0 rounded px-2 py-1 font-bold ${compact ? "text-[9px]" : "text-[10px]"} ${positive ? "bg-emerald-50 text-emerald-700" : warning ? "bg-amber-50 text-amber-800" : negative ? "bg-red-50 text-red-700" : "bg-[#F1F4FA] text-[#273559]"}`}>{label}</span>;
}

function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) { return <button type="button" onClick={onClick} className={`h-11 rounded-md border text-xs font-bold ${active ? "border-[#DDAA42] bg-[#FFF8E8] text-[#805A0B]" : "border-[#D8D3DA] bg-white text-[#3F3D46]"}`}>{label}</button>; }
function Field({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) { return <label className="block"><span className="text-[10px] font-bold uppercase text-[#68646F]">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-11 w-full rounded-md border border-[#D8D3DA] px-3" /></label>; }
function TextArea({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) { return <label className="block"><span className="text-[10px] font-bold uppercase text-[#68646F]">{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1 h-24 w-full resize-y rounded-md border border-[#D8D3DA] p-3" /></label>; }
function Filter({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: string[][] }) { return <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className="h-11 w-full min-w-0 rounded-md border border-[#D8D3DA] px-2 sm:h-10"><option value="">{label}</option>{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}</select>; }
function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof LayoutList }) { return <div className="bg-white p-4"><div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase text-[#68646F]">{label}</span><Icon className="size-4 text-[#9A7427]" /></div><strong className="mt-1 block text-2xl text-[#121B35]">{value}</strong></div>; }
function Notice({ tone, text, dismiss }: { tone: "error" | "success"; text: string; dismiss: () => void }) { const Icon = tone === "error" ? AlertCircle : CheckCircle2; return <div role={tone === "error" ? "alert" : "status"} className={`flex items-start justify-between gap-3 rounded-md border p-3 text-xs ${tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}><span className="flex gap-2"><Icon className="size-4 shrink-0" />{text}</span><button onClick={dismiss} aria-label="Dismiss"><X className="size-4" /></button></div>; }
