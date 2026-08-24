"use client";

import { useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { updateProfile } from "@/lib/api";
import { useAuth } from "@/components/acres/AuthContext";
import TruecallerButton, { type TruecallerAuthResult } from "@/components/acres/TruecallerButton";

export default function CustomerPropertyAuth() {
  const { login } = useAuth();
  const [pendingAuth, setPendingAuth] = useState<TruecallerAuthResult | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputClass = "h-11 w-full rounded-xl border border-[#CFCBD3] px-4 text-[14px] text-[#121B35] outline-none placeholder:text-[#77717D] focus:border-[#B98428]";

  const acceptTruecaller = (result: TruecallerAuthResult) => {
    if (result.profileComplete !== false && result.user.name && result.user.email) {
      login(result.user, result.token);
      return;
    }
    setPendingAuth(result);
    setName(result.user.name || "");
    setEmail(result.user.email || "");
    setError("");
  };

  const completeProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pendingAuth) return;
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    setBusy(true);
    setError("");
    try {
      const profile = await updateProfile({ name: name.trim(), email: email.trim() });
      login(profile.user || { ...pendingAuth.user, name: name.trim(), email: email.trim() }, pendingAuth.token);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save your details.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="mx-auto max-w-[520px] rounded-3xl border border-[#E4E0E7]/60 bg-white p-6 shadow-lg md:p-8">
    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#FFF8E8] text-[#DDAA42]"><LockKeyhole className="size-6" /></div>
    <h2 className="mt-4 text-[25px] font-bold text-[#121B35]">Verify before posting</h2>
    <p className="mt-1.5 text-[13.5px] leading-6 text-[#68646F]">Property submissions and tracking require a verified account. Continue with Truecaller on an Android device.</p>
    <div className="mt-6">
      {!pendingAuth ? <TruecallerButton purpose="login" onVerified={acceptTruecaller} onError={setError} /> : <form onSubmit={completeProfile} className="space-y-4">
        <p className="text-sm text-[#68646F]">Your phone is verified. Complete the missing details to continue.</p>
        <label className="block text-sm font-bold text-[#121B35]">Full name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your full name" className={`${inputClass} mt-2`} /></label>
        <label className="block text-sm font-bold text-[#121B35]">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" className={`${inputClass} mt-2`} /></label>
        <button disabled={busy} className="btn-gold flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold disabled:opacity-60">{busy && <Loader2 className="size-4 animate-spin" />}Save and continue</button>
      </form>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
      <p className="mt-5 text-xs leading-5 text-[#68646F]">Manual guest details can be used for enquiries and downloads, but cannot access private property submissions.</p>
    </div>
  </div>;
}
