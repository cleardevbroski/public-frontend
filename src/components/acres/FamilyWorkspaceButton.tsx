import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { ensureWorkspaceWithProperty, workspaceHref } from "@/lib/decisionWorkspace";

export default function FamilyWorkspaceButton({ propertyId }: { propertyId: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const add = async () => {
    setLoading(true); setError("");
    try { const workspace = await ensureWorkspaceWithProperty(propertyId); navigate(workspaceHref(workspace.id, workspace.ownerToken)); }
    catch (addError) { setError(addError instanceof Error ? addError.message : "Unable to open family workspace"); }
    finally { setLoading(false); }
  };
  return <div><button type="button" onClick={() => void add()} disabled={loading} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#D9D2C5] bg-white px-3 text-[11px] font-bold text-[#172039] transition hover:border-[#C28C25] hover:bg-[#FFF9EC] disabled:opacity-50"><Users className="size-4 text-[#A87416]" />{loading ? "Adding to comparison…" : "Compare with family"}</button>{error && <p className="mt-2 text-[9px] font-semibold text-red-700">{error}</p>}</div>;
}
