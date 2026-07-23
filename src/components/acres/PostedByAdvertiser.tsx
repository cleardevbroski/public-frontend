"use client";
import Link from "@/components/Link";
import { ArrowRight, UserCog, Home } from "lucide-react";

const advertisers = [
  { label: "Dealer", count: "Verified channel partners", href: "/dealers", icon: UserCog },
  { label: "Owner", count: "Direct from owners", href: "/property-in-bangalore-ffid", icon: Home },
];

export default function PostedByAdvertiser() {
  return (
    <section className="bg-[#FFF8E8] py-12">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid md:grid-cols-[280px_1fr] gap-6 items-center">
          <div>
            <span className="size-12 rounded-xl bg-white border border-[#E4E0E7] flex items-center justify-center text-[#DDAA42] shadow-sm mb-3">
              <UserCog className="size-6" />
            </span>
            <h2 className="text-[24px] md:text-[28px] font-bold text-[#121B35]">Properties posted by</h2>
            <p className="text-[13px] text-[#68646F] mt-1">Choose type of advertiser</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E4E0E7]/60 shadow-sm p-6">
            <p className="text-[16px] font-bold text-[#121B35]">Choose type of advertiser</p>
            <p className="text-[13px] text-[#68646F]">Browse your choice of listing</p>
            <div className="mt-4 divide-y divide-[#E4E0E7]/50">
              {advertisers.map((a) => (
                <Link key={a.label} href={a.href} className="group flex items-center justify-between py-4 hover:bg-[#FDFCFD] -mx-2 px-2 rounded-lg transition-colors">
                  <span className="flex items-center gap-3">
                    <span className="size-10 rounded-full bg-[#EEF4FB] flex items-center justify-center text-[#121B35]">
                      <a.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-[15px] font-bold text-[#121B35]">{a.label}</span>
                      <span className="block text-[12px] text-[#68646F]">{a.count}</span>
                    </span>
                  </span>
                  <ArrowRight className="size-5 text-[#DDAA42] group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
