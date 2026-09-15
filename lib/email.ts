// Owner alerts via Resend. Silently skipped until RESEND_API_KEY and
// ALERT_EMAIL are set, so the site never fails because email is missing.

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.ALERT_EMAIL);
}

export async function sendOwnerAlert(input: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  if (!key || !to) return false;

  const from =
    process.env.RESEND_FROM || "Marijuana Land Website <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        subject: input.subject,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
