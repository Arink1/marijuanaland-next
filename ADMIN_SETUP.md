# Admin setup

The owner admin lives at `/admin`. Until the Supabase variables below are set
in Vercel, the site still runs normally on the values committed in
`lib/site.ts` — the admin can log in and browse, but cannot preview, publish,
upload photos, or receive messages and signups.

## 1. Create the Supabase project

1. Go to https://supabase.com/dashboard and create a new project
   (suggested name: `marijuanaland`). Keep it separate from the OnlyDials and
   LegalHelp911 projects.
2. Open **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
   It is safe to run more than once. It creates:
   - `site_content` — one row per section (live value, draft, previous value)
   - `messages` — contact-form messages
   - `subscribers` — deal-list signups from the popup
   - `page_views` — one row per visit to a page, for the Visitors tab, plus
     the `traffic_summary` and `prune_page_views` functions it uses
   - the public `site-images` storage bucket for uploaded photos

   All tables have row level security on with no public policies. Only the
   server, using the secret key, can read or write them. The file also grants
   the tables to `service_role` explicitly, because projects created after
   May 30, 2026 no longer do that automatically.
3. Go to **Project Settings → API Keys** (tab *Publishable and secret API
   keys*) and copy:
   - **Project URL** (`https://<ref>.supabase.co`) → `SUPABASE_URL`
   - the **Secret key** named `default` (starts with `sb_secret_`) →
     `SUPABASE_SERVICE_ROLE_KEY`

   Don't use the publishable key. The legacy `service_role` key also works,
   but Supabase is retiring legacy keys.

> The secret key bypasses row level security. It is only ever read on the
> server (`lib/supabase.ts`) and must never be added to a `NEXT_PUBLIC_*`
> variable.

Current project (created 10/6/2026): `marijuanaland`, ref
East US (North Virginia), in the "Arink1's Org" Supabase account
(free plan). It can be transferred to the client's own Supabase organization
later from Project Settings → General.

## 2. Generate the login credentials

Run this locally, with the password you want to use:

```bash
node scripts/make-admin-hash.mjs "your-password-here"
```

It prints an `ADMIN_PASSWORD_HASH` and a fresh `ADMIN_SESSION_SECRET`. The
password itself is never stored — only a salted scrypt hash of it.

## 3. Add the variables to Vercel

In the Vercel project → **Settings → Environment Variables**, add these to
**Production** (and Preview if you want the admin there too):

| Name | Value | Required |
| --- | --- | --- |
| `SUPABASE_URL` | `https://your-project.supabase.co` | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | the service_role secret | yes |
| `ADMIN_PASSWORD_HASH` | from step 2 | yes |
| `ADMIN_SESSION_SECRET` | from step 2 | yes |
| `RESEND_API_KEY` | API key from https://resend.com | for email alerts |
| `ALERT_EMAIL` | where to send "new message" alerts (comma-separate for several) | for email alerts |
| `RESEND_FROM` | sender, e.g. `Marijuana Land <site@marijuanaland.com>` | optional |

Redeploy for them to take effect.

Without `RESEND_FROM`, alerts are sent from `onboarding@resend.dev`, which
Resend only delivers to the email address on the Resend account. To send to
any address, verify the shop's domain in Resend and set `RESEND_FROM`.

## 4. How the owner uses it

Visit `/admin` and enter the password. Every section works the same way:

1. **Preview on site** — saves a draft and opens the site in a new tab with a
   "Preview mode" bar at the bottom. Only that browser sees the draft; visitors
   still see the live site. From the bar they can press **Looks good, publish**.
2. **Publish to live site** — puts the section live immediately.
3. **Undo last publish** — swaps the live section back to the version before
   the last publish. Pressing it again swaps forward.
4. **Start over** — reloads what is on the live site now.

A dot on a tab means that section has unpublished changes.

Sections:

- **Today at the Shop** — the flip tiles. Optional show-from / show-until
  dates schedule a tile; **Duplicate** copies one.
- **Deal cards** — the homepage photo cards, edited on a live picture of the
  homepage (desktop or phone). Tap a card in the preview, change its photo,
  title and deal in the panel, and the preview follows. The first five cards
  live today fill the five layout slots; cards that are not showing (dated,
  ended, or sixth and later) sit in a strip under the preview with the reason.
  Drag cards, or use Earlier / Later, to reorder. Publishing is blocked while
  a card has no photo.
- **Reviews** — quotes with a star rating and a show/hide toggle.
- **Coming soon page** — hides the whole site behind the holding page. One
  switch, an optional "open automatically at" date and time (shop time; a
  countdown shows until then and the site opens on its own), the three lines
  of copy, quick-fill buttons for "Coming soon" and "Maintenance", and a live
  preview. A signed-in owner always sees the real site, so "Preview site"
  keeps working while the gate is on. The values shipped in `lib/launch.ts`
  are used until the owner publishes this section.
- **Hours notice** — a bright banner across the top of every page. One switch,
  a message, quick-fill buttons, and an optional date after which it hides
  itself.
- **Promo & contact**, **Shop menu**, **FAQ** — as before; menu products get
  photo upload.
- **Gallery** — upload several photos at once, drag to reorder (arrows on a
  phone), add captions, remove.
