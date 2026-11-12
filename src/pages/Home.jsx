import { Link } from "react-router-dom";
import SearchForm from "../components/SearchForm.jsx";
import PlayButton from "../components/PlayButton.jsx";
import Waveform from "../components/Waveform.jsx";
import WordCard from "../components/WordCard.jsx";
import CroatiaMap from "../components/CroatiaMap.jsx";
import { GOVORI, NARJECJA, getGovor, getNarjecje } from "../data/govori.js";
import { RIJECI } from "../data/rijeci.js";
import { FRAZEMI } from "../data/frazemi.js";
import { wordOfTheDay } from "../lib/text.js";
import { useAllWords } from "../lib/words.js";

export default function Home() {
  const { words } = useAllWords();
  const dnevna = wordOfTheDay(RIJECI);
  const govor = getGovor(dnevna.govorId);
  const narjecje = getNarjecje(govor.narjecje);
  const najnovije = RIJECI.slice(-3).reverse();

  return (
    <div className="page">
      <section className="hero container">
        <div className="hero-tekst">
          <p className="kicker">Audio-rječnik hrvatskih govora</p>
          <h1 className="hero-naslov">
            Rječnik <em>zavičaja</em>
          </h1>
          <p className="lead">
            Svaka riječ ima svoje mjesto, svoj glas i svoju priču. Beseda ih čuva — da ih
            možeš čuti, pronaći na karti i naučiti kroz igru. Otvorena je i onima koji
            hrvatski uče iz cijeloga svijeta.
          </p>

          <SearchForm />

          <div className="hero-cipovi">
            <span className="hero-cipovi-label">Narječja:</span>
            {NARJECJA.map((n) => (
              <Link key={n.id} to={`/rjecnik?narjecje=${n.id}`} className="cip">
                <i style={{ background: n.boja }} aria-hidden="true" />
                {n.naziv}
              </Link>
            ))}
          </div>
        </div>

        <aside className="dnevna-kartica">
          <div className="dnevna-vrh">
            <span className="dnevna-labela">Riječ dana</span>
            <span className="dnevna-mjesto">
              {govor.mjesto} · {narjecje.naziv}
            </span>
          </div>

          <p className="dnevna-rijec">{dnevna.rijec}</p>
          <p className="dnevna-izgovor">[{dnevna.izgovor}]</p>

          <div className="dnevna-zvuk">
            <PlayButton text={dnevna.rijec} label="Poslušaj" />
            <Waveform />
          </div>

          <p className="dnevna-znacenje">{dnevna.znacenje}</p>
          <p className="dnevna-primjer">„{dnevna.primjer}”</p>

          <Link to={`/rjecnik/${dnevna.id}`} className="dnevna-link">
            Otvori riječ →
          </Link>
        </aside>
      </section>

      <section className="container">
        <div className="brojke">
          <div className="brojka">
            <span className="brojka-broj">{GOVORI.length}</span>
            <span className="brojka-opis">mjesta na karti</span>
          </div>
          <div className="brojka">
            <span className="brojka-broj">{words.length}</span>
            <span className="brojka-opis">zapisanih riječi</span>
          </div>
          <div className="brojka">
            <span className="brojka-broj">3</span>
            <span className="brojka-opis">narječja</span>
          </div>
          <div className="brojka brojka-zadnja">
            <span className="brojka-opis">
              Riječi nestaju kad ih nitko više ne izgovori. Ovdje ostaju zapisane.
            </span>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <div>
            <p className="kicker">Karta govora</p>
            <h2 className="h2">Gdje se govori kako?</h2>
          </div>
          <Link to="/karta" className="link-strelica">
            Otvori punu kartu →
          </Link>
        </div>

        <div className="karta-pregled">
          <CroatiaMap interaktivna={false} prikaziLegendu={false} prikaziEtikete={false} />
          <ul className="mjesta-lista">
            {GOVORI.slice(0, 6).map((g) => {
              const n = getNarjecje(g.narjecje);
              return (
                <li key={g.id}>
                  <Link to={`/govor/${g.id}`}>
                    <span className="mjesto-ime">{g.mjesto}</span>
                    <span className="mjesto-meta">
                      <i style={{ background: n.boja }} aria-hidden="true" />
                      {n.naziv} · {RIJECI.filter((r) => r.govorId === g.id).length} riječi
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <div>
            <p className="kicker">Iz rječnika</p>
            <h2 className="h2">Nove riječi</h2>
          </div>
          <Link to="/rjecnik" className="link-strelica">
            Sve riječi →
          </Link>
        </div>
        <div className="word-grid">
          {najnovije.map((rijec, i) => (
            <WordCard key={rijec.id} rijec={rijec} index={i} />
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <div>
            <p className="kicker">Za učenje</p>
            <h2 className="h2">Hrvatski za svijet.</h2>
          </div>
          <p className="en-brojka">
            7 337 prijevoda · {FRAZEMI.length} frazema
          </p>
        </div>
        <div className="ponuda">
          <Link to="/usporedba" className="ponuda-kartica">
            <span className="ponuda-oznaka">Usporedba</span>
            <h3 className="ponuda-naslov">Ista tema, različiti govori</h3>
            <p className="ponuda-opis">
              Kako se ista stvar kaže u Slavoniji, na otocima ili u Herzegovini?
              Pretraži riječ ili filtriraj po temi.
            </p>
            <span className="link-strelica">Otvori usporedbu →</span>
          </Link>

          <Link to="/engleski" className="ponuda-kartica">
            <span className="ponuda-oznaka">Engleski → hrvatski</span>
            <h3 className="ponuda-naslov">Rječnik za strance</h3>
            <p className="ponuda-opis">
              Upiši englesku riječ i pronađi hrvatski prijevod. Više od sedam tisuća
              parova, abecedni pregled i pretraga na oba jezika.
            </p>
            <span className="link-strelica">Otvori engleski rječnik →</span>
          </Link>

          <Link to="/frazemi" className="ponuda-kartica ponuda-kartica-tamna">
            <span className="ponuda-oznaka">Frazemi</span>
            <h3 className="ponuda-naslov">Riječi koje znače više</h3>
            <p className="ponuda-opis">
              „Baciti rukavicu”, „biti na konju”, „pasti s Marsa” — nauči što znače i kako
              se upotrebljavaju u svakodnevnom govoru.
            </p>
            <span className="link-strelica">Otvori frazeme →</span>
          </Link>

          <Link to="/kartice" className="ponuda-kartica">
            <span className="ponuda-oznaka">Kartice</span>
            <h3 className="ponuda-naslov">Flash-kartice za pamćenje</h3>
            <p className="ponuda-opis">
              Ponavljanje s razmakom: što bolje znaš, rjeđe se ponavlja. Sve se pamti u
              ovom pregledniku.
            </p>
            <span className="link-strelica">Otvori kartice →</span>
          </Link>
        </div>
      </section>

      <section className="container">
        <div className="cta">
          <div>
            <p className="kicker kicker-svijetli">Dopuni rječnik</p>
            <h2 className="h2 h2-svijetli">Znaš riječ koju nitko ne zapisuje?</h2>
            <p className="cta-tekst">
              Dodaj je u dvije minute: napiši značenje, primjer rečenice i odakle je. Tvoja
              riječ ostaje u rječniku ovog preglednika.
            </p>
          </div>
          <Link to="/dodaj" className="btn btn-svijetli">
            Dodaj riječ
          </Link>
        </div>
      </section>
    </div>
  );
}
