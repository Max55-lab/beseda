import { useCallback, useEffect, useState } from "react";
import { getToken, getUser, setAuth, clearAuth, fetchMe } from "./auth.js";

export function useAuth() {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      fetchMe().then((u) => { setUser(u); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const d = await (await import("./api.js")).api.login(username, password);
    setAuth(d.token, d.user);
    setUser(d.user);
    return d;
  }, []);

  const register = useCallback(async (username, password) => {
    const d = await (await import("./api.js")).api.register(username, password);
    setAuth(d.token, d.user);
    setUser(d.user);
    return d;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, isLoggedIn: !!user };
}