# Beseda — Backend i API: dizajn (v0.1)

> Status: **dizajn**, bez implementacije. Preporučeni stack: **Supabase** (Postgres 15 + Auth + Storage + RLS) na free/pro tieru, frontend ostaje React/Vite. Alternativa: vlastiti Node/Express + Postgres, ako se želi potpuna kontrola nad authom.

## 1. Ciljevi i ne-ciljevi

**Ciljevi**
- Zamijeniti `localStorage` pravom, dijeljenom bazom: riječi, govori, frazemi, eng-hr rječnik, zbirke, audio snimke.
- Omogućiti unos korisnika s **uređivačkom provjerom** prije objave (moderacija).
- Podržati **račune i uloge** (govornik, urednik, admin) — priprema za sljedeći korak.
- Prave audio snimke (upload + metadata), ne samo Web Speech API.
- Pretraga bez dijakritika, puni tekst, filtriranje po narječju/temi/mjestu.
- Migracija postojećih lokalnih podataka bez gubitka.

**Ne-ciljevi (v0.1)**
- Nema real-time chat-a, notifikacija ni emailova.
- Nema plaćanja ni premium sloja.
- Nema višejezičnog UI-a (samo hrvatski + engleski sadržaj).
- Nema analitike korisnika (privacy-first; samo agregirane brojke).

## 2. Arhitektura

```
┌─────────────────────────────┐
│  React/Vite (beseda)        │  ← hash router, statički bundle
│  Supabase JS client         │
└──────────────┬──────────────┘
               │ HTTPS (anon key + JWT)
┌──────────────▼──────────────┐
│  Supabase                   │
│  ├─ Auth (email/magic link) │
│  ├─ Postgres (RLS)          │
│  ├─ Storage (audio bucket)  │
│  └─ Edge Functions (moder.)  │
└─────────────────────────────┘
```

- Frontend koristi `@supabase/supabase-js` izravno; nema vlastitog backend servera u v0.1.
- Osjetljive operacije (moderacija, bulk import, regeneracija slugova) idu kroz **Edge Functions** s `service_role` ključem (nikad u browseru).
- Statički dataset (23 riječi + 10 govora) se **seed-a** u bazu pri prvom deployu; frontend može i dalje držati fallback bundle za offline (PWA kasnije).

## 3. Model podataka (Postgres)

### 3.1 Jezgrene tablice

```sql
-- Narječja
create table dialects (
  id          text primary key,            -- 'cakavsko', 'kajkavsko', 'stokavsko'
  name        text not null,
  color       text not null,               -- hex
  description text
);

-- Govori / mjesta
create table places (
  id          text primary key,            -- 'nerezisca', 'mostar', ...
  name        text not null,
  region      text not null,
  dialect_id  text not null references dialects(id),
  lat         double precision not null,
  lng         double precision not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Riječi zavičaja
create table words (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,      -- URL id: 'skoda', 'skoda-nerezisca-x1a2'
  place_id      text not null references places(id) on delete cascade,
  word          text not null,
  pronunciation text,
  part_of_speech text,                    -- 'imenica, ž.'
  meaning       text not null,
  example       text,
  translation   text,                     -- na standardni hrvatski
  english_meaning text,                   -- za učenike strance
  theme         text not null,
  source        text,                     -- 'terenski zapis, Nerežišća'
  status        text not null default 'pending'
                check (status in ('draft','pending','published','rejected','archived')),
  contributor_id uuid references profiles(id),
  reviewer_id    uuid references profiles(id),
  reviewed_at    timestamptz,
  review_note    text,
  audio_id       uuid references audio_assets(id) on delete set null,
  search_vector  tsvector,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Frazemi
create table phrases (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  phrase      text not null,
  meaning     text not null,
  example     text,
  theme       text,
  source      text,
  status      text not null default 'published'
              check (status in ('draft','pending','published','rejected','archived')),
  contributor_id uuid references profiles(id),
  reviewer_id    uuid references profiles(id),
  reviewed_at    timestamptz,
  audio_id       uuid references audio_assets(id) on delete set null,
  search_vector  tsvector,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Englesko-hrvatski rječnik (importirani dataset)
create table dictionary_entries (
  id            uuid primary key default gen_random_uuid(),
  english       text not null,
  croatian      text not null,
  frequency_rank int,
  source        text not null default 'igaly-rjecnik',
  status        text not null default 'published'
                check (status in ('published','hidden')),
  search_vector tsvector,
  created_at    timestamptz not null default now()
);

-- Profili (1:1 s auth.users)
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role        text not null default 'user'
              check (role in ('user','contributor','moderator','admin')),
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Zbirke (kolekcije riječi)
create table collections (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table collection_words (
  collection_id uuid not null references collections(id) on delete cascade,
  word_id       uuid not null references words(id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (collection_id, word_id)
);

-- Audio snimke
create table audio_assets (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null,            -- 'audio/{place}/{slug}-{uuid}.webm'
  mime_type     text not null,
  duration_ms   int,
  speaker_place text,                     -- odakle je govornik
  recorded_by   uuid references profiles(id),
  recorded_at   timestamptz,
  license       text not null default 'CC-BY-4.0',
  status        text not null default 'pending'
                check (status in ('pending','approved','rejected')),
  created_at    timestamptz not null default now()
);
```

