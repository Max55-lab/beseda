import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Seo from "./components/Seo.jsx";
import Home from "./pages/Home.jsx";
import Karta from "./pages/Karta.jsx";
import Rjecnik from "./pages/Rjecnik.jsx";
import Rijec from "./pages/Rijec.jsx";
import Frazemi from "./pages/Frazemi.jsx";
import Engleski from "./pages/Engleski.jsx";
import Standardni from "./pages/Standardni.jsx";
import Zajednica from "./pages/Zajednica.jsx";
import Kviz from "./pages/Kviz.jsx";
import Usporedba from "./pages/Usporedba.jsx";
import Kartice from "./pages/Kartice.jsx";
import Statistika from "./pages/Statistika.jsx";
import Podaci from "./pages/Podaci.jsx";
import Zbirke from "./pages/Zbirke.jsx";
import Dodaj from "./pages/Dodaj.jsx";
import Govor from "./pages/Govor.jsx";


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Seo />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/karta" element={<Karta />} />
          <Route path="/rjecnik" element={<Rjecnik />} />
          <Route path="/rjecnik/:id" element={<Rijec />} />
          <Route path="/frazemi" element={<Frazemi />} />
          <Route path="/engleski" element={<Engleski />} />
          <Route path="/standardni" element={<Standardni />} />
          <Route path="/zajednica" element={<Zajednica />} />
          <Route path="/kviz" element={<Kviz />} />
          <Route path="/usporedba" element={<Usporedba />} />
          <Route path="/kartice" element={<Kartice />} />
          <Route path="/statistika" element={<Statistika />} />
          <Route path="/podaci" element={<Podaci />} />
          <Route path="/zbirke" element={<Zbirke />} />
          <Route path="/dodaj" element={<Dodaj />} />
          <Route path="/govor/:id" element={<Govor />} />
          <Route
            path="*"
            element={
              <div className="container section">
                <h1 className="h2">Ova stranica još ne postoji.</h1>
                <p className="lead">Vrati se na početnu i nastavi istraživati.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </>
  );
}
