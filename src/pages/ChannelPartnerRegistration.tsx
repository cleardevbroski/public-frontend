import { useState } from "react";
import { CheckCircle2, Clock3, KeyRound, LayoutDashboard, Loader2, ShieldCheck, UserPlus, UsersRound } from "lucide-react";
import { fetchChannelPartnerProjects, fetchMyChannelPartnerClients, registerChannelPartnerClient, verifyChannelPartnerCode } from "@/lib/api";
import { useDocumentTitle } from "@/useDocumentTitle";

type Project = { id: string; title: string; area?: string };
type Client = { id: string; leadNumber: string; clientName: string; mobileMasked: string; projectTitle: string; status: "pending" | "approved" | "successful"; registeredAt: string; ownershipExpiresAt: string };
type RegistrationResult = Client & { emailSent: boolean };
type Partner = { name: string; type: string; code: string; contactName: string; mobile: string; email: string; city: string; state: string };
const inputClass = "h-12 w-full rounded-xl border border-[#D8D4DC] bg-white px-4 text-sm text-[#121B35] outline-none focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/15 disabled:bg-[#F7F7F8] disabled:text-[#8A8690]";

export default function ChannelPartnerRegistration() {
  useDocumentTitle(
    "CP Client Registration | ClearTitle One",
    "Register a property client through the ClearTitle One CP client registration portal for verified Bangalore real estate opportunities.",
    {
      canonical: "/cp-registration",
      image: "https://cleartitleone.com/cleartitleone/logo.png",
      jsonLd: { "@context": "https://schema.org", "@type": "WebPage", name: "ClearTitle One CP Client Registration", url: "https://cleartitleone.com/cp-registration", description: "Register a client through the ClearTitle One channel partner portal." },
    },
  );
  const [code, setCode] = useState("");
  const [partner, setPartner] = useState<Partner | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({ clientName: "", mobile: "", email: "", projectId: "", budget: "", notes: "", consentAccepted: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<RegistrationResult | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const verify = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setSuccess(null);
    try {
      const data = await verifyChannelPartnerCode(code.trim().toUpperCase());
      setPartner(data.partner);
      const [projectData, clientData] = await Promise.all([fetchChannelPartnerProjects(), fetchMyChannelPartnerClients()]);
      setProjects(projectData.projects || []); setClients(clientData.clients || []);
    } catch (cause) { setPartner(null); setError(cause instanceof Error ? cause.message : "Unable to verify Channel Partner code."); }
    finally { setBusy(false); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setSuccess(null);
    if (!partner) return setError("Enter and verify the Channel Partner code first.");
    if (!form.clientName.trim()) return setError("Client name is required.");
    if (!/^[6-9][0-9]{9}$/.test(form.mobile)) return setError("Enter a valid 10-digit Indian mobile number.");
    if (!form.projectId) return setError("Choose a project.");
    if (!form.consentAccepted) return setError("Confirm that the client consented to registration.");
    setBusy(true);
    try {
      const data = await registerChannelPartnerClient(form, idempotencyKey);
      setSuccess({ ...data.client, emailSent: Boolean(data.emailSent) });
      setClients((current) => current.some((item) => item.id === data.client.id) ? current : [data.client, ...current]);
      setForm({ clientName: "", mobile: "", email: "", projectId: "", budget: "", notes: "", consentAccepted: false });
      setIdempotencyKey(crypto.randomUUID());
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to register client."); }
    finally { setBusy(false); }
  };

  const updateCode = (value: string) => {
    setCode(value.toUpperCase().replace(/\s/g, "").slice(0, 20));
    if (partner) { setPartner(null); setClients([]); setProjects([]); setSuccess(null); }
  };
  const filteredProjects = projects.filter((project) => `${project.title} ${project.area || ""}`.toLowerCase().includes(projectSearch.trim().toLowerCase()));

  return <div className="min-h-[100dvh] bg-[#EFF1F4] text-[#3F3D46]">
    <header className="border-b border-[#DDAA42]/25 bg-[#0B1328]"><div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-4"><div className="flex items-center gap-3"><img src="/cleartitleone/logo.png" alt="ClearTitle One" className="size-11 rounded-full ring-2 ring-[#DDAA42]/60" /><div><p className="text-[17px] font-bold text-white">Clear<span className="text-[#F2C052]">Title</span><span className="text-[#DDAA42]">One</span></p><p className="text-[10px] uppercase tracking-[.14em] text-white/50">Channel Partner Client Registration</p></div></div><nav className="flex items-center gap-2" aria-label="Channel Partner"><a href="/cp-dashboard" className="rounded-lg border border-white/20 px-3 py-2 text-xs font-bold text-white/80 hover:border-[#DDAA42] hover:text-[#F2C052]">Dashboard</a><a href="/cp-registration" className="rounded-lg bg-[#DDAA42] px-3 py-2 text-xs font-bold text-[#0B1328]">Register Client</a></nav></div></header>
    <main className="mx-auto max-w-[1100px] px-4 py-10">
      <section className="overflow-hidden rounded-3xl border border-[#E4E0E7] bg-white shadow-xl shadow-[#121B35]/5"><div className="border-b border-[#E4E0E7] bg-[#FFFDF7] p-6 md:p-8"><div className="flex gap-3"><span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1C8]"><KeyRound className="size-6 text-[#9A6A13]" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#B88422]">One-page registration</p><h1 className="mt-1 text-2xl font-bold text-[#121B35]">Register your clients</h1><p className="mt-1 text-sm text-[#68646F]">Enter your code, see your partner details, and add as many clients as needed.</p></div></div><form onSubmit={verify} className="mt-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]"><input value={code} onChange={(event) => updateCode(event.target.value)} placeholder="Enter Channel Partner Code, e.g. CT-0001" className={`${inputClass} font-bold tracking-[.12em]`} required /><button disabled={busy || !code.trim()} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0B1328] px-5 text-sm font-bold text-white disabled:opacity-50">{busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}{partner ? "Verify again" : "Show partner details"}</button></form>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}{partner && <div className="mt-5"><div className="grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:grid-cols-2 lg:grid-cols-4"><Detail label="Partner" value={partner.name} /><Detail label="Contact" value={partner.contactName} /><Detail label="Mobile" value={partner.mobile} /><Detail label="Email" value={partner.email} /><Detail label="Location" value={`${partner.city}, ${partner.state}`} /><Detail label="Partner type" value={partner.type === "individual" ? "Individual Partner" : "Company / Firm"} /><Detail label="Partner code" value={partner.code} /></div><a href="/cp-dashboard" className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1328] px-4 text-xs font-bold text-white"><LayoutDashboard className="size-4" />View Dashboard</a></div>}</div>
        <div className="grid items-start gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2"><h2 className="text-xl font-bold text-[#121B35]">Client details</h2><p className="mt-1 text-sm text-[#68646F]">{partner ? "Register one client now. After success, use the same form again for the next client." : "Verify the Channel Partner code above to unlock this form."}</p></div>
            <Field label="Client Name"><input disabled={!partner} value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className={inputClass} required /></Field>
            <Field label="Mobile Number"><input disabled={!partner} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" className={inputClass} required /></Field>
            <Field label="Email (optional)"><input disabled={!partner} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className={inputClass} /></Field>
            <Field label="Search published project"><input disabled={!partner} value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} placeholder="Search by project or location" className={inputClass} /></Field>
            <Field label="Project"><select disabled={!partner} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className={inputClass} required><option value="">{filteredProjects.length ? "Select project" : "No matching project"}</option>{filteredProjects.map((project) => <option key={project.id} value={project.id}>{project.title}{project.area ? ` - ${project.area}` : ""}</option>)}</select><p className="mt-1 text-[10px] text-[#8A8690]">{filteredProjects.length} public project{filteredProjects.length === 1 ? "" : "s"} found</p></Field>
            <Field label="Budget (optional)"><input disabled={!partner} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Example: ₹1.2 Cr" className={inputClass} /></Field>
            <Field label="Notes (optional)"><input disabled={!partner} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} /></Field>
            <label className="flex gap-3 rounded-xl border border-[#E4E0E7] p-4 text-xs leading-5 md:col-span-2"><input disabled={!partner} type="checkbox" checked={form.consentAccepted} onChange={(e) => setForm({ ...form, consentAccepted: e.target.checked })} className="mt-0.5 size-4 accent-[#DDAA42]" /><span>I confirm that the client consented to sharing these details with ClearTitle One.</span></label>
            {success && <div className={`rounded-xl border p-4 text-xs md:col-span-2 ${success.emailSent ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}><p className="flex items-center gap-2 font-bold"><CheckCircle2 className="size-4" />Client registered successfully</p><p className="mt-1">{success.leadNumber} - pending until {new Date(success.ownershipExpiresAt).toLocaleDateString()}</p><p className="mt-1">{success.emailSent ? `Confirmation email sent to ${partner?.email}.` : "The confirmation email could not be delivered. An admin can resend it from CP Clients."}</p><a href="/cp-dashboard" className="mt-3 inline-flex items-center gap-2 font-bold underline"><LayoutDashboard className="size-3.5" />Open Dashboard</a></div>}
            <button disabled={busy || !partner || projects.length === 0} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#DDAA42] font-bold text-[#0B1328] disabled:opacity-50 md:col-span-2">{busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}Register Client</button>
            {partner && projects.length === 0 && <p className="text-center text-xs text-amber-700 md:col-span-2">No published projects are currently available.</p>}
          </form>
          <aside className="rounded-2xl border border-[#E4E0E7] bg-[#FCFCFD] p-5">
            <div className="flex items-center justify-between"><div><h2 className="font-bold text-[#121B35]">Your active clients</h2><p className="text-xs text-[#68646F]">Pending, approved, and successful registrations</p></div><span className="flex size-9 items-center justify-center rounded-xl bg-[#F1F4FA] font-bold text-[#121B35]">{clients.length}</span></div>
            <div className="mt-4 space-y-3">{!partner ? <div className="py-9 text-center"><UsersRound className="mx-auto size-8 text-[#D8D4DC]" /><p className="mt-2 text-xs text-[#68646F]">Partner details will appear after code verification.</p></div> : clients.length === 0 ? <div className="py-9 text-center"><UsersRound className="mx-auto size-8 text-[#D8D4DC]" /><p className="mt-2 text-xs text-[#68646F]">No active clients yet.</p></div> : clients.map((client) => <article key={client.id} className="rounded-xl border border-[#ECE9EF] bg-white p-3"><p className="font-bold text-[#121B35]">{client.clientName}</p><p className="mt-0.5 text-xs text-[#68646F]">{client.mobileMasked} | {client.projectTitle}</p><p className="mt-2 flex items-center gap-1 text-[10px] font-semibold capitalize text-[#8A681F]"><Clock3 className="size-3" />{client.status === "pending" ? `Pending until ${new Date(client.ownershipExpiresAt).toLocaleDateString()}` : client.status}</p></article>)}</div>
          </aside>
        </div>
      </section>
    </main>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#3F3D46]">{label}</span>{children}</label>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">{label}</p><p className="mt-0.5 break-words text-xs font-semibold text-[#173A2D]">{value}</p></div>; }
