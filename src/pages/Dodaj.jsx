import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GOVORI, TEME, getGovor, getNarjecje } from "../data/govori.js";
import { useAllWords } from "../lib/words.js";

const prazan = {
  rijec: "",
  izgovor: "",
  znacenje: "",
  primjer: "",
  prijevod: "",
  vrsta: "imenica, ž.",
  govorId: "nerezisca",
  tema: "svakodnevica",
};

export default function Dodaj() {
  const [params] = useSearchParams();
  const { moje, add, remove } = useAllWords();
  const [form, setForm] = useState(() => ({
    ...prazan,
    govorId: getGovor(params.get("govor")) ? params.get("govor") : prazan.govorId,
  }));
  const [greske, setGreske] = useState({});
  const [dodano, setDodano] = useState(null);
  const [bulk, setBulk] = useState("");
  const [bulkPoruka, setBulkPoruka] = useState("");

  const uveziBulk = () => {
    try {
      const data = JSON.parse(bulk);
      const lista = Array.isArray(data) ? data : [data];
      let broj = 0;
      for (const w of lista) {
        if (w?.rijec && w?.znacenje) {
          add({
            rijec: w.rijec,
            izgovor: w.izgovor || w.rijec,
            znacenje: w.znacenje,
            primjer: w.primjer || "",
            prijevod: w.prijevod || "",
            vrsta: w.vrsta || "imenica",
            govorId: w.govorId || form.govorId,
            tema: w.tema || "svakodnevica",
          });
          broj++;
        }
      }
      setBulkPoruka(`Uvezeno ${broj} riječi.`);
      setBulk("");
    } catch {
      setBulkPoruka("Nevaljan JSON. Očekuje se niz objekata s poljima rijec, znacenje…");
    }
  };

  const odabraniGovor = useMemo(() => getGovor(form.govorId), [form.govorId]);

  const promijeni = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setGreske((g) => ({ ...g, [key]: undefined }));
  };

  const posalji = (e) => {
    e.preventDefault();
    const noveGreske = {};
    if (!form.rijec.trim()) noveGreske.rijec = "Upiši riječ.";
    if (!form.znacenje.trim()) noveGreske.znacenje = "Upiši značenje.";
    if (Object.keys(noveGreske).length) {
      setGreske(noveGreske);
      return;
    }
    const nova = add({
      ...form,
      rijec: form.rijec.trim(),
      znacenje: form.znacenje.trim(),
      izgovor: form.izgovor.trim() || form.rijec.trim(),
      primjer: form.primjer.trim(),
      prijevod: form.prijevod.trim(),
    });
    setDodano(nova);
    setForm({ ...prazan, govorId: form.govorId });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page container section">
      <div className="page-head">
        <p className="kicker">Dopuni rječnik</p>
        <h1 className="h1">Dodaj riječ iz svog zavičaja.</h1>
        <p className="lead lead-uzak">
          Dovoljni su riječ i značenje. Sve ostalo pomaže da riječ ostane živa — izgovor,
          primjer rečenice i mjesto.
        </p>
      </div>

      {dodano && (
        <div className="uspjeh" role="status">
          <p>
            Hvala! Riječ <strong>{dodano.rijec}</strong> je dodana u rječnik ovog preglednika.
          </p>
          <Link to={`/rjecnik/${dodano.id}`} className="btn btn-mali btn-ink">
            Otvori riječ
          </Link>
        </div>
      )}

      <div className="dodaj-layout">
        <form className="forma" onSubmit={posalji} noValidate>
          <div className="polje">
            <label htmlFor="rijec">Riječ *</label>
            <input
              id="rijec"
              value={form.rijec}
              onChange={promijeni("rijec")}
              placeholder="npr. škoda"
              aria-invalid={Boolean(greske.rijec)}
            />
            {greske.rijec && <span className="greska">{greske.rijec}</span>}
          </div>

          <div className="polje">
            <label htmlFor="izgovor">Izgovor (nije obavezno)</label>
            <input
              id="izgovor"
              value={form.izgovor}
              onChange={promijeni("izgovor")}
              placeholder="npr. škȍda"
            />
          </div>

          <div className="polje">
            <label htmlFor="znacenje">Značenje *</label>
            <textarea
              id="znacenje"
              rows={2}
              value={form.znacenje}
              onChange={promijeni("znacenje")}
              placeholder="Kratko i jasno — kao da objašnjavaš prijatelju."
              aria-invalid={Boolean(greske.znacenje)}
            />
            {greske.znacenje && <span className="greska">{greske.znacenje}</span>}
          </div>

          <div className="polje">
            <label htmlFor="primjer">Primjer rečenice</label>
            <input
              id="primjer"
              value={form.primjer}
              onChange={promijeni("primjer")}
              placeholder="npr. Škoda je tako lipo vrime."
            />
          </div>

          <div className="polje">
            <label htmlFor="prijevod">Prijevod na standardni jezik</label>
            <input
              id="prijevod"
              value={form.prijevod}
              onChange={promijeni("prijevod")}
              placeholder="npr. Šteta je tako lijepo vrijeme."
            />
          </div>

          <div className="polje-red">
            <div className="polje">
              <label htmlFor="govor">Govor</label>
              <select id="govor" value={form.govorId} onChange={promijeni("govorId")}>
                {GOVORI.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.mjesto} ({getNarjecje(g.narjecje).naziv})
                  </option>
                ))}
              </select>
            </div>

            <div className="polje">
              <label htmlFor="tema">Tema</label>
              <select id="tema" value={form.tema} onChange={promijeni("tema")}>
                {TEME.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="polje">
            <label htmlFor="vrsta">Vrsta riječi</label>
            <input id="vrsta" value={form.vrsta} onChange={promijeni("vrsta")} />
          </div>

          <div className="forma-dno">
            <button type="submit" className="btn btn-terra">
              Spremi riječ
            </button>
            <p className="forma-napomena">
              Unos se sprema lokalno u preglednik. U pravoj verziji ići će na uredničku
              provjeru.
            </p>
          </div>
        </form>

        <aside className="dodaj-aside">
          <div className="pregled-kartica">
            <p className="kicker">Pregled</p>
            <p className="pregled-rijec">{form.rijec || "tvoja riječ"}</p>
            <p className="pregled-izgovor">
              [{form.izgovor || form.rijec || "izgovor"}]
            </p>
            <p className="pregled-znacenje">
              {form.znacenje || "Značenje će se pojaviti ovdje."}
            </p>
            {form.primjer && <p className="pregled-primjer">„{form.primjer}”</p>}
            <p className="pregled-mjesto">
              {odabraniGovor?.mjesto} · {getNarjecje(odabraniGovor?.narjecje).naziv}
            </p>
          </div>

          <div className="moje-rijeci">
            <p className="kicker">Tvoje riječi ({moje.length})</p>
            {moje.length ? (
              <ul>
                {moje.map((r) => (
                  <li key={r.id}>
                    <Link to={`/rjecnik/${r.id}`}>{r.rijec}</Link>
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      aria-label={`Ukloni ${r.rijec}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="moje-prazno">Još nema tvojih riječi.</p>
            )}
          </div>
        </aside>
      </div>

      <section className="section" style={{ marginTop: 40 }}>
        <div className="page-head">
          <p className="kicker">Uvoz više riječi</p>
          <h2 className="h2">Zalijepi JSON niz riječi.</h2>
          <p className="lead lead-uzak">
            Format: <code>[{"{"}"rijec":"škoda","znacenje":"šteta","govorId":"nerezisca"{"}"}]</code>.
            Obavezna polja: <code>rijec</code>, <code>znacenje</code>. Ostalo je
            neobavezno.
          </p>
        </div>
        <textarea
          rows={6}
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder='[{"rijec":"škoda","znacenje":"šteta","govorId":"nerezisca","tema":"svakodnevica"}]'
          style={{ width: "100%", fontFamily: "monospace", fontSize: 13 }}
        />
        <div className="forma-dno" style={{ marginTop: 12 }}>
          <button type="button" className="btn btn-terra" onClick={uveziBulk}>
            Uvezi
          </button>
          {bulkPoruka && <p className="forma-napomena">{bulkPoruka}</p>}
        </div>
      </section>
    </div>
  );
}
