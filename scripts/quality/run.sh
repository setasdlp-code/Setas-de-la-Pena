#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

# Elegir intérprete.
#
# CI instala mcp/requirements.txt y scripts/quality/requirements.txt en el
# python del runner (.github/workflows/quality.yml), así que ahí `python3` ya
# tiene todo y esta resolución cae en la última rama sin hacer nada.
#
# En un checkout local no hay tal garantía: .venv/ (que crea mcp/run_server.sh)
# lleva las dependencias de MCP pero no las de este directorio, y el python del
# sistema suele llevar lo contrario. Elegir a ciegas cambia un fallo por otro,
# así que se elige el primero que importe TODO lo que la compuerta necesita, y
# si ninguno sirve se dice qué falta y dónde — antes era un ModuleNotFoundError
# crudo en el último paso, después de correr varios minutos de checks.
REQUIRED_MODULES="yaml pydantic mcp"

satisfies() {
  [ -x "$1" ] || return 1
  "$1" - "$REQUIRED_MODULES" <<'PY' >/dev/null 2>&1
import importlib, sys
for name in sys.argv[1].split():
    importlib.import_module(name)
PY
}

missing_for() {
  "$1" - "$REQUIRED_MODULES" 2>/dev/null <<'PY'
import importlib, sys
missing = []
for name in sys.argv[1].split():
    try:
        importlib.import_module(name)
    except Exception:
        missing.append(name)
print(" ".join(missing) or "(ninguno)")
PY
}

PY=""
for candidate in "${SETAS_QUALITY_PYTHON:-}" "$repo_root/.venv/bin/python" "$(command -v python3 || true)"; do
  [ -n "$candidate" ] || continue
  if satisfies "$candidate"; then PY="$candidate"; break; fi
done

if [ -z "$PY" ]; then
  echo "run.sh: ningún intérprete de Python tiene las dependencias de la compuerta." >&2
  for candidate in "${SETAS_QUALITY_PYTHON:-}" "$repo_root/.venv/bin/python" "$(command -v python3 || true)"; do
    [ -n "$candidate" ] || continue
    [ -x "$candidate" ] || continue
    echo "  $candidate → falta: $(missing_for "$candidate")" >&2
  done
  echo "" >&2
  echo "Instalar en uno de ellos (o apuntar SETAS_QUALITY_PYTHON al que quieras usar):" >&2
  echo "  <python> -m pip install -r mcp/requirements.txt -r scripts/quality/requirements.txt" >&2
  exit 1
fi

"$PY" -m compileall -q ECC mcp scripts/quality build_offline.py fetch_gmail.py
node --check recipe-recommender.js
bash -n push_to_github.sh
"$PY" scripts/quality/check_repository.py
# Parsing regressions only. check_kb_sync.py itself stays out of the gate until
# its known noise is triaged (see .claude/skills/kb-sync/SKILL.md); this guards
# the extractor against fabricating KB values in the meantime.
"$PY" scripts/quality/check_kb_sync_parsing.py
"$PY" scripts/quality/smoke_runtime.py