### 3.2 Indeksi i pretraga

```sql
create index words_place_idx      on words(place_id);
create index words_status_idx     on words(status);
create index words_theme_idx      on words(theme);
create index words_search_gin    on words using gin (search_vector);
create index phrases_search_gin  on phrases using gin (search_vector);
create index dict_search_gin     on dictionary_entries using gin (search_vector);
create index dict_english_trgm   on dictionary_entries using gin (english gin_trgm_ops);
create index dict_croatian_trgm  on dictionary_entries using gin (croatian gin_trgm_ops);
```

Trigger za `search_vector` (unaccent + hrvatski/engleski):

```sql
create extension if not exists unaccent;
create extension if not exists pg_trgm;

create or replace function words_search_trigger() returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(new.word,''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.meaning,''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.example,''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.translation,''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(coalesce(new.english_meaning,''))), 'D');
  new.updated_at := now();
  return new;
end $$ language plpgsql;

create trigger words_search before insert or update on words
  for each row execute function words_search_trigger();
```

Isto za `phrases` i `dictionary_entries`.

## 4. Uloge i Row Level Security

Uloge: `user` (prijavljen), `contributor` (može slati riječi), `moderator` (odobrava), `admin`.

RLS pravila (sažetak):

| Tablica | anon | user | contributor | moderator/admin |
|---|---|---|---|---|
| dialects, places | SELECT | SELECT | SELECT | ALL |
| words status=published | SELECT | SELECT | SELECT | ALL |
| words status≠published | — | vlastiti draft/pending | vlastiti + dodijeljeni | ALL |
| phrases status=published | SELECT | SELECT | SELECT | ALL |
| dictionary_entries published | SELECT | SELECT | SELECT | ALL |
| profiles | SELECT (javni) | SELECT/UPDATE vlastiti | isto | ALL |
| collections | — | vlastite | vlastite | ALL |
| collection_words | — | vlastite kolekcije | vlastite | ALL |
| audio_assets approved | SELECT | SELECT | SELECT | ALL |
| audio_assets pending | — | vlastiti upload | vlastiti | ALL |

Ključno pravilo: **korisnik ne može sam postaviti `status='published'`** — RLS `with check` to zabranjuje za uloge ispod moderatora. Umetanje novih riječi postavlja `status='pending'` (default) i `contributor_id = auth.uid()`.

## 5. API ugovor

Koristi se Supabase JS client; ispod je REST-prikaz (ekvivalentno `/rest/v1/...` i RPC).

### 5.1 Mjesta i narječja
- `GET /places` → sva mjesta (s dialect).
- `GET /places/:slug` → mjesto + broj riječi.

### 5.2 Riječi
- `GET /words?status=published&q=&place=&dialect=&theme=&limit=&cursor=`
  - `q` koristi `search_vector @@ plainto_tsquery('simple', unaccent(q))`.
