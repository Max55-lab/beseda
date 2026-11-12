# Beseda — Lista za dovršetak (od izgleda do funkcionalnosti)

## IZGLED (Design)

### Boje i tema
- [x] Paleta: krem, terakota, senf, kadulja, šljiva
- [x] Tamna tema (prekidač + CSS varijable)
- [x] Dark mode: karta, placeholder, hover border-color
- [ ] Dark mode: provjeriti sve komponente (frazemi, kviz, modal, tooltip)
- [ ] Konzistentnost boja u svim stanjima (hover, active, disabled, focus)

### Tipografija
- [x] Georgia naslovi, Segoe UI tekst
- [x] Responsive font sizes (clamp)
- [ ] Provjeriti čitljivost na mobilnim uređajima

### Layout
- [x] Responsive grid (1 kolona na mobilnom)
- [x] Skip-link za pristupačnost
- [x] focus-visible outline
- [ ] Sticky header (već postoji)
- [ ] Footer s linkovima na sve stranice

### Animacije
- [x] Fade-in za sekcije i kartice
- [x] Prefers-reduced-motion poštovanje
- [ ] Hover efekti na karticama (translateY)
- [ ] Page transitions (fade between routes)
- [ ] Loading spinner (umjesto teksta "Učitavanje…")

### Ikonice i slike
- [x] Favicon (SVG "b" s terakota točkom)
- [x] Apple touch icon
- [ ] OG image za društvene mreže (trenutno icon.svg)
- [ ] Prave slike za lokacije (trenutno Wikipedia URL-ovi)

## FUNKCIONALNOST

### Navigacija
- [x] Glavni izbornik (Karta, Rječnik, Kviz, Zbirke)
- [x] Footer linkovi (sve stranice)
- [x] Breadcrumb na stranici riječi
- [x] RječnikNav (tabovi: Zavičajne / Frazemi / Engleski)
- [ ] Breadcrumb na svim stranicama
- [ ] Aktivni link u navigaciji (je-aktivan)

### Rječnik
- [x] Pretraga bez obzira na dijakritike
- [x] Filtri po narječju i temi
- [x] Autocomplete (5 000 riječi)
- [x] Detalj riječi (značenje, primjer, prijevod, ENG, izvor)
- [x] Englesko značenje (ZNACENJA_EN)
- [x] Vanjski linkovi (pravopis.hr, rjecnik.hr, frazemi.ihjj.hr)
- [ ] Sortiranje (po abecedi, po temi, po govoru)
- [ ] Paginacija ("Prikaži još" — već postoji za Engleski)

### Karta
- [x] SVG karta Hrvatske + BiH + susjedi
- [x] 14 govora s pinovima
- [x] Zoom (gumbi, kotačić, dvostruki klik)
- [x] Pan (povlačenje)
- [x] Reset (⟲)
- [x] Tooltip (skriven kad pin izvan pogleda)
- [x] Geolokacija ("Pronađi moj govor")
- [ ] Leaflet/OpenStreetMap (umjesto SVG) — hr-bs-learn ima
- [ ] Filteri na karti (po narječju, po temi)

### Kviz
- [x] 3 tipa pitanja (značenje, mjesto, engleski)
- [x] 3 razine težine (3/4/5 opcija)
- [x] Dijeljenje rezultata (Web Share + clipboard)
- [x] Zapis u statistiku
- [ ] Kviz po kategorijama (tema, narječje, govor)
- [ ] Audio kviz (poslušaj → pogodi riječ)

### Zbirke
- [x] Kreiranje, brisanje, uklanjanje riječi
- [x] Izvoz (JSON), uvoz (datoteka)
- [x] Dijeljenje preko poveznice (base64 u URL-u)
- [ ] Uređivanje naziva zbirke
- [ ] Sortiranje riječi u zbirki

### Zajednica
- [x] Registracija/prijava (JWT)
- [x] Dodavanje riječi (status pending)
- [x] Moderacija (odobri/odbij)
- [x] Prikaz odobrenih/na čekanju
- [ ] Komentari na riječima
- [ ] Uređivanje vlastitih riječi

### Snimke
- [x] MediaRecorder (mikrofon)
- [x] IndexedDB (lokalno)
- [x] Server upload (base64 → BLOB)
- [x] Playback (audio player)
- [ ] Brisanje server snimki
- [ ] Valni oblik (waveform) iz stvarnog zvuka

### Statistika
- [x] Pogledane riječi, kviz rezultati
- [x] Najčešće gledane, po govoru
- [x] Povijest kviza
- [ ] Export statistike (CSV/JSON)
- [ ] Grafički prikaz (chart)

### Standardni rječnik
- [x] 3 197 riječi iz DBnary
- [x] Pretraga, audio izgovor
- [x] Download (35 000 riječi JSON)
- [ ] Paginacija (trenutno prvih 200)
- [ ] Filtri (po vrsti riječi, po duljini)

### Usporedba
- [x] Riječi grupirane po temama
- [x] Pretraga po riječi/značenju/mjestu
- [x] Filteri po temi
- [ ] Usporedba iste riječi u različitim govorima

### Kartice (SRS)
- [x] Flashcards s ponavljanjem razmaka
- [x] "Znam/Ne znam" gumbi
- [x] Brojač naučenog
- [ ] Integracija sa statistikom
- [ ] Export/import napretka

### Podaci
- [x] Export JSON/CSV (riječi, govori, frazemi, sve)
- [ ] API za programski pristup (REST)
- [ ] Dokumentacija API-ja

### Autentifikacija
- [x] Register/login (JWT)
- [x] Uloge (govornik/urednik)
- [x] Auto-promote prvog korisnika
- [x] Prikaz korisnika u navigaciji
- [ ] Zaboravljena lozinka
- [ ] Email verifikacija
- [ ] OAuth (Google, GitHub)

### PWA i offline
- [x] Manifest + service worker
- [x] Offline rad (cache-first)
- [x] Instalabilno
- [ ] Push notifikacije (riječ dana)
- [ ] Background sync

### i18n
- [x] 32 jezika (JSON datoteke)
- [x] Language selector u navigaciji
- [x] Fallback (hr → en)
- [ ] Primijeniti t() na sve stranice (trenutno samo infrastruktura)
- [ ] RTL podrška (arapski, hebrejski, perzijski, urdu)

### Deploy
- [x] Render.com (besplatno)
- [x] Docker
- [x] Vercel (frontend)
- [x] CI/CD (GitHub Actions)
- [ ] HTTPS (automatski na Renderu)
- [ ] Custom domain
- [ ] Monitoring (Sentry, LogRocket)

## Prioriteti za dovršetak

### Visoki (1-2 dana)
1. Primijeniti i18n na sve stranice (zamijeniti hardkodirane stringove s t())
2. Sortiranje u rječniku (po abecedi, temi, govoru)
3. Paginacija u Standardnom rječniku

### Srednji (3-5 dana)
4. Postgres migracija (zamijeniti SQLite)
5. Više tipova vježbi (upisivanje, slušanje)
6. E2E testovi (Playwright)

### Niski (1-2 tjedna)
7. Prave audio snimke na serveru (file storage)
8. Push notifikacije
9. OAuth (Google, GitHub)
10. Grafički prikaz statistike (chart.js)

## Procjena spremnosti

| Kriterij | Status |
|---|---|
| **Alpha (10-50 korisnika)** | ✅ Spremno |
| **Beta (50-500 korisnika)** | ⚠️ Treba Postgres + više testova |
| **Produkcija (1000+ korisnika)** | ❌ Treba skaliranje, CDN, monitoring |