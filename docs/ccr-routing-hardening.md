# CCR routing hardening

This document records the **tested local Claude Code Router (CCR) policy** as of August 30, 2026. It is intentionally credential-free: local SQLite state, provider keys, OAuth data, request bodies, and response logs do not belong in this repository.

## Source of truth

- Sanitized desired state: [`../tools/ccr/desired-state.json`](../tools/ccr/desired-state.json)
- Budget rule script: [`../tools/ccr/routing/budget-by-agent.js`](../tools/ccr/routing/budget-by-agent.js)
- Version-locked installed-package repair: [`../tools/ccr/apply-local-hotfix.mjs`](../tools/ccr/apply-local-hotfix.mjs)

The desired state records ordered rules because CCR uses **first match wins**. In particular, `Budget work by agent` follows `Opus` and precedes `Codex`; its script carries its own Luna → Terra → Sol chain, so the routing-rule wrapper must remain `Off` with no targets.

## Policy

| Work class | Primary | Failure handling |
| --- | --- | --- |
| Claude baseline | `Claude Code API 2/claude-sonnet-5` | Global Terra → Sol |
| Opus rules | `Claude Code API 2/claude-opus-5` | Sol → Sonnet |
| Budget headings | `Codex API/gpt-5.6-luna` | Script: Terra → Sol |
| Codex baseline | `Codex API/gpt-5.6-terra` | Sol → Luna |

`budget-by-agent.js` only recognizes explicit leading headings, case-insensitively:

```text
Luna:
quick factual pass:
evidence intake:
repository triage:
inventory reconciliation:
formatting pass:
test-output triage:
```

This prevents weak-model routing from activating on incidental phrases in a longer request.

## Compatibility hotfix

CCR `3.0.22` required two local code fixes after an Anthropic-shaped Claude Code request fell back to the Codex API:

1. Do not inject Responses `metadata.user_id` when the target base URL is `chatgpt.com/backend-api/codex`; that endpoint rejects `metadata`.
2. For non-Opus Anthropic targets, remove only `context-1m-*` from the forwarded `anthropic-beta` header. Keep all other beta values and preserve `context-1m-*` for Opus.

The installed router package is not committed. After a CCR upgrade or reinstall, verify the repair before relying on Anthropic → Codex fallback:

```sh
node tools/ccr/apply-local-hotfix.mjs --check
```

If—and only if—the installed version is exactly `3.0.22` and the unpatched source anchors still match, apply it with:

```sh
node tools/ccr/apply-local-hotfix.mjs --apply
```

The tool fails closed for any other version, an unexpected source layout, or a partially patched file. Review the installed diff before applying it to a new CCR release.

## Verification

Use CCR Logs after configuration changes; full successful-request sampling and error-body capture are enabled in the desired state. Confirm both the selected model and fallback attempts from the request trace.

Observed on August 30, 2026:

- A Claude-shaped request carrying session metadata reached Terra successfully after the metadata guard.
- Claude and Codex requests with a budget heading each selected Luna in one attempt.
- A normal Codex request selected Terra in one attempt.
- A normal Claude baseline request reached Sonnet, received a provider `429`, then completed through Terra. This verifies the prior malformed-request `400` was removed; it does **not** prove Sonnet was available at that moment.

For a direct health check without printing secrets:

```sh
node tools/ccr/apply-local-hotfix.mjs --check
```

Do not copy `config.sqlite`, `service.json`, provider settings exports, raw Logs entries, or token-bearing URLs into Git or shell history.

## Rollback

1. Disable or remove the affected routing rule in the CCR dashboard; preserve the remaining ordered rules.
2. Restore the installed CCR package through its package manager or reinstall the exact release; do not hand-edit minified code beyond the guarded tool above.
3. Re-run the log-based checks with a non-sensitive request before restoring normal traffic.
