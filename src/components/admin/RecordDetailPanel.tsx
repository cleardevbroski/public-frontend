import { useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export default function RecordDetailPanel({ activeId, onClose, children }: { activeId?: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (activeId && window.matchMedia("(max-width: 1279px)").matches) ref.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [activeId]);
  return <aside ref={ref} data-open={Boolean(activeId)} className="admin-record-detail rounded-lg border border-[#E4E0E7] bg-white p-5 xl:sticky xl:top-20">
    {activeId && <button onClick={onClose} className="mb-4 flex min-h-11 w-full items-center gap-2 border-b border-[#E4E0E7] pb-3 text-left text-sm font-semibold xl:hidden"><ArrowLeft className="size-4" />Back to list</button>}
    {children}
  </aside>;
}
