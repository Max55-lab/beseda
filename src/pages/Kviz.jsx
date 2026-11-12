import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { RIJECI } from "../data/rijeci.js";
import { getGovor } from "../data/govori.js";
import { shuffle } from "../lib/text.js";
import { zabiljeziKviz } from "../lib/stats.js";

let ENGLESKI_CACHE = null;
async function getEngleski() {
  if (ENGLESKI_CACHE) return ENGLESKI_CACHE;
  const m = await import("../data/engleski.js");
  ENGLESKI_CACHE = m.ENGLESKI;
  return ENGLESKI_CACHE;
}

const BROJ_PITANJA = 8;

function napraviPitanja(tip, tezina, seed, engleski) {
  const brojOpcija = tezina === "lako" ? 3 : tezina === "teško" ? 5 : 4;
  const odabrane = shuffle(RIJECI).slice(0, BROJ_PITANJA);
  return odabrane.map((rijec) => {
    let pitanje, tocno, opcije;
    if (tip === "mjesto") {
      pitanje = `Iz kojeg je mjesta riječ „${rijec.rijec}"?`;
      tocno = getGovor(rijec.govorId)?.mjesto;
      const pogresni = shuffle(
        RIJECI.map((r) => getGovor(r.govorId)?.mjesto).filter(
          (m, i, a) => m && m !== tocno && a.indexOf(m) === i
        )
      ).slice(0, brojOpcija - 1);
      opcije = shuffle([tocno, ...pogresni]);
    } else if (tip === "engleski" && engleski && engleski.length) {
      const en = engleski.find((e) => e[1]?.toLowerCase().includes(rijec.rijec.toLowerCase()));
      if (en) {
        pitanje = `Kako se engleski kaže „${rijec.rijec}"?`;
        tocno = en[0];
        const pogresni = shuffle(
          engleski.map((e) => e[0]).filter((w) => w !== tocno)
        ).slice(0, brojOpcija - 1);
        opcije = shuffle([tocno, ...pogresni]);
      } else {
        pitanje = `Što znači riječ „${rijec.rijec}"?`;
        tocno = rijec.znacenje;
        const pogresni = shuffle(
          RIJECI.filter((r) => r.id !== rijec.id && r.znacenje !== rijec.znacenje)
        )
          .slice(0, brojOpcija - 1)
          .map((r) => r.znacenje);
        opcije = shuffle([rijec.znacenje, ...pogresni]);
      }
    } else {
      pitanje = `Što znači riječ „${rijec.rijec}"?`;
      tocno = rijec.znacenje;
      const pogresni = shuffle(
        RIJECI.filter((r) => r.id !== rijec.id && r.znacenje !== rijec.znacenje)
      )
        .slice(0, brojOpcija - 1)
        .map((r) => r.znacenje);
      opcije = shuffle([rijec.znacenje, ...pogresni]);
    }
    return {
      id: rijec.id,
      rijec: rijec.rijec,
      mjesto: getGovor(rijec.govorId)?.mjesto,
      pitanje,
      tocno,
      opcije,
      seed,
    };
  });
}

