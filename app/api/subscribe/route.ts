import { addSubscriber } from "@/lib/inbox";
import { isStoreConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!isStoreConfigured()) {
    return Response.json({ error: "Signups are not set up yet." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  if (body.website) return Response.json({ ok: true }); // honeypot

  try {
    await addSubscriber({ name: body.name, phone: body.phone, source: "popup" });
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (/^Please enter/.test(msg)) return Response.json({ error: msg }, { status: 400 });
    console.error("subscribe failed:", msg);
    return Response.json(
      { error: "Sorry, we couldn't save your signup. Please try again in a minute." },
      { status: 500 },
    );
  }
}
