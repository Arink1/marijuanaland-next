// Visitor counts for the Traffic tab in /admin.
//
// Every page view the site serves is written to the `page_views` table by
// app/api/track/route.ts. Nothing stored identifies a person: there is no
// cookie and no IP address, only a hash that is thrown away at the end of the
// day (see `visitorHash`) and the coarse city Vercel's edge already knows.
import { createHash } from "crypto";
import { rest, restJson, supabaseConfig } from "./supabase";
import { todayInShop } from "./schedule";

export type TrafficRow = {
  day: string;
  visitor: string;
  session: string;
  entry: boolean;
  path: string;
  source: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  device: string;
};

/** A stored row as the spreadsheet download reads it. No visitor hash. */
export type TrafficExportRow = Omit<TrafficRow, "visitor"> & { created_at: string };

/** One line of a top-ten table: "Google - 42 views, 31 visitors". */
export type TrafficTop = { label: string; views: number; visitors: number };

export type TrafficSummary = {
  days: number;
  from_day: string;
  to_day: string;
  views: number;
  visitors: number;
  visits: number;
  bounces: number;
  prev: { views: number; visitors: number; visits: number };
  online: number;
  daily: { day: string; views: number; visitors: number }[];
  hours: { hour: number; views: number }[];
  sources: TrafficTop[];
  pages: TrafficTop[];
  entries: TrafficTop[];
  places: TrafficTop[];
  devices: TrafficTop[];
  referrers: TrafficTop[];
  campaigns: TrafficTop[];
  latest: {
    at: string;
    path: string;
    source: string;
    place: string;
    device: string;
  }[];
};

const TABLE = "page_views";

/** Ranges the Traffic tab offers, in days. */
export const TRAFFIC_RANGES = [7, 30, 90] as const;
export const DEFAULT_RANGE = 30;

export function trafficRange(raw: string | undefined): number {
  const n = Number(raw);
  return (TRAFFIC_RANGES as readonly number[]).includes(n) ? n : DEFAULT_RANGE;
}

// ---------------------------------------------------------------------------
// Working out where a visit came from.

/**
 * Link previewers, uptime checks and crawlers. They never run the tracking
 * script, so this is a second line of defence for anything that does.
 */
const BOT =
  /bot\b|bot[/-]|crawl|spider|slurp|archiver|scrap|curl\/|wget|python-requests|node-fetch|axios|okhttp|go-http|java\/|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitoring|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|vercel|screenshot|semrush|ahrefs|mj12|dotbot|petal|bytespider|phantomjs|puppeteer|playwright|selenium/i;

export function isBot(ua: string): boolean {
  return ua.trim() === "" || BOT.test(ua);
}

export function deviceFromUa(ua: string): string {
  if (/ipad|tablet|playbook|silk|kindle|android(?!.*mobi)/i.test(ua)) return "Tablet";
  if (/mobi|iphone|ipod|android|blackberry|windows phone|iemobile/i.test(ua)) return "Mobile";
  return "Desktop";
}

// Email first: mail.google.com would otherwise be counted as Google.
const SOURCE_HOSTS: [RegExp, string][] = [
  [/^mail\.google\.com$|^outlook\.(live|office|office365)\.com$|^mail\.yahoo\.com$|^mail\.aol\.com$/, "Email"],
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$|(^|\.)msn\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)yahoo\./, "Yahoo"],
  [/(^|\.)ecosia\.org$/, "Ecosia"],
  [/(^|\.)brave\.com$/, "Brave Search"],
  [/(^|\.)facebook\.com$|^fb\.me$|(^|\.)facebook\.net$/, "Facebook"],
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/^t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, "X (Twitter)"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)youtube\.com$|^youtu\.be$/, "YouTube"],
  [/(^|\.)snapchat\.com$/, "Snapchat"],
  [/(^|\.)pinterest\./, "Pinterest"],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, "LinkedIn"],
  [/(^|\.)weedmaps\.com$/, "Weedmaps"],
  [/(^|\.)leafly\.com$/, "Leafly"],
  [/(^|\.)dutchie\.com$/, "Dutchie"],
  [/(^|\.)yelp\.com$/, "Yelp"],
  [/(^|\.)tripadvisor\./, "Tripadvisor"],
  [/(^|\.)nextdoor\.com$/, "Nextdoor"],
  [/(^|\.)michigan\.gov$/, "Michigan.gov"],
];

