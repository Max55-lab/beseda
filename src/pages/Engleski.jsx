import { useMemo, useState, useEffect } from "react";
import RjecnikNav from "../components/RjecnikNav.jsx";
import { ENGLESKI } from "../data/engleski.js";
import { normalize, shuffle } from "../lib/text.js";

const SLOVA = "abcdefghijklmnopqrstuvwxyz".split("");

export default function Engleski() {
  const [q, setQ] = useState("");
  const [slovo, setSlovo] = useState("");
  const [limit, setLimit] = useState(80);
  const [slucajne] = useState(() => shuffle(ENGLESKI).slice(0, 12));

  const filtrirano = useMemo(() => {
    const needle = normalize(q);
    return ENGLESKI.filter(([en, hr]) => {
      if (slovo && !en.startsWith(slovo)) return false;
      if (!needle) return true;
      return normalize(en).includes(needle) || normalize(hr).includes(needle);
    });
  }, [q, slovo]);

  const pretrazuje = Boolean(q.trim() || slovo);

  const odaberiSlovo = (s) => {
    setSlovo((prije) => (prije === s ? "" : s));
    setLimit(80);
  };

  const promijeniUpit = (vrijednost) => {
    setQ(vrijednost);
    setLimit(80);
  };

  return (
    <div className="page container section">
      <RjecnikNav />

      <div className="page-head">
        <p className="kicker">Engleski → hrvatski</p>
        <h1 className="h1">Hrvatski za cijeli svijet.</h1>
        <p className="lead lead-uzak">
          Upiši englesku riječ i pronađi hrvatski prijevod. Možeš tražiti i na hrvatskom
          pa vidjeti kako se kaže na engleskom.
        </p>
      </div>

      <div className="pretraga pretraga-velika">
        <span className="pretraga-ikona" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => promijeniUpit(e.target.value)}
          placeholder="npr. house, water, learn…"
          aria-label="Pretraži englesko-hrvatski rječnik"
          autoFocus
        />
        {q && (
          <button
            type="button"
            className="btn btn-ghost btn-mali pretraga-ocisti"
            onClick={() => promijeniUpit("")}
          >
            Očisti
          </button>
        )}
      </div>

      <div className="filteri filteri-slova">
        <div className="filteri-skupina">
          <span className="filteri-label">Slovo</span>
          <button
            type="button"
            className={`cip ${!slovo ? "je-odabran" : ""}`}
            onClick={() => {
              setSlovo("");
              setLimit(80);
            }}
          >
            Sva
          </button>
          {SLOVA.map((s) => (
            <button
              key={s}
              type="button"
              className={`cip cip-slovo ${slovo === s ? "je-odabran" : ""}`}
              onClick={() => odaberiSlovo(s)}
              aria-pressed={slovo === s}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {pretrazuje ? (
        <>
          <div className="rezultati-red">
            <p className="rezultati">
              {filtrirano.length} {filtrirano.length === 1 ? "prijevod" : "prijevoda"}
              {q.trim() ? ` za „${q.trim()}”` : ""}
              {slovo ? ` na slovo ${slovo.toUpperCase()}` : ""}
            </p>
            {(q || slovo) && (
              <button
                type="button"
                className="btn btn-ghost btn-mali"
                onClick={() => {
                  setQ("");
                  setSlovo("");
                  setLimit(80);
                }}
              >
                Očisti sve
              </button>
            )}
          </div>

          {filtrirano.length ? (
            <>
              <ul className="en-lista">
                {filtrirano.slice(0, limit).map(([en, hr]) => (
                  <li className="en-red" key={en}>
                    <span className="en-rijec">{en}</span>
                    <span className="en-prijevod">
                      {hr.split("; ").map((prijevod) => (
                        <span className="en-znacenje" key={prijevod}>
                          {prijevod}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>

              {filtrirano.length > limit && (
                <div className="en-vise">
                  <button
                    type="button"
                    className="btn btn-terra"
                    onClick={() => setLimit((l) => l + 80)}
                  >
                    Prikaži još 80
                  </button>
                  <span>
                    prikazano {Math.min(limit, filtrirano.length)} od {filtrirano.length}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="prazno-stanje">
              <p className="prazno-naslov">Nema prijevoda.</p>
              <p>Pokušaj drugu riječ, kraći oblik ili provjeri pravopis.</p>
            </div>
          )}

          {q.trim() && (
            <div className="izvori-red">
              <span>Provjeri još</span>
              <a
                href={`https://rjecnik.hr/search.php?q=${encodeURIComponent(q.trim())}`}
                target="_blank"
                rel="noreferrer"
              >
                rjecnik.hr ↗
              </a>
              <a
                href={`https://pravopis.hr/rjecnik/?q=${encodeURIComponent(q.trim())}`}
                target="_blank"
                rel="noreferrer"
              >
                pravopis.hr ↗
              </a>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="section-head section-head-usko">
            <div>
              <p className="kicker">Za početak</p>
              <h2 className="h3">Slučajne riječi</h2>
            </div>
            <p className="en-brojka">{ENGLESKI.length.toLocaleString("hr-HR")} parova</p>
          </div>
          <ul className="en-lista en-lista-mreza">
            {slucajne.map(([en, hr]) => (
              <li className="en-red" key={en}>
                <span className="en-rijec">{en}</span>
                <span className="en-prijevod">
                  {hr.split("; ").map((prijevod) => (
                    <span className="en-znacenje" key={prijevod}>
                      {prijevod}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <p className="en-uputa">
            ili odaberi slovo iznad i pregledaj rječnik abecedno.
          </p>
        </>
      )}

      <div className="izvor-info">
        <p className="info-kartica-labela">Izvor i licencija</p>
        <p>
          Englesko-hrvatski parovi obrađeni su iz projekta{" "}
          <a
            href="https://github.com/gigaly/rjecnik-hrvatskih-jezika"
            target="_blank"
            rel="noreferrer"
          >
            Rječnik hrvatskih jezika
          </a>{" "}
          (dr. Goran Igaly, GPL-3.0). Popis je skraćen na riječi koje se najčešće uče, a
          redoslijed prijevoda određen je pomoću frekvencijskog popisa.
        </p>
        <p className="izvor-napomena">
          Prijevodi su automatski obrađeni i mogu imati više značenja. Za provjeru uvijek
          pogledaj rjecnik.hr ili pravopis.hr.
        </p>
      </div>
    </div>
  );
}
