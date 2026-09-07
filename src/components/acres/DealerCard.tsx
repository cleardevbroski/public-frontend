"use client";
import Link from "@/components/Link";
import { Building2, ChevronRight, UserRound } from "lucide-react";
import type { Dealer } from "@/lib/dealerStore";
import { getDealerMatchCount } from "@/lib/dealerStore";

export default function DealerCard({ dealer }: { dealer: Dealer }) {
  const matches = getDealerMatchCount(dealer);
  return (
    <div className="shrink-0 w-[330px] max-w-[88vw] flex flex-col">
      <div className="public-surface public-interactive bg-white p-5 relative">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#68646F]">
          <Building2 className="size-3.5 text-[#805A0B]" /> Published partner profile
        </p>
        <div className="flex flex-col items-center text-center mt-3">
          <div className="relative">
            <span className="size-24 rounded-full bg-gradient-to-br from-[#F8F7FA] to-[#F3F1F5] border-2 border-[#DDAA42]/50 flex items-center justify-center text-[#121B35] shadow-inner overflow-hidden">
              {dealer.logo ? (
                <img src={dealer.logo} alt={dealer.agency} className="w-full h-full object-cover" />
              ) : (
                <UserRound className="size-12 text-[#9AA0B0]" />
              )}
            </span>
          </div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-[#68646F] mt-3">{dealer.agency}</p>
          <h3 className="text-[18px] font-bold text-[#121B35]">{dealer.name}</h3>
          <p className="text-[12px] text-[#68646F] mt-0.5">Member Since {dealer.memberSince}</p>
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            {dealer.dealsIn.map((d) => (
              <span key={d} className="text-[10px] font-bold text-[#3F3D46] bg-[#F8F7FA] border border-[#E4E0E7] px-2 py-0.5 rounded">{d}</span>
            ))}
          </div>
        </div>
        <Link href={`/dealer/${dealer.slug}`} className="mt-4 w-full h-11 rounded-xl border border-[#DDAA42] text-[#805A0B] font-bold text-[14px] flex items-center justify-center hover:bg-[#DDAA42] hover:text-[#0B1328] transition-colors">
          View partner profile
        </Link>
      </div>
      <Link href={`/dealer/${dealer.slug}`} className="mt-1.5 flex items-center justify-between bg-[#F8F7FA] hover:bg-[#F3F1F5] rounded-xl px-3 py-2.5 transition-colors border border-[#E4E0E7]/50">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[#3F3D46]">
          <span className="size-8 rounded bg-[#CBD6EE] flex items-center justify-center text-[10px] font-bold text-[#121B35]">{matches}</span>
          Matching Properties
        </span>
        <ChevronRight className="size-4 text-[#68646F]" />
      </Link>
    </div>
  );
}
