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

-- ---------------------------------------------------------------------------
-- Visitor traffic. One row per page view, written by the site's /api/track.
--
-- Nothing here identifies a person. No IP address, no cookie: `visitor` is a
-- hash of the address and browser mixed with a secret and today's date, so it
-- can count the same person twice in one day but cannot follow them to the
-- next day or be turned back into an address. `session` is a random id the
-- browser forgets when the tab closes.
create table if not exists public.page_views (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  -- Shop-time calendar day (America/Detroit), set by the server.
  day           date not null,
  visitor       text not null,
  session       text not null,
  -- True for the first page of a visit, so landing pages can be counted.
  entry         boolean not null default false,
  path          text not null,
  -- Friendly origin for the whole visit: "Google", "Facebook", "Direct"...
  source        text not null default 'Direct',
  -- Referring site, host only ("www.google.com"), never the full URL.
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  -- Coarse location from Vercel's edge headers.
  country       text,
  region        text,
  city          text,
  device        text not null default 'Desktop'
);
create index if not exists page_views_day_idx     on public.page_views (day desc);
create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_session_idx on public.page_views (session);

alter table public.page_views enable row level security;
revoke all on public.page_views from anon, authenticated;
grant select, insert, delete on public.page_views to service_role;

-- "Germfask, MI" where the edge knew the city, falling back to state, then
-- country, so every row lands in exactly one bucket.
create or replace function public.traffic_place(
  city text, region text, country text
) returns text
language sql
immutable
as $fn$
  select case
    when coalesce(city, '') <> '' and coalesce(region, '') <> '' then city || ', ' || region
    when coalesce(city, '') <> '' then city
    when coalesce(region, '') <> '' and coalesce(country, '') <> '' then region || ', ' || country
    when coalesce(region, '') <> '' then region
    when coalesce(country, '') <> '' then country
    else 'Unknown'
  end
$fn$;

