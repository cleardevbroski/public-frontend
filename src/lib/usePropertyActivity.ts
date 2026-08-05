import { useEffect } from "react";
import { getVisitState, submitPropertyActivity, type PropertyActivity } from "@/lib/clientActivity";

const IDLE_AFTER_MS = 60 * 1000;

export function usePropertyActivity(property: PropertyActivity) {
  useEffect(() => {
    let accumulatedMs = 0;
    let activeStartedAt = document.visibilityState === "visible" ? Date.now() : 0;
    let lastInteractionAt = Date.now();
    let lastSessionTouchAt = lastInteractionAt;
    let submitted = false;

    const pause = () => {
      if (!activeStartedAt) return;
      const activeUntil = Math.min(Date.now(), lastInteractionAt + IDLE_AFTER_MS);
      accumulatedMs += Math.max(0, activeUntil - activeStartedAt);
      activeStartedAt = 0;
    };
    const interact = () => {
      lastInteractionAt = Date.now();
      // Keep the 30-minute browser visit alive while the person is genuinely
      // interacting, without sending heartbeats or writing on every event.
      if (lastInteractionAt - lastSessionTouchAt >= 30_000) {
        getVisitState(lastInteractionAt);
        lastSessionTouchAt = lastInteractionAt;
      }
      if (!activeStartedAt && document.visibilityState === "visible") activeStartedAt = lastInteractionAt;
    };
    const visibilityChanged = () => {
      if (document.visibilityState === "hidden") pause();
      else interact();
    };
    const submit = () => {
      if (submitted) return;
      submitted = true;
      pause();
      const activeSeconds = Math.floor(accumulatedMs / 1000);
      if (activeSeconds >= 2) submitPropertyActivity(property, activeSeconds);
    };

    const activityEvents: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((event) => window.addEventListener(event, interact, { passive: true }));
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("pagehide", submit);
    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, interact));
      document.removeEventListener("visibilitychange", visibilityChanged);
      window.removeEventListener("pagehide", submit);
      submit();
    };
  }, [property.location, property.priceLabel, property.propertyId, property.propertyTitle, property.propertyType]);
}
