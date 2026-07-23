import type { ApartmentRoom, ConfigurationDetail, PossessionDetails } from "@/components/acres/mock-data";
import { facingOptions, type ApartmentErrors } from "@/lib/propertyDetails";
import OptionalMediaField from "./OptionalMediaField";

type Props = {
  configInput: string;
  setConfigInput: (value: string) => void;
  addConfig: () => void;
  removeConfig: (value: string, occurrence?: number) => void;
  details: ConfigurationDetail[];
  updateDetail: (index: number, updates: Partial<ConfigurationDetail>) => void;
  possession: PossessionDetails;
  setPossession: (value: PossessionDetails) => void;
  floorLabel: string;
  setFloorLabel: (value: string) => void;
  totalFloors?: number;
  setTotalFloors: (value?: number) => void;
  errors: ApartmentErrors;
  configError?: string;
};

const inputClass = "w-full min-w-[105px] px-3 py-2.5 border border-[#E4E0E7] rounded-lg text-[13px] focus:outline-none focus:border-[#DDAA42]";

export default function ApartmentDetailsFields(props: Props) {
  const isUnderConstruction = props.possession.status === "Under Construction";
  const dateField = isUnderConstruction ? "expectedCompletionDate" : "launchDate";
  const dateLabel = isUnderConstruction
    ? "Expected Completion Month (Month / Year)"
    : props.possession.status === "Ready to Move"
      ? "Ready Since Date (Day / Month / Year)"
      : "Launch Date (Day / Month / Year)";
  const dateInputType = isUnderConstruction ? "month" : "date";
  const dateInputValue = isUnderConstruction
    ? String(props.possession.expectedCompletionDate || "").slice(0, 7)
    : props.possession.launchDate || "";
  const addRoom = (configurationIndex: number) => {
    const current = props.details[configurationIndex].rooms || [];
    const room: ApartmentRoom = { id: `room-${Date.now()}`, name: "", category: "other", unit: "ft" };
    props.updateDetail(configurationIndex, { rooms: [...current, room] });
  };
  const updateRoom = (configurationIndex: number, roomIndex: number, updates: Partial<ApartmentRoom>) => {
    const rooms = [...(props.details[configurationIndex].rooms || [])];
    rooms[roomIndex] = { ...rooms[roomIndex], ...updates };
    props.updateDetail(configurationIndex, { rooms });
  };
  const removeRoom = (configurationIndex: number, roomIndex: number) => {
    props.updateDetail(configurationIndex, { rooms: (props.details[configurationIndex].rooms || []).filter((_, index) => index !== roomIndex) });
  };
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Configurations <span className="text-[#F2C052]">*</span></label>
        <div className="flex gap-2">
          <input
            value={props.configInput}
            onChange={(event) => props.setConfigInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), props.addConfig())}
            placeholder="e.g. 2 BHK, 3 BHK or 4 BHK"
            className="flex-1 px-4 py-3 border border-[#E4E0E7] rounded-xl text-[14px] focus:outline-none focus:border-[#DDAA42]"
          />
          <button type="button" onClick={props.addConfig} className="px-5 py-3 bg-[#DDAA42] text-[#0B1328] rounded-xl text-[13px] font-semibold">Add</button>
        </div>
        {(props.configError || props.errors.configurations) && <p className="text-[12px] text-red-600 mt-1.5">{props.configError || props.errors.configurations}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {props.details.map((row, index) => (
            <span key={`${row.configuration}-${index}`} className="inline-flex items-center gap-1.5 bg-[#F3F1F5] text-[#121B35] px-3 py-1.5 rounded-lg text-[13px] font-semibold">
              {row.configuration}
              <button type="button" onClick={() => props.removeConfig(row.configuration, props.details.slice(0, index).filter((item) => item.configuration === row.configuration).length)} className="text-[#68646F] hover:text-red-600" aria-label={`Remove ${row.configuration}`}>×</button>
            </span>
          ))}
        </div>
      </div>

      {props.details.length > 0 && (
        <div>
          <h3 className="text-[14px] font-bold text-[#121B35] mb-2">Per-configuration details</h3>
          <div className="overflow-x-auto border border-[#E4E0E7] rounded-xl">
            <table className="w-full min-w-[1080px] text-left">
              <thead className="bg-[#121B35] text-white text-[11px] uppercase tracking-wide">
                <tr>{["Config", "Price", "Super area", "Carpet area", "Beds", "Baths", "Balconies", "Facing"].map((label) => <th key={label} className="px-3 py-3">{label}</th>)}</tr>
              </thead>
              <tbody>
                {props.details.map((row, index) => {
                  const prefix = `configuration.${index}`;
                  const field = (name: string) => props.errors[`${prefix}.${name}`];
                  return (
                    <tr key={`${row.configuration}-${index}`} className="border-t border-[#F3F1F5] align-top">
                      <td className="px-3 py-3 font-bold text-[#121B35] whitespace-nowrap">{row.configuration}</td>
                      {(["price", "superBuiltUpArea", "carpetArea"] as const).map((key) => (
                        <td key={key} className="px-2 py-2">
                          <input className={inputClass} value={row[key]} placeholder={key === "price" ? "₹1.70 Cr" : "1280 sqft"} onChange={(e) => props.updateDetail(index, { [key]: e.target.value })} />
                          {field(key) && <p className="text-[10px] text-red-600 mt-1">{field(key)}</p>}
                        </td>
                      ))}
                      {(["bedrooms", "bathrooms", "balconies"] as const).map((key) => (
                        <td key={key} className="px-2 py-2">
                          <input type="number" min={key === "balconies" ? 0 : 1} step={1} className={`${inputClass} min-w-[72px]`} value={row[key]} onChange={(e) => props.updateDetail(index, { [key]: Number(e.target.value) })} />
                          {field(key) && <p className="text-[10px] text-red-600 mt-1">{field(key)}</p>}
                        </td>
                      ))}
                      <td className="px-2 py-2 min-w-[240px]">
                        <div className="flex flex-wrap gap-1">
                          {facingOptions.map((facing) => (
                            <button key={facing} type="button" onClick={() => props.updateDetail(index, { facings: row.facings.includes(facing) ? row.facings.filter((item) => item !== facing) : [...row.facings, facing] })} className={`px-2 py-1 rounded-md text-[10px] border ${row.facings.includes(facing) ? "bg-[#DDAA42] text-[#0B1328] border-[#DDAA42]" : "bg-white text-[#3F3D46] border-[#E4E0E7]"}`}>{facing}</button>
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

      {props.details.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-[14px] font-bold text-[#121B35]">Floor plans and room measurements</h3>
            <p className="mt-1 text-[12px] text-[#68646F]">Optional. Add a plan image for each configuration and room dimensions for the public interactive viewer.</p>
          </div>
          {props.details.map((row, configurationIndex) => (
            <div key={`plan-${row.configuration}-${configurationIndex}`} className="rounded-xl border border-[#E4E0E7] bg-[#F8F7FA] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[13px] font-bold text-[#121B35]">{row.configuration} presentation</p>
                <button type="button" onClick={() => addRoom(configurationIndex)} className="rounded-lg border border-[#DDAA42] bg-white px-3 py-1.5 text-[11px] font-bold text-[#9A741E] hover:bg-[#FFF9E9]">+ Add room</button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div><label className="mb-1 block text-[11px] font-semibold text-[#5A5762]">Built-up area</label><input value={row.builtUpArea || ""} onChange={(event) => props.updateDetail(configurationIndex, { builtUpArea: event.target.value })} placeholder="e.g. 1180 sqft" className={inputClass} /></div>
                <OptionalMediaField label="2D floor plan" value={row.floorPlan2dUrl} onChange={(floorPlan2dUrl) => props.updateDetail(configurationIndex, { floorPlan2dUrl })} description="Upload a plan image or paste its URL." />
                <OptionalMediaField label="3D floor plan" value={row.floorPlan3dUrl} onChange={(floorPlan3dUrl) => props.updateDetail(configurationIndex, { floorPlan3dUrl })} description="Upload a rendered 3D plan image or paste its URL." />
              </div>
              {(props.errors[`configuration.${configurationIndex}.floorPlan2dUrl`] || props.errors[`configuration.${configurationIndex}.floorPlan3dUrl`]) && <p className="mt-2 text-[10px] text-red-600">{props.errors[`configuration.${configurationIndex}.floorPlan2dUrl`] || props.errors[`configuration.${configurationIndex}.floorPlan3dUrl`]}</p>}
              {(row.rooms || []).length > 0 && (
                <div className="mt-4 space-y-2">
                  {(row.rooms || []).map((room, roomIndex) => (
                    <div key={room.id || roomIndex} className="grid items-end gap-2 rounded-lg border border-[#E0E6F0] bg-white p-3 sm:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_0.7fr_auto]">
                      <div><label className="mb-1 block text-[10px] font-bold uppercase text-[#7A8599]">Room</label><input value={room.name} onChange={(event) => updateRoom(configurationIndex, roomIndex, { name: event.target.value })} placeholder="Master bedroom" className={inputClass} />{props.errors[`configuration.${configurationIndex}.rooms.${roomIndex}.name`] && <p className="mt-1 text-[10px] text-red-600">{props.errors[`configuration.${configurationIndex}.rooms.${roomIndex}.name`]}</p>}</div>
                      <div><label className="mb-1 block text-[10px] font-bold uppercase text-[#7A8599]">Type</label><select value={room.category || "other"} onChange={(event) => updateRoom(configurationIndex, roomIndex, { category: event.target.value as ApartmentRoom["category"] })} className={inputClass}>{["bedroom", "bathroom", "kitchen", "living", "dining", "balcony", "utility", "other"].map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
                      <div><label className="mb-1 block text-[10px] font-bold uppercase text-[#7A8599]">Length</label><input type="number" min="0" step="0.1" value={room.length ?? ""} onChange={(event) => updateRoom(configurationIndex, roomIndex, { length: event.target.value ? Number(event.target.value) : undefined })} className={inputClass} /></div>
                      <div><label className="mb-1 block text-[10px] font-bold uppercase text-[#7A8599]">Width</label><input type="number" min="0" step="0.1" value={room.width ?? ""} onChange={(event) => updateRoom(configurationIndex, roomIndex, { width: event.target.value ? Number(event.target.value) : undefined })} className={inputClass} /></div>
                      <div><label className="mb-1 block text-[10px] font-bold uppercase text-[#7A8599]">Unit</label><select value={room.unit || "ft"} onChange={(event) => updateRoom(configurationIndex, roomIndex, { unit: event.target.value as "ft" | "m" })} className={inputClass}><option value="ft">ft</option><option value="m">m</option></select></div>
                      <button type="button" onClick={() => removeRoom(configurationIndex, roomIndex)} className="h-10 rounded-lg px-3 text-[11px] font-bold text-red-600 hover:bg-red-50">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Possession Status <span className="text-[#F2C052]">*</span></label>
          <select value={props.possession.status} onChange={(e) => props.setPossession(e.target.value === "Under Construction" ? { status: "Under Construction", expectedCompletionDate: "" } : { status: e.target.value as "Ready to Move" | "New Launch", launchDate: "" })} className={inputClass}>
            <option>Ready to Move</option><option>Under Construction</option><option>New Launch</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">{dateLabel} <span className="text-[#F2C052]">*</span></label>
          <input type={dateInputType} value={dateInputValue} onChange={(e) => props.setPossession({ ...props.possession, [dateField]: e.target.value })} className={inputClass} />
          {props.errors.possessionDate && <p className="text-[12px] text-red-600 mt-1">{props.errors.possessionDate}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Flat Floor</label>
          <input value={props.floorLabel} onChange={(e) => props.setFloorLabel(e.target.value)} placeholder="e.g. 3, Ground or Basement" className={inputClass} />
          {props.errors.floorLabel && <p className="text-[12px] text-red-600 mt-1">{props.errors.floorLabel}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#3F3D46] mb-2">Total Floors</label>
          <input type="number" min={1} step={1} value={props.totalFloors ?? ""} onChange={(e) => props.setTotalFloors(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 12" className={inputClass} />
          {props.errors.totalFloors && <p className="text-[12px] text-red-600 mt-1">{props.errors.totalFloors}</p>}
        </div>
      </div>
    </div>
  );
}
