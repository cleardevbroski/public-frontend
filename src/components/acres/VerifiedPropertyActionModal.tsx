"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { sendOtp, submitPropertyInterest, verifyOtp } from "@/lib/api";
import { useAuth } from "./AuthContext";

export type PropertyAction = "brochure" | "call" | "enquiry";

type Props = {
  action: PropertyAction | null;
  propertyId: string;
  propertyTitle: string;
  contactNumber: string;
  onClose: () => void;
  onComplete: (action: PropertyAction) => void;
};

const actionLabel: Record<PropertyAction, string> = {
  brochure: "Download Brochure",
  call: "Reveal Contact Number",
  enquiry: "Send Enquiry",
};

export default function VerifiedPropertyActionModal({ action, propertyId, propertyTitle, contactNumber, onClose, onComplete }: Props) {
  const { login } = useAuth();
  const [step, setStep] = useState<"details" | "otp" | "success">("details");
  const [audience, setAudience] = useState<"buyer" | "builder">("buyer");
  const [budget, setBudget] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!action) return;
    setStep("details");
    setAudience("buyer");
    setBudget("");
    setPhone("");
    setOtp("");
    setError("");
  }, [action]);

  if (!action) return null;

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!budget.trim()) return setError("Please enter your budget.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit Indian mobile number.");
    setLoading(true);
    setError("");
    try {
      await sendOtp(phone);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6) return setError("Enter the 6-digit OTP.");
    setLoading(true);
    setError("");
    try {
      const data = await verifyOtp(phone, otp);
      login(data.user, data.token);
      await submitPropertyInterest({ propertyId, propertyTitle, audience, budget, phone, action });
      setStep("success");
      onComplete(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify your OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#071633]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={actionLabel[action]}>
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/90 hover:bg-white/15" aria-label="Close"><X className="size-5" /></button>
        <div className="bg-gradient-to-br from-[#121B35] via-[#273559] to-[#DDAA42] px-7 pb-6 pt-8 text-white">
          <ShieldCheck className="mb-3 size-8 text-[#F5D77B]" />
          <h2 className="text-2xl font-bold">Get a certified property from ClearTitle One</h2>
          <p className="mt-2 text-sm text-white/85">Thank you. Verify your mobile number to continue with this {actionLabel[action].toLowerCase()} request.</p>
        </div>
        <div className="p-6">
          {step === "details" && <form onSubmit={sendCode} className="space-y-5">
            <div>
              <p className="text-sm font-bold text-[#121B35]">Are you a builder or buyer?</p>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {(["buyer", "builder"] as const).map((role) => <button key={role} type="button" onClick={() => setAudience(role)} className={`rounded-xl border px-4 py-3 text-sm font-bold capitalize transition-colors ${audience === role ? "border-[#DDAA42] bg-[#FFF8E5] text-[#121B35]" : "border-[#E4E0E7] text-[#68646F]"}`}>{role}</button>)}
              </div>
            </div>
            <label className="block text-sm font-bold text-[#121B35]">What is your budget?
              <input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="e.g. ₹80 L – ₹1.2 Cr" className="mt-2 w-full rounded-xl border border-[#E4E0E7] px-4 py-3 text-sm font-normal outline-none focus:border-[#DDAA42]" />
            </label>
            <label className="block text-sm font-bold text-[#121B35]">Mobile number
              <div className="mt-2 flex overflow-hidden rounded-xl border border-[#E4E0E7] focus-within:border-[#DDAA42]"><span className="bg-[#F8F7FA] px-3 py-3 text-sm text-[#3F3D46]">+91</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="10-digit mobile number" className="min-w-0 flex-1 px-3 py-3 text-sm font-normal outline-none" /></div>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-4 py-3.5 text-sm font-bold text-[#0B1328] disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />}Get OTP</button>
          </form>}
          {step === "otp" && <form onSubmit={verifyCode} className="space-y-5">
            <div><h3 className="text-lg font-bold text-[#121B35]">Verify your number</h3><p className="mt-1 text-sm text-[#68646F]">Enter the OTP sent to +91 {phone}.</p></div>
            <input autoFocus value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="6-digit OTP" className="w-full rounded-xl border border-[#E4E0E7] px-4 py-3 text-center text-lg font-bold tracking-[0.45em] outline-none focus:border-[#DDAA42]" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-4 py-3.5 text-sm font-bold text-[#0B1328] disabled:opacity-60">{loading && <Loader2 className="size-4 animate-spin" />}Verify & continue</button>
            <button type="button" onClick={() => { setOtp(""); setError(""); setStep("details"); }} className="w-full text-sm font-bold text-[#121B35]">Change number</button>
          </form>}
          {step === "success" && <div className="py-4 text-center"><CheckCircle2 className="mx-auto size-12 text-green-600" /><h3 className="mt-4 text-xl font-bold text-[#121B35]">Request verified</h3>{action === "call" ? <><p className="mt-2 text-sm text-[#68646F]">Here is the verified contact number for {propertyTitle}.</p><a href={`tel:${contactNumber}`} className="mt-4 inline-flex rounded-xl bg-[#DDAA42] px-5 py-3 text-sm font-bold text-[#0B1328]">Call {contactNumber}</a></> : <p className="mt-2 text-sm text-[#68646F]">Your request for {propertyTitle} has been recorded. Our ClearTitle One team will contact you shortly.</p>}<button type="button" onClick={onClose} className="mt-6 block w-full rounded-xl bg-[#121B35] px-5 py-3 text-sm font-bold text-white">Done</button></div>}
        </div>
      </div>
    </div>
  );
}
