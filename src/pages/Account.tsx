"use client";
import { useEffect, useState } from "react";
import Link from "@/components/Link";
import { UserRound, BadgeCheck, Building2, Phone, Mail, MapPin, CheckCircle2, ArrowRight, Home } from "lucide-react";
import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import { useAuth } from "@/components/acres/AuthContext";
import { registerDealer, getDealerByPhone, type Dealer } from "@/lib/dealerStore";

const DEAL_TYPES = ["RESALE", "NEW BOOKING", "RENT", "COMMERCIAL"];

export default function AccountPage() {
  const { user, setIsAuthModalOpen } = useAuth();
  const [isDealer, setIsDealer] = useState(false);
  const [existing, setExisting] = useState<Dealer | null>(null);

  const [form, setForm] = useState({
    name: "",
    agency: "",
    phone: "",
    email: "",
    operatingSince: "",
    localities: "",
    about: "",
    dealsIn: ["RESALE"] as string[],
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.name || "",
        phone: f.phone || (user.phone ? `+91 ${user.phone}` : ""),
        email: f.email || user.email || "",
      }));
      const d = user.phone ? getDealerByPhone(user.phone) : undefined;
      if (d) {
        setExisting(d);
        setIsDealer(true);
      }
    }
  }, [user]);

  const toggleDeal = (t: string) =>
    setForm((f) => ({
      ...f,
      dealsIn: f.dealsIn.includes(t) ? f.dealsIn.filter((x) => x !== t) : [...f.dealsIn, t],
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dealer = await registerDealer({
      name: form.name.trim(),
      agency: form.agency.trim() || `${form.name.trim()} Realty`,
      phone: form.phone.trim(),
      email: form.email.trim(),
      operatingSince: form.operatingSince.trim() || undefined,
      about: form.about.trim() || undefined,
      localities: form.localities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      dealsIn: form.dealsIn.length ? form.dealsIn : ["RESALE"],
    });
    setExisting(dealer);
  };

  const input = "w-full h-11 px-3.5 rounded-xl border border-[#E4E0E7] focus:border-[#DDAA42] outline-none text-[14px] text-[#121B35] bg-white";
  const label = "block text-[12px] font-bold text-[#68646F] mb-1.5";

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#F8F7FA]">
        <section className="bg-gradient-to-br from-[#0B1328] via-[#121B35] to-[#273559] text-white">
          <div className="max-w-[1000px] mx-auto px-5 py-12 flex items-center gap-5">
            <span className="size-20 rounded-full bg-white/10 border-2 border-[#DDAA42]/50 flex items-center justify-center text-3xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserRound className="size-9" />}
            </span>
            <div>
              <h1 className="text-[30px] md:text-[36px] font-bold">{user ? user.name : "Your Account"}</h1>
              <p className="text-[14px] text-[#E4E0E7]/85 mt-1">
                {user ? (user.phone ? `+91 ${user.phone}` : user.email) : "Manage your profile and dealer listing"}
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-[1000px] mx-auto px-5 py-10 space-y-8">
          {!user && (
            <div className="bg-white rounded-2xl border border-[#E4E0E7]/60 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[15px] text-[#3F3D46]">Log in to save your profile across devices.</p>
              <button onClick={() => setIsAuthModalOpen(true)} className="btn-gold px-5 h-11 rounded-xl font-bold text-[14px]">Login / Register</button>
            </div>
          )}

          {/* Are you a dealer toggle */}
          <div className="bg-white rounded-2xl border border-[#E4E0E7]/60 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="size-12 rounded-xl bg-[#FFF8E8] flex items-center justify-center text-[#DDAA42]">
                  <Building2 className="size-6" />
                </span>
                <div>
                  <h2 className="text-[20px] font-bold text-[#121B35]">Are you a dealer?</h2>
                  <p className="text-[13px] text-[#68646F]">List yourself in the dealer directory and get buyer enquiries.</p>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <span className="text-[13px] font-semibold text-[#3F3D46]">I am a dealer</span>
                <span
                  onClick={() => setIsDealer((v) => !v)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${isDealer ? "bg-[#DDAA42]" : "bg-[#CBD6EE]"}`}
                >
                  <span className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-all ${isDealer ? "left-[22px]" : "left-0.5"}`} />
                </span>
              </label>
            </div>

            {/* Already registered confirmation */}
            {existing && (
              <div className="mt-6 bg-[#E6F2EA] border border-[#1E7A46]/30 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-7 text-[#1E7A46]" />
                  <div>
                    <p className="text-[15px] font-bold text-[#121B35]">You&apos;re listed as a dealer</p>
                    <p className="text-[13px] text-[#3F3D46]">{existing.agency} • {existing.localities?.join(", ") || "Bangalore"}</p>
                  </div>
                </div>
                <Link href={`/dealer/${existing.slug}`} className="inline-flex items-center gap-2 btn-gold px-4 h-10 rounded-xl text-[13px] font-bold">
                  View my dealer profile <ArrowRight className="size-4" />
                </Link>
              </div>
            )}

            {/* Registration / edit form */}
            {isDealer && (
              <form onSubmit={submit} className="mt-6 grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={label}>Your Name</label>
                  <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sanjay K C" required />
                </div>
                <div>
                  <label className={label}>Agency / Firm</label>
                  <input className={input} value={form.agency} onChange={(e) => setForm({ ...form, agency: e.target.value })} placeholder="e.g. Landmark Properties" />
                </div>
                <div>
                  <label className={label}><Phone className="inline size-3.5 mr-1 text-[#DDAA42]" />Contact Number</label>
                  <input className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98450 11223" required />
                </div>
                <div>
                  <label className={label}><Mail className="inline size-3.5 mr-1 text-[#DDAA42]" />Email</label>
                  <input type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@agency.in" />
                </div>
                <div>
                  <label className={label}>Operating Since (year)</label>
                  <input className={input} value={form.operatingSince} onChange={(e) => setForm({ ...form, operatingSince: e.target.value })} placeholder="2016" />
                </div>
                <div>
                  <label className={label}><MapPin className="inline size-3.5 mr-1 text-[#DDAA42]" />Active Localities (comma separated)</label>
                  <input className={input} value={form.localities} onChange={(e) => setForm({ ...form, localities: e.target.value })} placeholder="Whitefield, Sarjapur Road" />
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>Deals In</label>
                  <div className="flex flex-wrap gap-2">
                    {DEAL_TYPES.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => toggleDeal(t)}
                        className={`text-[12px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                          form.dealsIn.includes(t)
                            ? "bg-[#DDAA42] text-[#0B1328] border-[#DDAA42]"
                            : "bg-white text-[#3F3D46] border-[#E4E0E7] hover:border-[#DDAA42]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>About you / your firm</label>
                  <textarea className={`${input} h-24 py-2.5 resize-none`} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} placeholder="Briefly describe your experience and specialities." />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-gold px-6 h-12 rounded-xl font-bold text-[15px] inline-flex items-center gap-2">
                    <BadgeCheck className="size-5" /> {existing ? "Update dealer profile" : "Register as Dealer"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/postproperty" className="bg-white rounded-2xl border border-[#E4E0E7]/60 shadow-sm p-5 hover:shadow-lg hover:border-[#DDAA42]/60 transition-all">
              <Home className="size-6 text-[#DDAA42]" />
              <p className="text-[15px] font-bold text-[#121B35] mt-3">Post a Property</p>
              <p className="text-[12px] text-[#68646F]">List your property for free</p>
            </Link>
            <Link href="/dealers" className="bg-white rounded-2xl border border-[#E4E0E7]/60 shadow-sm p-5 hover:shadow-lg hover:border-[#DDAA42]/60 transition-all">
              <Building2 className="size-6 text-[#DDAA42]" />
              <p className="text-[15px] font-bold text-[#121B35] mt-3">Browse Dealers</p>
              <p className="text-[12px] text-[#68646F]">Find verified channel partners</p>
            </Link>
            <Link href="/property-in-bangalore-ffid" className="bg-white rounded-2xl border border-[#E4E0E7]/60 shadow-sm p-5 hover:shadow-lg hover:border-[#DDAA42]/60 transition-all">
              <MapPin className="size-6 text-[#DDAA42]" />
              <p className="text-[15px] font-bold text-[#121B35] mt-3">Explore Properties</p>
              <p className="text-[12px] text-[#68646F]">Discover homes in Bangalore</p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
