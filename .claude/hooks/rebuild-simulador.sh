#!/bin/sh
# Rebuild the Setas OS bundle after edits to simulador-app.jsx.
# build.test.js enforces a source-hash banner, so a stale bundle fails CI.
if ! command -v node >/dev/null 2>&1; then
  for d in "$HOME/.nvm/versions/node"/*/bin; do
    [ -x "$d/node" ] && PATH="$d:$PATH"
  done
  export PATH
fi
f=$(jq -r '.tool_input.file_path // empty')
case "$f" in
  */field-os-simulador/setas-os/simulador-app.jsx) ;;
  *) exit 0 ;;
esac
cd "${CLAUDE_PROJECT_DIR:-.}/field-os-simulador/setas-os" || exit 0
node build.js >&2 || exit 2
