import { isLoggedIn } from "@/lib/auth";
import { formatPhone, getAllMessages, getAllSubscribers, toCsv } from "@/lib/inbox";
import { getTrafficRows, trafficRange } from "@/lib/traffic";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { timeZone: "America/Detroit" });

/** /admin/export?kind=subscribers|messages → CSV download for Excel. */
export async function GET(request: Request) {
  if (!(await isLoggedIn())) {
    return new Response("Not signed in.", { status: 401 });
  }
  const query = new URL(request.url).searchParams;
  const kind = query.get("kind");

  let csv: string;
  try {
    if (kind === "subscribers") {
      const rows = await getAllSubscribers();
      csv = toCsv(
        ["Name", "Phone", "Signed up", "Source"],
        rows.map((r) => [
          r.name,
          formatPhone(r.phone),
          fmt(r.created_at),
          r.source,
        ]),
      );
    } else if (kind === "messages") {
      const rows = await getAllMessages();
      csv = toCsv(
        ["Received", "Name", "Email", "Message", "Read"],
        rows.map((r) => [
          fmt(r.created_at),
          r.name,
          r.email,
          r.message,
          r.read ? "yes" : "no",
        ]),
      );
    } else if (kind === "traffic") {
      const rows = await getTrafficRows(trafficRange(query.get("days") ?? undefined));
      csv = toCsv(
        [
          "When",
          "Day",
          "Page",
          "Came from",
          "Referring site",
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "City",
          "Region",
          "Country",
          "Device",
          "First page of visit",
          "Visit id",
        ],
        rows.map((r) => [
          fmt(r.created_at),
          String(r.day).slice(0, 10),
          r.path,
          r.source,
          r.referrer ?? "",
          r.utm_source ?? "",
          r.utm_medium ?? "",
          r.utm_campaign ?? "",
          r.city ?? "",
          r.region ?? "",
          r.country ?? "",
          r.device,
          r.entry ? "yes" : "no",
          r.session,
        ]),
      );
    } else {
      return new Response("Unknown export.", { status: 400 });
    }
  } catch {
    return new Response("Could not read the database. Try again in a minute.", {
      status: 503,
    });
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
