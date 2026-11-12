import { NavLink } from "react-router-dom";

const stavke = [
  { to: "/rjecnik", label: "Zavičajne riječi" },
  { to: "/frazemi", label: "Frazemi" },
  { to: "/engleski", label: "Engleski → hrvatski" },
];

export default function RjecnikNav() {
  return (
    <nav className="podnav" aria-label="Rječnički sadržaji">
      {stavke.map((stavka) => (
        <NavLink
          key={stavka.to}
          to={stavka.to}
          end={stavka.to === "/rjecnik"}
          className={({ isActive }) => (isActive ? "je-aktivan" : undefined)}
        >
          {stavka.label}
        </NavLink>
      ))}
    </nav>
  );
}
