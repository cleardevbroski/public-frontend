"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { sendOtp, updateProfile as saveProfile, verifyOtp } from "@/lib/api";
import { useAuth } from "./AuthContext";

type Props = {
  open: boolean;
  documentName: string;
  onClose: () => void;
  onVerified: () => Promise<void>;
};

export default function DocumentAccessModal({ open, documentName, onClose, onVerified }: Props) {
  const { login, updateProfile } = useAuth();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("details");
    setName("");
    setEmail("");
    setPhone("");
    setOtp("");
    setError("");
  }, [open, documentName]);

  if (!open) return null;

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit Indian mobile number.");
    setLoading(true);
    setError("");
    try {
      await sendOtp(phone);
      setStep("otp");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit OTP.");
    setLoading(true);
    setError("");
    try {
      const auth = await verifyOtp(phone, otp);
      login(auth.user, auth.token);
      const result = await saveProfile({ name: name.trim(), email: email.trim() });
      updateProfile(result.user || { name: name.trim(), email: email.trim() });
      await onVerified();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to verify and download.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071633]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Verify to download document">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/15" aria-label="Close"><X className="size-5" /></button>
        <div className="bg-gradient-to-br from-[#121B35] to-[#273559] px-7 py-7 text-white">
          <ShieldCheck className="mb-3 size-8 text-[#F2C052]" />
          <h2 className="text-xl font-bold">Verify to download</h2>
          <p className="mt-2 text-sm text-white/75">{documentName}</p>
        </div>
        <div className="p-6">
          {step === "details" ? (
            <form onSubmit={requestOtp} className="space-y-4">
              <label className="block text-sm font-bold text-[#121B35]">Name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="mt-1.5 w-full rounded-xl border border-[#E4E0E7] px-4 py-3 font-normal outline-none focus:border-[#DDAA42]" /></label>
              <label className="block text-sm font-bold text-[#121B35]">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-1.5 w-full rounded-xl border border-[#E4E0E7] px-4 py-3 font-normal outline-none focus:border-[#DDAA42]" /></label>
              <label className="block text-sm font-bold text-[#121B35]">Phone number<div className="mt-1.5 flex overflow-hidden rounded-xl border border-[#E4E0E7]"><span className="bg-[#F8F7FA] px-3 py-3">+91</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" className="min-w-0 flex-1 px-3 py-3 font-normal outline-none" /></div></label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-4 py-3.5 text-sm font-bold text-[#0B1328] disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />}Send OTP</button>
            </form>
          ) : (
            <form onSubmit={confirmOtp} className="space-y-4">
              <p className="text-sm text-[#68646F]">Enter the OTP sent to +91 {phone}.</p>
              <input autoFocus value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" className="w-full rounded-xl border border-[#E4E0E7] px-4 py-3 text-center text-lg font-bold tracking-[0.4em] outline-none focus:border-[#DDAA42]" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-4 py-3.5 text-sm font-bold text-[#0B1328] disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />}Verify & download</button>
              <button type="button" onClick={() => setStep("details")} className="w-full text-sm font-bold text-[#121B35]">Change details</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
