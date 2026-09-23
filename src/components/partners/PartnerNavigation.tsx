import { FilePlus2, LayoutDashboard, LogOut, UserRoundPlus } from "lucide-react";

type Section = "application" | "clients" | "dashboard";
const links = [
  { id: "application", href: "/channel-partner", label: "Partner registration", Icon: UserRoundPlus },
  { id: "clients", href: "/cp-registration", label: "CP Clients", Icon: FilePlus2 },
  { id: "dashboard", href: "/cp-dashboard", label: "Dashboard", Icon: LayoutDashboard },
] as const;

export default function PartnerNavigation({ active, onLogout }: { active: Section; onLogout?: () => void }) {
  return <>
    <header className="partner-header">
      <div className="partner-header-inner">
        <a href="/channel-partner" className="flex min-w-0 items-center gap-3" aria-label="ClearTitle One Channel Partner">
          <img src="/cleartitleone/logo.png" alt="" className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0"><p className="truncate text-sm font-bold text-white">ClearTitle One</p><p className="text-[11px] text-white/70">Channel Partner</p></div>
        </a>
        <nav aria-label="Partner desktop navigation" className="hidden items-center gap-2 md:flex">
          {links.map(({ id, href, label, Icon }) => <a key={id} href={href} aria-current={active === id ? "page" : undefined} className={`flex min-h-11 items-center gap-2 rounded-md px-3 text-xs font-bold ${active === id ? "bg-white text-[#121B35]" : "text-white/80 hover:bg-white/10"}`}><Icon className="size-4" />{label}</a>)}
        </nav>
        {onLogout && <button onClick={onLogout} className="grid size-11 shrink-0 place-items-center rounded-md border border-white/25 text-white" aria-label="Logout" title="Logout"><LogOut className="size-4" /></button>}
      </div>
    </header>
    <nav aria-label="Partner mobile navigation" className="partner-mobile-nav md:hidden">
      {links.map(({ id, href, label, Icon }) => <a key={id} href={href} aria-current={active === id ? "page" : undefined} className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 text-center text-[11px] font-semibold ${active === id ? "bg-[#FFF4D8] text-[#805A0B]" : "text-[#56535D]"}`}><Icon className="size-4" />{label}</a>)}
    </nav>
  </>;
}
