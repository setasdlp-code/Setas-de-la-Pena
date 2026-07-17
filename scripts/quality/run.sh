#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

python3 -m compileall -q ECC mcp scripts/quality build_offline.py fetch_gmail.py
node --check recipe-recommender.js
bash -n push_to_github.sh
python3 scripts/quality/check_repository.py
python3 scripts/quality/smoke_runtime.py
