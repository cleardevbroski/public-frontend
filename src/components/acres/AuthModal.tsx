"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail, ShieldCheck, Smartphone, UserRound, X } from "lucide-react";
import { createManualSession, updateProfile as saveProfile } from "@/lib/api";
import { useAuth, type UserProfile } from "./AuthContext";
import TruecallerButton, { type TruecallerAuthResult } from "./TruecallerButton";

type Step = "details" | "profile";

const inputClass = "h-12 w-full rounded-xl border border-[#CFCBD3] bg-white px-4 text-[15px] text-[#121B35] outline-none transition-colors placeholder:text-[#77717D] focus:border-[#B98428] focus:ring-2 focus:ring-[#DDAA42]/20 disabled:bg-[#F4F3F5]";

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useAuth();
  const [step, setStep] = useState<Step>("details");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pendingAuth, setPendingAuth] = useState<TruecallerAuthResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthModalOpen) return null;

  function resetAndClose() {
    setIsAuthModalOpen(false);
    window.setTimeout(() => {
      setStep("details");
      setPhone("");
      setName("");
      setEmail("");
      setPendingAuth(null);
      setError("");
    }, 200);
  }

  function normalizedUser(user: Partial<UserProfile>): UserProfile {
    return {
      id: user.id,
      phone: String(user.phone || phone),
      name: String(user.name || name),
      email: String(user.email || email),
      role: user.role,
      isVerified: user.isVerified,
      verificationSource: user.verificationSource,
    };
  }

  const handleTruecallerVerified = async (result: TruecallerAuthResult) => {
    const user = normalizedUser(result.user || {});
    if (result.profileComplete === false || !user.name.trim() || !user.email.trim()) {
      setPendingAuth({ ...result, user });
      setPhone(user.phone);
      setName(user.name);
      setEmail(user.email);
      setStep("profile");
      return;
    }
    login(user, result.token);
    resetAndClose();
  };

  const handleManual = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit Indian mobile number.");
    setIsLoading(true);
    setError("");
    try {
      const result = await createManualSession({ name: name.trim(), email: email.trim(), phone });
      login(normalizedUser(result.user), result.token);
      resetAndClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!pendingAuth) return setError("Your Truecaller session has expired. Please start again.");
    setIsLoading(true);
    setError("");
    try {
      const profile = await saveProfile({ name: name.trim(), email: email.trim() });
      login(normalizedUser(profile.user || { ...pendingAuth.user, name: name.trim(), email: email.trim() }), pendingAuth.token);
      resetAndClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071633]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="customer-auth-title">
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(7,22,51,.28)]">
        <button type="button" onClick={resetAndClose} className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-[.98]" aria-label="Close login"><X className="size-4" /></button>
        <div className="bg-[#121B35] px-7 pb-6 pt-8 text-white">
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#F2C052] text-[#121B35]"><ShieldCheck className="size-5" /></div>
          <h2 id="customer-auth-title" className="text-2xl font-bold">{step === "profile" ? "Complete your details" : "Continue to ClearTitle"}</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/75">{step === "profile" ? "Add any information missing from your verified Truecaller profile." : "Use Truecaller on Android or enter your contact details manually."}</p>
        </div>

        <div className="p-6">
          {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">{error}</div>}

          {step === "details" && <>
            <TruecallerButton purpose="login" onVerified={handleTruecallerVerified} onError={setError} />
            <div className="my-5 flex items-center gap-3 text-xs font-semibold text-[#68646F]"><span className="h-px flex-1 bg-[#DEDADF]" /><span>Enter details manually</span><span className="h-px flex-1 bg-[#DEDADF]" /></div>
            <form onSubmit={handleManual} className="space-y-4">
              <label className="block text-sm font-bold text-[#121B35]">Full name<div className="relative mt-2"><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your full name" className={`${inputClass} pl-11`} autoFocus /><UserRound className="pointer-events-none absolute left-4 top-3.5 size-5 text-[#77717D]" /></div></label>
              <label className="block text-sm font-bold text-[#121B35]">Email address<div className="relative mt-2"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" className={`${inputClass} pl-11`} /><Mail className="pointer-events-none absolute left-4 top-3.5 size-5 text-[#77717D]" /></div></label>
              <label className="block text-sm font-bold text-[#121B35]">Mobile number<div className="relative mt-2"><span className="absolute inset-y-0 left-0 flex items-center border-r border-[#DEDADF] px-3 text-sm font-semibold text-[#3F3D46]">+91</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile number" className={`${inputClass} pl-16 pr-11`} /><Smartphone className="pointer-events-none absolute right-4 top-3.5 size-5 text-[#77717D]" /></div></label>
              <button disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-4 text-sm font-bold text-[#0B1328] hover:bg-[#C99734] active:scale-[.98] disabled:opacity-55">{isLoading && <Loader2 className="size-4 animate-spin" />}Save and continue</button>
            </form>
          </>}

          {step === "profile" && <form onSubmit={handleProfile} className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" /><p className="text-sm leading-5 text-emerald-900">Mobile number +91 {phone} was verified by Truecaller.</p></div>
            <label className="block text-sm font-bold text-[#121B35]">Full name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your full name" className={`${inputClass} mt-2`} autoFocus /></label>
            <label className="block text-sm font-bold text-[#121B35]">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" className={`${inputClass} mt-2`} /></label>
            <button disabled={isLoading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-4 text-sm font-bold text-[#0B1328] active:scale-[.98] disabled:opacity-55">{isLoading && <Loader2 className="size-4 animate-spin" />}Save and continue</button>
          </form>}

          <p className="mt-6 text-center text-[11px] leading-5 text-[#68646F]">By continuing, you agree to ClearTitle One's terms and consent to storing these details for requested services and follow-up.</p>
        </div>
      </div>
    </div>
  );
}
