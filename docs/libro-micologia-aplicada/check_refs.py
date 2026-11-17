#!/usr/bin/env python3
"""Consulta Crossref para cada DOI de refs.json y registra el resultado.

Escribe crossref.json (metadatos por clave, fecha de consulta) y crossref.md (informe).
Requiere acceso a api.crossref.org. Uso: python3 check_refs.py
"""
import json, re, datetime, urllib.request, urllib.parse
from pathlib import Path

ROOT = Path(__file__).parent
UA = {"User-Agent": "setas-libro-refcheck/1.0"}

def get(url):
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30))

def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())

refs = json.loads((ROOT / "refs.json").read_text())
today = datetime.date.today().isoformat()
out, rows = {}, []
for k, r in sorted(refs.items()):
    m = re.search(r"doi\.org/(.+)", r["url"])
    if not m:
        out[k] = {"estado": "sin DOI", "consultado": today}
        rows.append((k, "sin DOI", "—", "—")); continue
    doi = m.group(1)
    try:
        d = get("https://api.crossref.org/works/" + urllib.parse.quote(doi))["message"]
    except Exception as e:
        out[k] = {"doi": doi, "estado": f"no encontrado en Crossref ({e})", "consultado": today}
        rows.append((k, doi, "no encontrado", "—")); continue
    au = [f"{a.get('family','')}, {a.get('given','')}".strip(", ") for a in d.get("author", [])]
    year = d["issued"]["date-parts"][0][0]
    years = {year} | {d[f]["date-parts"][0][0] for f in ("published-print", "published-online") if d.get(f)}
    meta = {"doi": d["DOI"], "titulo": d["title"][0] if d.get("title") else "", "autores": au, "anio": year,
            "revista": (d.get("container-title") or [""])[0], "volumen": d.get("volume"), "numero": d.get("issue"),
            "paginas": d.get("page") or d.get("article-number"), "tipo": d.get("type"), "consultado": today}
    problems = []
    full = r["full"]
    if au and norm(au[0].split(",")[0]) not in norm(full): problems.append("primer autor")
    if not any(str(y) in full for y in years): problems.append(f"año {sorted(years)}")
    if meta["titulo"] and norm(meta["titulo"])[:40] not in norm(full): problems.append("título")
    meta["estado"] = "coincide" if not problems else "revisar: " + ", ".join(problems)
    out[k] = meta
    rows.append((k, d["DOI"], meta["estado"], f"{au[0] if au else '?'} ({year}) · {meta['revista']} {meta['volumen'] or ''}"))
(ROOT / "crossref.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
md = [f"# Registro Crossref de las fuentes\n\nConsulta: {today}. Generado por `check_refs.py`.\n",
      "|Clave|DOI|Estado|Crossref|", "|---|---|---|---|"]
md += [f"|{a}|{b}|{c}|{d}|" for a, b, c, d in rows]
(ROOT / "crossref.md").write_text("\n".join(md) + "\n")
print("\n".join(md))
