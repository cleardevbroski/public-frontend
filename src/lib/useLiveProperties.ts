"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Re-run `selector` whenever any of `events` fires (cache hydration / admin
 * writes) or another tab updates storage.
 */
export function useLiveData<T>(
  selector: () => T,
  initial: T,
  events: string[] = ["cleartitle:properties-changed"]
): T {
  const [value, setValue] = useState<T>(initial);

  // Track the latest selector so event-driven refreshes never call a stale
  // closure (e.g. after the parent swaps props without remounting).
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  useEffect(() => {
    const refresh = () => setValue(selectorRef.current());
    refresh();
    events.forEach((e) => window.addEventListener(e, refresh));
    window.addEventListener("storage", refresh);
    return () => {
      events.forEach((e) => window.removeEventListener(e, refresh));
      window.removeEventListener("storage", refresh);
    };
    // Subscribe once on mount; selectorRef always holds the latest selector.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}

/** Back-compat wrapper — property components listen to the properties event. */
export function useLiveProperties<T>(selector: () => T, initial: T): T {
  return useLiveData(selector, initial, ["cleartitle:properties-changed"]);
}
