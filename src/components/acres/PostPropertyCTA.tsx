import Image from "@/components/Image";
import Link from "@/components/Link";
import { Check } from "lucide-react";

export default function PostPropertyCTA() {
  return (
    <section className="max-w-[1200px] mx-auto px-3 my-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3A8A] via-[#25459E] to-[#A8842C] text-white p-8 md:p-10 flex flex-col md:flex-row items-center gap-6">
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 w-[250px] h-[250px] bg-gradient-to-br from-[#D4AF37]/15 to-transparent rounded-full blur-2xl" />
        <div className="absolute -left-10 -bottom-10 w-[200px] h-[200px] bg-gradient-to-tr from-[#C9A24E]/15 to-transparent rounded-full blur-2xl" />

        <div className="flex-1 relative z-10">
          <p className="text-[12px] tracking-[0.18em] font-semibold text-[#D4AF37] uppercase mb-2">
            Post your property
          </p>
          <h2 className="text-[28px] md:text-[32px] font-bold leading-tight" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
            Sell, rent, or lease faster at the right price!
          </h2>
          <p className="mt-3 text-[14px] text-white/80 max-w-xl">
            List your property on India&apos;s No. 1 property portal. Free posting on registration.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px] text-white/90 max-w-md">
            {[
              "Free property listing",
              "Verified buyer leads",
              "Pricing assistance",
              "Premium visibility",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="size-4 text-[#C9A24E]" strokeWidth={3} />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-3">
            <Link href="/postproperty" className="bg-gradient-to-r from-[#D4AF37] to-[#E8C66A] hover:from-[#C5A55A] hover:to-[#D4AF37] transition-all duration-200 text-[#1E3A8A] font-bold text-[14px] px-6 h-11 rounded-lg inline-flex items-center shadow-lg hover:shadow-xl">
              Post Property — It&apos;s FREE
            </Link>
            <Link href="/postproperty" className="text-white/80 hover:text-white text-[13px] font-semibold underline-offset-4 hover:underline transition-colors duration-200">
              Learn more
            </Link>
          </div>
        </div>
        <div className="hidden md:flex w-[260px] shrink-0 relative z-10 items-center justify-center">
          <div className="w-48 h-48 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 flex items-center justify-center shadow-inner relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent rounded-3xl" />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-24 text-[#E8C66A] group-hover:rotate-6 transition-transform duration-500"
            >
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1" />
              <path d="M18 8h4a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-4" />
              <path d="M2 8h4v8H2z" />
              <path d="M22 8h-4V4h4z" />
              <path d="M7 4h10" />
              <path d="M12 2v20" />
              <path d="M12 18H3" />
              <path d="M12 18h9" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
