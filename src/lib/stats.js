// Jednostavna statistika učenja — sprema se u localStorage (samo u ovom pregledniku).
const KLJUC = "beseda:statistika";

function ucitaj() {
  try {
    const raw = localStorage.getItem(KLJUC);
    return raw ? JSON.parse(raw) : { kviz: [], pogledane: {} };
  } catch {
    return { kviz: [], pogledane: {} };
  }
}

function spremi(stanje) {
  try {
    localStorage.setItem(KLJUC, JSON.stringify(stanje));
  } catch {
    // ignoriraj (npr. puno localStorage)
  }
}

export function zabiljeziKviz(rezultat) {
  const s = ucitaj();
  s.kviz = [rezultat, ...s.kviz].slice(0, 50);
  spremi(s);
}

export function zabiljeziRijec(id) {
  const s = ucitaj();
  s.pogledane[id] = (s.pogledane[id] || 0) + 1;
  spremi(s);
}

export function dohvatiStatistiku() {
  return ucitaj();
}

export function obrisiStatistiku() {
  try {
    localStorage.removeItem(KLJUC);
  } catch {
    // ignoriraj
  }
}