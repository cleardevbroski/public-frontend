import { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { AuthProvider } from "@/components/acres/AuthContext";
import AnalyticsPageTracker from "@/components/AnalyticsPageTracker";

/**
 * Root layout — replaces the `<body>` of the Next `app/layout.tsx`. The
 * `<html>`/`<body>` shell and fonts/metadata now live in `index.html`.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <ScrollRestoration />
      <AnalyticsPageTracker />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </AuthProvider>
  );
}
