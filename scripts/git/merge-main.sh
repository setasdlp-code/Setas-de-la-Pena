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

# El .jsx se fusionó por la vía normal; si hubiera quedado con marcadores, el
# build falla y eso es lo correcto — ese conflicto sí es humano.
if ! (cd "$app_dir" && node build.js); then
  echo "merge-main: 'node build.js' falló. Revisá simulador-app.jsx." >&2
  exit 1
fi

# Comprobación de que el bundle corresponde de verdad al fuente fusionado. Es la
# misma que corre el Gate 1 en CI; fallar aquí es mucho más barato.
if ! (cd "$app_dir" && node build.test.js >/dev/null 2>&1); then
  echo "merge-main: el bundle reconstruido NO corresponde a simulador-app.jsx." >&2
  echo "merge-main: no se commitea nada. Revisá el estado del merge a mano." >&2
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
