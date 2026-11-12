/**
 * Spaja build u jednu samostalnu HTML datoteku (Beseda.html).
 * Tako se aplikacija može otvoriti dvoklikom, bez servera i bez interneta.
 *
 * Pokretanje: npm run standalone   (prvo napravi build)
 */
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
let html = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const readAsset = (url) => {
  const clean = url.replace(/^\.?\//, "").split("?")[0];
  return fs.readFileSync(path.join(dist, clean), "utf8");
};

// zamijeni <script src> ugrađenim kodom
html = html.replace(
  /<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g,
  (_match, src) => {
    const code = readAsset(src).replace(/<\/script/gi, "<\\/script");
    return `<script type="module">\n${code}\n</script>`;
  }
);

// zamijeni <link rel="stylesheet"> ugrađenim CSS-om
html = html.replace(
  /<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/g,
  (_match, href) => `<style>\n${readAsset(href)}\n</style>`
);

const out = path.resolve("Beseda.html");
fs.writeFileSync(out, html);

const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`Beseda.html — ${kb} kB (samostalna aplikacija)`);
