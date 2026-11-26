#!/usr/bin/env bash
# First start of the local postgres container only: owner role for Flyway, runtime role without DDL rights
# (docs/deployment/ENVIRONMENTS.md, SECURITY.md "least-privilege DB roles").
set -euo pipefail
psql -v ON_ERROR_STOP=1 --username postgres --dbname meno \
  -v owner="$MENO_FLYWAY_USER" -v owner_pw="$MENO_FLYWAY_PASSWORD" \
  -v app="$MENO_DB_USER" -v app_pw="$MENO_DB_PASSWORD" <<'SQL'
create role :"owner" login password :'owner_pw';
create role :"app" login password :'app_pw';
alter database meno owner to :"owner";
alter schema public owner to :"owner";
grant usage on schema public to :"app";
alter default privileges for role :"owner" in schema public grant select, insert, update, delete on tables to :"app";
alter default privileges for role :"owner" in schema public grant usage, select on sequences to :"app";
SQL
