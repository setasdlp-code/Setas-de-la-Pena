# ADR-0002: Static shell, with one esbuild step for simulador-app.jsx

Status: Accepted
Date: recorded 2026-08-30

## Context

Setas OS began as static HTML/JS/CSS with no bundler. `simulador-app.jsx` later
introduced JSX, which browsers cannot consume directly.

## Decision

The shell (`Setas OS v5.dc.html`) and supporting modules stay static and
dependency-free. Exactly one build step exists: `node build.js` transpiles
`simulador-app.jsx` to `simulador-app.js` via esbuild and writes a SHA-256 of the
source into the generated header. `build.test.js` recomputes that hash and fails on
mismatch.

A React change is complete only when all four hold: the `.jsx` is edited,
`node build.js` has run, the regenerated `simulador-app.js` is in the same commit,
and `node --test *.test.js` passes.

## Consequences

- No dev server, no framework toolchain, no lockfile needed for the static layer.
- The hash guard prevents an edited `.jsx` from silently shipping an unbuilt bundle —
  **but only if the suite runs before merge.**
- Source and generated artifact must be committed together, so diffs are larger.

## CI verifies the build rather than running it

No workflow runs `node build.js`. Instead `build.test.js` reads the
`// source-hash: <sha256>` banner from the committed `simulador-app.js` and compares
it to a fresh hash of `simulador-app.jsx`, failing with "run `node build.js` and
commit the result". That is why the quality workflow needs no build and no
`npm install` — the test suite is pure Node built-ins.

The consequence is that the guard protects `main` only because the suite is a
required check. It does not protect a local working tree.

## Source

`field-os-simulador/setas-os/ARCHITECTURE.md` §4; `build.js`; `build.test.js`.
