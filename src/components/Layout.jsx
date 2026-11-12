import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { getLang, loadLang, SUPPORTED } from "../lib/i18n.js";

const links = [
  { to: "/karta", label: "Karta" },
  { to: "/rjecnik", label: "Rječnik" },
  { to: "/kviz", label: "Kviz" },
  { to: "/zbirke", label: "Zbirke" },
];

export default function Layout() {
  const [tema, setTema] = useState(
    () => localStorage.getItem("beseda:tema") || "svijetla"
  );
  const [lang, setLang] = useState(getLang());

  useEffect(() => {
    document.documentElement.dataset.tema = tema === "tamna" ? "tamna" : "";
    localStorage.setItem("beseda:tema", tema);
  }, [tema]);

  const changeLang = async (l) => {
    await loadLang(l);
    setLang(l);
  };

  return (
    <div className="app">
      <a href="#glavni-sadrzaj" className="skip-link">
        Preskoči na sadržaj
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="wordmark" aria-label="Beseda, početna">
            beseda<span className="wordmark-dot">.</span>
          </Link>
          <nav className="nav" aria-label="Glavna navigacija">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? "nav-link je-aktivan" : "nav-link")}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <select
            value={lang}
            onChange={(e) => changeLang(e.target.value)}
            aria-label="Jezik sučelja"
            style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--paper)", fontSize: 12, maxWidth: 90, marginRight: 8 }}
          >
            {SUPPORTED.map((l) => (
              <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-mali btn-ghost"
            onClick={() => setTema((t) => (t === "tamna" ? "svijetla" : "tamna"))}
            aria-label="Promijeni temu"
            title="Promijeni temu"
          >
            {tema === "tamna" ? "☀" : "☾"}
          </button>
          <Link to="/dodaj" className="btn btn-mali btn-terra">
            Dodaj riječ
          </Link>
        </div>
      </header>

      <main id="glavni-sadrzaj">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <p className="footer-mark">beseda</p>
            <p className="footer-text">
              Audio-rječnik hrvatskih mjesnih govora. Projekt za kolegij — koncept i prva
              verzija aplikacije.
            </p>
          </div>
          <div className="footer-links">
            <Link to="/karta">Karta govora</Link>
            <Link to="/rjecnik">Rječnik</Link>
            <Link to="/usporedba">Usporedba</Link>
            <Link to="/frazemi">Frazemi</Link>
            <Link to="/engleski">Engleski rječnik</Link>
            <Link to="/standardni">Standardni rječnik</Link>
            <Link to="/zajednica">Zajednica</Link>
            <Link to="/kviz">Kviz</Link>
            <Link to="/kartice">Kartice</Link>
            <Link to="/zbirke">Zbirke</Link>
            <Link to="/statistika">Statistika</Link>
            <Link to="/podaci">Podaci</Link>
            <Link to="/dodaj">Dodaj riječ</Link>
          </div>
          <p className="footer-meta">
            Riječi su stvarne, a snimke i atribucije u ovoj verziji su ilustrativne.
            Englesko-hrvatski dio temelji se na projektu Rječnik hrvatskih jezika
            (GPL-3.0).
          </p>
        </div>
      </footer>
    </div>
  );
}
