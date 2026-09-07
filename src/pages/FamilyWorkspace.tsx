import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, Download, Loader2, MessageCircle, MessagesSquare, Save, Send, Trash2, Users } from "lucide-react";
import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import Image from "@/components/Image";
import Link from "@/components/Link";
import {
  fetchDecisionWorkspace,
  fetchDecisionWorkspaceMessages,
  fetchDecisionWorkspaceSummary,
  deleteDecisionWorkspaceMessage,
  removeDecisionWorkspaceProperty,
  sendDecisionWorkspaceMessage,
  updateDecisionWorkspaceProperty,
  voteInDecisionWorkspace,
  type DecisionWorkspaceMessage,
} from "@/lib/api";
import { getParticipantId, getStoredWorkspace, workspaceHref } from "@/lib/decisionWorkspace";
import type { Property } from "@/components/acres/mock-data";

type WorkspaceItem = {
  property: Property;
  note: string;
  questions: string[];
  votes: Array<{ participantId: string; nickname: string; vote: "prefer" | "maybe" | "not_preferred" }>;
};
type Workspace = { id: string; title: string; role: "owner" | "contributor"; expiresAt: string; updatedAt: string; items: WorkspaceItem[] };
const voteOptions = [{ value: "prefer", label: "Prefer" }, { value: "maybe", label: "Maybe" }, { value: "not_preferred", label: "Not preferred" }] as const;
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character] || character));

