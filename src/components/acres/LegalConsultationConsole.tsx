"use client";
import { useState, useEffect } from "react";
import { Scale, CheckCircle2, ShieldCheck, Clock, UserCheck, Star, Send } from "lucide-react";
import { verifiedLawyers, type Lawyer } from "./mock-data";
import { submitConsultationLead, fetchLawyers } from "@/lib/api";
import { trackAnalytics } from "@/lib/analytics";

const liveFeedData = [
  { text: "Whitefield Survey #43 JDA deeds approved", time: "12 mins ago", lawyer: "Adv. Srinivasan" },
  { text: "Hebbal Luxury Flat encumbrance certificate cleared", time: "34 mins ago", lawyer: "Adv. Meera Chawla" },
  { text: "Sarjapur Layout boundary RERA claim settled", time: "1 hr ago", lawyer: "Adv. Amit Verma" },
  { text: "Koramangala Commercial tenancy agreement audited", time: "2 hrs ago", lawyer: "Adv. Srinivasan" },
];

export default function LegalConsultationConsole() {
  const [activeLawyer, setActiveLawyer] = useState<Lawyer>(verifiedLawyers[0]);
  const [lawyers, setLawyers] = useState<Lawyer[]>(verifiedLawyers);
  const [query, setQuery] = useState("");
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("Title Check");

  useEffect(() => {
    fetchLawyers({ status: "approved" })
      .then((rows: any[]) => { if (Array.isArray(rows) && rows.length) { setLawyers(rows); setActiveLawyer(rows[0]); } })
      .catch(() => {});
  }, []);
  
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
      trackAnalytics("legal_query_submitted", { topic: category, lawyerId: activeLawyer.id, lawyerName: activeLawyer.name, source: "home_legal_console" });
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setQuery(""); setContact(""); }, 3500);
    } catch {
      /* keep the form open for retry */
    }
  };

  const currentFeed = liveFeedData[feedIndex];

  return (
    <section id="legal-console" className="bg-[#121B35] text-white py-16 scroll-mt-24 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute -right-36 -top-36 w-[500px] h-[500px] bg-gradient-to-br from-[#F2C052]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 bottom-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#DDAA42]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#DDAA42] to-[#F2C052] text-[#121B35] text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-md tracking-[0.2em] uppercase mb-4">
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
                <span className="text-[11px] font-bold tracking-wider text-[#F2C052] uppercase">Active Verification Counsel</span>
                <span className="text-[11px] text-[#DDAA42] font-bold flex items-center gap-1.5 bg-[#DDAA42]/15 px-2.5 py-1 rounded-full border border-[#DDAA42]/25">
                  <UserCheck className="size-3.5" />
                  Bar Council Registered
                </span>
              </div>

              {/* Roster List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
                {lawyers.map((lawyer) => (
                  <button
                    key={lawyer.id}
                    onClick={() => setActiveLawyer(lawyer)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      activeLawyer.id === lawyer.id
                        ? "bg-gradient-to-br from-[#DDAA42]/20 to-[#273559]/5 border-[#DDAA42] shadow-lg scale-[1.02]"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-full overflow-hidden border border-white/20 shrink-0">
                        <img src={lawyer.image} alt={lawyer.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="leading-tight">
                        <h4 className="text-[13px] font-bold truncate max-w-[100px]">{lawyer.name.split(" ").slice(1).join(" ")}</h4>
                        <span className="text-[10px] text-[#F2C052] font-bold flex items-center gap-0.5 mt-0.5">
                          <Star className="size-3 fill-[#F2C052] text-transparent" />
                          {lawyer.rating}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Lawyer Profile Card */}
              <div className="bg-[#121B35]/60 border border-[#DDAA42]/25 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
                <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-[#DDAA42]/40 shrink-0 shadow-md">
                  <img src={activeLawyer.image} alt={activeLawyer.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h4 className="text-[18px] font-bold text-white leading-none">{activeLawyer.name}</h4>
                    <span className="text-[11px] text-[#F2C052] font-bold">{activeLawyer.experience}</span>
                  </div>
                  <p className="text-[11px] text-[#DDAA42] font-bold uppercase tracking-wider">{activeLawyer.specialty}</p>
                  
                  <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#DDAA42]/20 mt-3 text-[12px] text-white/80">
                    <div>
                      <span className="text-[9.5px] text-white/40 block">BAR REGISTRATION</span>
                      <span className="font-semibold text-white mt-0.5 block">{activeLawyer.barCouncil}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-white/40 block">RECORDED DEEDS AUDITED</span>
                      <span className="font-semibold text-[#DDAA42] mt-0.5 block">{activeLawyer.cases}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Feed Ticker */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3.5 text-[12.5px] min-h-[44px]">
              <div className="flex items-center gap-1.5 text-[#F2C052] font-bold bg-[#F2C052]/10 border border-[#F2C052]/25 px-3 py-1.5 rounded-xl shrink-0 uppercase text-[10px] tracking-wider">
                <Clock className="size-3.5 text-[#F2C052] animate-pulse" />
                Live Deed Audits
              </div>
              <p className="text-white/85 text-left italic truncate flex-1 leading-snug">
                &ldquo;{currentFeed.text}&rdquo; <span className="text-[#DDAA42] not-italic font-bold">({currentFeed.lawyer})</span>
              </p>
              <span className="text-[11px] text-white/45 whitespace-nowrap shrink-0">{currentFeed.time}</span>
            </div>
          </div>

          {/* Right Panel: Submit Legal Query Form */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-[#F2C052] uppercase block mb-1">Interactive Helpdesk</span>
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
                            ? "bg-[#DDAA42] text-[#0B1328] border-transparent shadow"
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
                      className="w-full h-11 px-3 bg-white/10 border border-white/15 rounded-xl text-[13px] text-white outline-none focus:border-[#F2C052]"
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
                      className="w-full p-3.5 bg-white/10 border border-white/15 rounded-xl text-[13px] text-white outline-none focus:border-[#F2C052] resize-none placeholder:text-white/45"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-[#DDAA42] to-[#F2C052] hover:from-[#B98428] hover:to-[#DDAA42] text-[#121B35] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send className="size-4" />
                    Submit Query to Legal Panel
                  </button>
                </form>
              ) : (
                <div className="text-center py-10 animate-in zoom-in duration-300">
                  <CheckCircle2 className="size-14 text-[#DDAA42] mx-auto mb-4 animate-bounce" />
                  <h4 className="text-[20px] font-bold text-white">Query Assigned to Lawyer</h4>
                  <p className="text-[13.5px] text-white/70 mt-2 max-w-sm mx-auto leading-relaxed">
                    Your request has been forwarded to <span className="text-[#F2C052] font-semibold">{activeLawyer.name}</span>.
                    Deed analysis reports and Bar Council reviews are compiled dynamically. Response expected within 2 hours.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Note */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2.5 text-[11px] text-white/60">
              <ShieldCheck className="size-4.5 text-[#DDAA42] shrink-0" />
              <span>Attorneys verify titles using Karnataka municipal land records registers.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
