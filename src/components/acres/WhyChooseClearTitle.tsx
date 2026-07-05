"use client";
import Link from "@/components/Link";
import { ScrollText, ShieldCheck, Handshake, ChevronRight } from "lucide-react";

const reasons = [
  {
    icon: ScrollText,
    title: "100% Clear Title",
    desc: "All properties are verified for clear titles and documentation before listing.",
  },
  {
    icon: ShieldCheck,
    title: "Expert Legal Guidance",
    desc: "Experienced legal advisors ensure your property purchase is completely risk-free.",
  },
  {
    icon: Handshake,
    title: "Hassle-Free Process",
    desc: "A seamless buying experience with full transparency from start to finish.",
  },
];

export default function WhyChooseClearTitle() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-[1100px] mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-[30px] md:text-[40px] font-bold text-[#1E3A8A]">
            Why <span className="text-gold-gradient">Choose Cleartitleone</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="text-[15px] text-[#6E7488] mt-4">
            Your Trusted Partner in Bangalore Real Estate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-[#F1F5FF] rounded-2xl p-8 text-center border border-[#D5DEF2]/60 hover:border-[#D4AF37]/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="mx-auto mb-5 size-16 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#2E54B8] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Icon className="size-7 text-[#E8C66A]" />
              </div>
              <h3 className="text-[20px] font-bold text-[#1E3A8A]">{title}</h3>
              <p className="text-[13.5px] text-[#6E7488] mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/Bangalore-Real-Estate.htm"
            className="inline-flex items-center gap-2 btn-gold px-7 py-3.5 rounded-xl text-[14px]"
          >
            Learn More About Us
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
