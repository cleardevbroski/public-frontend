"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getMe, removeToken, hasToken, setToken } from "@/lib/api";

export type UserProfile = {
  id?: string;
  phone: string;
  name: string;
  email: string;
  role?: string;
};

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (userData: UserProfile, token: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileDrawerOpen: boolean;
  setIsProfileDrawerOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // On mount, check if we have a valid JWT and fetch user profile
  useEffect(() => {
    async function restoreSession() {
      if (!hasToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        // Token is invalid or expired — clear it
        removeToken();
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = (userData: UserProfile, token: string) => {
    setToken(token);
    setUser(userData);
    // Also store in localStorage for quick hydration
    localStorage.setItem("cleartitle_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    removeToken();
    localStorage.removeItem("cleartitle_user");
    setIsProfileDrawerOpen(false);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("cleartitle_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      login, 
      logout, 
      updateProfile, 
      isAuthModalOpen, 
      setIsAuthModalOpen,
      isProfileDrawerOpen,
      setIsProfileDrawerOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
