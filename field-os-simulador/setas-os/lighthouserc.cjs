/**
 * Lighthouse CI configuration — Core Web Vitals gate for Setas OS v5.
 *
 * Enforces Google's mobile "good" CWV thresholds:
 *   - Largest Contentful Paint (LCP) ≤ 2500 ms
 *   - Cumulative Layout Shift (CLS)  ≤ 0.1
 *   - Interaction to Next Paint (INP) ≤ 200 ms
 *
 * INP is a *field* metric with no direct lab audit, so in the lab we gate on
 * Total Blocking Time (TBT) — Lighthouse's recommended lab proxy — at the same
 * budget, and treat the experimental INP audit as a warning where exposed.
 *
 * IMPORTANT — this app has no build step and no framework server:
 *   - `Setas OS v5.dc.html` is a static file (react/react-dom/support.js
 *     vendored directly, no bundler). We use `staticDistDir` — Lighthouse
 *     serves this folder itself, no `startServerCommand` needed.
 *   - The app requires a real Firebase Auth login before showing any real
 *     screen (Hoy/Bodega/Laboratorio…). An anonymous CI runner can never
 *     reach those — so the ONLY page this gate can honestly audit is the
 *     login screen itself. That's still a real, meaningful page: it's the
 *     first thing every operator's phone loads and paints on every visit.
 *     If auth ever gets a CI-safe test account, extend AUDITED_URLS then.
 */

const PORT = 4173;

/** Pages whose budgets are enforced in CI — see the auth note above. */
const AUDITED_URLS = [`http://localhost:${PORT}/Setas%20OS%20v5.dc.html`];

/**
 * Core Web Vitals budgets on mobile — Google's "good" thresholds.
 * These are the values that earn the best Lighthouse scores.
 */
const LCP_BUDGET_MS = 2500; // good — aspirational target, asserted as "warn"
const INP_BUDGET_MS = 200; // good (TBT lab proxy)
const CLS_BUDGET = 0.1; // good

/**
 * Regression ceiling for LCP, asserted as "error".
 *
 * LCP does not yet meet LCP_BUDGET_MS, so gating on 2500 ms would block every
 * PR and teach the team to ignore the gate. Instead the aspirational budget
 * stays a warning and this ceiling — set just above the measured median — is
 * the hard gate. It only ever ratchets DOWN: when a change improves LCP,
 * lower this to the new median plus a small margin so the improvement cannot
 * silently regress. Never raise it to make a red build green.
 *
 * Measured 2026-09-03, local (Apple silicon), median of 3: LCP 3307 ms.
 * 4500 ms leaves ~35% headroom for slower CI runners.
 */
const LCP_CEILING_MS = 4500;

/**
 * 2026-09-03 re-measurement (the CI evidence the note below asked for).
 * `npm run lhci`, median of 3 runs, local Apple silicon, login screen:
 *
 *   performance 0.87 · LCP 3307 ms · TBT 16 ms · CLS 0.067
 *   seo 1.00 · accessibility 0.95 · best-practices 0.96
 *
 * The 2026-09-02 auth-gate change (simulador-app.js imported only after a
 * valid session) did land the improvement it predicted: LCP went ~10.2 s →
 * 3.3 s and TBT ~2.0 s → 16 ms. TBT now passes the 200 ms budget by two
 * orders of magnitude, so it is promoted from "warn" to "error" — it is a
 * real contract again, not a permanently-ignored number. LCP is not there
 * yet, so it gates on LCP_CEILING_MS (see above) instead.
 *
 * PERF_FLOOR moves 0.35 → 0.70. At 0.35 against a measured 0.87 the floor
 * protected nothing: performance could have halved without failing CI.
 * 0.70 is deliberately below the 0.87 median because CI runners are slower
 * than the machine this was measured on — tighten it once CI publishes its
 * own median.
 */

/**
 * Category floors — measured against the real first run (2026-08-07), after
 * fixing the cheap wins this gate surfaced (missing <title>/lang/meta
 * description, icon-only header buttons with no accessible name, font-display
 * swap, Google Fonts preconnect):
 *   performance 0.69 · seo 1.0 · accessibility 1.0 · best-practices 0.93
 *
 * SEO/accessibility/best-practices hit Google's "good" band with real margin —
 * left at the standard floor. Performance did NOT: the app used to render its
 * *entire* UI (every module and species illustration) behind the login overlay.
 * The auth gate now publishes its verified state to simulador-app.jsx, whose
 * lightweight wrapper mounts SimuladorShell only after login; protected shell
 * sections use content-visibility:hidden while auth is pending and defer the
 * climate iframe's src. `loading="lazy"` remains useful for off-screen species
 * images after login, but it was never a sufficient pre-login solution because
 * those images sat in-viewport behind the overlay.
 *
 * PERF_FLOOR remains at 0.35 until CI establishes a new stable baseline. It is
 * deliberately conservative and must not be changed without new measurements.
 *
 * Re-measured 2026-08-09 after merging main (PR #11/#12 — Perito/Formulador
 * improvements): the larger simulador-app.js bundle (537KB→582KB) was still
 * downloaded behind the login overlay. As of 2026-09-02, auth-gate imports
 * that bundle only after a valid session and the protected data runtime are
 * ready; the login screen therefore does not fetch or evaluate it. CI—not
 * this comment—remains the evidence for changing the budget.
 */
const PERF_FLOOR = 0.7;
const SEO_FLOOR = 0.95;
const A11Y_FLOOR = 0.95;
const BEST_PRACTICES_FLOOR = 0.9;

module.exports = {
  ci: {
    collect: {
      staticDistDir: ".",
      url: AUDITED_URLS,
      // Median of multiple runs keeps the gate stable against per-run jitter.
      numberOfRuns: 3,
      settings: {
        onlyCategories: [
          "performance",
          "seo",
          "accessibility",
          "best-practices",
        ],
      },
    },
    assert: {
      aggregationMethod: "median-run",
      assertions: {
        // --- Core Web Vitals budgets (the contract) ---------------------
        // LCP gates on the regression ceiling, not on LCP_BUDGET_MS: at a
        // measured 3307 ms the "good" 2500 ms target is real but unmet, and
        // erroring on it would block every PR on a pre-existing condition.
        // lhci takes one assertion per audit id, so the ceiling is the one
        // that ships; LCP_BUDGET_MS stays the documented target to ratchet
        // toward (see LCP_CEILING_MS above).
        "largest-contentful-paint": [
          "error",
          { maxNumericValue: LCP_CEILING_MS },
        ],
        "cumulative-layout-shift": ["error", { maxNumericValue: CLS_BUDGET }],
        // Promoted warn → error on 2026-09-03: measured 16 ms against a 200 ms
        // budget, so this is an enforceable contract now.
        "total-blocking-time": ["error", { maxNumericValue: INP_BUDGET_MS }],
        "interaction-to-next-paint": [
          "warn",
          { maxNumericValue: INP_BUDGET_MS },
        ],

        // --- Category floors ---------------------------------------------
        "categories:performance": ["error", { minScore: PERF_FLOOR }],
        "categories:seo": ["error", { minScore: SEO_FLOOR }],
        "categories:accessibility": ["error", { minScore: A11Y_FLOOR }],
        "categories:best-practices": [
          "error",
          { minScore: BEST_PRACTICES_FLOOR },
        ],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
