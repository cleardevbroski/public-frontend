"use client";
import Link from "@/components/Link";
import { Home, Key, Users, Building2, ArrowRight } from "lucide-react";

const helpOptions = [
  {
    icon: Home,
    title: "Buy a home",
    description: "Find your dream home from 5 lac+ properties",
    href: "/property-in-bangalore-ffid",
    color: "bg-gradient-to-br from-[#E2E9FB] to-[#D5DEF2]",
    iconColor: "text-[#C9A24E]",
  },
  {
    icon: Key,
    title: "Rent a home",
    description: "2 lac+ verified rental properties",
    href: "/property-for-rent-in-bangalore-ffid",
    color: "bg-gradient-to-br from-[#FAF3E2] to-[#F5EACC]",
    iconColor: "text-[#D4AF37]",
  },
  {
    icon: Users,
    title: "PG/Co-living",
    description: "Comfortable shared spaces near you",
    href: "/pg-in-bangalore-ffid",
    color: "bg-gradient-to-br from-[#EEF3FE] to-[#E2E9FB]",
    iconColor: "text-[#A8842C]",
  },
  {
    icon: Building2,
    title: "Commercial",
    description: "Buy or lease office spaces",
    href: "/commercial-property-in-bangalore-ffid",
    color: "bg-gradient-to-br from-[#FFF0ED] to-[#FFE0DA]",
    iconColor: "text-[#E8C66A]",
  },
];

export default function WereHereToHelp() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-[1200px] mx-auto px-3">
        <h2 className="text-[22px] font-bold text-[#1E3A8A] mb-6" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
          We&apos;re here to help
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {helpOptions.map((option) => (
            <Link
              key={option.title}
              href={option.href}
              className="group p-5 rounded-xl border border-[#D5DEF2]/50 hover:border-[#C9A24E] hover:shadow-lg transition-all duration-300 acres-hover-lift"
            >
              <div className={`w-12 h-12 rounded-xl ${option.color} flex items-center justify-center mb-3`}>
                <option.icon className={`size-6 ${option.iconColor}`} />
              </div>
              <h3 className="text-[16px] font-semibold text-[#1E3A8A] group-hover:text-[#C9A24E] transition-colors duration-200 flex items-center gap-1">
                {option.title}
                <ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </h3>
              <p className="text-[13px] text-[#243559] mt-1">
                {option.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
