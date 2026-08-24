"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { getTruecallerVerificationStatus, startTruecallerVerification, type TruecallerPurpose } from "@/lib/api";
import type { UserProfile } from "./AuthContext";

export type TruecallerAuthResult = {
  token: string;
  user: UserProfile;
  profileComplete?: boolean;
};

type Props = {
  purpose: TruecallerPurpose;
  onVerified: (result: TruecallerAuthResult) => void | Promise<void>;
  onError: (message: string) => void;
};

export function isAndroidBrowser() {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}

export default function TruecallerButton({ purpose, onVerified, onError }: Props) {
  const [eligible, setEligible] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [busy, setBusy] = useState(false);
  const verifiedRef = useRef(onVerified);
  const errorRef = useRef(onError);

  useEffect(() => setEligible(isAndroidBrowser()), []);
  useEffect(() => { verifiedRef.current = onVerified; }, [onVerified]);
  useEffect(() => { errorRef.current = onError; }, [onError]);

  useEffect(() => {
    if (!requestId) return;
    let active = true;
    let attempts = 0;
    let timer = 0;

    const poll = async () => {
      if (!active) return;
      attempts += 1;
      try {
        const result = await getTruecallerVerificationStatus(requestId);
        if (!active) return;
        if (result.status === "verified") {
          setBusy(false);
          setRequestId("");
          await verifiedRef.current(result);
          return;
        }
        if (["rejected", "failed"].includes(result.status)) {
          setBusy(false);
          setRequestId("");
          errorRef.current(result.status === "rejected" ? "Truecaller verification was cancelled. Enter your details manually." : "Truecaller could not verify this device. Enter your details manually.");
          return;
        }
      } catch (cause) {
        if (!active) return;
        setBusy(false);
        setRequestId("");
        errorRef.current(cause instanceof Error ? cause.message : "Truecaller verification could not be completed.");
        return;
      }
      if (attempts >= 8) {
        setBusy(false);
        setRequestId("");
        errorRef.current("Truecaller did not respond. Enter your details manually.");
        return;
      }
      timer = window.setTimeout(poll, 3000);
    };

    timer = window.setTimeout(poll, 1500);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [requestId]);

  if (!eligible) return null;

  const start = async () => {
    setBusy(true);
    onError("");
    try {
      const result = await startTruecallerVerification(purpose);
      setRequestId(result.requestId);
      window.location.assign(result.deepLink);
    } catch (cause) {
      setBusy(false);
      onError(cause instanceof Error ? cause.message : "Unable to start Truecaller verification.");
    }
  };

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => void start()} disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1677D2] px-4 text-sm font-bold text-white transition-colors hover:bg-[#1269BB] active:scale-[.98] disabled:opacity-60">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        {busy ? "Waiting for Truecaller" : "Continue with Truecaller"}
      </button>
      {busy && <p role="status" className="text-center text-xs leading-5 text-[#68646F]">Approve the consent screen in Truecaller, then return here.</p>}
    </div>
  );
}
