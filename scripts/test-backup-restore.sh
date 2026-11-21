#!/usr/bin/env bash
# Exercise the operator's backup helper using a fresh, socket-only local cluster.
set -euo pipefail
umask 077
root=$(mktemp -d)
trap 'if [[ -f "$root/db/postmaster.pid" ]]; then pg_ctl -D "$root/db" -m immediate stop >/dev/null; fi; rm -rf -- "$root"' EXIT
mkdir "$root/socket" "$root/backup"
export PGHOST="$root/socket" PGPORT=5432 PGUSER=fixture_owner PGDATABASE=postgres PGPASSWORD=fixture_only
unset PGSERVICE PGSERVICEFILE PGOPTIONS
initdb -D "$root/db" -U "$PGUSER" -A trust >/dev/null
pg_ctl -D "$root/db" -o "-c listen_addresses='' -k '$PGHOST'" -w start >/dev/null
createdb sample
createdb restored
psql -X -v ON_ERROR_STOP=1 -d sample <<'SQL'
CREATE TABLE listings(id integer PRIMARY KEY, title text NOT NULL);
CREATE TABLE sales(id integer PRIMARY KEY, listing_id integer REFERENCES listings, final_price numeric(12,2));
INSERT INTO listings VALUES(1,'منتج تجريبي');
INSERT INTO sales VALUES(2,1,375.50);
SQL
PGDATABASE=sample bash scripts/backup-snapshot.sh "$root/backup"
archives=("$root"/backup/*.dump)
sha256sum --check "${archives[0]}.sha256"
pg_restore --exit-on-error --single-transaction --dbname=restored "${archives[0]}"
query="SELECT l.title || '/' || s.final_price FROM listings l JOIN sales s ON l.id=s.listing_id"
[[ "$(psql -XAt -d restored -c "$query")" == 'منتج تجريبي/375.50' ]]
[[ "$(psql -XAt -d restored -c "SELECT count(*) FROM pg_constraint WHERE conrelid='sales'::regclass AND contype='f'")" == 1 ]]
echo 'Verified restored fixture rows, amount and foreign key.'
createdb policy_fixture
psql -X -v ON_ERROR_STOP=1 -d policy_fixture -f tests/sql/store-and-decision-fixture.sql
