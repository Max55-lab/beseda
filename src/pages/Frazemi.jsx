import { useMemo, useState } from "react";
import RjecnikNav from "../components/RjecnikNav.jsx";
import { FRAZEMI, frazemLink } from "../data/frazemi.js";
import { normalize } from "../lib/text.js";

export default function Frazemi() {
  const [q, setQ] = useState("");
  const [izdvojen, setIzdvojen] = useState(
    () => FRAZEMI[Math.floor(Math.random() * FRAZEMI.length)]
  );

  const filtrirano = useMemo(() => {
    const needle = normalize(q);
    if (!needle) return FRAZEMI;
    return FRAZEMI.filter((f) =>
      normalize([f.frazem, f.znacenje, f.primjer, f.tema].join(" ")).includes(needle)
    );
  }, [q]);

  return (
    <div className="page container section">
      <RjecnikNav />

      <div className="page-head">
        <p className="kicker">Frazemi</p>
        <h1 className="h1">Riječi koje znače više od riječi.</h1>
        <p className="lead lead-uzak">
          Frazem je izraz koji ne treba shvatiti doslovno. Nauči što znači, kako se
          upotrebljava i odakle dolazi.
        </p>
      </div>

      <article className="frazem-izdvojen">
        <div>
          <p className="kicker">Slučajni frazem</p>
          <h2 className="frazem-izdvojen-naslov">{izdvojen.frazem}</h2>
          <p className="frazem-izdvojen-znacenje">{izdvojen.znacenje}</p>
          <p className="frazem-primjer">„{izdvojen.primjer}”</p>
        </div>
        <div className="frazem-izdvojen-dno">
          <span className="frazem-tema">{izdvojen.tema}</span>
          <button
            type="button"
            className="btn btn-mali btn-terra"
            onClick={() => setIzdvojen(FRAZEMI[Math.floor(Math.random() * FRAZEMI.length)])}
          >
            Drugi frazem
          </button>
        </div>
      </article>

      <div className="pretraga pretraga-velika">
        <span className="pretraga-ikona" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Traži frazem, značenje ili temu…"
          aria-label="Pretraži frazeme"
        />
        {q && (
          <button
            type="button"
            className="btn btn-ghost btn-mali pretraga-ocisti"
            onClick={() => setQ("")}
          >
            Očisti
          </button>
        )}
      </div>

      <div className="rezultati-red">
        <p className="rezultati">
          {filtrirano.length} {filtrirano.length === 1 ? "frazem" : "frazema"}
          {q ? ` za „${q}”` : ""}
        </p>
      </div>

      {filtrirano.length ? (
        <div className="frazemi-lista">
          {filtrirano.map((f) => (
            <article className="frazem" key={f.id}>
              <div className="frazem-vrh">
                <h2 className="frazem-naslov">{f.frazem}</h2>
                <span className="frazem-tema">{f.tema}</span>
              </div>
              <p className="frazem-znacenje">{f.znacenje}</p>
              <p className="frazem-primjer">„{f.primjer}”</p>
              <a
                className="frazem-izvor"
                href={frazemLink(f.frazem)}
                target="_blank"
                rel="noreferrer"
              >
                Provjeri na frazemi.ihjj.hr ↗
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="prazno-stanje">
          <p className="prazno-naslov">Nema rezultata.</p>
          <p>Pokušaj drugu riječ ili pretraži po temi, npr. „posao” ili „sreća”.</p>
        </div>
      )}

      <div className="izvor-info">
        <p className="info-kartica-labela">Izvor</p>
        <p>
          Značenja i primjeri napisani su za ovu aplikaciju prema građi Instituta za
          hrvatski jezik i jezikoslovlje. Svaki frazem možeš provjeriti u{" "}
          <a href="https://frazemi.ihjj.hr/" target="_blank" rel="noreferrer">
            Rječniku frazema
          </a>
          .
        </p>
      </div>
    </div>
  );
}
