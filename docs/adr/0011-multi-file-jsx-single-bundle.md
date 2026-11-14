# ADR-0011: Several JSX source files, still one build step and one bundle

Status: Accepted
Date: 2026-11-14
Amends: ADR-0002

## Context

ADR-0002 fixed one build step over one source file: `node build.js` transpiles
`simulador-app.jsx` to `simulador-app.js`. That file grew past 21,000 lines, most
of it a single React component of roughly 14,800 lines. Pure logic had been moving
out to plain `.js` modules through a UMD bridge, but a React component cannot
leave that way: it needs JSX, and the build compiled exactly one JSX file. The
monolith could shrink only at its edges.

## Decision

`build.js` reads an ordered list of JSX files from `jsx-sources.cjs`, joins them
into one text, and transpiles that text in the same single esbuild call. The
output is still one file, `simulador-app.js`, loaded exactly as before.

- The files share one module scope. There are no imports between them; a
  top-level name declared in one is visible in the others. This is deliberate:
  it is what made the split possible without rewriting how thousands of lines
  reference each other.
- `simulador-app.jsx` is last in the list. It registers `window.SimuladorApp`
  and by then everything else is declared.
- A file under `views/` holds only top-level declarations. It must not use, while
  being evaluated, a name declared in a later file. Using it inside a function or
  component is fine.
- The source hash in the bundle banner covers every listed file and its path.
  `build.test.js` recomputes it, and also fails when a `views/*.jsx` file is
  missing from the list or a top-level name is declared in two files.

What ADR-0002 still guarantees: one build step, no dev server, no bundler graph,
the generated bundle committed with its sources, and CI verifying the build
instead of running it.

## Alternatives considered

| Option | Why not |
|---|---|
| Keep one JSX file | Components cannot be extracted; the file stays unreviewable and every branch conflicts in it |
| ES modules with imports, bundled by esbuild | Every cross-reference in 21,000 lines would need an explicit import/export before the first component could move; a large, risky rewrite with no intermediate state |
| One bundle per view, loaded separately | Changes the load order contract in `firebase/auth-gate.js` and the service worker asset list for no benefit at this size |

## Consequences

- Components can move to `views/` one at a time, each move a small diff.
- Shared scope means a name collision between files is possible; the build test
  catches it.
- An evaluation-order mistake (rule above) is not caught by unit tests: it is a
  `ReferenceError` when the bundle loads. Browser tests catch it, so a change
  that moves code between files must run `npm run test:browser`.
- Tests that assert on source text read the joined sources through
  `test-support/jsx-source.js`, not `simulador-app.jsx`, so they do not depend on
  which file a component lives in.
- The shared scope is a stepping stone. Once the files are small, converting them
  to real modules with imports becomes a mechanical change and would get its own
  ADR.

## Source

`field-os-simulador/setas-os/build.js`, `jsx-sources.cjs`, `build.test.js`,
`ARCHITECTURE.md` §4.
