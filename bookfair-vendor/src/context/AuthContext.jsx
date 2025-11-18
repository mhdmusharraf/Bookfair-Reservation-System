import React from 'react'
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../api/client";
import { releaseAllStallHolds } from "../api/stalls";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser ?? null);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!active) return;
        persistUser(data);
      } catch {
        if (!active) return;
        persistUser(null);
      } finally {
        if (active) setIsAuthenticating(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [persistUser]);

  const login = useCallback((userData) => {
    persistUser(userData);
  }, [persistUser]);

  const logout = useCallback(async () => {
    try {
      await releaseAllStallHolds();
    } catch (error) {
      console.warn("Failed to release holds during logout", error);
    }
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Failed to terminate session", error);
    }
    persistUser(null);
  }, [persistUser]);

  const updateUser = useCallback((updater) => {
    setUser((prev) => {
      const nextValue =
        typeof updater === "function"
          ? updater(prev)
          : prev
          ? { ...prev, ...updater }
          : updater;
      return nextValue ?? null;
    });
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, updateUser, isAuthenticating }),
    [user, login, logout, updateUser, isAuthenticating]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
