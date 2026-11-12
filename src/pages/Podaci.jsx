import { Link } from "react-router-dom";
import { RIJECI } from "../data/rijeci.js";
import { GOVORI, NARJECJA } from "../data/govori.js";
import { FRAZEMI } from "../data/frazemi.js";

function preuzmi(naziv, sadrzaj, tip) {
  const blob = new Blob([sadrzaj], { type: tip });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = naziv;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function uCsv(polja, redovi) {
  const header = polja.join(",");
  const body = redovi
    .map((r) =>
      polja
        .map((p) => {
          const v = r[p] ?? "";
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${s}"` : s;
        })
        .join(",")
    )
    .join("\n");
  return header + "\n" + body;
}

export default function Podaci() {
  const izveziRijeciJson = () =>
    preuzmi(
      "beseda-rijeci.json",
      JSON.stringify(RIJECI, null, 2),
      "application/json"
    );
  const izveziRijeciCsv = () =>
    preuzmi(
      "beseda-rijeci.csv",
      uCsv(
        ["id", "govorId", "rijec", "izgovor", "vrsta", "znacenje", "primjer", "prijevod", "tema", "izvor"],
        RIJECI
      ),
      "text/csv"
    );
  const izveziGovore = () =>
    preuzmi("beseda-govori.json", JSON.stringify(GOVORI, null, 2), "application/json");
  const izveziFrazeme = () =>
    preuzmi("beseda-frazemi.json", JSON.stringify(FRAZEMI, null, 2), "application/json");
  const izveziSve = () =>
    preuzmi(
      "beseda-sve.json",
      JSON.stringify({ govori: GOVORI, narjecja: NARJECJA, rijeci: RIJECI, frazemi: FRAZEMI }, null, 2),
      "application/json"
    );

  return (
    <div className="page container section">
      <div className="page-head">
        <p className="kicker">Otvoreni podaci</p>
        <h1 className="h1">Preuzmi građu.</h1>
        <p className="lead lead-uzak">
          Sve riječi, govori i frazemi dostupni su za preuzimanje u strojno čitljivom
          obliku. Građa je objavljena pod licencom GPL-3.0-or-later (zbog
          englesko-hrvatskog dijela).
        </p>
      </div>

      <div className="ponuda">
        <button type="button" className="ponuda-kartica" onClick={izveziRijeciJson}>
          <span className="ponuda-oznaka">JSON</span>
          <h3 className="ponuda-naslov">Riječi (JSON)</h3>
          <p className="ponuda-opis">{RIJECI.length} riječi sa svim poljima.</p>
          <span className="link-strelica">Preuzmi →</span>
        </button>
        <button type="button" className="ponuda-kartica" onClick={izveziRijeciCsv}>
          <span className="ponuda-oznaka">CSV</span>
          <h3 className="ponuda-naslov">Riječi (CSV)</h3>
          <p className="ponuda-opis">Za tablice i analizu.</p>
          <span className="link-strelica">Preuzmi →</span>
        </button>
        <button type="button" className="ponuda-kartica" onClick={izveziGovore}>
          <span className="ponuda-oznaka">JSON</span>
          <h3 className="ponuda-naslov">Govori</h3>
          <p className="ponuda-opis">{GOVORI.length} govora s koordinatama.</p>
          <span className="link-strelica">Preuzmi →</span>
        </button>
        <button type="button" className="ponuda-kartica" onClick={izveziFrazeme}>
          <span className="ponuda-oznaka">JSON</span>
          <h3 className="ponuda-naslov">Frazemi</h3>
          <p className="ponuda-opis">{FRAZEMI.length} frazema sa značenjem i primjerom.</p>
          <span className="link-strelica">Preuzmi →</span>
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <button type="button" className="btn btn-terra" onClick={izveziSve}>
          Preuzmi sve odjednom (JSON)
        </button>
      </div>

      <p className="en-uputa" style={{ marginTop: 32 }}>
        Želiš doprinijeti? Unesi novu riječ na stranici{" "}
        <Link to="/dodaj">Dodaj riječ</Link> — u ovoj verziji se sprema samo u tvoj
        preglednik.
      </p>
    </div>
  );
}