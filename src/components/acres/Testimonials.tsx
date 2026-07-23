"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, Sparkles } from "lucide-react";
import { testimonials as fallbackTestimonials } from "./mock-data";
import { fetchTestimonials } from "@/lib/api";

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollBy = (d: 1 | -1) => ref.current?.scrollBy({ left: d * 360, behavior: "smooth" });
  const [items, setItems] = useState(fallbackTestimonials);
  useEffect(() => {
    fetchTestimonials({ status: "approved" })
      .then((rows: any[]) => { if (Array.isArray(rows) && rows.length) setItems(rows); })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-gradient-to-b from-white to-[#F8F7FA]/25 py-16">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-[11px] text-[#DDAA42] font-bold tracking-widest uppercase">
              <Sparkles className="size-4 text-[#DDAA42]" />
              Happy Clients
            </div>
            <h2 className="text-[30px] md:text-[38px] font-bold text-[#121B35] mt-1">
              What Our <span className="text-gold-gradient">Clients Say</span>
            </h2>
            <p className="text-[14px] text-[#68646F] mt-1">
              Testimonials from our happy clients across Bangalore.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => scrollBy(-1)}
              className="size-10 rounded-full bg-white border border-[#E4E0E7]/60 flex items-center justify-center hover:border-[#DDAA42] hover:shadow-lg hover:scale-105 transition-all duration-200"
              aria-label="Scroll reviews left"
            >
              <ChevronLeft className="size-5 text-[#121B35]" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              className="size-10 rounded-full bg-white border border-[#E4E0E7]/60 flex items-center justify-center hover:border-[#DDAA42] hover:shadow-lg hover:scale-105 transition-all duration-200"
              aria-label="Scroll reviews right"
            >
              <ChevronRight className="size-5 text-[#121B35]" />
            </button>
          </div>
        </div>

        {/* Carousel Content */}
        <div className="relative">
          <div
            ref={ref}
            className="flex gap-5 overflow-x-auto no-scrollbar pb-6 pt-2 scroll-smooth"
          >
            {items.map((t) => (
              <div
                key={(t as any)._id ?? t.name}
                className="shrink-0 w-[350px] bg-white border border-[#E4E0E7]/35 hover:border-[#DDAA42]/50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                {/* Gold-Green gradient bar */}
                <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#DDAA42] via-[#DDAA42] to-[#DDAA42]" />
                
                {/* Quote details */}
                <div className="flex items-center justify-between mb-4.5">
                  <Quote className="size-8 text-[#DDAA42]/15 group-hover:text-[#DDAA42]/25 transition-colors duration-300" />
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="size-3.5 fill-[#DDAA42] text-[#DDAA42]" />
                    ))}
                  </div>
                </div>

                <p className="text-[13.5px] text-[#3F3D46]/90 leading-relaxed font-medium line-clamp-4 italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="border-t border-[#F3F1F5]/60 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F8F7FA] border border-[#E4E0E7]/40 rounded-full flex items-center justify-center text-[#DDAA42] font-bold text-[14px]">
                    {t.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#121B35]">{t.name}</h4>
                    <p className="text-[11px] text-[#68646F] font-semibold mt-0.5 uppercase tracking-wide">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
