import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, Building2, CalendarDays, Check, IndianRupee, Loader2, MapPin, PiggyBank, Users } from "lucide-react";
import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import Image from "@/components/Image";
import Link from "@/components/Link";
import { findHomeRecommendations, resolveBuyerDestination, type HomeFinderInput } from "@/lib/api";
import { ensureWorkspaceWithProperty, workspaceHref } from "@/lib/decisionWorkspace";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const purposes = [
  { value: "self_use", label: "Self-use" },
  { value: "family_upgrade", label: "Family upgrade" },
  { value: "investment", label: "Investment" },
  { value: "rental", label: "Rental purpose" },
] as const;
const fieldClass = "mt-2 h-12 w-full rounded-xl border border-[#DED8CE] bg-white px-3.5 text-[13px] font-semibold text-[#172039] outline-none transition focus:border-[#C28C25] focus:ring-3 focus:ring-[#DDAA42]/15";

type Recommendation = {
  rank: number;
  score: number;
  reasons: string[];
  distanceKm: number | null;
  configuration: { name: string; bedrooms: number; price: number; area: number };
  affordability: { totalPurchaseCost: number; monthlyEmi: number; missing?: string[] };
  property: { id: string; title: string; subtitle?: string; builder?: string; price?: string; image?: string; heroImages?: string[]; reraPhases?: unknown[] };
};

