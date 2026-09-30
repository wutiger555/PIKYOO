#!/usr/bin/env bash
# Applies the migrations (and seed) to a throwaway database on a plain local Postgres 15+ and runs the SQL checks.
# Usage: supabase/dev/check.sh            (uses the usual PG* env vars / local socket; needs createdb rights)
# The real Supabase stack (`supabase start` + `supabase db reset`) is the fuller test; this one needs no Docker.
set -euo pipefail
cd "$(dirname "$0")/.."
DB=${CHECK_DB:-pikyoo_check_$$}
psql_q() { psql -X -q -v ON_ERROR_STOP=1 -d "$DB" "$@"; }
createdb "$DB"
trap 'dropdb --if-exists "$DB"' EXIT
psql_q -f dev/stub.sql
for f in migrations/*.sql; do echo "▸ $f"; psql_q -f "$f"; done
[ -f seed.sql ] && { echo "▸ seed.sql"; psql_q -f seed.sql; }
echo "▸ dev/checks.sql"; psql_q -f dev/checks.sql
echo "✓ all checks passed"
