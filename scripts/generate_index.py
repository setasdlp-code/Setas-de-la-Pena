#!/usr/bin/env python3
"""
generate_index.py — Sincroniza knowledge_base/INDEX.yaml con los documentos reales.

INDEX.yaml es un catálogo curado (cabecera, `schema_version`, bloque `schema:` y
entradas con campos editoriales como authority, canonical, topics, keywords,
depends_on, implemented_by). Este script NO lo regenera desde cero: lo edita en
el sitio, línea a línea, y preserva todo lo que no deriva del frontmatter.

Qué hace:
  - Actualiza `title` de una entrada cuando el frontmatter del documento trae
    otro título (INDEX_GENERATION_SPEC.md §5.2: el título se copia del frontmatter).
  - Actualiza `path` cuando una entrada apunta a un archivo inexistente y hay
    exactamente un documento sin indexar con el mismo título o el mismo nombre
    de archivo (movimiento evidente).
  - Añade al final una entrada por cada documento .md con frontmatter que aún no
    está indexado, solo con campos derivables del frontmatter. Los campos
    obligatorios que exigen juicio (authority, canonical, status sin valor
    válido en el frontmatter) quedan en `null` y la entrada se marca con un
    comentario «PENDING REVIEW»: nunca se adivinan (spec §2, «fail closed»).
  - Informa, sin borrarlas, las entradas cuyo archivo no existe, los documentos
    sin frontmatter (no se indexan) y las diferencias informativas de
    category/confidence frente al frontmatter (no se reescriben: son curadas).

Uso:
    python3 scripts/generate_index.py            # aplica los cambios
    python3 scripts/generate_index.py --check    # solo informa; exit 1 si hay deriva
    python3 scripts/generate_index.py --dry-run  # informa y muestra el diff, sin escribir
"""

from __future__ import annotations

import argparse
import difflib
import json
import os
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parent.parent
KB_ROOT = REPO_ROOT / "knowledge_base"
INDEX_NAME = "INDEX.yaml"

# Directorios que no se catalogan (material histórico / binarios).
SKIP_DIRS = {"archive_phase0", "source_pdfs", "archive"}

PENDING_MARKER = "# PENDING REVIEW — added by scripts/generate_index.py from frontmatter."
PENDING_NOTE = "# authority / canonical / status stay null until curated against CANON §14."

ENTRY_START = re.compile(r"^  - id:\s*(.+?)\s*$")
FIELD_LINE = {name: re.compile(rf"^    {name}:\s*(.*?)\s*$") for name in ("title", "path")}
PLAIN_SCALAR = re.compile(r"^[A-Za-z0-9][A-Za-z0-9 ._/()-]*$")


class IndexLayoutError(RuntimeError):
    """INDEX.yaml no tiene la forma que este script sabe editar sin pérdida."""


@dataclass
class Report:
    title_updates: list[tuple[str, str, str]] = field(default_factory=list)  # id, old, new
    path_updates: list[tuple[str, str, str]] = field(default_factory=list)  # id, old, new
    added: list[tuple[str, str]] = field(default_factory=list)  # id, path
    orphans: list[tuple[str, str]] = field(default_factory=list)  # id, path
    no_frontmatter: list[str] = field(default_factory=list)
    skipped_new: list[tuple[str, str]] = field(default_factory=list)  # path, reason
    unresolved_related: list[tuple[str, str]] = field(default_factory=list)  # path, ref
    info_drift: list[str] = field(default_factory=list)
    pending_review: list[str] = field(default_factory=list)

    @property
    def has_drift(self) -> bool:
        return bool(self.title_updates or self.path_updates or self.added or self.orphans)

    def render(self) -> str:
        out: list[str] = []

        def section(title: str, rows: list[str]) -> None:
            if rows:
                out.append(f"{title} ({len(rows)}):")
                out.extend(f"  - {r}" for r in rows)

        section("title actualizado desde frontmatter", [f"{i}: {o!r} -> {n!r}" for i, o, n in self.title_updates])
        section("path actualizado (movimiento detectado)", [f"{i}: {o} -> {n}" for i, o, n in self.path_updates])
        section("entradas nuevas (PENDING REVIEW)", [f"{i}: {p}" for i, p in self.added])
        section("entradas cuyo archivo no existe (NO se borran)", [f"{i}: {p}" for i, p in self.orphans])
        section("documentos sin frontmatter válido (no indexados)", self.no_frontmatter)
        section("documentos nuevos omitidos", [f"{p}: {r}" for p, r in self.skipped_new])
        section("related_documents sin resolver (omitidos)", [f"{p}: {r}" for p, r in self.unresolved_related])
        section("diferencias informativas con el frontmatter (no se reescriben)", self.info_drift)
        section("entradas con campos obligatorios en null (requieren curación)", self.pending_review)
        if not out:
            out.append("INDEX.yaml está sincronizado con el frontmatter.")
        return "\n".join(out)


