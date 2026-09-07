import { useEffect, useMemo, useState } from "react";
import { Calculator, Check, Edit3, Plus, Save, ToggleLeft } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  createAffordabilityRule,
  deactivateAffordabilityRule,
  fetchAffordabilityRules,
  fetchAffordabilitySettings,
  saveAffordabilitySettings,
  updateAffordabilityRule,
  type AffordabilityRule,
  type AffordabilitySettings,
} from "@/lib/api";

const propertyTypes = ["Apartment", "Villa", "Plot", "Commercial"];
const inputClass = "w-full rounded-xl border border-[#E4E0E7] bg-white px-3 py-2.5 text-[12px] text-[#121B35] outline-none focus:border-[#DDAA42]";
const emptyRule = (): AffordabilityRule => ({
  name: "", code: "", state: "Karnataka", city: "", propertyTypes: [], possessionStatuses: [],
  calculationType: "percentage", basis: "base_price", rate: 0, fixedAmount: 0, slabs: [],
  minPropertyValue: 0, maxPropertyValue: null, effectiveFrom: new Date().toISOString().slice(0, 10), effectiveTo: null,
  sourceLabel: "", sourceUrl: "", notes: "", priority: 100, active: true,
});

export default function AdminAffordabilityRules() {
  const [settings, setSettings] = useState<AffordabilitySettings | null>(null);
  const [rules, setRules] = useState<AffordabilityRule[]>([]);
  const [draft, setDraft] = useState<AffordabilityRule>(emptyRule());
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [nextSettings, nextRules] = await Promise.all([fetchAffordabilitySettings(), fetchAffordabilityRules()]);
      setSettings(nextSettings); setRules(nextRules);
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Unable to load affordability rules"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const activeCount = useMemo(() => rules.filter((rule) => rule.active).length, [rules]);
  const togglePropertyType = (propertyType: string) => setDraft((current) => ({ ...current, propertyTypes: current.propertyTypes.includes(propertyType) ? current.propertyTypes.filter((value) => value !== propertyType) : [...current.propertyTypes, propertyType] }));

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true); setError(""); setMessage("");
    try { const data = await saveAffordabilitySettings(settings); setSettings(data.settings); setMessage("Affordability assumptions saved."); }
    catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save assumptions"); }
    finally { setSaving(false); }
  };

  const saveRule = async () => {
    setSaving(true); setError(""); setMessage("");
    try {
      const payload = { ...draft, code: draft.code || draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "_") };
      if (editingId) await updateAffordabilityRule(editingId, payload);
      else await createAffordabilityRule(payload);
      setDraft(emptyRule()); setEditingId(""); setMessage(editingId ? "Rule updated." : "Rule created."); await load();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save rule"); }
    finally { setSaving(false); }
  };

  const edit = (rule: AffordabilityRule) => {
    setEditingId(String(rule._id || rule.id || ""));
    setDraft({ ...rule, effectiveFrom: String(rule.effectiveFrom).slice(0, 10), effectiveTo: rule.effectiveTo ? String(rule.effectiveTo).slice(0, 10) : null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <AdminLayout>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#B98428]"><Calculator className="size-4" />Buyer affordability</p><h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#121B35]">Affordability Rules</h1><p className="mt-1 max-w-3xl text-[13px] text-[#68646F]">Control government percentages, fixed charges and buyer-planning assumptions without changing application code.</p></div><div className="rounded-xl bg-[#121B35] px-4 py-3 text-white"><p className="text-[10px] text-white/60">Active rules</p><p className="text-xl font-bold tabular-nums">{activeCount}</p></div></div>
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] font-semibold text-red-700">{error}</p>}
    {message && <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[12px] font-semibold text-emerald-800">{message}</p>}
    {loading ? <div className="rounded-2xl bg-white p-12 text-center text-sm text-[#68646F]">Loading affordability rules…</div> : <div className="space-y-6">
      {settings && <section className="rounded-2xl border border-[#E4E0E7] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-[16px] font-bold text-[#121B35]">Planning assumptions</h2><p className="mt-1 text-[11px] text-[#68646F]">Used by Find My Home and the complete affordability calculator. Customers can see these assumptions.</p></div><button disabled={saving} onClick={() => void saveSettings()} className="inline-flex items-center gap-1.5 rounded-lg bg-[#121B35] px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50"><Save className="size-3.5" />Save</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-[10px] font-bold text-[#68646F]">Interest rate (%)<input type="number" step="0.01" min="0" max="50" value={settings.defaultInterestRate} onChange={(event) => setSettings({ ...settings, defaultInterestRate: Number(event.target.value) })} className={`${inputClass} mt-1`} /></label>
        <label className="text-[10px] font-bold text-[#68646F]">Tenure (years)<input type="number" min="1" max="40" value={settings.defaultTenureYears} onChange={(event) => setSettings({ ...settings, defaultTenureYears: Number(event.target.value) })} className={`${inputClass} mt-1`} /></label>
        <label className="text-[10px] font-bold text-[#68646F]">Income ratio minimum (%)<input type="number" min="5" max="90" value={Math.round(settings.comfortableIncomeRatioMin * 100)} onChange={(event) => setSettings({ ...settings, comfortableIncomeRatioMin: Number(event.target.value) / 100 })} className={`${inputClass} mt-1`} /></label>
        <label className="text-[10px] font-bold text-[#68646F]">Income ratio maximum (%)<input type="number" min="5" max="90" value={Math.round(settings.comfortableIncomeRatioMax * 100)} onChange={(event) => setSettings({ ...settings, comfortableIncomeRatioMax: Number(event.target.value) / 100 })} className={`${inputClass} mt-1`} /></label>
        <label className="text-[10px] font-bold text-[#68646F]">Default state<input value={settings.defaultState} onChange={(event) => setSettings({ ...settings, defaultState: event.target.value })} className={`${inputClass} mt-1`} /></label>
      </div><label className="mt-3 block text-[10px] font-bold text-[#68646F]">Public disclaimer<textarea value={settings.disclaimer} onChange={(event) => setSettings({ ...settings, disclaimer: event.target.value })} rows={2} className={`${inputClass} mt-1 resize-y`} /></label></section>}

      <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <section className="rounded-2xl border border-[#E4E0E7] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-[16px] font-bold text-[#121B35]">{editingId ? "Edit charge rule" : "Create charge rule"}</h2><p className="mt-1 text-[11px] text-[#68646F]">Set a percentage, fixed amount or per-sqft amount.</p></div>{editingId && <button onClick={() => { setEditingId(""); setDraft(emptyRule()); }} className="text-[10px] font-bold text-[#8A6107]">New rule</button>}</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <label className="text-[10px] font-bold text-[#68646F]">Rule name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Stamp duty" className={`${inputClass} mt-1`} /></label>
            <div className="grid grid-cols-2 gap-3"><label className="text-[10px] font-bold text-[#68646F]">State<input value={draft.state} onChange={(event) => setDraft({ ...draft, state: event.target.value })} className={`${inputClass} mt-1`} /></label><label className="text-[10px] font-bold text-[#68646F]">City (optional)<input value={draft.city || ""} onChange={(event) => setDraft({ ...draft, city: event.target.value })} className={`${inputClass} mt-1`} /></label></div>
            <div className="grid grid-cols-2 gap-3"><label className="text-[10px] font-bold text-[#68646F]">Calculation<select value={draft.calculationType} onChange={(event) => setDraft({ ...draft, calculationType: event.target.value as AffordabilityRule["calculationType"] })} className={`${inputClass} mt-1`}><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option><option value="per_sqft">Per sq. ft.</option></select></label><label className="text-[10px] font-bold text-[#68646F]">Basis<select value={draft.basis} onChange={(event) => setDraft({ ...draft, basis: event.target.value as AffordabilityRule["basis"] })} className={`${inputClass} mt-1`}><option value="base_price">Base price</option><option value="agreement_value">Agreement value</option><option value="built_up_area">Built-up area</option></select></label></div>
            <div className="grid grid-cols-2 gap-3"><label className="text-[10px] font-bold text-[#68646F]">Percentage / per-sqft rate<input type="number" min="0" step="0.01" value={draft.rate || ""} onChange={(event) => setDraft({ ...draft, rate: Number(event.target.value) || 0 })} className={`${inputClass} mt-1`} /></label><label className="text-[10px] font-bold text-[#68646F]">Fixed amount (₹)<input type="number" min="0" value={draft.fixedAmount || ""} onChange={(event) => setDraft({ ...draft, fixedAmount: Number(event.target.value) || 0 })} className={`${inputClass} mt-1`} /></label></div>
            <div><p className="text-[10px] font-bold text-[#68646F]">Property types (none = all)</p><div className="mt-2 flex flex-wrap gap-2">{propertyTypes.map((type) => <button type="button" key={type} onClick={() => togglePropertyType(type)} className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${draft.propertyTypes.includes(type) ? "border-[#DDAA42] bg-[#FFF5DE] text-[#7A5200]" : "border-[#E4E0E7] text-[#68646F]"}`}>{draft.propertyTypes.includes(type) && <Check className="mr-1 inline size-3" />}{type}</button>)}</div></div>
            <div className="grid grid-cols-2 gap-3"><label className="text-[10px] font-bold text-[#68646F]">Effective from<input type="date" value={draft.effectiveFrom.slice(0, 10)} onChange={(event) => setDraft({ ...draft, effectiveFrom: event.target.value })} className={`${inputClass} mt-1`} /></label><label className="text-[10px] font-bold text-[#68646F]">Effective to<input type="date" value={draft.effectiveTo?.slice(0, 10) || ""} onChange={(event) => setDraft({ ...draft, effectiveTo: event.target.value || null })} className={`${inputClass} mt-1`} /></label></div>
            <label className="text-[10px] font-bold text-[#68646F]">Government source / notification<input value={draft.sourceLabel || ""} onChange={(event) => setDraft({ ...draft, sourceLabel: event.target.value })} className={`${inputClass} mt-1`} /></label>
            <label className="text-[10px] font-bold text-[#68646F]">Source URL<input value={draft.sourceUrl || ""} onChange={(event) => setDraft({ ...draft, sourceUrl: event.target.value })} className={`${inputClass} mt-1`} /></label>
          </div>
          <button disabled={saving || !draft.name || !draft.state} onClick={() => void saveRule()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-4 py-3 text-[12px] font-bold text-[#121B35] disabled:opacity-50">{editingId ? <Save className="size-4" /> : <Plus className="size-4" />}{editingId ? "Update rule" : "Create rule"}</button>
        </section>

        <section><div className="mb-3 flex items-center justify-between"><div><h2 className="text-[16px] font-bold text-[#121B35]">Configured rules</h2><p className="text-[11px] text-[#68646F]">Inactive rules remain in history and are not used in new estimates.</p></div></div><div className="space-y-3">{rules.length === 0 ? <div className="rounded-2xl border border-dashed border-[#D8D3DA] bg-white p-12 text-center text-sm text-[#68646F]">No government-charge rules configured.</div> : rules.map((rule) => <article key={String(rule._id || rule.id)} className={`rounded-2xl border bg-white p-4 shadow-sm ${rule.active ? "border-[#E4E0E7]" : "border-[#E4E0E7] opacity-60"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="text-[14px] font-bold text-[#121B35]">{rule.name}</h3><span className={`rounded-md px-2 py-1 text-[9px] font-bold uppercase ${rule.active ? "bg-emerald-50 text-emerald-700" : "bg-[#F3F1F5] text-[#68646F]"}`}>{rule.active ? "Active" : "Inactive"}</span></div><p className="mt-1 text-[11px] text-[#68646F]">{rule.state}{rule.city ? ` · ${rule.city}` : " · All cities"} · {rule.propertyTypes.length ? rule.propertyTypes.join(", ") : "All property types"}</p></div><div className="flex gap-2"><button onClick={() => edit(rule)} className="inline-flex items-center gap-1 rounded-lg border border-[#E4E0E7] px-2.5 py-2 text-[10px] font-bold text-[#121B35]"><Edit3 className="size-3.5" />Edit</button>{rule.active && <button onClick={async () => { await deactivateAffordabilityRule(String(rule._id || rule.id)); await load(); }} className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-2 text-[10px] font-bold text-red-700"><ToggleLeft className="size-3.5" />Deactivate</button>}</div></div><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><div className="rounded-lg bg-[#F8F7FA] p-2.5"><p className="text-[9px] text-[#77717E]">Method</p><p className="mt-0.5 text-[11px] font-bold text-[#121B35]">{rule.calculationType.replace("_", " ")}</p></div><div className="rounded-lg bg-[#F8F7FA] p-2.5"><p className="text-[9px] text-[#77717E]">Value</p><p className="mt-0.5 text-[11px] font-bold tabular-nums text-[#121B35]">{rule.calculationType === "fixed" ? `₹${rule.fixedAmount.toLocaleString("en-IN")}` : `${rule.rate}${rule.calculationType === "percentage" ? "%" : "/sqft"}`}</p></div><div className="rounded-lg bg-[#F8F7FA] p-2.5"><p className="text-[9px] text-[#77717E]">Basis</p><p className="mt-0.5 text-[11px] font-bold text-[#121B35]">{rule.basis.replace(/_/g, " ")}</p></div><div className="rounded-lg bg-[#F8F7FA] p-2.5"><p className="text-[9px] text-[#77717E]">Effective</p><p className="mt-0.5 text-[11px] font-bold text-[#121B35]">{new Date(rule.effectiveFrom).toLocaleDateString("en-IN")}</p></div></div>{rule.sourceLabel && <p className="mt-3 text-[10px] text-[#68646F]">Source: {rule.sourceLabel}</p>}</article>)}</div></section>
      </div>
    </div>}
  </AdminLayout>;
}
