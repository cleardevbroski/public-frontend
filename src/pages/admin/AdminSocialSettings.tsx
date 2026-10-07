import { useEffect, useState } from "react";
import { Check, Globe2, Save } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAdminSocialAccounts, saveAdminSocialAccounts, SOCIAL_KEYS, SOCIAL_LABELS } from "@/lib/socialStore";
import type { SocialAccounts } from "@/lib/api";

const input = "mt-1 h-11 w-full rounded-xl border border-[#E4E0E7] bg-white px-3 text-[12px] text-[#121B35] outline-none focus:border-[#DDAA42]";
export default function AdminSocialSettings() {
  const [accounts, setAccounts] = useState<SocialAccounts | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const load = () => setAccounts({ ...getAdminSocialAccounts() });
    load();
    window.addEventListener("cleartitle:social-changed", load);
    return () => window.removeEventListener("cleartitle:social-changed", load);
  }, []);
  const update = (key: keyof SocialAccounts, patch: Partial<SocialAccounts[keyof SocialAccounts]>) => setAccounts((current) => current ? { ...current, [key]: { ...current[key], ...patch } } : current);
  const save = async () => {
    if (!accounts) return;
    setBusy(true); setMessage(""); setError("");
    try { const next = await saveAdminSocialAccounts(accounts); setAccounts(next); setMessage("Social accounts saved."); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save social accounts"); }
    finally { setBusy(false); }
  };
  return <AdminLayout><div className="mb-6 flex items-end justify-between gap-3"><div><p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#B98428]"><Globe2 className="size-4" />Website settings</p><h1 className="mt-1 text-[28px] font-bold text-[#121B35]">Social Accounts</h1><p className="mt-1 text-[13px] text-[#68646F]">Control the social links shown in the public footer, mobile menu, and support area.</p></div><button type="button" onClick={() => void save()} disabled={busy || !accounts} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#DDAA42] px-4 text-[12px] font-bold text-[#121B35] disabled:opacity-50"><Save className="size-4" />Save</button></div>
    {message && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[12px] font-semibold text-emerald-800">{message}</p>}{error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] font-semibold text-red-700">{error}</p>}
    {!accounts ? <div className="rounded-2xl bg-white p-12 text-center text-sm text-[#68646F]">Loading social settings…</div> : <section className="rounded-2xl border border-[#E4E0E7] bg-white p-5 shadow-sm"><div className="grid gap-4 sm:grid-cols-2">{SOCIAL_KEYS.map((key) => <div key={key} className="rounded-xl border border-[#E4E0E7] p-4"><div className="flex items-center justify-between gap-3"><h2 className="text-[13px] font-bold text-[#121B35]">{SOCIAL_LABELS[key]}</h2><button type="button" onClick={() => update(key, { enabled: !accounts[key].enabled })} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${accounts[key].enabled ? "bg-emerald-50 text-emerald-700" : "bg-[#F3F1F5] text-[#68646F]"}`}>{accounts[key].enabled && <Check className="size-3" />}{accounts[key].enabled ? "Enabled" : "Disabled"}</button></div><input type="url" value={accounts[key].url} onChange={(event) => update(key, { url: event.target.value })} placeholder={`Paste ${SOCIAL_LABELS[key]} profile URL`} className={input} /></div>)}</div></section>}
  </AdminLayout>;
}