export default function Kviz() {
  const [tip, setTip] = useState("znacenje");
  const [tezina, setTezina] = useState("srednje");
  const [seed, setSeed] = useState(0);
  const [engleski, setEngleski] = useState(null);
  const pitanja = useMemo(() => napraviPitanja(tip, tezina, seed, engleski), [tip, tezina, seed, engleski]);
  const [korak, setKorak] = useState(0);
  const [odabrano, setOdabrano] = useState(null);
  const [bodovi, setBodovi] = useState(0);

  useEffect(() => {
    getEngleski().then((e) => setEngleski(e));
  }, []);

  const pitanje = pitanja[korak];
  const zadnje = korak === pitanja.length - 1;
  const gotovo = korak >= pitanja.length;

  const odgovori = (opcija) => {
    if (odabrano) return;
    setOdabrano(opcija);
    if (opcija === pitanje.tocno) setBodovi((b) => b + 1);
  };

  const dalje = () => {
    setOdabrano(null);
    setKorak((k) => k + 1);
  };

  const ponovi = () => {
    setSeed((s) => s + 1);
    setKorak(0);
    setOdabrano(null);
    setBodovi(0);
  };

  const novaIgra = () => {
    setSeed((s) => s + 1);
    setKorak(0);
    setOdabrano(null);
    setBodovi(0);
  };

  if (gotovo) {
    const postotak = Math.round((bodovi / pitanja.length) * 100);
    const poruka =
      postotak === 100
        ? "Bez greške. Ovo je tvoj zavičaj."
        : postotak >= 60
          ? "Vrlo dobro — još malo do savršenstva."
          : "Dobra vježba. Rječnik je tu da se vraćaš.";
    zabiljeziKviz({ datum: Date.now(), bodovi, ukupno: pitanja.length, tip });
    const tekstDijeljenja = `Beseda kviz: ${bodovi}/${pitanja.length} (${tip}, ${tezina})`;
    return (
      <div className="page container section kviz">
        <div className="kviz-rezultat">
          <p className="kicker">Rezultat</p>
          <p className="kviz-bodovi">
            {bodovi}<span>/{pitanja.length}</span>
          </p>
          <p className="kviz-poruka">{poruka}</p>
          <div className="kviz-akcije">
            <button type="button" className="btn btn-terra" onClick={ponovi}>
              Igraj ponovno
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "Beseda kviz", text: tekstDijeljenja });
                } else {
                  navigator.clipboard?.writeText(tekstDijeljenja);
                  alert("Rezultat kopiran u međuspremnik.");
                }
              }}
            >
              Podijeli rezultat
            </button>
            <Link to="/rjecnik" className="btn btn-ghost">
              Natrag u rječnik
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page container section kviz">
      <div className="page-head">
        <p className="kicker">Kviz</p>
        <h1 className="h1">Pogodi odgovor.</h1>
        <p className="lead">
          Osam riječi iz različitih govora. Odaberi tip pitanja i težinu.
        </p>
      </div>

      <div className="filteri" style={{ marginBottom: 24 }}>
        <div className="filteri-teme">
          {[
            ["znacenje", "Značenje"],
            ["mjesto", "Mjesto"],
            ["engleski", "Engleski"],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              className={`cip ${tip === v ? "je-aktivan" : ""}`}
              onClick={() => {
                setTip(v);
                novaIgra();
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="filteri-teme" style={{ marginTop: 8 }}>
          {[
            ["lako", "Lako (3)"],
            ["srednje", "Srednje (4)"],
            ["teško", "Teško (5)"],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              className={`cip ${tezina === v ? "je-aktivan" : ""}`}
              onClick={() => {
                setTezina(v);
                novaIgra();
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="kviz-status">
        <span>
          Pitanje {korak + 1} / {pitanja.length}
        </span>
        <span>{bodovi} bodova</span>
      </div>
      <div className="kviz-traka" aria-hidden="true">
        <i style={{ width: `${((korak + (odabrano ? 1 : 0)) / pitanja.length) * 100}%` }} />
      </div>

      <div className="kviz-kartica">
        <p className="kviz-mjesto">{pitanje.mjesto}</p>
        <p className="kviz-rijec">{pitanje.rijec}</p>
        <p className="kviz-pitanje">{pitanje.pitanje}</p>

        <div className="kviz-opcije">
          {pitanje.opcije.map((opcija) => {
            const jeTocna = opcija === pitanje.tocno;
            const jeOdabrana = opcija === odabrano;
            let klasa = "kviz-opcija";
            if (odabrano) {
              if (jeTocna) klasa += " je-tocna";
              else if (jeOdabrana) klasa += " je-netocna";
              else klasa += " je-ugasena";
            }
            return (
              <button
                key={opcija}
                type="button"
                className={klasa}
                onClick={() => odgovori(opcija)}
                disabled={Boolean(odabrano)}
              >
                {opcija}
              </button>
            );
          })}
        </div>

        {odabrano && (
          <div className="kviz-povratna">
            <p>
              {odabrano === pitanje.tocno
                ? "Točno."
                : `Netočno — točan odgovor je: ${pitanje.tocno}.`}
            </p>
            <button type="button" className="btn btn-ink" onClick={dalje}>
              {zadnje ? "Prikaži rezultat" : "Sljedeće pitanje"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}