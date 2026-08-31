# Admin setup

The owner admin lives at `/admin`. Until the four environment variables below
are set in Vercel, the site still runs normally on the values committed in
`lib/site.ts` — the admin just cannot log in or save.

## 1. Create the Supabase project

1. Go to https://supabase.com/dashboard and create a new project
   (suggested name: `marijuanaland`). Keep it separate from the OnlyDials and
   LegalHelp911 projects.
2. Open **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
   That creates the `site_content` table with row level security on and no
   public access — only the server, using the service role key, can read or
   write it.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret → `SUPABASE_SERVICE_ROLE_KEY`

> The service role key bypasses row level security. It is only ever read on the
> server in `lib/content.ts` and must never be added to a `NEXT_PUBLIC_*`
> variable.

## 2. Generate the login credentials

Run this locally, with the password you want to use:

```bash
node scripts/make-admin-hash.mjs "your-password-here"
```

It prints an `ADMIN_PASSWORD_HASH` and a fresh `ADMIN_SESSION_SECRET`. The
password itself is never stored — only a salted scrypt hash of it.

## 3. Add the variables to Vercel

In the Vercel project → **Settings → Environment Variables**, add all four to
**Production** (and Preview if you want the admin there too):

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | the service_role secret |
| `ADMIN_PASSWORD_HASH` | from step 2 |
| `ADMIN_SESSION_SECRET` | from step 2 |

Redeploy for them to take effect.

## 4. Log in

Visit `/admin`, enter the password, and edit any of:

- **Today at the Shop** — the six flip tiles
- **Deal Cards** — the five homepage photo cards
- **Promo & Contact** — banner text, phone, address, hours, licence line
- **Shop Menu** — the sample product list
- **FAQ** — questions and answers

Each section saves on its own. Saved changes appear on the live site
immediately; anything never saved keeps using the repo defaults.

## Running the admin locally

Put the same four variables in `.env.local` (git-ignored) and run `npm run dev`.
Without `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` the editor still loads and
shows a "storage not connected" notice, and saving reports a clear error.

## Notes

- The session cookie is httpOnly, `sameSite=lax`, `secure` in production, and
  expires after 8 hours.
- `/admin` is marked `noindex` and is not linked from the public site.
- To change the password later, re-run step 2 and update the two admin
  variables.
- Rotating `ADMIN_SESSION_SECRET` immediately signs out every existing session.
