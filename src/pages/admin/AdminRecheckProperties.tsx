import { useEffect, useState } from "react";
import { AlertTriangle, Archive, CheckCircle2, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import PropertyTable from "@/components/admin/PropertyTable";
import { fetchAllAdminProperties } from "@/lib/api";
import { isAdminAuthed } from "@/lib/adminAuth";
import type { Property } from "@/components/acres/mock-data";

export default function AdminRecheckProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setProperties(await fetchAllAdminProperties({ status: "recheck", sort: "-updatedAt" }) as Property[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load Recheck properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const refreshWhenAuthenticated = () => {
      if (!isAdminAuthed()) return;
      void load().finally(() => setMounted(true));
    };
    refreshWhenAuthenticated();
    window.addEventListener("cleartitle:admin-auth-changed", refreshWhenAuthenticated);
    return () => window.removeEventListener("cleartitle:admin-auth-changed", refreshWhenAuthenticated);
  }, []);

  return (
    <AdminLayout>
      <div className="mb-7">
        <h1 className="flex items-center gap-2 text-[28px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}><Archive className="size-7 text-blue-700" />Review Folder</h1>
        <p className="mt-1 text-[14px] text-[#68646F]">Review every project imported from the staged folder before moving it to Pending or publishing it.</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>}
      {!mounted || loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="size-7 animate-spin text-[#DDAA42]" /></div> : <div>
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#E4E0E7] bg-white p-4"><p className="text-[10px] font-bold uppercase text-[#8A8690]">Awaiting review</p><p className="mt-1 text-2xl font-bold text-[#121B35]">{properties.length}</p></div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700"><CheckCircle2 className="size-3.5" />Ready to publish</p><p className="mt-1 text-2xl font-bold text-emerald-800">{properties.filter((property) => property.reviewReadiness?.canPublish).length}</p></div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4"><p className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-700"><AlertTriangle className="size-3.5" />Required corrections</p><p className="mt-1 text-2xl font-bold text-red-800">{properties.filter((property) => property.reviewReadiness?.canPublish === false).length}</p></div>
        </div>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div><h2 className="text-[18px] font-bold text-[#121B35]">Properties awaiting review</h2><p className="mt-1 text-[12px] text-[#68646F]">{properties.length} private propert{properties.length === 1 ? "y" : "ies"}</p></div>
        </div>
        <PropertyTable properties={properties} adminProperties={properties} onPropertyDeleted={load} />
      </div>}
    </AdminLayout>
  );
}
