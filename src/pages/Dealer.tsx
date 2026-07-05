"use client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Link from "@/components/Link";
import { Phone, Mail, MapPin, BadgeCheck, Calendar, UserRound, ChevronRight, Building2, ArrowLeft } from "lucide-react";
import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import PropertyCard from "@/components/acres/PropertyCard";
import { useAuth } from "@/components/acres/AuthContext";
import { getDealerBySlug, getDealerProperties, getDealerMatchCount, type Dealer } from "@/lib/dealerStore";
import type { Property } from "@/components/acres/mock-data";

export default function DealerProfilePage() {
  const params = useParams();
  const { user, setIsAuthModalOpen } = useAuth();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Contact details are visible only to logged-in users.
  const revealContact = () => {
    if (!user) { setIsAuthModalOpen(true); return; }
    setRevealed(true);
  };

  useEffect(() => {
    if (!slug) return;
    const load = () => {
      const d = getDealerBySlug(slug);
      setDealer(d ?? null);
      if (d) setProperties(getDealerProperties(d));
      setLoaded(true);
    };
    load();
    window.addEventListener("cleartitle:dealers-changed", load);
    return () => window.removeEventListener("cleartitle:dealers-changed", load);
  }, [slug]);

  if (loaded && !dealer) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-[#F1F5FF] flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-[24px] font-bold text-[#1E3A8A]">Dealer not found</h1>
            <Link href="/dealers" className="inline-flex items-center gap-2 mt-4 text-[#D4AF37] font-bold">
              <ArrowLeft className="size-4" /> Back to all dealers
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!dealer) return null;

  const matches = getDealerMatchCount(dealer);

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#F1F5FF]">
        {/* Profile header */}
        <section className="bg-gradient-to-br from-[#0B1B43] via-[#1E3A8A] to-[#25459E] text-white">
          <div className="max-w-[1200px] mx-auto px-5 py-12">
            <nav className="text-[12px] text-[#D5DEF2]/70 flex items-center gap-1.5 mb-6">
              <Link href="/" className="hover:text-[#E8C66A]">Home</Link>
              <ChevronRight className="size-3.5" />
              <Link href="/dealers" className="hover:text-[#E8C66A]">Dealers</Link>
              <ChevronRight className="size-3.5" /> <span className="text-[#E8C66A]">{dealer.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative shrink-0">
                <span className="size-28 rounded-full bg-white/10 border-2 border-[#D4AF37]/60 flex items-center justify-center overflow-hidden shadow-lg">
                  {dealer.logo ? (
                    <img src={dealer.logo} alt={dealer.agency} className="w-full h-full object-cover" />
                  ) : (
                    <UserRound className="size-14 text-white/70" />
                  )}
                </span>
                <span className="absolute -bottom-1 -right-1 size-9 rounded-full bg-gradient-to-br from-[#E8C66A] to-[#D4AF37] flex items-center justify-center shadow">
                  <BadgeCheck className="size-5 text-[#1E3A8A]" />
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold tracking-wider uppercase text-[#E8C66A]">{dealer.agency}</p>
                <h1 className="text-[30px] md:text-[38px] font-bold mt-0.5">{dealer.name}</h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-[#D5DEF2]/85 mt-2">
                  <span className="flex items-center gap-1.5"><Calendar className="size-4 text-[#D4AF37]" /> Member since {dealer.memberSince}</span>
                  {dealer.operatingSince && <span className="flex items-center gap-1.5"><Building2 className="size-4 text-[#D4AF37]" /> Operating since {dealer.operatingSince}</span>}
                  <span className="flex items-center gap-1.5"><BadgeCheck className="size-4 text-[#D4AF37]" /> {dealer.buyersThisWeek} buyers this week</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {dealer.dealsIn.map((d) => (
                    <span key={d} className="text-[11px] font-bold text-[#1E3A8A] bg-[#E8C66A] px-2.5 py-1 rounded">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-5 py-10 grid lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* Left — about + properties */}
          <div className="space-y-8">
            {dealer.about && (
              <div className="bg-white rounded-2xl border border-[#D5DEF2]/60 shadow-sm p-6">
                <h2 className="text-[20px] font-bold text-[#1E3A8A]">About {dealer.agency}</h2>
                <div className="gold-divider mt-3" />
                <p className="text-[14px] text-[#243559] leading-relaxed mt-4">{dealer.about}</p>
                {dealer.localities?.length ? (
                  <div className="mt-5">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-[#6E7488] mb-2">Active in</p>
                    <div className="flex flex-wrap gap-2">
                      {dealer.localities.map((l) => (
                        <span key={l} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1E3A8A] bg-[#F1F5FF] border border-[#D5DEF2] px-3 py-1.5 rounded-lg">
                          <MapPin className="size-3.5 text-[#D4AF37]" /> {l}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[22px] font-bold text-[#1E3A8A]">
                  {matches} Matching <span className="text-gold-gradient">Properties</span>
                </h2>
              </div>
              {properties.length === 0 ? (
                <p className="text-[14px] text-[#6E7488]">This dealer has no live listings right now.</p>
              ) : (
                <div className="flex flex-wrap gap-5">
                  {properties.map((p) => (
                    <PropertyCard key={p.id} p={p} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — contact card */}
          <aside className="bg-white rounded-2xl border border-[#D5DEF2]/60 shadow-md p-6 lg:sticky lg:top-24">
            <h3 className="text-[18px] font-bold text-[#1E3A8A]">Contact {dealer.name.split(" ")[0]}</h3>
            <p className="text-[13px] text-[#6E7488] mt-1">Verified dealer • responds quickly</p>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F1F5FF] border border-[#D5DEF2]/50">
                <span className="size-10 rounded-full bg-[#E6F2EA] flex items-center justify-center text-[#1E7A46]"><Phone className="size-5" /></span>
                <div className="min-w-0">
                  <p className="text-[11px] text-[#6E7488] font-semibold uppercase tracking-wider">Phone</p>
                  <p className="text-[15px] font-bold text-[#1E3A8A]">
                    {revealed ? (dealer.phone || "Not provided") : "+91 ●●●●● ●●●●●"}
                  </p>
                </div>
              </div>
              {dealer.email && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F1F5FF] border border-[#D5DEF2]/50">
                  <span className="size-10 rounded-full bg-[#EEF4FB] flex items-center justify-center text-[#1E3A8A]"><Mail className="size-5" /></span>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#6E7488] font-semibold uppercase tracking-wider">Email</p>
                    <p className="text-[14px] font-bold text-[#1E3A8A] truncate">
                      {revealed ? dealer.email : "●●●●●●@●●●●.in"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={revealContact}
              className="mt-5 w-full h-12 btn-gold rounded-xl flex items-center justify-center gap-2 text-[15px] font-bold"
            >
              <Phone className="size-4" /> {revealed ? "Contact details shown" : user ? "View Contact Details" : "Login to View Contact"}
            </button>
            <a
              href={revealed && dealer.phone ? `tel:${dealer.phone.replace(/\s/g, "")}` : undefined}
              onClick={(e) => { if (!revealed) { e.preventDefault(); revealContact(); } }}
              className="mt-3 w-full h-12 rounded-xl border border-[#1E3A8A]/20 hover:border-[#D4AF37] hover:text-[#D4AF37] text-[#1E3A8A] font-bold text-[15px] flex items-center justify-center transition-colors"
            >
              Call Now
            </a>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
