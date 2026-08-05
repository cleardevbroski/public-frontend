import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const saveFavoriteProperty = vi.fn(async () => ({ message: "Property saved" }));
  return {
    saveFavoriteProperty,
    fetchFavoritePropertyIds: vi.fn(async () => ({ propertyIds: saveFavoriteProperty.mock.calls.length ? ["507f1f77bcf86cd799439011"] : [] })),
    removeFavoriteProperty: vi.fn(async () => ({ message: "Property removed" })),
  };
});

vi.mock("@/lib/api", () => ({
  fetchFavoritePropertyIds: mocks.fetchFavoritePropertyIds,
  saveFavoriteProperty: mocks.saveFavoriteProperty,
  removeFavoriteProperty: mocks.removeFavoriteProperty,
  hasToken: () => false,
  getMe: vi.fn(),
  removeToken: vi.fn(),
  setToken: vi.fn(),
  submitClientActivityVisit: vi.fn(async () => ({})),
  submitClientActivityEngagement: vi.fn(async () => ({})),
}));

import { AuthProvider, useAuth } from "@/components/acres/AuthContext";
import { FavoritesProvider } from "@/components/acres/FavoritesContext";
import FavoriteButton from "@/components/acres/FavoriteButton";

function Harness() {
  const auth = useAuth();
  return <>
    <button id="login" onClick={() => auth.login({ id: "u1", name: "Meera", phone: "9876543210", email: "" }, "jwt")}>Login test user</button>
    <span id="modal-state">{auth.isAuthModalOpen ? "open" : "closed"}</span>
    <FavoriteButton property={{ id: "507f1f77bcf86cd799439011", title: "Lake Home" }} />
  </>;
}

describe("account favourites", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    localStorage.clear();
    mocks.fetchFavoritePropertyIds.mockClear();
    mocks.saveFavoriteProperty.mockClear();
  });

  it("opens login instead of losing a logged-out favourite click", async () => {
    const host = document.createElement("div"); document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => { root.render(<AuthProvider><FavoritesProvider><Harness /></FavoritesProvider></AuthProvider>); });
    await act(async () => { (host.querySelector('[aria-label="Save property"]') as HTMLButtonElement).click(); });
    expect(host.querySelector("#modal-state")?.textContent).toBe("open");
    expect(mocks.saveFavoriteProperty).not.toHaveBeenCalled();
    await act(async () => { root.unmount(); });
  });

  it("saves the pending property after login and fills the heart", async () => {
    const host = document.createElement("div"); document.body.appendChild(host);
    const root = createRoot(host);
    await act(async () => { root.render(<AuthProvider><FavoritesProvider><Harness /></FavoritesProvider></AuthProvider>); });
    await act(async () => { (host.querySelector('[aria-label="Save property"]') as HTMLButtonElement).click(); });
    await act(async () => { (host.querySelector("#login") as HTMLButtonElement).click(); await Promise.resolve(); await Promise.resolve(); });
    expect(mocks.saveFavoriteProperty).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
    expect(host.querySelector('[aria-label="Remove from saved properties"]')).toBeTruthy();
    await act(async () => { root.unmount(); });
  });
});
