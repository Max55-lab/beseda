import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCollections } from "../lib/collections.js";
import { useAllWords } from "../lib/words.js";

function preuzmi(naziv, sadrzaj) {
  const blob = new Blob([sadrzaj], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = naziv;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Zbirke() {
  const { zbirke, obrisi, ukloni, napravi, dodaj } = useCollections();
  const { words } = useAllWords();
  const [potvrda, setPotvrda] = useState(null);
  const [poruka, setPoruka] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // uvoz iz dijeljene poveznice
  useEffect(() => {
    const imp = searchParams.get("import");
    if (!imp) return;
    try {
      const data = JSON.parse(atob(imp));
      if (data?.naziv && Array.isArray(data.rijeci)) {
        const nova = napravi(data.naziv || "Uvezena zbirka");
        data.rijeci.forEach((id) => dodaj(nova.id, id));
        setPoruka(`Uvezena zbirka „${data.naziv}” (${data.rijeci.length} riječi).`);
      }
    } catch {
      setPoruka("Poveznica za uvoz nije valjana.");
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, napravi, dodaj, setSearchParams]);

  const izveziSve = () => {
    preuzmi("beseda-zbirke.json", JSON.stringify(zbirke, null, 2));
    setPoruka("Zbirke izvezene.");
  };

  const uveziDatoteku = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const lista = Array.isArray(data) ? data : [data];
        let broj = 0;
        for (const z of lista) {
          if (z?.naziv) {
            const nova = napravi(z.naziv);
            (z.rijeci || []).forEach((id) => dodaj(nova.id, id));
            broj++;
          }
        }
        setPoruka(`Uvezeno ${broj} zbirki.`);
      } catch {
        setPoruka("Datoteka nije valjana JSON.");
      }
    };
    reader.readAsText(file);
  };

  const dijeli = (zbirka) => {
    const payload = btoa(
      JSON.stringify({ naziv: zbirka.naziv, rijeci: zbirka.rijeci })
    );
    const base =
      window.location.protocol === "file:"
        ? `${window.location.href.replace(/[?#].*$/, "")}#/zbirke`
        : `${window.location.origin}/zbirke`;
    const url = `${base}?import=${payload}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setPoruka("Poveznica kopirana u međuspremnik.");
    } else {
      prompt("Kopiraj poveznicu:", url);
    }
  };

  return (
    <div className="page container section">
      <div className="page-head">
        <p className="kicker">Zbirke</p>
        <h1 className="h1">Tvoje male zbirke riječi.</h1>
        <p className="lead lead-uzak">
          Spremi riječi koje želiš zapamtiti — za seminar, za obitelj ili zato što su ti
          jednostavno drage. Zbirke se pamte u ovom pregledniku.
        </p>
      </div>

      <div className="zbirke-alati">
        <button type="button" className="btn btn-ghost" onClick={izveziSve}>
          Izvezi sve (JSON)
        </button>
        <label className="btn btn-ghost" style={{ cursor: "pointer" }}>
          Uvezi iz datoteke
          <input
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.[0]) uveziDatoteku(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {poruka && <p className="en-uputa">{poruka}</p>}

      {!zbirke.length ? (
        <div className="prazno-stanje">
          <p className="prazno-naslov">Još nemaš nijednu zbirku.</p>
          <p>Otvori neku riječ i klikni „Spremi u zbirku”.</p>
          <Link to="/rjecnik" className="btn btn-terra">
            Idi na rječnik
          </Link>
        </div>
      ) : (
        <div className="zbirke-lista">
          {zbirke.map((zbirka) => {
            const rijeci = zbirka.rijeci
              .map((id) => words.find((w) => w.id === id))
              .filter(Boolean);

            return (
              <section key={zbirka.id} className="zbirka">
                <div className="zbirka-vrh">
                  <div>
                    <h2 className="zbirka-naslov">{zbirka.naziv}</h2>
                    <p className="zbirka-meta">
                      {rijeci.length} {rijeci.length === 1 ? "riječ" : "riječi"}
                    </p>
                  </div>
                  <div className="zbirke-gumbi">
                    <button
                      type="button"
                      className="btn btn-mali btn-ghost"
                      onClick={() => dijeli(zbirka)}
                    >
                      Podijeli
                    </button>
                    <button
                      type="button"
                      className="btn btn-mali btn-ghost"
                      onClick={() =>
                        preuzmi(
                          `${zbirka.naziv}.json`,
                          JSON.stringify(zbirka, null, 2)
                        )
                      }
                    >
                      Izvezi
                    </button>
                    {potvrda === zbirka.id ? (
                      <span className="zbirka-potvrda">
                        Obrisati?
                        <button type="button" onClick={() => obrisi(zbirka.id)}>
                          Da
                        </button>
                        <button type="button" onClick={() => setPotvrda(null)}>
                          Ne
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="zbirka-brisi"
                        onClick={() => setPotvrda(zbirka.id)}
                      >
                        Obriši
                      </button>
                    )}
                  </div>
                </div>

                {rijeci.length ? (
                  <ul className="zbirka-rijeci">
                    {rijeci.map((rijec) => (
                      <li key={rijec.id}>
                        <Link to={`/rjecnik/${rijec.id}`}>
                          <span className="zbirka-rijec">{rijec.rijec}</span>
                          <span className="zbirka-znacenje">{rijec.znacenje}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => ukloni(zbirka.id, rijec.id)}
                          aria-label={`Ukloni ${rijec.rijec} iz zbirke`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="zbirka-prazno">
                    Zbirka je prazna — dodaj riječi iz rječnika.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}