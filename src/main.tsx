import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "@fontsource-variable/open-sans";
import "@fontsource-variable/playfair-display";
import "@/globals.css";
import "@/fonts.css";
import { router } from "@/routes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
