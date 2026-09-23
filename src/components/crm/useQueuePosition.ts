import { useCallback, useEffect, useRef } from "react";

export function useQueuePosition(selectedId?: string) {
  const position = useRef({ page: 0, list: 0 });
  const previous = useRef(selectedId);
  const remember = useCallback(() => {
    if (selectedId) return;
    position.current = { page: window.scrollY, list: document.querySelector(".employee-queue-scroll")?.scrollTop || 0 };
  }, [selectedId]);
  useEffect(() => {
    const restore = previous.current && !selectedId;
    previous.current = selectedId;
    if (!restore) return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: position.current.page, behavior: "instant" });
      const queue = document.querySelector(".employee-queue-scroll");
      if (queue) queue.scrollTop = position.current.list;
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedId]);
  return remember;
}
