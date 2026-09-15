import { isLoggedIn } from "@/lib/auth";
import {
  formatPhone,
  getMessages,
  getSubscribers,
  toCsv,
} from "@/lib/inbox";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { timeZone: "America/Detroit" });

/** /admin/export?kind=subscribers|messages → CSV download for Excel. */
export async function GET(request: Request) {
  if (!(await isLoggedIn())) {
    return new Response("Not signed in.", { status: 401 });
  }
  const kind = new URL(request.url).searchParams.get("kind");

  let csv: string;
  if (kind === "subscribers") {
    const rows = await getSubscribers();
    csv = toCsv(
      ["Name", "Phone", "Signed up", "Source"],
      rows.map((r) => [r.name, formatPhone(r.phone), fmt(r.created_at), r.source]),
    );
  } else if (kind === "messages") {
    const rows = await getMessages();
    csv = toCsv(
      ["Received", "Name", "Email", "Message", "Read"],
      rows.map((r) => [fmt(r.created_at), r.name, r.email, r.message, r.read ? "yes" : "no"]),
    );
  } else {
    return new Response("Unknown export.", { status: 400 });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="marijuanaland-${kind}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
