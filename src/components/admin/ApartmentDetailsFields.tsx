import type { ConfigurationDetail, PossessionDetails } from "@/components/acres/mock-data";
import { facingOptions, type ApartmentErrors } from "@/lib/propertyDetails";

type Props = {
  configInput: string;
  setConfigInput: (value: string) => void;
  addConfig: () => void;
  removeConfig: (value: string) => void;
  details: ConfigurationDetail[];
  updateDetail: (configuration: string, updates: Partial<ConfigurationDetail>) => void;
  possession: PossessionDetails;
  setPossession: (value: PossessionDetails) => void;
  floorLabel: string;
  setFloorLabel: (value: string) => void;
  totalFloors?: number;
  setTotalFloors: (value?: number) => void;
  errors: ApartmentErrors;
  configError?: string;
};

const inputClass = "w-full min-w-[105px] px-3 py-2.5 border border-[#D5DEF2] rounded-lg text-[13px] focus:outline-none focus:border-[#C9A24E]";

export default function ApartmentDetailsFields(props: Props) {
  const dateField = props.possession.status === "Under Construction" ? "expectedCompletionDate" : "launchDate";
  const dateLabel = props.possession.status === "Under Construction" ? "Expected Completion Date" : "Launch Date";
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-[13px] font-semibold text-[#243559] mb-2">Configurations <span className="text-[#E8C66A]">*</span></label>
        <div className="flex gap-2">
          <input
            value={props.configInput}
            onChange={(event) => props.setConfigInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), props.addConfig())}
            placeholder="e.g. 2 BHK, 3 BHK or 4 BHK"
            className="flex-1 px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px] focus:outline-none focus:border-[#C9A24E]"
          />
          <button type="button" onClick={props.addConfig} className="px-5 py-3 bg-[#C9A24E] text-white rounded-xl text-[13px] font-semibold">Add</button>
        </div>
        {(props.configError || props.errors.configurations) && <p className="text-[12px] text-red-600 mt-1.5">{props.configError || props.errors.configurations}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {props.details.map((row) => (
            <span key={row.configuration} className="inline-flex items-center gap-1.5 bg-[#E2E9FB] text-[#1E3A8A] px-3 py-1.5 rounded-lg text-[13px] font-semibold">
              {row.configuration}
              <button type="button" onClick={() => props.removeConfig(row.configuration)} className="text-[#6E7488] hover:text-red-600" aria-label={`Remove ${row.configuration}`}>×</button>
            </span>
          ))}
        </div>
      </div>

      {props.details.length > 0 && (
        <div>
          <h3 className="text-[14px] font-bold text-[#1E3A8A] mb-2">Per-configuration details</h3>
          <div className="overflow-x-auto border border-[#D5DEF2] rounded-xl">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="bg-[#1E3A8A] text-white text-[11px] uppercase tracking-wide">
                <tr>{["Config", "Price", "Super area", "Carpet area", "Beds", "Baths", "Balconies", "Facing"].map((label) => <th key={label} className="px-3 py-3">{label}</th>)}</tr>
              </thead>
              <tbody>
                {props.details.map((row) => {
                  const prefix = `configuration.${row.configuration}`;
                  const field = (name: string) => props.errors[`${prefix}.${name}`];
                  return (
                    <tr key={row.configuration} className="border-t border-[#E2E9FB] align-top">
                      <td className="px-3 py-3 font-bold text-[#1E3A8A] whitespace-nowrap">{row.configuration}</td>
                      {(["price", "superBuiltUpArea", "carpetArea"] as const).map((key) => (
                        <td key={key} className="px-2 py-2">
                          <input className={inputClass} value={row[key]} placeholder={key === "price" ? "₹1.70 Cr" : "1280 sqft"} onChange={(e) => props.updateDetail(row.configuration, { [key]: e.target.value })} />
                          {field(key) && <p className="text-[10px] text-red-600 mt-1">{field(key)}</p>}
                        </td>
                      ))}
                      {(["bedrooms", "bathrooms", "balconies"] as const).map((key) => (
                        <td key={key} className="px-2 py-2">
                          <input type="number" min={key === "balconies" ? 0 : 1} step={1} className={`${inputClass} min-w-[72px]`} value={row[key]} onChange={(e) => props.updateDetail(row.configuration, { [key]: Number(e.target.value) })} />
                          {field(key) && <p className="text-[10px] text-red-600 mt-1">{field(key)}</p>}
                        </td>
                      ))}
                      <td className="px-2 py-2 min-w-[240px]">
                        <div className="flex flex-wrap gap-1">
                          {facingOptions.map((facing) => (
                            <button key={facing} type="button" onClick={() => props.updateDetail(row.configuration, { facings: row.facings.includes(facing) ? row.facings.filter((item) => item !== facing) : [...row.facings, facing] })} className={`px-2 py-1 rounded-md text-[10px] border ${row.facings.includes(facing) ? "bg-[#C9A24E] text-white border-[#C9A24E]" : "bg-white text-[#243559] border-[#D5DEF2]"}`}>{facing}</button>
                          ))}
                        </div>
                        {field("facings") && <p className="text-[10px] text-red-600 mt-1">{field("facings")}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-[#243559] mb-2">Possession Status <span className="text-[#E8C66A]">*</span></label>
          <select value={props.possession.status} onChange={(e) => props.setPossession(e.target.value === "Under Construction" ? { status: "Under Construction", expectedCompletionDate: "" } : { status: e.target.value as "Ready to Move" | "New Launch", launchDate: "" })} className={inputClass}>
            <option>Ready to Move</option><option>Under Construction</option><option>New Launch</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#243559] mb-2">{dateLabel} <span className="text-[#E8C66A]">*</span></label>
          <input type="date" value={props.possession[dateField] || ""} onChange={(e) => props.setPossession({ ...props.possession, [dateField]: e.target.value })} className={inputClass} />
          {props.errors.possessionDate && <p className="text-[12px] text-red-600 mt-1">{props.errors.possessionDate}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#243559] mb-2">Flat Floor <span className="text-[#E8C66A]">*</span></label>
          <input value={props.floorLabel} onChange={(e) => props.setFloorLabel(e.target.value)} placeholder="e.g. 3, Ground or Basement" className={inputClass} />
          {props.errors.floorLabel && <p className="text-[12px] text-red-600 mt-1">{props.errors.floorLabel}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#243559] mb-2">Total Floors</label>
          <input type="number" min={1} step={1} value={props.totalFloors ?? ""} onChange={(e) => props.setTotalFloors(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 12" className={inputClass} />
          {props.errors.totalFloors && <p className="text-[12px] text-red-600 mt-1">{props.errors.totalFloors}</p>}
        </div>
      </div>
    </div>
  );
}
