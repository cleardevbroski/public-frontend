import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import ChannelPartners from "@/pages/ChannelPartners";
import ChannelPartnerRegistration from "@/pages/ChannelPartnerRegistration";
import ChannelPartnerDashboard from "@/pages/ChannelPartnerDashboard";

describe("standalone channel partner portal", () => {
  afterEach(() => { document.body.innerHTML = ""; sessionStorage.clear(); });

  it("shows application sections only after choosing a partner type", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => { root.render(<ChannelPartners />); });

    let text = document.body.textContent || "";
    expect(text).toContain("Choose Channel Partner Type");
    expect(text).not.toContain("Contact Details");
    expect(text).not.toContain("Business Profile");

    const company = host.querySelector('input[name="partnerType"][value="company"]') as HTMLInputElement;
    await act(async () => { company.click(); });
    text = document.body.textContent || "";
    for (const heading of ["Company Details", "Contact Details", "Business Profile", "Bank Details", "Documents Upload", "Declaration"]) {
      expect(text).toContain(heading);
    }
    expect(text).not.toContain("Post property");
    expect(text).not.toContain("For Buyers");
    expect(text).not.toContain("Download the App");
    expect(host.querySelector('a[href="/cp-registration"]')).toBeTruthy();

    await act(async () => { root.unmount(); });
  });

  it("switches between company and individual partner fields", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => { root.render(<ChannelPartners />); });

    expect(host.textContent).toContain("Choose Channel Partner Type");
    expect(host.textContent).not.toContain("Company / Firm Name");
    expect(host.textContent).not.toContain("Partner Name");
    expect(host.textContent).not.toContain("Team Strength");
    expect(host.textContent).not.toContain("Company Logo");

    const company = host.querySelector('input[name="partnerType"][value="company"]') as HTMLInputElement;
    await act(async () => { company.click(); });
    expect(host.textContent).toContain("Company / Firm Name");
    expect(host.textContent).toContain("Team Strength");
    expect(host.textContent).toContain("Company Logo");

    const individual = host.querySelector('input[name="partnerType"][value="individual"]') as HTMLInputElement;
    await act(async () => {
      individual.click();
    });
    expect(individual.checked).toBe(true);
    expect(host.textContent).toContain("Partner Details");
    expect(host.textContent).toContain("Partner Name");
    expect(host.textContent).not.toContain("Team Strength");
    expect(host.textContent).not.toContain("Company Logo");

    await act(async () => { company.click(); });
    expect(company.checked).toBe(true);
    expect(host.textContent).toContain("Company / Firm Name");
    expect(host.textContent).toContain("Team Strength");
    expect(host.textContent).toContain("Company Logo");

    await act(async () => { root.unmount(); });
  });

  it("keeps code verification and client registration on one page", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => { root.render(<ChannelPartnerRegistration />); });
    expect(host.textContent).toContain("One-page registration");
    expect(host.textContent).toContain("Show partner details");
    expect(host.textContent).toContain("Client details");
    expect(host.querySelector('input[placeholder*="CT-0001"]')).toBeTruthy();
    expect(host.textContent).not.toContain("Admin approval");
    await act(async () => { root.unmount(); });
  });

  it("offers code login and code recovery from the dashboard", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => { root.render(<ChannelPartnerDashboard />); });
    expect(host.textContent).toContain("Open your CP Dashboard");
    expect(host.textContent).toContain("Forgot CP Code?");
    const forgot = Array.from(host.querySelectorAll("button")).find((button) => button.textContent === "Forgot CP Code?");
    await act(async () => { forgot?.click(); });
    expect(host.textContent).toContain("Recover your CP code");
    expect(host.querySelector('input[type="email"]')).toBeTruthy();
    await act(async () => { root.unmount(); });
  });
});
