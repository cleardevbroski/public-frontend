import { Building2, FileSpreadsheet, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Workspace = "registered" | "imported" | "brokers";

const destinations: Array<{ id: Workspace; label: string; path: string; icon: typeof Building2 }> = [
  { id: "registered", label: "Registered", path: "/cp-management", icon: Building2 },
  { id: "imported", label: "Imported CPs", path: "/cp-verification", icon: FileSpreadsheet },
  { id: "brokers", label: "Brokers", path: "/broker-verification", icon: UsersRound },
];

export default function EmployeeWorkspaceNav({ active }: { active: Workspace }) {
  const navigate = useNavigate();

  return <><div className="hidden h-20 md:block" aria-hidden="true" /><nav aria-label="Employee workspaces" className="fixed inset-x-0 bottom-0 z-50 border-t border-[#D8DCE2] bg-white/95 px-2 pt-2 shadow-[0_-8px_24px_rgba(11,19,40,0.12)] backdrop-blur md:inset-x-auto md:bottom-5 md:right-5 md:rounded-lg md:border md:p-1.5 [padding-bottom:max(0.5rem,env(safe-area-inset-bottom))]">
    <div className="mx-auto grid max-w-md grid-cols-3 gap-1 md:w-[430px]">
      {destinations.map(({ id, label, path, icon: Icon }) => <button key={id} onClick={() => navigate(path)} aria-current={active === id ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[10px] font-bold md:min-h-10 md:flex-row md:gap-2 md:px-3 md:text-[11px] ${active === id ? "bg-[#FFF4D8] text-[#805A0B]" : "text-[#68646F] hover:bg-[#F8F7FA] hover:text-[#121B35]"}`}><Icon className="size-4" />{label}</button>)}
    </div>
  </nav></>;
}
