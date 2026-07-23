import { CheckCircle2, Clock, CircleOff } from "lucide-react";

type Status = "pending" | "approved" | "rejected";
type WorkflowStatus = Status | "draft" | "submitted" | "under_review" | "changes_requested" | "resubmitted" | "published";

const META: Record<WorkflowStatus, { label: string; badge: string; icon: typeof CheckCircle2 }> = {
  approved: { label: "Approved", badge: "bg-green-50 text-green-600", icon: CheckCircle2 },
  pending: { label: "Pending", badge: "bg-amber-50 text-amber-600", icon: Clock },
  rejected: { label: "Rejected", badge: "bg-red-50 text-red-500", icon: CircleOff },
  draft: { label: "Draft", badge: "bg-slate-50 text-slate-600", icon: Clock },
  submitted: { label: "Submitted", badge: "bg-amber-50 text-amber-700", icon: Clock },
  under_review: { label: "Under Review", badge: "bg-blue-50 text-blue-700", icon: Clock },
  changes_requested: { label: "Changes Requested", badge: "bg-orange-50 text-orange-700", icon: CircleOff },
  resubmitted: { label: "Resubmitted", badge: "bg-violet-50 text-violet-700", icon: Clock },
  published: { label: "Published", badge: "bg-green-50 text-green-700", icon: CheckCircle2 },
};

export default function StatusControls({
  status,
  onChange,
}: {
  status?: string;
  onChange: (s: Status) => void;
}) {
  const current = (status as WorkflowStatus) in META ? (status as WorkflowStatus) : "approved";
  const Badge = META[current].icon;
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${META[current].badge}`}>
        <Badge className="w-3.5 h-3.5" /> {META[current].label}
      </span>
      {["pending", "approved", "rejected"].includes(current) && <div className="flex gap-1">
        {(["approved", "pending", "rejected"] as Status[]).map((s) => {
          const Icon = META[s].icon;
          return (
            <button
              key={s}
              onClick={() => onChange(s)}
              disabled={current === s}
              title={`Mark ${META[s].label}`}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${current === s ? "opacity-40 cursor-default border-transparent" : "hover:bg-[#F8F7FA] border-[#E4E0E7]/40"}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>}
    </div>
  );
}
