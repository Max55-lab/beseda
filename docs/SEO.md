# SEO i Google indeksiranje — Beseda

## Što je popravljeno

| Problem | Rješenje |
|---|---|
| Google je vidio `Disallow: /` u `robots.txt` | Novi `robots.txt` dopušta `/`, a blokira samo `/api/`. Backend ga šalje svježeg (`Cache-Control: no-store`). |
| Sitemap je sadržavao `#/` rute | Sitemap sada ima 78 čistih URL-ova (`/karta`, `/rjecnik/skoda`, `/govor/hvar`...). |
| Sve stranice su imale isti URL (`/#/...`) | Aplikacija koristi `BrowserRouter` — svaka stranica ima svoj pravi URL. Stare `#/` poveznice automatski se preusmjeravaju. |
| Isti naslov na svim stranicama | `Seo.jsx` postavlja naslov, opis, canonical i OG oznake za svaku rutu. |
| Direktan ulazak na podstranicu | Backend vraća `index.html` za sve javne rute (SPA fallback), pa `/rjecnik/skoda` radi i izravno. |

## Kako provjeriti

Otvori u pregledniku (poželjno u incognito prozoru):

- https://beseda.onrender.com/robots.txt — mora pisati `Allow: /` i `Sitemap: ...`
- https://beseda.onrender.com/sitemap.xml — 78 `<loc>` zapisa, bez `#/`
- https://beseda.onrender.com/karta — mora se otvoriti karta
- https://beseda.onrender.com/rjecnik/skoda — mora se otvoriti riječ

### Google Search Console

1. **Indeksiranje → Datoteke robots.txt** — otvori izvješće. Google će ponovno dohvatiti datoteku; status mora biti „Dohvaćeno”.
2. **Indeksiranje → Sitemape** — ponovno pošalji `sitemap.xml` (ili pričekaj da ga Google sam osvježi).
3. **Provjera URL-a** → `https://beseda.onrender.com/` → **Testiraj uživo** → **Zatraži indeksiranje**.
4. Isto ponovi za nekoliko važnijih stranica: `/karta`, `/rjecnik`, `/frazemi`.

> Google može keširati `robots.txt` do 24 sata. Ako i dalje piše „Blokirano datotekom robots.txt”, pričekaj dan i ponovi provjeru — datoteka je na poslužitelju već ispravna.

## Napomene

- **Render free tier** uspava servis nakon neaktivnosti. Prvi posjet nakon toga može trajati 30–60 s; Googlebot to ponekad zabilježi kao spor odgovor. Za ozbiljniji promet potreban je plaćeni plan ili drugi hosting.
- Aplikacija je klijentski renderirana (React SPA). Google zna izvršiti JavaScript, ali za savršen SEO podstranica bilo bi potrebno predrenderiranje (SSR/prerender). Ovo je sljedeći korak ako želiš da svaka riječ ima potpuni HTML pri prvom dohvaćanju.
- `robots.txt` i `sitemap.xml` nalaze se u `beseda/public/` i kopiraju se u `beseda-backend/public/` pri svakom build-u.
- Sitemap se generira naredbom:

```powershell
cd beseda
node scripts/make-sitemap.mjs
```
