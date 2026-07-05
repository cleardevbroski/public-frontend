import Image from "@/components/Image";
import Link from "@/components/Link";
import { ArrowRight } from "lucide-react";

const blocks = [
  {
    eyebrow: "BUY FOR COMMERCIAL",
    title: "Invest in your business space",
    cta: "Explore commercial buy",
    href: "/commercial-property-in-bangalore-ffid",
    img: "/cleartitleone/tile-com-buy.webp",
    bg: "from-[#FAF3E2] to-[#F5EACC]",
    border: "border-[#D4AF37]/20",
  },
  {
    eyebrow: "LEASE FOR COMMERCIAL",
    title: "Lease the perfect office or shop",
    cta: "Explore commercial lease",
    href: "/commercial-property-for-rent-in-bangalore-ffid",
    img: "/cleartitleone/tile-com-lease.webp",
    bg: "from-[#E2E9FB] to-[#D5DEF2]",
    border: "border-[#C9A24E]/20",
  },
];

export default function CommercialSpaces() {
  return (
    <section className="max-w-[1200px] mx-auto px-3 my-12">
      <p className="acres-overline">Commercial spaces</p>
      <h2 className="text-[26px] font-bold text-[#1E3A8A] mt-1 mb-1" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
        Choose from a wide variety of commercial properties
      </h2>
      <p className="text-[14px] text-[#243559] mb-8">
        Buy or lease offices, shops, showrooms, warehouses and co-working spaces across India.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {blocks.map((b) => (
          <Link
            key={b.eyebrow}
            href={b.href}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${b.bg} border ${b.border} p-6 min-h-[200px] flex items-center justify-between group cursor-pointer hover:shadow-xl transition-all duration-300`}
          >
            <div className="relative z-10 max-w-[60%]">
              <p className="text-[10px] tracking-[0.18em] font-bold text-[#1E3A8A]/60 uppercase">
                {b.eyebrow}
              </p>
              <h3 className="text-[20px] font-bold text-[#1E3A8A] mt-2 leading-snug">{b.title}</h3>
              <span className="mt-4 text-[#C9A24E] text-[13px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                {b.cta} <ArrowRight className="size-4" />
              </span>
            </div>
            <div className="relative w-[180px] h-[140px] shrink-0">
              <Image src={b.img} alt={b.title} fill sizes="180px" className="object-contain" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
