"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useLocation } from "react-router-dom";

type Props = {
  variant?: "floating" | "toolbar";
  onRefresh?: () => void;
};

const formRoutes = [
  /^\/admin\/post(?:\/|$)/,
  /^\/postproperty(?:\/|$)/,
  /^\/cp-registration(?:\/|$)/,
  /^\/channel-partner\/client-registration(?:\/|$)/,
];

export default function RefreshPageButton({ variant = "floating", onRefresh }: Props) {
  const { pathname } = useLocation();
  const timeoutRef = useRef<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  const refresh = () => {
    if (refreshing) return;
    const couldLoseFormData = formRoutes.some((route) => route.test(pathname));
    if (couldLoseFormData && !window.confirm("Refresh this page? Any unsaved form changes will be lost.")) return;
    setRefreshing(true);
    timeoutRef.current = window.setTimeout(() => {
      if (onRefresh) onRefresh();
      else window.location.reload();
    }, 120);
  };

  if (variant === "toolbar") {
    return <button type="button" onClick={refresh} disabled={refreshing} aria-label={refreshing ? "Refreshing page" : "Refresh page"} title="Refresh page" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#E4E0E7]/60 bg-[#F8F7FA] px-3 text-[12px] font-bold text-[#596277] transition-colors hover:bg-[#F3F1F5] hover:text-[#121B35] disabled:cursor-wait disabled:opacity-70">
      <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
      <span className="hidden xl:inline">{refreshing ? "Refreshing" : "Refresh"}</span>
    </button>;
  }

  return <button type="button" onClick={refresh} disabled={refreshing} aria-label={refreshing ? "Refreshing page" : "Refresh page"} title="Refresh page" className="fixed bottom-24 left-4 z-40 inline-flex h-11 items-center gap-2 rounded-full border border-[#DDE2EA] bg-[#172039] px-4 text-[12px] font-bold text-white shadow-[0_12px_32px_rgba(11,19,40,.22)] transition-all hover:-translate-y-0.5 hover:bg-[#273559] hover:shadow-[0_16px_36px_rgba(11,19,40,.28)] disabled:cursor-wait disabled:opacity-80 lg:bottom-5 lg:left-5">
    <RefreshCw className={`size-4 text-[#F2C052] ${refreshing ? "animate-spin" : ""}`} />
    <span>{refreshing ? "Refreshing" : "Refresh"}</span>
  </button>;
}
