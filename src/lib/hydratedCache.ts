/**
 * A tiny in-memory cache that lazily hydrates from an async fetcher on first
 * read and notifies subscribers (via a DOM event) when the data changes, so
 * synchronous selectors + useLiveData keep the "read now, update on arrival"
 * model the app already uses.
 */
export function createHydratedCache<T>(fetcher: () => Promise<T[]>, event: string) {
  let cache: T[] = [];
  let started = false;

  function notify() {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(event));
  }

  async function hydrate() {
    started = true;
    try {
      cache = await fetcher();
    } catch {
      // DBG009: Reset so subsequent get() retries instead of returning stale empty data
      started = false;
    }
    notify();
  }

  return {
    get(): T[] {
      if (!started) void hydrate();
      return cache;
    },
    set(next: T[]) {
      cache = next;
      notify();
    },
    async refresh() {
      await hydrate();
    },
  };
}
