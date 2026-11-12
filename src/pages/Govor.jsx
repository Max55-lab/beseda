import { Link, useParams } from "react-router-dom";
import CroatiaMap from "../components/CroatiaMap.jsx";
import WordCard from "../components/WordCard.jsx";
import { getGovor, getNarjecje } from "../data/govori.js";
import { useAllWords } from "../lib/words.js";

export default function Govor() {
  const { id } = useParams();
  const { words } = useAllWords();
  const govor = getGovor(id);

  if (!govor) {
    return (
      <div className="page container section">
        <h1 className="h1">Nepoznat govor.</h1>
        <Link to="/karta" className="btn btn-terra">
          Natrag na kartu
        </Link>
      </div>
    );
  }

  const narjecje = getNarjecje(govor.narjecje);
  const rijeci = words.filter((r) => r.govorId === govor.id);
  const teme = [...new Set(rijeci.map((r) => r.tema))];

  return (
    <div className="page container section">
      <nav className="drobne" aria-label="Putanja">
        <Link to="/karta">Karta</Link>
        <span aria-hidden="true">/</span>
        <span>{govor.mjesto}</span>
      </nav>

      <div className="govor-hero">
        <div className="govor-hero-tekst">
          <span className="znacka" style={{ borderColor: narjecje.boja, color: narjecje.boja }}>
            {narjecje.naziv} · {govor.regija}
          </span>
          <h1 className="h1">{govor.mjesto}</h1>
          <p className="lead">{govor.opis}</p>
          <div className="govor-stat">
            <div>
              <span className="brojka-broj">{rijeci.length}</span>
              <span className="brojka-opis">zapisanih riječi</span>
            </div>
            <div>
              <span className="brojka-broj">{teme.length}</span>
              <span className="brojka-opis">tema</span>
            </div>
          </div>
          <Link to={`/dodaj?govor=${govor.id}`} className="btn btn-terra">
            Dodaj riječ iz ovog govora
          </Link>
        </div>

        <div className="govor-hero-karta">
          <CroatiaMap selectedId={govor.id} prikaziLegendu={false} interaktivna={false} prikaziEtikete={false} />
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2 className="h2">Riječi iz govora {govor.mjesto}</h2>
          <Link to="/rjecnik" className="link-strelica">
            Cijeli rječnik →
          </Link>
        </div>
        <div className="word-grid">
          {rijeci.map((rijec, i) => (
            <WordCard key={rijec.id} rijec={rijec} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
