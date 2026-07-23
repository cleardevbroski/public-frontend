"use client";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackAnalytics } from "@/lib/analytics";

export default function AnalyticsPageTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    trackAnalytics("page_view", { source: "route" }, path);
  }, [location.pathname, location.search]);

  return null;
}
