"use client";
import { useState } from "react";
import { Calculator, Hammer, ShieldCheck, Scale, Ruler, Coins, CheckCircle, ArrowRight } from "lucide-react";
import Link from "@/components/Link";

type TabName = "services" | "calculators" | "trust";

export default function ClearTitleAdvisor() {
  const [activeTab, setActiveTab] = useState<TabName>("services");

  // Calculators State
  const [loanAmount, setLoanAmount] = useState<number>(5000000); // 50 Lakhs
  const [loanTenure, setLoanTenure] = useState<number>(20); // 20 years
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5%

  const [sqftInput, setSqftInput] = useState<number>(1200);

  // EMI Calculation: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const calculateEMI = () => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = loanTenure * 12;
    if (r === 0) return Math.round(P / n);
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  return (
    <section className="bg-gradient-to-b from-[#F1F5FF]/35 to-white py-16">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Title Block */}
        <div className="text-center mb-12">
          <p className="acres-overline">ClearTitle One Advisor</p>
          <h2 className="text-[28px] font-bold text-[#1E3A8A] mt-1" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
            Premium Services & Financial Tools
          </h2>
          <p className="text-[14px] text-[#6E7488] mt-1">
            Access our integrated tools, legal assistance, and property financial calculators in one click.
          </p>
        </div>

        {/* Tab Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 border border-[#D5DEF2]/40 rounded-3xl overflow-hidden bg-white shadow-xl min-h-[460px]">
          
          {/* Left Menu Tab Selector */}
          <div className="bg-[#F1F5FF]/55 p-6 flex flex-col gap-3 border-r border-[#E2E9FB]/50">
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl text-[14px] font-bold text-left transition-all ${
                activeTab === "services"
                  ? "bg-white text-[#C9A24E] shadow-md border-l-4 border-[#C9A24E]"
                  : "text-[#243559] hover:bg-white/50"
              }`}
            >
              <Scale className="size-5" />
              <span>Services & Offerings</span>
            </button>

            <button
              onClick={() => setActiveTab("calculators")}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl text-[14px] font-bold text-left transition-all ${
                activeTab === "calculators"
                  ? "bg-white text-[#C9A24E] shadow-md border-l-4 border-[#C9A24E]"
                  : "text-[#243559] hover:bg-white/50"
              }`}
            >
              <Calculator className="size-5" />
              <span>Mortgage & Area Tools</span>
            </button>

            <button
              onClick={() => setActiveTab("trust")}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl text-[14px] font-bold text-left transition-all ${
                activeTab === "trust"
                  ? "bg-white text-[#C9A24E] shadow-md border-l-4 border-[#C9A24E]"
                  : "text-[#243559] hover:bg-white/50"
              }`}
            >
              <ShieldCheck className="size-5" />
              <span>ClearTitle Trust Promise</span>
            </button>

            <div className="mt-auto pt-6 border-t border-[#E2E9FB] hidden lg:block">
              <p className="text-[11px] text-[#6E7488] font-semibold leading-relaxed">
                Need customized corporate advice? Contact our premium helpdesk at:
              </p>
              <p className="text-[13px] text-[#1E3A8A] font-bold mt-2">1800 41 99099</p>
            </div>
          </div>

          {/* Right Menu Dynamic Content Panel */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            {activeTab === "services" && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-[20px] font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
                  <Scale className="text-[#C9A24E] size-5" />
                  Owner & Buyer Services
                </h3>
                <p className="text-[13px] text-[#6E7488] mb-6">
                  Select premium secondary services to make your purchase or rental transition hassle-free.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-[#D5DEF2]/30 hover:border-[#C9A24E]/50 p-4.5 rounded-2xl bg-[#F1F5FF]/20 hover:shadow transition-all group">
                    <h4 className="text-[15px] font-bold text-[#1E3A8A] group-hover:text-[#C9A24E] transition-colors">
                      Legal Title Verification
                    </h4>
                    <p className="text-[12px] text-[#243559]/80 mt-1 leading-relaxed">
                      Consult dedicated lawyers to inspect land records, verify seller rights, and review title deeds before signing.
                    </p>
                    <Link href="/postproperty" className="text-[11px] text-[#C9A24E] font-bold mt-3 inline-flex items-center gap-1 hover:underline">
                      Initiate verification <ArrowRight className="size-3" />
                    </Link>
                  </div>

                  <div className="border border-[#D5DEF2]/30 hover:border-[#C9A24E]/50 p-4.5 rounded-2xl bg-[#F1F5FF]/20 hover:shadow transition-all group">
                    <h4 className="text-[15px] font-bold text-[#1E3A8A] group-hover:text-[#C9A24E] transition-colors">
                      Zero-Brokerage Owner Ads
                    </h4>
                    <p className="text-[12px] text-[#243559]/80 mt-1 leading-relaxed">
                      List your flats or commercial slots directly to authentic buyers. Zero broker commission, maximum yields.
                    </p>
                    <Link href="/postproperty" className="text-[11px] text-[#C9A24E] font-bold mt-3 inline-flex items-center gap-1 hover:underline">
                      Post free ad <ArrowRight className="size-3" />
                    </Link>
                  </div>

                  <div className="border border-[#D5DEF2]/30 hover:border-[#C9A24E]/50 p-4.5 rounded-2xl bg-[#F1F5FF]/20 hover:shadow transition-all group">
                    <h4 className="text-[15px] font-bold text-[#1E3A8A] group-hover:text-[#C9A24E] transition-colors">
                      Design & Renovation Hub
                    </h4>
                    <p className="text-[12px] text-[#243559]/80 mt-1 leading-relaxed">
                      Collaborate with handpicked interior designers and modular builders to bring your new signature flat to life.
                    </p>
                    <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] font-bold px-2 py-0.5 rounded mt-3 inline-block">
                      GOLD PARTNER
                    </span>
                  </div>

                  <div className="border border-[#D5DEF2]/30 hover:border-[#C9A24E]/50 p-4.5 rounded-2xl bg-[#F1F5FF]/20 hover:shadow transition-all group">
                    <h4 className="text-[15px] font-bold text-[#1E3A8A] group-hover:text-[#C9A24E] transition-colors">
                      Commercial Tenant Matching
                    </h4>
                    <p className="text-[12px] text-[#243559]/80 mt-1 leading-relaxed">
                      Get premium IT firms, co-working suites, and banks to lease your commercial structures across prime corporate zones.
                    </p>
                    <Link href="/property-in-bangalore-ffid" className="text-[11px] text-[#C9A24E] font-bold mt-3 inline-flex items-center gap-1 hover:underline">
                      Browse requirements <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "calculators" && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-[20px] font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
                  <Calculator className="text-[#C9A24E] size-5" />
                  Live Property Tools
                </h3>
                <p className="text-[13px] text-[#6E7488] mb-6">
                  Calculate mortgage installments or check unit boundaries instantly using our client tools.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Loan EMI */}
                  <div className="bg-[#F1F5FF]/25 border border-[#D5DEF2]/30 p-5 rounded-2xl">
                    <h4 className="text-[14px] font-bold text-[#1E3A8A] flex items-center gap-1.5 mb-4">
                      <Coins className="size-4 text-[#C9A24E]" />
                      Home Loan EMI Calculator
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-[#243559] mb-1">
                          <span>LOAN AMOUNT</span>
                          <span className="text-[#C9A24E]">₹ {(loanAmount / 100000).toFixed(1)} Lakhs</span>
                        </div>
                        <input
                          type="range"
                          min="1000000"
                          max="20000000"
                          step="500000"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(Number(e.target.value))}
                          className="w-full accent-[#C9A24E]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[#6E7488] mb-1">INTEREST RATE (%)</label>
                          <input
                            type="number"
                            min="5"
                            max="20"
                            step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full h-9 border border-[#D5DEF2] rounded-lg px-2.5 text-[13px] text-[#1E3A8A] font-semibold outline-none focus:border-[#C9A24E]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#6E7488] mb-1">TENURE (YEARS)</label>
                          <input
                            type="number"
                            min="5"
                            max="30"
                            value={loanTenure}
                            onChange={(e) => setLoanTenure(Number(e.target.value))}
                            className="w-full h-9 border border-[#D5DEF2] rounded-lg px-2.5 text-[13px] text-[#1E3A8A] font-semibold outline-none focus:border-[#C9A24E]"
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#E2E9FB]/60 mt-3 text-center">
                        <span className="text-[10px] text-[#6E7488] block font-bold uppercase">Estimated Monthly EMI</span>
                        <span className="text-[24px] font-extrabold text-[#C9A24E] block mt-1">
                          ₹ {calculateEMI().toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Area Converter */}
                  <div className="bg-[#F1F5FF]/25 border border-[#D5DEF2]/30 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-[14px] font-bold text-[#1E3A8A] flex items-center gap-1.5 mb-4">
                        <Ruler className="size-4 text-[#D4AF37]" />
                        Area Converter
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#6E7488] mb-1">SQ.FT VALUE</label>
                          <input
                            type="number"
                            value={sqftInput}
                            onChange={(e) => setSqftInput(Number(e.target.value))}
                            className="w-full h-10 border border-[#D5DEF2] rounded-lg px-3 text-[14px] text-[#1E3A8A] font-bold outline-none focus:border-[#C9A24E]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-[#D5DEF2]/20">
                          <div>
                            <span className="text-[10px] text-[#6E7488] font-bold uppercase block">Acres</span>
                            <span className="text-[14px] font-bold text-[#1E3A8A] mt-0.5 block">
                              {(sqftInput / 43560).toFixed(4)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#6E7488] font-bold uppercase block">Sq. Yards</span>
                            <span className="text-[14px] font-bold text-[#1E3A8A] mt-0.5 block">
                              {(sqftInput / 9).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link
                        href="/area-converter-utyp"
                        className="w-full h-10 border border-[#C9A24E] hover:bg-[#C9A24E] hover:text-white text-[#C9A24E] text-[12px] font-bold rounded-xl flex items-center justify-center transition-all"
                      >
                        All Conversion Units
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "trust" && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-[20px] font-bold text-[#1E3A8A] mb-2 flex items-center gap-2">
                  <ShieldCheck className="text-[#C9A24E] size-5" />
                  Our 3-Point Security Oath
                </h3>
                <p className="text-[13px] text-[#6E7488] mb-6">
                  ClearTitle One values security over transaction volumes. Every listing passes rigorous checks.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-3.5 p-4 rounded-xl hover:bg-[#F1F5FF]/35 transition-colors">
                    <CheckCircle className="size-6 text-[#C9A24E] shrink-0" />
                    <div>
                      <h4 className="text-[15px] font-bold text-[#1E3A8A]">100% Encumbered & Title Checked</h4>
                      <p className="text-[12px] text-[#243559]/80 mt-1 leading-relaxed">
                        We screen and cross-reference public deeds to confirm zero outstanding bank pledges or active boundary disputes on registered villas or lands.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 p-4 rounded-xl hover:bg-[#F1F5FF]/35 transition-colors">
                    <CheckCircle className="size-6 text-[#D4AF37] shrink-0" />
                    <div>
                      <h4 className="text-[15px] font-bold text-[#1E3A8A]">RERA Mandatory Validation</h4>
                      <p className="text-[12px] text-[#243559]/80 mt-1 leading-relaxed">
                        Every multi-story flat and project must host an active RERA verification number. No unapproved developments, zero layout loopholes.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 p-4 rounded-xl hover:bg-[#F1F5FF]/35 transition-colors">
                    <CheckCircle className="size-6 text-[#C9A24E] shrink-0" />
                    <div>
                      <h4 className="text-[15px] font-bold text-[#1E3A8A]">Direct-to-Owner Clean Desk</h4>
                      <p className="text-[12px] text-[#243559]/80 mt-1 leading-relaxed">
                        We prioritize direct owner listings. By encouraging direct owner connections, we cut intermediary brokerage costs, ensuring clear pricing transparency.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Tagline */}
            <div className="mt-8 pt-4 border-t border-[#E2E9FB]/60 flex items-center justify-between flex-wrap gap-4 text-[12px]">
              <span className="text-[#6E7488]">
                All data computed matches standard Karnataka/RERA rules.
              </span>
              <Link href="/property-rates-and-price-trends-in-bangalore-prffid" className="text-[#C9A24E] hover:underline font-bold flex items-center gap-1">
                Explore Market Rates Trends
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
