-- Marijuana Land site admin: content store, inbox and photo bucket.
-- Safe to run more than once (everything is IF NOT EXISTS / ON CONFLICT).
-- Run in the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- Site content. One row per section. `value` is live, `draft` is what the
-- owner is previewing, `previous` is the last live value (for Undo).
create table if not exists public.site_content (
  key           text primary key,
  value         jsonb,
  draft         jsonb,
  previous      jsonb,
  updated_at    timestamptz not null default now(),
  published_at  timestamptz
);

-- Upgrades for a table created by the first version of this file.
alter table public.site_content add column if not exists draft jsonb;
alter table public.site_content add column if not exists previous jsonb;
alter table public.site_content add column if not exists published_at timestamptz;
-- `value` is null for a section that has a draft but was never published, so
-- the site keeps using the defaults in lib/site.ts until the owner publishes.
alter table public.site_content alter column value drop not null;

-- ---------------------------------------------------------------------------
-- Contact-form messages.
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  message     text not null,
  read        boolean not null default false
);
create index if not exists messages_created_at_idx on public.messages (created_at desc);

-- Deal-list signups from the popup. Phone is 10 digits, unique.
create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null unique,
  source      text not null default 'popup'
);

-- ---------------------------------------------------------------------------
-- The site reads and writes these tables only from the server, using the
-- secret (service role) key. No anon/public access: RLS is on with no policies,
-- so anon and authenticated roles are denied while the service role bypasses RLS.
alter table public.site_content enable row level security;
alter table public.messages     enable row level security;
alter table public.subscribers  enable row level security;

revoke all on public.site_content from anon, authenticated;
revoke all on public.messages     from anon, authenticated;
revoke all on public.subscribers  from anon, authenticated;

-- Projects created after May 30, 2026 no longer grant new public tables to any
-- Data API role automatically, service_role included. The server talks to
-- /rest/v1 with the secret key (service_role), so grant it explicitly.
grant select, insert, update, delete
  on public.site_content, public.messages, public.subscribers
  to service_role;
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------------
-- Photo uploads. Public bucket so the site can serve files from the CDN;
-- writes still go through the server with the service role key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
