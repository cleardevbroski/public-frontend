import { Building2, FileSpreadsheet, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Workspace = "registered" | "imported" | "brokers";

const destinations: Array<{ id: Workspace; label: string; path: string; icon: typeof Building2 }> = [
  { id: "registered", label: "Registered", path: "/cp-management", icon: Building2 },
  { id: "imported", label: "Imported CPs", path: "/cp-verification", icon: FileSpreadsheet },
  { id: "brokers", label: "Brokers", path: "/broker-verification", icon: UsersRound },
];

export default function EmployeeWorkspaceNav({ active, desktop = false }: { active: Workspace; desktop?: boolean }) {
  const navigate = useNavigate();

  return <nav aria-label="Employee workspaces" className={desktop ? "hidden rounded-md bg-white p-1 md:block" : "fixed inset-x-0 bottom-0 z-40 border-t border-[#D8DCE2] bg-white px-2 pt-1 md:hidden [padding-bottom:max(0.5rem,env(safe-area-inset-bottom))]"}>
    <div className="mx-auto grid max-w-md grid-cols-3 gap-1 md:w-auto">
      {destinations.map(({ id, label, path, icon: Icon }) => <button key={id} onClick={() => navigate(path)} aria-current={active === id ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-bold md:min-h-10 md:flex-row md:gap-2 md:px-3 md:text-[11px] ${active === id ? "bg-[#FFF4D8] text-[#805A0B]" : "text-[#68646F] hover:bg-[#F8F7FA] hover:text-[#121B35]"}`}><Icon className="size-4" />{label}</button>)}
    </div>
  </nav>;
}
