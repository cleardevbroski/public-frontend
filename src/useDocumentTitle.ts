import { useEffect } from "react";

const DEFAULT_TITLE =
  "ClearTitle One — Buy/Rent/Sell/Lease Property in India | Premium Real Estate";

/**
 * Sets document.title and the meta-description for the current route, restoring
 * the defaults on unmount. Replaces Next's per-route `metadata` export for the
 * pages that set their own title (catch-all, dynamic pages).
 */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    if (title) document.title = title;

    let metaEl: HTMLMetaElement | null = null;
    let previousContent: string | null = null;
    if (description) {
      metaEl = document.querySelector('meta[name="description"]');
      if (metaEl) {
        previousContent = metaEl.getAttribute("content");
        metaEl.setAttribute("content", description);
      }
    }

    return () => {
      document.title = DEFAULT_TITLE;
      if (metaEl && previousContent !== null) {
        metaEl.setAttribute("content", previousContent);
      }
    };
  }, [title, description]);
}
