#!/bin/sh
# SessionStart: estado del árbol de trabajo de Setas OS en una pantalla.
#
# Existe para que un agente no gaste su primer ciclo de contexto averiguando
# en qué rama está, si el bundle quedó desfasado, si la compuerta empírica del
# perito puede correr y si los gates de navegador van a fallar por entorno.
# Solo lee: nunca construye, instala ni modifica nada.

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[ -d "$ROOT" ] || exit 0
APP="$ROOT/field-os-simulador/setas-os"

if ! command -v node >/dev/null 2>&1; then
  for d in "$HOME/.nvm/versions/node"/*/bin; do
    [ -x "$d/node" ] && PATH="$d:$PATH"
  done
  export PATH
fi

echo "── Setas OS ──────────────────────────────────────────────"

branch=$(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null)
dirty=$(git -C "$ROOT" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "rama:    $branch (${dirty} archivo(s) sin commitear)"

# Bundle: build.test.js falla si el source-hash no coincide. Avisarlo antes de
# editar evita descubrirlo al final, con el diff ya armado.
if [ -f "$APP/simulador-app.js" ] && [ -f "$APP/simulador-app.jsx" ] && command -v node >/dev/null 2>&1; then
  banner=$(sed -n 's|^// source-hash: \([0-9a-f]\{64\}\)$|\1|p' "$APP/simulador-app.js" | head -1)
  actual=$(node -e 'const c=require("node:crypto"),f=require("node:fs");process.stdout.write(c.createHash("sha256").update(f.readFileSync(process.argv[1])).digest("hex"))' "$APP/simulador-app.jsx" 2>/dev/null)
  if [ -z "$banner" ]; then
    echo "bundle:  SIN BANNER — correr 'node build.js'"
  elif [ "$banner" = "$actual" ]; then
    echo "bundle:  al día"
  else
    echo "bundle:  DESFASADO — correr 'node build.js' y commitear simulador-app.js"
  fi
fi

# Corpus de campo: sin él, perito-regression-report.js sale con código 1 y
# ningún cambio al modelo (analyze/scoring/perito-scenarios) es verificable.
if [ -s "$APP/ground-truth-fixtures.json" ]; then
  n=$(node -e 'const f=require("node:fs");try{const a=JSON.parse(f.readFileSync(process.argv[1],"utf8"));process.stdout.write(String(Array.isArray(a)?a.length:0))}catch(e){process.stdout.write("?")}' "$APP/ground-truth-fixtures.json" 2>/dev/null)
  echo "corpus:  $n lote(s) — compuerta del perito activa"
else
  echo "corpus:  AUSENTE — cambios a analyze()/scoring.js/perito-scenarios.js no son verificables"
fi

# Gates de navegador: fallan por build de Chromium desalineado, no por código.
if [ -n "$SETAS_CHROMIUM_EXECUTABLE" ] && [ -x "$SETAS_CHROMIUM_EXECUTABLE" ]; then
  echo "gates:   Chromium vía SETAS_CHROMIUM_EXECUTABLE"
else
  shell_bin=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell 2>/dev/null | head -1)
  if [ -n "$shell_bin" ]; then
    echo "gates:   si 'npm run test:gates' falla por ejecutable ausente:"
    echo "         export SETAS_CHROMIUM_EXECUTABLE=$shell_bin"
  fi
fi

echo "tests:   npm run test:unit (~5 s, sin navegador) · npm run test:gates (Playwright)"
echo "──────────────────────────────────────────────────────────"
exit 0
