import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import WordCard from "../components/WordCard.jsx";
import SearchForm from "../components/SearchForm.jsx";
import RjecnikNav from "../components/RjecnikNav.jsx";
import { NARJECJA, TEME, getGovor } from "../data/govori.js";
import { normalize } from "../lib/text.js";
import { useAllWords } from "../lib/words.js";

export default function Rjecnik() {
  const { words } = useAllWords();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const narjecje = params.get("narjecje") || "";
  const tema = params.get("tema") || "";

  const filtrirano = useMemo(() => {
    const needle = normalize(q);
    return words.filter((rijec) => {
      const govor = getGovor(rijec.govorId);
      if (narjecje && govor?.narjecje !== narjecje) return false;
      if (tema && rijec.tema !== tema) return false;
      if (!needle) return true;
      const haystack = normalize(
        [rijec.rijec, rijec.znacenje, rijec.primjer, govor?.mjesto, govor?.regija].join(" ")
      );
      return haystack.includes(needle);
    });
  }, [words, q, narjecje, tema]);

  const postavi = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  return (
    <div className="page container section">
      <RjecnikNav />
      <div className="page-head page-head-sa-pretragom">
        <div>
          <p className="kicker">Rječnik</p>
          <h1 className="h1">Sve riječi na jednom mjestu.</h1>
          <p className="lead">
            Pretraži po riječi, značenju ili mjestu. Filtriraj po narječju i temi.
          </p>
        </div>
        <SearchForm key={q} initial={q} veliki={false} />
      </div>

      <div className="filteri">
        <div className="filteri-skupina">
          <span className="filteri-label">Narječje</span>
          <button
            type="button"
            className={`cip ${!narjecje ? "je-odabran" : ""}`}
            onClick={() => postavi("narjecje", "")}
          >
            Sva
          </button>
          {NARJECJA.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`cip ${narjecje === n.id ? "je-odabran" : ""}`}
              onClick={() => postavi("narjecje", narjecje === n.id ? "" : n.id)}
            >
              <i style={{ background: n.boja }} aria-hidden="true" />
              {n.naziv}
            </button>
          ))}
        </div>

        <div className="filteri-skupina">
          <span className="filteri-label">Tema</span>
          <button
            type="button"
            className={`cip ${!tema ? "je-odabran" : ""}`}
            onClick={() => postavi("tema", "")}
          >
            Sve
          </button>
          {TEME.map((t) => (
            <button
              key={t}
              type="button"
              className={`cip ${tema === t ? "je-odabran" : ""}`}
              onClick={() => postavi("tema", tema === t ? "" : t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rezultati-red">
        <p className="rezultati">
          {filtrirano.length} {filtrirano.length === 1 ? "riječ" : "riječi"}
          {q ? ` za „${q}”` : ""}
        </p>
        {(q || narjecje || tema) && (
          <button
            type="button"
            className="btn btn-ghost btn-mali"
            onClick={() => setParams({}, { replace: true })}
          >
            Očisti filtre
          </button>
        )}
      </div>

      {filtrirano.length ? (
        <div className="word-grid">
          {filtrirano.map((rijec, i) => (
            <WordCard key={rijec.id} rijec={rijec} index={i} />
          ))}
        </div>
      ) : (
        <div className="prazno-stanje">
          <p className="prazno-naslov">Nema rezultata.</p>
          <p>Pokušaj drugu riječ ili dodaj ovu u rječnik.</p>
          <Link className="btn btn-terra" to="/dodaj">
            Dodaj riječ
          </Link>
        </div>
      )}
    </div>
  );
}
