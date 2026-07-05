import { CheckCircle2, Clock, CircleOff } from "lucide-react";

type Status = "pending" | "approved" | "rejected";

const META: Record<Status, { label: string; badge: string; icon: typeof CheckCircle2 }> = {
  approved: { label: "Approved", badge: "bg-green-50 text-green-600", icon: CheckCircle2 },
  pending: { label: "Pending", badge: "bg-amber-50 text-amber-600", icon: Clock },
  rejected: { label: "Rejected", badge: "bg-red-50 text-red-500", icon: CircleOff },
};

export default function StatusControls({
  status,
  onChange,
}: {
  status?: string;
  onChange: (s: Status) => void;
}) {
  const current = (status as Status) in META ? (status as Status) : "approved";
  const Badge = META[current].icon;
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${META[current].badge}`}>
        <Badge className="w-3.5 h-3.5" /> {META[current].label}
      </span>
      <div className="flex gap-1">
        {(["approved", "pending", "rejected"] as Status[]).map((s) => {
          const Icon = META[s].icon;
          return (
            <button
              key={s}
              onClick={() => onChange(s)}
              disabled={current === s}
              title={`Mark ${META[s].label}`}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${current === s ? "opacity-40 cursor-default border-transparent" : "hover:bg-[#F1F5FF] border-[#D5DEF2]/40"}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
