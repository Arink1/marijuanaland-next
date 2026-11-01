import { sendOwnerAlert } from "@/lib/email";
import { addMessage } from "@/lib/inbox";
import { isStoreConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!isStoreConfigured()) {
    return Response.json({ error: "Messages are not set up yet." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (body.website) return Response.json({ ok: true });

  try {
    const saved = await addMessage({
      name: body.name,
      email: body.email,
      message: body.message,
    });
    await sendOwnerAlert({
      subject: `New website message from ${saved.name}`,
      replyTo: saved.email,
      text:
        `${saved.name} <${saved.email}> wrote:\n\n${saved.message}\n\n` +
        `Reply to this email to answer them, or open Site Admin → Messages.`,
    });
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (/^Please fill/.test(msg)) return Response.json({ error: msg }, { status: 400 });
    console.error("contact failed:", msg);
    return Response.json(
      { error: "Sorry, your message didn't go through. Please call us or try again in a minute." },
      { status: 500 },
    );
  }
}
