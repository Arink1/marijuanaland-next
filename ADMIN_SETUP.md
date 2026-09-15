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
   - the public `site-images` storage bucket for uploaded photos

   All tables have row level security on with no public policies — only the
   server, using the service role key, can read or write them.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret → `SUPABASE_SERVICE_ROLE_KEY`

> The service role key bypasses row level security. It is only ever read on the
> server (`lib/supabase.ts`) and must never be added to a `NEXT_PUBLIC_*`
> variable.

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
- **Deal cards** — the homepage photo cards. Photos are uploaded or picked from
  a library; the first five cards live today fill the five layout slots, so
  add a dated sale card at the top and it appears and disappears on its own.
- **Reviews** — quotes with a star rating and a show/hide toggle.
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

Photos are shrunk in the browser before upload (longest side 1600px), so
phone photos upload quickly and the site stays fast. Dates are judged in the
shop's time zone (America/Detroit).

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
