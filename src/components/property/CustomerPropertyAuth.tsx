"use client";

import { useState } from "react";
import { KeyRound, Loader2, LockKeyhole, Smartphone } from "lucide-react";
import { sendOtp, verifyOtp } from "@/lib/api";
import { useAuth } from "@/components/acres/AuthContext";

export default function CustomerPropertyAuth() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const inputClass = "w-full h-11 rounded-xl border border-[#E4E0E7] px-10 text-[14px] text-[#121B35] outline-none focus:border-[#DDAA42]";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit Indian mobile number.");
    if (otpSent && otp.length !== 6) return setError("Enter the 6-digit OTP.");
    setBusy(true);
    try {
      if (!otpSent) {
        await sendOtp(phone);
        setOtpSent(true);
      } else {
        const data = await verifyOtp(phone, otp);
        login(data.user, data.token);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to continue");
    } finally {
      setBusy(false);
    }
  };

  return <div className="mx-auto max-w-[520px] rounded-3xl border border-[#E4E0E7]/60 bg-white p-6 shadow-lg md:p-8">
    <div className="flex size-12 items-center justify-center rounded-2xl bg-[#FFF8E8] text-[#DDAA42]"><LockKeyhole className="size-6" /></div>
    <h2 className="mt-4 text-[25px] font-bold text-[#121B35]">Verify your mobile number</h2>
    <p className="mt-1.5 text-[13.5px] text-[#68646F]">Use a one-time password to post property and track your submissions. No email or password is required.</p>
    <form onSubmit={submit} className="mt-6 space-y-4">
      <Field icon={Smartphone}><input className={inputClass} value={phone} disabled={otpSent} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" inputMode="numeric" required /></Field>
      {otpSent && <Field icon={KeyRound}><input autoFocus inputMode="numeric" className={inputClass} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-digit OTP" required /></Field>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
      <button disabled={busy} className="btn-gold flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold disabled:opacity-60">{busy && <Loader2 className="size-4 animate-spin" />}{otpSent ? "Verify & Continue" : "Send OTP"}</button>
    </form>
    {otpSent && <button type="button" onClick={() => { setOtpSent(false); setOtp(""); setError(""); }} className="mt-5 w-full text-[13px] font-semibold text-[#121B35] hover:text-[#DDAA42]">Use a different number</button>}
  </div>;
}

function Field({ icon: Icon, children }: { icon: typeof Smartphone; children: React.ReactNode }) {
  return <div className="relative"><Icon className="absolute left-3.5 top-3.5 size-4 text-[#DDAA42]" />{children}</div>;
}
