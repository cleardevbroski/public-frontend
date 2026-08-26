import type { Property } from "@/components/acres/mock-data";

type ProjectArea = NonNullable<Property["projectArea"]>;

type Props = {
  projectArea?: ProjectArea;
  setProjectArea?: (value: ProjectArea) => void;
  totalUnits?: number;
  setTotalUnits?: (value?: number) => void;
  totalTowers?: number;
  setTotalTowers?: (value?: number) => void;
  error?: string;
};

const inputClass = "w-full min-w-[105px] px-3 py-2.5 border border-[#E4E0E7] rounded-lg text-[13px] focus:outline-none focus:border-[#DDAA42]";

export default function ProjectAreaFields(props: Props) {
  const areaFields: Array<{ key: keyof ProjectArea; label: string; unit: string; step: string }> = [
    { key: "totalAcres", label: "Total Land / Project Area", unit: "acres", step: "0.01" },
    { key: "openSpaceSqft", label: "Empty / Open Space Area", unit: "sq. ft.", step: "1" },
    { key: "builtUpSqft", label: "Project Built-up Area", unit: "sq. ft.", step: "1" },
    { key: "amenitiesSqft", label: "Amenities Area", unit: "sq. ft.", step: "1" },
  ];

  return (
    <div className="rounded-2xl border border-[#E4E0E7] bg-[#F8F7FA]/60 p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-bold text-[#121B35]">Project area and inventory</h3>
        <p className="mt-1 text-[12px] text-[#68646F]">Enter total land in acres. Enter open space, built-up and amenities areas in square feet.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {areaFields.map(({ key, label, unit, step }) => (
          <label key={key} className="text-[12px] font-semibold text-[#3F3D46]">{label}
            <div className="relative mt-1.5">
              <input
                type="number"
                min={0}
                step={step}
                value={props.projectArea?.[key] ?? ""}
                onChange={(event) => props.setProjectArea?.({ ...props.projectArea, [key]: event.target.value === "" ? undefined : Number(event.target.value) })}
                className={`${inputClass} pr-16`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8A858F]">{unit}</span>
            </div>
          </label>
        ))}
        <label className="text-[12px] font-semibold text-[#3F3D46]">Number of Units
          <input type="number" min={1} step={1} value={props.totalUnits ?? ""} onChange={(event) => props.setTotalUnits?.(event.target.value === "" ? undefined : Number(event.target.value))} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="text-[12px] font-semibold text-[#3F3D46]">Number of Towers / Blocks
          <input type="number" min={1} step={1} value={props.totalTowers ?? ""} onChange={(event) => props.setTotalTowers?.(event.target.value === "" ? undefined : Number(event.target.value))} className={`${inputClass} mt-1.5`} />
        </label>
      </div>
      {props.error && <p className="mt-2 text-[11px] text-red-600">{props.error}</p>}
    </div>
  );
}
