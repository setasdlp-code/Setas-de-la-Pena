#!/usr/bin/env python3
"""Genera «Micología aplicada» (HTML + PDF) desde libro.md, refs.json, figuras/ e img/.

Uso:  python3 build.py            -> libro.html y Micologia_aplicada_v7_Setas_de_la_Pena.pdf
Requiere: weasyprint (pip install weasyprint).

Sintaxis de libro.md
  # front | EYEBROW | Título          sección de portadilla con texto
  # part | I | Título | subtítulo     portada de parte
  # chap | I | 01 | Título           capítulo
  # app | Título                      apéndice
  ## Título                           sección (si empieza con XXX-00 entra al índice de métodos)
  !fig NN | archivo | **Figura NN · Título.** pie     figura (archivo en img/ o figuras/*.svg)
  !plate NN | archivo | pie           lámina a página completa
  |a|b|c|                             tabla (primera fila = cabecera)
  - item / 1. item                    listas
  [@clave, localizador]               cita a refs.json
  @toc @methods @figures @references  índices generados
"""
import html, json, re, sys
from pathlib import Path

ROOT = Path(__file__).parent
EDITION = "VII / 2026"
REFS = json.loads((ROOT / "refs.json").read_text())
ROMAN = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6}


def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)

    def cite(m):
        parts = []
        for c in m.group(1).split(";"):
            c = c.strip().lstrip("@")
            key, _, loc = c.partition(",")
            ref = REFS[key.strip()]
            label = ref["cite"] + (", " + loc.strip() if loc.strip() else "")
            parts.append(f'<a href="#ref-{key.strip()}">{label}</a>')
        return '<span class="cite">(' + "; ".join(parts) + ")</span>"

    t = re.sub(r"\[(@[^\]]+)\]", cite, t)
    # cursivas para nombres científicos
    t = re.sub(r"\b(Lentinula edodes|Lentinus edodes|Hericium erinaceus|Hericium americanum|Hericium coralloides|Pleurotus eryngii|Pleurotus ostreatus|Pleurotus|Hericium|Neyraudia reynaudiana|Stropharia rugosoannulata|Agaricus bisporus|Mycelium Running|The Mushroom Cultivator|Growing Gourmet and Medicinal Mushrooms|H\. erinaceus|H\. americanum|H\. coralloides|P\. eryngii|L\. edodes)\b",
               r"<em>\1</em>", t)
    return t


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower())[:50]


def render(md):
    out, figs, methods = [], [], []
    lines = md.split("\n")
    i = 0
    para = []

    def flush():
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para.clear()

    while i < len(lines):
        l = lines[i]
        if not l.strip():
            flush(); i += 1; continue
        if l.startswith("# "):
            flush()
            kind, *f = [x.strip() for x in l[2:].split("|")]
            if kind == "front":
                out.append(f'<div class="eyebrow chap-eye">{f[0]}</div><h1 class="chap front" id="{slug(f[1])}">{inline(f[1])}</h1>')
            elif kind == "part":
                out.append(f'<section class="part" id="parte-{f[0]}"><div class="eyebrow">PARTE {f[0]}</div>'
                           f'<h1 class="part-title" data-toc="part">{inline(f[1])}</h1><p class="part-sub">{inline(f[2])}</p></section>')
            elif kind == "chap":
                out.append(f'<div class="eyebrow chap-eye">PARTE {f[0]} / CAPÍTULO {f[1]}</div>'
                           f'<h1 class="chap" id="{slug(f[2])}" data-toc="chap">{inline(f[2])}</h1>')
            elif kind == "app":
                out.append(f'<div class="eyebrow chap-eye">APÉNDICE</div><h1 class="chap app" id="{slug(f[0])}" data-toc="app">{inline(f[0])}</h1>')
            i += 1; continue
        if l.startswith("## "):
            flush()
            t = l[3:].strip()
            hid = slug(t)
            if re.match(r"[A-Z]{3}-\d\d ·", t):
                methods.append((t, hid))
            out.append(f'<h2 id="{hid}">{inline(t)}</h2>')
            i += 1; continue
        if l.startswith("!fig ") or l.startswith("!plate "):
            flush()
            kind = l[1:l.index(" ")]
            num, src, cap = [x.strip() for x in l[l.index(" ") + 1:].split("|", 2)]
            title = re.search(r"Figura \d+ · (.+?)\.\*\*", cap).group(1)
            figs.append((num, title))
            svg = ROOT / "figuras" / src.replace(".png", ".svg")
            body = svg.read_text() if svg.exists() else f'<img src="img/{src}" alt="{html.escape(title)}">'
            out.append(f'<figure class="{kind}" id="fig-{num}">{body}<figcaption>{inline(cap)}</figcaption></figure>')
            i += 1; continue
        if l.startswith("|"):
            flush()
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")]); i += 1
            cls = "wide" if len(rows[0]) >= 4 else ""
            h = "".join(f"<th>{inline(c)}</th>" for c in rows[0])
            b = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
            out.append(f'<table class="{cls}"><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table>')
            continue
        m = re.match(r"(- |\d\. )", l)
        if m:
            flush()
            tag = "ul" if m.group(1) == "- " else "ol"
            items = []
            while i < len(lines) and re.match(r"(- |\d\. )", lines[i]):
                items.append("<li>" + inline(re.sub(r"^(- |\d\. )", "", lines[i])) + "</li>"); i += 1
            out.append(f"<{tag}>{''.join(items)}</{tag}>")
            continue
        if l.strip().startswith("@"):
            flush(); out.append(f"<!--{l.strip()}-->"); i += 1; continue
        para.append(l.strip()); i += 1
    flush()
    return "\n".join(out), figs, methods


