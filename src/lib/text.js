/** Uklanja dijakritike i normalizira tekst za pretragu. */
export function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Vraća riječ dana — ista za cijeli dan, mijenja se svaki dan. */
export function wordOfTheDay(rijeci) {
  if (!rijeci.length) return null;
  const day = Math.floor(Date.now() / 86400000);
  return rijeci[day % rijeci.length];
}

export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
