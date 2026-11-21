# SOOQAK — scope freeze and launch gates (A ≤ V90 + B00–B12)

Decision: **2026-11-21, Asia/Riyadh**. This is the existing SOOQAK repository. Do not create V91, invent extra feature phases, or expand into new markets/services before owner approval. Continue only outstanding work inside the defined A and B scope. This is a **feature-scope freeze**, not a premature production release or an instruction to abandon necessary security/bug fixes.

## Two tracks, one release gate

- **A (V41–V90):** finish already-scoped marketplace features and outstanding integration tests. The V90 handover proves delivery of *development artifacts*, not readiness for a public launch. Each partial row stays partial until the feature's real acceptance criteria pass.
- **B (B00–B12):** costs, cash-flow protection, financial data correctness, verified spending alerts, role-protected owner Command Center, decision history, and reporting. Track in the main [Google Sheets roadmap](https://docs.google.com/spreadsheets/d/1iKb33MQAjhxOt-TiM1iqQjBGaCs9dz_clAF-afLEKtY/edit#gid=439172901).
- Reuse the existing [financial register](https://docs.google.com/spreadsheets/d/1LXnPpSY6zr-UMFBsdOMDx4-icwufM47zxGvyrMpWvRc/edit). Never reproduce confidential balances in this public repository.
- Approved starting **budget target**: SAR 1,000. This is **not verified deposited cash**. No paid service, subscription, billing change, production deployment, production schema migration, destructive action, or admin assignment without the owner's explicit approval.

## The current low-cost implementation

`owner-finance.mjs` is a **pure calculation module**, deliberately separated from live credentials and financial sources. It provides:

1. `budgetStatus`: verified committed SAR, remaining budget, 50% / 80% / 100% threshold identities. Missing readings produce `null`, never false zero. Alert identities are deduplicated *only when callers supply previously sent IDs*.
2. `spendAnomaly`: compares one cost period to at least three verified comparable periods; reports suspicious increases without making purchases or disabling service.
3. `unitEconomics`: break-even sales and per-user/per-ad cost only when real denominators and amounts exist.
4. `cashAndExpansion`: payable-adjusted liquidity, six-month core-operating reserve, monthly net flow, conditional runway, and **advice only** on whether expansion appears affordable.

Run unit checks with `node --test tests/owner-finance.test.mjs`. The same tests are part of the existing CI static checks. This module does **not** call Vercel, Supabase, payment gateways, bank APIs, send notifications, or enforce provider spend caps. It is an incremental B01/B03/B06/B11 foundation, **not completion** of those tasks.

## Source-of-truth and release gates

| Gate | Evidence required | Remains blocked until |
| --- | --- | --- |
| Cost protection B00/B01/B11 | Verified provider bills, actual plan, spend-limit behavior, alert recipients, exceptions | Read-only billing/usage proof and alert test |
| Account/auth A57/A76/A89 | Confirmed signup/recovery redirect and separate seller/buyer/admin permissions | Isolated test environment, verified SMTP/domain and approved admin |
| Data A44/A55/A62/A69/A70/A73/A74/A79/A87 | Correct RLS, storage and private-data tests with accounts of opposing roles | Approved isolated test database, never change live schema by default |
| Sales A81–A85 | Idempotent sale and commission records, cancellations, disputes, refunds and reconciliation | Owner-approved cancellation and dispute policy; realistic test data |
| Backup A88 | Database + object files + auth config coverage, retention, tested restore | Readable inventory, permission and recovery procedure |
| Owner B07–B10 | Server-verified owner role, deny-by-default RLS, audit log and no actual sensitive info in demo | Real role approval and isolated validation |
| Public launch | Above gates, privacy/terms/legal/payment review, load/security checks, rollback, owner sign-off | Explicit owner go-live approval |

### Engineering rules

- No false completion. Synthetic/local/CI tests are labeled synthetic/local/CI and are not real customer validation.
- Do not expose service keys or privileged financial data to static HTML, public JS, the public GitHub repository, or anonymous APIs.
- Strongly prefer verified read-only data aggregation over per-view paid billing API polling. Design metrics with source, period, unit, as-of time and unknown-state; do not silently substitute fake metrics.
- Alerts are not caps. Every provider-based spending limit must be verified in the provider console; otherwise mark `غير متحقق منه`.
- Changes go to feature branches, verified PR, then reviewed develop. Production/main and live database remain untouched until approved.
- When both tracks meet their gates, halt feature expansion and move to a controlled real-world private beta decision with the owner. Do not automatically activate public signup, send paid SMS, turn on payments, or publish the developed branch.
