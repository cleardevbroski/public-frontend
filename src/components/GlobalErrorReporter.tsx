import { useEffect } from "react";
import { reportApplicationError } from "@/lib/api";

function report(message: string, source: string) {
  if (!message) return;
  void reportApplicationError({
    message: message.slice(0, 500),
    path: window.location.pathname,
    source,
  }).catch(() => undefined);
}

export default function GlobalErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => report(event.error instanceof Error ? event.error.message : event.message, "window_error");
    const onRejection = (event: PromiseRejectionEvent) => report(event.reason instanceof Error ? event.reason.message : String(event.reason || "Unhandled promise rejection"), "unhandled_rejection");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
