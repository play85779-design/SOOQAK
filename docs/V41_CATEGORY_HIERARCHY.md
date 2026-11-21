# SOOQAK V41 — Main and subcategory hierarchy
Date: 2026-11-21 (Asia/Riyadh)
- Adds a frozen, versioned catalog of nine canonical parent categories and 45 subcategories.
- Preserves existing parent category values: no database migration, no edits to historical listings.
- New browsing chips search by subcategory text, rather than claiming a database-backed subcategory index. Dedicated subcategory filters remain V42.
- Category previews adapt to Arabic/English and remain inaccessible until a parent is selected.
- All changes are confined to develop/v38-recovery; main, production deployment, authentication and Supabase remain unchanged.
- New three Playwright regression tests in tests/v41-category-tree.spec.cjs.
