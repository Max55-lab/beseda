# -*- coding: utf-8 -*-
"""Generira SVG putanje (Hrvatska, BiH, susjedi) i projekciju za Beseda kartu.

Izvori: geoBoundaries gbOpen ADM0 (simplified), CC BY 4.0.
Pokretanje: python scripts/make_map.py  (geodata je u privremenom direktoriju)
"""
import json, math, os

TMP = r"C:\Users\max\AppData\Local\Temp\opencode"
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "data", "map.js")


def ucitaj(iso):
    return json.load(open(os.path.join(TMP, f"{iso.lower()}.geojson"), encoding="utf-8"))


def prstenovi(geo):
    geom = geo["features"][0]["geometry"]
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    return [poly[0] for poly in polys]


hrv = prstenovi(ucitaj("HRV"))
bih = prstenovi(ucitaj("BIH"))

# obuhvat projekcije: Hrvatska + BiH (susjedi su samo kontekst, mogu strjkati)
pts = [p for r in hrv + bih for p in r]
lons = [p[0] for p in pts]
lats = [p[1] for p in pts]
lat_min, lat_max = min(lats), max(lats)
lon_min, lon_max = min(lons), max(lons)
lat_mid = (lat_min + lat_max) / 2

WIDTH = 1000.0
k = math.cos(math.radians(lat_mid))
scale = (WIDTH - 40) / ((lon_max - lon_min) * k)
HEIGHT = round((lat_max - lat_min) * scale + 40, 2)


def project(lon, lat):
    return ((lon - lon_min) * k * scale + 20, (lat_max - lat) * scale + 20)


def rdp(points, eps):
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dmax, idx = 0.0, 0
    for i in range(1, len(points) - 1):
        x0, y0 = points[i]
        den = math.hypot(x2 - x1, y2 - y1)
        d = abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1) / den if den else 0
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return rdp(points[:idx + 1], eps)[:-1] + rdp(points[idx:], eps)
    return [points[0], points[-1]]


def putanja(rings, eps, min_dim=0.0):
    """min_dim: za susjede odbaci sitne prstene (otočiće) ujednolikije od eps-a."""
    parts = []
    total = 0
    for ring in rings:
        if len(ring) > 2 and ring[0] == ring[-1]:
            ring = ring[:-1]
        if min_dim:
            us = [p[0] for p in ring]
            is_ = [p[1] for p in ring]
            if (max(us) - min(us)) * k < min_dim and (max(is_) - min(is_)) < min_dim:
                continue
        pts = [project(lon, lat) for lon, lat in ring]
        pts = rdp(pts, eps)
        if len(pts) < 3:
            continue
        total += len(pts)
        parts.append("M" + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z")
    return "".join(parts), total


hr_path, hr_pts = putanja(hrv, 0.9)
bih_path, bih_pts = putanja(bih, 1.1)

SUSJEDI = ["SVN", "HUN", "SRB", "MNE"]
susjedi = []
for iso in SUSJEDI:
    d, _ = putanja(prstenovi(ucitaj(iso)), 2.2, min_dim=0.35)
    susjedi.append((iso.lower(), d))

# oznake drzava na karti (projicirane u build vremenu)
ETIKETE = [
    ("HRVATSKA", 17.02, 45.66, "glavna"),
    ("BOSNA I", 17.45, 44.3, "glavna"),
    ("HERCEGOVINA", 17.45, 44.17, "glavna"),
    ("SI", 14.6, 46.3, "susjed"),
    ("HUN", 18.1, 46.3, "susjed"),
    ("SRB", 19.4, 44.75, "susjed"),
    ("MNE", 19.1, 42.82, "susjed"),
]

etikete = ",\n".join(
    f'    {{ TEKST: "{t}", X: {project(lon, lat)[0]:.1f}, Y: {project(lon, lat)[1]:.1f}, VRSTA: "{v}" }}'
    for t, lon, lat, v in ETIKETE
)

susjedi_js = ",\n".join(
    f'    {{ ID: "{sid}", PATH: "{d}" }}' for sid, d in susjedi if d
)

js = f"""// Automatski generirano iz geoBoundaries (gbOpen ADM0 simplified): HRV, BIH + susjedi.
// Ravna projekcija: dovoljno tocna za prikaz pinova na karti. CC BY 4.0.
const WIDTH = {WIDTH:.0f};
const HEIGHT = {HEIGHT};
const LON_MIN = {lon_min:.6f};
const LAT_MAX = {lat_max:.6f};
const K = {k:.8f};
const SCALE = {scale:.6f};

export function project(lon, lat) {{
  return [(lon - LON_MIN) * K * SCALE + 20, (LAT_MAX - lat) * SCALE + 20];
}}

export const MAP = {{
  WIDTH,
  HEIGHT,
  PATH: "{hr_path}",
  BIH: "{bih_path}",
  SUSJEDI: [
{susjedi_js},
  ],
  ETIKETE: [
{etikete},
  ],
}};
"""
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write(js)
print(
    "HRV pts:", hr_pts,
    "| BIH pts:", bih_pts,
    "| size:", len(js),
    "| HEIGHT:", HEIGHT,
)
