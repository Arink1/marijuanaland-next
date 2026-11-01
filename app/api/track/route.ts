import type { NextRequest } from "next/server";
import { COOKIE, isValidSession } from "@/lib/auth";
import { isStoreConfigured } from "@/lib/supabase";
import { isBot, recordPageView } from "@/lib/traffic";

// One row per page view, for the Traffic tab in /admin. components/TrackVisit
// posts here once per page. Always answers 204 and never explains itself: a
// counting problem must not show up for a visitor, and nothing here is worth
// telling a scraper about.
export const dynamic = "force-dynamic";

const NO_CONTENT = () =>
  new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

/** Vercel sends the city URL-encoded ("Grand%20Rapids"). */
function header(req: NextRequest, name: string): string | null {
  const raw = req.headers.get(name);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function POST(request: NextRequest) {
  if (!isStoreConfigured()) return NO_CONTENT();

  const ua = request.headers.get("user-agent") ?? "";
  if (isBot(ua)) return NO_CONTENT();

  // The owner's own visits would swamp the numbers for a quiet local shop.
  if (isValidSession(request.cookies.get(COOKIE)?.value)) return NO_CONTENT();

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 4000) return NO_CONTENT();
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return NO_CONTENT();
  }
  if (typeof body?.path !== "string") return NO_CONTENT();

  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip =
    forwarded.split(",")[0].trim() || request.headers.get("x-real-ip") || "0.0.0.0";

  try {
    await recordPageView(
      {
        path: body.path,
        referrer: body.referrer,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        session: body.session,
        entry: body.entry,
      },
      {
        ip,
        ua,
        host: request.headers.get("host") ?? "",
        country: header(request, "x-vercel-ip-country"),
        region: header(request, "x-vercel-ip-country-region"),
        city: header(request, "x-vercel-ip-city"),
      },
    );
  } catch (e) {
    console.error("track failed:", e instanceof Error ? e.message : e);
  }
  return NO_CONTENT();
}
