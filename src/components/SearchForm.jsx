import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RIJECI } from "../data/rijeci.js";
import { PRIJEDLOZI } from "../data/prijedlozi.js";
import { normalize } from "../lib/text.js";

export default function SearchForm({ initial = "", autoFocus = false, veliki = true }) {
  const [q, setQ] = useState(initial);
  const [otvoreno, setOtvoreno] = useState(false);
  const navigate = useNavigate();
  const blurTimer = useRef(null);

  const prijedlozi = useMemo(() => {
    const needle = normalize(q);
    if (needle.length < 2) return [];
    const rezultat = [];
    const dodani = new Set();
    // prvo postojeće riječi iz rječnika
    for (const r of RIJECI) {
      if (normalize(r.rijec).startsWith(needle)) {
        if (!dodani.has(r.rijec)) {
          dodani.add(r.rijec);
          rezultat.push({ tekst: r.rijec, id: r.id, postoji: true });
        }
      }
      if (rezultat.length >= 8) break;
    }
    // zatim opći prijedlozi
    if (rezultat.length < 8) {
      for (const w of PRIJEDLOZI) {
        if (normalize(w).startsWith(needle) && !dodani.has(w)) {
          dodani.add(w);
          rezultat.push({ tekst: w, id: null, postoji: false });
          if (rezultat.length >= 8) break;
        }
      }
    }
    return rezultat;
  }, [q]);

  const odaberi = (p) => {
    setQ(p.tekst);
    setOtvoreno(false);
    if (p.id) navigate(`/rjecnik/${p.id}`);
    else navigate(`/rjecnik?q=${encodeURIComponent(p.tekst)}`);
  };

  const submit = (e) => {
    e.preventDefault();
    setOtvoreno(false);
    const value = q.trim();
    navigate(value ? `/rjecnik?q=${encodeURIComponent(value)}` : "/rjecnik");
  };

  const onBlur = () => {
    blurTimer.current = setTimeout(() => setOtvoreno(false), 150);
  };

  const onFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setOtvoreno(true);
  };

  return (
    <div className={`pretraga-omot ${veliki ? "pretraga-omot-velika" : ""}`}>
      <form className={`pretraga ${veliki ? "pretraga-velika" : ""}`} onSubmit={submit} role="search">
        <span className="pretraga-ikona" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOtvoreno(true);
          }}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Traži riječ, selo ili pojam…"
          aria-label="Pretraži rječnik"
          autoFocus={autoFocus}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-terra pretraga-btn">
          Traži
        </button>
      </form>
      {otvoreno && prijedlozi.length > 0 && (
        <ul className="pretraga-prijedlozi" role="listbox">
          {prijedlozi.map((p) => (
            <li key={p.tekst}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => odaberi(p)}
              >
                <span>{p.tekst}</span>
                {p.postoji && <span className="pretraga-oznaka">u rječniku</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}