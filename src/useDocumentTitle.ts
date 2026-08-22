import { useEffect } from "react";

const DEFAULT_TITLE =
  "ClearTitle One — Buy and Sell Property in India | Premium Real Estate";

const SITE_ORIGIN = "https://cleartitleone.com";

type SeoOptions = {
  canonical?: string;
  robots?: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
};

/**
 * Sets document.title and the meta-description for the current route, restoring
 * the defaults on unmount. Replaces Next's per-route `metadata` export for the
 * pages that set their own title (catch-all, dynamic pages).
 */
export function useDocumentTitle(title?: string, description?: string, seo: SeoOptions = {}) {
  const jsonLdText = seo.jsonLd ? JSON.stringify(seo.jsonLd) : "";
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

    const previous: Array<[HTMLMetaElement, string | null]> = [];
    const setMeta = (selector: string, attributes: Record<string, string>, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value));
        document.head.appendChild(element);
      } else {
        previous.push([element, element.getAttribute("content")]);
      }
      element.setAttribute("content", content);
    };
    if (title) setMeta('meta[property="og:title"]', { property: "og:title" }, title);
    if (description) {
      setMeta('meta[property="og:description"]', { property: "og:description" }, description);
      setMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description);
    }
    if (seo.image) setMeta('meta[property="og:image"]', { property: "og:image" }, seo.image);
    if (seo.robots) setMeta('meta[name="robots"]', { name: "robots" }, seo.robots);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    let canonicalCreated = false;
    if (seo.canonical) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
        canonicalCreated = true;
      }
      canonical.href = seo.canonical.startsWith("http") ? seo.canonical : `${SITE_ORIGIN}${seo.canonical}`;
    }
    let jsonLd: HTMLScriptElement | null = null;
    if (jsonLdText) {
      jsonLd = document.createElement("script");
      jsonLd.type = "application/ld+json";
      jsonLd.dataset.routeSeo = "true";
      jsonLd.textContent = jsonLdText;
      document.head.appendChild(jsonLd);
    }

    return () => {
      document.title = DEFAULT_TITLE;
      if (metaEl && previousContent !== null) {
        metaEl.setAttribute("content", previousContent);
      }
      previous.forEach(([element, content]) => {
        if (content === null) element.remove();
        else element.setAttribute("content", content);
      });
      if (canonicalCreated) canonical?.remove();
      jsonLd?.remove();
    };
  }, [title, description, seo.canonical, seo.image, jsonLdText, seo.robots]);
}
