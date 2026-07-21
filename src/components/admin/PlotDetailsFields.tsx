import type { PlotDetails, PlotInventoryItem, PlotSizeDetail } from "@/components/acres/mock-data";
import { createPlotInventoryItem, formatPlotPrice } from "@/lib/plotDetails";

type Props = {
  configInput: string;
  setConfigInput: (value: string) => void;
  addConfig: () => void;
  removeConfig: (value: string) => void;
  details: PlotDetails;
  setDetails: (value: PlotDetails) => void;
  errors: Record<string, string>;
  configError: string;
};

const facings = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West"] as const;

function parseCsvLine(line: string) {
  const result: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { result.push(value.trim()); value = ""; }
    else value += character;
  }
  result.push(value.trim());
  return result.map((item) => item.replace(/^"|"$/g, ""));
}

export default function PlotDetailsFields(props: Props) {
  const updateDetails = (updates: Partial<PlotDetails>) => props.setDetails({ ...props.details, ...updates });
  const updateSize = (plotSize: string, updates: Partial<PlotSizeDetail>) => updateDetails({
    plotSizeDetails: props.details.plotSizeDetails.map((row) => row.plotSize === plotSize ? { ...row, ...updates, totalPrice: Math.round(row.areaSqft * Number(updates.pricePerSqft ?? row.pricePerSqft ?? 0)) } : row),
  });
  const updateInventory = (index: number, updates: Partial<PlotInventoryItem>) => updateDetails({
    inventory: props.details.inventory.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item),
  });
  const addInventory = () => updateDetails({ inventory: [...props.details.inventory, createPlotInventoryItem(props.details.plotSizeDetails[0]?.plotSize || "")] });

  const importCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const start = /^plot\s*number/i.test(lines[0] || "") ? 1 : 0;
      const inventory = lines.slice(start).map((line) => {
        const [plotNumber = "", plotSize = "", facing = "East", status = "Available", isCorner = "false"] = parseCsvLine(line);
        return { plotNumber, plotSize, facing: facings.includes(facing as typeof facings[number]) ? facing as typeof facings[number] : "East", status: ["Available", "Booked", "Sold"].includes(status) ? status as PlotInventoryItem["status"] : "Available", isCorner: /^(true|yes|1)$/i.test(isCorner) };
      });
      updateDetails({ inventory, totalPlots: inventory.length });
    };
    reader.readAsText(file);
  };

  return <div className="space-y-6">
    <div>
      <label className="block text-[13px] font-semibold text-[#243559] mb-2">Plot sizes available <span className="text-[#E8C66A]">*</span></label>
      <div className="flex gap-2 mb-2">
        <input value={props.configInput} onChange={(event) => props.setConfigInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), props.addConfig())} placeholder="e.g. 30 × 40 or 30x40" className="flex-1 px-4 py-3 border border-[#D5DEF2] rounded-xl text-[14px]" />
        <button type="button" onClick={props.addConfig} className="px-5 py-3 bg-[#C9A24E] text-white rounded-xl text-[13px] font-semibold">Add</button>
      </div>
      {props.configError && <p className="text-[12px] text-red-600">{props.configError}</p>}
      {props.errors.configurations && <p className="text-[12px] text-red-600">{props.errors.configurations}</p>}
    </div>

    <div className="overflow-x-auto border border-[#D5DEF2] rounded-xl">
      <table className="min-w-[760px] w-full text-[13px]">
        <thead className="bg-[#1E3A8A] text-white"><tr><th className="p-3 text-left">Plot size</th><th className="p-3 text-left">Area</th><th className="p-3 text-left">Price / sqft</th><th className="p-3 text-left">Total price</th><th className="p-3 text-left">Facing options</th><th className="p-3" /></tr></thead>
        <tbody>{props.details.plotSizeDetails.map((row) => <tr key={row.plotSize} className="border-t border-[#E2E9FB]">
          <td className="p-3 font-semibold text-[#1E3A8A]">{row.plotSize}</td><td className="p-3">{row.areaSqft.toLocaleString("en-IN")} sqft</td>
          <td className="p-3"><input type="number" min={1} value={row.pricePerSqft || ""} onChange={(event) => updateSize(row.plotSize, { pricePerSqft: Number(event.target.value) })} placeholder="6500" className="w-28 px-2 py-2 border border-[#D5DEF2] rounded-lg" />{props.errors[`plotSize.${row.plotSize}.pricePerSqft`] && <p className="text-red-600 text-[11px]">Required</p>}</td>
          <td className="p-3 font-medium">{row.pricePerSqft ? formatPlotPrice(row.areaSqft * row.pricePerSqft) : "—"}</td>
          <td className="p-3"><div className="flex flex-wrap gap-1">{facings.map((facing) => <button type="button" key={facing} onClick={() => updateSize(row.plotSize, { facings: row.facings.includes(facing) ? row.facings.filter((value) => value !== facing) : [...row.facings, facing] })} className={`px-2 py-1 rounded text-[11px] border ${row.facings.includes(facing) ? "bg-[#C9A24E] text-white border-[#C9A24E]" : "border-[#D5DEF2] text-[#243559]"}`}>{facing}</button>)}</div></td>
          <td className="p-3"><button type="button" onClick={() => props.removeConfig(row.plotSize)} className="text-red-600">Remove</button></td>
        </tr>)}</tbody>
      </table>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-[#D5DEF2]/70 bg-[#F1F5FF]/40 p-5">
      <div><label className="block text-[13px] font-semibold text-[#243559] mb-2">No. of plots in layout <span className="text-[#E8C66A]">*</span></label><input type="number" min={1} value={props.details.totalPlots || ""} onChange={(event) => updateDetails({ totalPlots: Number(event.target.value) })} className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl" />{props.errors.totalPlots && <p className="text-[12px] text-red-600 mt-1">{props.errors.totalPlots}</p>}</div>
      <div><label className="block text-[13px] font-semibold text-[#243559] mb-2">Layout approval authority <span className="text-[#E8C66A]">*</span></label><select value={props.details.approvalAuthority} onChange={(event) => updateDetails({ approvalAuthority: event.target.value as PlotDetails["approvalAuthority"] })} className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl bg-white">{["BMRDA", "BDA", "DTCP", "Panchayat"].map((value) => <option key={value}>{value}</option>)}</select></div>
      <div><label className="block text-[13px] font-semibold text-[#243559] mb-2">Layout approval / sanction number</label><input value={props.details.approvalNumber || ""} onChange={(event) => updateDetails({ approvalNumber: event.target.value })} className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl" /></div>
      <div><label className="block text-[13px] font-semibold text-[#243559] mb-2">Road width in layout</label><input value={props.details.roadWidth || ""} onChange={(event) => updateDetails({ roadWidth: event.target.value })} placeholder="e.g. 30 ft internal roads" className="w-full px-4 py-3 border border-[#D5DEF2] rounded-xl" /></div>
    </div>

    <div className="rounded-2xl border border-[#D5DEF2]/70 p-5"><h3 className="text-[15px] font-bold text-[#1E3A8A] mb-3">Civic infrastructure</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{([['undergroundDrainage', 'Underground drainage'], ['electricity', 'Electricity'], ['water', 'Water supply']] as const).map(([key, label]) => <label key={key} className="text-[13px] text-[#243559]">{label}<select value={props.details.civicInfrastructure[key]} onChange={(event) => updateDetails({ civicInfrastructure: { ...props.details.civicInfrastructure, [key]: event.target.value as "Ready" | "Under Development" } })} className="w-full mt-1 px-3 py-2.5 border border-[#D5DEF2] rounded-lg bg-white"><option>Ready</option><option>Under Development</option></select></label>)}</div></div>

    <div className="rounded-2xl border border-[#D5DEF2]/70 p-5"><h3 className="text-[15px] font-bold text-[#1E3A8A] mb-3">Layout possession</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><select value={props.details.layoutPossession.status} onChange={(event) => updateDetails({ layoutPossession: { status: event.target.value as PlotDetails["layoutPossession"]["status"] } })} className="px-4 py-3 border border-[#D5DEF2] rounded-xl bg-white"><option>Layout Ready</option><option>Under Development</option></select>{props.details.layoutPossession.status === "Layout Ready" ? <input type="date" value={props.details.layoutPossession.readyDate || ""} onChange={(event) => updateDetails({ layoutPossession: { status: "Layout Ready", readyDate: event.target.value } })} className="px-4 py-3 border border-[#D5DEF2] rounded-xl" /> : <input type="date" value={props.details.layoutPossession.expectedCompletionDate || ""} onChange={(event) => updateDetails({ layoutPossession: { status: "Under Development", expectedCompletionDate: event.target.value } })} className="px-4 py-3 border border-[#D5DEF2] rounded-xl" />}</div>{props.errors.layoutPossession && <p className="text-[12px] text-red-600 mt-2">{props.errors.layoutPossession}</p>}</div>

    <div className="rounded-2xl border border-[#D5DEF2]/70 p-5"><div className="flex flex-wrap justify-between items-center gap-3 mb-3"><div><h3 className="text-[15px] font-bold text-[#1E3A8A]">Plot inventory</h3><p className="text-[12px] text-[#6E7488]">Add each plot manually or import CSV: plotNumber, plotSize, facing, status, isCorner.</p></div><div className="flex gap-2"><button type="button" onClick={addInventory} className="px-3 py-2 bg-[#1E3A8A] text-white rounded-lg text-[12px]">Add plot</button><label className="px-3 py-2 border border-[#C9A24E] text-[#1E3A8A] rounded-lg text-[12px] cursor-pointer">Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) importCsv(file); event.target.value = ""; }} /></label></div></div>{props.errors.inventory && <p className="text-[12px] text-red-600 mb-2">{props.errors.inventory}</p>}<div className="overflow-x-auto"><table className="min-w-[700px] w-full text-[13px]"><thead className="bg-[#F1F5FF]"><tr><th className="p-2 text-left">Plot no.</th><th className="p-2 text-left">Size</th><th className="p-2 text-left">Facing</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Corner</th><th /></tr></thead><tbody>{props.details.inventory.map((item, index) => <tr key={`${item.plotNumber}-${index}`} className="border-t border-[#E2E9FB]"><td className="p-2"><input value={item.plotNumber} onChange={(event) => updateInventory(index, { plotNumber: event.target.value })} className="w-28 px-2 py-1.5 border border-[#D5DEF2] rounded" /></td><td className="p-2"><select value={item.plotSize} onChange={(event) => updateInventory(index, { plotSize: event.target.value })} className="px-2 py-1.5 border border-[#D5DEF2] rounded"><option value="">Select</option>{props.details.plotSizeDetails.map((row) => <option key={row.plotSize}>{row.plotSize}</option>)}</select></td><td className="p-2"><select value={item.facing} onChange={(event) => updateInventory(index, { facing: event.target.value as PlotInventoryItem["facing"] })} className="px-2 py-1.5 border border-[#D5DEF2] rounded">{facings.map((value) => <option key={value}>{value}</option>)}</select></td><td className="p-2"><select value={item.status} onChange={(event) => updateInventory(index, { status: event.target.value as PlotInventoryItem["status"] })} className="px-2 py-1.5 border border-[#D5DEF2] rounded"><option>Available</option><option>Booked</option><option>Sold</option></select></td><td className="p-2"><input type="checkbox" checked={item.isCorner} onChange={(event) => updateInventory(index, { isCorner: event.target.checked })} /></td><td className="p-2"><button type="button" onClick={() => updateDetails({ inventory: props.details.inventory.filter((_, itemIndex) => itemIndex !== index) })} className="text-red-600">Remove</button></td></tr>)}</tbody></table></div></div>
  </div>;
}
