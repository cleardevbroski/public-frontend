"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileDown, Loader2, X } from "lucide-react";
import { createManualSession, updateProfile as saveProfile } from "@/lib/api";
import { useAuth } from "./AuthContext";
import TruecallerButton, { type TruecallerAuthResult } from "./TruecallerButton";

type Props = {
  open: boolean;
  documentName: string;
  onClose: () => void;
  onVerified: () => Promise<void>;
};

export default function DocumentAccessModal({ open, documentName, onClose, onVerified }: Props) {
  const { user, login, updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pendingAuth, setPendingAuth] = useState<TruecallerAuthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setPendingAuth(null);
    setError("");
  }, [open, documentName, user]);

  if (!open) return null;

  const acceptTruecaller = async (result: TruecallerAuthResult) => {
    setName(result.user.name || "");
    setEmail(result.user.email || "");
    setPhone(result.user.phone || "");
    setError("");
    if (result.profileComplete !== false && result.user.name && result.user.email) {
      setLoading(true);
      try {
        login(result.user, result.token);
        await onVerified();
        onClose();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to download this document.");
      } finally {
        setLoading(false);
      }
      return;
    }
    setPendingAuth(result);
  };

  const continueDownload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit Indian mobile number.");
    setLoading(true);
    setError("");
    try {
      if (user) {
        const profile = await saveProfile({ name: name.trim(), email: email.trim() });
        updateProfile(profile.user || { name: name.trim(), email: email.trim() });
      } else if (pendingAuth) {
        const profile = await saveProfile({ name: name.trim(), email: email.trim() });
        login(profile.user || { ...pendingAuth.user, name: name.trim(), email: email.trim() }, pendingAuth.token);
      } else {
        const manual = await createManualSession({ name: name.trim(), email: email.trim(), phone });
        login(manual.user, manual.token);
      }
      await onVerified();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save your details and download.");
    } finally {
      setLoading(false);
    }
  };

  const phoneVerified = Boolean(pendingAuth || user?.isVerified);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071633]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Enter details to download document">
      <div className="relative max-h-[94vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/15" aria-label="Close"><X className="size-5" /></button>
        <div className="bg-[#121B35] px-7 py-7 text-white">
          <FileDown className="mb-3 size-8 text-[#F2C052]" />
          <h2 className="text-xl font-bold">Download document</h2>
          <p className="mt-2 text-sm text-white/75">{documentName}</p>
        </div>
        <div className="p-6">
          {!user && !pendingAuth && <>
            <TruecallerButton purpose="brochure" onVerified={acceptTruecaller} onError={setError} />
            <div className="my-5 flex items-center gap-3 text-xs font-semibold text-[#68646F]"><span className="h-px flex-1 bg-[#DEDADF]" /><span>Enter details manually</span><span className="h-px flex-1 bg-[#DEDADF]" /></div>
          </>}
          <form onSubmit={continueDownload} className="space-y-4">
            {phoneVerified && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><CheckCircle2 className="size-4 text-emerald-700" />Phone verified by Truecaller</div>}
            <label className="block text-sm font-bold text-[#121B35]">Full name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your full name" className="mt-2 w-full rounded-xl border border-[#CFCBD3] px-4 py-3 font-normal outline-none placeholder:text-[#77717D] focus:border-[#B98428]" /></label>
            <label className="block text-sm font-bold text-[#121B35]">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-[#CFCBD3] px-4 py-3 font-normal outline-none placeholder:text-[#77717D] focus:border-[#B98428]" /></label>
            <label className="block text-sm font-bold text-[#121B35]">Mobile number<div className="mt-2 flex overflow-hidden rounded-xl border border-[#CFCBD3] focus-within:border-[#B98428]"><span className="bg-[#F8F7FA] px-3 py-3">+91</span><input value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel" disabled={Boolean(user || pendingAuth)} placeholder="10-digit mobile number" className="min-w-0 flex-1 px-3 py-3 font-normal outline-none placeholder:text-[#77717D] disabled:bg-[#F4F3F5]" /></div></label>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#DDAA42] px-4 py-3.5 text-sm font-bold text-[#0B1328] active:scale-[.98] disabled:opacity-60">{loading ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}Download</button>
          </form>
          <p className="mt-5 text-center text-[11px] leading-5 text-[#68646F]">By continuing, you consent to storing these details for document access and follow-up.</p>
        </div>
      </div>
    </div>
  );
}
