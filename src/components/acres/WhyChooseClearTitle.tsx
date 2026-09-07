"use client";
import Link from "@/components/Link";
import { ScrollText, ShieldCheck, Handshake, ChevronRight } from "lucide-react";

const reasons = [
  {
    icon: ScrollText,
    title: "Evidence in view",
    desc: "RERA references, project documents and verified coordinates are shown when they are present in the project record.",
  },
  {
    icon: ShieldCheck,
    title: "Missing means missing",
    desc: "Important gaps stay visible, so a buyer knows what still needs confirmation before making a decision.",
  },
  {
    icon: Handshake,
    title: "Decide together",
    desc: "Shortlist projects, compare costs and discuss the decision with family before sharing contact details.",
  },
];

export default function WhyChooseClearTitle() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-[1100px] mx-auto px-5">
        <div className="text-center mb-12">
          <p className="public-page-hero__eyebrow">A clearer buying process</p>
          <h2 className="display-heading mt-3 text-[32px] md:text-[44px] text-[#121B35]">
            Trust should be <span className="text-gold-gradient">visible</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="text-[15px] text-[#68646F] mt-4">
            Project facts, calculation assumptions and information gaps are labelled where buyers need them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group bg-[#F8F7FA] rounded-2xl p-8 text-center border border-[#E4E0E7]/60 hover:border-[#DDAA42]/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="mx-auto mb-5 size-16 rounded-2xl bg-gradient-to-br from-[#121B35] to-[#273559] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Icon className="size-7 text-[#F2C052]" />
              </div>
              <h3 className="text-[20px] font-bold text-[#121B35]">{title}</h3>
              <p className="text-[13.5px] text-[#68646F] mt-2 leading-relaxed">{desc}</p>
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
