#!/usr/bin/env python3
"""Regression checks for scripts/generate_index.py.

INDEX.yaml is a curated catalog: header comments, `schema_version`, the
`schema:` block and editorial fields (authority, canonical, topics, keywords,
depends_on, implemented_by...) have no source outside the file. An earlier
version of the generator rewrote the file from frontmatter alone and wiped all
of that. These checks pin that the generator only edits what frontmatter owns
(title, path), only appends new entries, never deletes an entry, and is
idempotent — both on a synthetic fixture and on the live knowledge_base/.
"""

from __future__ import annotations

import contextlib
import importlib.util
import io
import sys
import tempfile
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]

INDEX_FIXTURE = """\
# HEADER COMMENT — must survive.
schema_version: "1.0"

schema:
  category:
    type: string
    controlled_vocabulary: [species, research, operations]
  confidence:
    controlled_vocabulary: [high, medium, low, experimental]
  status:
    controlled_vocabulary: [draft, active, deprecated, superseded]

documents:

  # Curated comment above an entry.
  - id: kept
    title: "Old Title"
    path: 01_species/kept.md
    authority: canonical_knowledge
    category: species
    canonical: true
    topics: [curated, topics]
    keywords: [curated keyword]
    depends_on: [moved]
    implemented_by: []
    supersedes: null
    confidence: high
    status: active

  - id: moved
    title: "Moved Doc"
    path: 09_research/old_place.md
    authority: research_library
    category: research
    canonical: false
    topics: [x]
    keywords: [y]
    supersedes: null
    status: active

  - id: gone
    title: "Gone Doc"
    path: 09_research/gone.md
    authority: research_library
    category: research
    canonical: false
    topics: [z]
    keywords: [w]
    supersedes: null
    status: active
"""

FILES = {
    "01_species/kept.md": "---\ntitle: New Title\ncategory: species\nconfidence: medium\n---\nbody\n",
    "09_research/sub/new_place.md": "---\ntitle: Moved Doc\ncategory: research\n---\nbody\n",
    "06_operations/brand_new.md": (
        "---\ntitle: Brand New\ncategory: operations\nconfidence: low\nstatus: draft\n"
        "related_documents:\n  - ../01_species/kept.md\n  - missing.md\n---\nbody\n"
    ),
    "06_operations/no_frontmatter.md": "# No frontmatter\n",
    "archive_phase0/old.md": "---\ntitle: Archived\n---\n",
}


def load_generator():
    path = ROOT / "scripts" / "generate_index.py"
    spec = importlib.util.spec_from_file_location("generate_index", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("No se pudo cargar generate_index.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module  # @dataclass needs the module registered
    spec.loader.exec_module(module)
    return module


def build_fixture(base: Path) -> Path:
    kb = base / "knowledge_base"
    for rel, content in FILES.items():
        target = kb / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
    (kb / "INDEX.yaml").write_text(INDEX_FIXTURE, encoding="utf-8")
    return kb


def check_fixture(g) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        kb = build_fixture(Path(tmp))
        if g.main(["--kb-root", str(kb), "--check"]) != 1:
            raise AssertionError("--check debe salir 1 cuando hay deriva")
        if (kb / "INDEX.yaml").read_text(encoding="utf-8") != INDEX_FIXTURE:
            raise AssertionError("--check no debe escribir")

        new_text, report = g.sync_index(INDEX_FIXTURE, kb)
        old_lines = INDEX_FIXTURE.splitlines()
        new_lines = new_text.splitlines()
        if new_lines[: len(old_lines)] != [
            '    title: "New Title"' if ln == '    title: "Old Title"'
            else "    path: 09_research/sub/new_place.md" if ln == "    path: 09_research/old_place.md"
            else "    confidence: medium" if ln == "    confidence: high"
            else ln
            for ln in old_lines
        ]:
            raise AssertionError("solo title/path/category/confidence de entradas existentes pueden cambiar; el resto se preserva")

        data = yaml.safe_load(new_text)
        by_id = {e["id"]: e for e in data["documents"]}
        kept = by_id["kept"]
        if kept["topics"] != ["curated", "topics"] or kept["depends_on"] != ["moved"] or kept["confidence"] != "medium":
            raise AssertionError(f"campos curados alterados: {kept}")
        if "gone" not in by_id or report.orphans != [("gone", "09_research/gone.md")]:
            raise AssertionError("la entrada huérfana debe informarse y conservarse")
        if by_id["moved"]["path"] != "09_research/sub/new_place.md":
            raise AssertionError("el movimiento evidente debe actualizar path")

        new = by_id.get("brand-new")
        if new is None:
            raise AssertionError(f"falta la entrada nueva: {sorted(by_id)}")
        expected = {
            "path": "06_operations/brand_new.md", "title": "Brand New", "authority": None,
            "canonical": None, "category": "operations", "confidence": "low", "status": "draft",
            "related_documents": ["kept"],
        }
        for key, value in expected.items():
            if new.get(key) != value:
                raise AssertionError(f"entrada nueva {key}={new.get(key)!r}, esperado {value!r}")
        if g.PENDING_MARKER not in new_text:
            raise AssertionError("la entrada nueva debe marcarse PENDING REVIEW")
        if report.no_frontmatter != ["06_operations/no_frontmatter.md"]:
            raise AssertionError(f"sin frontmatter: {report.no_frontmatter}")
        if any("archive_phase0" in p for _i, p in report.added):
            raise AssertionError("archive_phase0 no se cataloga")

        if g.main(["--kb-root", str(kb)]) != 0:
            raise AssertionError("la escritura falló")
        written = (kb / "INDEX.yaml").read_text(encoding="utf-8")
        again, report2 = g.sync_index(written, kb)
        if again != written or report2.added or report2.title_updates or report2.field_updates or report2.path_updates:
            raise AssertionError("una segunda pasada debe ser idempotente")


def check_live_tree_is_not_destructive(g) -> None:
    """Sobre el árbol real: ninguna entrada se pierde y solo cambian title/path/category/confidence."""
    index = ROOT / "knowledge_base" / "INDEX.yaml"
    text = index.read_text(encoding="utf-8")
    new_text, _report = g.sync_index(text, ROOT / "knowledge_base")
    old_lines, new_lines = text.splitlines(), new_text.splitlines()
    if len(new_lines) < len(old_lines):
        raise AssertionError("el generador acortaría INDEX.yaml")
    for n, (a, b) in enumerate(zip(old_lines, new_lines), 1):
        if a != b and not (a.startswith(("    title:", "    path:", "    category:", "    confidence:")) and b[:10] == a[:10]):
            raise AssertionError(f"línea {n} cambiaría fuera de title/path/category/confidence: {a!r} -> {b!r}")
    old_ids = [e["id"] for e in yaml.safe_load(text)["documents"]]
    new_ids = [e["id"] for e in yaml.safe_load(new_text)["documents"]]
    if new_ids[: len(old_ids)] != old_ids:
        raise AssertionError("las entradas existentes deben conservarse en orden")


def main() -> int:
    g = load_generator()
    checks = [check_fixture, check_live_tree_is_not_destructive]
    for check in checks:
        with contextlib.redirect_stdout(io.StringIO()):  # the generator's report is noise here
            check(g)
        print(f"ok  {check.__name__}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
