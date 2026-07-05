import CityCarousel from "./CityCarousel";
import { cities } from "./mock-data";

export default function TopCitiesSection() {
  return (
    <div className="bg-gradient-to-b from-white to-[#F1F5FF]">
      <div className="max-w-[1200px] mx-auto px-3 pt-12 pb-2">
        <p className="acres-overline">Top Cities</p>
        <h2 className="text-[26px] font-bold text-[#1E3A8A] mt-1 mb-1" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
          Explore properties in top cities
        </h2>
        <p className="text-[14px] text-[#243559] mb-8">
          Find verified listings across India&apos;s most active real-estate markets.
        </p>
      </div>
      {cities.map((c) => (
        <CityCarousel key={c} city={c} />
      ))}
    </div>
  );
}
