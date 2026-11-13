import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { RIJECI } from "../data/rijeci.js";
import { GOVORI } from "../data/govori.js";

const BASE = "https://beseda.onrender.com";

const STATIC = {
  "/": {
    title: "Beseda — rječnik zavičaja",
    description:
      "Audio-rječnik hrvatskih mjesnih govora. Čuj, nađi i nauči riječi zavičaja — na karti, kroz kviz i flash-kartice.",
  },
  "/karta": {
    title: "Karta govora — Beseda",
    description:
      "Interaktivna karta hrvatskih govora u Hrvatskoj i Bosni i Hercegovini. Pronađi svoj zavičaj i poslušaj riječi.",
  },
  "/rjecnik": {
    title: "Rječnik zavičajnih riječi — Beseda",
    description:
      "Pretraži 47 zavičajnih riječi iz čakavskog, kajkavskog i štokavskog narječja. Značenja, primjeri i izgovor.",
  },
  "/frazemi": {
    title: "Frazemi — Beseda",
    description:
      "Hrvatski frazemi i idiomi s objašnjenjima i primjerima upotrebe u svakodnevnom govoru.",
  },
  "/engleski": {
    title: "Englesko-hrvatski rječnik — Beseda",
    description:
      "Više od 7 000 englesko-hrvatskih parova za učenje hrvatskog jezika. Pretraga na oba jezika.",
  },
  "/standardni": {
    title: "Standardni hrvatski rječnik — Beseda",
    description:
      "Preko 3 000 standardnih hrvatskih riječi s izgovorom i primjerima, iz otvorenih jezičnih izvora.",
  },
  "/kviz": {
    title: "Kviz o zavičajnim riječima — Beseda",
    description:
      "Provjeri znanje zavičajnih riječi kroz kviz sa značenjima, mjestima i prijevodima.",
  },
  "/usporedba": {
    title: "Usporedba govora — Beseda",
    description:
      "Kako se ista stvar kaže u Slavoniji, na otocima ili u Hercegovini? Usporedi riječi po temama.",
  },
  "/kartice": {
    title: "Flash-kartice — Beseda",
    description:
      "Uči zavičajne riječi ponavljanjem s razmakom. Kartice pamte tvoj napredak u pregledniku.",
  },
  "/zajednica": {
    title: "Zajednica — Beseda",
    description:
      "Dodaj svoju riječ, glasaj za tuđe i pomozi da se zavičajni govori sačuvaju.",
  },
  "/podaci": {
    title: "Otvoreni podaci — Beseda",
    description:
      "Preuzmi rječnik zavičajnih riječi u JSON ili CSV formatu. Slobodni podaci za učenje i istraživanje.",
  },
  "/statistika": {
    title: "Statistika učenja — Beseda",
    description:
      "Prati koje si riječi pogledao, kako rješavaš kvizove i koliko napreduješ.",
  },
  "/zbirke": {
    title: "Moje zbirke — Beseda",
    description:
      "Spremi omiljene riječi u zbirke, izvezi ih ili podijeli poveznicom.",
  },
  "/dodaj": {
    title: "Dodaj riječ — Beseda",
    description:
      "Znaš zavičajnu riječ koju nitko ne zapisuje? Dodaj je u rječnik u nekoliko minuta.",
  },
};

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
}

function titleFor(pathname) {
  const clean = decodeURIComponent(pathname.replace(/\/+$/, "") || "/");

  if (STATIC[clean]) return STATIC[clean];

  const rijecMatch = clean.match(/^\/rjecnik\/([^/]+)$/);
  if (rijecMatch) {
    const rijec = RIJECI.find((r) => r.id === rijecMatch[1]);
    if (rijec) {
      return {
        title: `${rijec.rijec} — ${rijec.znacenje} | Beseda`,
        description: `Što znači ${rijec.rijec}? ${rijec.znacenje}. Primjer: ${rijec.primjer}`,
      };
    }
  }

  const govorMatch = clean.match(/^\/govor\/([^/]+)$/);
  if (govorMatch) {
    const govor = GOVORI.find((g) => g.id === govorMatch[1]);
    if (govor) {
      return {
        title: `Govor ${govor.mjesto} — Beseda`,
        description: `${govor.mjesto} (${govor.regija}): ${govor.opis} Poslušaj riječi i upoznaj govor.`,
      };
    }
  }

  return {
    title: "Stranica nije pronađena — Beseda",
    description: "Ova stranica još ne postoji. Vrati se na početnu i nastavi istraživati.",
  };
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const { title, description } = titleFor(pathname);
    const url = `${BASE}${pathname === "/" ? "/" : pathname.replace(/\/+$/, "")}`;

    document.title = title;
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: "index, follow, max-image-preview:large",
    });
    upsertMeta('link[rel="canonical"]', { rel: "canonical", href: url });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
  }, [pathname]);

  return null;
}
