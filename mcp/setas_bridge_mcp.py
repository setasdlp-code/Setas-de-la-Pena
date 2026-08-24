#!/usr/bin/env python3
"""
MCP Server — Setas de la Peña — Bridge

Puente de lectura/escritura EN VIVO entre agentes de IA (Claude, ChatGPT,
Codex, Antigravity, ...) y el repositorio del proyecto: `knowledge_base/`,
`field_os/`, `field-os-simulador/`, y documentos sueltos en la raíz.

A diferencia de `setas_mcp.py` (datos de cultivo embebidos en el código,
pensado para consultas rápidas y estables de parámetros de especies), este
servidor NO tiene datos hardcodeados: cada tool lee el filesystem al momento
de la llamada, así que cualquier cliente MCP ve siempre el estado actual del
repo sin necesidad de resincronizar el servidor.

Además de lectura, expone tools de ESCRITURA COORDINADA (append a
CHANGELOG.md, notas en FARM_BRAIN.md) para que varios agentes puedan dejar
registro de cambios sin editar el filesystem a ciegas ni pisarse entre sí.

Ambos servidores (`setas_mcp.py` y este) pueden correr en paralelo: no
comparten estado ni se importan entre sí.
"""

import datetime
import re
from enum import Enum
from pathlib import Path
from typing import Optional

from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, ConfigDict, Field

mcp = FastMCP("setas_bridge_mcp")

# ---------------------------------------------------------------------------
# REPO ROOT + SAFETY
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parents[1]

# Directorios que nunca se listan ni se buscan (ruido o control de versiones).
SKIP_DIR_NAMES = {".git", "node_modules", ".venv", "__pycache__", "dist", "build"}

# Fragmentos de ruta (case-insensitive) que ningún tool de lectura/escritura
# puede tocar, ni siquiera parcialmente — credenciales y secretos del proyecto.
DENYLIST_FRAGMENTS = [
    "gmail_credentials.json",
    "gmail_token.json",
    "field-os-simulador/setas-os/firebase/",
    ".env",
    "credentials",
    "token.json",
    "service_account",
    "secret",
]

# Extensiones de texto que vale la pena leer/buscar. Todo lo demás (imágenes,
# binarios, pdf/docx) se puede listar pero no se busca ni se vuelca completo.
TEXT_EXTENSIONS = {
    ".md", ".yaml", ".yml", ".json", ".txt", ".jsx", ".js", ".html",
    ".css", ".py", ".csv",
}

MAX_READ_BYTES = 200_000  # ~200 KB; suficiente para cualquier doc de la KB.
CHANGELOG_PATH = "knowledge_base/CHANGELOG.md"
FARM_BRAIN_PATH = "knowledge_base/FARM_BRAIN.md"


class BridgeError(ValueError):
    """Error accionable: el mensaje se devuelve tal cual al agente."""


def _is_denied(rel_posix: str) -> bool:
    low = rel_posix.lower()
    return any(frag in low for frag in DENYLIST_FRAGMENTS)


def _resolve_safe_path(rel_path: str) -> Path:
    """Resuelve `rel_path` (relativo a la raíz del repo) y valida que:
    - no escape la raíz del repo (sin `..`, sin rutas absolutas ajenas)
    - no toque nada en la denylist de credenciales/secretos
    Lanza BridgeError con un mensaje accionable si algo falla.
    """
    if not rel_path or rel_path.strip() == "":
        raise BridgeError("Ruta vacía. Usa una ruta relativa a la raíz del repo, p. ej. 'knowledge_base/FARM_BRAIN.md'.")

    candidate = (REPO_ROOT / rel_path).resolve()
    try:
        rel_to_root = candidate.relative_to(REPO_ROOT)
    except ValueError:
        raise BridgeError(
            f"'{rel_path}' resuelve fuera de la raíz del repo. "
            "Usa una ruta relativa dentro del proyecto (sin '..' ni rutas absolutas)."
        )

    rel_posix = rel_to_root.as_posix()
    if _is_denied(rel_posix):
        raise BridgeError(
            f"'{rel_posix}' está en la denylist de credenciales/secretos y no es accesible vía MCP."
        )
    return candidate


def _fmt_size(num_bytes: int) -> str:
    if num_bytes < 1024:
        return f"{num_bytes} B"
    if num_bytes < 1024 * 1024:
        return f"{num_bytes / 1024:.1f} KB"
    return f"{num_bytes / (1024 * 1024):.1f} MB"


# ---------------------------------------------------------------------------
# ENUMS / INPUT MODELS
# ---------------------------------------------------------------------------

