"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, LockKeyhole, MailCheck } from "lucide-react";
import { requestPropertyEmailOtp, verifyPropertyEmailOtp } from "@/lib/api";
import { useAuth } from "@/components/acres/AuthContext";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailPropertyAuth() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [devOtp, setDevOtp] = useState("");

  useEffect(() => {
    if (!resendIn) return;
    const timer = window.setInterval(() => setResendIn((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const requestCode = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!EMAIL.test(normalized)) return setError("Enter a valid email address.");
    setBusy(true);
    setError("");
    try {
      const data = await requestPropertyEmailOtp(normalized);
      setEmail(normalized);
      setCodeSent(true);
      setOtp("");
      setResendIn(data.resendAfterSeconds || 60);
      setDevOtp(data.devOtp || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send the verification code.");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError("Enter the six-digit code from your email.");
    setBusy(true);
    setError("");
    try {
      const data = await verifyPropertyEmailOtp(email, otp);
      login(data.user, data.token);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to verify the email code.");
    } finally {
      setBusy(false);
    }
  };

  const inputClass = "mt-2 h-12 w-full rounded-xl border border-[#CFCBD3] bg-white px-4 text-[15px] text-[#121B35] outline-none placeholder:text-[#77717D] focus:border-[#B98428] focus:ring-2 focus:ring-[#DDAA42]/20";

  return (
    <section className="mx-auto max-w-[540px] rounded-2xl border border-[#E4E0E7] bg-white p-6 shadow-[0_18px_50px_rgba(18,27,53,0.08)] md:p-8" aria-labelledby="property-email-auth-title">
      <div className="flex size-12 items-center justify-center rounded-xl bg-[#FFF8E8] text-[#9A7620]">
        {codeSent ? <MailCheck className="size-6" /> : <LockKeyhole className="size-6" />}
      </div>
      <h2 id="property-email-auth-title" className="mt-4 text-[25px] font-bold text-[#121B35]">{codeSent ? "Check your email" : "Sign in with email"}</h2>
      <p className="mt-2 text-[13.5px] leading-6 text-[#595560]">
        {codeSent ? <>Enter the six-digit code sent to <strong className="text-[#121B35]">{email}</strong>.</> : "Verify your email to post, save drafts and track property approvals. No phone OTP is required."}
      </p>

      {!codeSent ? (
        <form onSubmit={requestCode} className="mt-6">
          <label className="block text-sm font-bold text-[#121B35]">Email address
            <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} autoComplete="email" placeholder="you@example.com" className={inputClass} />
          </label>
          <button disabled={busy} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-5 text-[14px] font-bold text-[#0B1328] hover:bg-[#F2C052] active:scale-[0.98] disabled:opacity-60">
            {busy && <Loader2 className="size-4 animate-spin" />} Send verification code
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="mt-6">
          <label className="block text-sm font-bold text-[#121B35]">Verification code
            <input value={otp} onChange={(event) => { setOtp(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" className={`${inputClass} text-center text-xl font-bold tracking-[0.35em]`} autoFocus />
          </label>
          {devOtp && <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">Local development code: <strong>{devOtp}</strong></p>}
          <button disabled={busy} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-5 text-[14px] font-bold text-[#0B1328] hover:bg-[#F2C052] active:scale-[0.98] disabled:opacity-60">
            {busy && <Loader2 className="size-4 animate-spin" />} Verify and continue
          </button>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <button type="button" onClick={() => { setCodeSent(false); setOtp(""); setError(""); }} className="inline-flex items-center gap-1 font-semibold text-[#4D4952] hover:text-[#121B35]"><ArrowLeft className="size-3.5" /> Change email</button>
            <button type="button" disabled={busy || resendIn > 0} onClick={() => void requestCode()} className="font-bold text-[#9A7620] disabled:text-[#8A858F]">{resendIn ? `Resend in ${resendIn}s` : "Resend code"}</button>
          </div>
        </form>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
      <p className="mt-5 text-xs leading-5 text-[#68646F]">Your verified email becomes the account used for drafts, submissions and status updates.</p>
    </section>
  );
}
