# V42 — Cascading subcategory filters
Date: 2026-11-21 Asia/Riyadh
- The filter drawer now exposes category-dependent subcategory options (45 options spread across nine original parent categories).
- Changing the parent resets an incompatible subcategory selection.
- Local browsing matches a stored ad.subcategory exactly if it exists; old ads without a subcategory are matched by title/description text. Search is explicitly a compatibility fallback, not a guaranteed structured backend index.
- Remote listings remain subject to existing parent category query and local filtering of the fetched batch; server-side indexed filtering awaits V44.
- No Supabase schema or production deployment changes.
