# V68–V70 — approved mobile marketplace + merchant storefront UI (preview only)

2026-11-23, Asia/Riyadh. Existing SOOQAK project; no rebuild, no schema change, no billing change.

Owner-approved design: green/orange marketplace home, individual listings, merchant stores, same verified account switching to business role, no forced role during signup. This PR updates presentation and public read-only shop discovery, not payment/order processing.

## Changes
- Homepage: discoverable marketplace sections for individual listings, business stores and services; improved green/orange hero and "create store" CTA.
- CTA routes to the existing account/profile system, whose server-side ensureAccount and RLS own business-account creation. No second user identity or privileged bypass.
- Public shop carousel is a bounded read-only list of *real active public business sale listings*. A store is listed only if it has live accessible listings; no fabricated verifications, users, prices, orders or ratings.
- Public store detail page: mobile-friendly branded store and product cards with real price/location/status from existing public table, retaining the original status/expiry/hidden filtering.
- Existing posting, search, filters, chats, favorites, personal accounts and service directory remain intact. Uses a separate CSS layer for rollback.
- Added isolated Playwright checks. No production release; staging review is required for auth email, two distinct user roles, storefront public policy, and responsive visual inspection.

## Scope + gates
A V66–V70 scoped storefront UX only, no V91/new categories. Business staff permissions and verification SQL remain NOT_APPLIED. The word verified, customer order count, paid checkout and seller rating are deliberately absent.
No payment gateway, domain, SMTP, live migration, main branch change or production deploy from this PR.

## Browser acceptance
- Responsive 320, 390, 768, 1280 widths with no horizontal overflow.
- Clicking "أنشئ متجرك" when signed out opens the existing gated login flow; after verified sign-in the business tab switches within the same Supabase user.
- Feed and business listings remain safely filtered with RLS in real staging.
- Public store route handles bad UUIDs and empty/error states.
- Home store previews are only from actual public rows, are deduplicated, and safely inserted as textContent.
