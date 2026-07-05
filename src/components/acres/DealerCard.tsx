"use client";
import Link from "@/components/Link";
import { Phone, BadgeCheck, ChevronRight, UserRound } from "lucide-react";
import type { Dealer } from "@/lib/dealerStore";
import { getDealerMatchCount } from "@/lib/dealerStore";

export default function DealerCard({ dealer }: { dealer: Dealer }) {
  const matches = getDealerMatchCount(dealer);
  return (
    <div className="shrink-0 w-[330px] max-w-[88vw] flex flex-col">
      <div className="bg-white border border-[#D5DEF2]/60 shadow-sm hover:shadow-lg transition-all p-5 relative">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6E7488]">
          <Phone className="size-3.5 text-[#D4AF37]" /> {dealer.buyersThisWeek} Buyers this week
        </p>
        <div className="flex flex-col items-center text-center mt-3">
          <div className="relative">
            <span className="size-24 rounded-full bg-gradient-to-br from-[#F1F5FF] to-[#E2E9FB] border-2 border-[#D4AF37]/50 flex items-center justify-center text-[#1E3A8A] shadow-inner overflow-hidden">
              {dealer.logo ? (
                <img src={dealer.logo} alt={dealer.agency} className="w-full h-full object-cover" />
              ) : (
                <UserRound className="size-12 text-[#9AA0B0]" />
              )}
            </span>
            <span className="absolute -bottom-1 -right-1 size-8 rounded-full bg-gradient-to-br from-[#E8C66A] to-[#D4AF37] flex items-center justify-center shadow">
              <BadgeCheck className="size-4 text-[#1E3A8A]" />
            </span>
          </div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#6E7488] mt-3">{dealer.agency}</p>
          <h3 className="text-[18px] font-bold text-[#1E3A8A]">{dealer.name}</h3>
          <p className="text-[12px] text-[#6E7488] mt-0.5">Member Since {dealer.memberSince}</p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            {dealer.dealsIn.map((d) => (
              <span key={d} className="text-[10px] font-bold text-[#243559] bg-[#F1F5FF] border border-[#D5DEF2] px-2 py-0.5 rounded">{d}</span>
            ))}
          </div>
        </div>
        <Link href={`/dealer/${dealer.slug}`} className="mt-4 w-full h-11 rounded-xl border border-[#D4AF37] text-[#D4AF37] font-bold text-[14px] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors">
          Contact Dealer
        </Link>
      </div>
      <Link href={`/dealer/${dealer.slug}`} className="mt-1.5 flex items-center justify-between bg-[#F1F5FF] hover:bg-[#E2E9FB] rounded-xl px-3 py-2.5 transition-colors border border-[#D5DEF2]/50">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[#243559]">
          <span className="size-8 rounded bg-[#CBD6EE] flex items-center justify-center text-[10px] font-bold text-[#1E3A8A]">{matches}</span>
          Matching Properties
        </span>
        <ChevronRight className="size-4 text-[#6E7488]" />
      </Link>
    </div>
  );
}
