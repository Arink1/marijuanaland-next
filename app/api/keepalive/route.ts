import { rest, isStoreConfigured } from "@/lib/supabase";

// Free Supabase projects pause after about a week without database activity,
// which would switch off the admin, the contact form and signups. A daily
// Vercel cron (vercel.json) runs one tiny read to keep the project awake.
// It returns no data, so it is safe to leave public.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isStoreConfigured()) {
    return Response.json({ ok: false, reason: "not configured" });
  }
  try {
    const res = await rest("site_content?select=key&limit=1", { cache: "no-store" });
    return Response.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
