"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { createManualSession, submitPropertyInterest, updateProfile as saveProfile, type TruecallerPurpose } from "@/lib/api";
import { useAuth } from "./AuthContext";
import TruecallerButton, { type TruecallerAuthResult } from "./TruecallerButton";

export type PropertyAction = "brochure" | "call" | "enquiry";

type Props = {
  action: PropertyAction | null;
  propertyId: string;
  propertyTitle: string;
  contactNumber?: string;
  onClose: () => void;
  onComplete: (action: PropertyAction) => void;
};

const actionLabel: Record<PropertyAction, string> = {
  brochure: "Download Brochure",
  call: "Reveal Contact Number",
  enquiry: "Send Enquiry",
};

const truecallerPurpose: Record<PropertyAction, TruecallerPurpose> = {
  brochure: "brochure",
  call: "contact",
  enquiry: "enquiry",
};

export default function VerifiedPropertyActionModal({ action, propertyId, propertyTitle, contactNumber, onClose, onComplete }: Props) {
  const { user, login, updateProfile } = useAuth();
  const [step, setStep] = useState<"details" | "success">("details");
  const [audience, setAudience] = useState<"buyer" | "builder">("buyer");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pendingAuth, setPendingAuth] = useState<TruecallerAuthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!action) return;
    setStep("details");
    setAudience("buyer");
    setBudget("");
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setPendingAuth(null);
    setError("");
  }, [action, user]);

  if (!action) return null;

  const acceptTruecaller = (result: TruecallerAuthResult) => {
    setPendingAuth(result);
    setName(result.user.name || "");
    setEmail(result.user.email || "");
    setPhone(result.user.phone || "");
    setError("");
  };

  const submitDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!budget.trim()) return setError("Please enter your budget.");
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit Indian mobile number.");
    setLoading(true);
    setError("");
    try {
      let sessionUser = user;
      if (user) {
        const profile = await saveProfile({ name: name.trim(), email: email.trim() });
        sessionUser = profile.user || { ...user, name: name.trim(), email: email.trim() };
        if (sessionUser) updateProfile(sessionUser);
      } else if (pendingAuth) {
        const profile = await saveProfile({ name: name.trim(), email: email.trim() });
        sessionUser = profile.user || { ...pendingAuth.user, name: name.trim(), email: email.trim() };
        login(sessionUser!, pendingAuth.token);
      } else {
        const manual = await createManualSession({ name: name.trim(), email: email.trim(), phone });
        sessionUser = manual.user;
        login(manual.user, manual.token);
      }
      await submitPropertyInterest({ propertyId, propertyTitle, audience, budget, phone: sessionUser?.phone || phone, action });
      setStep("success");
      onComplete(action);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit your request.");
    } finally {
      setLoading(false);
    }
  };

  const phoneVerified = Boolean(pendingAuth || user?.isVerified);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#071633]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={actionLabel[action]}>
      <div className="relative max-h-[94vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/90 hover:bg-white/15" aria-label="Close"><X className="size-5" /></button>
        <div className="bg-[#121B35] px-7 pb-6 pt-8 text-white">
          <ShieldCheck className="mb-3 size-8 text-[#F5D77B]" />
          <h2 className="text-2xl font-bold">{actionLabel[action]}</h2>
          <p className="mt-2 text-sm text-white/80">Share your details so our team can complete this request for {propertyTitle}.</p>
        </div>
        <div className="p-6">
          {step === "details" && <>
            {!user && !pendingAuth && <>
              <TruecallerButton purpose={truecallerPurpose[action]} onVerified={acceptTruecaller} onError={setError} />
              <div className="my-5 flex items-center gap-3 text-xs font-semibold text-[#68646F]"><span className="h-px flex-1 bg-[#DEDADF]" /><span>Enter details manually</span><span className="h-px flex-1 bg-[#DEDADF]" /></div>
            </>}
            <form onSubmit={submitDetails} className="space-y-5">
              {phoneVerified && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><CheckCircle2 className="size-4 shrink-0 text-emerald-700" />Phone verified by Truecaller</div>}
              <div>
                <p className="text-sm font-bold text-[#121B35]">Are you a builder or buyer?</p>
                <div className="mt-2 grid grid-cols-2 gap-3">{(["buyer", "builder"] as const).map((role) => <button key={role} type="button" onClick={() => setAudience(role)} className={`rounded-xl border px-4 py-3 text-sm font-bold capitalize transition-colors active:scale-[.98] ${audience === role ? "border-[#DDAA42] bg-[#FFF8E5] text-[#121B35]" : "border-[#CFCBD3] text-[#68646F]"}`}>{role}</button>)}</div>
              </div>
              <label className="block text-sm font-bold text-[#121B35]">What is your budget?<input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Example: ₹80 L - ₹1.2 Cr" className="mt-2 w-full rounded-xl border border-[#CFCBD3] px-4 py-3 text-sm font-normal outline-none placeholder:text-[#77717D] focus:border-[#B98428]" /></label>
              <label className="block text-sm font-bold text-[#121B35]">Full name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your full name" className="mt-2 w-full rounded-xl border border-[#CFCBD3] px-4 py-3 text-sm font-normal outline-none placeholder:text-[#77717D] focus:border-[#B98428]" /></label>
              <label className="block text-sm font-bold text-[#121B35]">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-[#CFCBD3] px-4 py-3 text-sm font-normal outline-none placeholder:text-[#77717D] focus:border-[#B98428]" /></label>
              <label className="block text-sm font-bold text-[#121B35]">Mobile number<div className="mt-2 flex overflow-hidden rounded-xl border border-[#CFCBD3] focus-within:border-[#B98428]"><span className="bg-[#F8F7FA] px-3 py-3 text-sm text-[#3F3D46]">+91</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" disabled={Boolean(user || pendingAuth)} placeholder="10-digit mobile number" className="min-w-0 flex-1 px-3 py-3 text-sm font-normal outline-none placeholder:text-[#77717D] disabled:bg-[#F4F3F5]" /></div></label>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-4 py-3.5 text-sm font-bold text-[#0B1328] active:scale-[.98] disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />}Submit request</button>
            </form>
          </>}
          {step === "success" && <div className="py-4 text-center"><CheckCircle2 className="mx-auto size-12 text-green-600" /><h3 className="mt-4 text-xl font-bold text-[#121B35]">Request received</h3>{action === "call" && contactNumber ? <><p className="mt-2 text-sm text-[#68646F]">Here is the contact number for {propertyTitle}.</p><a href={`tel:${contactNumber}`} className="mt-4 inline-flex rounded-xl bg-[#DDAA42] px-5 py-3 text-sm font-bold text-[#0B1328]">Call {contactNumber}</a></> : <p className="mt-2 text-sm text-[#68646F]">Our ClearTitle One team will contact you shortly.</p>}<button type="button" onClick={onClose} className="mt-6 block w-full rounded-xl bg-[#121B35] px-5 py-3 text-sm font-bold text-white">Done</button></div>}
          <p className="mt-5 text-center text-[11px] leading-5 text-[#68646F]">By continuing, you consent to storing these details for this request and follow-up.</p>
        </div>
      </div>
    </div>
  );
}
