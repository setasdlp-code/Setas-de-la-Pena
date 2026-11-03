#!/usr/bin/env python3
"""Genera los bloques JSON-LD de Recipe y BreadcrumbList de la web pública.

Lee el HTML de cada página, deriva los datos de las recetas del propio marcado
(título, ingredientes, pasos, tiempo, porciones, ilustración) y escribe los
bloques `<script type="application/ld+json" id="ld-...">` justo después del
bloque Organization/Article existente. No toca precios, disponibilidad ni
valoraciones: la web está en modo piloto y las recetas siguen sin probar.

  python3 scripts/inject_public_structured_data.py          # escribe
  python3 scripts/inject_public_structured_data.py --check  # falla si hay deriva
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = "https://setas-de-la-pena.pages.dev"
HOME = ("Inicio", "/home")

RECIPE_PAGES = ["recetas.html", "recetas-eryngii.html", "recetas-melena.html"]
BREADCRUMBS = {
    "setas.html": [HOME, ("Las setas", "/setas")],
    "cocina.html": [HOME, ("Recetas", "/cocina")],
    "restaurantes.html": [HOME, ("Restaurantes", "/restaurantes")],
    "mundo-micelar.html": [HOME, ("El mundo micelar", "/mundo-micelar")],
    "shiitake.html": [HOME, ("Shiitake", "/shiitake")],
    "recetas.html": [HOME, ("Recetas", "/cocina"), ("Recetas con shiitake", "/recetas")],
    "recetas-eryngii.html": [HOME, ("Recetas", "/cocina"), ("Recetas con eryngii", "/recetas-eryngii")],
    "recetas-melena.html": [HOME, ("Recetas", "/cocina"), ("Recetas con melena de león", "/recetas-melena")],
    "especies/shiitake.html": [HOME, ("Las setas", "/setas"), ("Shiitake", "/especies/shiitake")],
    "especies/melena-de-leon.html": [HOME, ("Las setas", "/setas"), ("Melena de león", "/especies/melena-de-leon")],
    "especies/eryngii.html": [HOME, ("Las setas", "/setas"), ("Eryngii", "/especies/eryngii")],
}

GENERATED = re.compile(
    r'[ \t]*<script type="application/ld\+json" id="ld-(?:recipes|breadcrumb)">.*?</script>\n?',
    re.S,
)
FIRST_LD = re.compile(r'(<script type="application/ld\+json">.*?</script>)\n', re.S)


class RecipeParser(HTMLParser):
    """Recorre `<article class="recipe">` y recoge los campos de cada receta."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.recipes: list[dict] = []
        self.meta: dict[str, str] = {}
        self._cur: dict | None = None
        self._depth = 0
        self._target: list[str] | None = None
        self._h2 = False
        self._after_h2 = False
        self._desc_done = False
        self._p = False
        self._li: list[str] | None = None
        self._link: str | None = None
        self._meta_span = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = (a.get("class") or "").split()
        if tag == "a" and a.get("href", "").startswith("#"):
            self._link = a["href"][1:]
        if tag == "span" and "recipe-shortcut-meta" in cls and self._link:
            self._meta_span = True
            self._target = []
        if tag == "article" and "recipe" in cls:
            self._cur = {"id": a.get("id", ""), "name": "", "description": "",
                         "image": "", "ingredients": [], "steps": []}
            self._depth = 1
            self._desc_done = False
            self._after_h2 = False
            return
        if self._cur is None:
            return
        if tag == "article":
            self._depth += 1
        if tag == "h2":
            self._h2 = True
            self._target = []
        elif tag == "br" and self._h2 and self._target is not None:
            self._target.append(" ")
        elif tag == "p" and self._after_h2 and not self._desc_done:
            self._p = True
            self._target = []
        elif tag == "img" and not self._cur["image"] and "culinary" in a.get("src", ""):
            self._cur["image"] = a["src"]
        elif tag == "li":
            self._li = []
        elif tag in ("ul", "ol") and "recipe-ingredients" in cls:
            self._in_list = "ul"
        elif tag == "ol" and "recipe-steps" in cls:
            self._in_list = "ol"

    _in_list = ""

    def handle_endtag(self, tag):
        if tag == "span" and self._meta_span:
            self.meta[self._link or ""] = "".join(self._target or []).strip()
            self._meta_span, self._target = False, None
        if tag == "a":
            self._link = None
        if self._cur is None:
            return
        if tag == "h2" and self._h2:
            self._cur["name"] = _clean("".join(self._target or [])).rstrip(".")
            self._h2, self._target, self._after_h2 = False, None, True
        elif tag == "p" and self._p:
            self._cur["description"] = _clean("".join(self._target or []))
            self._p, self._target, self._desc_done = False, None, True
        elif tag == "li" and self._li is not None:
            text = _clean("".join(self._li))
            if self._in_list == "ul":
                self._cur["ingredients"].append(text)
            elif self._in_list == "ol":
                self._cur["steps"].append(text)
            self._li = None
        elif tag in ("ul", "ol"):
            self._in_list = ""
        elif tag == "article":
            self._depth -= 1
            if self._depth == 0:
                self.recipes.append(self._cur)
                self._cur = None

    def handle_data(self, data):
        if self._target is not None:
            self._target.append(data)
        if self._li is not None:
            self._li.append(data)


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _max_minutes(meta: str) -> int | None:
    m = re.search(r"(\d+)(?:\s*–\s*(\d+))?\s*min", meta)
    if not m:
        return None
    return int(m.group(2) or m.group(1))


