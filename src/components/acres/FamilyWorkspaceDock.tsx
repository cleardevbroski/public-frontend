import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronDown, MessagesSquare, UsersRound, Vote } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "@/components/Link";
import { getStoredWorkspace, workspaceHref, type StoredWorkspace } from "@/lib/decisionWorkspace";

const benefits: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Check, label: "Compare up to three shortlisted homes" },
  { icon: Vote, label: "See who prefers, may consider or rejects each home" },
  { icon: MessagesSquare, label: "Discuss projects in a private family chat" },
];

export default function FamilyWorkspaceDock() {
  const [workspace, setWorkspace] = useState<StoredWorkspace | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const stored = getStoredWorkspace();
      setWorkspace(stored && new Date(stored.expiresAt).getTime() > Date.now() ? stored : null);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("cleartitle:family-workspace-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cleartitle:family-workspace-changed", sync);
    };
  }, []);

  const destination = workspace ? workspaceHref(workspace.id, workspace.ownerToken) : "/find-my-home";

  return <aside className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 lg:bottom-5 lg:right-5" aria-label="Family home decision workspace">
    {open && <div className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[22px] border border-[#D9D1C4] bg-[#FBF9F4] shadow-[0_22px_60px_rgba(11,19,40,.22)]">
      <div className="relative overflow-hidden bg-[#172039] px-5 pb-5 pt-4 text-white"><div className="absolute -right-9 -top-9 size-28 rounded-full border border-[#E2B757]/25" /><div className="relative flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#DDAA42] text-[#172039]"><UsersRound className="size-5" /></span><button type="button" onClick={() => setOpen(false)} aria-label="Close family workspace explanation" className="grid size-8 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"><ChevronDown className="size-4" /></button></div><h2 className="relative mt-4 text-[20px] font-extrabold tracking-[-.03em]">Decide on a home together</h2><p className="relative mt-1 max-w-[34ch] text-[11px] leading-5 text-white/70">Keep the family&apos;s property discussion, votes and questions together instead of losing them across different chats.</p></div>
      <div className="p-4"><div className="space-y-2.5">{benefits.map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-2.5"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#EEE8DB] text-[#805A0B]"><Icon className="size-3.5" /></span><p className="text-[11px] font-semibold leading-5 text-[#4D5564]">{label}</p></div>)}</div><Link href={destination} onClick={() => setOpen(false)} className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#DDAA42] px-4 py-3 text-[12px] font-extrabold text-[#172039] transition hover:bg-[#E5B74D] active:scale-[.99]"><span>{workspace ? "Open our family workspace" : "Find homes to compare"}</span><ArrowRight className="size-4" /></Link><p className="mt-2 text-center text-[10px] leading-4 text-[#68646F]">Access stays with people who have the secure family link.</p></div>
    </div>}
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="group inline-flex h-13 items-center gap-2.5 rounded-2xl border border-[#DDAA42]/60 bg-[#172039] px-3.5 text-white shadow-[0_14px_38px_rgba(11,19,40,.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#202B48] active:translate-y-0 active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-[#DDAA42] focus:ring-offset-2"><span className="relative grid size-7 place-items-center rounded-lg bg-[#DDAA42] text-[#172039]"><UsersRound className="size-4" />{workspace && <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-[#172039] bg-emerald-400" />}</span><span className="text-left"><span className="block text-[11px] font-extrabold leading-4">{workspace ? "Family workspace" : "Decide together"}</span><span className="hidden text-[9px] leading-3 text-white/60 sm:block">Compare · vote · chat</span></span></button>
  </aside>;
}
