import { useMemo } from "react";
import { Link } from "react-router-dom";
import { RIJECI } from "../data/rijeci.js";
import { GOVORI, getGovor } from "../data/govori.js";
import { dohvatiStatistiku, obrisiStatistiku } from "../lib/stats.js";

export default function Statistika() {
  const s = dohvatiStatistiku();
  const kviz = s.kviz || [];
  const pogledane = s.pogledane || {};

  const ukupnoBodova = kviz.reduce((a, k) => a + (k.bodovi || 0), 0);
  const ukupnoPitanja = kviz.reduce((a, k) => a + (k.ukupno || 0), 0);
  const prosjek =
    ukupnoPitanja > 0 ? Math.round((ukupnoBodova / ukupnoPitanja) * 100) : 0;

  const najcesce = useMemo(
    () =>
      Object.entries(pogledane)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([id, n]) => ({ rijec: RIJECI.find((r) => r.id === id), n })),
    [pogledane]
  );

  const poGovoru = useMemo(() => {
    const mapa = {};
    for (const id of Object.keys(pogledane)) {
      const r = RIJECI.find((x) => x.id === id);
      if (!r) continue;
      mapa[r.govorId] = (mapa[r.govorId] || 0) + pogledane[id];
    }
    return Object.entries(mapa)
      .map(([id, n]) => ({ govor: GOVORI.find((g) => g.id === id), n }))
      .filter((x) => x.govor)
      .sort((a, b) => b.n - a.n);
  }, [pogledane]);

  return (
    <div className="page container section">
      <div className="page-head">
        <p className="kicker">Statistika</p>
        <h1 className="h1">Tvoje učenje.</h1>
        <p className="lead lead-uzak">
          Sve se pamti samo u ovom pregledniku. Nema računa, nema servera.
        </p>
      </div>

      <div className="brojke">
        <div className="brojka">
          <span className="brojka-broj">{Object.keys(pogledane).length}</span>
          <span className="brojka-opis">riječi pogledano</span>
        </div>
        <div className="brojka">
          <span className="brojka-broj">{kviz.length}</span>
          <span className="brojka-opis">odigranih kvizova</span>
        </div>
        <div className="brojka">
          <span className="brojka-broj">{prosjek}%</span>
          <span className="brojka-opis">točnost u kvizu</span>
        </div>
        <div className="brojka brojka-zadnja">
          <span className="brojka-opis">
            {Object.values(stanjeKartice()).filter((k) => k.reps > 0).length} riječi
            u flash-karticama
          </span>
        </div>
      </div>

      {najcesce.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <p className="kicker">Najčešće gledane</p>
              <h2 className="h2">Riječi koje te zanimaju.</h2>
            </div>
          </div>
          <ul className="usporedba-lista">
            {najcesce.map(({ rijec, n }) =>
              rijec ? (
                <li key={rijec.id} className="usporedba-red">
                  <div className="usporedba-rijec">
                    <Link to={`/rjecnik/${rijec.id}`} className="usporedba-naslov">
                      {rijec.rijec}
                    </Link>
                  </div>
                  <div className="usporedba-detalji">
                    <span className="usporedba-mjesto">
                      {getGovor(rijec.govorId)?.mjesto}
                    </span>
                    <span className="usporedba-znacenje">
                      {n} {n === 1 ? "put" : "puta"}
                    </span>
                  </div>
                </li>
              ) : null
            )}
          </ul>
        </section>
      )}

      {poGovoru.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <p className="kicker">Po govoru</p>
              <h2 className="h2">Gdje ti je pažnja.</h2>
            </div>
          </div>
          <ul className="mjesta-lista">
            {poGovoru.map(({ govor, n }) => (
              <li key={govor.id}>
                <Link to={`/govor/${govor.id}`}>
                  <span className="mjesto-ime">{govor.mjesto}</span>
                  <span className="mjesto-meta">{n} pregleda</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {kviz.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <p className="kicker">Povijest kviza</p>
              <h2 className="h2">Zadnji rezultati.</h2>
            </div>
          </div>
          <ul className="usporedba-lista">
            {kviz.slice(0, 10).map((k, i) => (
              <li key={i} className="usporedba-red">
                <div className="usporedba-rijec">
                  <span className="usporedba-naslov">
                    {k.bodovi}/{k.ukupno}
                  </span>
                </div>
                <div className="usporedba-detalji">
                  <span className="usporedba-mjesto">{k.tip || "značenje"}</span>
                  <span className="usporedba-znacenje">
                    {new Date(k.datum).toLocaleDateString("hr-HR")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="kviz-akcije" style={{ marginTop: 32 }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            if (confirm("Obrisati svu statistiku?")) {
              obrisiStatistiku();
              window.location.reload();
            }
          }}
        >
          Obriši statistiku
        </button>
        <Link to="/kartice" className="btn btn-terra">
          Flash-kartice
        </Link>
      </div>
    </div>
  );
}

function stanjeKartice() {
  try {
    return JSON.parse(localStorage.getItem("beseda:kartice") || "{}");
  } catch {
    return {};
  }
}