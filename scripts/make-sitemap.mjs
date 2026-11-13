/**
 * Generira public/sitemap.xml iz stvarnih ruta i podataka.
 * Pokretanje: node scripts/make-sitemap.mjs
 *
 * Važno: koristi čiste URL-ove (bez #/), jer Google hash rute
 * tretira kao istu stranicu i ne indeksira ih odvojeno.
 */
import fs from "node:fs";
import path from "node:path";
import { RIJECI } from "../src/data/rijeci.js";
import { GOVORI } from "../src/data/govori.js";

const BASE = "https://beseda.onrender.com";
const today = new Date().toISOString().slice(0, 10);

const escapeXml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const urls = [];
const add = (loc, priority = "0.6", changefreq = "monthly") => {
  urls.push({ loc: `${BASE}${loc}`, priority, changefreq });
};

// glavne stranice
add("/", "1.0", "daily");
add("/karta", "0.9", "weekly");
add("/rjecnik", "0.9", "daily");
add("/frazemi", "0.8", "monthly");
add("/engleski", "0.8", "monthly");
add("/standardni", "0.7", "monthly");
add("/kviz", "0.7", "monthly");
add("/usporedba", "0.7", "monthly");
add("/kartice", "0.6", "monthly");
add("/zajednica", "0.5", "weekly");
add("/podaci", "0.5", "monthly");
add("/statistika", "0.4", "monthly");

// svaka zavičajna riječ
for (const r of RIJECI) add(`/rjecnik/${encodeURIComponent(r.id)}`, "0.6", "yearly");

// svaki govor
for (const g of GOVORI) add(`/govor/${encodeURIComponent(g.id)}`, "0.6", "yearly");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const out = path.resolve("public/sitemap.xml");
fs.writeFileSync(out, xml, "utf8");
console.log(`sitemap.xml — ${urls.length} URL-ova`);