def toc(body):
    rows = []
    for m in re.finditer(r'<h1 ([^>]*data-toc="(\w+)"[^>]*)>(.*?)</h1>', body):
        attrs, kind, title = m.groups()
        if kind == "part":
            pid = re.findall(r'id="(parte-[IVX]+)"', body[:m.start()])[-1]
            rows.append(f'<li class="toc-part"><a href="#{pid}">{pid.split("-")[1]} · {title}</a></li>')
        else:
            hid = re.search(r'id="([^"]*)"', attrs).group(1)
            rows.append(f'<li class="toc-{kind}"><a href="#{hid}">{title}</a></li>')
    return '<ul class="toc">' + "".join(rows) + "</ul>"


def build():
    md = (ROOT / "libro.md").read_text()
    body, figs, methods = render(md)
    body = body.replace("<!--@toc-->", '<div class="toc-wrap"><div class="eyebrow">GUÍA DE LECTURA</div><h1 class="toc-h">Contenido</h1>' + toc(body) + "</div>")
    body = body.replace("<!--@methods-->", '<ul class="toc idx">' + "".join(f'<li><a href="#{h}">{inline(t)}</a></li>' for t, h in methods) + "</ul>")
    body = body.replace("<!--@figures-->", '<ul class="toc idx">' + "".join(f'<li><a href="#fig-{n}">{n} · {inline(t)}</a></li>' for n, t in figs) + "</ul>")
    used = sorted(set(re.findall(r'href="#ref-([^"]+)"', body)), key=lambda k: REFS[k]["full"].lower())
    refs = "".join(f'<li id="ref-{k}">{html.escape(REFS[k]["full"])} <a class="url" href="{REFS[k]["url"]}">{html.escape(REFS[k]["url"].replace("https://", ""))}</a></li>' for k in used)
    body = body.replace("<!--@references-->", f'<ol class="refs">{refs}</ol>')
    missing = set(REFS) - set(used)
    if missing:
        print("Referencias sin cita en el texto:", ", ".join(sorted(missing)), file=sys.stderr)
    cover = f'''<section class="cover">
<div class="cover-top"><span>SETAS DE LA PEÑA</span><span>CUADERNOS DE MICOLOGÍA / 007</span></div>
<div class="eyebrow">BIOLOGÍA · CULTIVO · INVESTIGACIÓN EXPERIMENTAL</div>
<h1 class="cover-title">Micología<br><em>aplicada.</em></h1>
<p class="cover-sub">Séptima edición de investigación</p>
<div class="plates"><img src="img/plate1.jpg"><img src="img/plate2.jpg"><img src="img/plate3.jpg"></div>
<div class="eyebrow small">LÁMINAS EDITORIALES GENERADAS CON IA · SIN ESCALA</div>
<div class="cover-bottom"><span>SETAS DE LA PEÑA</span><span>TENJO, COLOMBIA · 2026</span></div></section>'''
    css = (ROOT / "libro.css").read_text().replace("{{EDITION}}", EDITION)
    doc = f'''<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Micología aplicada v7 — Biología, cultivo e investigación experimental</title>
<meta name="author" content="Setas de la Peña"><style>{css}</style></head><body>{cover}{body}</body></html>'''
    (ROOT / "libro.html").write_text(doc)
    if "--html" in sys.argv:
        return
    from weasyprint import HTML
    out = ROOT / "Micologia_aplicada_v7_Setas_de_la_Pena.pdf"
    HTML(string=doc, base_url=str(ROOT)).write_pdf(out)
    print("PDF:", out)


if __name__ == "__main__":
    build()
