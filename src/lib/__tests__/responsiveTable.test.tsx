import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import ResponsiveTable from "@/components/ResponsiveTable";

describe("responsive record tables", () => {
  let root: ReturnType<typeof createRoot>;
  afterEach(async () => { if (root) await act(async () => root.unmount()); document.body.innerHTML = ""; });
  async function render(content: React.ReactNode) {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    await act(async () => root.render(content));
    return host;
  }
  it("labels mobile cells and keeps selection and action controls", async () => {
    const host = await render(<ResponsiveTable label="Employees"><table><thead><tr><th><input aria-label="Select all" type="checkbox" /></th><th>Name</th><th>Assigned</th><th>Actions</th></tr></thead><tbody><tr><td><input type="checkbox" aria-label="Select employee" /></td><td>Employee</td><td>305</td><td><button>View</button></td></tr></tbody></table></ResponsiveTable>);
    expect(host.querySelector("[data-mobile]")?.getAttribute("data-mobile")).toBe("cards");
    expect(Array.from(host.querySelectorAll("td"), (cell) => cell.dataset.label)).toEqual(["Select", "Name", "Assigned", "Actions"]);
    expect(host.querySelectorAll('input[type="checkbox"]')).toHaveLength(2);
    expect(host.querySelector("button")?.textContent).toBe("View");
  });
  it("retains horizontal scrolling for complex tables", async () => {
    const host = await render(<ResponsiveTable><table><thead><tr><th colSpan={2}>Configurations</th></tr></thead><tbody><tr><td>2 BHK</td><td>1500 sqft</td></tr></tbody></table></ResponsiveTable>);
    expect(host.querySelector("[data-mobile]")?.getAttribute("data-mobile")).toBe("scroll");
  });
  it("supports empty rows and explicit scrolling for editable tables", async () => {
    const host = await render(<ResponsiveTable mobile="scroll"><table><thead><tr><th>Name</th><th>Actions</th></tr></thead><tbody><tr><td colSpan={2}>No records</td></tr></tbody></table></ResponsiveTable>);
    expect(host.querySelector("[data-mobile]")?.getAttribute("data-mobile")).toBe("scroll");
    expect(host.querySelector("td")?.dataset.label).toBe("");
  });
});
