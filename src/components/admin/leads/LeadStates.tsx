import { CircleAlert, Inbox, RefreshCw } from "lucide-react";

export function LeadsLoading() {
  return (
    <div className="space-y-2 p-4" aria-label="Loading leads">
      {[0, 1, 2, 3, 4].map((item) => <div key={item} className="h-[74px] animate-pulse rounded-xl bg-[#F3F1F4]" />)}
    </div>
  );
}

export function LeadsEmpty({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  return (
    <div className="grid min-h-[320px] place-items-center px-6 py-12 text-center">
      <div className="max-w-[340px]">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#F3F1F4] text-[#77727D]"><Inbox className="size-5" /></span>
        <h3 className="mt-4 text-[16px] font-bold text-[#121B35]">{filtered ? "No matching leads" : "No leads yet"}</h3>
        <p className="mt-1.5 text-[13px] leading-5 text-[#77727D]">{filtered ? "Try changing or clearing your filters." : "Website enquiries and imported leads will appear here."}</p>
        {filtered && <button type="button" onClick={onClear} className="mt-4 rounded-xl border border-[#DDAA42]/30 bg-[#FFF9EC] px-4 py-2 text-[12px] font-bold text-[#7B570D]">Clear filters</button>}
      </div>
    </div>
  );
}

export function LeadsError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid min-h-[320px] place-items-center px-6 py-12 text-center">
      <div className="max-w-[380px]">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#FFF1EF] text-[#B53A33]"><CircleAlert className="size-5" /></span>
        <h3 className="mt-4 text-[16px] font-bold text-[#121B35]">Leads could not be loaded</h3>
        <p className="mt-1.5 text-[13px] leading-5 text-[#77727D]">{message}</p>
        <button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#121B35] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#1C294C]"><RefreshCw className="size-3.5" /> Try again</button>
      </div>
    </div>
  );
}

