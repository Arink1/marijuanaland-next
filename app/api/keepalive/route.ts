import { rest, isStoreConfigured } from "@/lib/supabase";
import { prunePageViews } from "@/lib/traffic";

// Free Supabase projects pause after about a week without database activity,
// which would switch off the admin, the contact form and signups. A daily
// Vercel cron (vercel.json) runs one tiny read to keep the project awake.
// The same run trims page_views back to a year and a bit of history.
// It returns no data, so it is safe to leave public.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isStoreConfigured()) {
    return Response.json({ ok: false, reason: "not configured" });
  }
  try {
    const res = await rest("site_content?select=key&limit=1", { cache: "no-store" });
    // Best effort: the table is missing until the traffic SQL has been run.
    const pruned = await prunePageViews().catch(() => null);
    return Response.json({ ok: res.ok, pruned }, { status: res.ok ? 200 : 502 });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
