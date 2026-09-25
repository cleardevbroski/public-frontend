"use client";
import { useRef } from "react";
import Link from "@/components/Link";
import { Award } from "lucide-react";
import { getPublishedDealers, type Dealer } from "@/lib/dealerStore";
import { useLiveData } from "@/lib/useLiveProperties";
import DealerCard from "./DealerCard";

export default function FeaturedDealers() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dealers = useLiveData(() => getPublishedDealers(), [] as Dealer[], ["cleartitle:dealers-changed"]);

  if (dealers.length === 0) return null;

  return (
    <section className="bg-[#FFF8E8] py-8">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="size-12 rounded-full bg-gradient-to-br from-[#F2C052] to-[#DDAA42] flex items-center justify-center text-[#121B35] shadow">
              <Award className="size-6" />
            </span>
            <div>
              <h2 className="text-[26px] md:text-[32px] font-bold text-[#121B35]">
                Reach out to <span className="text-gold-gradient">Featured Dealers</span>
              </h2>
              <p className="text-[13px] text-[#68646F]">who are popular amongst Residential Buyers</p>
            </div>
          </div>
          <Link href="/dealers" className="text-[14px] font-bold text-[#DDAA42] hover:underline">View all</Link>
        </div>

        <div ref={scrollerRef} className="flex gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
          {dealers.map((d) => (
            <DealerCard key={d.id} dealer={d} />
          ))}
        </div>
      </div>
    </section>
  );
}
