import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RIJECI } from "../data/rijeci.js";
import { GOVORI, getGovor, getNarjecje } from "../data/govori.js";
import { normalize as normaliziraj } from "../lib/text.js";
import PlayButton from "../components/PlayButton.jsx";

export default function Usporedba() {
  const [upit, setUpit] = useState("");
  const [tema, setTema] = useState("sve");

  const teme = useMemo(
    () => ["sve", ...Array.from(new Set(RIJECI.map((r) => r.tema))).sort()],
    []
  );

  const filtrirane = useMemo(() => {
    const q = normaliziraj(upit);
    return RIJECI.filter((r) => {
      if (tema !== "sve" && r.tema !== tema) return false;
      if (!q) return true;
      return (
        normaliziraj(r.rijec).includes(q) ||
        normaliziraj(r.znacenje).includes(q) ||
        normaliziraj(getGovor(r.govorId)?.mjesto || "").includes(q)
      );
    });
  }, [upit, tema]);

  // grupiraj po temi za pregled "ista tema, različiti govori"
  const poTemama = useMemo(() => {
    const grupe = {};
    for (const r of RIJECI) {
      (grupe[r.tema] = grupe[r.tema] || []).push(r);
    }
    return Object.entries(grupe).sort(([a], [b]) => a.localeCompare(b, "hr"));
  }, []);

  return (
    <div className="page container section">
      <div className="page-head">
        <p className="kicker">Usporedba</p>
        <h1 className="h1">Ista tema, različiti govori.</h1>
        <p className="lead lead-uzak">
          Kako se ista stvar kaže u Slavoniji, na otocima ili u Herzegovini? Pretraži
          riječ ili filtriraj po temi i usporedi.
        </p>
      </div>

      <div className="filteri">
        <input
          type="search"
          className="filter-pretraga"
          placeholder="Pretraži riječ, značenje ili mjesto…"
          value={upit}
          onChange={(e) => setUpit(e.target.value)}
        />
        <div className="filteri-teme">
          {teme.map((t) => (
            <button
              key={t}
              type="button"
              className={`cip ${tema === t ? "je-aktivan" : ""}`}
              onClick={() => setTema(t)}
            >
              {t === "sve" ? "Sve teme" : t}
            </button>
          ))}
        </div>
      </div>

      {upit || tema !== "sve" ? (
        <ul className="usporedba-lista">
          {filtrirane.map((r) => {
            const govor = getGovor(r.govorId);
            const narjecje = getNarjecje(govor?.narjecje);
            return (
              <li key={r.id} className="usporedba-red">
                <div className="usporedba-rijec">
                  <Link to={`/rjecnik/${r.id}`} className="usporedba-naslov">
                    {r.rijec}
                  </Link>
                  <span className="usporedba-izgovor">[{r.izgovor}]</span>
                  <PlayButton text={r.rijec} label="Poslušaj" />
                </div>
                <div className="usporedba-detalji">
                  <span
                    className="znacka"
                    style={{ borderColor: narjecje?.boja, color: narjecje?.boja }}
                  >
                    {narjecje?.naziv}
                  </span>
                  <span className="usporedba-mjesto">{govor?.mjesto}</span>
                  <span className="usporedba-znacenje">{r.znacenje}</span>
                </div>
              </li>
            );
          })}
          {!filtrirane.length && (
            <li className="prazno">Nema riječi za ovaj filter.</li>
          )}
        </ul>
      ) : (
        <div className="usporedba-teme">
          {poTemama.map(([t, rijeci]) => (
            <section key={t} className="usporedba-tema">
              <h2 className="h3">{t}</h2>
              <div className="usporedba-mreza">
                {rijeci.map((r) => {
                  const govor = getGovor(r.govorId);
                  const narjecje = getNarjecje(govor?.narjecje);
                  return (
                    <Link key={r.id} to={`/rjecnik/${r.id}`} className="usporedba-kartica">
                      <span className="usporedba-kartica-rijec">{r.rijec}</span>
                      <span className="usporedba-kartica-znacenje">{r.znacenje}</span>
                      <span className="usporedba-kartica-mjesto">
                        <i style={{ background: narjecje?.boja }} aria-hidden="true" />
                        {govor?.mjesto}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}