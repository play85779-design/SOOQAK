# V70 — Merchant account dashboard preview, same account
2026-11-23. Existing SOOQAK project; no production deployment or live schema change.
Read-only owner page authenticates with Supabase auth.getUser, requires confirmed email, queries a business account by owner_id and kind, and queries its listings by account_id, seller_user_id and seller_kind. Auth user is rechecked before rendering. No fake orders, revenue, rating or verified state; no payment actions.
CI tests use mocked SDK, not real role isolation. Staging test with two independently signed-in accounts and RLS verification remains required before launch.
