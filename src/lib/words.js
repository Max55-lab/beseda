import { useCallback, useEffect, useState } from "react";
import { useUserWords } from "./store.js";
import { RIJECI } from "../data/rijeci.js";
import { api, hasToken } from "./api.js";

function mapBackend(w) {
  return {
    id: `backend-${w.id}`,
    backendId: w.id,
    rijec: w.rijec,
    izgovor: w.izgovor || w.rijec,
    vrsta: w.vrsta || "",
    znacenje: w.znacenje,
    primjer: w.primjer || "",
    prijevod: w.prijevod || "",
    govorId: w.govor_id || "zagreb",
    tema: w.tema || "svakodnevica",
    izvor: w.izvor || "zajednica (backend)",
    moja: false,
    backend: true,
  };
}

/** Sve riječi: zajednica (demo baza) + backend + ono što je korisnik dodao lokalno. */
export function useAllWords() {
  const { words: moje, add: addLocal, remove } = useUserWords();
  const [backendWords, setBackendWords] = useState([]);

  useEffect(() => {
    let aktivno = true;
    (async () => {
      try {
        const d = await api.words({ status: "approved", limit: 500 });
        if (!aktivno) return;
        setBackendWords((d.words || []).map(mapBackend));
      } catch {
        // backend nedostupan — radi se samo lokalno
      }
    })();
    return () => { aktivno = false; };
  }, []);

  const add = useCallback((entry) => {
    const word = addLocal(entry);
    // sinkronizacija s backendom (fire-and-forget)
    if (hasToken()) {
      api.submitWord({
        rijec: entry.rijec,
        znacenje: entry.znacenje,
        izgovor: entry.izgovor,
        primjer: entry.primjer,
        prijevod: entry.prijevod,
        vrsta: entry.vrsta,
        govor_id: entry.govorId,
        tema: entry.tema,
      }).catch(() => {});
    }
    return word;
  }, [addLocal]);

  // dedup: lokalne i backend riječi ne smiju duplicirati demo bazu
  const demoIds = new Set(RIJECI.map((r) => r.id));
  const zajednicaBackend = backendWords.filter((w) => !RIJECI.some((r) => r.rijec === w.rijec));
  const mojeBezDuplikata = moje.filter((w) => !RIJECI.some((r) => r.rijec === w.rijec) && !backendWords.some((b) => b.rijec === w.rijec));

  return {
    words: [...mojeBezDuplikata, ...zajednicaBackend, ...RIJECI],
    moje,
    add,
    remove,
    backendWords,
  };
}