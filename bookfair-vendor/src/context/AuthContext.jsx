import React from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { attachToken } from "../api/client";
import { releaseAllStallHolds } from "../api/stalls";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(()=>localStorage.getItem("token"));
  const [user, setUser] = useState(()=> {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });

  useEffect(()=> {
    attachToken(token);
  }, [token]);

  const persistUser = (userData) => {
    if (!userData) {
      localStorage.removeItem("user");
      setUser(null);
      return;
    }
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const login = (tokenValue, userData) => {
    attachToken(tokenValue);
    setToken(tokenValue);
    localStorage.setItem("token", tokenValue);
    persistUser(userData);
  };

  const logout = async () => {
    try {
      await releaseAllStallHolds();
    } catch (error) {
      console.warn("Failed to release holds during logout", error);
    }
    attachToken(null);  
    setToken(null); setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUser = (updater) => {
    setUser((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...(prev || {}), ...updater };
      if (!next) {
        localStorage.removeItem("user");
        return null;
      }
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo(()=>({ token, user, login, logout, updateUser }), [token, user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
