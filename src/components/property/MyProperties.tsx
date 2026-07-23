import { useEffect, useState } from "react";
import { AlertCircle, Building2, CheckCircle2, Clock3, Edit3, Loader2, RefreshCw } from "lucide-react";
import Link from "@/components/Link";
import { fetchMyProperties } from "@/lib/api";
import type { Property } from "@/components/acres/mock-data";

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  pending: "Submitted",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  resubmitted: "Resubmitted",
  approved: "Published",
  published: "Published",
  rejected: "Rejected",
};

export default function MyProperties({ refreshKey = 0 }: { refreshKey?: number }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    fetchMyProperties().then((data) => setProperties(data.properties)).catch((cause) => setError(cause.message)).finally(() => setLoading(false));
  };
  useEffect(load, [refreshKey]);

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="size-7 animate-spin text-[#DDAA42]" /></div>;
  if (error) return <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-[13px]">{error}</div>;
  if (!properties.length) return <div className="bg-white rounded-2xl border border-[#E4E0E7] p-8 text-center"><Building2 className="size-10 mx-auto text-[#CBD6EE]" /><p className="mt-3 font-bold text-[#121B35]">No properties yet</p><p className="text-[13px] text-[#68646F]">Start a new property listing to see it here.</p></div>;

  return (
    <div className="space-y-4">
      {properties.map((property) => {
        const status = property.status || "submitted";
        const editable = ["draft", "changes_requested"].includes(status);
        const latestMessage = property.reviewMessages?.[property.reviewMessages.length - 1]?.message || property.rejectionReason;
        return (
          <article key={property.id} className="bg-white rounded-2xl border border-[#E4E0E7]/70 shadow-sm p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="size-12 rounded-xl bg-[#F8F7FA] flex items-center justify-center shrink-0"><Building2 className="size-5 text-[#121B35]" /></div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[#121B35] truncate">{property.title}</h3>
                  <p className="text-[12.5px] text-[#68646F]">{property.propertyType} · {property.subtitle}</p>
                  <p className="text-[11.5px] text-[#68646F] mt-1">Submission version {property.submissionVersion || 1}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={status} />
                {editable && <Link href={`/postproperty?edit=${property.id}`} className="h-9 px-3 rounded-lg bg-[#121B35] text-white text-[12px] font-bold inline-flex items-center gap-1.5"><Edit3 className="size-3.5" /> Edit & Resubmit</Link>}
                {["published", "approved"].includes(status) && <Link href={`/property/${property.id}`} className="h-9 px-3 rounded-lg bg-[#FFF8E8] text-[#9A7620] text-[12px] font-bold inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5" /> View Listing</Link>}
              </div>
            </div>
            {latestMessage && <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3"><p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Admin feedback</p><p className="text-[13px] text-amber-900 mt-1">{latestMessage}</p></div>}
          </article>
        );
      })}
      <button onClick={load} className="text-[12px] font-semibold text-[#68646F] inline-flex items-center gap-1.5"><RefreshCw className="size-3.5" /> Refresh statuses</button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const warning = ["changes_requested", "rejected"].includes(status);
  const done = ["published", "approved"].includes(status);
  const Icon = warning ? AlertCircle : done ? CheckCircle2 : Clock3;
  return <span className={`h-9 px-3 rounded-lg text-[12px] font-bold inline-flex items-center gap-1.5 ${warning ? "bg-red-50 text-red-700" : done ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}><Icon className="size-3.5" /> {statusLabels[status] || status}</span>;
}
