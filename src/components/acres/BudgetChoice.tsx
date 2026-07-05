"use client";
import Link from "@/components/Link";
import { ArrowRight, IndianRupee, Wallet } from "lucide-react";
import { budgetOptions } from "./mock-data";

export default function BudgetChoice() {
  return (
    <section className="bg-[#FAF3E2] py-12">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid md:grid-cols-[280px_1fr] gap-6 items-center">
          <div>
            <span className="size-12 rounded-xl bg-white border border-[#D5DEF2] flex items-center justify-center text-[#D4AF37] shadow-sm mb-3">
              <Wallet className="size-6" />
            </span>
            <h2 className="text-[24px] md:text-[28px] font-bold text-[#1E3A8A]">Have a budget in mind?</h2>
            <p className="text-[13px] text-[#6E7488] mt-1">Project options based on your budget</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#D5DEF2]/60 shadow-sm p-6">
            <p className="text-[16px] font-bold text-[#1E3A8A]">Browse by budget</p>
            <p className="text-[13px] text-[#6E7488]">Project options based on your budget</p>
            <div className="mt-4 divide-y divide-[#D5DEF2]/50">
              {budgetOptions.map((b) => (
                <Link key={b.label} href={b.href} className="group flex items-center justify-between py-4 hover:bg-[#FAFCFF] -mx-2 px-2 rounded-lg transition-colors">
                  <span className="flex items-center gap-3">
                    <span className="size-10 rounded-full bg-[#E6F2EA] flex items-center justify-center text-[#1E7A46]">
                      <IndianRupee className="size-5" />
                    </span>
                    <span>
                      <span className="block text-[15px] font-bold text-[#1E3A8A]">{b.label}</span>
                      <span className="block text-[12px] text-[#6E7488]">{b.range}</span>
                    </span>
                  </span>
                  <ArrowRight className="size-5 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
