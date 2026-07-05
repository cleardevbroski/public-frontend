import { Tag, ScrollText, Camera, Headset } from "lucide-react";

const services = [
  { icon: Tag, title: "Pricing assistance", desc: "Get a fair price for your property based on real market trends.", color: "from-[#E2E9FB] to-[#D5DEF2]", iconColor: "text-[#C9A24E]" },
  { icon: ScrollText, title: "Paperwork & legal", desc: "End-to-end help with documentation, agreements and registration.", color: "from-[#FAF3E2] to-[#F5EACC]", iconColor: "text-[#D4AF37]" },
  { icon: Camera, title: "Professional photography", desc: "High-quality photos that attract 5x more buyer interest.", color: "from-[#FFF0ED] to-[#FFE0DA]", iconColor: "text-[#E8C66A]" },
  { icon: Headset, title: "Dedicated relationship manager", desc: "A real person to handle your queries and visits 7 days a week.", color: "from-[#EEF3FE] to-[#E2E9FB]", iconColor: "text-[#A8842C]" },
];

export default function OwnerServices() {
  return (
    <section className="max-w-[1200px] mx-auto px-3 my-12">
      <p className="acres-overline">Our services for owners</p>
      <h2 className="text-[26px] font-bold text-[#1E3A8A] mt-1 mb-1" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
        Make your life easier with our services
      </h2>
      <p className="text-[14px] text-[#243559] mb-8">
        Get assistance in pricing, paperwork, photography and more — all in one place.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((s) => (
          <div key={s.title} className="bg-white border border-[#D5DEF2]/50 rounded-xl p-5 hover:shadow-xl hover:border-[#C9A24E]/30 transition-all duration-300 acres-hover-lift">
            <div className={`size-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
              <s.icon className={`size-6 ${s.iconColor}`} strokeWidth={2} />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1E3A8A] mb-1">{s.title}</h3>
            <p className="text-[12px] text-[#243559] leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
