import { useCallback, useEffect, useState } from "react";
import { api, hasToken } from "./api.js";

const KEY = "beseda:zbirke";
const EVENT = "beseda:zbirke-promjena";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

function mapBackend(z) {
  return { id: `backend-${z.id}`, backendId: z.id, naziv: z.naziv, rijeci: z.rijeci || [], createdAt: new Date(z.created_at).getTime() || Date.now(), backend: true };
}

export function useCollections() {
  const [zbirke, setZbirke] = useState(read);

  useEffect(() => {
    const sync = () => setZbirke(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // sinkronizacija s backendom (ako je korisnik prijavljen)
  useEffect(() => {
    if (!hasToken()) return;
    let aktivno = true;
    (async () => {
      try {
        const d = await api.collections();
        const backend = (d.collections || []).map(mapBackend);
        const local = read();
        // merge: backend ima prednost za isti naziv
        const merged = [...local];
        for (const b of backend) {
          const idx = merged.findIndex((z) => z.naziv === b.naziv);
          if (idx >= 0) {
            // spoji rijeci
            const set = new Set([...merged[idx].rijeci, ...b.rijeci]);
            merged[idx] = { ...merged[idx], rijeci: [...set], backendId: b.backendId };
          } else {
            merged.push(b);
          }
        }
        write(merged);
        if (aktivno) setZbirke(merged);
      } catch {
        // backend nedostupan — radi se lokalno
      }
    })();
    return () => { aktivno = false; };
  }, []);

  const napravi = useCallback((naziv) => {
    const nova = { id: `zbirka-${Date.now()}`, naziv: naziv.trim(), rijeci: [], createdAt: Date.now() };
    write([...read(), nova]);
    // sync to backend
    if (hasToken()) {
      api.createCollection(naziv.trim()).then((d) => {
        // store backend id
        const list = read().map((z) => (z.id === nova.id ? { ...z, backendId: d.collection.id } : z));
        write(list);
      }).catch(() => {});
    }
    return nova;
  }, []);

  const obrisi = useCallback((id) => {
    const z = read().find((x) => x.id === id);
    write(read().filter((z) => z.id !== id));
    if (hasToken() && z?.backendId) {
      // backend delete not implemented as endpoint; skip
    }
  }, []);

  const dodaj = useCallback((zbirkaId, rijecId) => {
    const list = read().map((z) => {
      if (z.id !== zbirkaId) return z;
      if (z.rijeci.includes(rijecId)) return z;
      const nova = { ...z, rijeci: [...z.rijeci, rijecId] };
      if (hasToken() && z.backendId) {
        api.updateCollection(z.backendId, nova.rijeci).catch(() => {});
      }
      return nova;
    });
    write(list);
  }, []);

  const ukloni = useCallback((zbirkaId, rijecId) => {
    const list = read().map((z) => {
      if (z.id !== zbirkaId) return z;
      const nova = { ...z, rijeci: z.rijeci.filter((id) => id !== rijecId) };
      if (hasToken() && z.backendId) {
        api.updateCollection(z.backendId, nova.rijeci).catch(() => {});
      }
      return nova;
    });
    write(list);
  }, []);

  return { zbirke, napravi, obrisi, dodaj, ukloni };
}