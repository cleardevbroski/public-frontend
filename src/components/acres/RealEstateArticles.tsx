"use client";
import Image from "@/components/Image";
import Link from "@/components/Link";
import { ArrowRight, BookOpen } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "Whitefield vs Electronic City: Where to invest in Bangalore?",
    excerpt: "An in-depth comparative analysis of Bangalore's two largest tech corridors detailing infrastructure, prices, and vacancy rates.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    category: "Market Report",
    readTime: "5 min read",
    date: "June 2026",
  },
  {
    id: 2,
    title: "RERA Karnataka: Everything home buyers should know",
    excerpt: "A comprehensive compliance handbook regarding developer timelines, layout registrations, and dispute channels.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
    category: "Legal & RERA",
    readTime: "7 min read",
    date: "May 2026",
  },
  {
    id: 3,
    title: "Namma Metro Line Expansion Driving Whitefield Rates",
    excerpt: "How Phase 2 and suburban transit nodes are directly shaping the residential value map in East Bangalore.",
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80",
    category: "Infrastructure",
    readTime: "4 min read",
    date: "April 2026",
  },
  {
    id: 4,
    title: "Home Loan Rates 2026: Mortgage Market Directions",
    excerpt: "Expert insights outlining global policies, local RBI actions, and expected fixed vs floating rates projections.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
    category: "Finance Guide",
    readTime: "8 min read",
    date: "June 2026",
  },
];

export default function RealEstateArticles() {
  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1);

  return (
    <section className="bg-white py-16 border-t border-[#E2E9FB]/30">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF37] font-bold tracking-widest uppercase">
              <BookOpen className="size-4 text-[#D4AF37]" />
              ClearTitle Insights
            </div>
            <h2 className="text-[28px] font-bold text-[#1E3A8A] mt-1" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
              Editorial & Market Research
            </h2>
            <p className="text-[14px] text-[#6E7488] mt-1">
              Read critical analysis on layout pricing, regulatory rules, and homebuying guidelines.
            </p>
          </div>
          <Link
            href="/property-rates-and-price-trends-in-bangalore-prffid"
            className="text-[13px] text-[#C9A24E] hover:text-[#A8842C] font-bold inline-flex items-center gap-1 hover:underline self-start md:self-auto"
          >
            Open Research Hub
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
          
          {/* Featured Article Card */}
          <Link
            href="#"
            className="group flex flex-col justify-between border border-[#D5DEF2]/35 hover:border-[#D4AF37]/50 rounded-2xl overflow-hidden bg-[#F1F5FF]/15 hover:shadow-xl transition-all duration-500 hover:scale-[1.01]"
          >
            <div className="relative aspect-[16/10] w-full bg-[#E2E9FB] overflow-hidden">
              <Image
                src={featuredArticle.image}
                alt={featuredArticle.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <span className="absolute top-4 left-4 bg-[#1E3A8A] text-[#E8C66A] text-[10px] font-bold tracking-wider px-3 py-1 rounded shadow">
                {featuredArticle.category}
              </span>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 text-[11px] text-[#6E7488] font-bold uppercase tracking-wider mb-2">
                <span>{featuredArticle.date}</span>
                <span>•</span>
                <span>{featuredArticle.readTime}</span>
              </div>
              
              <h3 className="text-[22px] font-bold text-[#1E3A8A] group-hover:text-[#C9A24E] transition-colors leading-tight">
                {featuredArticle.title}
              </h3>
              
              <p className="text-[13.5px] text-[#243559]/85 mt-2.5 leading-relaxed">
                {featuredArticle.excerpt}
              </p>

              <span className="text-[12.5px] text-[#C9A24E] font-bold mt-5 inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                Read Full Analysis
                <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>

          {/* Stacked Side Articles */}
          <div className="flex flex-col gap-5 justify-between">
            {sideArticles.map((article) => (
              <Link
                key={article.id}
                href="#"
                className="group flex items-start gap-4 p-4 border border-[#D5DEF2]/25 hover:border-[#C9A24E]/40 rounded-2xl hover:bg-[#F1F5FF]/20 hover:shadow-md transition-all duration-300"
              >
                <div className="relative size-24 md:size-28 shrink-0 rounded-xl overflow-hidden bg-[#E2E9FB]">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="112px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <span className="text-[9.5px] bg-[#F1F5FF] border border-[#D5DEF2]/40 text-[#C9A24E] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-1.5">
                      {article.category}
                    </span>
                    <h4 className="text-[14.5px] font-bold text-[#1E3A8A] group-hover:text-[#C9A24E] transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-[#6E7488] font-medium">
                    <span>{article.readTime}</span>
                    <span className="text-[#C9A24E] font-bold flex items-center gap-0.5 group-hover:gap-1 transition-all">
                      Read
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
