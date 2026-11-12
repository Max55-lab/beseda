# Beseda — rječnik zavičaja

Radna web aplikacija iz koncepta u `DZ1/`. Audio-rječnik hrvatskih mjesnih govora:
riječ se može **čuti**, **naći na karti** i **naučiti kroz kviz**. Uz to sadrži
**frazeme** i **englesko-hrvatski rječnik** pa je korisna i onima koji hrvatski uče
iz cijeloga svijeta.

## Pokretanje

Potreban je Node.js 20+.

```powershell
cd beseda
npm install
npm run dev
```

Vite ispiše adresu (obično <http://localhost:5173>). Ako je port zauzet, javit će drugi
(npr. 5174).

Ostalo:

```powershell
npm run build     # produkcijska verzija u dist/
npm run preview   # lokalni pregled builda
```

## Što aplikacija radi

| Stranica | Putanja | Sadržaj |
|---|---|---|
| Početna | `/` | pretraga, riječ dana sa zvukom, brojke, pregled karte, najnovije riječi, ponuda za učenje |
| Karta | `/karta` | SVG karta Hrvatske i Bosne i Hercegovine, 12 govora; **zumiranje** (gumbi, kotačić, dvostruki klik), **povlačenje**, klik na pin mijenja panel i popis riječi |
| Rječnik | `/rjecnik` | pretraga bez obzira na dijakritike, filtri po narječju i temi |
| Riječ | `/rjecnik/:id` | značenje, primjer, prijevod, izgovor, englesko značenje, mini karta, povezane riječi |
| Frazemi | `/frazemi` | 45 frazema sa značenjem, primjerom i temom; slučajni frazem, pretraga, link na frazemi.ihjj.hr |
| Engleski | `/engleski` | englesko-hrvatski rječnik (7 337 parova): pretraga na oba jezika, abeceda, slučajne riječi |
| Kviz | `/kviz` | 8 pitanja „Pogodi značenje”, bodovi i povratna informacija |
| Dodaj riječ | `/dodaj` | forma s pregledom uživo; unos se sprema u `localStorage` |
| Profil govora | `/govor/:id` | opis govora, statistike i sve riječi iz tog mjesta |

Zvuk koristi Web Speech API (`hr-HR`, uz `sr`/`bs` kao rezervu) — u ovoj fazi je
**ilustrativan**, ne prava terenska snimka.

## Struktura

```
beseda/
├─ index.html
├─ scripts/make_map.py        # generira SVG putanju Hrvatske iz GeoJSON-a
└─ src/
   ├─ main.jsx, App.jsx       # rute
   ├─ styles.css              # cijeli dizajn sustav (boje, tipografija, komponente)
   ├─ data/
   │  ├─ govori.js            # 14 govora: mjesto, regija, narječje, koordinate (uključujući BiH)
   │  ├─ rijeci.js            # 42 riječi + engleska značenja
   │  ├─ frazemi.js           # 45 frazema: značenje, primjer, tema
   │  ├─ engleski.js          # 7 337 englesko-hrvatskih parova (generirano)
   │  └─ map.js               # generirana putanja + project(lon, lat)
   ├─ lib/
   │  ├─ speech.js            # izgovor preko Web Speech API-ja
   │  ├─ store.js             # localStorage hook za korisničke riječi
   │  ├─ text.js              # normalizacija teksta, riječ dana, shuffle
   │  └─ words.js             # zajednica + korisničke riječi
   ├─ components/             # Layout, CroatiaMap, WordCard, PlayButton, Waveform…
   └─ pages/                  # Home, Karta, Rjecnik, Rijec, Kviz, Dodaj, Govor
```

## Podaci, izvori i licencija

- **Karta** je obični SVG generiran iz geoBoundaries (HRV i BIH ADM0, plus susjedi SI,
  HUN, SRB, MNE) skriptom `scripts/make_map.py`. Nema vanjskih pločica ni interneta,
  pa radi i offline. Izvor: geoBoundaries (CC BY 4.0). Karta obuhvaća i hrvatska
  mjesta u Bosni i Hercegovini, jer se hrvatski narječni prostor proteže i južno od
  današnje državne granice.
- **Autocomplete pri pretrazi** — 5 000 najčešćih hrvatskih riječi (FrequencyWords) kao
  prijedlozi dok tipkaš; postojeće riječi označene kao „u rječniku”.
- **Frazemi** — značenja i primjeri napisani su za ovu aplikaciju prema građi
  [Rječnika frazema IHJJ](https://frazemi.ihjj.hr/); svaki je frazem povezan s
  pretragom na tom rječniku.
- **Englesko-hrvatski rječnik** — parovi su obrađeni iz projekta
  [Rječnik hrvatskih jezika](https://github.com/gigaly/rjecnik-hrvatskih-jezika)
  (dr. Goran Igaly, **GPL-3.0**), skraćeni na najučenije riječi; redoslijed prijevoda
  određen je frekvencijskim popisom ([FrequencyWords](https://github.com/hermitdave/FrequencyWords),
  OpenSubtitles 2018). Zbog GPL-3.0 građe cijela je aplikacija licencirana kao
  **GPL-3.0-or-later** (vidi `LICENSE`).
- **pravopis.hr i rjecnik.hr** ne kopiraju se — na svakoj riječi (i na engleskom
  rječniku) stoje poveznice za provjeru u njihovim pretragama.
- **Paleta** je ista kao u prezentaciji: krem, terakota, senf, kadulja, šljiva;
  naslovi Georgia, tekst Segoe UI.
- **Korisničke riječi** spremaju se pod ključem `beseda:moje-rijeci` i vide se samo u
  tom pregledniku. Brišu se u „Tvoje riječi” na stranici Dodaj.
- **Standalone verzija** — `npm run standalone` stvara jednu datoteku
  `Beseda.html` koja radi izravno otvaranjem (file://), bez servera.

## Ograničenja i sljedeći koraci

1. **Baza i API** — zamijeniti `localStorage` pravim backendom (npr. Supabase/Postgres),
   unos ide na uredničku provjeru prije objave.
2. **Prave snimke** — snimanje mikrofonom, spremanje audiodatoteka, prikaz valnog oblika
   iz stvarnog zvuka.
3. **Računi i uredništvo** — prijava, uloge (govornik, urednik), povijest izmjena.
4. **Više sadržaja** — uvoz još govora, primjera iz korpusa, tematske zbirke.
5. **Kvaliteta prijevoda** — engleski parovi su automatski obrađeni; dio višeznačnih
   riječi može tražiti ručnočišćenje.
6. **Kvaliteta** — testovi, pristupačnost (fokus, tipkovnica), PWA/offline i prava
   optimizacija slika.

> Napomena: riječi su stvarne, ali su snimke i atribucije u ovoj verziji ilustrativne.
