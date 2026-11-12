import { useCallback, useEffect, useState } from "react";

const KEY = "beseda:moje-rijeci";
const EVENT = "beseda:store";

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

export function useUserWords() {
  const [words, setWords] = useState(read);

  useEffect(() => {
    const sync = () => setWords(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const add = useCallback((entry) => {
    const word = {
      ...entry,
      id: `moja-${Date.now()}`,
      moja: true,
      izvor: "tvoj unos",
    };
    write([word, ...read()]);
    return word;
  }, []);

  const remove = useCallback((id) => {
    write(read().filter((w) => w.id !== id));
  }, []);

  return { words, add, remove };
}
