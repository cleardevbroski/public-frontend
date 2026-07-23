import type { PgDetails, PgSharingDetail } from "@/components/acres/mock-data";
import { createPgSharing } from "@/lib/pgDetails";

type Props = {
  details: PgDetails;
  setDetails: (value: PgDetails) => void;
  errors: Record<string, string>;
};

type InputProps = {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
};

const SHARING_TYPES: PgSharingDetail["sharingType"][] = [
  "Single occupancy",
  "Double sharing",
  "Triple sharing",
  "Four sharing",
];
const GENDER_OPTIONS: PgDetails["genderPreference"][] = ["Men only", "Women only", "Co-ed"];
const MEAL_OPTIONS: PgDetails["mealsIncluded"][] = ["No meals", "Breakfast + Dinner", "All 3 meals"];
const CONTACT_OPTIONS: PgDetails["contactType"][] = ["Owner", "PG Manager", "Company-run"];
const AMENITIES = ["TV lounge", "Common kitchen", "Washing machine", "Power backup", "CCTV", "Warden on premises"];

function Input({ label, value, onChange, type = "text" }: InputProps) {
  return (
    <label className="block text-[13px] font-semibold text-[#3F3D46]">
      {label}
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 font-normal"
      />
    </label>
  );
}

export default function PgDetailsFields({ details, setDetails, errors }: Props) {
  const update = (patch: Partial<PgDetails>) => setDetails({ ...details, ...patch });

  const updateRow = (
    sharingType: PgSharingDetail["sharingType"],
    patch: Partial<PgSharingDetail>
  ) => {
    update({
      sharingDetails: details.sharingDetails.map((row) =>
        row.sharingType === sharingType ? { ...row, ...patch } : row
      ),
    });
  };

  const addSharingType = (sharingType: PgSharingDetail["sharingType"]) => {
    if (!sharingType || details.sharingDetails.some((row) => row.sharingType === sharingType)) return;
    update({ sharingDetails: [...details.sharingDetails, createPgSharing(sharingType)] });
  };

  const removeSharingType = (sharingType: PgSharingDetail["sharingType"]) => {
    update({
      sharingDetails: details.sharingDetails.filter((row) => row.sharingType !== sharingType),
    });
  };

  const toggleAmenity = (amenity: string) => {
    const isSelected = details.commonAmenities.includes(amenity);
    update({
      commonAmenities: isSelected
        ? details.commonAmenities.filter((value) => value !== amenity)
        : [...details.commonAmenities, amenity],
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="text-[13px] font-semibold text-[#3F3D46]">
          Gender preference
          <select
            value={details.genderPreference}
            onChange={(event) => update({ genderPreference: event.target.value as PgDetails["genderPreference"] })}
            className="mt-1 w-full rounded-lg border border-[#E4E0E7] bg-white px-3 py-2.5 font-normal"
          >
            {GENDER_OPTIONS.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>

        <label className="text-[13px] font-semibold text-[#3F3D46]">
          Available from
          <input
            type="date"
            value={details.availableFrom}
            onChange={(event) => update({ availableFrom: event.target.value })}
            className="mt-1 w-full rounded-lg border border-[#E4E0E7] px-3 py-2.5 font-normal"
          />
          {errors.availableFrom && <p className="text-[11px] text-red-600">{errors.availableFrom}</p>}
        </label>
      </div>

      <div className="rounded-2xl border border-[#E4E0E7] p-5">
        <div className="mb-3 flex justify-between">
          <h3 className="font-bold text-[#121B35]">Sharing types &amp; availability</h3>
          <select
            value=""
            onChange={(event) => addSharingType(event.target.value as PgSharingDetail["sharingType"])}
            className="rounded border border-[#E4E0E7] px-2 text-[12px]"
          >
            <option value="">Add sharing type</option>
            {SHARING_TYPES.map((value) => <option key={value}>{value}</option>)}
          </select>
        </div>

        {errors.sharingDetails && <p className="text-[11px] text-red-600">{errors.sharingDetails}</p>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-[13px]">
            <thead className="bg-[#121B35] text-white">
              <tr>
                <th className="p-2 text-left">Sharing</th>
                <th>Rent / bed / month</th>
                <th>Deposit</th>
                <th>Beds available</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {details.sharingDetails.map((row) => (
                <tr key={row.sharingType} className="border-b">
                  <td className="p-2 font-semibold">{row.sharingType}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={row.rentPerBed || ""}
                      onChange={(event) => updateRow(row.sharingType, { rentPerBed: Number(event.target.value) })}
                      className="rounded border p-1.5"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={row.deposit || ""}
                      onChange={(event) => updateRow(row.sharingType, { deposit: Number(event.target.value) })}
                      className="rounded border p-1.5"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      value={row.bedsAvailable || ""}
                      onChange={(event) => updateRow(row.sharingType, { bedsAvailable: Number(event.target.value) })}
                      className="rounded border p-1.5"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeSharingType(row.sharingType)}
                      className="text-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-[13px] font-semibold">
          Meals included
          <select
            value={details.mealsIncluded}
            onChange={(event) => {
              const mealsIncluded = event.target.value as PgDetails["mealsIncluded"];
              update({
                mealsIncluded,
                foodType: mealsIncluded === "No meals" ? "" : details.foodType,
              });
            }}
            className="mt-1 w-full rounded border p-2.5"
          >
            {MEAL_OPTIONS.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>

        {details.mealsIncluded !== "No meals" && (
          <label className="text-[13px] font-semibold">
            Food type
            <select
              value={details.foodType}
              onChange={(event) => update({ foodType: event.target.value as PgDetails["foodType"] })}
              className="mt-1 w-full rounded border p-2.5"
            >
              <option value="">Select</option>
              <option>Veg only</option>
              <option>Veg + Non-veg</option>
            </select>
          </label>
        )}

        <label className="text-[13px] font-semibold">
          Owner / Manager contact
          <select
            value={details.contactType}
            onChange={(event) => update({ contactType: event.target.value as PgDetails["contactType"] })}
            className="mt-1 w-full rounded border p-2.5"
          >
            {CONTACT_OPTIONS.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input label="Housekeeping" value={details.housekeeping || ""} onChange={(value) => update({ housekeeping: value })} />
        <Input label="Curfew / entry timing" value={details.curfewEntryTiming || ""} onChange={(value) => update({ curfewEntryTiming: value })} />
        <Input label="Visitors allowed" value={details.visitorsAllowed || ""} onChange={(value) => update({ visitorsAllowed: value })} />
        <Input label="Notice period" value={details.noticePeriod || ""} onChange={(value) => update({ noticePeriod: value })} />
        <Input label="Lock-in period" value={details.lockInPeriod || ""} onChange={(value) => update({ lockInPeriod: value })} />
        <Input label="ID proof required" value={details.idProofRequired || ""} onChange={(value) => update({ idProofRequired: value })} />
        <Input label="Utilities included" value={details.utilitiesIncluded || ""} onChange={(value) => update({ utilitiesIncluded: value })} />
      </div>

      <div className="flex flex-wrap gap-4 text-[13px] font-semibold">
        {([
          ["wifiIncluded", "Wi-Fi included"],
          ["laundryIncluded", "Laundry included"],
        ] as const).map(([key, label]) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={details[key]}
              onChange={(event) => update({ [key]: event.target.checked })}
              className="mr-2"
            />
            {label}
          </label>
        ))}
        {details.laundryIncluded && (
          <Input
            label="Laundry schedule"
            value={details.laundrySchedule || ""}
            onChange={(value) => update({ laundrySchedule: value })}
          />
        )}
      </div>

      <div>
        <h3 className="mb-2 mt-4 text-[14px] font-bold text-[#121B35]">Common amenities</h3>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((amenity) => {
            const isSelected = details.commonAmenities.includes(amenity);
            return (
              <button
                type="button"
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-lg border px-3 py-2 text-[12px] ${
                  isSelected
                    ? "border-[#DDAA42] bg-[#DDAA42] text-[#0B1328]"
                    : "border-[#E4E0E7] text-[#3F3D46]"
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
