#!/usr/bin/env python3
"""Deterministic repository and knowledge-base quality checks."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[2]
KB = ROOT / "knowledge_base"
MAX_FILE_BYTES = 95 * 1024 * 1024
ID_PATTERN = re.compile(r"^[A-Z]{2,4}-\d{4}$")


class LenientLoader(yaml.SafeLoader):
    """Safe YAML loader that preserves application-specific scalar tags."""


def _unknown_yaml(loader: LenientLoader, node: yaml.Node) -> object:
    if isinstance(node, yaml.ScalarNode):
        return loader.construct_scalar(node)
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    return loader.construct_mapping(node)


LenientLoader.add_constructor(None, _unknown_yaml)


def tracked_files() -> list[Path]:
    result = subprocess.run(
        ["git", "ls-files", "-z"],
        cwd=ROOT,
        check=True,
        capture_output=True,
    )
    return [ROOT / item.decode("utf-8") for item in result.stdout.split(b"\0") if item]


def frontmatter(path: Path) -> dict[str, object] | None:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return None
    parts = re.split(r"^---\s*$", text, maxsplit=2, flags=re.MULTILINE)
    if len(parts) < 3:
        raise ValueError("frontmatter sin delimitador de cierre")
    data = yaml.load(parts[1], Loader=LenientLoader)
    if data is None:
        return {}
    if not isinstance(data, dict):
        raise ValueError("frontmatter no es un mapping")
    return data


def check_structured_files(files: list[Path], errors: list[str]) -> None:
    document_ids: dict[str, Path] = {}
    for path in files:
        relative = path.relative_to(ROOT)
        try:
            if path.suffix == ".json":
                json.loads(path.read_text(encoding="utf-8"))
            elif path.suffix in {".yaml", ".yml"}:
                yaml.load(path.read_text(encoding="utf-8"), Loader=LenientLoader)
            elif path.suffix == ".md":
                metadata = frontmatter(path)
                if metadata and metadata.get("document_id"):
                    document_id = str(metadata["document_id"])
                    owner = document_ids.get(document_id)
                    if owner:
                        errors.append(
                            f"document_id duplicado {document_id}: "
                            f"{owner.relative_to(ROOT)} y {relative}"
                        )
                    document_ids[document_id] = path
        except (UnicodeDecodeError, json.JSONDecodeError, yaml.YAMLError, ValueError) as exc:
            errors.append(f"estructura inválida en {relative}: {exc}")


def check_scope_and_secrets(files: list[Path], errors: list[str]) -> None:
    forbidden_paths = re.compile(
        r"(^|/)(climate-bench|source_pdfs)(/|$)|"
        r"captura-(email|compra)\.html$|(^|/)\.env($|\.)"
    )
    secret_patterns = {
        "AWS access key": re.compile(r"AKIA[0-9A-Z]{16}"),
        "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
        "GitHub token": re.compile(r"gh[pousr]_[A-Za-z0-9_]{20,}"),
        "Amazon order": re.compile(r"\b\d{3}-\d{7}-\d{7}\b"),
    }
    text_suffixes = {
        ".css", ".html", ".js", ".json", ".jsx", ".md", ".py", ".sh",
        ".svg", ".txt", ".yaml", ".yml",
    }

    for path in files:
        relative = path.relative_to(ROOT).as_posix()
        if forbidden_paths.search(relative):
            errors.append(f"ruta prohibida versionada: {relative}")
        if path.stat().st_size > MAX_FILE_BYTES:
            errors.append(f"archivo mayor de 95 MiB: {relative}")
        if path.suffix.lower() not in text_suffixes:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for label, pattern in secret_patterns.items():
            if pattern.search(text):
                errors.append(f"patrón sensible ({label}) en {relative}")


def check_index(errors: list[str]) -> None:
    index_path = KB / "INDEX.yaml"
    if not index_path.exists():
        errors.append("falta knowledge_base/INDEX.yaml")
        return
    data = yaml.load(index_path.read_text(encoding="utf-8"), Loader=LenientLoader) or {}
    for entry in data.get("documents", []):
        raw_path = entry.get("path")
        if not raw_path:
            errors.append(f"entrada INDEX sin path: {entry.get('id', '<sin id>')}")
            continue
        target = ROOT / raw_path.lstrip("/") if raw_path.startswith("/") else KB / raw_path
        if not target.exists():
            errors.append(f"ruta INDEX inexistente: {raw_path}")


def check_equipment_ids(errors: list[str]) -> None:
    data = yaml.load(
        (KB / "metadata/equipment.yaml").read_text(encoding="utf-8"),
        Loader=LenientLoader,
    )
    seen: set[str] = set()
    for item in data.get("equipment", []):
        identifier = str(item.get("id", ""))
        if not ID_PATTERN.fullmatch(identifier):
            errors.append(f"ID de equipo no canónico: {identifier or '<vacío>'}")
        if identifier in seen:
            errors.append(f"ID de equipo duplicado: {identifier}")
        seen.add(identifier)


def check_known_regressions(errors: list[str]) -> None:
    index = (KB / "09_research/literature_index.md").read_text(encoding="utf-8")
    bibliography = (KB / "references/bibliography.md").read_text(encoding="utf-8")
    environmental = (KB / "05_equipment/environmental_control.md").read_text(encoding="utf-8")

    required = {
        "paper_001 no está atribuido a Zurbano 2017":
            "| paper_001 | Zurbano, Bellere & Savilla | 2017 |" in index,
        "paper_002 no está separado como Mori 2008":
            "| paper_002 | Mori et al. | 2008 |" in index,
        "paper_007 no está separado como Mori 2009":
            "| paper_007 | Mori et al. | 2009 |" in index,
        "falta DOI verificado de paper_001":
            "10.22137/ijst.2017.v2n1.03" in bibliography,
        "falta fórmula de ACH con caudal efectivo":
            "ACH estimado = Q efectivo medido" in environmental,
        "falta rango de caudal requerido 8,5–13,6 CFM":
            "8,5 CFM" in environmental and "13,6 CFM" in environmental,
    }
    for message, passed in required.items():
        if not passed:
            errors.append(message)

    active_files = [
        path for path in KB.rglob("*")
        if path.is_file()
        and path.suffix in {".md", ".yaml", ".yml"}
        and path.name not in {"CHANGELOG.md", "DECISIONS.md", "ROADMAP.md"}
    ]
    forbidden_content = {
        "alias de fuente retirado": re.compile(r"SRC-000[56]"),
        "timer FAE fijo retirado": re.compile(
            r"5\s*min\s*ON\s*/\s*20\s*min\s*OFF|\b5/20\b",
            re.IGNORECASE,
        ),
        "ruta arquitectónica obsoleta": re.compile(r"10_living|05_laboratory"),
    }
    for path in active_files:
        text = path.read_text(encoding="utf-8")
        for label, pattern in forbidden_content.items():
            if pattern.search(text):
                errors.append(f"{label} en {path.relative_to(ROOT)}")


def main() -> int:
    errors: list[str] = []
    files = tracked_files()
    check_structured_files(files, errors)
    check_scope_and_secrets(files, errors)
    check_index(errors)
    check_equipment_ids(errors)
    check_known_regressions(errors)

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        print(f"Quality gate failed with {len(errors)} error(s).", file=sys.stderr)
        return 1

    print(f"Quality gate passed: {len(files)} tracked files checked.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
