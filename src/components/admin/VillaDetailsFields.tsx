import type {
  PossessionDetails,
  PlotFacing,
  VillaConfigurationDetail,
  VillaDetails,
  VillaType,
} from "@/components/acres/mock-data";
import { facingOptions } from "@/lib/propertyDetails";
import type { VillaErrors } from "@/lib/villaDetails";

type Props = {
  configInput: string;
  setConfigInput: (value: string) => void;
  addConfig: () => void;
  removeConfig: (value: string, occurrence?: number) => void;
  details: VillaDetails;
  setDetails: (value: VillaDetails) => void;
  updateDetail: (index: number, updates: Partial<VillaConfigurationDetail>) => void;
  possession: PossessionDetails;
  setPossession: (value: PossessionDetails) => void;
  errors: VillaErrors;
  configError?: string;
};

const inputClass = "w-full min-w-[105px] px-3 py-2.5 border border-[#E4E0E7] rounded-lg text-[13px] focus:outline-none focus:border-[#DDAA42]";

function YesNoSelect({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">{label}</label>
      <select value={value ? "Yes" : "No"} onChange={(event) => onChange(event.target.value === "Yes")} className={inputClass}>
        <option>No</option><option>Yes</option>
      </select>
    </div>
  );
}

export default function VillaDetailsFields(props: Props) {
  const updateVilla = (updates: Partial<VillaDetails>) => props.setDetails({ ...props.details, ...updates });
  const underConstruction = props.possession.status === "Under Construction";
  const dateField = underConstruction ? "expectedCompletionDate" : "launchDate";

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Villa Type <span className="text-[#F2C052]">*</span></label>
        <select value={props.details.villaType} onChange={(event) => updateVilla({ villaType: event.target.value as VillaType })} className={inputClass}>
          <option>Independent</option><option>Row Villa</option><option>Twin Villa</option>
        </select>
        {props.errors.villaType && <p className="text-[12px] text-red-600 mt-1">{props.errors.villaType}</p>}
      </div>

      <div>
        <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Configurations <span className="text-[#F2C052]">*</span></label>
        <div className="flex gap-2">
          <input value={props.configInput} onChange={(event) => props.setConfigInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), props.addConfig())} placeholder="e.g. 3 BHK or 4 BHK" className="flex-1 px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42]" />
          <button type="button" onClick={props.addConfig} className="px-5 py-3 bg-[#DDAA42] text-[#0B1328] rounded-xl text-[13px] font-semibold">Add</button>
        </div>
        {(props.configError || props.errors.configurations) && <p className="text-[12px] text-red-600 mt-1.5">{props.configError || props.errors.configurations}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {props.details.configurationDetails.map((row, index) => (
            <span key={`${row.configuration}-${index}`} className="inline-flex items-center gap-1.5 bg-[#F3F1F5] text-[#121B35] px-3 py-1.5 rounded-lg text-[13px] font-semibold">
              {row.configuration}
              <button type="button" onClick={() => props.removeConfig(row.configuration, props.details.configurationDetails.slice(0, index).filter((item) => item.configuration === row.configuration).length)} className="text-[#68646F] hover:text-red-600" aria-label={`Remove ${row.configuration}`}>×</button>
            </span>
          ))}
        </div>
      </div>

      {props.details.configurationDetails.length > 0 && (
        <div>
          <h3 className="text-[14px] font-bold text-[#121B35] mb-2">Per-configuration Villa details</h3>
          <div className="overflow-x-auto border border-[#E4E0E7] rounded-xl">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-[#121B35] text-white text-[11px] uppercase tracking-wide">
                <tr>{["Config", "Price", "Plot area", "Built-up area", "Super area", "Beds", "Baths"].map((label) => <th key={label} className="px-3 py-3">{label}</th>)}</tr>
              </thead>
              <tbody>
                {props.details.configurationDetails.map((row, index) => {
                  const prefix = `villaConfiguration.${index}`;
                  const field = (name: string) => props.errors[`${prefix}.${name}`];
                  return (
                    <tr key={`${row.configuration}-${index}`} className="border-t border-[#F3F1F5] align-top">
                      <td className="px-3 py-3 font-bold text-[#121B35] whitespace-nowrap">{row.configuration}</td>
                      {(["price", "plotArea", "builtUpArea", "superArea"] as const).map((key) => (
                        <td key={key} className="px-2 py-2">
                          <input className={inputClass} value={row[key]} placeholder={key === "price" ? "₹2.80 Cr" : "2400 sqft"} onChange={(event) => props.updateDetail(index, { [key]: event.target.value })} />
                          {field(key) && <p className="text-[10px] text-red-600 mt-1">{field(key)}</p>}
                        </td>
                      ))}
                      {(["bedrooms", "bathrooms"] as const).map((key) => (
                        <td key={key} className="px-2 py-2">
                          <input type="number" min={1} step={1} className={`${inputClass} min-w-[72px]`} value={row[key]} onChange={(event) => props.updateDetail(index, { [key]: Number(event.target.value) })} />
                          {field(key) && <p className="text-[10px] text-red-600 mt-1">{field(key)}</p>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border border-[#E4E0E7]/50 bg-[#F8F7FA]/40 p-5">
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Plot Dimensions</label>
          <input value={props.details.plotDimensions || ""} onChange={(event) => updateVilla({ plotDimensions: event.target.value })} placeholder="e.g. 40 ft × 60 ft" className={inputClass} />
          {props.errors.plotDimensions && <p className="text-[11px] text-red-600 mt-1">{props.errors.plotDimensions}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Number of Floors</label>
          <input value={props.details.numberOfFloors || ""} onChange={(event) => updateVilla({ numberOfFloors: event.target.value })} placeholder="e.g. G+2" className={inputClass} />
          {props.errors.numberOfFloors && <p className="text-[11px] text-red-600 mt-1">{props.errors.numberOfFloors}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Plot Facing <span className="text-[#F2C052]">*</span></label>
          <select value={props.details.plotFacing} onChange={(event) => updateVilla({ plotFacing: event.target.value as PlotFacing })} className={inputClass}>{facingOptions.map((facing) => <option key={facing}>{facing}</option>)}</select>
          {props.errors.plotFacing && <p className="text-[11px] text-red-600 mt-1">{props.errors.plotFacing}</p>}
        </div>
        <YesNoSelect label="Corner Plot" value={props.details.cornerPlot} onChange={(cornerPlot) => updateVilla({ cornerPlot })} />
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Road Width Facing</label>
          <input value={props.details.roadWidthFacing || ""} onChange={(event) => updateVilla({ roadWidthFacing: event.target.value })} placeholder="e.g. 30 ft road" className={inputClass} />
          {props.errors.roadWidthFacing && <p className="text-[11px] text-red-600 mt-1">{props.errors.roadWidthFacing}</p>}
        </div>
        <YesNoSelect label="Private Garden / Lawn" value={props.details.privateGarden} onChange={(privateGarden) => updateVilla({ privateGarden, ...(!privateGarden ? { privateGardenArea: "" } : {}) })} />
        {props.details.privateGarden && <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Private Garden Area <span className="text-[#F2C052]">*</span></label>
          <input value={props.details.privateGardenArea || ""} onChange={(event) => updateVilla({ privateGardenArea: event.target.value })} placeholder="e.g. 400 sqft" className={inputClass} />
          {props.errors.privateGardenArea && <p className="text-[11px] text-red-600 mt-1">{props.errors.privateGardenArea}</p>}
        </div>}
        <YesNoSelect label="Private Pool" value={props.details.privatePool} onChange={(privatePool) => updateVilla({ privatePool })} />
        <YesNoSelect label="Terrace" value={props.details.terrace} onChange={(terrace) => updateVilla({ terrace, ...(!terrace ? { terraceDetails: "" } : {}) })} />
        {props.details.terrace && <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Terrace Details</label>
          <input value={props.details.terraceDetails || ""} onChange={(event) => updateVilla({ terraceDetails: event.target.value })} placeholder="e.g. Private terrace access" className={inputClass} />
        </div>}
        <YesNoSelect label="Gated Community" value={props.details.gatedCommunity} onChange={(gatedCommunity) => updateVilla({ gatedCommunity })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Possession Status <span className="text-[#F2C052]">*</span></label>
          <select value={props.possession.status} onChange={(event) => props.setPossession(event.target.value === "Under Construction" ? { status: "Under Construction", expectedCompletionDate: "" } : { status: "Ready to Move", launchDate: "" })} className={inputClass}>
            <option>Ready to Move</option><option>Under Construction</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">{underConstruction ? "Expected Completion" : "Ready Since"} <span className="text-[#F2C052]">*</span></label>
          <input type="date" value={props.possession[dateField] || ""} onChange={(event) => props.setPossession({ ...props.possession, [dateField]: event.target.value })} className={inputClass} />
          {props.errors.possessionDate && <p className="text-[12px] text-red-600 mt-1">{props.errors.possessionDate}</p>}
        </div>
      </div>
    </div>
  );
}
