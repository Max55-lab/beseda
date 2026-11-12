// Generates supabase/seed.sql from the static datasets in src/data/.
// Run: node scripts/generate-seed-sql.mjs
import { writeFileSync } from "node:fs";
import { GOVORI, NARJECJA } from "../src/data/govori.js";
import { RIJECI, ZNACENJA_EN } from "../src/data/rijeci.js";
import { FRAZEMI } from "../src/data/frazemi.js";
import { ENGLESKI } from "../src/data/engleski.js";

const sqlStr = (v) => {
  if (v === null || v === undefined) return "null";
  return "'" + String(v).replace(/'/g, "''") + "'";
};

const lines = [];
lines.push("-- Beseda seed data (generated). Do not edit by hand.");
lines.push("begin;");
lines.push("");

// dialects
lines.push("-- dialects");
for (const n of NARJECJA) {
  lines.push(
    `insert into public.dialects (id, name, color, description) values (${sqlStr(n.id)}, ${sqlStr(n.naziv)}, ${sqlStr(n.boja)}, ${sqlStr(n.opis)}) on conflict (id) do update set name=excluded.name, color=excluded.color, description=excluded.description;`
  );
}
lines.push("");

// places
lines.push("-- places");
for (const g of GOVORI) {
  lines.push(
    `insert into public.places (id, name, region, dialect_id, lat, lng, description) values (${sqlStr(g.id)}, ${sqlStr(g.mjesto)}, ${sqlStr(g.regija)}, ${sqlStr(g.narjecje)}, ${g.lat}, ${g.lng}, ${sqlStr(g.opis)}) on conflict (id) do update set name=excluded.name, region=excluded.region, dialect_id=excluded.dialect_id, lat=excluded.lat, lng=excluded.lng, description=excluded.description;`
  );
}
lines.push("");

// words
lines.push("-- words");
for (const r of RIJECI) {
  const en = ZNACENJA_EN[r.id] ?? null;
  lines.push(
    `insert into public.words (slug, place_id, word, pronunciation, part_of_speech, meaning, example, translation, english_meaning, theme, source, status) values (` +
      `${sqlStr(r.id)}, ${sqlStr(r.govorId)}, ${sqlStr(r.rijec)}, ${sqlStr(r.izgovor)}, ${sqlStr(r.vrsta)}, ${sqlStr(r.znacenje)}, ${sqlStr(r.primjer)}, ${sqlStr(r.prijevod)}, ${sqlStr(en)}, ${sqlStr(r.tema)}, ${sqlStr(r.izvor)}, 'published'` +
      `) on conflict (slug) do update set place_id=excluded.place_id, word=excluded.word, pronunciation=excluded.pronunciation, part_of_speech=excluded.part_of_speech, meaning=excluded.meaning, example=excluded.example, translation=excluded.translation, english_meaning=excluded.english_meaning, theme=excluded.theme, source=excluded.source, status=excluded.status;`
  );
}
lines.push("");

// phrases
lines.push("-- phrases");
for (const f of FRAZEMI) {
  lines.push(
    `insert into public.phrases (slug, phrase, meaning, example, theme, source, status) values (` +
      `${sqlStr(f.id)}, ${sqlStr(f.frazem)}, ${sqlStr(f.znacenje)}, ${sqlStr(f.primjer)}, ${sqlStr(f.tema)}, 'terenski zapis', 'published'` +
      `) on conflict (slug) do update set phrase=excluded.phrase, meaning=excluded.meaning, example=excluded.example, theme=excluded.theme, status=excluded.status;`
  );
}
lines.push("");

// dictionary
lines.push("-- dictionary_entries");
for (const [en, hr] of ENGLESKI) {
  lines.push(
    `insert into public.dictionary_entries (english, croatian, source, status) values (${sqlStr(en)}, ${sqlStr(hr)}, 'igaly-rjecnik', 'published');`
  );
}
lines.push("");
lines.push("commit;");

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), lines.join("\n"), "utf8");
console.log("Wrote supabase/seed.sql");
console.log("dialects", NARJECJA.length, "places", GOVORI.length, "words", RIJECI.length, "phrases", FRAZEMI.length, "dict", ENGLESKI.length);
