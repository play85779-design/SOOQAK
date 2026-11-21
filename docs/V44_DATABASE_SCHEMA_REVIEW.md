# V44 — schema migration designed, NOT applied
Date: 2026-11-21 Asia/Riyadh

The existing live `public.sooqak_listings` table has category (text), but **no** subcategory or specifications column.
The current Supabase project is shared with existing deployment(s), and there is no verified isolated staging database. For that reason the included SQL is a **review-only migration** and has NOT been executed.

Prerequisites:
1. Verify an isolated staging database or request explicit owner authorization to alter the shared DB.
2. Export a full database backup and verify restore using a disposable target.
3. Apply the additive migration only to the authorized environment, check schema and RLS, then test old rows and new rows.
4. Update cloud.js select/write and app.js to use subcategory + specifications, with compatibility fallback for older rows.
5. Test anonymous, buyer, seller, and admin permissions, and confirm older production clients still work.

Current V43 uses readable description text for specs without schema changes. Do not announce V44 complete until tested and deployed to approved environment.
