import { Suspense } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { AuthProvider } from "@/components/acres/AuthContext";
import AnalyticsPageTracker from "@/components/AnalyticsPageTracker";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
import GlobalErrorReporter from "@/components/GlobalErrorReporter";
import { FavoritesProvider } from "@/components/acres/FavoritesContext";
import FamilyWorkspaceDock from "@/components/acres/FamilyWorkspaceDock";

/**
 * Root layout — replaces the `<body>` of the Next `app/layout.tsx`. The
 * `<html>`/`<body>` shell and fonts/metadata now live in `index.html`.
 */
export default function RootLayout() {
  const location = useLocation();
  const routeLoading = <div className="min-h-[65vh] animate-pulse bg-[#F3F4F6]" aria-label="Loading page"><div className="h-16 bg-[#0B1328]" /><div className="mx-auto mt-8 grid max-w-[1200px] gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3"><div className="h-44 rounded-2xl bg-white" /><div className="h-44 rounded-2xl bg-white" /><div className="h-44 rounded-2xl bg-white" /></div></div>;
  return (
    <AuthProvider>
      <FavoritesProvider>
        <a href="#main-content" className="skip-to-content">Skip to main content</a>
        <ScrollRestoration />
        <AnalyticsPageTracker />
        <GlobalErrorReporter />
        <Suspense fallback={routeLoading}>
          <SectionErrorBoundary resetKey={`${location.pathname}${location.search}`} source="route_content">
            <div id="main-content"><Outlet /></div>
          </SectionErrorBoundary>
        </Suspense>
        {!location.pathname.startsWith("/admin") && !location.pathname.startsWith("/family-workspace/") && !location.pathname.startsWith("/channel-partner") && !location.pathname.startsWith("/cp-registration") && !location.pathname.startsWith("/cp-dashboard") && !location.pathname.startsWith("/cp-management") && !location.pathname.startsWith("/cp-verification") && !location.pathname.startsWith("/broker-verification") && !location.pathname.startsWith("/employee-login") && <FamilyWorkspaceDock />}
      </FavoritesProvider>
    </AuthProvider>
  );
}
