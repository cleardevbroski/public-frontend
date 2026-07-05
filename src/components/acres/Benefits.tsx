import { benefits } from "./mock-data";

export default function Benefits() {
  return (
    <section className="bg-gradient-to-br from-[#1E3A8A] via-[#25459E] to-[#1E3A8A] text-white py-14 my-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#C9A24E]/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-[#D4AF37]/8 to-transparent rounded-full blur-3xl" />
      
      <div className="max-w-[1200px] mx-auto px-3 relative z-10">
        <p className="acres-overline !text-[#D4AF37]">Benefits of ClearTitle One</p>
        <h2 className="text-[28px] font-bold mt-1 mb-2" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>Why choose ClearTitle One</h2>
        <p className="text-[14px] text-white/60 mb-10 max-w-2xl">
          India&apos;s most trusted real estate platform with verified listings, smart tools and
          expert assistance — all designed to help you find, sell, or lease faster.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => (
            <div key={b.n} className="relative group">
              <div className="text-[44px] font-bold text-[#D4AF37] leading-none mb-3 group-hover:text-[#E8C66A] transition-colors duration-300">{b.n}.</div>
              <h3 className="text-[16px] font-semibold mb-2">{b.title}</h3>
              <p className="text-[12px] text-white/60 leading-relaxed">{b.desc}</p>
              {/* Gold accent line */}
              <div className="absolute -left-3 top-4 w-[2px] h-8 bg-gradient-to-b from-[#D4AF37] to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
