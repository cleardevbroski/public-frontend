"use client";
import { useState } from "react";

export default function CookieBanner() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E4E0E7] shadow-lg">
      <div className="max-w-[1200px] mx-auto px-4 py-3 flex flex-col md:flex-row items-start md:items-center gap-3">
        <p className="text-[12px] text-[#3F3D46] flex-1">
          This site uses cookies to improve your experience. By browsing, you agree to our{" "}
          <a href="/Bangalore-Real-Estate.htm" className="text-[#DDAA42] hover:underline">
            Privacy Policy
          </a>{" "}
          &{" "}
          <a href="/Bangalore-Real-Estate.htm" className="text-[#DDAA42] hover:underline">
            Cookie Policy
          </a>
          .
        </p>
        <button
          onClick={() => setHidden(true)}
          className="bg-gradient-to-r from-[#DDAA42] to-[#273559] hover:from-[#B98428] hover:to-[#DDAA42] transition-all duration-200 text-white font-semibold text-[13px] px-5 h-9 rounded-lg shadow-sm"
        >
          Okay
        </button>
      </div>
    </div>
  );
}