-- Everything the Traffic tab in /admin shows, in one round trip: totals for
-- the last `days` days, the same totals for the `days` before that (so the
-- admin can show a change), a bar per day, and the top sources, pages,
-- places, devices, referrers and campaigns.
create or replace function public.traffic_summary(days integer default 30)
returns jsonb
language sql
stable
set search_path = public
as $fn$
  with span as (
    select
      least(greatest(coalesce(days, 30), 1), 400) as n,
      (timezone('America/Detroit', now()))::date  as today
  ),
  b as (
    select n, today,
           today - (n - 1)     as from_day,
           today - (2 * n - 1) as prev_from,
           today - n           as prev_to
      from span
  ),
  v as (
    select pv.* from public.page_views pv, b
     where pv.day between b.from_day and b.today
  ),
  p as (
    select pv.* from public.page_views pv, b
     where pv.day between b.prev_from and b.prev_to
  ),
  cal as (
    select g::date as day
      from b, generate_series(b.from_day, b.today, interval '1 day') g
  )
  select jsonb_build_object(
    'days',     (select n        from b),
    'from_day', (select from_day from b),
    'to_day',   (select today    from b),

    'views',    (select count(*)                from v),
    'visitors', (select count(distinct visitor) from v),
    'visits',   (select count(distinct session) from v),
    'bounces',  (select count(*) from (
                   select session from v group by session having count(*) = 1
                 ) one),
    'prev', jsonb_build_object(
      'views',    (select count(*)                from p),
      'visitors', (select count(distinct visitor) from p),
      'visits',   (select count(distinct session) from p)
    ),
    -- Visitors seen in the last half hour: "is anyone on the site right now".
    'online', (select count(distinct visitor) from public.page_views
                where created_at > now() - interval '30 minutes'),

    'daily', (select coalesce(jsonb_agg(
                jsonb_build_object('day', d.day, 'views', d.views, 'visitors', d.visitors)
                order by d.day), '[]'::jsonb)
              from (
                select cal.day,
                       count(v.id)               as views,
                       count(distinct v.visitor) as visitors
                  from cal left join v on v.day = cal.day
                 group by cal.day
              ) d),

    'hours', (select coalesce(jsonb_agg(
                jsonb_build_object('hour', h.hour, 'views', h.views) order by h.hour), '[]'::jsonb)
              from (
                select g as hour,
                       (select count(*) from v
                         where extract(hour from timezone('America/Detroit', v.created_at)) = g) as views
                  from generate_series(0, 23) g
              ) h),

    'sources', (select coalesce(jsonb_agg(
                 jsonb_build_object('label', t.label, 'views', t.views, 'visitors', t.visitors)
                 order by t.visitors desc, t.views desc, t.label), '[]'::jsonb)
               from (
                 select source as label, count(*) as views, count(distinct visitor) as visitors
                   from v group by source
                  order by visitors desc, views desc limit 15
               ) t),

    'pages', (select coalesce(jsonb_agg(
               jsonb_build_object('label', t.label, 'views', t.views, 'visitors', t.visitors)
               order by t.views desc, t.visitors desc, t.label), '[]'::jsonb)
             from (
               select path as label, count(*) as views, count(distinct visitor) as visitors
                 from v group by path
                order by views desc, visitors desc limit 15
             ) t),

    'entries', (select coalesce(jsonb_agg(
                 jsonb_build_object('label', t.label, 'views', t.views, 'visitors', t.visitors)
                 order by t.views desc, t.label), '[]'::jsonb)
               from (
                 select path as label, count(*) as views, count(distinct visitor) as visitors
                   from v where entry group by path
                  order by views desc limit 10
               ) t),

    'places', (select coalesce(jsonb_agg(
                jsonb_build_object('label', t.label, 'views', t.views, 'visitors', t.visitors)
                order by t.visitors desc, t.views desc, t.label), '[]'::jsonb)
              from (
                select public.traffic_place(city, region, country) as label,
                       count(*) as views, count(distinct visitor) as visitors
                  from v group by 1
                 order by visitors desc, views desc limit 15
              ) t),

    'devices', (select coalesce(jsonb_agg(
                 jsonb_build_object('label', t.label, 'views', t.views, 'visitors', t.visitors)
                 order by t.visitors desc, t.label), '[]'::jsonb)
               from (
                 select device as label, count(*) as views, count(distinct visitor) as visitors
                   from v group by device
               ) t),

    'referrers', (select coalesce(jsonb_agg(
                   jsonb_build_object('label', t.label, 'views', t.views, 'visitors', t.visitors)
                   order by t.visitors desc, t.views desc, t.label), '[]'::jsonb)
                 from (
                   select referrer as label, count(*) as views, count(distinct visitor) as visitors
                     from v where coalesce(referrer, '') <> '' group by referrer
                    order by visitors desc, views desc limit 15
                 ) t),

    'campaigns', (select coalesce(jsonb_agg(
                   jsonb_build_object('label', t.label, 'views', t.views, 'visitors', t.visitors)
                   order by t.visitors desc, t.label), '[]'::jsonb)
                 from (
                   select utm_campaign as label, count(*) as views, count(distinct visitor) as visitors
                     from v where coalesce(utm_campaign, '') <> '' group by utm_campaign
                    order by visitors desc limit 15
                 ) t),

    'latest', (select coalesce(jsonb_agg(
                jsonb_build_object(
                  'at', r.created_at, 'path', r.path, 'source', r.source,
                  'place', public.traffic_place(r.city, r.region, r.country),
                  'device', r.device)
                order by r.created_at desc), '[]'::jsonb)
              from (
                select * from public.page_views order by created_at desc limit 20
              ) r)
  )
$fn$;

-- Keeps the table from growing forever. The daily /api/keepalive cron calls
-- this; a year and a bit of history is kept, so this autumn can be compared
-- with last autumn.
create or replace function public.prune_page_views(keep_days integer default 400)
returns integer
language plpgsql
set search_path = public
as $fn$
declare removed integer;
begin
  delete from public.page_views
   where day < (timezone('America/Detroit', now()))::date
               - greatest(coalesce(keep_days, 400), 1);
  get diagnostics removed = row_count;
  return removed;
end
$fn$;

grant execute on function
  public.traffic_place(text, text, text),
  public.traffic_summary(integer),
  public.prune_page_views(integer)
  to service_role;
notify pgrst, 'reload schema';
