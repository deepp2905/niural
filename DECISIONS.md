# Decisions log

Smallest-reasonable-decision log for places the PRD is silent (§0). Override any of these.

## Phase 1 — Foundation

- **Build tooling.** Vite 6 + React 18 + TS (strict) + Tailwind 3 + Framer Motion 11 + React Router 6 + Zustand 5. Radix primitives (dialog/popover/tooltip) pinned but unused until later phases. No component library, per §0.
- **Tailwind color layer.** Tailwind's `colors` are mapped _only_ to semantic CSS variables (e.g. `bg-page`, `text-ai`), not primitives. Components therefore cannot reach a raw gray/violet step — enforcing the "dark mode swaps semantics only" rule structurally, and making the §8a "violet = AI only" rule easy to audit (grep for `-ai`).
- **Font delivery.** Inter + IBM Plex Mono via Google Fonts `@import` in `index.css`. Chose CDN import over bundling `@fontsource` to keep the dependency surface small for a prototype; requires network on first paint. Swap to bundled fonts if offline demo is needed.
- **Numeric font size scale.** Tailwind text sizes are named by pixel value (`text-13`, `text-32`) to match the §8c scale verbatim and avoid guessing at `sm`/`base` mappings.
- **Money formatting.** Implemented `groupIndian`/`groupWestern` by hand rather than `Intl.NumberFormat('en-IN')` so grouping is deterministic across environments and unit-testable per §5. USDC renders with a trailing code and no symbol.
- **Store persistence.** Zustand in-memory only (no `persist` middleware) — satisfies "persist across route changes within a session, no localStorage" (§9/§10). Full page reload intentionally resets the demo.
- **Low-balance scenario.** Modeled as a boolean flag on the store (`lowBalanceScenario`) that swaps `WALLET.balanceUsd` → `WALLET_LOW_BALANCE` ($4,220) app-wide, rather than editing wallet state in place. Lets any screen toggle the §6b scenario without mutating base mock data.
- **Bulk batch composition.** §9 defines 6 contractors but §7 needs 9 payouts (6 clean, 3 flagged). The 3 flagged rows are Priya/Aleksei/Chen; the 6 clean rows reuse Mateo and Amara across multiple June invoices (retainer, change-order, milestone, etc.) to reach 9 without inventing a 7th contractor. Amounts sum to $14,230 to match the §7 header.
- **Invoice IDs.** PRD names `inv_006` (hero), `inv_004` (original), `inv_007` (duplicate). Added `inv_010`–`inv_013` for the bulk batch. `pay_009` is the failed hero per §6d; other payout IDs are assigned to cover each status.
- **Slim-takeover step labels.** Details → Review → Sent, derived from the route path. `/payments/status/*` maps to the "Sent" step.
- **Disabled nav tooltips.** Phase 1 uses native `title` attributes for the "Out of scope for this prototype" nav tooltips; the proper Radix `Tooltip` component arrives with the component inventory (§8d).
- **Avatar identity.** Top-bar avatar shows "MC / Maya Chen · Finance admin" to match the primary persona Maya (§1).
