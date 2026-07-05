"use client";
import Link from "@/components/Link";
import { Home } from "lucide-react";
import { bhkOptions } from "./mock-data";

export default function BhkChoice() {
  return (
    <section className="bg-[#FAF3E2] py-12">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="flex items-center gap-3 mb-5">
          <span className="size-11 rounded-xl bg-white border border-[#D5DEF2] flex items-center justify-center text-[#D4AF37] shadow-sm">
            <Home className="size-6" />
          </span>
          <div>
            <h2 className="text-[24px] md:text-[28px] font-bold text-[#1E3A8A]">BHK choice in mind?</h2>
            <p className="text-[13px] text-[#6E7488]">Browse by no. of bedrooms in the house</p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {bhkOptions.map((b) => (
            <Link key={b.label} href={b.href} className="group shrink-0 w-[210px] bg-white rounded-2xl border border-[#D5DEF2]/60 shadow-sm hover:shadow-lg hover:border-[#D4AF37]/60 transition-all p-5">
              <span className="size-12 rounded-xl bg-[#EEF4FB] flex items-center justify-center text-[#1E3A8A] mb-4">
                <Home className="size-6" />
              </span>
              <p className="text-[17px] font-bold text-[#1E3A8A] group-hover:text-[#D4AF37] transition-colors">{b.label}</p>
              <p className="text-[13px] text-[#6E7488] mt-0.5">{b.count}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