def _yield(meta: str) -> str | None:
    m = re.search(r"min(?:\s+estimados?)?\s*·\s*([^·]+?)\s*(?:·|$)", meta)
    return m.group(1).strip() if m else None


def _abs(src: str) -> str:
    return src if src.startswith("http") else f"{ORIGIN}/{src.lstrip('/')}"


def _page_url(html: str) -> str:
    m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    if not m:
        raise SystemExit("falta canonical")
    return m.group(1)


def recipes_graph(html: str) -> dict:
    parser = RecipeParser()
    parser.feed(html)
    base = _page_url(html)
    graph = []
    for r in parser.recipes:
        if not (r["name"] and r["ingredients"] and r["steps"]):
            raise SystemExit(f"receta incompleta: {r['id']}")
        meta = parser.meta.get(r["id"], "")
        node = {
            "@type": "Recipe",
            "@id": f"{base}#{r['id']}",
            "name": r["name"],
            "description": r["description"],
            "author": {"@id": f"{ORIGIN}/#organization"},
            "recipeIngredient": r["ingredients"],
            "recipeInstructions": [{"@type": "HowToStep", "text": s} for s in r["steps"]],
        }
        if r["image"]:
            node["image"] = _abs(r["image"])
        minutes = _max_minutes(meta)
        if minutes:
            node["totalTime"] = f"PT{minutes}M"
        yld = _yield(meta)
        if yld:
            node["recipeYield"] = yld
        graph.append(node)
    return {"@context": "https://schema.org", "@graph": graph}


def breadcrumb(path: str) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i, "name": name, "item": ORIGIN + url}
            for i, (name, url) in enumerate(BREADCRUMBS[path], 1)
        ],
    }


def _script(ident: str, data: dict) -> str:
    body = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return f'  <script type="application/ld+json" id="{ident}">{body}</script>\n'


def render(path: str) -> str:
    html = (ROOT / path).read_text(encoding="utf-8")
    html = GENERATED.sub("", html)
    blocks = ""
    if path in RECIPE_PAGES:
        blocks += _script("ld-recipes", recipes_graph(html))
    if path in BREADCRUMBS:
        blocks += _script("ld-breadcrumb", breadcrumb(path))
    if not FIRST_LD.search(html):
        raise SystemExit(f"{path}: no hay bloque JSON-LD base")
    return FIRST_LD.sub(lambda m: m.group(1) + "\n" + blocks, html, count=1)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    stale = []
    for path in BREADCRUMBS:
        new = render(path)
        file = ROOT / path
        if file.read_text(encoding="utf-8") != new:
            stale.append(path)
            if not args.check:
                file.write_text(new, encoding="utf-8")
    if args.check and stale:
        print("JSON-LD desactualizado en:", *stale, sep="\n  ")
        return 1
    print("sin cambios" if not stale else f"actualizadas {len(stale)} páginas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
