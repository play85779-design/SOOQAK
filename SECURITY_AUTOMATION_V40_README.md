# SOOQAK security and quality automation (development only)

- All changes are on `develop/v38-recovery`; no production deployment, no GitHub privacy change.
- CodeQL analyzes JavaScript/TypeScript. GitHub public repositories offer code scanning at no charge; re-check eligibility before switching the repository private.
- Quality checks use Node.js syntax verification, a small pattern-based secret guard, and local Playwright Chromium smoke tests. The guard is **not** a full Gitleaks scan and does not cover git history.
- Playwright runs against a local static server and does not create real users, change Supabase data, or test the live Vercel deployment.
- CI checks should be reviewed for green runs before relying on them. A passing check is not a security guarantee.
- The user has a strict zero-spend requirement. Do not enable billable add-ons or attach a payment method.
- Public repository is intentional during development. Keep secrets out of commits and audit git history before any release.