class ChangelogTipo(str, Enum):
    ARCH = "ARCH"
    EQUIP = "EQUIP"
    SOP = "SOP"
    SPECIES = "SPECIES"
    DECISION = "DECISION"
    KB = "KB"
    BIZ = "BIZ"


class ReadFileInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    path: str = Field(
        description="Ruta relativa a la raíz del repo, p. ej. 'knowledge_base/FARM_BRAIN.md' o 'field_os/README.md'."
    )


class ListDirectoryInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    path: str = Field(
        default="knowledge_base",
        description="Directorio relativo a la raíz del repo a listar. Por defecto 'knowledge_base'.",
    )
    recursive: bool = Field(
        default=False,
        description="Si es true, recorre subdirectorios (excluyendo .git, node_modules, etc.).",
    )
    max_depth: int = Field(
        default=3, ge=1, le=6,
        description="Profundidad máxima de recursión cuando recursive=true.",
    )


class SearchInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    query: str = Field(min_length=2, description="Texto a buscar (case-insensitive, substring literal, no regex).")
    scope: str = Field(
        default="knowledge_base",
        description="Directorio relativo a la raíz del repo donde buscar. Por defecto 'knowledge_base'.",
    )
    max_results: int = Field(default=25, ge=1, le=100, description="Número máximo de coincidencias a devolver.")


class AppendChangelogInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    tipo: ChangelogTipo = Field(description="Categoría de la entrada, según los tipos definidos en CHANGELOG.md.")
    descripcion: str = Field(min_length=3, description="Descripción concisa del cambio, en español, tono técnico-agrónomo.")
    agente: str = Field(
        default="agente-mcp",
        description="Quién origina el cambio, p. ej. 'claude-code', 'codex', 'antigravity'. Se antepone a la descripción entre corchetes si no es 'agente-mcp'.",
    )
    fecha: Optional[str] = Field(
        default=None,
        description="Fecha ISO (YYYY-MM-DD) de la entrada. Por defecto, hoy (UTC).",
    )


class AppendFarmBrainNoteInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    nota: str = Field(min_length=3, description="Nota operacional a registrar, en español, tono técnico-agrónomo.")
    area: Optional[str] = Field(
        default=None,
        description="Área a la que pertenece la nota, p. ej. 'Martha Tent', 'CLOUDLAB 844', 'Automatización'. Opcional.",
    )
    agente: str = Field(
        default="agente-mcp",
        description="Quién origina la nota, p. ej. 'claude-code', 'codex', 'antigravity'.",
    )


# ---------------------------------------------------------------------------
# TOOL: list_tools
# ---------------------------------------------------------------------------

@mcp.tool(
    name="setas_bridge_list_tools",
    annotations={"readOnlyHint": True, "destructiveHint": False, "idempotentHint": True, "openWorldHint": False},
)
def setas_bridge_list_tools() -> str:
    """Catálogo de tools de este servidor puente. Primer call recomendado
    para entender qué hay disponible antes de leer o escribir en el repo."""
    rows = [
        ("setas_bridge_list_tools", "Este catálogo."),
        ("setas_bridge_read_file", "Lee un archivo del repo en vivo (texto plano, path relativo)."),
        ("setas_bridge_list_directory", "Lista archivos/subdirectorios de una carpeta del repo."),
        ("setas_bridge_search", "Busca un texto literal en archivos bajo un directorio dado."),
        ("setas_bridge_get_farm_brain", "Atajo: contenido íntegro y actual de knowledge_base/FARM_BRAIN.md."),
        ("setas_bridge_get_index", "Atajo: contenido íntegro de knowledge_base/INDEX.yaml (catálogo machine-readable)."),
        ("setas_bridge_append_changelog", "ESCRITURA: agrega una entrada a knowledge_base/CHANGELOG.md."),
        ("setas_bridge_append_farm_brain_note", "ESCRITURA: agrega una nota fechada a FARM_BRAIN.md."),
    ]
    lines = ["# Tools — setas_bridge_mcp\n"]
    for name, desc in rows:
        lines.append(f"- **{name}** — {desc}")
    lines.append(
        "\nTodas las rutas son relativas a la raíz del repo (p. ej. `knowledge_base/01_species/pleurotus_djamor.md`). "
        "Las lecturas son en vivo desde disco — no hay datos embebidos en este servidor. "
        "Las escrituras están limitadas a `CHANGELOG.md` y `FARM_BRAIN.md`; no se puede sobrescribir ni borrar contenido existente, solo agregar entradas nuevas."
    )
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# TOOL: read_file
# ---------------------------------------------------------------------------

