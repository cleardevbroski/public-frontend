"use client";

import { useEffect } from "react";
import { ExternalLink, Phone, X } from "lucide-react";

export default function GovernmentChargesModal({ open, onClose, onRequestCallback }: { open: boolean; onClose: () => void; onRequestCallback: () => void }) {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  return <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#071633]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="government-charges-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#E4E0E7] px-5 py-4 md:px-6">
        <h2 id="government-charges-title" className="text-[20px] font-extrabold text-[#172039]">Applicable Government Charges</h2>
        <button type="button" onClick={onClose} className="rounded-full p-2 text-[#596277] hover:bg-[#F3F4F6]" aria-label="Close government charges"><X className="size-5" /></button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-5 py-5 md:px-6">
        <h3 className="text-[17px] font-extrabold text-[#172039]">Government Charges</h3>
        <p className="mt-1 text-[12px] text-[#667085]">Indicative Karnataka charges. The final amount is determined during registration.</p>

        <div className="mt-5 rounded-xl border border-[#E5E8EE] p-4">
          <h4 className="text-[14px] font-extrabold text-[#172039]">Stamp Duty</h4>
          <ul className="mt-3 space-y-2 text-[12.5px] text-[#596277]">
            <li><strong className="text-[#39445A]">Male ownership:</strong> generally 2%–5%, based on property value</li>
            <li><strong className="text-[#39445A]">Female ownership:</strong> generally 2%–5%, based on property value</li>
            <li><strong className="text-[#39445A]">Joint ownership:</strong> generally 2%–5%, based on property value</li>
          </ul>
          <p className="mt-3 text-[11px] leading-5 text-[#7A8599]">Karnataka applies the same stamp-duty slab basis irrespective of buyer gender. Applicable cess and surcharge may be additional.</p>
        </div>

        <div className="mt-3 rounded-xl border border-[#E5E8EE] p-4">
          <h4 className="text-[14px] font-extrabold text-[#172039]">Registration Charges</h4>
          <p className="mt-2 text-[12.5px] text-[#596277]"><strong className="text-[#39445A]">Generally 2%</strong> of the registration value for property sale deeds.</p>
        </div>

        <p className="mt-4 text-[10.5px] leading-4 text-[#7A8599]">These figures are informational estimates, not a legal quotation. Property value, deed type, location, cess, surcharge and government notifications can affect the payable amount.</p>
        <a href="https://kaverionline.karnataka.gov.in/" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#39445A] underline underline-offset-4">Verify on Karnataka Kaveri Online <ExternalLink className="size-3.5" /></a>

        <button type="button" onClick={onRequestCallback} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#E3A815] px-4 py-3.5 text-[13px] font-extrabold text-[#241B09]"><Phone className="size-4" /> Request More Information or a Callback</button>
      </div>
    </div>
  </div>;
}
