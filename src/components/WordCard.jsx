import { Link } from "react-router-dom";
import { getGovor, getNarjecje } from "../data/govori.js";

export default function WordCard({ rijec, index = 0 }) {
  const govor = getGovor(rijec.govorId);
  const narjecje = govor ? getNarjecje(govor.narjecje) : null;

  return (
    <Link
      to={`/rjecnik/${rijec.id}`}
      className="word-card"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
    >
      <span className="word-card-top">
        <span className="word-card-rijec">{rijec.rijec}</span>
        {rijec.moja && <span className="znacka znacka-terra">tvoj unos</span>}
      </span>
      <span className="word-card-izgovor">[{rijec.izgovor}]</span>
      <span className="word-card-znacenje">{rijec.znacenje}</span>
      <span className="word-card-mjesto">
        <i style={{ background: narjecje?.boja }} aria-hidden="true" />
        {govor ? `${govor.mjesto} · ${narjecje?.naziv}` : "nepoznat govor"}
      </span>
    </Link>
  );
}