export default function FamilyWorkspace() {
  const { id = "" } = useParams();
  const stored = getStoredWorkspace();
  const fragment = typeof window === "undefined" ? "" : decodeURIComponent(window.location.hash.slice(1));
  const token = fragment || (stored?.id === id ? stored.ownerToken : "");
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [nickname, setNickname] = useState(() => typeof window === "undefined" ? "" : localStorage.getItem("cleartitle_family_nickname") || "");
  const [drafts, setDrafts] = useState<Record<string, { note: string; questions: string }>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<DecisionWorkspaceMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [chatPropertyId, setChatPropertyId] = useState("");
  const [chatLoading, setChatLoading] = useState(true);
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatCursor = useRef("");
  const chatEnd = useRef<HTMLDivElement | null>(null);
  const participantId = useMemo(() => getParticipantId(), []);

  const load = async () => {
    if (!id || !token) { setError("This workspace link is missing its secure access token."); setLoading(false); return; }
    try {
      const data = await fetchDecisionWorkspace(id, token);
      setWorkspace(data.workspace as Workspace);
      setDrafts(Object.fromEntries((data.workspace.items || []).map((item: WorkspaceItem) => [item.property.id, { note: item.note || "", questions: (item.questions || []).join("\n") }])));
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load workspace"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [id, token]);

  useEffect(() => {
    if (!id || !token) return;
    let active = true;
    const merge = (incoming: DecisionWorkspaceMessage[]) => setMessages((current) => {
      const byId = new Map(current.map((message) => [message.id, message]));
      incoming.forEach((message) => byId.set(message.id, message));
      return [...byId.values()].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
    });
    const refreshChat = async (initial = false) => {
      if (!initial && document.visibilityState === "hidden") return;
      try {
        const data = await fetchDecisionWorkspaceMessages(id, token, participantId, initial ? "" : chatCursor.current);
        if (!active) return;
        if (initial) setMessages(data.messages || []); else merge(data.messages || []);
        chatCursor.current = data.cursor || chatCursor.current;
        setChatError("");
      } catch (loadError) {
        if (active) setChatError(loadError instanceof Error ? loadError.message : "Unable to refresh family chat");
      } finally { if (active && initial) setChatLoading(false); }
    };
    void refreshChat(true);
    const timer = window.setInterval(() => void refreshChat(false), 20_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [id, token, participantId]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages.length]);

  const shareToken = workspace?.role === "owner" && stored?.id === id ? stored.shareToken : token;
  const shareUrl = typeof window === "undefined" || !workspace ? "" : `${window.location.origin}${workspaceHref(workspace.id, shareToken)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Review our home shortlist: ${shareUrl}`)}`;

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nickname.trim()) { setChatError("Enter your family nickname before sending a message."); return; }
    if (!chatText.trim()) return;
    setChatSending(true); setChatError("");
    try {
      localStorage.setItem("cleartitle_family_nickname", nickname.trim());
      const data = await sendDecisionWorkspaceMessage(id, token, participantId, { nickname: nickname.trim(), message: chatText.trim(), propertyId: chatPropertyId || undefined });
      setMessages((current) => [...current.filter((message) => message.id !== data.message.id), data.message]);
      setChatText("");
    } catch (sendError) { setChatError(sendError instanceof Error ? sendError.message : "Unable to send family message"); }
    finally { setChatSending(false); }
  };

  const deleteMessage = async (messageId: string) => {
    setChatError("");
    try {
      const data = await deleteDecisionWorkspaceMessage(id, token, participantId, messageId);
      setMessages((current) => current.map((message) => message.id === messageId ? data.message : message));
    } catch (deleteError) { setChatError(deleteError instanceof Error ? deleteError.message : "Unable to remove family message"); }
  };

  const saveNotes = async (item: WorkspaceItem) => {
    const draft = drafts[item.property.id]; if (!draft) return;
    setSavingId(item.property.id); setError("");
    try {
      const data = await updateDecisionWorkspaceProperty(id, token, item.property.id, { note: draft.note, questions: draft.questions.split("\n").map((value) => value.trim()).filter(Boolean) });
      setWorkspace(data.workspace as Workspace);
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save notes"); }
    finally { setSavingId(""); }
  };

  const vote = async (item: WorkspaceItem, value: "prefer" | "maybe" | "not_preferred") => {
    if (!nickname.trim()) { setError("Enter your nickname before voting."); return; }
    localStorage.setItem("cleartitle_family_nickname", nickname.trim());
    setSavingId(item.property.id); setError("");
    try { const data = await voteInDecisionWorkspace(id, token, item.property.id, { participantId, nickname: nickname.trim(), vote: value }); setWorkspace(data.workspace as Workspace); }
    catch (voteError) { setError(voteError instanceof Error ? voteError.message : "Unable to save vote"); }
    finally { setSavingId(""); }
  };

  const remove = async (propertyId: string) => {
    setSavingId(propertyId);
    try { const data = await removeDecisionWorkspaceProperty(id, token, propertyId); setWorkspace(data.workspace as Workspace); }
    catch (removeError) { setError(removeError instanceof Error ? removeError.message : "Unable to remove property"); }
    finally { setSavingId(""); }
  };

  const download = async () => {
    try {
      const data = await fetchDecisionWorkspaceSummary(id, token);
      const summary = data.summary;
      const rows = summary.properties.map((property: Record<string, unknown>) => `<section><h2>${escapeHtml(property.title)}</h2><p><b>Builder:</b> ${escapeHtml(property.builder || "Missing")}</p><p><b>Location:</b> ${escapeHtml(property.location || "Missing")}</p><p><b>Price:</b> ${escapeHtml(property.price || "Missing")}</p><p><b>Possession:</b> ${escapeHtml(property.possession || "Missing")}</p><p><b>Notes:</b> ${escapeHtml(property.note || "")}</p><p><b>Site-visit questions:</b> ${escapeHtml((property.questions as string[] || []).join("; "))}</p></section>`).join("");
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(summary.title)}</title><style>body{font:15px/1.6 Arial;max-width:850px;margin:40px auto;color:#172039}section{border-top:1px solid #ddd;padding:18px 0}small{color:#666}</style></head><body><h1>${escapeHtml(summary.title)}</h1><small>Generated ${escapeHtml(new Date(summary.generatedAt).toLocaleString("en-IN"))}</small>${rows}</body></html>`;
      const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "family-property-comparison.html"; anchor.click(); URL.revokeObjectURL(url);
    } catch (downloadError) { setError(downloadError instanceof Error ? downloadError.message : "Unable to download summary"); }
  };

  return <div className="public-page-shell"><Header /><main className="public-container py-10">
    {loading ? <div className="grid min-h-[55vh] place-items-center"><Loader2 className="size-7 animate-spin text-[#B98428]" /></div> : error && !workspace ? <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center"><h1 className="text-xl font-bold text-[#172039]">Workspace unavailable</h1><p className="mt-2 text-sm text-red-700">{error}</p><Link href="/find-my-home" className="mt-5 inline-block rounded-lg bg-[#DDAA42] px-4 py-2 text-sm font-bold text-[#172039]">Start a new shortlist</Link></div> : workspace && <>
      <header className="flex flex-col gap-5 border-b border-[#DED8CE] pb-8 md:flex-row md:items-end md:justify-between"><div><p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.17em] text-[#805A0B]"><Users className="size-4" />Family decision workspace</p><h1 className="display-heading mt-2 text-[38px] text-[#172039] md:text-[48px]">{workspace.title}</h1><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#68646F]">Compare up to three projects. Notes, votes and discussion remain accessible only through this secure workspace link.</p></div><div className="flex flex-wrap gap-2"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="public-interactive inline-flex items-center gap-2 rounded-xl bg-[#1E7D4B] px-4 py-3 text-[12px] font-bold text-white"><MessageCircle className="size-4" />Share privately</a><button onClick={() => void download()} className="public-interactive inline-flex items-center gap-2 rounded-xl border border-[#CFC6B7] bg-white px-4 py-3 text-[12px] font-bold text-[#172039]"><Download className="size-4" />Download summary</button></div></header>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] font-semibold text-red-700">{error}</p>}
      <section className="mt-6 rounded-2xl border border-[#DED8CE] bg-white p-4"><label className="text-[11px] font-bold text-[#4D5564]">Your family nickname<input value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="e.g. Anu" className="ml-3 h-10 rounded-lg border border-[#DED8CE] px-3 text-[12px] outline-none focus:border-[#DDAA42]" /></label><p className="mt-2 text-[10px] text-[#77717E]">A nickname identifies your vote inside this workspace. No phone number is required.</p></section>
      <section className="mt-6 overflow-hidden rounded-[22px] border border-[#D7D0C4] bg-white shadow-[0_16px_46px_rgba(23,32,57,.07)]" aria-labelledby="family-chat-title">
        <header className="flex flex-col gap-2 border-b border-[#E7E1D7] bg-[#172039] px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#E0AF46] text-[#172039]"><MessagesSquare className="size-5" /></span><div><h2 id="family-chat-title" className="text-[17px] font-extrabold tracking-[-.02em]">Family discussion</h2><p className="mt-0.5 text-[11px] text-white/70">Only people holding this workspace link can read and send messages.</p></div></div><span className="text-[10px] font-semibold text-white/60">Messages expire with this workspace</span></header>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 border-b border-[#E7E1D7] lg:border-b-0 lg:border-r">
            <div className="h-[360px] overflow-y-auto bg-[#F7F4ED] px-4 py-5" aria-live="polite">
              {chatLoading ? <div className="grid h-full place-items-center"><div className="text-center"><Loader2 className="mx-auto size-5 animate-spin text-[#A87416]" /><p className="mt-2 text-[10px] text-[#77717E]">Loading family discussion…</p></div></div> : messages.length === 0 ? <div className="grid h-full place-items-center"><div className="max-w-xs text-center"><MessageCircle className="mx-auto size-7 text-[#C4BBAE]" /><p className="mt-3 text-[12px] font-bold text-[#4D5564]">Start the family discussion</p><p className="mt-1 text-[10px] leading-4 text-[#837C72]">Share what you like, what concerns you, or what the family should verify during the site visit.</p></div></div> : <div className="space-y-3">{messages.map((message) => <article key={message.id} className={`group flex ${message.isMine ? "justify-end" : "justify-start"}`}><div className={`max-w-[86%] sm:max-w-[72%] ${message.isMine ? "items-end" : "items-start"}`}><div className={`flex items-center gap-2 px-1 ${message.isMine ? "justify-end" : "justify-start"}`}><span className="text-[9px] font-bold text-[#625C64]">{message.isMine ? "You" : message.nickname}</span><time className="text-[8px] text-[#969087]">{new Date(message.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</time></div><div className={`mt-1 rounded-2xl px-3.5 py-2.5 ${message.deletedAt ? "border border-dashed border-[#CEC7BC] bg-transparent text-[#8D867C]" : message.isMine ? "rounded-br-md bg-[#172039] text-white" : "rounded-bl-md bg-white text-[#30394D] shadow-[0_4px_14px_rgba(23,32,57,.06)]"}`}>
                  {message.propertyTitle && !message.deletedAt && <p className={`mb-1.5 text-[8px] font-bold uppercase tracking-[.1em] ${message.isMine ? "text-[#E7B957]" : "text-[#9A6B18]"}`}>{message.propertyTitle}</p>}
                  <p className={`whitespace-pre-wrap break-words text-[11px] leading-5 ${message.deletedAt ? "italic" : ""}`}>{message.deletedAt ? "Message removed" : message.message}</p>
                </div>{message.canDelete && <button type="button" onClick={() => void deleteMessage(message.id)} className="mt-1 inline-flex items-center gap-1 px-1 text-[8px] font-semibold text-[#8A838B] opacity-100 transition hover:text-red-700 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"><Trash2 className="size-3" />Remove</button>}</div></article>)}<div ref={chatEnd} /></div>}
            </div>
            {chatError && <p role="alert" className="border-t border-red-100 bg-red-50 px-4 py-2 text-[10px] font-semibold text-red-700">{chatError}</p>}
          </div>
          <form onSubmit={(event) => void sendMessage(event)} className="flex flex-col p-4"><div><label className="text-[9px] font-bold uppercase tracking-[.1em] text-[#746D76]" htmlFor="chat-project">Discussing</label><select id="chat-project" value={chatPropertyId} onChange={(event) => setChatPropertyId(event.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-[#DED8CE] bg-white px-3 text-[10px] font-semibold text-[#30394D] outline-none focus:border-[#DDAA42]"><option value="">Whole shortlist</option>{workspace.items.map((item) => <option key={item.property.id} value={item.property.id}>{item.property.title}</option>)}</select></div><label className="mt-4 text-[9px] font-bold uppercase tracking-[.1em] text-[#746D76]" htmlFor="family-chat-message">Message</label><textarea id="family-chat-message" value={chatText} onChange={(event) => setChatText(event.target.value.slice(0, 1500))} rows={7} placeholder={nickname.trim() ? `Write as ${nickname.trim()}…` : "Enter your nickname above first"} className="mt-1.5 min-h-32 flex-1 resize-y rounded-xl border border-[#DED8CE] bg-[#FBFAF7] p-3 text-[11px] leading-5 text-[#30394D] outline-none transition focus:border-[#DDAA42] focus:bg-white focus:ring-2 focus:ring-[#DDAA42]/10" /><div className="mt-2 flex items-center justify-between"><span className="text-[8px] tabular-nums text-[#969087]">{chatText.length}/1500</span><button type="submit" disabled={chatSending || !nickname.trim() || !chatText.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#DDAA42] px-4 py-2.5 text-[10px] font-bold text-[#172039] transition hover:bg-[#E6B94F] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45">{chatSending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}Send</button></div><p className="mt-4 text-[8px] leading-3 text-[#8B8590]">Anyone with the secure family link can participate. Do not post financial account numbers, passwords or identity documents.</p></form>
        </div>
      </section>
      {workspace.items.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[#CFC6B7] bg-white p-12 text-center"><h2 className="text-lg font-bold text-[#172039]">Your comparison is empty</h2><Link href="/find-my-home" className="mt-4 inline-block rounded-lg bg-[#DDAA42] px-4 py-2 text-sm font-bold text-[#172039]">Find matching homes</Link></div> : <div className="mt-6 grid gap-4 xl:grid-cols-3">{workspace.items.map((item) => { const image = item.property.heroImages?.[0] || item.property.image; const myVote = item.votes.find((entry) => entry.participantId === participantId)?.vote; return <article key={item.property.id} className="overflow-hidden rounded-2xl border border-[#DED8CE] bg-white shadow-[0_10px_30px_rgba(23,32,57,.05)]"><div className="relative h-44 bg-[#E9E4DA]">{image && <Image src={image} alt={item.property.title} fill className="object-cover" />}<button disabled={savingId === item.property.id} onClick={() => void remove(item.property.id)} aria-label={`Remove ${item.property.title}`} className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg bg-white/90 text-red-700 shadow"><Trash2 className="size-4" /></button></div><div className="p-4"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-[#A87416]">{item.property.builder || "Builder missing"}</p><h2 className="mt-1 text-[18px] font-extrabold text-[#172039]">{item.property.title}</h2><p className="mt-1 text-[11px] text-[#68646F]">{item.property.subtitle}</p><dl className="mt-4 grid grid-cols-2 gap-2 text-[10px]"><div className="rounded-lg bg-[#F8F6F1] p-2.5"><dt className="text-[#77717E]">Price</dt><dd className="mt-1 font-bold text-[#172039]">{item.property.price || "Missing"}</dd></div><div className="rounded-lg bg-[#F8F6F1] p-2.5"><dt className="text-[#77717E]">Configurations</dt><dd className="mt-1 font-bold text-[#172039]">{item.property.configs?.join(", ") || "Missing"}</dd></div><div className="rounded-lg bg-[#F8F6F1] p-2.5"><dt className="text-[#77717E]">RERA phases</dt><dd className="mt-1 font-bold text-[#172039]">{item.property.reraPhases?.length || 0}</dd></div><div className="rounded-lg bg-[#F8F6F1] p-2.5"><dt className="text-[#77717E]">Possession</dt><dd className="mt-1 font-bold text-[#172039]">{item.property.possessionDetails?.expectedCompletionDate || item.property.possession || "Missing"}</dd></div></dl>
              <div className="mt-4"><p className="text-[10px] font-bold text-[#4D5564]">Family vote</p><div className="mt-2 grid grid-cols-3 gap-1.5">{voteOptions.map((option) => <button key={option.value} disabled={savingId === item.property.id} onClick={() => void vote(item, option.value)} className={`rounded-lg border px-1 py-2 text-[9px] font-bold ${myVote === option.value ? "border-[#DDAA42] bg-[#FFF0C9] text-[#704B00]" : "border-[#DED8CE] text-[#68646F]"}`}>{myVote === option.value && <Check className="mr-1 inline size-3" />}{option.label}</button>)}</div><p className="mt-2 text-[9px] text-[#77717E]">{item.votes.length ? item.votes.map((entry) => `${entry.nickname}: ${entry.vote.replace("_", " ")}`).join(" · ") : "No family votes yet"}</p></div>
              <label className="mt-4 block text-[10px] font-bold text-[#4D5564]">Private workspace note<textarea rows={3} value={drafts[item.property.id]?.note || ""} onChange={(event) => setDrafts({ ...drafts, [item.property.id]: { ...drafts[item.property.id], note: event.target.value } })} className="mt-1.5 w-full resize-y rounded-lg border border-[#DED8CE] p-2.5 text-[11px] font-normal outline-none focus:border-[#DDAA42]" /></label>
              <label className="mt-3 block text-[10px] font-bold text-[#4D5564]">Site-visit questions <span className="font-normal">(one per line)</span><textarea rows={4} value={drafts[item.property.id]?.questions || ""} onChange={(event) => setDrafts({ ...drafts, [item.property.id]: { ...drafts[item.property.id], questions: event.target.value } })} className="mt-1.5 w-full resize-y rounded-lg border border-[#DED8CE] p-2.5 text-[11px] font-normal outline-none focus:border-[#DDAA42]" /></label>
              <div className="mt-3 grid grid-cols-2 gap-2"><Link href={`/property/${item.property.id}`} className="rounded-lg border border-[#CFC6B7] px-3 py-2 text-center text-[10px] font-bold text-[#172039]">Open project</Link><button disabled={savingId === item.property.id} onClick={() => void saveNotes(item)} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#172039] px-3 py-2 text-[10px] font-bold text-white"><Save className="size-3.5" />{savingId === item.property.id ? "Saving…" : "Save notes"}</button></div>
            </div></article>; })}</div>}
    </>}
  </main><Footer /></div>;
}
