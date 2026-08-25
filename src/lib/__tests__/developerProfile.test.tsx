import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ProjectBuilderProfile from "@/components/acres/ProjectBuilderProfile";
import type { Property } from "@/components/acres/mock-data";
import { fetchBuilder } from "@/lib/api";

vi.mock("@/lib/api", () => ({ fetchBuilder: vi.fn() }));

const longDescription = "ClearTitle Developer has delivered thoughtfully planned residential communities across Bengaluru. Its work focuses on transparent documentation, practical amenities, durable construction, and long-term neighbourhood value for homebuyers. This additional history should remain available without expanding the normal developer card.";

const property = {
  id: "developer-profile-property",
  title: "Developer Profile Project",
  subtitle: "Bengaluru",
  price: "₹1 Cr",
  area: "1,200 sqft",
  image: "",
  configs: ["2 BHK"],
  builder: "ClearTitle Developer",
  developerLogoUrl: "https://example.com/developer-logo.png",
  developerDescription: longDescription,
} as Property;

describe("ProjectBuilderProfile", () => {
  it("keeps the long description clamped and opens the full profile in a dialog", async () => {
    vi.mocked(fetchBuilder).mockResolvedValue({ builder: { description: "Builder collection fallback." } } as never);
    const host = document.createElement("div");
    const root = createRoot(host);

    await act(async () => root.render(<MemoryRouter><ProjectBuilderProfile property={property} projects={[]} /></MemoryRouter>));
    expect(host.querySelector(".line-clamp-3")?.textContent).toBe(longDescription);
    expect(host.querySelector('[role="dialog"]')).toBeNull();

    const viewMore = [...host.querySelectorAll("button")].find((button) => button.textContent?.includes("View more"));
    await act(async () => viewMore?.click());
    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(longDescription);
    expect(host.querySelector('[role="dialog"]')?.textContent).not.toContain("Builder collection fallback");

    const close = host.querySelector('button[aria-label="Close developer profile"]') as HTMLButtonElement;
    await act(async () => close.click());
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    await act(async () => root.unmount());
  });
});
