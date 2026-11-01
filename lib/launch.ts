// Coming-soon / maintenance gate. The owner controls it from /admin ("Coming
// soon page"); the values below ship in the repo and are used until the owner
// publishes their own. While the gate is on, app/(site)/layout.tsx sends every
// visitor to /coming-soon. A signed-in owner still sees the real site.

import { SHOP_TZ } from "./schedule";

export type Launch = {
  /** On: visitors see the coming-soon page instead of the site. */
  enabled: boolean;
  /**
   * Shop-time wall clock ("YYYY-MM-DDTHH:mm") at which the site opens on its
   * own, with a countdown until then. Blank: hidden until switched off.
   */
  launchAt: string;
  /** Small gold line above the headline. */
  eyebrow: string;
  headline: string;
  message: string;
};

export const defaultLaunch: Launch = {
  enabled: true,
  // Monday Oct 12, 2026 at 4:20 PM shop time (Eastern).
  launchAt: "2026-10-12T16:20",
  eyebrow: "Online store coming soon",
  headline: "Our online store launches in",
  message: "Our Germfask dispensary is open now, so stop in and see us.",
};

/**
 * Quick-fill for the two ways the page gets used. "Maintenance" also clears
 * the opening time, so the site cannot reopen on its own mid-update.
 */
export const LAUNCH_PRESETS: { label: string; values: Partial<Launch> }[] = [
  {
    label: "Coming soon",
    values: {
      enabled: true,
      eyebrow: defaultLaunch.eyebrow,
      headline: defaultLaunch.headline,
      message: defaultLaunch.message,
    },
  },
  {
    label: "Maintenance",
    values: {
      enabled: true,
      launchAt: "",
      eyebrow: "Back soon",
      headline: "We are making a few updates",
      message:
        "The website will be back shortly. The Germfask dispensary is open as usual, so call or stop in.",
    },
  },
];

const WALL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/** Offset (ms) of `tz` from UTC at the instant `epoch`. */
function tzOffset(epoch: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(epoch));
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
  return asUtc - Math.floor(epoch / 1000) * 1000;
}

/** The moment `launchAt` happens, as epoch ms. Null when blank or malformed. */
export function launchEpoch(launchAt: string): number | null {
  const m = WALL.exec(launchAt.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  if (Number.isNaN(guess)) return null;
  // Two passes so a time near a daylight-saving switch lands on the right side.
  const first = guess - tzOffset(guess, SHOP_TZ);
  const second = guess - tzOffset(first, SHOP_TZ);
  // A wall time that does not exist (the skipped hour in spring) makes the two
  // passes disagree; take the later instant, so 2:30 AM becomes 3:30 AM.
  return tzOffset(second, SHOP_TZ) === tzOffset(first, SHOP_TZ)
    ? second
    : Math.max(first, second);
}

/** "Monday, October 12 at 4:20 PM" in shop time. Empty when no time is set. */
export function launchLabel(launchAt: string): string {
  const epoch = launchEpoch(launchAt);
  if (epoch === null) return "";
  const when = new Date(epoch);
  const day = when.toLocaleDateString("en-US", {
    timeZone: SHOP_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const time = when
    .toLocaleTimeString("en-US", { timeZone: SHOP_TZ, hour: "numeric", minute: "2-digit" })
    .replace(/\s/g, " ");
  return `${day} at ${time}`;
}

/** The current shop-time wall clock, in the format a datetime-local input uses. */
export function shopWallClock(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(now);
  const g = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

/**
 * open: visitors see the site.
 * countdown: hidden until `launchAt`, then opens on its own.
 * closed: hidden until the owner switches the gate off.
 */
export type GateState = "open" | "countdown" | "closed";

export function gateState(launch: Launch, now = Date.now()): GateState {
  if (!launch.enabled) return "open";
  const at = launchEpoch(launch.launchAt);
  if (at === null) return "closed";
  return now < at ? "countdown" : "open";
}

/** True while visitors are kept on the coming-soon page. */
export function isPreLaunch(launch: Launch, now = Date.now()): boolean {
  return gateState(launch, now) !== "open";
}

/**
 * The time a request is being rendered at. A helper so server components can
 * stamp the render without calling Date.now() in their bodies.
 */
export function currentTime(): number {
  return Date.now();
}
