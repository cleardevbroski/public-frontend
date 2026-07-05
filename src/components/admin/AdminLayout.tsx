"use client";

import Link from "@/components/Link";
import Image from "@/components/Image";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  Building2,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Images,
  Lock,
  ShieldCheck,
  Users,
  HardHat,
  MessageSquare,
  LineChart,
  Quote,
  Scale,
  TrendingUp,
} from "lucide-react";
import { isAdminAuthed, adminLogin, adminLogout } from "@/lib/adminAuth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Dealers", href: "/admin/dealers", icon: Users },
  { label: "Builders", href: "/admin/builders", icon: HardHat },
  { label: "Leads", href: "/admin/leads", icon: MessageSquare },
  { label: "Analytics", href: "/admin/analytics", icon: LineChart },
  { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
  { label: "Lawyers", href: "/admin/lawyers", icon: Scale },
  { label: "Insights", href: "/admin/insights", icon: TrendingUp },
  { label: "Post Property", href: "/admin/post", icon: PlusCircle },
  { label: "Hero Showcase", href: "/admin/hero", icon: Images },
];

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await adminLogin(username, password);
    setSubmitting(false);
    if (ok) {
      setError("");
      onSuccess();
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1B43] via-[#1E3A8A] to-[#25459E] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-7">
        <div className="flex flex-col items-center text-center">
          <span className="size-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#E8C66A] flex items-center justify-center text-white shadow-lg">
            <Lock className="size-7" />
          </span>
          <h1 className="text-[22px] font-bold text-[#1E3A8A] mt-4" style={{ fontFamily: "var(--font-outfit)" }}>
            Admin Sign In
          </h1>
          <p className="text-[13px] text-[#6E7488] mt-1">ClearTitle One control panel — authorised access only.</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[#6E7488] mb-1.5">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="w-full h-11 px-3.5 rounded-xl border border-[#D5DEF2] focus:border-[#D4AF37] outline-none text-[14px] text-[#1E3A8A]"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[#6E7488] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#D5DEF2] focus:border-[#D4AF37] outline-none text-[14px] text-[#1E3A8A]"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-[12.5px] text-[#C0392B] font-semibold">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full h-12 btn-gold rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50">
            <ShieldCheck className="size-4.5" /> Sign In
          </button>
        </form>

        <Link href="/" className="block text-center text-[12.5px] text-[#6E7488] hover:text-[#D4AF37] mt-5 font-semibold">
          ← Back to website
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = useLocation().pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAuthed(isAdminAuthed());
    setMounted(true);
    const sync = () => setAuthed(isAdminAuthed());
    window.addEventListener("cleartitle:admin-auth-changed", sync);
    return () => window.removeEventListener("cleartitle:admin-auth-changed", sync);
  }, []);

  // Avoid hydration flash before we know the auth state.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B1B43] flex items-center justify-center">
        <div className="size-8 border-3 border-[#E8C66A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F1F5FF] flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-[#1E3A8A] flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="px-6 h-[72px] flex items-center justify-between border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#D4AF37]/60 shadow-lg">
              <Image
                src="/cleartitleone/logo.png"
                alt="ClearTitle One Logo"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-white font-bold text-[15px]" style={{ fontFamily: "var(--font-outfit)" }}>
                ClearTitle
              </span>
              <span className="text-[#E3C25A] font-bold text-[15px] ml-1" style={{ fontFamily: "var(--font-outfit)" }}>
                Admin
              </span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.08em] px-3 mb-2">
            Management
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-[#C9A24E]/20 to-[#E3C25A]/10 text-[#E3C25A] shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-br from-[#C9A24E] to-[#E3C25A] shadow-md"
                      : "bg-white/5 group-hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                </div>
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/10">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.08em] px-3 mb-2">
              Quick Links
            </p>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              View Website
            </Link>
          </div>
        </nav>

        {/* User Info */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#D4AF37] to-[#E8C66A] rounded-xl flex items-center justify-center text-[#1E3A8A] font-bold text-[13px]">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">Admin User</p>
              <p className="text-[11px] text-white/40 truncate">admin@cleartitle.com</p>
            </div>
            <button
              onClick={() => { adminLogout(); setAuthed(false); }}
              className="text-white/40 hover:text-[#E8C66A] transition-colors"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-[72px] bg-white/80 backdrop-blur-xl border-b border-[#D5DEF2]/30 flex items-center px-4 lg:px-8 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl bg-[#F1F5FF] flex items-center justify-center hover:bg-[#E2E9FB] transition-colors"
          >
            <Menu className="w-5 h-5 text-[#1E3A8A]" />
          </button>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md items-center gap-2 bg-[#F1F5FF] rounded-xl px-4 py-2.5 border border-[#D5DEF2]/30 focus-within:border-[#C9A24E]/40 focus-within:ring-2 focus-within:ring-[#C9A24E]/10 transition-all">
            <Search className="w-4 h-4 text-[#6E7488]" />
            <input
              type="text"
              placeholder="Search properties..."
              className="flex-1 bg-transparent text-[14px] text-[#1E3A8A] placeholder-[#6E7488] outline-none"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative w-10 h-10 rounded-xl bg-[#F1F5FF] flex items-center justify-center hover:bg-[#E2E9FB] transition-colors border border-[#D5DEF2]/30">
              <Bell className="w-5 h-5 text-[#6E7488]" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8C66A] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                3
              </span>
            </button>
            <div className="hidden sm:block w-px h-8 bg-[#D5DEF2]/40" />
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-[#D4AF37] to-[#E8C66A] rounded-xl flex items-center justify-center text-[#1E3A8A] font-bold text-[13px]">
                A
              </div>
              <span className="text-[13px] font-medium text-[#1E3A8A]">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
