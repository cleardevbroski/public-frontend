"use client";
import { useState } from "react";
import Link from "@/components/Link";

const COOKIE_CHOICE = "cleartitle_cookie_notice";

export default function CookieBanner() {
  const [hidden, setHidden] = useState(() => typeof window !== "undefined" && Boolean(window.localStorage.getItem(COOKIE_CHOICE)));
  if (hidden) return null;
  return (
    <div data-public-bottom-bar className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4E0E7] shadow-lg">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex flex-col md:flex-row items-start md:items-center gap-3">
        <p className="text-[12px] text-[#3F3D46] flex-1">
          This site uses cookies to improve your experience. By browsing, you agree to our{" "}
          <Link href="/privacy-policy" className="font-semibold text-[#805A0B] hover:underline">
            Privacy Policy
          </Link>{" "}
          &{" "}
          <Link href="/terms" className="font-semibold text-[#805A0B] hover:underline">
            Terms of Use
          </Link>
          .
        </p>
        <button
          onClick={() => { window.localStorage.setItem(COOKIE_CHOICE, "acknowledged"); setHidden(true); }}
          className="public-interactive bg-[#121B35] text-white hover:bg-[#273559] font-semibold text-[13px] px-5 h-9 rounded-lg shadow-sm"
        >
          Understood
        </button>
      </div>
    </div>
  );
}
