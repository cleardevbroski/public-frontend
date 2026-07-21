import type { ConfigurationDetail } from "./mock-data";

export default function ConfigurationTable({ details }: { details: ConfigurationDetail[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#D5DEF2]" data-testid="configuration-table">
      <table className="w-full min-w-[900px] text-left text-[13px]">
        <thead className="bg-[#1E3A8A] text-white">
          <tr>{["Config", "Price", "Super area", "Carpet area", "Beds", "Baths", "Balconies", "Facing"].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr>
        </thead>
        <tbody>
          {details.map((row) => (
            <tr key={row.configuration} className="border-t border-[#E2E9FB]">
              <td className="px-4 py-3 font-bold text-[#1E3A8A]">{row.configuration}</td>
              <td className="px-4 py-3 font-bold text-[#C9A24E]">{row.price}</td>
              <td className="px-4 py-3">{row.superBuiltUpArea}</td>
              <td className="px-4 py-3">{row.carpetArea}</td>
              <td className="px-4 py-3">{row.bedrooms}</td>
              <td className="px-4 py-3">{row.bathrooms}</td>
              <td className="px-4 py-3">{row.balconies}</td>
              <td className="px-4 py-3">{row.facings.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
