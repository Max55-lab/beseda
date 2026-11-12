// Klijent za Beseda backend (zajednički podaci, računi, uredništvo).
// Backend mora biti pokrenut na localhost:3002.
const BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + "/api" : "/api";

function token() {
  try { return localStorage.getItem("beseda:token"); } catch { return null; }
}

async function req(path, opts = {}) {
  const t = token();
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(BASE + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // auth
  register: (username, password) => req("/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }),
  login: (username, password) => req("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  me: () => req("/auth/me"),
  // words
  words: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req("/words" + (qs ? "?" + qs : ""));
  },
  word: (id) => req(`/words/${id}`),
  submitWord: (data) => req("/words", { method: "POST", body: JSON.stringify(data) }),
  setStatus: (id, status) => req(`/words/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteWord: (id) => req(`/words/${id}`, { method: "DELETE" }),
  // collections
  collections: () => req("/collections"),
  createCollection: (naziv) => req("/collections", { method: "POST", body: JSON.stringify({ naziv }) }),
  updateCollection: (id, rijeci) => req(`/collections/${id}`, { method: "PATCH", body: JSON.stringify({ rijeci }) }),
  // stats
  stats: () => req("/stats"),
};

export function setToken(t) {
  try { if (t) localStorage.setItem("beseda:token", t); else localStorage.removeItem("beseda:token"); } catch {}
}

export function hasToken() {
  return !!token();
}