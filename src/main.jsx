import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { loadLang } from "./lib/i18n.js";

// Standalone datoteka (Beseda.html) otvara se preko file:// i mora koristiti hash rute.
// Na webu koristimo čiste URL-ove (/rjecnik/skoda) da ih Google može indeksirati.
const Router = import.meta.env.VITE_STANDALONE ? HashRouter : BrowserRouter;

// Stare poveznice s #/ preusmjeri na čiste URL-ove.
if (!import.meta.env.VITE_STANDALONE && window.location.hash.startsWith("#/")) {
  const clean = window.location.hash.slice(1);
  window.history.replaceState(null, "", clean);
}

// preload default language
loadLang(localStorage.getItem("beseda:lang") || "hr");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

// hide loading screen
setTimeout(() => {
  const el = document.getElementById("loading");
  if (el) { el.style.opacity = "0"; setTimeout(() => el.remove(), 400); }
}, 800);
