#!/usr/bin/env bash
# Operator-run backup; NEVER run with real secrets in GitHub Actions.
set -euo pipefail
umask 077
if [[ $# -ne 1 ]]; then
  echo "Usage: bash scripts/backup-snapshot.sh /absolute/private/directory" >&2
  exit 2
fi
out="$1"
if [[ "$out" != /* || ! -d "$out" ]]; then
  echo "Provide an existing absolute private directory outside the GitHub repository." >&2
  exit 2
fi
real_out="$(cd "$out" && pwd -P)"
script_dir="$(cd "$(dirname "$0")" && pwd -P)"
repo_dir="$(cd "$script_dir/.." && pwd -P)"
case "$real_out/" in
  "$repo_dir/"*) echo "Refusing to save a private database dump inside the repository." >&2; exit 2;;
esac
for binary in pg_dump pg_restore sha256sum; do
  if ! command -v "$binary" >/dev/null 2>&1; then
    echo "Required PostgreSQL client or sha256sum missing: $binary" >&2
    exit 2
  fi
done
for var in PGHOST PGPORT PGUSER PGDATABASE PGPASSWORD; do
  if [[ -z "$(printenv "$var" 2>/dev/null || true)" ]]; then
    echo "Required local connection setting missing: $var" >&2
    exit 2
  fi
done
export PGSSLMODE="require"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="$real_out/SOOQAK_postgres_$stamp.dump"
tmp="$target.partial"
if [[ -e "$target" ]]; then
  echo "Backup destination already exists; refusing overwrite." >&2
  exit 2
fi
trap 'rm -f "$tmp"' EXIT
pg_dump --format=custom --no-owner --no-acl --file="$tmp"
pg_restore --list "$tmp" >/dev/null
mv "$tmp" "$target"
trap - EXIT
sha256sum "$target" > "$target.sha256"
chmod 600 "$target" "$target.sha256"
printf 'Readable backup archive: %s\n' "$target"
printf 'Checksum saved: %s.sha256\n' "$target"
echo "Isolated restoration is still required before marking recovery verified."
