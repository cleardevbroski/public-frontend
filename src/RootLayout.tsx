import { Outlet, ScrollRestoration } from "react-router-dom";
import { AuthProvider } from "@/components/acres/AuthContext";

/**
 * Root layout — replaces the `<body>` of the Next `app/layout.tsx`. The
 * `<html>`/`<body>` shell and fonts/metadata now live in `index.html`.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <ScrollRestoration />
      <Outlet />
    </AuthProvider>
  );
}
