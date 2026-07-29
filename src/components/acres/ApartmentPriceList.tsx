import { Building2 } from "lucide-react";
import type { ConfigurationDetail } from "./mock-data";
import { priceWithCharges } from "@/lib/propertyPresentation";

export default function ApartmentPriceList({ title, details }: { title: string; details: ConfigurationDetail[] }) {
  if (!details.length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#DCE1EA] bg-white shadow-sm" aria-labelledby="price-list-heading">
      <div className="border-b border-[#E5E8EE] px-5 py-5 md:px-7">
        <h2 id="price-list-heading" className="text-[21px] font-extrabold text-[#172039]">{title} Price List</h2>
      </div>
      <div className="overflow-x-auto p-4 md:p-6">
        <div className="min-w-[520px] overflow-hidden rounded-xl border border-[#DDE2EA]">
          <div className="grid grid-cols-[1.8fr_0.9fr] bg-[#F0F2F5] px-6 py-4 text-[13px] font-semibold text-[#39445A]">
            <span>Unit Type (Saleable)</span>
            <span>Price<sup>+</sup></span>
          </div>
          <div className="divide-y divide-[#E4E8EF]">
            {details.map((detail, index) => (
              <div key={detail.id || `${detail.configuration}-${index}`} className="grid min-h-20 grid-cols-[1.8fr_0.9fr] items-center px-6 py-4 text-[14px]">
                <span className="flex items-center gap-3 font-extrabold text-[#172039]">
                  <Building2 className="size-5 text-[#56627A]" />
                  <span>{detail.configuration} Apartment <span className="ml-1 font-bold text-[#39445A]">{detail.builtUpArea || detail.carpetArea}</span></span>
                </span>
                <span className="font-extrabold text-[#172039]">{priceWithCharges(detail.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
