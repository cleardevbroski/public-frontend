import { describe, it, expect, vi } from "vitest";
import { createHydratedCache } from "@/lib/hydratedCache";

describe("createHydratedCache", () => {
  it("returns empty before hydration, then fills and dispatches the event", async () => {
    const items = [{ id: "1" }, { id: "2" }];
    const fetcher = vi.fn(async () => items);
    const cache = createHydratedCache<{ id: string }>(fetcher, "test:changed");
    const fired = vi.fn();
    window.addEventListener("test:changed", fired);

    expect(cache.get()).toEqual([]); // triggers background hydrate
    await vi.waitFor(() => expect(cache.get()).toEqual(items));
    expect(fired).toHaveBeenCalled();
    expect(fetcher).toHaveBeenCalledTimes(1); // hydrates once
  });

  it("keeps the last value if the fetcher rejects", async () => {
    const cache = createHydratedCache(async () => { throw new Error("network"); }, "test:err");
    expect(cache.get()).toEqual([]);
    await vi.waitFor(() => expect(cache.get()).toEqual([]));
  });
});
