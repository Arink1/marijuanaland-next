// Date helpers for scheduled deals and the hours notice. Everything is
// compared as YYYY-MM-DD strings in the shop's own time zone, so a deal that
// ends "2026-10-31" is still visible for the whole of that day in Michigan.

export const SHOP_TZ = "America/Detroit";

export type Scheduled = { start?: string; end?: string };

/** Today's date in the shop's time zone, as YYYY-MM-DD. */
export function todayInShop(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Today's date in the viewer's browser, as YYYY-MM-DD (client-side badges). */
export function todayLocal(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type ScheduleState = "live" | "scheduled" | "ended";

export function scheduleState(item: Scheduled, today: string): ScheduleState {
  const start = item.start?.trim();
  const end = item.end?.trim();
  if (start && start > today) return "scheduled";
  if (end && end < today) return "ended";
  return "live";
}

export function isLive(item: Scheduled, today: string): boolean {
  return scheduleState(item, today) === "live";
}

/** "Oct 1" style label for a YYYY-MM-DD string, without time-zone drift. */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