@mcp.tool(
    name="setas_bridge_read_file",
    annotations={"readOnlyHint": True, "destructiveHint": False, "idempotentHint": True, "openWorldHint": False},
)
def setas_bridge_read_file(input: ReadFileInput) -> str:
    """Lee el contenido íntegro y actual de un archivo del repo, en vivo desde
    disco. Usa esto para cargar cualquier documento de knowledge_base/,
    field_os/, field-os-simulador/ u otros archivos del proyecto (excepto
    credenciales/secretos, que están bloqueados). Archivos >200KB se truncan
    con una nota explícita."""
    try:
        p = _resolve_safe_path(input.path)
    except BridgeError as e:
        return f"❌ {e}"

    if not p.exists():
        return f"❌ No existe: '{input.path}'. Verifica la ruta con setas_bridge_list_directory."
    if p.is_dir():
        return f"❌ '{input.path}' es un directorio, no un archivo. Usa setas_bridge_list_directory."

    try:
        raw = p.read_bytes()
    except OSError as e:
        return f"❌ No se pudo leer '{input.path}': {e}"

    truncated = len(raw) > MAX_READ_BYTES
    if truncated:
        raw = raw[:MAX_READ_BYTES]

    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        return (
            f"❌ '{input.path}' no parece texto UTF-8 (posible binario/imagen). "
            f"Tamaño: {_fmt_size(p.stat().st_size)}."
        )

    header = f"# {input.path}\n\n"
    if truncated:
        header += f"_(truncado a {_fmt_size(MAX_READ_BYTES)} de {_fmt_size(p.stat().st_size)} — pide un rango más acotado si necesitas el resto)_\n\n"
    return header + text


# ---------------------------------------------------------------------------
# TOOL: list_directory
# ---------------------------------------------------------------------------

@mcp.tool(
    name="setas_bridge_list_directory",
    annotations={"readOnlyHint": True, "destructiveHint": False, "idempotentHint": True, "openWorldHint": False},
)
def setas_bridge_list_directory(input: ListDirectoryInput) -> str:
    """Lista archivos y subdirectorios de una carpeta del repo, en vivo desde
    disco. Usa esto para descubrir qué documentos existen antes de leerlos
    con setas_bridge_read_file, o para explorar carpetas que aún no tienen
    entrada en INDEX.yaml (la mayoría del repo — INDEX.yaml es un catálogo
    parcial, no completo)."""
    try:
        p = _resolve_safe_path(input.path)
    except BridgeError as e:
        return f"❌ {e}"

    if not p.exists():
        return f"❌ No existe el directorio: '{input.path}'."
    if not p.is_dir():
        return f"❌ '{input.path}' es un archivo, no un directorio. Usa setas_bridge_read_file."

    lines = [f"# {input.path}/\n"]

    def _walk(dir_path: Path, depth: int, prefix: str) -> None:
        try:
            entries = sorted(dir_path.iterdir(), key=lambda e: (e.is_file(), e.name.lower()))
        except OSError as e:
            lines.append(f"{prefix}⚠️ no se pudo listar: {e}")
            return
        for entry in entries:
            if entry.name in SKIP_DIR_NAMES:
                continue
            rel = entry.relative_to(REPO_ROOT).as_posix()
            if _is_denied(rel):
                continue
            if entry.is_dir():
                lines.append(f"{prefix}- **{entry.name}/**")
                if input.recursive and depth < input.max_depth:
                    _walk(entry, depth + 1, prefix + "  ")
            else:
                size = _fmt_size(entry.stat().st_size)
                lines.append(f"{prefix}- {entry.name} ({size})")

    _walk(p, 1, "")
    if len(lines) == 1:
        lines.append("_(vacío)_")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# TOOL: search
# ---------------------------------------------------------------------------

