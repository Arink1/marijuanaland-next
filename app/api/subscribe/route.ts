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
    const msg = e instanceof Error ? e.message : "Could not save your signup.";
    const status = /Please enter/.test(msg) ? 400 : 500;
    return Response.json({ error: msg }, { status });
  }
}
