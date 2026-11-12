import { useEffect, useId, useRef, useState } from "react";
import { GOVORI, getNarjecje } from "../data/govori.js";
import { MAP, project } from "../data/map.js";

const POCETNI_POGLED = { x: 0, y: 0, w: MAP.WIDTH, h: MAP.HEIGHT };
const OMJER = MAP.HEIGHT / MAP.WIDTH;
const NAJMANJA_SIRINA = MAP.WIDTH / 8;

function ograniciPogled(pogled) {
  const w = Math.min(MAP.WIDTH, Math.max(NAJMANJA_SIRINA, pogled.w));
  const h = w * OMJER;
  const x = Math.min(MAP.WIDTH - w, Math.max(0, pogled.x));
  const y = Math.min(MAP.HEIGHT - h, Math.max(0, pogled.y));
  return { x, y, w, h };
}

export default function CroatiaMap({
  selectedId = null,
  onSelect = null,
  interaktivna = true,
  prikaziLegendu = true,
  prikaziEtikete = true,
  className = "",
}) {
  const [hover, setHover] = useState(null);
  const [pogled, setPogled] = useState(POCETNI_POGLED);
  const svgRef = useRef(null);
  const povlacenje = useRef(null);
  const pomaknuto = useRef(false);
  const filterId = `pin-sjena-${useId().replace(/:/g, "")}`;

  const prikaz = GOVORI.find((g) => g.id === (hover || selectedId)) || null;
  const [px, py] = prikaz ? project(prikaz.lng, prikaz.lat) : [0, 0];
  const izvanPogleda =
    !prikaz ||
    px < pogled.x ||
    px > pogled.x + pogled.w ||
    py < pogled.y ||
    py > pogled.y + pogled.h;

  const zumiraj = (faktor, fx = 0.5, fy = 0.5) => {
    setPogled((prije) => {
      const w = prije.w / faktor;
      const h = w * OMJER;
      return ograniciPogled({
        w,
        h,
        x: prije.x + fx * (prije.w - w),
        y: prije.y + fy * (prije.h - h),
      });
    });
  };

  // Kotačić miša zumira oko pokazivača.
  useEffect(() => {
    const el = svgRef.current;
    if (!el || !interaktivna) return undefined;

    const naKotacic = (dogadaj) => {
      dogadaj.preventDefault();
      const rect = el.getBoundingClientRect();
      const fx = Math.min(1, Math.max(0, (dogadaj.clientX - rect.left) / rect.width));
      const fy = Math.min(1, Math.max(0, (dogadaj.clientY - rect.top) / rect.height));
      zumiraj(dogadaj.deltaY < 0 ? 1.18 : 1 / 1.18, fx, fy);
    };

    el.addEventListener("wheel", naKotacic, { passive: false });
    return () => el.removeEventListener("wheel", naKotacic);
  }, [interaktivna]);

  const pocniPovlacenje = (dogadaj) => {
    if (!interaktivna || dogadaj.button !== 0) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    povlacenje.current = {
      x: dogadaj.clientX,
      y: dogadaj.clientY,
      pogled,
      rect,
    };
    pomaknuto.current = false;
  };

  const povlaci = (dogadaj) => {
    const pocetak = povlacenje.current;
    if (!pocetak) return;

    const dx = dogadaj.clientX - pocetak.x;
    const dy = dogadaj.clientY - pocetak.y;

    if (!pomaknuto.current && Math.abs(dx) + Math.abs(dy) > 4) {
      pomaknuto.current = true;
      try {
        dogadaj.currentTarget.setPointerCapture?.(dogadaj.pointerId);
      } catch {
        // Pointer capture nije uvijek moguć — povlačenje i dalje radi unutar karte.
      }
    }

    if (!pomaknuto.current || pocetak.pogled.w >= MAP.WIDTH) return;

    setPogled(
      ograniciPogled({
        ...pocetak.pogled,
        x: pocetak.pogled.x - (dx * pocetak.pogled.w) / pocetak.rect.width,
        y: pocetak.pogled.y - (dy * pocetak.pogled.h) / pocetak.rect.height,
      })
    );
  };

  const zavrsiPovlacenje = (dogadaj) => {
    povlacenje.current = null;
    if (dogadaj.currentTarget.hasPointerCapture?.(dogadaj.pointerId)) {
      dogadaj.currentTarget.releasePointerCapture(dogadaj.pointerId);
    }
  };

  const naDvostrukiKlik = (dogadaj) => {
    if (!interaktivna) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fx = Math.min(1, Math.max(0, (dogadaj.clientX - rect.left) / rect.width));
    const fy = Math.min(1, Math.max(0, (dogadaj.clientY - rect.top) / rect.height));
    zumiraj(1.6, fx, fy);
  };

  const odaberi = (id) => {
    if (pomaknuto.current) return;
    onSelect?.(id);
  };

  return (
    <div className={`karta-omotas ${className}`}>
      <div className={`karta-plot ${interaktivna ? "je-interaktivna" : ""}`}>
        <svg
          ref={svgRef}
          viewBox={`${pogled.x} ${pogled.y} ${pogled.w} ${pogled.h}`}
          className={`karta-svg ${interaktivna ? "karta-svg-interaktivna" : ""}`}
          role="img"
          aria-label={
            interaktivna
              ? "Karta Hrvatske i Bosne i Hercegovine s govorima. Povećaj kotačićem, gumbima ili dvostrukim klikom."
              : "Karta Hrvatske i Bosne i Hercegovine s govorima"
          }
          onPointerDown={pocniPovlacenje}
          onPointerMove={povlaci}
          onPointerUp={zavrsiPovlacenje}
          onPointerCancel={zavrsiPovlacenje}
          onDoubleClick={naDvostrukiKlik}
        >
          <defs>
            <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="3"
                floodColor="#231A2B"
                floodOpacity="0.28"
              />
            </filter>
          </defs>

          {MAP.SUSJEDI.map((s) => (
            <path key={s.ID} d={s.PATH} className="karta-susjed" fillRule="evenodd" />
          ))}
          <path d={MAP.BIH} className="karta-bih" fillRule="evenodd" />
          <path d={MAP.PATH} className="karta-kopno" fillRule="evenodd" />

          {prikaziEtikete &&
            MAP.ETIKETE.map((t) => (
              <text
                key={t.TEKST}
                x={t.X}
                y={t.Y}
                className={`karta-etiketa ${t.VRSTA === "susjed" ? "karta-etiketa-susjed" : ""}`}
              >
                {t.TEKST}
              </text>
            ))}

          {GOVORI.map((govor) => {
            const [x, y] = project(govor.lng, govor.lat);
            const narjecje = getNarjecje(govor.narjecje);
            const aktivan = selectedId === govor.id;
            return (
              <g
                key={govor.id}
                className={`pin ${aktivan ? "je-aktivan" : ""} ${
                  interaktivna ? "je-klikabilan" : ""
                }`}
                transform={`translate(${x} ${y})`}
                onClick={interaktivna ? () => odaberi(govor.id) : undefined}
                onMouseEnter={() => setHover(govor.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(govor.id)}
                onBlur={() => setHover(null)}
                role={interaktivna ? "button" : undefined}
                tabIndex={interaktivna ? 0 : undefined}
                onKeyDown={
                  interaktivna
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelect?.(govor.id);
                        }
                      }
                    : undefined
                }
                aria-label={`${govor.mjesto} — ${narjecje?.naziv}`}
              >
                {interaktivna && <circle r="22" className="pin-hit" />}
                <circle
                  r={aktivan ? 13 : 10}
                  className="pin-tocka"
                  fill={narjecje?.boja}
                  filter={`url(#${filterId})`}
                />
                <circle r={aktivan ? 4.5 : 3.5} className="pin-sredina" />
              </g>
            );
          })}
        </svg>

        {prikaz && !izvanPogleda && (
          <span
            className="pin-tooltip"
            style={{
              left: `${((px - pogled.x) / pogled.w) * 100}%`,
              top: `${((py - pogled.y) / pogled.h) * 100}%`,
            }}
          >
            {prikaz.mjesto}
          </span>
        )}

        {interaktivna && (
          <div className="karta-kontrole" role="group" aria-label="Zumiranje karte">
            <button
              type="button"
              onClick={() => zumiraj(1.35)}
              aria-label="Povećaj kartu"
              title="Povećaj"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => zumiraj(1 / 1.35)}
              aria-label="Smanji kartu"
              title="Smanji"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setPogled(POCETNI_POGLED)}
              aria-label="Vrati početni prikaz karte"
              title="Vrati početni prikaz"
              className="karta-reset"
            >
              ⟲
            </button>
          </div>
        )}
      </div>

      {prikaziLegendu && (
        <ul className="karta-legenda">
          {["cakavsko", "kajkavsko", "stokavsko"].map((id) => {
            const n = getNarjecje(id);
            return (
              <li key={id}>
                <i style={{ background: n.boja }} />
                {n.naziv}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
