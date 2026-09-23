import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { crmEmployeeLogin, hasCRMEmployeeSession } from "@/lib/api";
import { useDocumentTitle } from "@/useDocumentTitle";

export default function EmployeeLogin() {
  useDocumentTitle("Employee Login | CP Management", "ClearTitle One employee CP management login.", { robots: "noindex, nofollow, noarchive" });
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const employeeLandingPath = () => {
    const path = window.localStorage.getItem("crm-employee-last-workspace");
    return ["/cp-management", "/cp-verification", "/broker-verification"].includes(path || "") ? path! : "/cp-management";
  };

  useEffect(() => { if (hasCRMEmployeeSession()) navigate(employeeLandingPath(), { replace: true }); }, [navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try { await crmEmployeeLogin(employeeId, password); navigate(employeeLandingPath(), { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to sign in."); }
    finally { setBusy(false); }
  };

  return <main className="employee-login grid min-h-[100dvh] place-items-center bg-[#0B1328] px-3 py-6 sm:px-4 sm:py-10 [padding-top:max(1.5rem,env(safe-area-inset-top))] [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]">
    <section className="w-full max-w-[420px] overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl">
      <div className="border-b border-[#E4E0E7] bg-[#F8F7FA] px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-center gap-3"><img src="/cleartitleone/logo.png" alt="ClearTitle One" className="size-11 rounded-full ring-2 ring-[#DDAA42]/60" /><div><p className="text-[17px] font-bold text-[#121B35]">ClearTitle One</p><p className="text-[11px] font-bold uppercase text-[#805A0B]">CP Management</p></div></div>
      </div>
      <form onSubmit={submit} className="space-y-4 p-5 sm:p-7">
        <div><h1 className="text-[24px] font-bold text-[#121B35]">Employee sign in</h1><p className="mt-1 text-[13px] text-[#68646F]">Use the employee ID and password provided by your administrator.</p></div>
        {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700">{error}</p>}
        <label className="block"><span className="text-[11px] font-bold uppercase text-[#68646F]">Employee ID</span><input autoComplete="username" autoCapitalize="characters" value={employeeId} onChange={(event) => setEmployeeId(event.target.value.toUpperCase())} className="mt-1.5 h-12 w-full rounded-md border border-[#D8D3DA] px-3 text-base font-semibold uppercase outline-none focus:border-[#DDAA42] sm:h-11 sm:text-sm" placeholder="EMP-001" /></label>
        <label className="block"><span className="text-[11px] font-bold uppercase text-[#68646F]">Password</span><div className="relative mt-1.5"><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-md border border-[#D8D3DA] px-3 pr-12 text-base outline-none focus:border-[#DDAA42] sm:h-11 sm:text-sm" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-0 grid size-12 place-items-center text-[#68646F] sm:size-11" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>
        <button disabled={busy || employeeId.length < 3 || password.length < 8} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#DDAA42] text-sm font-bold text-[#0B1328] disabled:opacity-50 sm:h-11">{busy ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />} Sign in</button>
        <a href="/" className="flex items-center justify-center gap-2 pt-1 text-xs font-semibold text-[#68646F]"><LockKeyhole className="size-3.5" />Authorised employees only</a>
      </form>
    </section>
  </main>;
}
