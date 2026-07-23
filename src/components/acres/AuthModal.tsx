"use client";

import { useState } from "react";
import { X, Smartphone, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { sendOtp, verifyOtp } from "@/lib/api";

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [devMode, setDevMode] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    
    setIsLoading(true);
    setError("");

    try {
      const data = await sendOtp(phone);
      setStep("otp");
      
      // If backend is in dev mode, show a hint
      if (data.mode === "dev") {
        setDevMode(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send OTP";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await verifyOtp(phone, otp);
      
      // Call login with user data and token
      login(data.user, data.token);
      setIsAuthModalOpen(false);

      // Reset state for next time
      setTimeout(() => {
        setStep("phone");
        setPhone("");
        setOtp("");
        setError("");
        setDevMode(false);
      }, 300);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to verify OTP";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp("");
    setError("");
    setIsLoading(true);
    try {
      await sendOtp(phone);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend OTP";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-[400px] bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 z-10 size-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
        >
          <X className="size-4 text-[#121B35]" />
        </button>

        {/* Header Graphic */}
        <div className="h-32 bg-gradient-to-br from-[#121B35] via-[#273559] to-[#DDAA42] p-6 flex flex-col justify-end relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#DDAA42]/20 rounded-full blur-2xl" />
          <h2 className="text-white text-2xl font-bold relative z-10" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
            {step === "phone" ? "Welcome Back" : "Verify Number"}
          </h2>
          <p className="text-white/80 text-sm relative z-10">
            {step === "phone" ? "Login or register to continue" : `Code sent to +91 ${phone}`}
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Dev mode notice */}
          {devMode && step === "otp" && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs">
              🛠️ <strong>Dev Mode:</strong> Check the backend console for your OTP code.
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#68646F] uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center px-3 border-r border-[#E4E0E7]/50 bg-slate-50 text-[#121B35] font-semibold text-sm rounded-l-xl">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10 digit number"
                    className="w-full h-12 pl-16 pr-4 rounded-xl border border-[#E4E0E7] focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/20 outline-none text-[#121B35] font-semibold transition-all placeholder:font-normal placeholder:text-[#68646F]/60"
                    autoFocus
                    required
                    disabled={isLoading}
                  />
                  <Smartphone className="absolute right-4 size-5 text-[#68646F]/50 pointer-events-none" />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={phone.length < 10 || isLoading}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#121B35] text-[#F2C052] font-bold hover:bg-[#DDAA42] hover:text-[#0B1328] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    Get OTP
                    <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[#68646F] uppercase tracking-wider mb-2">
                  Enter 6-Digit OTP
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    className="w-full h-12 px-4 text-center tracking-[0.8em] rounded-xl border border-[#E4E0E7] focus:border-[#DDAA42] focus:ring-2 focus:ring-[#DDAA42]/20 outline-none text-[20px] text-[#121B35] font-bold transition-all placeholder:tracking-normal placeholder:text-sm placeholder:text-[#68646F]/60"
                    autoFocus
                    required
                    disabled={isLoading}
                  />
                  <ShieldCheck className="absolute right-4 size-5 text-[#68646F]/50 pointer-events-none" />
                </div>
                <div className="mt-3 flex justify-between items-center text-xs">
                  <span className="text-[#68646F]">Didn&apos;t receive it?</span>
                  <button type="button" onClick={handleResend} className="text-[#DDAA42] font-bold hover:underline" disabled={isLoading}>
                    Resend Code
                  </button>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={otp.length < 6 || isLoading}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DDAA42] to-[#F2C052] text-[#121B35] font-bold hover:from-[#B98428] hover:to-[#DDAA42] shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  "Verify & Login"
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => { setStep("phone"); setError(""); }}
                className="w-full py-2 text-center text-xs font-semibold text-[#68646F] hover:text-[#121B35]"
                disabled={isLoading}
              >
                Change mobile number
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-[11px] text-[#68646F]/80 leading-relaxed">
            By proceeding, you agree to ClearTitle One&apos;s <br/>
            <a href="#" className="underline hover:text-[#DDAA42]">Terms of Service</a> & <a href="#" className="underline hover:text-[#DDAA42]">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}
