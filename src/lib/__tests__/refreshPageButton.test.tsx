import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import RefreshPageButton from "@/components/RefreshPageButton";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("RefreshPageButton", () => {
  it("refreshes ordinary pages directly", async () => {
    vi.useFakeTimers();
    const onRefresh = vi.fn();
    const confirm = vi.spyOn(window, "confirm");
    const host = document.createElement("div");
    const root = createRoot(host);
    await act(async () => root.render(<MemoryRouter initialEntries={["/property/example"]}><RefreshPageButton onRefresh={onRefresh} /></MemoryRouter>));

    await act(async () => (host.querySelector("button") as HTMLButtonElement).click());
    expect(host.textContent).toContain("Refreshing");
    await act(async () => vi.advanceTimersByTime(120));
    expect(onRefresh).toHaveBeenCalledOnce();
    expect(confirm).not.toHaveBeenCalled();
    await act(async () => root.unmount());
  });

  it("protects unsaved Post Property form data", async () => {
    vi.useFakeTimers();
    const onRefresh = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const host = document.createElement("div");
    const root = createRoot(host);
    await act(async () => root.render(<MemoryRouter initialEntries={["/admin/post"]}><RefreshPageButton variant="toolbar" onRefresh={onRefresh} /></MemoryRouter>));

    await act(async () => (host.querySelector("button") as HTMLButtonElement).click());
    await act(async () => vi.runAllTimers());
    expect(onRefresh).not.toHaveBeenCalled();
    expect(host.querySelector("button")?.getAttribute("aria-label")).toBe("Refresh page");
    await act(async () => root.unmount());
  });
});
