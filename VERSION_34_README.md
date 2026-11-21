# SOOQAK V34 — Release readiness and implementation status

- V29: one account area / require private city before posting, without claiming unsupported auth is enabled.
- V30: query current ad filters on Supabase, keeping paging consistent; images may still require real-user testing.
- V31: messaging and saved data continue using Supabase RLS; live two-user e2e tests remain mandatory.
- V32: shareable static listing detail pages; OG previews require dynamic rendering before public launch.
- V33: independent moderator suspension status plus trigger and RLS restrictions.
- V34: extracted CSS and JS modules to make code maintainable; preserved browser script order.

Scope: private preview only, no production deployment, no real billing/Google/SMS setup.
Before launch: enable verified auth providers and redirect URLs; check 2-account flow; test uploads, search, notifications, RLS; legal review and indexing decisions.
