import { api } from "./api.js";

const TOKEN_KEY = "beseda:token";
const USER_KEY = "beseda:user";

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function getUser() {
  try { const raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function setAuth(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user)); else localStorage.removeItem(USER_KEY);
  } catch {}
}

export function clearAuth() {
  setAuth(null, null);
}

export function isLoggedIn() {
  return !!getToken();
}

export async function login(username, password) {
  const d = await api.login(username, password);
  setAuth(d.token, d.user);
  return d;
}

export async function register(username, password) {
  const d = await api.register(username, password);
  setAuth(d.token, d.user);
  return d;
}

export async function fetchMe() {
  try {
    const d = await api.me();
    setAuth(getToken(), d.user);
    return d.user;
  } catch {
    clearAuth();
    return null;
  }
}

export function logout() {
  clearAuth();
}