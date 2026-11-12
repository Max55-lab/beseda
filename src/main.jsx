import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { loadLang } from "./lib/i18n.js";

// preload default language
loadLang(localStorage.getItem("beseda:lang") || "hr");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

// hide loading screen
setTimeout(() => {
  const el = document.getElementById("loading");
  if (el) { el.style.opacity = "0"; setTimeout(() => el.remove(), 400); }
}, 800);
