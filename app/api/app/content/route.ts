import { getContent } from "@/lib/content";

// Published content for the locals mobile app (marijuanaland-app). Read-only,
// and only what the public site already shows: the owner edits it in /admin
// and the app picks it up on next launch. getContent() caches under the
// content tag, so a publish reaches the app straight away.
export async function GET() {
  const { site, deals, dealTiles, faqs, menuItems, notice } = await getContent();
  return Response.json(
    { site, deals, dealTiles, faqs, menuItems, notice },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
        // Public data; lets the app's web build read it from another origin.
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
