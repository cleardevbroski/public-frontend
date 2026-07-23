"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  GraduationCap,
  Languages,
  Loader2,
  MapPin,
  MessageCircle,
  Scale,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { fetchLawyers, sendOtp, submitPropertyConsultation, updateProfile, verifyOtp } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { trackAnalytics } from "@/lib/analytics";

type Lawyer = {
  id: string;
  name: string;
  qualification?: string;
  college?: string;
  graduationYear?: string;
  experience: string;
  barCouncil: string;
  rating: number;
  cases: string;
  specialty: string;
  languages?: string;
  city?: string;
  bio?: string;
  image?: string;
  legalDocumentType?: string;
  documentVerified?: boolean;
  whatsappAvailable?: boolean;
};

type Step = "identity" | "otp" | "lawyers" | "request" | "success";

type Props = {
  open: boolean;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: string;
  onClose: () => void;
};

const topics = ["Title deed verification", "Encumbrance check", "RERA review", "Sale agreement review", "Ownership dispute", "Other legal query"];

export default function LawyerConsultationModal({ open, propertyId, propertyTitle, propertyLocation, propertyPrice, onClose }: Props) {
  const { user, login, updateProfile: updateAuthProfile } = useAuth();
  const [step, setStep] = useState<Step>("identity");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [topic, setTopic] = useState(topics[0]);
  const [request, setRequest] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lawyersLoading, setLawyersLoading] = useState(false);
  const [error, setError] = useState("");
  const [devMode, setDevMode] = useState(false);
  const [fallbackOtp, setFallbackOtp] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setOtp("");
    setSelectedLawyer(null);
    setTopic(topics[0]);
    setRequest("");
    setConsent(false);
    setError("");
    setDevMode(false);
    setFallbackOtp("");
    setWhatsappUrl("");
    setStep(user?.name && user?.email ? "lawyers" : "identity");
  }, [open, user]);

  useEffect(() => {
    if (!open) return;
    setLawyersLoading(true);
    fetchLawyers()
      .then((rows: Lawyer[]) => setLawyers(Array.isArray(rows) ? rows : []))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load lawyers."))
      .finally(() => setLawyersLoading(false));
  }, [open]);

  if (!open) return null;

  const validateIdentity = () => {
    if (name.trim().length < 2) return "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email address.";
    if (!/^[6-9]\d{9}$/.test(phone)) return "Enter a valid 10-digit Indian mobile number.";
    return "";
  };

  const continueIdentity = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateIdentity();
    if (validationError) return setError(validationError);
    setLoading(true);
    setError("");
    setFallbackOtp("");
    try {
      if (user) {
        const profile = await updateProfile({ name: name.trim(), email: email.trim() });
        updateAuthProfile(profile.user);
        setStep("lawyers");
      } else {
        const result = await sendOtp(phone);
        if (result.mode === "fallback" && result.otp) {
          setFallbackOtp(result.otp);
          setOtp(result.otp);
        }
        setDevMode(result.mode === "dev" || result.mode === "fallback");
        setStep("otp");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue.");
    } finally {
      setLoading(false);
    }
  };

  const verifyIdentity = async (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6) return setError("Enter the 6-digit OTP.");
    setLoading(true);
    setError("");
    try {
      const auth = await verifyOtp(phone, otp);
      const profile = await updateProfile({ name: name.trim(), email: email.trim() });
      login(profile.user, auth.token);
      setStep("lawyers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const chooseLawyer = (lawyer: Lawyer) => {
    if (!lawyer.whatsappAvailable) return;
    setSelectedLawyer(lawyer);
    setError("");
    setStep("request");
  };

  const sendRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedLawyer) return setError("Choose a lawyer.");
    if (request.trim().length < 10) return setError("Please describe your legal request in at least 10 characters.");
    if (!consent) return setError("Please consent to sharing these details with the selected lawyer.");

    const whatsappWindow = window.open("about:blank", "_blank");
    setLoading(true);
    setError("");
    try {
      const result = await submitPropertyConsultation({
        lawyerId: selectedLawyer.id,
        propertyId,
        propertyTitle,
        propertyLocation,
        propertyUrl: window.location.href,
        category: topic,
        message: request.trim(),
      });
      const analyticsMeta = {
        propertyId,
        propertyTitle,
        location: propertyLocation,
        lawyerId: selectedLawyer.id,
        lawyerName: selectedLawyer.name,
        topic,
        source: "property_legal_consultation",
      };
      trackAnalytics("lawyer_consultation_submitted", analyticsMeta);
      setWhatsappUrl(result.whatsappUrl);
      if (whatsappWindow) {
        whatsappWindow.opener = null;
        whatsappWindow.location.href = result.whatsappUrl;
        trackAnalytics("whatsapp_consultation_opened", analyticsMeta);
      }
      setStep("success");
    } catch (err) {
      whatsappWindow?.close();
      setError(err instanceof Error ? err.message : "Unable to create the consultation request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071633]/75 p-3 backdrop-blur-sm md:p-6" role="dialog" aria-modal="true" aria-label="Consult a lawyer about this property">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#F8FAFC] shadow-2xl">
        <div className="relative shrink-0 bg-gradient-to-r from-[#121B35] via-[#273559] to-[#121B35] px-6 py-5 text-white md:px-8">
          <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-white/10" aria-label="Close"><X className="size-5" /></button>
          <div className="flex items-center gap-3 pr-10"><span className="flex size-11 items-center justify-center rounded-2xl bg-[#DDAA42] text-[#121B35]"><Scale className="size-6" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F2C052]">ClearTitle Legal Shield</p><h2 className="text-xl font-bold md:text-2xl">Consult a Lawyer on Title</h2></div></div>
          <p className="mt-3 max-w-3xl text-sm text-white/70">{propertyTitle} · {propertyLocation}</p>
        </div>

        <div className="overflow-y-auto p-5 md:p-8">
          {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

          {step === "identity" && <form onSubmit={continueIdentity} className="mx-auto max-w-xl space-y-5">
            <div><h3 className="text-xl font-bold text-[#121B35]">Verify your customer details</h3><p className="mt-1 text-sm text-[#68646F]">Your phone is verified with OTP before lawyer profiles and consultation access are provided.</p></div>
            <label className="block text-sm font-bold text-[#121B35]">Full name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="mt-2 w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 font-normal outline-none focus:border-[#DDAA42]" /></label>
            <label className="block text-sm font-bold text-[#121B35]">Email / Gmail<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" className="mt-2 w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 font-normal outline-none focus:border-[#DDAA42]" /></label>
            <label className="block text-sm font-bold text-[#121B35]">Mobile number<div className="mt-2 flex overflow-hidden rounded-xl border border-[#E4E0E7] bg-white focus-within:border-[#DDAA42]"><span className="bg-[#F3F1F5] px-4 py-3 font-normal text-[#68646F]">+91</span><input required disabled={Boolean(user)} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="10-digit mobile number" className="min-w-0 flex-1 px-4 py-3 font-normal outline-none disabled:bg-[#F8FAFC]" /></div></label>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-5 py-3.5 font-bold text-[#0B1328] disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />}{user ? "Save details & view lawyers" : "Get OTP"}</button>
          </form>}

          {step === "otp" && <form onSubmit={verifyIdentity} className="mx-auto max-w-md space-y-5 text-center">
            <ShieldCheck className="mx-auto size-12 text-[#DDAA42]" /><div><h3 className="text-xl font-bold text-[#121B35]">Verify mobile number</h3><p className="mt-1 text-sm text-[#68646F]">Enter the OTP sent to +91 {phone}.</p></div>
            {devMode && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                {fallbackOtp ? `Fallback Mode: Please use OTP ${fallbackOtp}` : "Development mode: the OTP is displayed in the backend server console."}
              </p>
            )}
            <input autoFocus value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="6-digit OTP" className="w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.4em] outline-none focus:border-[#DDAA42]" />
            <button disabled={loading || otp.length !== 6} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-5 py-3.5 font-bold text-[#0B1328] disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />}Verify & view lawyers</button>
            <button type="button" onClick={() => { setStep("identity"); setOtp(""); setError(""); setFallbackOtp(""); }} className="text-sm font-bold text-[#121B35]">Change details</button>
          </form>}

          {step === "lawyers" && <div>
            <div className="mb-6"><h3 className="text-xl font-bold text-[#121B35]">Choose your lawyer</h3><p className="mt-1 text-sm text-[#68646F]">{lawyers.length} approved lawyer{lawyers.length === 1 ? "" : "s"} available for property consultation.</p></div>
            {lawyersLoading ? <div className="flex justify-center py-16"><Loader2 className="size-8 animate-spin text-[#DDAA42]" /></div> : lawyers.length === 0 ? <div className="rounded-2xl border border-[#E4E0E7] bg-white p-10 text-center text-[#68646F]">No approved lawyers are available right now.</div> : <div className="grid gap-5 md:grid-cols-2">
              {lawyers.map((lawyer) => <article key={lawyer.id} className="flex flex-col rounded-2xl border border-[#E4E0E7] bg-white p-5 shadow-sm">
                <div className="flex gap-4"><div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#121B35] text-xl font-bold text-[#F2C052]">{lawyer.image ? <img src={lawyer.image} alt={lawyer.name} className="size-full object-cover" /> : lawyer.name.charAt(0)}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h4 className="font-bold text-[#121B35]">{lawyer.name}</h4><p className="text-xs font-bold text-[#DDAA42]">{lawyer.specialty}</p></div><span className="flex items-center gap-1 text-sm font-bold text-[#121B35]"><Star className="size-3.5 fill-[#F2C052] text-[#F2C052]" />{lawyer.rating}</span></div><p className="mt-2 text-xs text-[#68646F]">{lawyer.experience} · {lawyer.cases}</p></div></div>
                <div className="mt-4 grid gap-2 text-xs text-[#3F3D46] sm:grid-cols-2"><p className="flex gap-2"><GraduationCap className="size-4 shrink-0 text-[#DDAA42]" /><span><strong className="block text-[#121B35]">{lawyer.qualification || "Law graduate"}</strong>{lawyer.college || "College not provided"}{lawyer.graduationYear ? ` · ${lawyer.graduationYear}` : ""}</span></p><p className="flex gap-2"><BadgeCheck className="size-4 shrink-0 text-[#DDAA42]" /><span><strong className="block text-[#121B35]">Bar Council</strong>{lawyer.barCouncil}</span></p><p className="flex gap-2"><Languages className="size-4 shrink-0 text-[#DDAA42]" /><span>{lawyer.languages || "Languages not provided"}</span></p><p className="flex gap-2"><MapPin className="size-4 shrink-0 text-[#DDAA42]" /><span>{lawyer.city || "Location not provided"}</span></p></div>
                {lawyer.bio && <p className="mt-4 text-xs leading-relaxed text-[#68646F]">{lawyer.bio}</p>}
                {lawyer.documentVerified && <p className="mt-4 flex items-center gap-1.5 text-xs font-bold text-green-700"><ShieldCheck className="size-4" />Professional document verified by ClearTitle</p>}
                <button type="button" disabled={!lawyer.whatsappAvailable} onClick={() => chooseLawyer(lawyer)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#121B35] px-4 py-3 text-sm font-bold text-[#F2C052] disabled:cursor-not-allowed disabled:opacity-45"><MessageCircle className="size-4" />{lawyer.whatsappAvailable ? "Choose lawyer" : "WhatsApp not available"}</button>
              </article>)}
            </div>}
          </div>}

          {step === "request" && selectedLawyer && <form onSubmit={sendRequest} className="mx-auto max-w-3xl space-y-5">
            <button type="button" onClick={() => { setStep("lawyers"); setError(""); }} className="flex items-center gap-1 text-sm font-bold text-[#121B35]"><ArrowLeft className="size-4" />Choose another lawyer</button>
            <div className="grid gap-4 rounded-2xl border border-[#E4E0E7] bg-white p-5 md:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#68646F]">Selected lawyer</p><p className="mt-1 font-bold text-[#121B35]">{selectedLawyer.name}</p><p className="text-xs text-[#DDAA42]">{selectedLawyer.specialty}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#68646F]">Property for consultation</p><p className="mt-1 font-bold text-[#121B35]">{propertyTitle}</p><p className="text-xs text-[#68646F]">{propertyLocation} · {propertyPrice}</p></div></div>
            <label className="block text-sm font-bold text-[#121B35]">Consultation topic<select value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-2 w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 font-normal outline-none focus:border-[#DDAA42]">{topics.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="block text-sm font-bold text-[#121B35]">Describe your request<textarea required value={request} onChange={(e) => setRequest(e.target.value.slice(0, 2000))} rows={6} placeholder="Explain what you want the lawyer to verify about this property title, ownership, deed, RERA registration or agreement..." className="mt-2 w-full rounded-xl border border-[#E4E0E7] bg-white px-4 py-3 font-normal outline-none focus:border-[#DDAA42]" /><span className="mt-1 block text-right text-xs font-normal text-[#68646F]">{request.length}/2000</span></label>
            <label className="flex items-start gap-3 rounded-xl border border-[#E4E0E7] bg-white p-4 text-xs leading-relaxed text-[#3F3D46]"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-[#DDAA42]" /><span>I consent to ClearTitle sharing my name, email, verified phone number, this property information and my request with {selectedLawyer.name} through WhatsApp.</span></label>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-5 py-3.5 font-bold text-[#0B1328] disabled:opacity-60">{loading ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}Submit & open WhatsApp</button>
            <p className="text-center text-xs text-[#68646F]">The request is recorded in ClearTitle. WhatsApp opens with a prepared message; you press Send to deliver it.</p>
          </form>}

          {step === "success" && <div className="mx-auto max-w-lg py-6 text-center"><CheckCircle2 className="mx-auto size-14 text-green-600" /><h3 className="mt-4 text-2xl font-bold text-[#121B35]">Consultation request created</h3><p className="mt-2 text-sm leading-relaxed text-[#68646F]">WhatsApp has been opened with the property and request details prepared for {selectedLawyer?.name}. Press Send in WhatsApp to deliver the message.</p>{whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => selectedLawyer && trackAnalytics("whatsapp_consultation_opened", { propertyId, propertyTitle, location: propertyLocation, lawyerId: selectedLawyer.id, lawyerName: selectedLawyer.name, topic, source: "consultation_success" })} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 font-bold text-white"><MessageCircle className="size-5" />Open WhatsApp again</a>}<button type="button" onClick={onClose} className="mt-3 block w-full rounded-xl bg-[#121B35] px-6 py-3 font-bold text-white">Done</button></div>}
        </div>
      </div>
    </div>
  );
}
