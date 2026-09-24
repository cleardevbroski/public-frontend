import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import FamilyWorkspaceDock from "@/components/acres/FamilyWorkspaceDock";

vi.mock("@/lib/decisionWorkspace", () => ({
  getStoredWorkspace: () => null,
  workspaceHref: () => "/find-my-home",
}));

describe("family workspace corner control", () => {
  let root: ReturnType<typeof createRoot>;
  afterEach(async () => {
    if (root) await act(async () => root.unmount());
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });
  async function render() {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    await act(async () => root.render(<MemoryRouter><FamilyWorkspaceDock /></MemoryRouter>));
    return host;
  }
  it("starts collapsed, has an accessible label, and restores focus when closed", async () => {
    const host = await render();
    const trigger = host.querySelector<HTMLButtonElement>(".family-dock-trigger")!;
    expect(trigger.getAttribute("aria-label")).toBe("Decide together");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(host.querySelector('[role="region"]')).toBeNull();
    await act(async () => trigger.click());
    expect(host.querySelector('[role="region"]')?.id).toBe(trigger.getAttribute("aria-controls"));
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Close family workspace explanation"]')!.click());
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });
  it("dismisses with Escape and outside taps", async () => {
    const host = await render();
    const trigger = host.querySelector<HTMLButtonElement>(".family-dock-trigger")!;
    await act(async () => trigger.click());
    await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await act(async () => trigger.click());
    await act(async () => document.body.dispatchEvent(new Event("pointerdown", { bubbles: true })));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
  it("measures late-mounted bottom bars and clears the inset after dismissal", async () => {
    await render();
    const bar = document.createElement("div");
    bar.dataset.publicBottomBar = "";
    let height = 96;
    vi.spyOn(bar, "getBoundingClientRect").mockImplementation(() => ({ height }) as DOMRect);
    await act(async () => document.body.append(bar));
    expect(document.documentElement.style.getPropertyValue("--public-bottom-bar-height")).toBe("96px");
    height = 124;
    await act(async () => window.dispatchEvent(new Event("resize")));
    expect(document.documentElement.style.getPropertyValue("--public-bottom-bar-height")).toBe("124px");
    await act(async () => bar.remove());
    expect(document.documentElement.style.getPropertyValue("--public-bottom-bar-height")).toBe("0px");
  });
  it("removes the shared inset on unmount", async () => {
    await render();
    expect(document.documentElement.style.getPropertyValue("--public-bottom-bar-height")).toBe("0px");
    await act(async () => root.unmount());
    expect(document.documentElement.style.getPropertyValue("--public-bottom-bar-height")).toBe("");
  });
});
