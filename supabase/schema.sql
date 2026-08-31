-- Content store for the Marijuana Land site admin.
-- Run once in the Supabase SQL editor.

create table if not exists public.site_content (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- The site reads and writes this table only from the server, using the
-- service role key. No anon/public access is granted: RLS is enabled with
-- no policies, so anon and authenticated roles are denied by default while
-- the service role bypasses RLS.
alter table public.site_content enable row level security;

revoke all on public.site_content from anon, authenticated;
