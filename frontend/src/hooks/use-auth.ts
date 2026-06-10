import { useEffect, useState, useCallback } from "react";
import { clearAuth, getStoredUser, getToken, type User } from "@/lib/api";

interface JwtPayload { exp?: number; role?: string; email?: string; sub?: string }

function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch { return null; }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getToken());

  useEffect(() => {
    const refresh = () => {
      setUser(getStoredUser());
      setToken(getToken());
    };
    window.addEventListener("bzc-auth-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("bzc-auth-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const payload = decodeJwt(token);
  const expired = payload?.exp ? payload.exp * 1000 < Date.now() : false;
  const role = (user?.role ?? payload?.role) as "admin" | "user" | undefined;
  const isAuthenticated = Boolean(token && !expired);
  const isAdmin = isAuthenticated && role === "admin";

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  return { user, token, isAuthenticated, isAdmin, role, logout };
}

