# SOOQAK — private database backup preparation (NOT executed)

This protocol prepares a no-cost operator-driven backup procedure. **No database dump or successful restoration is claimed.**

## Safe operator procedure (manual, deferred)
1. On an authorized private computer, install PostgreSQL client tools matching the database major version.
2. Configure PGHOST, PGPORT, PGUSER, PGDATABASE, and PGPASSWORD locally using secure connection settings. Never paste credentials into ChatGPT or GitHub.
3. Create an absolute private output folder outside the repository and run `bash scripts/backup-snapshot.sh /absolute/private/directory`.
4. The script creates a private custom-format pg_dump archive and SHA-256 checksum and tests archive readability with pg_restore --list.
5. Restore into a separate empty, isolated test database and verify tables/relationships/records. Never restore over the active database.
6. Keep encrypted archives private and owner-controlled; never commit backup files to a public GitHub repository.

## Limits
- CI only checks bash script syntax. This work did not run a DB dump or restoration.
- A database dump is not full recovery of Auth/Storage external settings, deployment config or email templates.
- Hosted Supabase Free backup and network access limits apply; no paid upgrades are permitted.
- Read-only audit on 2026-11-21 found 24 SOOQAK public tables with RLS enabled; major transaction tables currently empty.
