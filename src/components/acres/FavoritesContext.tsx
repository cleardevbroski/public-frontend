"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchFavoritePropertyIds, removeFavoriteProperty, saveFavoriteProperty } from "@/lib/api";
import { useAuth } from "./AuthContext";

type FavoritesContextValue = {
  favoriteIds: ReadonlySet<string>;
  loadingIds: ReadonlySet<string>;
  isLoading: boolean;
  error: string;
  toggleFavorite: (propertyId: string) => Promise<"saved" | "removed" | "login_required">;
  refreshFavorites: () => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, setIsAuthModalOpen } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [pendingAfterLogin, setPendingAfterLogin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchFavoritePropertyIds();
      setFavoriteIds(new Set(Array.isArray(data.propertyIds) ? data.propertyIds.map(String) : []));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load saved properties");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { void refreshFavorites(); }, [refreshFavorites]);

  const setLoading = (propertyId: string, active: boolean) => setLoadingIds((current) => {
    const next = new Set(current);
    if (active) next.add(propertyId); else next.delete(propertyId);
    return next;
  });

  const save = useCallback(async (propertyId: string) => {
    setLoading(propertyId, true);
    setError("");
    setFavoriteIds((current) => new Set(current).add(propertyId));
    try {
      await saveFavoriteProperty(propertyId);
    } catch (cause) {
      setFavoriteIds((current) => { const next = new Set(current); next.delete(propertyId); return next; });
      const message = cause instanceof Error ? cause.message : "Unable to save property";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(propertyId, false);
    }
  }, []);

  useEffect(() => {
    if (!user || !pendingAfterLogin) return;
    const propertyId = pendingAfterLogin;
    setPendingAfterLogin(null);
    void save(propertyId).then(refreshFavorites).catch(() => undefined);
  }, [pendingAfterLogin, refreshFavorites, save, user]);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) {
      setPendingAfterLogin(propertyId);
      setIsAuthModalOpen(true);
      return "login_required" as const;
    }
    if (loadingIds.has(propertyId)) return favoriteIds.has(propertyId) ? "saved" as const : "removed" as const;
    if (!favoriteIds.has(propertyId)) {
      await save(propertyId);
      return "saved" as const;
    }
    setLoading(propertyId, true);
    setError("");
    setFavoriteIds((current) => { const next = new Set(current); next.delete(propertyId); return next; });
    try {
      await removeFavoriteProperty(propertyId);
      return "removed" as const;
    } catch (cause) {
      setFavoriteIds((current) => new Set(current).add(propertyId));
      const message = cause instanceof Error ? cause.message : "Unable to remove saved property";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(propertyId, false);
    }
  };

  const value = useMemo(() => ({ favoriteIds, loadingIds, isLoading, error, toggleFavorite, refreshFavorites }), [error, favoriteIds, isLoading, loadingIds, refreshFavorites]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
}

export function useOptionalFavorites() {
  return useContext(FavoritesContext);
}
