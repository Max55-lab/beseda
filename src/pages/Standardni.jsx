import { useMemo, useState } from "react";
import { STANDARDNE } from "../data/standardne.js";
import { normalize } from "../lib/text.js";

export default function Standardni() {
  const [q, setQ] = useState("");
  const filtrirane = useMemo(() => {
    const needle = normalize(q);
    if (!needle) return STANDARDNE.slice(0, 60);
    return STANDARDNE.filter((r) => normalize(r.rijec + " " + r.znacenje).includes(needle));
  }, [q]);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hr-HR";
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="page container section">
      <div className="page-head">
        <p className="kicker">Standardni rječnik</p>
        <h1 className="h1">Standardne riječi iz Wiktionaryja.</h1>
        <p className="lead lead-uzak">
          {STANDARDNE.length} riječi s definicijama (DBnary / Serbo-Croatian
          Wiktionary, CC BY-SA 4.0). Srodne su hrvatskom, bosanskom i srpskom. Svaka
          riječ može se čuti.
        </p>
      </div>

      <input
        type="search"
        className="filter-pretraga"
        placeholder="Pretraži standardne riječi…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: "100%", marginBottom: 16 }}
      />

      <p className="en-brojka">{filtrirane.length} riječi</p>

      <ul className="en-lista">
        {filtrirane.slice(0, 200).map((r, i) => (
          <li key={i} className="en-red">
            <span className="en-rijec">{r.rijec}</span>
            <span className="en-prijevod">
              <span className="en-znacenje">{r.znacenje}</span>
              <span className="en-znacenje" style={{ background: "transparent", border: 0, color: "var(--muted)" }}>
                {r.vrsta}
              </span>
            </span>
            <button
              type="button"
              className="btn btn-mali btn-ghost"
              onClick={() => speak(r.rijec)}
              aria-label={`Poslušaj ${r.rijec}`}
            >
              🔊
            </button>
          </li>
        ))}
      </ul>
      {filtrirane.length > 200 && (
        <p className="en-uputa">Prikazano prvih 200. Suzi pretragu.</p>
      )}

      <div className="izvor-info">
        <p className="info-kartica-labela">Izvor</p>
        <p>
          Definicije su iz DBnary (Serbo-Croatian Wiktionary), licenca CC BY-SA 4.0.
          Puno (35 000+) riječi dostupno je za preuzimanje i uvoz u zbirke:
        </p>
        <p>
          <a href="/standardni-sve.json" download>
            Preuzmi sve (JSON, 35 000 riječi) ↗
          </a>
        </p>
      </div>
    </div>
  );
}