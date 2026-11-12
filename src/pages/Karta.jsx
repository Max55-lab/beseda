import { useState } from "react";
import { Link } from "react-router-dom";
import CroatiaMap from "../components/CroatiaMap.jsx";
import PlayButton from "../components/PlayButton.jsx";
import { getGovor, getNarjecje, GOVORI } from "../data/govori.js";
import { useAllWords } from "../lib/words.js";

export default function Karta() {
  const { words } = useAllWords();
  const [odabran, setOdabran] = useState("nerezisca");
  const [geoStatus, setGeoStatus] = useState("");
  const govor = getGovor(odabran);
  const narjecje = getNarjecje(govor.narjecje);
  const rijeci = words.filter((r) => r.govorId === odabran);

  return (
    <div className="page container section">
      <div className="page-head">
        <p className="kicker">Karta govora</p>
        <h1 className="h1">Klikni na mjesto i poslušaj kako se tamo govori.</h1>
        <p className="lead lead-uzak">
          Za sada je na karti {words.length} riječi iz četrnaest govora — uključujući hrvatska
          mjesta u Bosni i Hercegovini. Karta raste sa svakim novim unosom.
        </p>
        <p className="karta-uputa">
          Kotačićem ili gumbima zumiraj kartu, a povlačenjem je pomiči. Klikni na pin za
          riječi iz tog mjesta.
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: 12 }}
          onClick={() => {
            if (!navigator.geolocation) {
              setGeoStatus("Geolokacija nije dostupna u ovom pregledniku.");
              return;
            }
            setGeoStatus("Tražim tvoju lokaciju…");
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords;
                let najblizi = GOVORI[0];
                let najmanja = Infinity;
                for (const g of GOVORI) {
                  const R = 6371;
                  const dLat = ((g.lat - latitude) * Math.PI) / 180;
                  const dLng = ((g.lng - longitude) * Math.PI) / 180;
                  const a =
                    Math.sin(dLat / 2) ** 2 +
                    Math.cos((latitude * Math.PI) / 180) *
                      Math.cos((g.lat * Math.PI) / 180) *
                      Math.sin(dLng / 2) ** 2;
                  const d = 2 * R * Math.asin(Math.sqrt(a));
                  if (d < najmanja) {
                    najmanja = d;
                    najblizi = g;
                  }
                }
                setOdabran(najblizi.id);
                setGeoStatus(
                  `Najbliži govor: ${najblizi.mjesto} (${Math.round(najmanja)} km).`
                );
              },
              () => setGeoStatus("Nije moguće dohvatiti lokaciju.")
            );
          }}
        >
          Pronađi moj govor
        </button>
        {geoStatus && <p className="en-uputa">{geoStatus}</p>}
      </div>

      <div className="karta-layout">
        <div className="karta-stupac">
          <CroatiaMap selectedId={odabran} onSelect={setOdabran} />
        </div>

        <aside className="govor-panel" aria-live="polite">
          <div className="govor-panel-vrh">
            <span className="znacka" style={{ borderColor: narjecje.boja, color: narjecje.boja }}>
              {narjecje.naziv}
            </span>
            <span className="govor-regija">{govor.regija}</span>
          </div>

          <h2 className="govor-naslov">{govor.mjesto}</h2>
          <p className="govor-opis">{govor.opis}</p>

          <div className="govor-brojevi">
            <span>
              <strong>{rijeci.length}</strong> riječi
            </span>
            <span>
              <strong>{new Set(rijeci.map((r) => r.tema)).size}</strong> tema
            </span>
          </div>

          <ul className="rijeci-lista">
            {rijeci.map((rijec) => (
              <li key={rijec.id}>
                <div>
                  <Link to={`/rjecnik/${rijec.id}`} className="rijeci-lista-rijec">
                    {rijec.rijec}
                  </Link>
                  <span className="rijeci-lista-znacenje">{rijec.znacenje}</span>
                </div>
                <PlayButton text={rijec.rijec} label="Poslušaj" />
              </li>
            ))}
            {!rijeci.length && <li className="prazno">Još nema riječi iz ovog mjesta.</li>}
          </ul>

          <div className="govor-panel-dno">
            <Link to={`/govor/${govor.id}`} className="link-strelica">
              Profil govora →
            </Link>
            <Link to={`/dodaj?govor=${govor.id}`} className="btn btn-mali btn-terra">
              Dodaj riječ
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
