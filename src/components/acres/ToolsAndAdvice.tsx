"use client";
import Link from "@/components/Link";
import { Calculator, Receipt, TrendingUp, FileText, ArrowRight } from "lucide-react";

const tools = [
  {
    icon: Calculator,
    title: "Area Converter",
    description: "Convert sqft to sqm, acres, bigha and more",
    href: "/area-converter-utyp",
  },
  {
    icon: Receipt,
    title: "Rent Receipt",
    description: "Generate rent receipts for tax claims",
    href: "/online-rent-receipt",
  },
  {
    icon: TrendingUp,
    title: "Rates & Trends",
    description: "Check property price trends in your city",
    href: "/property-rates-and-price-trends-in-bangalore-prffid",
  },
  {
    icon: FileText,
    title: "Home Loan",
    description: "Calculate EMI and check eligibility",
    href: "/apply-for-home-loan-hlpg",
  },
];

export default function ToolsAndAdvice() {
  return (
    <section className="bg-[#F1F5FF] py-10">
      <div className="max-w-[1200px] mx-auto px-3">
        <h2 className="text-[22px] font-bold text-[#1E3A8A] mb-6" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
          Tools and advice
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group bg-white p-4 rounded-xl border border-[#D5DEF2]/50 hover:border-[#C9A24E] hover:shadow-lg transition-all duration-300 acres-hover-lift"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E2E9FB] to-[#D5DEF2] flex items-center justify-center">
                  <tool.icon className="size-5 text-[#C9A24E]" />
                </div>
                <ArrowRight className="size-4 text-[#6E7488] group-hover:text-[#C9A24E] group-hover:translate-x-1 transition-all duration-200" />
              </div>
              <h3 className="text-[15px] font-semibold text-[#1E3A8A] group-hover:text-[#C9A24E] transition-colors duration-200">
                {tool.title}
              </h3>
              <p className="text-[12px] text-[#243559] mt-1">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
