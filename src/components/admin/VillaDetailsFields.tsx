import type {
  PossessionDetails,
  PlotFacing,
  VillaConfigurationDetail,
  VillaDetails,
  VillaType,
} from "@/components/acres/mock-data";
import { useState } from "react";
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
  const [savedConfigurations, setSavedConfigurations] = useState<Set<number>>(new Set());

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
                <tr>{["Config", "Price", "Plot area", "Built-up area", "Super area", "Bedrooms", "Bathrooms"].map((label) => <th key={label} className="px-3 py-3">{label}</th>)}</tr>
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

      {props.details.configurationDetails.map((row, index) => {
        const saved = savedConfigurations.has(index);
        const field = (name: string) => props.errors[`villaConfiguration.${index}.${name}`];
        if (saved) return (
          <div key={`villa-options-${row.configuration}-${index}`} className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div><p className="font-bold text-[#121B35]">{row.configuration} villa details saved</p><p className="text-[11px] text-[#68646F]">Add another configuration above, or edit this one.</p></div>
            <button type="button" onClick={() => setSavedConfigurations((current) => { const next = new Set(current); next.delete(index); return next; })} className="rounded-lg border border-[#DDAA42] bg-white px-3 py-2 text-[12px] font-bold text-[#121B35]">Edit</button>
          </div>
        );
        return (
          <div key={`villa-options-${row.configuration}-${index}`} className="rounded-2xl border border-[#E4E0E7]/70 bg-[#F8F7FA]/40 p-5">
            <div className="mb-4"><h3 className="text-[14px] font-bold text-[#121B35]">{row.configuration} villa-specific details</h3><p className="text-[11px] text-[#68646F]">Optional. Fill any fields that apply, then save this configuration.</p></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div><label className="mb-2 block text-[13px] font-semibold">Plot Dimensions</label><input value={row.plotDimensions || ""} onChange={(event) => props.updateDetail(index, { plotDimensions: event.target.value })} placeholder="e.g. 40 ft × 60 ft" className={inputClass} />{field("plotDimensions") && <p className="mt-1 text-[11px] text-red-600">{field("plotDimensions")}</p>}</div>
              <div><label className="mb-2 block text-[13px] font-semibold">Number of Floors</label><input value={row.numberOfFloors || ""} onChange={(event) => props.updateDetail(index, { numberOfFloors: event.target.value })} placeholder="e.g. G+2" className={inputClass} />{field("numberOfFloors") && <p className="mt-1 text-[11px] text-red-600">{field("numberOfFloors")}</p>}</div>
              <div><label className="mb-2 block text-[13px] font-semibold">Plot Facing</label><select value={row.plotFacing || ""} onChange={(event) => props.updateDetail(index, { plotFacing: (event.target.value || undefined) as PlotFacing | undefined })} className={inputClass}><option value="">Not specified</option>{facingOptions.map((facing) => <option key={facing}>{facing}</option>)}</select></div>
              <YesNoSelect label="Corner Plot" value={Boolean(row.cornerPlot)} onChange={(cornerPlot) => props.updateDetail(index, { cornerPlot })} />
              <div><label className="mb-2 block text-[13px] font-semibold">Road Width Facing</label><input value={row.roadWidthFacing || ""} onChange={(event) => props.updateDetail(index, { roadWidthFacing: event.target.value })} placeholder="e.g. 30 ft road" className={inputClass} />{field("roadWidthFacing") && <p className="mt-1 text-[11px] text-red-600">{field("roadWidthFacing")}</p>}</div>
              <YesNoSelect label="Private Garden / Lawn" value={Boolean(row.privateGarden)} onChange={(privateGarden) => props.updateDetail(index, { privateGarden, ...(!privateGarden ? { privateGardenArea: "" } : {}) })} />
              {row.privateGarden && <div><label className="mb-2 block text-[13px] font-semibold">Private Garden Area</label><input value={row.privateGardenArea || ""} onChange={(event) => props.updateDetail(index, { privateGardenArea: event.target.value })} placeholder="e.g. 400 sqft" className={inputClass} />{field("privateGardenArea") && <p className="mt-1 text-[11px] text-red-600">{field("privateGardenArea")}</p>}</div>}
              <YesNoSelect label="Private Pool" value={Boolean(row.privatePool)} onChange={(privatePool) => props.updateDetail(index, { privatePool })} />
              <YesNoSelect label="Terrace" value={Boolean(row.terrace)} onChange={(terrace) => props.updateDetail(index, { terrace, ...(!terrace ? { terraceDetails: "" } : {}) })} />
              {row.terrace && <div><label className="mb-2 block text-[13px] font-semibold">Terrace Details</label><input value={row.terraceDetails || ""} onChange={(event) => props.updateDetail(index, { terraceDetails: event.target.value })} placeholder="e.g. Private terrace access" className={inputClass} /></div>}
              <YesNoSelect label="Gated Community" value={Boolean(row.gatedCommunity)} onChange={(gatedCommunity) => props.updateDetail(index, { gatedCommunity })} />
            </div>
            <button type="button" onClick={() => setSavedConfigurations((current) => new Set(current).add(index))} className="mt-5 rounded-xl bg-[#121B35] px-5 py-2.5 text-[12px] font-bold text-white">Save {row.configuration} details</button>
          </div>
        );
      })}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Possession Status <span className="text-[#F2C052]">*</span></label>
          <select value={props.possession.status} onChange={(event) => props.setPossession(event.target.value === "Under Construction" ? { status: "Under Construction", expectedCompletionDate: "" } : { status: "Ready to Move", launchDate: "" })} className={inputClass}>
            <option>Ready to Move</option><option>Under Construction</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">{underConstruction ? "Expected Completion Month / Year" : "Ready Since"} <span className="text-[#F2C052]">*</span></label>
          <input type={underConstruction ? "month" : "date"} value={underConstruction ? String(props.possession[dateField] || "").slice(0, 7) : props.possession[dateField] || ""} onChange={(event) => props.setPossession({ ...props.possession, [dateField]: event.target.value })} className={inputClass} />
          {props.errors.possessionDate && <p className="text-[12px] text-red-600 mt-1">{props.errors.possessionDate}</p>}
        </div>
      </div>
    </div>
  );
}