# ---------------------------------------------------------------------------
# Lectura
# ---------------------------------------------------------------------------

def extract_frontmatter(filepath: Path) -> dict | None:
    try:
        content = filepath.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None
    match = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return None
    try:
        data = yaml.safe_load(match.group(1))
    except yaml.YAMLError:
        return None
    return data if isinstance(data, dict) else None


def discover_documents(kb_root: Path) -> list[str]:
    """Rutas .md relativas a knowledge_base/, ordenadas."""
    found: list[str] = []
    for root, dirs, files in os.walk(kb_root):
        dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS and not d.startswith("."))
        for name in files:
            if name.endswith(".md"):
                found.append((Path(root) / name).relative_to(kb_root).as_posix())
    return sorted(found)


def resolve_entry_path(kb_root: Path, raw: str) -> Path:
    # Misma convención que scripts/quality/check_repository.py.
    if raw.startswith("/"):
        return kb_root.parent / raw.lstrip("/")
    return kb_root / raw


def locate_entries(lines: list[str], documents: list[dict]) -> list[tuple[int, int]]:
    """(inicio, fin) de cada entrada de `documents:` en el texto, alineado con el YAML."""
    try:
        doc_start = next(i for i, ln in enumerate(lines) if ln.rstrip("\n") == "documents:")
    except StopIteration as exc:
        raise IndexLayoutError("no se encontró la clave de primer nivel `documents:`") from exc
    starts = [i for i in range(doc_start + 1, len(lines)) if ENTRY_START.match(lines[i])]
    if len(starts) != len(documents):
        raise IndexLayoutError(
            f"{len(starts)} líneas `  - id:` frente a {len(documents)} entradas YAML"
        )
    spans = []
    for n, start in enumerate(starts):
        end = starts[n + 1] if n + 1 < len(starts) else len(lines)
        got = yaml.safe_load(ENTRY_START.match(lines[start]).group(1))
        if got != documents[n].get("id"):
            raise IndexLayoutError(f"entrada {n}: id en texto {got!r} != id YAML {documents[n].get('id')!r}")
        spans.append((start, end))
    return spans


# ---------------------------------------------------------------------------
# Escritura
# ---------------------------------------------------------------------------

def fmt_scalar(value) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    text = str(value)
    if PLAIN_SCALAR.match(text) and text.lower() not in {"null", "true", "false", "yes", "no", "on", "off"}:
        return text
    return json.dumps(text, ensure_ascii=False)


