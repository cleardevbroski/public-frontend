"use client";
import { useState } from "react";
import { Scale, X, Send, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function PostPropertyRail() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Deed Audit");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setQuery("");
      setIsOpen(false);
    }, 2800);
  };

  return (
    <>
      {/* Floating Shield Rail — full label on large screens */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:flex fixed right-0 top-[40%] z-40 bg-[#1E3A8A] text-[#E8C66A] border-l-4 border-[#C9A24E] hover:bg-[#C9A24E] hover:text-white pl-4 pr-5 py-3 rounded-l-2xl shadow-2xl items-center gap-2.5 transition-all duration-300 hover:-translate-x-1.5 hover:scale-102 group cursor-pointer"
        aria-label="Legal Consultation Helpdesk"
      >
        <Scale className="size-5 group-hover:rotate-12 transition-transform duration-300" />
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[10px] text-white/50 tracking-wider uppercase font-bold">CT Unique</span>
          <span className="text-[12px] font-extrabold tracking-wide uppercase">Legal Shield</span>
        </div>
      </button>

      {/* Compact floating button on mobile/tablet */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed right-4 bottom-24 z-40 size-14 rounded-full bg-[#1E3A8A] text-[#E8C66A] border-2 border-[#C9A24E] shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Legal Consultation Helpdesk"
      >
        <Scale className="size-6" />
        <span className="absolute -top-1 -right-1 bg-[#C9A24E] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">CT</span>
      </button>

      {/* Glassmorphic Legal Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[460px] bg-[#1E3A8A] text-white rounded-3xl border border-[#C9A24E]/35 p-6 shadow-2xl relative overflow-hidden">
            {/* Radial background glow */}
            <div className="absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br from-[#E8C66A]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center text-white">
                  <Scale className="size-5.5 text-[#E8C66A]" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-[#E8C66A]">Ask a Real Estate Lawyer</h3>
                  <p className="text-[12px] text-white/55">Assigned counsel reviews within 2 hours</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Close dialog"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                    Consultation Topic
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    {[
                      "Deed Audit",
                      "RERA Query",
                      "Joint Venture",
                      "Inheritance Check",
                    ].map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`py-2 px-3 rounded-xl font-bold border transition-all text-center ${
                          category === cat
                            ? "bg-[#C9A24E] text-white border-transparent"
                            : "bg-white/5 text-white/80 border-white/15 hover:bg-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                    Describe your property issue
                  </label>
                  <textarea
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={4}
                    placeholder="Enter details about title deeds, encumbrance certificates, builder extensions, or plot boundaries..."
                    className="w-full p-3.5 bg-white/10 border border-white/15 rounded-2xl text-[13px] text-white outline-none focus:border-[#E8C66A] transition-colors resize-none placeholder:text-white/40 leading-relaxed"
                  />
                </div>

                <div className="bg-[#C9A24E]/15 border border-[#C9A24E]/25 p-3 rounded-xl flex items-center gap-2.5 text-[11px] text-white/85">
                  <ShieldCheck className="size-4.5 text-[#E8C66A] shrink-0" />
                  <span>Submission assigned only to Bar Council registered attorneys.</span>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-[#D4AF37] to-[#E8C66A] hover:from-[#C5A55A] hover:to-[#D4AF37] text-[#1E3A8A] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="size-4" />
                  Send Query to Legal Panel
                </button>
              </form>
            ) : (
              <div className="text-center py-8 animate-in zoom-in duration-300 relative z-10">
                <CheckCircle2 className="size-14 text-[#C9A24E] mx-auto mb-4 animate-bounce" />
                <h4 className="text-[18px] font-bold text-white">Query Lodged Successfully!</h4>
                <p className="text-[13px] text-white/60 mt-2 max-w-xs mx-auto">
                  Assigned category: <span className="text-[#E8C66A] font-semibold">{category}</span>.
                  A Bar Council auditor is verifying your details. Check your phone updates.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
