import type { ConfigurationDetail } from "./mock-data";

export default function ConfigurationTable({ details }: { details: ConfigurationDetail[] }) {
  const columns = [
    { label: "Config", value: (row: ConfigurationDetail) => row.configuration },
    { label: "Price", value: (row: ConfigurationDetail) => row.price },
    { label: "Built-up area", value: (row: ConfigurationDetail) => row.builtUpArea },
    { label: "Carpet area", value: (row: ConfigurationDetail) => row.carpetArea },
    { label: "Bedrooms", value: (row: ConfigurationDetail) => row.bedrooms },
    { label: "Bathrooms", value: (row: ConfigurationDetail) => row.bathrooms },
    { label: "Balconies", value: (row: ConfigurationDetail) => row.balconies },
    { label: "Facing", value: (row: ConfigurationDetail) => row.facings?.join(", ") },
  ].filter((column) => details.some((row) => {
    const value = column.value(row);
    return value !== undefined && value !== "";
  }));
  if (!columns.length) return null;
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E4E0E7]" data-testid="configuration-table">
      <table className="w-full min-w-[900px] text-left text-[13px]">
        <thead className="bg-[#121B35] text-white">
          <tr>{columns.map(({ label }) => <th key={label} className="px-4 py-3">{label}</th>)}</tr>
        </thead>
        <tbody>
          {details.map((row) => (
            <tr key={row.configuration} className="border-t border-[#F3F1F5]">
              {columns.map(({ label, value }) => <td key={label} className={`px-4 py-3 ${label === "Config" ? "font-bold text-[#121B35]" : label === "Price" ? "font-bold text-[#DDAA42]" : ""}`}>{value(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
