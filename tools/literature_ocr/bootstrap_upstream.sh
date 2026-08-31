#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCK_FILE="${SCRIPT_DIR}/upstream.lock.json"

REPO_URL="$(
  python3 - "${LOCK_FILE}" <<'PY'
import json
import sys
from pathlib import Path
print(json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))["repository"])
PY
)"

PINNED_COMMIT="$(
  python3 - "${LOCK_FILE}" <<'PY'
import json
import sys
from pathlib import Path
print(json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))["commit"])
PY
)"

CACHE_ROOT="${XDG_CACHE_HOME:-$HOME/.cache}/setas-de-la-pena"
TARGET="${CACHE_ROOT}/DeepSeek-OCR-2"

mkdir -p "${CACHE_ROOT}"

if [[ ! -d "${TARGET}/.git" ]]; then
  git clone --filter=blob:none "${REPO_URL}" "${TARGET}"
fi

current_remote="$(git -C "${TARGET}" remote get-url origin)"
if [[ "${current_remote}" != "${REPO_URL}" && "${current_remote}" != "${REPO_URL}.git" ]]; then
  echo "ERROR: unexpected origin for ${TARGET}: ${current_remote}" >&2
  exit 2
fi

git -C "${TARGET}" fetch --depth=1 origin "${PINNED_COMMIT}"
git -C "${TARGET}" checkout --detach "${PINNED_COMMIT}"

actual="$(git -C "${TARGET}" rev-parse HEAD)"
if [[ "${actual}" != "${PINNED_COMMIT}" ]]; then
  echo "ERROR: checkout verification failed: ${actual}" >&2
  exit 2
fi

printf '%s\n' "${TARGET}"
