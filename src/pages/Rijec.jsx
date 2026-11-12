import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CroatiaMap from "../components/CroatiaMap.jsx";
import PlayButton from "../components/PlayButton.jsx";
import Waveform from "../components/Waveform.jsx";
import WordCard from "../components/WordCard.jsx";
import RjecnikNav from "../components/RjecnikNav.jsx";
import { getGovor, getNarjecje } from "../data/govori.js";
import { ZNACENJA_EN } from "../data/rijeci.js";
import { useCollections } from "../lib/collections.js";
import { useAllWords } from "../lib/words.js";
import { zabiljeziRijec } from "../lib/stats.js";
import {
  podrzavaSnimanje,
  snimiIzgovor,
  dohvatiSnimke,
  obrisiSnimku,
} from "../lib/audio.js";

export default function Rijec() {
  const { id } = useParams();
  const { words } = useAllWords();
  const { zbirke, napravi, dodaj } = useCollections();
  const [nova, setNova] = useState("");
  const [poruka, setPoruka] = useState("");
  const rijec = words.find((r) => r.id === id);

  useEffect(() => {
    if (rijec) zabiljeziRijec(rijec.id);
  }, [rijec]);

  if (!rijec) {
    return (
      <div className="page container section">
        <p className="kicker">Rječnik</p>
        <h1 className="h1">Ova riječ još nije zapisana.</h1>
        <p className="lead">Možda je vrijeme da je dodaš ti.</p>
        <Link to="/dodaj" className="btn btn-terra">
          Dodaj riječ
        </Link>
      </div>
    );
  }

  const govor = getGovor(rijec.govorId);
  const narjecje = getNarjecje(govor?.narjecje);
  const povezane = words
    .filter((r) => r.govorId === rijec.govorId && r.id !== rijec.id)
    .slice(0, 3);

  const [snimke, setSnimke] = useState([]);
  const [snima, setSnima] = useState(false);
  const [audioUrls, setAudioUrls] = useState({});
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    let aktivno = true;
    dohvatiSnimke(rijec.id)
      .then((s) => {
        if (aktivno) setSnimke(s);
      })
      .catch(() => {});
    return () => {
      aktivno = false;
    };
  }, [rijec.id]);

  useEffect(() => {
    const urls = {};
    for (const s of snimke) {
      urls[s.id] = URL.createObjectURL(s.blob);
    }
    setAudioUrls(urls);
    return () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [snimke]);

  const zapocniSnimanje = async () => {
    if (!podrzavaSnimanje()) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (blob.size > 0) {
          await snimiIzgovor(rijec.id, blob);
          const s = await dohvatiSnimke(rijec.id);
          setSnimke(s);
        }
        setSnima(false);
      };
      recorderRef.current = mr;
      mr.start();
      setSnima(true);
    } catch {
      setSnima(false);
    }
  };

  const zaustaviSnimanje = () => {
    recorderRef.current?.stop();
  };

  const obrisiSnimkuLokalno = async (id) => {
    await obrisiSnimku(id);
    const s = await dohvatiSnimke(rijec.id);
    setSnimke(s);
  };

  const spremiU = (zbirka) => {
    dodaj(zbirka.id, rijec.id);
    setPoruka(`Spremljeno u „${zbirka.naziv}”.`);
  };

  const napraviZbirku = (e) => {
    e.preventDefault();
    const naziv = nova.trim();
    if (!naziv) return;
    const zbirka = napravi(naziv);
    dodaj(zbirka.id, rijec.id);
    setNova("");
    setPoruka(`Spremljeno u „${naziv}”.`);
  };

  return (
    <div className="page container section">
      <nav className="drobne" aria-label="Putanja">
        <Link to="/rjecnik">Rječnik</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/govor/${govor.id}`}>{govor.mjesto}</Link>
        <span aria-hidden="true">/</span>
        <span>{rijec.rijec}</span>
      </nav>

      <RjecnikNav />

      <div className="rijec-layout">
        <article className="rijec-glavno">
          <div className="rijec-vrh">
            <div>
              <p className="rijec-mjesto">
                <i style={{ background: narjecje.boja }} aria-hidden="true" />
                {govor.mjesto} · {narjecje.naziv} · {rijec.tema}
              </p>
              <h1 className="rijec-naslov">{rijec.rijec}</h1>
              <p className="rijec-izgovor">[{rijec.izgovor}] · {rijec.vrsta}</p>
            </div>
            <div className="rijec-zvuk">
              <PlayButton text={rijec.rijec} label="Poslušaj izgovor" size="veliki" />
              <Waveform bars={16} />
            </div>
          </div>

          <div className="rijec-blok">
            <p className="rijec-labela">Značenje</p>
            <p className="rijec-znacenje">{rijec.znacenje}</p>
          </div>

          <blockquote className="rijec-primjer">
            <p>„{rijec.primjer}”</p>
            {rijec.prijevod && <footer>Standardno: {rijec.prijevod}</footer>}
          </blockquote>

          <dl className="rijec-meta">
            <div>
              <dt>Govor</dt>
              <dd>
                <Link to={`/govor/${govor.id}`}>{govor.mjesto}</Link>
              </dd>
            </div>
            <div>
              <dt>Narječje</dt>
              <dd>{narjecje.naziv}</dd>
            </div>
            {ZNACENJA_EN[rijec.id] && (
              <div>
                <dt>Engleski</dt>
                <dd>{ZNACENJA_EN[rijec.id]}</dd>
              </div>
            )}
            <div>
              <dt>Izvor</dt>
              <dd>{rijec.izvor}</dd>
            </div>
          </dl>

          <div className="izvori-red">
            <span>Provjeri</span>
            <a
              href={`https://pravopis.hr/rjecnik/?q=${encodeURIComponent(rijec.rijec)}`}
              target="_blank"
              rel="noreferrer"
            >
              pravopis.hr ↗
            </a>
            <a
              href={`https://rjecnik.hr/search.php?q=${encodeURIComponent(rijec.rijec)}`}
              target="_blank"
              rel="noreferrer"
            >
              rjecnik.hr ↗
            </a>
            <a
              href={`https://frazemi.ihjj.hr/search/?q=${encodeURIComponent(rijec.rijec)}`}
              target="_blank"
              rel="noreferrer"
            >
              frazemi.ihjj.hr ↗
            </a>
            <a
              href={`https://bs.wiktionary.org/wiki/${encodeURIComponent(rijec.rijec)}`}
              target="_blank"
              rel="noreferrer"
            >
              bs.wiktionary ↗
            </a>
            <a
              href={`https://sr.wiktionary.org/wiki/${encodeURIComponent(rijec.rijec)}`}
              target="_blank"
              rel="noreferrer"
            >
              sr.wiktionary ↗
            </a>
          </div>

          <div className="snimke-blok">
            <p className="rijec-labela">Snimke izgovora</p>
            {!podrzavaSnimanje() ? (
              <p className="forma-napomena">
                Snimanje nije podržano u ovom pregledniku.
              </p>
            ) : (
              <>
                <div className="snimke-akcije">
                  {!snima ? (
                    <button type="button" className="btn btn-terra" onClick={zapocniSnimanje}>
                      ● Snimi izgovor
                    </button>
                  ) : (
                    <button type="button" className="btn btn-ink" onClick={zaustaviSnimanje}>
                      ■ Zaustavi
                    </button>
                  )}
                  {snima && <span className="snimke-status">Snimanje…</span>}
                </div>
                {snimke.length > 0 ? (
                  <ul className="snimke-lista">
                    {snimke.map((s) => (
                      <li key={s.id} className="snimke-red">
                        <audio controls src={audioUrls[s.id]} preload="none" />
                        <button
                          type="button"
                          className="zbirka-brisi"
                          onClick={() => obrisiSnimkuLokalno(s.id)}
                          aria-label="Obriši snimku"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="forma-napomena">
                    Još nema snimki. Snimi prvi izgovor.
                  </p>
                )}
              </>
            )}
          </div>

          {rijec.moja && (
            <p className="napomena">
              Ovo je tvoj unos — spremljen je samo u ovom pregledniku.
            </p>
          )}
        </article>

        <aside className="rijec-aside">
          <div className="mini-karta">
            <CroatiaMap selectedId={govor.id} prikaziLegendu={false} interaktivna={false} prikaziEtikete={false} />
          </div>
          <div className="info-kartica">
            <p className="info-kartica-labela">Gdje se govori</p>
            <p className="info-kartica-naslov">{govor.mjesto}</p>
            <p className="info-kartica-opis">{govor.opis}</p>
            <Link to={`/karta`} className="link-strelica">
              Vidi na karti →
            </Link>
          </div>

          <div className="spremi-zbirka">
            <p className="info-kartica-labela">Spremi u zbirku</p>

            {zbirke.length > 0 && (
              <div className="zbirka-cipovi">
                {zbirke.map((zbirka) => {
                  const ima = zbirka.rijeci.includes(rijec.id);
                  return (
                    <button
                      key={zbirka.id}
                      type="button"
                      className={ima ? "je-spremljena" : ""}
                      onClick={() => !ima && spremiU(zbirka)}
                      disabled={ima}
                    >
                      {ima ? "✓ " : "+ "}
                      {zbirka.naziv}
                    </button>
                  );
                })}
              </div>
            )}

            <form className="zbirka-forma" onSubmit={napraviZbirku}>
              <input
                value={nova}
                onChange={(e) => setNova(e.target.value)}
                placeholder="Nova zbirka…"
                aria-label="Naziv nove zbirke"
              />
              <button type="submit" className="btn btn-mali btn-ink">
                Spremi
              </button>
            </form>

            {poruka && <p className="zbirka-poruka">{poruka}</p>}

            <Link to="/zbirke" className="link-strelica">
              Sve zbirke →
            </Link>
          </div>
        </aside>
      </div>

      {povezane.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="h3">Još iz govora {govor.mjesto}</h2>
            <Link to={`/govor/${govor.id}`} className="link-strelica">
              Sve riječi →
            </Link>
          </div>
          <div className="word-grid">
            {povezane.map((r, i) => (
              <WordCard key={r.id} rijec={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
