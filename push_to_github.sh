#!/usr/bin/env bash
# Commit and push an explicitly staged initial repository to a private GitHub remote.
# This script never stages files by itself.
set -euo pipefail

REMOTE_URL="${1:-}"
CONFIRM_PRIVATE="${2:-}"
COMMIT_MESSAGE="${3:-Initial commit: Setas de la Peña}"

if [[ -z "$REMOTE_URL" || "$CONFIRM_PRIVATE" != "--confirm-private" ]]; then
  echo "Uso: bash push_to_github.sh <URL_DEL_REPO> --confirm-private [mensaje]"
  echo "El remoto debe existir, estar vacío y ser PRIVADO."
  exit 1
fi

if [[ ! -d .git ]]; then
  git init -q -b main
fi

if [[ ! -f .gitignore ]]; then
  echo "ERROR: falta .gitignore; se aborta para proteger datos locales."
  exit 1
fi

NESTED_GIT="$({
  find . -mindepth 2 -type d -name .git -print |
    while IFS= read -r git_dir; do
      repo_dir="${git_dir%/.git}/"
      if ! git check-ignore -q "$repo_dir"; then
        echo "$git_dir"
        break
      fi
    done
} || true)"

if [[ -n "$NESTED_GIT" ]]; then
  echo "ERROR: repositorio Git anidado no excluido: $NESTED_GIT"
  exit 1
fi

if git diff --cached --quiet; then
  echo "ERROR: no hay archivos en staging. Este script no ejecuta git add."
  echo "Revisa y prepara el alcance explícitamente antes de publicar."
  exit 1
fi

if [[ -z "$(git config user.name || true)" || -z "$(git config user.email || true)" ]]; then
  echo "ERROR: configura git user.name y user.email antes del commit."
  exit 1
fi

echo "── Alcance preparado ──"
git diff --cached --stat

echo "── Verificación de seguridad ──"
if git diff --cached --name-only | grep -iE '(^|/)(\.env($|\.)|.*credentials.*\.json$|.*token.*\.json$|sdp_emails\.json$|captura-(email|compra)\.html$|knowledge_base/09_research/source_pdfs/)'; then
  echo "ERROR: staging contiene secretos, evidencia personal o caché de fuentes."
  exit 1
fi

if git diff --cached --name-only | grep -q '^climate-bench/'; then
  echo "ERROR: climate-bench debe permanecer como repositorio separado."
  exit 1
fi

OVERSIZED="$(
  git diff --cached --name-only -z |
    while IFS= read -r -d '' file; do
      if [[ -f "$file" ]] && (( $(wc -c < "$file") > 95000000 )); then
        echo "$file"
      fi
    done
)"

if [[ -n "$OVERSIZED" ]]; then
  echo "ERROR: archivos mayores de 95 MB requieren exclusión o Git LFS:"
  echo "$OVERSIZED"
  exit 1
fi

if git rev-parse --verify HEAD >/dev/null 2>&1; then
  git commit -m "$COMMIT_MESSAGE"
else
  git commit -m "$COMMIT_MESSAGE"
fi

git branch -M main

if git remote get-url origin >/dev/null 2>&1; then
  if [[ "$(git remote get-url origin)" != "$REMOTE_URL" ]]; then
    echo "ERROR: origin apunta a otra URL: $(git remote get-url origin)"
    exit 1
  fi
else
  git remote add origin "$REMOTE_URL"
fi

git push -u origin main

echo "Repositorio publicado. Confirma en GitHub que su visibilidad sea privada: $REMOTE_URL"
