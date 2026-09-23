import { Building2, FileSpreadsheet, LogOut, Menu, UserRound, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { crmEmployeeLogout } from "@/lib/api";
import type { CRMEmployee } from "@/lib/cpCrmTypes";

export default function EmployeeHeader({ title, employee }: { title: string; employee: CRMEmployee | null }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const go = (path: string) => { setOpen(false); navigate(path); };
  return <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B1328]"><div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-2 px-3 py-2 sm:px-4 md:px-6"><div className="flex min-w-0 items-center gap-3"><img src="/cleartitleone/logo.png" alt="ClearTitle One" className="size-9 shrink-0 rounded-full ring-2 ring-[#DDAA42]/60" /><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{title}</p><p className="truncate text-[10px] text-white/50">{employee ? `${employee.name} · ${employee.employeeId}` : "Employee workspace"}</p></div></div><div ref={menuRef} className="relative"><button onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Open employee menu" title="Employee menu" className="grid size-11 place-items-center rounded-md border border-white/15 text-white md:size-9"><Menu className="size-5" /></button>{open && <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-md border border-[#D8DCE2] bg-white shadow-xl"><div className="border-b border-[#ECEEF1] p-3"><p className="flex items-center gap-2 text-xs font-bold text-[#121B35]"><UserRound className="size-4 text-[#9A7427]" />{employee?.name || "Employee"}</p><p className="mt-1 pl-6 text-[10px] text-[#68646F]">{employee?.employeeId || "Loading employee details"}</p></div><button onClick={() => go("/cp-management")} className="flex h-11 w-full items-center gap-3 px-3 text-left text-xs font-semibold hover:bg-[#F8F7FA]"><Building2 className="size-4" />Registered CPs</button><button onClick={() => go("/cp-verification")} className="flex h-11 w-full items-center gap-3 px-3 text-left text-xs font-semibold hover:bg-[#F8F7FA]"><FileSpreadsheet className="size-4" />Imported CPs</button><button onClick={() => go("/broker-verification")} className="flex h-11 w-full items-center gap-3 px-3 text-left text-xs font-semibold hover:bg-[#F8F7FA]"><UsersRound className="size-4" />Brokers</button><button onClick={() => { crmEmployeeLogout(); navigate("/employee-login", { replace: true }); }} className="flex h-11 w-full items-center gap-3 border-t border-[#ECEEF1] px-3 text-left text-xs font-bold text-red-700 hover:bg-red-50"><LogOut className="size-4" />Sign out</button></div>}</div></div></header>;
}
