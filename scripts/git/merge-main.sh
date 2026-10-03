#!/bin/sh
# Fusiona la rama base trayendo los artefactos generados de Setas OS
# reconstruidos, en vez de resueltos a mano.
#
#     sh scripts/git/merge-main.sh [rama-base]      # por defecto origin/main
#
# POR QUÉ EXISTE
# El bundle de Setas OS está versionado a propósito: deploy.yml sube el
# directorio sin paso de build, y el Gate 1 de CI (build.test.js) exige que el
# bundle commiteado corresponda al fuente. La consecuencia: CUALQUIER rama que
# toque simulador-app.jsx produce un bundle distinto del de main, y cada merge
# conflicta en simulador-app.js y sw.js aunque el .jsx se fusione limpio. El
# 2026-10-03 pasó dos veces en cuatro horas.
#
# La resolución correcta nunca es editarlos ni elegir un lado: el bundle no es
# contenido que se fusione, es una función del fuente. Hay que reconstruirlo del
# .jsx ya fusionado. Este script hace exactamente eso, y nada más.
#
# POR QUÉ NO ES UN DRIVER DE MERGE DE GIT
# Se intentó y NO funciona. Un driver (`merge=...` en .gitattributes) se invoca
# mientras git calcula el merge, cuando el .jsx del árbol de trabajo todavía NO
# es la versión fusionada. Medido: el driver reconstruía desde un fuente a
# medias, el bundle salía con uno de los dos cambios y el Gate 1 fallaba — pero
# git reportaba el merge LIMPIO. Un bundle desactualizado con merge limpio es
# peor que un conflicto visible, así que se descartó el enfoque.
#
# Aquí el orden es el correcto por construcción: primero se deja que git fusione
# todo, y sólo después —con el .jsx definitivo en disco— se reconstruye.
set -eu

base=${1:-origin/main}
repo_root=$(git rev-parse --show-toplevel)
app_dir="$repo_root/field-os-simulador/setas-os"

# Rutas, relativas a la raíz, de lo que este script puede resolver solo.
GENERATED="field-os-simulador/setas-os/simulador-app.js field-os-simulador/setas-os/sw.js"

cd "$repo_root"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "merge-main: hay cambios sin commitear. Commiteá o guardá en stash antes de fusionar." >&2
  exit 1
fi