@mcp.tool(
    name="setas_bridge_search",
    annotations={"readOnlyHint": True, "destructiveHint": False, "idempotentHint": True, "openWorldHint": False},
)
def setas_bridge_search(input: SearchInput) -> str:
    """Busca un texto literal (case-insensitive) en archivos de texto bajo un
    directorio del repo, en vivo desde disco. Útil para encontrar en qué
    documento vive un tema antes de cargarlo completo con
    setas_bridge_read_file — evita adivinar rutas o cargar la KB entera."""
    try:
        base = _resolve_safe_path(input.scope)
    except BridgeError as e:
        return f"❌ {e}"

    if not base.exists() or not base.is_dir():
        return f"❌ '{input.scope}' no es un directorio válido del repo."

    needle = input.query.lower()
    results: list[str] = []

    def _walk(dir_path: Path) -> None:
        if len(results) >= input.max_results:
            return
        try:
            entries = sorted(dir_path.iterdir(), key=lambda e: e.name.lower())
        except OSError:
            return
        for entry in entries:
            if len(results) >= input.max_results:
                return
            if entry.name in SKIP_DIR_NAMES:
                continue
            rel = entry.relative_to(REPO_ROOT).as_posix()
            if _is_denied(rel):
                continue
            if entry.is_dir():
                _walk(entry)
                continue
            if entry.suffix.lower() not in TEXT_EXTENSIONS:
                continue
            try:
                text = entry.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            for lineno, line in enumerate(text.splitlines(), start=1):
                if needle in line.lower():
                    snippet = line.strip()
                    if len(snippet) > 160:
                        snippet = snippet[:157] + "..."
                    results.append(f"- `{rel}:{lineno}` — {snippet}")
                    if len(results) >= input.max_results:
                        break

    _walk(base)

    if not results:
        return f"Sin coincidencias para '{input.query}' bajo '{input.scope}'."

    header = f"# Búsqueda: '{input.query}' en {input.scope}/\n\n{len(results)} resultado(s):\n\n"
    return header + "\n".join(results)


# ---------------------------------------------------------------------------
# TOOL: get_farm_brain / get_index (atajos)
# ---------------------------------------------------------------------------

@mcp.tool(
    name="setas_bridge_get_farm_brain",
    annotations={"readOnlyHint": True, "destructiveHint": False, "idempotentHint": True, "openWorldHint": False},
)
def setas_bridge_get_farm_brain() -> str:
    """Atajo: contenido íntegro y actual de knowledge_base/FARM_BRAIN.md, el
    snapshot operacional que debe cargarse primero según README_MCP.md. Lee
    en vivo desde disco, así que siempre refleja el estado más reciente
    incluyendo notas agregadas vía setas_bridge_append_farm_brain_note."""
    return setas_bridge_read_file(ReadFileInput(path=FARM_BRAIN_PATH))


@mcp.tool(
    name="setas_bridge_get_index",
    annotations={"readOnlyHint": True, "destructiveHint": False, "idempotentHint": True, "openWorldHint": False},
)
def setas_bridge_get_index() -> str:
    """Atajo: contenido íntegro de knowledge_base/INDEX.yaml, el catálogo
    machine-readable de documentos de la knowledge base (parcial — no cubre
    los ~70 documentos del repo, ver su propio encabezado). Útil para
    resolver id -> path y entender relaciones (depends_on, related_documents)
    antes de leer documentos individuales."""
    return setas_bridge_read_file(ReadFileInput(path="knowledge_base/INDEX.yaml"))


# ---------------------------------------------------------------------------
# TOOL: append_changelog (ESCRITURA)
# ---------------------------------------------------------------------------

def _insert_changelog_entry(text: str, date: str, tipo: str, descripcion: str) -> str:
    year = date.split("-")[0]
    year_header = f"## {year}"
    date_header = f"### {date}"
    row = f"| `[{tipo}]` | {descripcion} |"

    date_idx = text.find(date_header)
    if date_idx != -1:
        # Ya existe una sección para esta fecha: agregar fila a su tabla.
        sep_idx = text.find("|---|---|", date_idx)
        if sep_idx == -1:
            raise BridgeError(
                f"La sección '{date_header}' existe pero no tiene una tabla con el formato esperado "
                "('| Tipo | Descripción |' / '|---|---|'). Revisa CHANGELOG.md manualmente."
            )
        insert_at = text.find("\n", sep_idx) + 1
        # Avanzar hasta el final de las filas existentes de esa tabla (líneas que empiezan con '|').
        while text[insert_at:insert_at + 1] == "|":
            insert_at = text.find("\n", insert_at) + 1
        return text[:insert_at] + row + "\n" + text[insert_at:]

    year_idx = text.find(year_header)
    new_section = f"{date_header}\n\n| Tipo | Descripción |\n|---|---|\n{row}\n\n"
    if year_idx != -1:
        # Año existe, insertar la nueva fecha como primera subsección (más reciente arriba).
        insert_at = text.find("\n", year_idx) + 1
        # Saltar línea en blanco tras el encabezado de año, si existe.
        if text[insert_at:insert_at + 1] == "\n":
            insert_at += 1
        return text[:insert_at] + new_section + text[insert_at:]

    # Año no existe todavía: agregar sección de año completa antes del primer
    # '## ' existente (o al final si no hay ninguno), para mantener orden
    # cronológico descendente.
    first_h2 = text.find("\n## ")
    new_year_block = f"## {year}\n\n{new_section}"
    if first_h2 != -1:
        insert_at = first_h2 + 1
        return text[:insert_at] + new_year_block + text[insert_at:]
    return text.rstrip("\n") + "\n\n" + new_year_block


