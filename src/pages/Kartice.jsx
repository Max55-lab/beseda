import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RIJECI } from "../data/rijeci.js";
import { getGovor, getNarjecje } from "../data/govori.js";
import PlayButton from "../components/PlayButton.jsx";

const KLJUC = "beseda:kartice";

function ucitaj() {
  try {
    return JSON.parse(localStorage.getItem(KLJUC) || "{}");
  } catch {
    return {};
  }
}

function spremi(stanje) {
  try {
    localStorage.setItem(KLJUC, JSON.stringify(stanje));
  } catch {
    // ignoriraj
  }
}

function azuriraj(kartica, tocnoc) {
  const danas = Date.now();
  const dan = 86400000;
  if (!tocnoc) {
    return { interval: 1, ease: Math.max(1.3, (kartica?.ease || 2.5) - 0.2), due: danas + dan, reps: 0 };
  }
  const ease = (kartica?.ease || 2.5) + 0.1;
  const interval = Math.max(1, Math.round((kartica?.interval || 1) * ease));
  return { interval, ease, due: danas + interval * dan, reps: (kartica?.reps || 0) + 1 };
}

export default function Kartice() {
  const [stanje, setStanje] = useState(ucitaj);
  const [pokazi, setPokazi] = useState(false);
  const [gotovo, setGotovo] = useState(false);

  const danas = Date.now();
  const due = useMemo(
    () => RIJECI.filter((r) => !stanje[r.id] || stanje[r.id].due <= danas),
    [stanje, danas]
  );
  const nova = due[0] || null;

  const odgovori = (tocno) => {
    if (!nova) return;
    const novaKartica = azuriraj(stanje[nova.id], tocnoc);
    const novoStanje = { ...stanje, [nova.id]: novaKartica };
    setStanje(novoStanje);
    spremi(novoStanje);
    setPokazi(false);
    if (due.length <= 1) setGotovo(true);
  };

  if (gotovo || !nova) {
    const nauceno = Object.values(stanje).filter((k) => k.reps > 0).length;
    return (
      <div className="page container section">
        <div className="page-head">
          <p className="kicker">Kartice</p>
          <h1 className="h1">Sve za danas je gotovo.</h1>
          <p className="lead lead-uzak">
            Naučeno riječi: {nauceno} od {RIJECI.length}. Vrati se sutra — algoritam će
            ponoviti one koje treba.
          </p>
        </div>
        <div className="kviz-akcije">
          <button
            type="button"
            className="btn btn-terra"
            onClick={() => {
              setGotovo(false);
              setStanje(ucitaj());
            }}
          >
            Ponovno
          </button>
          <Link to="/rjecnik" className="btn btn-ghost">
            Natrag u rječnik
          </Link>
        </div>
      </div>
    );
  }

  const govor = getGovor(nova.govorId);
  const narjecje = getNarjecje(govor?.narjecje);

  return (
    <div className="page container section">
      <div className="page-head">
        <p className="kicker">Kartice · ponavljanje</p>
        <h1 className="h1">Flash-kartice za pamćenje.</h1>
        <p className="lead lead-uzak">
          Preostalo za danas: {due.length} od {RIJECI.length}. Klikni na karticu da
          otkriješ značenje.
        </p>
      </div>

      <div className="kartica-flash" onClick={() => setPokazi(true)}>
        <p className="kartica-mjesto">
          {govor?.mjesto} · {narjecje?.naziv}
        </p>
        <p className="kartica-rijec">{nova.rijec}</p>
        <p className="kartica-izgovor">[{nova.izgovor}]</p>
        <PlayButton text={nova.rijec} label="Poslušaj" />
        {pokazi ? (
          <div className="kartica-odgovor">
            <p className="kartica-znacenje">{nova.znacenje}</p>
            <p className="kartica-primjer">„{nova.primjer}”</p>
          </div>
        ) : (
          <p className="kartica-uputa">Klikni za odgovor.</p>
        )}
      </div>

      {pokazi && (
        <div className="kartica-akcije">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => odgovori(false)}
          >
            Ne znam
          </button>
          <button
            type="button"
            className="btn btn-terra"
            onClick={() => odgovori(true)}
          >
            Znam
          </button>
        </div>
      )}
    </div>
  );
}