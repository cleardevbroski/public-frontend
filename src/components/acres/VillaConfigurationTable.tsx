import type { VillaConfigurationDetail } from "./mock-data";

export default function VillaConfigurationTable({ details }: { details: VillaConfigurationDetail[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#D5DEF2]">
      <table className="w-full min-w-[760px] text-left text-[12px]">
        <thead className="bg-[#1E3A8A] text-white">
          <tr>{["Config", "Price", "Plot area", "Built-up area", "Super area", "Beds", "Baths"].map((label) => <th key={label} className="px-3 py-3 font-bold">{label}</th>)}</tr>
        </thead>
        <tbody>
          {details.map((row) => (
            <tr key={row.configuration} className="border-t border-[#E2E9FB] text-[#243559]">
              <td className="px-3 py-3 font-bold text-[#1E3A8A]">{row.configuration}</td>
              <td className="px-3 py-3 font-semibold">{row.price}</td>
              <td className="px-3 py-3">{row.plotArea}</td>
              <td className="px-3 py-3">{row.builtUpArea}</td>
              <td className="px-3 py-3">{row.superArea}</td>
              <td className="px-3 py-3">{row.bedrooms}</td>
              <td className="px-3 py-3">{row.bathrooms}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