- `GET /words/:slug` → riječ + mjesto + audio + povezane (ista tema/mjesto).
- `POST /words` (auth) → `{ word, meaning, ... }`, status `pending`.
- `PATCH /words/:slug` (owner ili moderator) → ažuriranje polja; moderator može mijenjati `status`.
- `DELETE /words/:slug` (owner draft/pending ili admin).

### 5.3 Frazemi
- `GET /phrases?q=&theme=&limit=`
- `GET /phrases/:slug`
- `POST/PATCH/DELETE` analogno riječima.

### 5.4 Englesko-hrvatski rječnik
- `GET /dictionary?lang=en|hr&q=&limit=&cursor=` (trigram pretraga na oba jezika).
- `GET /dictionary/random?n=10`.

### 5.5 Zbirke
- `GET /collections` (vlastite).
- `POST /collections` `{ name }`.
- `DELETE /collections/:id`.
- `POST /collections/:id/words` `{ word_slug }`.
- `DELETE /collections/:id/words/:word_slug`.

### 5.6 Audio
- `POST /audio` (multipart) → upload u bucket, kreira `audio_assets` zapis status `pending`.
- `GET /audio/:id` → signed URL (ili javni za approved).

### 5.7 Moderacija (Edge Functions, moderator/admin)
- `POST /moderate/word/:slug` `{ action: 'approve'|'reject'|'archive', note }`.
- `GET /moderate/queue?entity=word|phrase&status=pending`.
- `GET /moderate/stats` → broj pending, objavljenih, odbačenih.

### 5.8 Statistika (javna, agregirana)
- `GET /stats` → `{ places, words, phrases, dictionary_entries }`.

## 6. Uređivački tijek (editorial workflow)

1. Korisnik šalje riječ (`POST /words`) → `status='pending'`, `contributor_id=auth.uid()`.
2. Riječ ulazi u red čekanja moderatora (`GET /moderate/queue`).
3. Moderator odobrava → `status='published'`, `reviewer_id`, `reviewed_at`.
   - ili odbija → `status='rejected'` + `review_note` (vidljivo autoru).
4. Autor može urediti odbačenu riječ i ponovno poslati (`status='pending'`).
5. Svaka promjena statusa i uređivanje zapisuje se u `audit_events`.

```sql
create table audit_events (
  id          bigserial primary key,
  actor_id    uuid references profiles(id),
  entity_type text not null,   -- 'word','phrase','audio','collection'
  entity_id   text not null,   -- slug ili uuid
  action      text not null,   -- 'create','update','approve','reject','delete'
  diff        jsonb,
  created_at  timestamptz not null default now()
);
```

## 7. Audio: pohrana i licenca

- Bucket `audio` (private, signed URLs za pending; public za approved).
- Putanja: `audio/{place_slug}/{word_slug}-{short_uuid}.webm`.
- Format: WebM/Opus, max 10 s, max 2 MB, mono 24 kHz (dovoljno za govor, štedi prostor).
- Metadata u `audio_assets`: govornikovo mjesto, datum snimanja, licenca (default CC-BY-4.0).
- Moderacija audio zapisa prije objave (status pending → approved).
- Pravo na brisanje: autor može povući vlastitu snimku; admin može ukloniti bilo koju.

## 8. Migracija iz localStorage / statičkih podataka

Faza M1 — seed:
- Skripta `scripts/seed.mjs` čita `src/data/govori.js`, `rijeci.js`, `frazemi.js`, `engleski.js` i ubacuje u bazu (idempotentno, `upsert` po slugu).
- Pokreće se jednom pri prvom deployu i pri svakoj promjeni dataseta.

Faza M2 — frontend:
- `useAllWords()` prelazi s lokalnog na Supabase query (`status='published'`).
- Zadržati statički bundle kao **fallback** za offline (čita se ako fetch ne uspije).

Faza M3 — korisnički podaci:
- Na prvoj prijavi korisnika, klijent čita `localStorage` (`beseda:moje-rijeci`, `beseda:zbirke`) i nudi "Uvezi moje riječi/zbirke".
- Nakon uspješnog importa, ključevi se označavaju `beseda:migrated=true` (ne brišu se, radi sigurnosti).

Faza M4 — čišćenje:
- Ukloniti `store.js`/`collections.js` localStorage logiku nakon što je migracija stabilna (jedna verzija kasnije).