// A campaign tag the owner typed, mapped to the same name the referrer would
// have produced, so "fb" and a real Facebook click land in one row.
const UTM_ALIASES: Record<string, string> = {
  fb: "Facebook",
  facebook: "Facebook",
  "facebook-ads": "Facebook",
  meta: "Facebook",
  ig: "Instagram",
  instagram: "Instagram",
  google: "Google",
  "google-ads": "Google Ads",
  adwords: "Google Ads",
  gmb: "Google Business Profile",
  gbp: "Google Business Profile",
  maps: "Google Business Profile",
  email: "Email",
  newsletter: "Email",
  sms: "Text message",
  text: "Text message",
  qr: "QR code",
  flyer: "Flyer",
  print: "Print ad",
  weedmaps: "Weedmaps",
  leafly: "Leafly",
};

const titleCase = (s: string) =>
  s.replace(/[-_]+/g, " ").replace(/\b[a-z]/g, (c) => c.toUpperCase());

/** "www.google.com" from a referrer URL, or "" when there isn't a usable one. */
export function referrerHost(referrer: string, ownHosts: string[]): string {
  const raw = referrer.trim();
  if (!raw) return "";
  let host: string;
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    return "";
  }
  const bare = host.replace(/^www\./, "");
  // A link from one of our own pages is navigation inside the site, not a
  // source. The visit keeps whatever source its first page had.
  if (ownHosts.some((h) => h === bare || h === host)) return "";
  if (bare === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(bare)) return "";
  return host;
}

/** The friendly name shown in the Sources table. */
export function classifySource(input: {
  referrerHost?: string;
  utmSource?: string;
  utmMedium?: string;
}): string {
  const utm = (input.utmSource ?? "").trim().toLowerCase();
  if (utm) return UTM_ALIASES[utm] ?? titleCase(utm);

  const host = (input.referrerHost ?? "").trim().toLowerCase();
  if (host) {
    const bare = host.replace(/^(www|m|l|lm|web|out)\./, "");
    for (const [re, label] of SOURCE_HOSTS) {
      if (re.test(bare) || re.test(host)) return label;
    }
    return bare;
  }

  const medium = (input.utmMedium ?? "").trim().toLowerCase();
  if (medium) return UTM_ALIASES[medium] ?? titleCase(medium);
  return "Direct";
}

// ---------------------------------------------------------------------------
// Writing

