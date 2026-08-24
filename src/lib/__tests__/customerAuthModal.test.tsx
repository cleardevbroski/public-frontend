import { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createManualSession: vi.fn(async () => ({
    token: "guest-jwt",
    user: { id: "guest-1", phone: "9876543210", name: "Asha Rao", email: "asha@example.com", role: "guest", isVerified: false, verificationSource: "manual" },
  })),
  updateProfile: vi.fn(async () => ({
    user: { id: "customer-1", phone: "9876543210", name: "Asha Rao", email: "asha@example.com", role: "user" },
  })),
}));

vi.mock("@/lib/api", () => ({
  createManualSession: mocks.createManualSession,
  updateProfile: mocks.updateProfile,
  startTruecallerVerification: vi.fn(),
  getTruecallerVerificationStatus: vi.fn(),
  hasToken: () => false,
  getMe: vi.fn(),
  removeToken: vi.fn(),
  setToken: vi.fn(),
  submitClientActivityVisit: vi.fn(async () => ({})),
  submitClientActivityEngagement: vi.fn(async () => ({})),
}));

import AuthModal from "@/components/acres/AuthModal";
import { AuthProvider, useAuth } from "@/components/acres/AuthContext";

function Harness() {
  const auth = useAuth();
  useEffect(() => auth.setIsAuthModalOpen(true), []);
  return <AuthModal />;
}

function setInput(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function button(host: HTMLElement, label: string) {
  const match = [...host.querySelectorAll("button")].find((item) => item.textContent?.includes(label));
  if (!match) throw new Error(`Button not found: ${label}`);
  return match;
}

describe("customer authentication modal", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("creates a manual guest session without requesting an OTP", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => root.render(<AuthProvider><Harness /></AuthProvider>));

    const inputs = [...host.querySelectorAll("input")] as HTMLInputElement[];
    await act(async () => {
      setInput(inputs.find((input) => input.autocomplete === "name")!, "Asha Rao");
      setInput(inputs.find((input) => input.autocomplete === "email")!, "asha@example.com");
      setInput(inputs.find((input) => input.autocomplete === "tel")!, "9876543210");
    });
    await act(async () => { button(host, "Save and continue").click(); await Promise.resolve(); });

    expect(mocks.createManualSession).toHaveBeenCalledWith({ name: "Asha Rao", email: "asha@example.com", phone: "9876543210" });
    expect(host.textContent).not.toContain("OTP");
    expect(host.querySelector('[role="dialog"]')).toBeNull();
    await act(async () => root.unmount());
  });
});