@mcp.tool(
    name="setas_bridge_append_changelog",
    annotations={"readOnlyHint": False, "destructiveHint": False, "idempotentHint": False, "openWorldHint": False},
)
def setas_bridge_append_changelog(input: AppendChangelogInput) -> str:
    """ESCRITURA COORDINADA: agrega una entrada a knowledge_base/CHANGELOG.md
    bajo la fecha indicada (hoy por defecto), respetando el formato de tabla
    existente (tipo + descripción) y el orden cronológico descendente del
    archivo. Solo agrega — nunca modifica ni borra entradas existentes. Usa
    esto quien registre un cambio significativo de arquitectura, equipo, SOP,
    especie activa, decisión operacional, documento de KB o condición de
    negocio, para que otros agentes vean el cambio sin tener que adivinar qué
    se tocó."""
    date = input.fecha or datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d")
    try:
        datetime.date.fromisoformat(date)
    except ValueError:
        return f"❌ Fecha inválida: '{date}'. Usa formato YYYY-MM-DD."

    try:
        p = _resolve_safe_path(CHANGELOG_PATH)
    except BridgeError as e:
        return f"❌ {e}"
    if not p.exists():
        return f"❌ No se encontró {CHANGELOG_PATH}. No se puede agregar la entrada."

    descripcion = input.descripcion.strip()
    if input.agente and input.agente != "agente-mcp":
        descripcion = f"({input.agente}) {descripcion}"

    text = p.read_text(encoding="utf-8")
    try:
        new_text = _insert_changelog_entry(text, date, input.tipo.value, descripcion)
    except BridgeError as e:
        return f"❌ {e}"

    p.write_text(new_text, encoding="utf-8")
    return (
        f"✅ Entrada agregada a {CHANGELOG_PATH} bajo **{date}**:\n\n"
        f"| Tipo | Descripción |\n|---|---|\n| `[{input.tipo.value}]` | {descripcion} |\n\n"
        "Recuerda commitear el cambio en git para que quede en el historial del repo."
    )


# ---------------------------------------------------------------------------
# TOOL: append_farm_brain_note (ESCRITURA)
# ---------------------------------------------------------------------------

FARM_BRAIN_NOTES_HEADER = "## Registro de Cambios Recientes (vía MCP)"


@mcp.tool(
    name="setas_bridge_append_farm_brain_note",
    annotations={"readOnlyHint": False, "destructiveHint": False, "idempotentHint": False, "openWorldHint": False},
)
def setas_bridge_append_farm_brain_note(input: AppendFarmBrainNoteInput) -> str:
    """ESCRITURA COORDINADA: agrega una nota fechada a
    knowledge_base/FARM_BRAIN.md bajo una sección dedicada al final del
    archivo ('## Registro de Cambios Recientes (vía MCP)'), sin tocar el
    resto del documento. Usa esto para dejar constancia rápida de un cambio
    de estado operacional (ej. "Martha Tent recibida y en commissioning")
    entre revisiones manuales del Farm Brain — no reemplaza una actualización
    completa del documento, que sigue siendo responsabilidad humana o de una
    edición explícita."""
    try:
        p = _resolve_safe_path(FARM_BRAIN_PATH)
    except BridgeError as e:
        return f"❌ {e}"
    if not p.exists():
        return f"❌ No se encontró {FARM_BRAIN_PATH}. No se puede agregar la nota."

    timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    area_prefix = f"**[{input.area}]** " if input.area else ""
    bullet = f"- `{timestamp}` ({input.agente}) {area_prefix}{input.nota.strip()}"

    text = p.read_text(encoding="utf-8")
    header_idx = text.find(FARM_BRAIN_NOTES_HEADER)
    if header_idx != -1:
        insert_at = text.find("\n", header_idx) + 1
        if text[insert_at:insert_at + 1] == "\n":
            insert_at += 1
        new_text = text[:insert_at] + bullet + "\n" + text[insert_at:]
    else:
        new_text = text.rstrip("\n") + f"\n\n---\n\n{FARM_BRAIN_NOTES_HEADER}\n\n{bullet}\n"

    p.write_text(new_text, encoding="utf-8")
    return (
        f"✅ Nota agregada a {FARM_BRAIN_PATH}:\n\n{bullet}\n\n"
        "Recuerda commitear el cambio en git para que quede en el historial del repo. "
        "Si la nota representa un cambio de estado mayor, considera también incorporarla "
        "a la tabla 'Estado Operacional' del documento en una edición manual."
    )


# ---------------------------------------------------------------------------
# ENTRYPOINT
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    mcp.run()
