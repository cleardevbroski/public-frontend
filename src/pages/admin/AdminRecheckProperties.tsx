import { useEffect, useState } from "react";
import { Archive, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import BulkRecheckImport from "@/components/admin/BulkRecheckImport";
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
        <h1 className="flex items-center gap-2 text-[28px] font-bold text-[#121B35]" style={{ fontFamily: "var(--font-outfit)" }}><Archive className="size-7 text-blue-700" />Recheck Properties</h1>
        <p className="mt-1 text-[14px] text-[#68646F]">Import ZIP packages into a separate private queue and verify every property before moving it to Pending or publishing it.</p>
      </div>

      <BulkRecheckImport onImported={load} />

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{error}</p>}
      {!mounted || loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="size-7 animate-spin text-[#DDAA42]" /></div> : <div>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div><h2 className="text-[18px] font-bold text-[#121B35]">Properties awaiting recheck</h2><p className="mt-1 text-[12px] text-[#68646F]">{properties.length} private propert{properties.length === 1 ? "y" : "ies"}</p></div>
        </div>
        <PropertyTable properties={properties} adminProperties={properties} onPropertyDeleted={load} />
      </div>}
    </AdminLayout>
  );
}
