-- Test database roles, like production: Flyway (the container superuser "test") owns the tables, the app
-- connects as meno_app, which is not the owner and not a superuser, so RLS policies apply to it.
create role meno_app login password 'meno_app';
grant usage on schema public to meno_app;
alter default privileges for role test in schema public grant select, insert, update, delete on tables to meno_app;
alter default privileges for role test in schema public grant usage, select on sequences to meno_app;
alter default privileges for role test in schema public grant execute on functions to meno_app;
