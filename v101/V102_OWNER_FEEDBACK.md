# SOOQAK V102 — owner visual feedback vs governing poster
Date: 2026-11-23 (Asia/Riyadh). Scope: preview-only refinement. PR50 is DRAFT. No production/DB modification.

## Governing reference
- Poster: https://drive.google.com/file/d/1zSnPB8Ld16cRz5KJigPam9FSX-drvYJj/view
- Audit 200: https://docs.google.com/spreadsheets/d/1RKlSs77CvaS81jACLT_MmGUvbL-dXNhBXNXXsYwSgfQ/edit
- Ten owner screenshots provided in current conversation, not hosted publicly.

## Owner concerns
1. Home page feels empty vs poster: use balanced category icons, banner, merchants and products.
2. Typography weak and inconsistent, especially categories, location, Account and listing.
3. Countries need visible flags; choose country > region > optional city, not one long global city list.
4. Listing must feel lively: image previews, clear title/description/price/category/location, short visual steps.
5. Account needs vivid icons/headers but no invented metrics.
6. WhatsApp must show SOOQAK title/art and open from another device without Vercel login.

## V102 implemented preview changes
- v101/app.js: region map, flag, compact location selector, location options in listing form, welcome/role previews and sample storefront.
- v101/styles.css: stronger Arabic typography, richer cards, colorful profile and form, mobile and Fold styling.
- Tests adjusted for regions; new tests cover flags, onboarding, store, form and responsive layout.
- Data still demonstration only. No live auth, listings, store creation, orders, uploads or payment.
- Current sample region/city lists are NOT exhaustive. Need canonical geography data before launch.

## Remaining review gates
Visual comparison of eight poster screens on real Fold; better real product art; actual seller/merchant account and RLS testing in a safe environment; WhatsApp share testing from another phone; no merge or production without user approval and passing CI.
