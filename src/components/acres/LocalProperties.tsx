"use client";
import Image from "@/components/Image";
import Link from "@/components/Link";
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { bangaloreListings } from "./bangalore-data";

export default function LocalProperties() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const properties = bangaloreListings
    .filter(item => item.kind === "buy")
    .slice(0, 6);

  return (
    <section className="bg-white py-10">
      <div className="max-w-[1200px] mx-auto px-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[22px] font-bold text-[#1E3A8A]" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
              Property in Bangalore East
            </h2>
            <p className="text-[14px] text-[#243559] mt-1">
              Featured projects and listings in Bangalore East
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="size-8 rounded-full bg-white border border-[#D5DEF2] flex items-center justify-center hover:border-[#C9A24E] hover:shadow-md transition-all duration-200"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-4 text-[#1E3A8A]" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="size-8 rounded-full bg-white border border-[#D5DEF2] flex items-center justify-center hover:border-[#C9A24E] hover:shadow-md transition-all duration-200"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-4 text-[#1E3A8A]" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar pb-2"
        >
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/property/blr-${property.id.split('-')[1]}`}
              className="group shrink-0 w-[320px] bg-white rounded-xl overflow-hidden border border-[#D5DEF2]/50 hover:shadow-xl hover:border-[#C9A24E]/30 transition-all duration-300 acres-hover-lift"
            >
              <div className="relative h-[180px] bg-[#E2E9FB]">
                <Image
                  src={property.image}
                  alt={property.project}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  {property.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#1E3A8A]/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="text-[15px] font-semibold text-[#1E3A8A]">
                  {property.project}
                </h3>
                <p className="text-[13px] text-[#243559] mt-1 flex items-center gap-1">
                  <MapPin className="size-3 text-[#C9A24E]" />
                  {property.locality}, {property.microMarket}
                </p>
                
                <div className="mt-2 pt-2 border-t border-[#E2E9FB]">
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <div>
                      <p className="text-[#6E7488]">{property.configuration}</p>
                    </div>
                    <div>
                      <p className="text-[#6E7488]">{property.area}</p>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-[18px] font-bold text-[#1E3A8A]">{property.price}</span>
                    <span className="text-[11px] text-[#6E7488]">{property.priceSubtext}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Link
            href="/property-in-bangalore-east-ffid"
            className="inline-flex items-center gap-2 text-[#C9A24E] font-semibold hover:text-[#A8842C] hover:underline transition-colors duration-200"
          >
            View all properties in Bangalore East
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