def fmt_title(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def fmt_list(values: list[str]) -> str:
    return "[" + ", ".join(fmt_scalar(v) for v in values) + "]"


def slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def candidate_ids(rel_path: str) -> list[str]:
    p = Path(rel_path)
    stem = slug(p.stem)
    parent = slug(p.parent.name) if p.parent.name else ""
    if p.stem.upper() == "README" and parent:
        return [f"{parent}-readme"]
    out = [stem]
    if parent:
        out.append(f"{parent}-{stem}")
    return out


def resolve_related(ref: str, rel_path: str, path_to_id: dict[str, str]) -> str | None:
    if not isinstance(ref, str) or not ref.strip():
        return None
    ref = ref.strip().split("#", 1)[0]
    doc_dir = Path(rel_path).parent
    options = [
        os.path.normpath((doc_dir / ref).as_posix()),
        os.path.normpath(ref.removeprefix("knowledge_base/")),
    ]
    for opt in options:
        if opt in path_to_id:
            return path_to_id[opt]
    base = Path(ref).name
    matches = [i for p, i in path_to_id.items() if Path(p).name == base]
    return matches[0] if len(matches) == 1 else None


def vocab(schema: dict, name: str) -> set[str]:
    values = (schema.get(name) or {}).get("controlled_vocabulary") or []
    return {str(v) for v in values}


# ---------------------------------------------------------------------------
# Núcleo
# ---------------------------------------------------------------------------

def sync_index(text: str, kb_root: Path) -> tuple[str, Report]:
    """Devuelve (nuevo texto de INDEX.yaml, informe). Función pura sobre el árbol."""
    data = yaml.safe_load(text) or {}
    documents = data.get("documents")
    if not isinstance(documents, list):
        raise IndexLayoutError("`documents:` no es una lista")
    schema = data.get("schema") or {}
    categories = vocab(schema, "category")
    confidences = vocab(schema, "confidence")
    statuses = vocab(schema, "status")

    lines = text.splitlines(keepends=True)
    spans = locate_entries(lines, documents)
    report = Report()

    indexed_paths = {e.get("path") for e in documents}
    discovered = discover_documents(kb_root)
    unindexed = [p for p in discovered if p not in indexed_paths]
    frontmatter = {p: extract_frontmatter(kb_root / p) for p in discovered}

    replacements: dict[int, str] = {}  # índice de línea -> nueva línea

    def set_field(idx: int, name: str, new_value: str) -> bool:
        start, end = spans[idx]
        for i in range(start, end):
            m = FIELD_LINE[name].match(lines[i].rstrip("\n"))
            if m:
                replacements[i] = f"    {name}: {new_value}\n"
                return True
        return False

    # 1) Entradas cuyo archivo no existe: movimiento evidente o huérfana.
    claimed: set[str] = set()
    for idx, entry in enumerate(documents):
        raw = entry.get("path") or ""
        if raw and resolve_entry_path(kb_root, raw).exists():
            continue
        title = entry.get("title")
        basename = Path(raw).name
        matches = [
            p for p in unindexed
            if p not in claimed and (
                (isinstance(title, str) and (frontmatter.get(p) or {}).get("title") == title)
                or (basename and Path(p).name == basename)
            )
        ]
        if len(matches) == 1 and set_field(idx, "path", fmt_scalar(matches[0])):
            claimed.add(matches[0])
            entry["path"] = matches[0]
            report.path_updates.append((entry.get("id"), raw, matches[0]))
        else:
            report.orphans.append((entry.get("id"), raw))

    # 2) Campos de entradas existentes que vienen del frontmatter.
    for idx, entry in enumerate(documents):
        fm = frontmatter.get(entry.get("path"))
        if fm is None:
            continue
        fm_title = fm.get("title")
        if isinstance(fm_title, str) and fm_title.strip() and fm_title != entry.get("title"):
            if set_field(idx, "title", fmt_title(fm_title)):
                report.title_updates.append((entry.get("id"), entry.get("title"), fm_title))
        elif fm_title is not None and not isinstance(fm_title, str):
            report.info_drift.append(f"{entry.get('id')}: title del frontmatter no es texto ({fm_title!r})")
        for name in ("category", "confidence"):
            if name in fm and fm[name] != entry.get(name):
                report.info_drift.append(
                    f"{entry.get('id')}: {name} INDEX={entry.get(name)!r} frontmatter={fm[name]!r}"
                )

    # 3) Documentos sin indexar -> entradas nuevas marcadas para revisión.
    path_to_id = {e.get("path"): e.get("id") for e in documents}
    used_ids = set(path_to_id.values())
    planned: list[tuple[str, str, dict]] = []
    for rel in unindexed:
        if rel in claimed:
            continue
        fm = frontmatter.get(rel)
        if fm is None:
            report.no_frontmatter.append(rel)
            continue
        fm_title = fm.get("title")
        if not isinstance(fm_title, str) or not fm_title.strip():
            report.skipped_new.append((rel, "frontmatter sin `title` de texto (spec §5.2)"))
            continue
        new_id = next((c for c in candidate_ids(rel) if c and c not in used_ids), None)
        if new_id is None:
            report.skipped_new.append((rel, f"id derivado en colisión: {candidate_ids(rel)} (spec §5.1)"))
            continue
        used_ids.add(new_id)
        path_to_id[rel] = new_id
        planned.append((new_id, rel, fm))

    blocks: list[str] = []
    for new_id, rel, fm in planned:
        category = fm.get("category") if str(fm.get("category")) in categories else None
        confidence = fm.get("confidence") if str(fm.get("confidence")) in confidences else None
        status = fm.get("status") if str(fm.get("status")) in statuses else None
        related: list[str] = []
        refs = fm.get("related_documents") or []
        for ref in refs if isinstance(refs, list) else []:
            target = resolve_related(ref, rel, path_to_id)
            if target is None:
                report.unresolved_related.append((rel, str(ref)))
            elif target != new_id and target not in related:
                related.append(target)
        supersedes = fm.get("supersedes")
        supersedes_id = resolve_related(supersedes, rel, path_to_id) if supersedes else None

        block = [
            "",
            f"  {PENDING_MARKER}",
            f"  {PENDING_NOTE}",
            f"  - id: {new_id}",
            f"    title: {fmt_title(fm['title'])}",
            f"    path: {fmt_scalar(rel)}",
            "    authority: null",
            f"    category: {fmt_scalar(category)}",
            "    canonical: null",
        ]
        if related:
            block.append(f"    related_documents: {fmt_list(related)}")
        block.append(f"    supersedes: {fmt_scalar(supersedes_id)}")
        if confidence is not None:
            block.append(f"    confidence: {fmt_scalar(confidence)}")
        block.append(f"    status: {fmt_scalar(status)}")
        blocks.append("\n".join(block) + "\n")
        report.added.append((new_id, rel))

    # 4) Entradas (existentes o nuevas) con obligatorios en null.
    for entry in documents:
        missing = [k for k in ("authority", "category", "canonical", "status") if entry.get(k) is None]
        if missing:
            report.pending_review.append(f"{entry.get('id')}: {', '.join(missing)}")
    for new_id, _rel, fm in planned:
        missing = ["authority", "canonical"]
        if str(fm.get("category")) not in categories:
            missing.append("category")
        if str(fm.get("status")) not in statuses:
            missing.append("status")
        report.pending_review.append(f"{new_id}: {', '.join(missing)}")

    new_lines = [replacements.get(i, ln) for i, ln in enumerate(lines)]
    new_text = "".join(new_lines)
    if blocks:
        if not new_text.endswith("\n"):
            new_text += "\n"
        new_text += "".join(blocks)

    # Garantía: el resultado sigue siendo YAML válido y no pierde entradas.
    check = yaml.safe_load(new_text)
    if len(check.get("documents", [])) != len(documents) + len(blocks):
        raise IndexLayoutError("el resultado perdería o duplicaría entradas; no se escribe")
    return new_text, report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="solo informa; exit 1 si hay deriva")
    mode.add_argument("--dry-run", action="store_true", help="informa y muestra el diff sin escribir")
    parser.add_argument("--kb-root", type=Path, default=KB_ROOT, help=argparse.SUPPRESS)
    args = parser.parse_args(argv)

    index_path = args.kb_root / INDEX_NAME
    original = index_path.read_text(encoding="utf-8")
    try:
        new_text, report = sync_index(original, args.kb_root)
    except IndexLayoutError as exc:
        print(f"generate_index.py: no se puede editar INDEX.yaml sin pérdida: {exc}", file=sys.stderr)
        return 2

    print(report.render())

    if args.check:
        return 1 if report.has_drift else 0
    if args.dry_run:
        sys.stdout.writelines(
            difflib.unified_diff(
                original.splitlines(keepends=True), new_text.splitlines(keepends=True),
                "INDEX.yaml", "INDEX.yaml (propuesto)",
            )
        )
        return 0
    if new_text != original:
        index_path.write_text(new_text, encoding="utf-8")
        print(f"Escrito {index_path}")
    else:
        print("Sin cambios.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
