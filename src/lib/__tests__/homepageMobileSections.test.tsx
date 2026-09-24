import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import ClearTitleAdvisor from "@/components/acres/ClearTitleAdvisor";
import PropertyTypeTiles from "@/components/acres/PropertyTypeTiles";
import ProjectTrustStrip from "@/components/acres/ProjectTrustStrip";
import { browsePropertyTypes } from "@/components/acres/bangalore-data";

describe("mobile homepage sections", () => {
  let root: ReturnType<typeof createRoot>;
  afterEach(async () => {
    if (root) await act(async () => root.unmount());
    document.body.innerHTML = "";
  });
  async function render(content: React.ReactNode) {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    await act(async () => root.render(<MemoryRouter>{content}</MemoryRouter>));
    return host;
  }
  it("keeps every property category linked in its scrollable region", async () => {
    const host = await render(<PropertyTypeTiles />);
    const row = host.querySelector('[aria-label="Property categories"]')!;
    expect(row.getAttribute("tabindex")).toBe("0");
    expect(Array.from(row.querySelectorAll("a"), (link) => link.getAttribute("href"))).toEqual(browsePropertyTypes.slice(0, 5).map((type) => "/" + type.canonicalSlug));
  });
  it("renders the same project information outside the hero", async () => {
    const host = await render(<ProjectTrustStrip placement="below-properties" />);
    expect(host.querySelectorAll('[aria-label="Project information"]')).toHaveLength(1);
    for (const label of ["Project records", "RERA references", "Verified pins"]) expect(host.textContent).toContain(label);
    expect(host.querySelector(".home-project-trust")).toBeTruthy();
  });
  it("preserves calculator values when changing advisor categories", async () => {
    const host = await render(<ClearTitleAdvisor />);
    const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    await act(async () => tabs[1].click());
    const enter = async (label: string, value: string) => {
      const input = host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    };
    await enter("Loan amount", "6500000");
    await enter("Interest rate (%)", "9.2");
    await enter("Loan tenure (years)", "15");
    await enter("Area in square feet", "1800");
    await act(async () => tabs[0].click());
    expect(host.querySelectorAll(".advisor-services > div")).toHaveLength(4);
    await act(async () => tabs[2].click());
    expect(host.querySelectorAll(".advisor-transparency > div")).toHaveLength(3);
    await act(async () => tabs[1].click());
    for (const [label, value] of [["Loan amount", "6500000"], ["Interest rate (%)", "9.2"], ["Loan tenure (years)", "15"], ["Area in square feet", "1800"]]) {
      expect(host.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!.value).toBe(value);
    }
  });
  it("supports keyboard category selection with an associated panel", async () => {
    const host = await render(<ClearTitleAdvisor />);
    const tabs = host.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[0].focus();
    await act(async () => tabs[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(tabs[1]);
    expect(host.querySelector('[role="tabpanel"]')!.getAttribute("aria-labelledby")).toBe(tabs[1].id);
    await act(async () => tabs[1].dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true })));
    expect(tabs[2].getAttribute("aria-selected")).toBe("true");
  });
});
