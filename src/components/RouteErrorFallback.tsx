import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import Link from "@/components/Link";

export default function RouteErrorFallback() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F8F7F9] via-white to-[#FFF8E8] px-5 py-16">
      <section className="w-full max-w-xl rounded-3xl border border-[#EAE6EC] bg-white p-7 text-center shadow-xl md:p-10" aria-labelledby="route-error-title">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#FFF1EF] text-[#B33A2E]">
          <AlertTriangle className="size-7" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#D09A2D]">{status ? `Error ${status}` : "ClearTitle One"}</p>
        <h1 id="route-error-title" className="mt-2 text-2xl font-bold text-[#121B35] md:text-3xl">Sorry, something went wrong.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#68646F]">We couldn&apos;t display this page right now. Your data is safe—please refresh the page or return to the dashboard.</p>
        <p className="mt-4 text-sm italic text-[#8A7449]">“Every title deserves clarity. We’ll help you get back on track.”</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={() => window.location.reload()} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#121B35] px-5 text-sm font-bold text-white hover:bg-[#273559]"><RefreshCw className="size-4" /> Try again</button>
          <Link href="/admin" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E4E0E7] px-5 text-sm font-bold text-[#273559] hover:border-[#DDAA42]"><Home className="size-4" /> Dashboard</Link>
        </div>
      </section>
    </main>
  );
}