export default function FindMyHome() {
  const navigate = useNavigate();
  const [form, setForm] = useState<HomeFinderInput>({ purpose: "self_use", destination: { query: "" }, maxMonthlyEmi: 60000, downPayment: 2000000, bhk: 3, deadline: "2027-12" });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [calculation, setCalculation] = useState<Record<string, number | string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState("");
  const [error, setError] = useState("");
  const [locationWarning, setLocationWarning] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(""); setLocationWarning("");
    let destination = { ...form.destination };
    try {
      try {
        const resolved = await resolveBuyerDestination(destination.query);
        destination = { ...destination, ...resolved };
      } catch (resolveError) {
        setLocationWarning(resolveError instanceof Error ? resolveError.message : "Distance ranking is unavailable; other matching will continue.");
      }
      const data = await findHomeRecommendations({ ...form, destination });
      setRecommendations((data.recommendations || []) as Recommendation[]);
      setCalculation(data.calculation || null);
    } catch (searchError) { setError(searchError instanceof Error ? searchError.message : "Unable to prepare recommendations"); }
    finally { setLoading(false); }
  };

  const addToWorkspace = async (propertyId: string) => {
    setAddingId(propertyId); setError("");
    try { const workspace = await ensureWorkspaceWithProperty(propertyId); navigate(workspaceHref(workspace.id, workspace.ownerToken)); }
    catch (workspaceError) { setError(workspaceError instanceof Error ? workspaceError.message : "Unable to add property to family workspace"); }
    finally { setAddingId(""); }
  };

  return <div className="public-page-shell"><Header />
    <main>
      <section className="public-page-hero border-b border-[#DED8CE]"><div className="public-container relative z-10 grid gap-8 py-12 lg:grid-cols-[.82fr_1.18fr] lg:py-16"><div className="self-center"><p className="public-page-hero__eyebrow">Private, no-contact-first search</p><h1 className="display-heading mt-4 max-w-xl text-[40px] text-white md:text-[58px]">Find a home that fits your life and your monthly comfort.</h1><p className="mt-5 max-w-lg text-[15px] leading-7 text-white/70">Answer six questions. We calculate and rank matching published projects before asking for your name or phone number.</p><div className="mt-7 grid gap-3 text-[12px] text-white/80 sm:grid-cols-2">{["Transparent budget assumptions", "Configuration-level matching", "Possession deadline check", "Verified-coordinate distance when available"].map((item) => <p key={item} className="flex items-center gap-2"><Check className="size-4 text-[#E2B757]" />{item}</p>)}</div></div>
        <form onSubmit={submit} className="rounded-[24px] bg-[#FBF9F4] p-5 text-[#172039] shadow-[0_30px_80px_rgba(0,0,0,.24)] md:p-7"><div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><p className="flex items-center gap-2 text-[12px] font-bold"><Users className="size-4 text-[#A87416]" />1. Buying for</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{purposes.map((purpose) => <button type="button" key={purpose.value} onClick={() => setForm({ ...form, purpose: purpose.value })} className={`rounded-xl border px-2 py-3 text-[11px] font-bold transition ${form.purpose === purpose.value ? "border-[#DDAA42] bg-[#FFF0C9] text-[#704B00]" : "border-[#DED8CE] bg-white text-[#626875] hover:border-[#C8BDA9]"}`}>{purpose.label}</button>)}</div></div>
          <label className="text-[11px] font-bold text-[#4D5564] sm:col-span-2"><span className="flex items-center gap-2"><BriefcaseBusiness className="size-4 text-[#A87416]" />2. Workplace or important destination</span><input required value={form.destination.query} onChange={(event) => setForm({ ...form, destination: { query: event.target.value } })} placeholder="e.g. ITPL, Whitefield, Bangalore" className={fieldClass} /></label>
          <label className="text-[11px] font-bold text-[#4D5564]"><span className="flex items-center gap-2"><IndianRupee className="size-4 text-[#A87416]" />3. Maximum comfortable EMI</span><input required type="number" min="1000" value={form.maxMonthlyEmi} onChange={(event) => setForm({ ...form, maxMonthlyEmi: Number(event.target.value) })} className={fieldClass} /></label>
          <label className="text-[11px] font-bold text-[#4D5564]"><span className="flex items-center gap-2"><PiggyBank className="size-4 text-[#A87416]" />4. Available down payment</span><input required type="number" min="0" value={form.downPayment} onChange={(event) => setForm({ ...form, downPayment: Number(event.target.value) })} className={fieldClass} /></label>
          <label className="text-[11px] font-bold text-[#4D5564]"><span className="flex items-center gap-2"><Building2 className="size-4 text-[#A87416]" />5. Preferred configuration</span><select value={form.bhk} onChange={(event) => setForm({ ...form, bhk: Number(event.target.value) })} className={fieldClass}>{[1, 2, 3, 4, 5, 6].map((bhk) => <option key={bhk} value={bhk}>{bhk} BHK</option>)}</select></label>
          <label className="text-[11px] font-bold text-[#4D5564]"><span className="flex items-center gap-2"><CalendarDays className="size-4 text-[#A87416]" />6. Purchase or possession deadline</span><input required type="month" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} className={fieldClass} /></label>
        </div><button disabled={loading} className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] text-[13px] font-extrabold text-[#172039] transition hover:bg-[#E8B94E] active:translate-y-px disabled:opacity-60">{loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}{loading ? "Calculating matches…" : "Show my ranked shortlist"}</button><p className="mt-3 text-center text-[10px] text-[#777062]">No name, phone number or registration is required.</p></form></div></section>

      {(error || locationWarning) && <div className="mx-auto max-w-[1200px] px-4 pt-5">{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] font-semibold text-red-700">{error}</p>}{locationWarning && <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[12px] text-amber-800">{locationWarning}</p>}</div>}
      {calculation && <section className="mx-auto max-w-[1200px] px-4 pt-8"><div className="grid gap-3 rounded-2xl border border-[#DED8CE] bg-white p-5 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-[10px] text-[#77717E]">Estimated loan</p><p className="mt-1 text-[18px] font-extrabold tabular-nums text-[#172039]">{currency.format(Number(calculation.estimatedLoan))}</p></div><div><p className="text-[10px] text-[#77717E]">Estimated available funds</p><p className="mt-1 text-[18px] font-extrabold tabular-nums text-[#172039]">{currency.format(Number(calculation.estimatedFunds))}</p></div><div><p className="text-[10px] text-[#77717E]">Interest assumption</p><p className="mt-1 text-[18px] font-extrabold tabular-nums text-[#172039]">{calculation.interestRate}%</p></div><div><p className="text-[10px] text-[#77717E]">Tenure assumption</p><p className="mt-1 text-[18px] font-extrabold tabular-nums text-[#172039]">{calculation.tenureYears} years</p></div><p className="text-[10px] leading-4 text-[#77717E] sm:col-span-2 lg:col-span-4">{String(calculation.disclaimer)}</p></div></section>}
      {recommendations.length > 0 && <section className="mx-auto max-w-[1200px] px-4 py-10"><div className="mb-5"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#A87416]">Your shortlist</p><h2 className="mt-1 text-[28px] font-extrabold tracking-tight text-[#172039]">Ranked from your six answers</h2></div><div className="space-y-4">{recommendations.map((item) => { const image = item.property.heroImages?.[0] || item.property.image; return <article key={item.property.id} className="grid overflow-hidden rounded-2xl border border-[#DED8CE] bg-white shadow-[0_12px_35px_rgba(23,32,57,.06)] md:grid-cols-[240px_1fr_auto]"><div className="relative min-h-44 bg-[#E9E4DA]">{image && <Image src={image} alt={item.property.title} fill className="object-cover" />}<span className="absolute left-3 top-3 rounded-lg bg-[#172039] px-2.5 py-1.5 text-[10px] font-bold text-white">#{item.rank} · {item.score}% match</span></div><div className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#A87416]">{item.property.builder || "Developer not supplied"}</p><h3 className="mt-1 text-[20px] font-extrabold text-[#172039]">{item.property.title}</h3><p className="mt-1 flex items-center gap-1 text-[11px] text-[#77717E]"><MapPin className="size-3.5" />{item.property.subtitle || "Location details available on project page"}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{item.reasons.map((reason) => <p key={reason} className="flex items-start gap-2 text-[11px] leading-4 text-[#4D5564]"><Check className="mt-0.5 size-3.5 shrink-0 text-emerald-700" />{reason}</p>)}</div>{item.affordability.missing?.length ? <p className="mt-3 text-[10px] text-amber-800">Missing from calculation: {item.affordability.missing.join(", ")}</p> : null}</div><div className="flex min-w-52 flex-col justify-between border-t border-[#EEE9DF] bg-[#FBF9F4] p-5 md:border-l md:border-t-0"><div><p className="text-[10px] text-[#77717E]">{item.configuration.name} estimated total</p><p className="mt-1 text-[19px] font-extrabold tabular-nums text-[#172039]">{currency.format(item.affordability.totalPurchaseCost)}</p><p className="mt-2 text-[10px] text-[#77717E]">Estimated EMI</p><p className="text-[14px] font-bold tabular-nums text-[#172039]">{currency.format(item.affordability.monthlyEmi)}/month</p></div><div className="mt-5 grid gap-2"><Link href={`/property/${item.property.id}`} className="rounded-lg border border-[#CFC6B7] px-3 py-2 text-center text-[11px] font-bold text-[#172039]">View project</Link><button disabled={addingId === item.property.id} onClick={() => void addToWorkspace(item.property.id)} className="rounded-lg bg-[#DDAA42] px-3 py-2 text-[11px] font-bold text-[#172039] disabled:opacity-50">{addingId === item.property.id ? "Adding…" : "Compare with family"}</button></div></div></article>; })}</div></section>}
      {!loading && calculation && recommendations.length === 0 && <section className="mx-auto max-w-[760px] px-4 py-12 text-center"><h2 className="text-[24px] font-bold text-[#172039]">No matching published configuration found</h2><p className="mt-2 text-[13px] text-[#68646F]">Try a different EMI, down payment, BHK or possession deadline. Your contact details have not been collected.</p></section>}
    </main><Footer /></div>;
}