const clip = (v: unknown, max: number) => {
  const s = String(v ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  return s.slice(0, max);
};

/** The pathname on its own: no query string, no hash, no trailing slash. */
export function cleanPath(raw: unknown): string {
  let p = clip(raw, 300).split(/[?#]/)[0];
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p.slice(0, 200) || "/";
}

/**
 * Who the visitor is, for counting only. The address and browser are mixed
 * with a server secret and today's date, then hashed: the same person is one
 * visitor for the rest of the day and a brand new one tomorrow, and the hash
 * cannot be turned back into an address.
 */
export function visitorHash(ip: string, ua: string, day: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "marijuanaland";
  return createHash("sha256")
    .update(`${day}|${secret}|${ip}|${ua}`)
    .digest("hex")
    .slice(0, 32);
}

export type PageViewInput = {
  path: unknown;
  referrer?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  session?: unknown;
  entry?: unknown;
};

export type RequestFacts = {
  ip: string;
  ua: string;
  host: string;
  country?: string | null;
  region?: string | null;
  city?: string | null;
};

/** Builds the row that gets stored. Exported so it can be unit-tested. */
export function buildPageView(
  input: PageViewInput,
  facts: RequestFacts,
  day = todayInShop(),
): TrafficRow {
  const ownHosts = [
    "marijuanaland.com",
    "www.marijuanaland.com",
    facts.host.toLowerCase().replace(/:\d+$/, "").replace(/^www\./, ""),
  ];
  const host = referrerHost(String(input.referrer ?? ""), ownHosts);
  const utm_source = clip(input.utmSource, 60) || null;
  const utm_medium = clip(input.utmMedium, 60) || null;
  const utm_campaign = clip(input.utmCampaign, 80) || null;

  return {
    day,
    visitor: visitorHash(facts.ip, facts.ua, day),
    // A browser with sessionStorage switched off sends nothing; fall back to
    // the daily hash so the view is still counted as one visit.
    session: clip(input.session, 40) || visitorHash(facts.ip, facts.ua, day),
    entry: input.entry === true || input.entry === "1",
    path: cleanPath(input.path),
    source: classifySource({
      referrerHost: host,
      utmSource: utm_source ?? undefined,
      utmMedium: utm_medium ?? undefined,
    }).slice(0, 60),
    referrer: host || null,
    utm_source,
    utm_medium,
    utm_campaign,
    country: clip(facts.country, 8) || null,
    region: clip(facts.region, 60) || null,
    city: clip(facts.city, 80) || null,
    device: deviceFromUa(facts.ua),
  };
}

export async function recordPageView(
  input: PageViewInput,
  facts: RequestFacts,
): Promise<void> {
  if (!supabaseConfig()) return;
  const res = await rest(TABLE, {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify([buildPageView(input, facts)]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Could not record page view (${res.status}).`);
}

// ---------------------------------------------------------------------------
// Reading

/** Thrown when the traffic SQL has not been run in Supabase yet. */
export class TrafficNotInstalled extends Error {
  constructor() {
    super(
      "Visitor tracking is not set up in the database yet. Run supabase/schema.sql in the Supabase SQL editor.",
    );
    this.name = "TrafficNotInstalled";
  }
}

export async function getTrafficSummary(days: number): Promise<TrafficSummary> {
  if (!supabaseConfig()) throw new TrafficNotInstalled();
  const res = await rest("rpc/traffic_summary", {
    method: "POST",
    body: JSON.stringify({ days }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    // PGRST202: no such function. PGRST205: no such table.
    if (res.status === 404 || /PGRST20[25]|does not exist/i.test(text)) {
      throw new TrafficNotInstalled();
    }
    throw new Error(`Could not read visitor counts (${res.status}).`);
  }
  return (await res.json()) as TrafficSummary;
}

/** Raw rows for the window, newest first, for the spreadsheet download. */
export async function getTrafficRows(days: number): Promise<TrafficExportRow[]> {
  if (!supabaseConfig()) return [];
  const [y, m, d] = todayInShop().split("-").map(Number);
  const fromDay = new Date(Date.UTC(y, m - 1, d - (days - 1)))
    .toISOString()
    .slice(0, 10);
  const out: TrafficExportRow[] = [];
  for (let offset = 0; ; offset += 1000) {
    const page = await restJson<TrafficExportRow[]>(
      `${TABLE}?select=created_at,day,session,entry,path,source,referrer,utm_source,utm_medium,utm_campaign,country,region,city,device` +
        `&day=gte.${fromDay}&order=created_at.desc&limit=1000&offset=${offset}`,
      { cache: "no-store" },
    );
    out.push(...page);
    if (page.length < 1000) return out;
  }
}

/** Deletes rows older than `keepDays`. Called by the daily cron. */
export async function prunePageViews(keepDays = 400): Promise<number | null> {
  if (!supabaseConfig()) return null;
  const res = await rest("rpc/prune_page_views", {
    method: "POST",
    body: JSON.stringify({ keep_days: keepDays }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const n = await res.json();
  return typeof n === "number" ? n : null;
}
