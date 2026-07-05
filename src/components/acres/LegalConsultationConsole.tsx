"use client";
import { useState, useEffect } from "react";
import { Scale, CheckCircle2, ShieldCheck, Clock, UserCheck, Star, Send } from "lucide-react";
import { verifiedLawyers, type Lawyer } from "./mock-data";
import { submitConsultationLead } from "@/lib/api";

const liveFeedData = [
  { text: "Whitefield Survey #43 JDA deeds approved", time: "12 mins ago", lawyer: "Adv. Srinivasan" },
  { text: "Hebbal Luxury Flat encumbrance certificate cleared", time: "34 mins ago", lawyer: "Adv. Meera Chawla" },
  { text: "Sarjapur Layout boundary RERA claim settled", time: "1 hr ago", lawyer: "Adv. Amit Verma" },
  { text: "Koramangala Commercial tenancy agreement audited", time: "2 hrs ago", lawyer: "Adv. Srinivasan" },
];

export default function LegalConsultationConsole() {
  const [activeLawyer, setActiveLawyer] = useState<Lawyer>(verifiedLawyers[0]);
  const [query, setQuery] = useState("");
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("Title Check");
  
  // Rotating live feed ticker index
  const [feedIndex, setFeedIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setFeedIndex((prev) => (prev + 1) % liveFeedData.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !contact.trim()) return;
    try {
      await submitConsultationLead({ name: contact, phone: contact, category, message: query });
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setQuery(""); setContact(""); }, 3500);
    } catch {
      /* keep the form open for retry */
    }
  };

  const currentFeed = liveFeedData[feedIndex];

  return (
    <section id="legal-console" className="bg-[#1E3A8A] text-white py-16 scroll-mt-24 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute -right-36 -top-36 w-[500px] h-[500px] bg-gradient-to-br from-[#E8C66A]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 bottom-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#C9A24E]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#D4AF37] to-[#E8C66A] text-[#1E3A8A] text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-md tracking-[0.2em] uppercase mb-4">
            <Scale className="size-3.5" />
            CT Legal Shield • Direct Lawyer Consultations
          </span>
          <h2 className="text-[32px] md:text-[40px] font-bold tracking-tight leading-none" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
            Real lawyers. Real verification. Instant queries resolved.
          </h2>
          <p className="text-[14px] text-white/70 mt-3 max-w-2xl mx-auto font-light">
            We don&apos;t just list properties — we verify them legally. Consult our panel of registered real estate attorneys to audit titles, review agreements, and resolve disputes.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 mt-10">
          
          {/* Left Panel: Verified Lawyers Directory */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-bold tracking-wider text-[#E8C66A] uppercase">Active Verification Counsel</span>
                <span className="text-[11px] text-[#C9A24E] font-bold flex items-center gap-1.5 bg-[#C9A24E]/15 px-2.5 py-1 rounded-full border border-[#C9A24E]/25">
                  <UserCheck className="size-3.5" />
                  Bar Council Registered
                </span>
              </div>

              {/* Roster List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
                {verifiedLawyers.map((lawyer) => (
                  <button
                    key={lawyer.id}
                    onClick={() => setActiveLawyer(lawyer)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      activeLawyer.id === lawyer.id
                        ? "bg-gradient-to-br from-[#C9A24E]/20 to-[#E3C25A]/5 border-[#C9A24E] shadow-lg scale-[1.02]"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-full overflow-hidden border border-white/20 shrink-0">
                        <img src={lawyer.image} alt={lawyer.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="leading-tight">
                        <h4 className="text-[13px] font-bold truncate max-w-[100px]">{lawyer.name.split(" ").slice(1).join(" ")}</h4>
                        <span className="text-[10px] text-[#E8C66A] font-bold flex items-center gap-0.5 mt-0.5">
                          <Star className="size-3 fill-[#E8C66A] text-transparent" />
                          {lawyer.rating}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Lawyer Profile Card */}
              <div className="bg-[#1E3A8A]/60 border border-[#C9A24E]/25 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 shrink-0 shadow-md">
                  <img src={activeLawyer.image} alt={activeLawyer.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h4 className="text-[18px] font-bold text-white leading-none">{activeLawyer.name}</h4>
                    <span className="text-[11px] text-[#E8C66A] font-bold">{activeLawyer.experience}</span>
                  </div>
                  <p className="text-[11px] text-[#C9A24E] font-bold uppercase tracking-wider">{activeLawyer.specialty}</p>
                  
                  <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#C9A24E]/20 mt-3 text-[12px] text-white/80">
                    <div>
                      <span className="text-[9.5px] text-white/40 block">BAR REGISTRATION</span>
                      <span className="font-semibold text-white mt-0.5 block">{activeLawyer.barCouncil}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-white/40 block">RECORDED DEEDS AUDITED</span>
                      <span className="font-semibold text-[#D4AF37] mt-0.5 block">{activeLawyer.cases}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Feed Ticker */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3.5 text-[12.5px] min-h-[44px]">
              <div className="flex items-center gap-1.5 text-[#E8C66A] font-bold bg-[#E8C66A]/10 border border-[#E8C66A]/25 px-3 py-1.5 rounded-xl shrink-0 uppercase text-[10px] tracking-wider">
                <Clock className="size-3.5 text-[#E8C66A] animate-pulse" />
                Live Deed Audits
              </div>
              <p className="text-white/85 text-left italic truncate flex-1 leading-snug">
                &ldquo;{currentFeed.text}&rdquo; <span className="text-[#C9A24E] not-italic font-bold">({currentFeed.lawyer})</span>
              </p>
              <span className="text-[11px] text-white/45 whitespace-nowrap shrink-0">{currentFeed.time}</span>
            </div>
          </div>

          {/* Right Panel: Submit Legal Query Form */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-[#E8C66A] uppercase block mb-1">Interactive Helpdesk</span>
              <h3 className="text-[20px] font-bold text-white mb-6">Submit Encumbrance & Deed Queries</h3>
              
              {!submitted ? (
                <form onSubmit={handleQuerySubmit} className="space-y-4 text-left">
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { label: "Deed Verification", val: "Title Check" },
                      { label: "RERA Review", val: "RERA Audit" },
                      { label: "JDA/Agreement", val: "JDA Review" },
                    ].map((btn) => (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => setCategory(btn.val)}
                        className={`py-2.5 rounded-xl font-bold text-[11px] border transition-all text-center ${
                          category === btn.val
                            ? "bg-[#C9A24E] text-white border-transparent shadow"
                            : "bg-white/5 text-white/80 border-white/15 hover:bg-white/10"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-white/50 mb-1">YOUR EMAIL / MOBILE NUMBER</label>
                    <input
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="e.g. rahul@example.com or +91 9876543210"
                      className="w-full h-11 px-3 bg-white/10 border border-white/15 rounded-xl text-[13px] text-white outline-none focus:border-[#E8C66A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-white/50 mb-1">DESCRIBE DEED CONFLICT OR VERIFICATION CLAUSE</label>
                    <textarea
                      required
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      rows={3}
                      placeholder="Explain layout boundaries, JDA details, encumbrance issues, or joint owner signatures to review..."
                      className="w-full p-3.5 bg-white/10 border border-white/15 rounded-xl text-[13px] text-white outline-none focus:border-[#E8C66A] resize-none placeholder:text-white/45"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-[#D4AF37] to-[#E8C66A] hover:from-[#C5A55A] hover:to-[#D4AF37] text-[#1E3A8A] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send className="size-4" />
                    Submit Query to Legal Panel
                  </button>
                </form>
              ) : (
                <div className="text-center py-10 animate-in zoom-in duration-300">
                  <CheckCircle2 className="size-14 text-[#C9A24E] mx-auto mb-4 animate-bounce" />
                  <h4 className="text-[20px] font-bold text-white">Query Assigned to Lawyer</h4>
                  <p className="text-[13.5px] text-white/70 mt-2 max-w-sm mx-auto leading-relaxed">
                    Your request has been forwarded to <span className="text-[#E8C66A] font-semibold">{activeLawyer.name}</span>. 
                    Deed analysis reports and Bar Council reviews are compiled dynamically. Response expected within 2 hours.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Note */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2.5 text-[11px] text-white/60">
              <ShieldCheck className="size-4.5 text-[#C9A24E] shrink-0" />
              <span>Attorneys verify titles using Karnataka municipal land records registers.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
