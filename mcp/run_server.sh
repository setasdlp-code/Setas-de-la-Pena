#!/bin/sh
# Lanzador de los servidores MCP de Setas de la Peña.
#
# Por qué existe: `.mcp.json` apuntaba directo a `.venv/bin/python`, y `.venv/`
# está en .gitignore. En cualquier checkout nuevo (contenedor de agente, clon
# limpio, otra máquina) ese intérprete no existe y los dos servidores fallan con
# ENOENT — que se lee como "el MCP no está configurado" cuando en realidad solo
# falta un paso de instalación que nadie documentó.
#
# Este script hace ese paso idempotente: crea el venv e instala
# mcp/requirements.txt la primera vez, y después solo hace exec.
#
# Uso: run_server.sh <script.py dentro de mcp/>
#
# REGLA CRÍTICA: stdout es el transporte JSON-RPC del servidor MCP. Nada más
# puede escribir ahí. Todo diagnóstico, y toda la salida de pip, va a stderr.

set -e

HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(dirname -- "$HERE")
VENV="$ROOT/.venv"
PY="$VENV/bin/python"
STAMP="$VENV/.setas-mcp-requirements.sha"

server="$1"
if [ -z "$server" ]; then
  echo "run_server.sh: falta el nombre del servidor (setas_mcp.py | setas_bridge_mcp.py)" >&2
  exit 2
fi
if [ ! -f "$HERE/$server" ]; then
  echo "run_server.sh: no existe $HERE/$server" >&2
  exit 2
fi

# Intérprete base para crear el venv. Sin python3 no hay nada que hacer, y hay
# que decirlo con un mensaje legible en vez de un ENOENT.
if [ ! -x "$PY" ]; then
  base=""
  for c in python3 python3.12 python3.11 python; do
    if command -v "$c" >/dev/null 2>&1; then base=$(command -v "$c"); break; fi
  done
  if [ -z "$base" ]; then
    echo "run_server.sh: no se encontró python3 en PATH — no se puede crear $VENV" >&2
    exit 127
  fi
  echo "run_server.sh: creando $VENV con $base" >&2
  "$base" -m venv "$VENV" >&2
fi

# Reinstalar solo si requirements.txt cambió desde la última vez. El sello vive
# dentro del venv, así que un venv borrado vuelve a instalar sin preguntar.
req="$HERE/requirements.txt"
want=$("$PY" -c 'import hashlib,sys;print(hashlib.sha256(open(sys.argv[1],"rb").read()).hexdigest())' "$req" 2>/dev/null || echo "")
have=""
[ -f "$STAMP" ] && have=$(cat "$STAMP" 2>/dev/null || echo "")

if [ -z "$want" ] || [ "$want" != "$have" ]; then
  echo "run_server.sh: instalando dependencias de $req" >&2
  "$PY" -m pip install --quiet --disable-pip-version-check -r "$req" >&2
  [ -n "$want" ] && printf '%s' "$want" > "$STAMP"
fi

exec "$PY" "$HERE/$server"
