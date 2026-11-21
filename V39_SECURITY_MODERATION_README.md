# SOOQAK V39 — Closed-Beta Security Fixes

2026-11-21. Branch-only source changes. No public release.

## Changes
- Restrict authenticated INSERT privileges for seller accounts so `verified_business` can never be self-assigned.
- Revoke client `TRUNCATE`, `TRIGGER`, `REFERENCES`, and `MAINTAIN` grants on service/private profile/report tables.
- New services are `pending` by default, with RLS rejecting malicious `approved` inserts.
- Pending services remain owner-editable, hidden from public, and edits to approved content re-enter moderation.
- Add an administrator approval and suspension queue to `admin-services.html`.
- Status messaging in the service owner UI shows pending moderation.

## Deployment safety
- The existing Vercel deployment is not linked to the GitHub repo; this code branch does **not** update the existing site.
- Main remains the existing README-only branch until an explicit staged release plan.
- The admin allowlist must be configured for a trusted, confirmed account before the review queue can be used.
- Email SMTP, Site URL and redirect allowlist must be checked directly in Supabase dashboard; do not claim these are fixed by this patch.

## Verification
- Run the SQL privilege and policy checks in `sql/v39_verify_security.sql` after applying migration.
- Run `node --check` on all JS; run a live two-account E2E test in protected Preview before launch.
- Never send production/private Supabase credentials to GitHub. The frontend uses only publishable keys.
