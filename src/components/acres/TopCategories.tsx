"use client";
import Link from "@/components/Link";
import { ArrowRight } from "lucide-react";

type Category = {
  title: string;
  sub: string;
  tag: string;
  img: string;
  href: string;
};

const categories: Category[] = [
  {
    title: "Modern Apartments",
    sub: "Prime Bangalore Locations",
    tag: "Ready to Move & Under Construction",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&q=80",
    href: "/flats-in-bangalore-ffid",
  },
  {
    title: "Luxury Villas",
    sub: "Exclusive Villa Communities",
    tag: "Spacious & Premium Residences",
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000&q=80",
    href: "/independent-house-in-bangalore-ffid",
  },
  {
    title: "Commercial",
    sub: "Ideal for Businesses & Investors",
    tag: "Office Spaces & Retail Properties",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=80",
    href: "/commercial-property-in-bangalore-ffid",
  },
  {
    title: "Land & Plots",
    sub: "Invest in Bangalore's Growth",
    tag: "Gated Community & Residential Plots",
    img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&q=80",
    href: "/residential-land-in-bangalore-ffid",
  },
];

export default function TopCategories() {
  return (
    <section className="bg-[#F1F5FF] py-20">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#1E3A8A]">
            Explore Our <span className="text-gold-gradient">Top Categories</span>
          </h2>
          <div className="gold-divider mx-auto mt-4" />
          <p className="text-[15px] text-[#6E7488] mt-4">
            Discover the finest properties in Bangalore tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="group relative h-[260px] rounded-2xl overflow-hidden shadow-lg border border-[#1E3A8A]/10"
            >
              <img
                src={c.img}
                alt={c.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B43] via-[#0B1B43]/55 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/0 to-[#D4AF37]/0 group-hover:from-[#D4AF37]/15 transition-all duration-500" />

              <div className="absolute inset-0 p-7 flex flex-col justify-end">
                <h3 className="text-[26px] font-bold text-white leading-tight">{c.title}</h3>
                <p className="text-[12.5px] text-[#E8C66A] font-semibold mt-1">{c.tag}</p>
                <p className="text-[13px] text-white/70 mt-0.5">{c.sub}</p>

                <span className="mt-4 inline-flex items-center gap-2 w-fit btn-gold px-4 py-2 rounded-lg text-[13px]">
                  Explore
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