## 9. Sigurnost i privatnost

- **Nema cloud uploada bez eksplicitnog pristanka** (usklađeno s C8 iz drone-projekta; ovdje kao dobra praksa).
- Supabase anon key je javan (OK), ali `service_role` samo u Edge Functions.
- RLS obavezan na svim tablicama (`alter table ... enable row level security`).
- Rate limiting: max 20 novih riječi/korisnik/dan, max 5 audio uploada/korisnik/dan (Edge Function).
- Validacija na serveru (Edge Function) + constrainti u bazi (duljina, enum).
- Audio: skeniranje MIME-a, ograničenje veličine, samo audio/*.
- GDPR-ish: korisnik može izbrisati račun → kaskadno brisanje profila, riječi (ili anonimizacija doprinosa po izboru), zbirki, audio zapisa.
- Javni profil prikazuje samo `display_name` i broj objavljenih riječi.

## 10. Offline i performanse

- React Query (ili SWR) za cache + revalidaciju; trenutno nema — dodati u Fazi M2.
- Paginacija: `limit` + `cursor` (created_at + id) umjesto offseta.
- Indeksi (sekcija 3.2) za pretragu.
- Statički bundle ostaje fallback (offline čitanje objavljenog sadržaja).
- Slike: nema (samo SVG karta), tako da nema optimizacije slika.

## 11. Plan implementacije (faze)

| Faza | Opseg | Trajanje |
|---|---|---|
| B0 | Supabase projekt, shema, RLS, seed skripta | 2–3 dana |
| B1 | Frontend: Supabase client, čitanje objavljenog sadržaja, search | 3–4 dana |
| B2 | Auth (email/magic link), profili, uloge | 2 dana |
| B3 | Unos riječi + red čekanja + moderacija (Edge Functions) | 3–4 dana |
| B4 | Zbirke na backendu + migracija localStorage | 2 dana |
| B5 | Audio upload + moderacija + prikaz valnog oblika | 3–4 dana |
| B6 | Eng-hr rječnik import + pretraga | 1–2 dana |
| B7 | Testovi (RLS, API), dokumentacija, monitoring | 2 dana |

**Pravilo:** ne početi B5 (audio) dok B3 (moderacija) nije stabilan — isti tok odobravanja.

## 12. Odluke (zadane vrijednosti, B0)

1. **Auth metoda:** magic link (email). Bez lozinki; Google/GitHub OAuth ostaje opcionalan dodatak.
2. **Moderacija:** jedan admin (vlasnik projekta) u v0.1; audit log podržava dodavanje urednika kasnije.
3. **Licenca audio zapisa:** CC-BY-4.0, javno dostupno (bucket public za approved).
4. **Eng-hr rječnik (7337 parova):** migrira u bazu (`dictionary_entries`); statički bundle ostaje fallback za offline.
5. **Offline/PWA:** statički fallback za objavljeni sadržaj u v0.1; puni PWA/offline u kasnijoj fazi.

## 12.1 Artefakti B0

- `supabase/migrations/0001_init.sql` — shema, indeksi, trigeri, RLS.
- `scripts/generate-seed-sql.mjs` — generator seed podataka iz `src/data/`.
- `supabase/seed.sql` — generirani seed (7337 dict + 25 riječi + 45 frazema + 12 mjesta + 3 narječja).

## 13. Rizici

| ID | Rizik | Ublažavanje |
|---|---|---|
| RB1 | RLS greška otkriva tuđe zbirke/draftove | Testovi RLS-a prije produkcije; `supabase test` + pgTAP |
| RB2 | Spam unosa | Rate limit + moderacija + captcha (Turnstile) na unosu |
| RB3 | Audio storage trošak | Limit trajanja/veličine; brisanje odbačenih nakon 30 dana |
| RB4 | Migracija slugova mijenja URL-ove | Zadržati postojeće slugove kao `slug` (ne generirati nove) |
| RB5 | GPL-3.0 licenca (eng-hr dataset) | Ne mijenja se; ostaje GPL-3.0-or-later |

---

*Sljedeći korak po odabiru: B0 (shema + RLS) ili odgovori na otvorena pitanja.*
