#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

python3 -m compileall -q ECC mcp scripts/quality build_offline.py fetch_gmail.py
node --check recipe-recommender.js
bash -n push_to_github.sh
python3 scripts/quality/check_repository.py
# Parsing regressions only. check_kb_sync.py itself stays out of the gate until
# its known noise is triaged (see .claude/skills/kb-sync/SKILL.md); this guards
# the extractor against fabricating KB values in the meantime.
python3 scripts/quality/check_kb_sync_parsing.py
python3 scripts/quality/smoke_runtime.py
