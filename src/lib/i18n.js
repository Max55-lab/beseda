import { useEffect, useState } from "react";

export const SUPPORTED = [
  "hr", "bs", "sr", "en", "de", "es", "fr", "it", "pt", "ru", "tr", "pl", "cs",
  "sk", "sl", "hu", "ro", "bg", "uk", "nl", "sv", "ar", "zh", "ja", "ko", "hi",
  "id", "th", "vi", "fa", "ur", "el",
];

let cache = {};
let currentLang = (typeof localStorage !== "undefined" && localStorage.getItem("beseda:lang")) || "hr";

export function getLang() { return currentLang; }

export async function loadLang(lang) {
  if (!SUPPORTED.includes(lang)) lang = "en";
  if (cache[lang]) { currentLang = lang; return cache[lang]; }
  try {
    const res = await fetch(`/i18n/${lang}.json`);
    const data = await res.json();
    cache[lang] = data;
    currentLang = lang;
    if (typeof localStorage !== "undefined") localStorage.setItem("beseda:lang", lang);
    return data;
  } catch {
    if (lang !== "en") return loadLang("en");
    return {};
  }
}

export function t(key) {
  const dict = cache[currentLang] || cache.hr || cache.en || {};
  if (dict[key]) return dict[key];
  // fallback to hr, then en
  if (cache.hr && cache.hr[key]) return cache.hr[key];
  if (cache.en && cache.en[key]) return cache.en[key];
  return key;
}

export function useI18n() {
  const [lang, setLang] = useState(currentLang);
  const [dict, setDict] = useState(cache[currentLang] || {});
  useEffect(() => {
    loadLang(lang).then((d) => setDict(d));
  }, [lang]);
  const changeLang = (l) => {
    loadLang(l).then((d) => { setLang(l); setDict(d); });
  };
  return { lang, dict, t, changeLang, SUPPORTED };
}