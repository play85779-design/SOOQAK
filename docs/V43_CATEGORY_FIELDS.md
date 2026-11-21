# V43 — Category-specific listing form fields (compatibility mode)
Date: 2026-11-21
- Optional fields now change according to nine main categories.
- New ads persist their specifications in a readable, structured text footer within the *existing* description field, compatible with the existing Supabase schema and old listings.
- Editing a listing parses the footer and restores form fields without duplicating the footer in free-text description.
- Draft fields spec_* are included in the existing JSONB draft payload (no new schema fields).
- This is a temporary compatibility layer; standalone database columns + exact server filters remain V44.
- No changes to public production, Supabase schema, admin privileges or authentication.
