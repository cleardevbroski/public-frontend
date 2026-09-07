import { Plus, Trash2 } from "lucide-react";
import type { AcquisitionCharge } from "@/components/acres/mock-data";

const inputClass = "w-full rounded-xl border border-[#E4E0E7] bg-white px-3 py-2.5 text-[12px] text-[#121B35] outline-none focus:border-[#DDAA42]";

export default function PropertyChargesFields({
  charges,
  priceUpdatedAt,
  priceSourceType,
  onChargesChange,
  onPriceUpdatedAtChange,
  onPriceSourceTypeChange,
}: {
  charges: AcquisitionCharge[];
  priceUpdatedAt?: string;
  priceSourceType?: "exact_project_value" | "developer_supplied";
  onChargesChange: (charges: AcquisitionCharge[]) => void;
  onPriceUpdatedAtChange: (value: string) => void;
  onPriceSourceTypeChange: (value: "exact_project_value" | "developer_supplied") => void;
}) {
  const add = () => onChargesChange([...charges, {
    name: "Other charge",
    code: "other_developer_charges",
    calculationType: "fixed",
    value: 0,
    basis: "base_price",
    paymentTiming: "initial",
    sourceType: "developer_supplied",
    sourceNote: "",
    appliesToConfiguration: "",
    optional: false,
  }]);
  const update = (index: number, patch: Partial<AcquisitionCharge>) => onChargesChange(charges.map((charge, rowIndex) => rowIndex === index ? { ...charge, ...patch } : charge));

  return <section className="rounded-2xl border border-[#E2D8C2] bg-[#FFFCF5] p-4 md:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h3 className="text-[15px] font-bold text-[#121B35]">Affordability and developer charges</h3><p className="mt-1 text-[11px] leading-5 text-[#68646F]">Add only project-specific charges. Government percentages are managed separately under Affordability Rules.</p></div>
      <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-lg bg-[#121B35] px-3 py-2 text-[11px] font-bold text-white"><Plus className="size-3.5" />Add charge</button>
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <label className="text-[11px] font-bold text-[#4F4A53]">Price source<select value={priceSourceType || "developer_supplied"} onChange={(event) => onPriceSourceTypeChange(event.target.value as "exact_project_value" | "developer_supplied")} className={`${inputClass} mt-1.5`}><option value="developer_supplied">Developer supplied</option><option value="exact_project_value">Exact project value</option></select></label>
      <label className="text-[11px] font-bold text-[#4F4A53]">Price last updated<input type="date" value={priceUpdatedAt?.slice(0, 10) || ""} onChange={(event) => onPriceUpdatedAtChange(event.target.value)} className={`${inputClass} mt-1.5`} /></label>
    </div>
    <div className="mt-4 space-y-3">
      {charges.length === 0 && <div className="rounded-xl border border-dashed border-[#D8C8A7] bg-white/70 p-5 text-center text-[11px] text-[#766D5D]">No developer charges entered. The public calculator will show them as missing.</div>}
      {charges.map((charge, index) => <article key={`${charge.code}-${index}`} className="rounded-xl border border-[#E4DED2] bg-white p-3.5">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-[10px] font-bold text-[#68646F]">Charge category<select value={charge.code || "other_developer_charges"} onChange={(event) => update(index, { code: event.target.value })} className={`${inputClass} mt-1`}><option value="parking">Parking</option><option value="floor_rise">Floor-rise</option><option value="clubhouse">Clubhouse / amenity</option><option value="maintenance_deposit">Maintenance deposit</option><option value="monthly_maintenance">Monthly maintenance</option><option value="gst">GST supplied by developer</option><option value="other_developer_charges">Other developer charge</option></select></label>
          <label className="text-[10px] font-bold text-[#68646F]">Display name<input value={charge.name} onChange={(event) => update(index, { name: event.target.value })} placeholder="Parking / Clubhouse" className={`${inputClass} mt-1`} /></label>
          <label className="text-[10px] font-bold text-[#68646F]">Calculation<select value={charge.calculationType} onChange={(event) => update(index, { calculationType: event.target.value as AcquisitionCharge["calculationType"] })} className={`${inputClass} mt-1`}><option value="fixed">Fixed amount</option><option value="percentage">Percentage</option><option value="per_sqft">Per sq. ft.</option><option value="included">Included in base price</option><option value="not_applicable">Not applicable</option></select></label>
          <label className="text-[10px] font-bold text-[#68646F]">Value {charge.calculationType === "percentage" ? "(%)" : "(₹)"}<input type="number" min="0" value={charge.value || ""} disabled={["included", "not_applicable"].includes(charge.calculationType)} onChange={(event) => update(index, { value: Number(event.target.value) || 0 })} className={`${inputClass} mt-1 disabled:bg-[#F3F1F5]`} /></label>
          <label className="text-[10px] font-bold text-[#68646F]">Calculation basis<select value={charge.basis} onChange={(event) => update(index, { basis: event.target.value as AcquisitionCharge["basis"] })} className={`${inputClass} mt-1`}><option value="base_price">Base price</option><option value="agreement_value">Agreement value</option><option value="built_up_area">Built-up area</option></select></label>
          <label className="text-[10px] font-bold text-[#68646F]">Payment timing<select value={charge.paymentTiming} onChange={(event) => update(index, { paymentTiming: event.target.value as AcquisitionCharge["paymentTiming"] })} className={`${inputClass} mt-1`}><option value="initial">Initial payment</option><option value="at_registration">At registration</option><option value="monthly">Monthly</option><option value="other">Other</option></select></label>
          <label className="text-[10px] font-bold text-[#68646F]">Configuration (blank = all)<input value={charge.appliesToConfiguration || ""} onChange={(event) => update(index, { appliesToConfiguration: event.target.value })} placeholder="3 BHK" className={`${inputClass} mt-1`} /></label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="text-[10px] font-bold text-[#68646F]">Source<select value={charge.sourceType} onChange={(event) => update(index, { sourceType: event.target.value as AcquisitionCharge["sourceType"] })} className="ml-2 rounded-lg border border-[#E4E0E7] px-2 py-1.5"><option value="developer_supplied">Developer supplied</option><option value="exact_project_value">Exact project value</option></select></label>
          <label className="flex items-center gap-2 text-[10px] font-bold text-[#68646F]"><input type="checkbox" checked={Boolean(charge.optional)} onChange={(event) => update(index, { optional: event.target.checked })} />Optional charge</label>
          <input value={charge.sourceNote || ""} onChange={(event) => update(index, { sourceNote: event.target.value })} placeholder="Price sheet date or note" className="min-w-48 flex-1 rounded-lg border border-[#E4E0E7] px-3 py-2 text-[10px]" />
          <button type="button" onClick={() => onChargesChange(charges.filter((_, rowIndex) => rowIndex !== index))} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-bold text-red-700 hover:bg-red-50"><Trash2 className="size-3.5" />Remove</button>
        </div>
      </article>)}
    </div>
  </section>;
}
