"use client";
import { useState } from "react";
import Link from "@/components/Link";
import { Award, Search, UserPlus, ChevronRight } from "lucide-react";
import Header from "@/components/acres/Header";
import Footer from "@/components/acres/Footer";
import DealerCard from "@/components/acres/DealerCard";
import { getPublishedDealers, type Dealer } from "@/lib/dealerStore";
import { useLiveData } from "@/lib/useLiveProperties";

export default function DealersPage() {
  const dealers = useLiveData(() => getPublishedDealers(), [] as Dealer[], ["cleartitle:dealers-changed"]);
  const [query, setQuery] = useState("");

  const filtered = dealers.filter((d) => {
    const q = query.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.agency.toLowerCase().includes(q) ||
      (d.localities || []).some((l) => l.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <Header />
      <main className="flex-1 bg-[#F1F5FF]">
        {/* Hero band */}
        <section className="bg-gradient-to-br from-[#0B1B43] via-[#1E3A8A] to-[#25459E] text-white">
          <div className="max-w-[1200px] mx-auto px-5 py-14">
            <nav className="text-[12px] text-[#D5DEF2]/70 flex items-center gap-1.5">
              <Link href="/" className="hover:text-[#E8C66A]">Home</Link>
              <ChevronRight className="size-3.5" /> <span className="text-[#E8C66A]">Dealers</span>
            </nav>
            <div className="flex items-center gap-3 mt-4">
              <span className="size-14 rounded-full bg-gradient-to-br from-[#E8C66A] to-[#D4AF37] flex items-center justify-center text-[#1E3A8A] shadow">
                <Award className="size-7" />
              </span>
              <div>
                <h1 className="text-[32px] md:text-[40px] font-bold">
                  Verified <span className="text-gold-gradient">Dealers</span> &amp; Channel Partners
                </h1>
                <p className="text-[14px] text-[#D5DEF2]/85 mt-1">
                  Connect with {dealers.length} trusted real-estate dealers across Bangalore.
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 h-12 shadow">
                <Search className="size-5 text-[#6E7488]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search dealers by name, agency or locality"
                  className="flex-1 outline-none text-[14px] text-[#1E3A8A] bg-transparent"
                />
              </div>
              <Link href="/account" className="h-12 px-5 btn-gold rounded-xl flex items-center justify-center gap-2 text-[14px] font-bold whitespace-nowrap">
                <UserPlus className="size-4" /> Register as Dealer
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-5 py-12">
          <p className="text-[14px] text-[#6E7488] mb-6">
            Showing <span className="font-bold text-[#1E3A8A]">{filtered.length}</span> dealers
          </p>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#6E7488]">No dealers match your search.</div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              {filtered.map((d) => (
                <DealerCard key={d.id} dealer={d} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
