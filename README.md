# Paynetic — "Create & Send Payout" prototype

A high-fidelity coded prototype for a global contractor-payout flow. All data is
mocked; there is no backend, auth, or real API. Built to demonstrate UX
architecture, AI-interaction patterns, and design-system thinking.

**Stack:** React 18 · TypeScript · Vite · Tailwind (semantic-token layer) ·
Framer Motion · React Router · Zustand. Headless Radix primitives only (popover,
dialog, tooltip) — no component library.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (INR grouping + settlement math)
npm run build      # typecheck + production build
```

## Where to look

| Route | What it shows |
| --- | --- |
| `/payments` | Dashboard — agent action queue, payouts table, wallet card |
| `/payments/new` | Create payout, manual path — ghost priors, anomaly flag, jurisdiction-aware methods |
| `/payments/new?invoice=inv_006` | Invoice-parsed path — two-pane, per-field AI confidence, hover-linking |
| `/payments/new?invoice=inv_007` | Duplicate-guard interstitial |
| `/payments/review/draft_demo` | **Review & confirm (hero)** — settlement ledger, fee toggle, rate lock, checks, dark-mode toggle |
| `/payments/status/pay_002` | Paid + tracking timeline |
| `/payments/status/pay_009` | Failed + corridor-aware fallback ladder |
| `/payments/bulk` | Bulk approval triage — flagged anomalies, clean rows, hold window |
| `/contractor/pay_002` | Contractor-side remittance view |
| `/system` | Design-system reference (tokens both themes, type scale, states) |

Committing a payout from review creates a live entry that appears on the
dashboard table and its own status page (session-only; a full reload resets).

## Design spine

- **Money is typographic material.** Every amount is IBM Plex Mono, tabular,
  sized by importance; the settlement ledger is the visual signature.
- **Violet = AI, and only AI.** Chips, agent cards, and provenance are violet;
  primary actions are near-black. Grep `-ai` to audit.
- **Two-layer tokens.** Primitives → semantic; dark mode remaps the semantic
  layer only. Tailwind colors map exclusively to semantic vars.
- **Three AI laws** (with-invoice AI proposes / human verifies; confidence sets
  interaction weight; disbursement is always a human commit) run through the
  create, review, and bulk surfaces.

All money math lives in [`src/lib/settlement.ts`](src/lib/settlement.ts);
formatting (incl. Indian 2,2,3 grouping) in [`src/lib/format.ts`](src/lib/format.ts).
Decisions where the spec was silent are logged in [`DECISIONS.md`](DECISIONS.md).