case "$base" in
  origin/*) git fetch origin "${base#origin/}" ;;
esac

echo "merge-main: fusionando $base…"
if git merge "$base"; then
  echo "merge-main: sin conflictos. Nada que reconstruir."
  exit 0
fi

# Conflictos. Sólo se continúa si TODOS son archivos generados: cualquier otro
# conflicto es una decisión humana y no se toca.
conflicted=$(git diff --name-only --diff-filter=U)
others=""
for f in $conflicted; do
  case " $GENERATED " in
    *" $f "*) ;;
    *) others="$others $f" ;;
  esac
done

if [ -n "$others" ]; then
  echo "merge-main: hay conflictos que NO son archivos generados:" >&2
  for f in $others; do echo "  $f" >&2; done
  echo "merge-main: resolvelos a mano y después corré 'cd field-os-simulador/setas-os && node build.js'" >&2
  echo "merge-main: antes de commitear, para que el bundle corresponda al fuente." >&2
  exit 1
fi

echo "merge-main: sólo conflictúan los generados. Reconstruyendo desde el .jsx fusionado…"

# sw.js necesita un paso previo. `node build.js` sólo RE-ESTAMPA su línea de
# versión, con un regex que exige `// build:cache-version` seguido de
# `const CACHE_VERSION = '...'`. Si el archivo trae marcadores de conflicto, en
# medio queda un `<<<<<<< HEAD`, el regex no coincide y build.js deja sw.js
# intacto CON los marcadores. La primera versión de este script commiteaba eso
# —su verificación sólo corría build.test.js, que mira el bundle y no sw.js— y lo
# descubrió sw.test.js después, con "Unexpected token '<<'".
#
# El conflicto de sw.js es casi siempre sólo esa línea: los dos lados estamparon
# hashes distintos del mismo archivo. En ese caso se puede colapsar tomando un
# lado cualquiera, porque build.js lo re-estampa enseguida. Pero hay que
# COMPROBARLO, no suponerlo: si main además cambió el cuerpo del service worker,
# tomar un lado perdería ese cambio en silencio.
sw_rel="field-os-simulador/setas-os/sw.js"
if git diff --name-only --diff-filter=U | grep -qx "$sw_rel"; then
  sw_ours=$(mktemp)
  sw_theirs=$(mktemp)
  git show ":2:$sw_rel" > "$sw_ours" 2>/dev/null || true
  git show ":3:$sw_rel" > "$sw_theirs" 2>/dev/null || true
  strip='s/^const CACHE_VERSION = .*/const CACHE_VERSION = <estampado>;/'
  if [ -s "$sw_ours" ] && [ -s "$sw_theirs" ] && \
     sed "$strip" "$sw_ours" > "$sw_ours.n" && sed "$strip" "$sw_theirs" > "$sw_theirs.n" && \
     cmp -s "$sw_ours.n" "$sw_theirs.n"; then
    echo "merge-main: el conflicto de sw.js es sólo la versión de caché; se colapsa y build.js la re-estampa."
    cp "$sw_ours" "$app_dir/sw.js"
  else
    rm -f "$sw_ours" "$sw_theirs" "$sw_ours.n" "$sw_theirs.n"
    echo "merge-main: sw.js difiere en algo MÁS que la versión de caché." >&2
    echo "merge-main: eso es un cambio real en el service worker — resolvelo a mano," >&2
    echo "merge-main: corré 'node build.js' y después commiteá." >&2
    exit 1
  fi
  rm -f "$sw_ours" "$sw_theirs" "$sw_ours.n" "$sw_theirs.n"
fi

# El .jsx se fusionó por la vía normal; si hubiera quedado con marcadores, el
# build falla y eso es lo correcto — ese conflicto sí es humano.
if ! (cd "$app_dir" && node build.js); then
  echo "merge-main: 'node build.js' falló. Revisá simulador-app.jsx." >&2
  exit 1
fi

# Ningún generado puede salir con marcadores. Es la comprobación que faltaba:
# build.js puede terminar sin error y dejar marcadores en sw.js, como pasó.
for f in $GENERATED; do
  if grep -qE '^(<<<<<<< |={7}$|>>>>>>> )' "$repo_root/$f" 2>/dev/null; then
    echo "merge-main: $f quedó con marcadores de conflicto. No se commitea nada." >&2
    exit 1
  fi
done

# Y que los generados correspondan de verdad al fuente fusionado. build.test.js
# es el Gate 1 de CI (el bundle); sw.test.js cubre sw.js, que es exactamente lo
# que la primera versión de este script no verificaba.
if ! (cd "$app_dir" && node build.test.js >/dev/null 2>&1); then
  echo "merge-main: el bundle reconstruido NO corresponde a simulador-app.jsx." >&2
  echo "merge-main: no se commitea nada. Revisá el estado del merge a mano." >&2
  exit 1
fi
if ! (cd "$app_dir" && node --test sw.test.js >/dev/null 2>&1); then
  echo "merge-main: sw.js no pasa sw.test.js tras reconstruirlo. No se commitea nada." >&2
  echo "merge-main: corré 'cd field-os-simulador/setas-os && node --test sw.test.js' para ver qué falla." >&2
  exit 1
fi

for f in $GENERATED; do git add "$f"; done

remaining=$(git diff --name-only --diff-filter=U)
if [ -n "$remaining" ]; then
  echo "merge-main: quedan conflictos sin resolver:" >&2
  echo "$remaining" >&2
  exit 1
fi

git commit --no-edit
echo "merge-main: listo. Generados reconstruidos y merge commiteado."
echo "merge-main: corré los tests antes de empujar (npm run test:unit)."
