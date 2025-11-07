import React from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { attachToken } from "../api/client";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(()=>localStorage.getItem("token"));
  const [user, setUser] = useState(()=> {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });

  useEffect(()=> {
    attachToken(token);
  }, [token]);

  const login = (token, user) => {
    setToken(token); setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = useMemo(()=>({ token, user, login, logout }), [token, user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