- **Messages** — contact-form messages with unread markers, reply-by-email,
  mark read, delete, and a spreadsheet download. Each new message is also
  emailed to `ALERT_EMAIL` when Resend is configured.
- **Signups** — deal-list signups from the popup, with spreadsheet download.
  Repeat signups from the same phone number are ignored.
- **Visitors** — how many people are coming to the site and where from. See
  "Visitor tracking" below.

Photos are shrunk in the browser before upload (longest side 1600px), so
phone photos upload quickly and the site stays fast. GIFs and SVGs are
uploaded as-is and must be under 4 MB (Vercel's upload cap is 4.5 MB).

The site only reads the fields shown in the "Promo & contact" editor from
the database. The shop name and tagline always come from `lib/site.ts`, and
the directions link is built from the address.

A section that was previewed but never published keeps showing the values
from `lib/site.ts` on the live site.

## Keeping the free Supabase project awake

Free Supabase projects pause after about a week without database activity.
`vercel.json` runs a daily cron at 12:00 UTC that calls `/api/keepalive`,
which does one tiny read and trims `page_views` back to 400 days. If the
project ever does pause, the public site
keeps showing the defaults from `lib/site.ts`, the admin shows a "Can't reach
the database" warning, and the project can be restored from the Supabase
dashboard. Dates are judged in the
shop's time zone (America/Detroit).

## Visitor tracking

The **Visitors** tab in `/admin` answers two questions: how many people are
coming to the site, and where they came from. It needs no extra service, no
account and no new environment variables — the counts live in the same
Supabase project as everything else, and only the owner can see them.

### How a visit is counted

Every page the site serves posts one small record to `/api/track`, which
writes a row to `page_views`. Each row holds the page, the visit's origin
(a tidied-up name like "Google" or "Facebook"), the referring site's host,
any `utm_*` tags on the link, the city and state Vercel's edge network
reports, and whether the visitor was on a phone, tablet or computer.

Three things are deliberately left out:

- **No cookie and no IP address.** The `visitor` column is a hash of the
  address and browser mixed with `ADMIN_SESSION_SECRET` and the date. It
  counts one person once a day and becomes a different value tomorrow, and it
  cannot be turned back into an address. Because nothing is stored on the
  visitor's device and nothing identifies a person, the site needs no cookie
  banner for this.
- **Crawlers, link previewers and uptime checks.** They do not run the
  tracking script, and a user-agent check in `lib/traffic.ts` catches any that
  do.
- **The owner's own visits**, while signed in to `/admin` in that browser.

Where a visit came from is read once, from the first page of the tab, and
carried on every later page of the same visit. Someone who arrives from a
Facebook post and then looks at four pages counts as one Facebook visitor,
not one Facebook visit plus three direct ones.

### What the tab shows

Pick 7, 30 or 90 days at the top; everything below follows that choice.

- **Visitors / Visits / Page views / Pages per visit**, each with the change
  against the same length of time before it. A *visit* ends when the tab
  closes; a *visitor* is counted once a day however many times they come back.
- **A bar per day.** The dark part of each bar is visitors, the lighter part
  on top is their repeat page views.
- **Where visitors came from** — Google, Facebook, Instagram, Weedmaps,
  Direct, and so on, counted once per visit.
- **Most visited pages** and **first page they landed on**.
- **Where visitors are** — city and state, from the network only, so it is
  often the nearest large town rather than the real one.
- **Phone or computer**, **sites linking to you**, **campaign tags**.
- **Busiest times of day** in Michigan time, for picking when to post a deal.
- **Latest page views** — the last 20, and a green pill at the top when
  someone is on the site right now.
- **Download spreadsheet** — every row in the window, for Excel.

### Tagging your own links

To tell apart links you put out yourself, add `utm_source` (and optionally
`utm_campaign`) to the address you share:

```
https://www.marijuanaland.com/?utm_source=facebook&utm_campaign=fall-deal
https://www.marijuanaland.com/shop?utm_source=flyer&utm_campaign=qr-code
```

`utm_source=facebook` shows up as "Facebook", so a tagged post and an
untagged click land in the same row. A few short names are mapped to friendlier
ones (`fb`, `ig`, `gmb`, `sms`, `qr`); anything else is shown as typed, so keep
them consistent.

### Housekeeping

A page view is a small row, and the daily keepalive cron deletes anything
older than 400 days, so a year of history plus last autumn to compare against
is always there. To keep more or less, change the default in
`prune_page_views`.

If the Visitors tab says the tables are not in the database yet, run
[`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor again:
it adds the traffic tables and functions and leaves everything else alone.

## Running the admin locally

Put the same variables in `.env.local` (git-ignored) and run `npm run dev`.
Without `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` the editor still loads
and shows a "storage not connected" notice; previewing, publishing and
uploads are disabled and the contact form falls back to opening the
visitor's mail app.

## Notes

- The session cookie is httpOnly, `sameSite=lax`, `secure` in production, and
  expires after 8 hours.
- Preview uses Next.js Draft Mode: the `__prerender_bypass` cookie only exists
  in the owner's browser and is only issued after a successful login.
- `/admin` is marked `noindex` and is not linked from the public site.
- To change the password later, re-run step 2 and update the two admin
  variables.
- Rotating `ADMIN_SESSION_SECRET` immediately signs out every existing session.
