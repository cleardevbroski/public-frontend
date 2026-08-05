import { Suspense } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { AuthProvider } from "@/components/acres/AuthContext";
import AnalyticsPageTracker from "@/components/AnalyticsPageTracker";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
import GlobalErrorReporter from "@/components/GlobalErrorReporter";
import { FavoritesProvider } from "@/components/acres/FavoritesContext";

/**
 * Root layout — replaces the `<body>` of the Next `app/layout.tsx`. The
 * `<html>`/`<body>` shell and fonts/metadata now live in `index.html`.
 */
export default function RootLayout() {
  const location = useLocation();
  return (
    <AuthProvider>
      <FavoritesProvider>
        <ScrollRestoration />
        <AnalyticsPageTracker />
        <GlobalErrorReporter />
        <Suspense fallback={null}>
          <SectionErrorBoundary resetKey={`${location.pathname}${location.search}`} source="route_content">
            <Outlet />
          </SectionErrorBoundary>
        </Suspense>
      </FavoritesProvider>
    </AuthProvider>
  );
}
