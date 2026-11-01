import { draftMode } from "next/headers";
import {
  deals as defaultDeals,
  dealTiles as defaultDealTiles,
  faqs as defaultFaqs,
  galleryImages as defaultGalleryImages,
  menuItems as defaultMenuItems,
  site as defaultSite,
  testimonials as defaultTestimonials,
  type DealTile,
  type MenuItem,
} from "./site";
import { defaultLaunch, type Launch } from "./launch";
import { authHeaders, rest, restJson, supabaseConfig } from "./supabase";

export type { Launch };

export type DealCard = {
  title: string;
  text: string;
  image: string;
  start?: string;
  end?: string;
};
export type Faq = { q: string; a: string };
export type Testimonial = {
  quote: string;
  author: string;
  rating: number;
  show: boolean;
};
export type GalleryImage = { src: string; caption: string };
export type Notice = {
  enabled: boolean;
  message: string;
  /** YYYY-MM-DD; the notice hides itself after this day. Empty = manual. */
  until: string;
};
export type SiteInfo = typeof defaultSite;

export type SiteContent = {
  site: SiteInfo;
  deals: DealCard[];
  dealTiles: DealTile[];
  faqs: Faq[];
  menuItems: MenuItem[];
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  notice: Notice;
  launch: Launch;
};

export const CONTENT_KEYS = [
  "site",
  "deals",
  "dealTiles",
  "faqs",
  "menuItems",
  "gallery",
  "testimonials",
  "notice",
  "launch",
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

export function isContentKey(k: string): k is ContentKey {
  return (CONTENT_KEYS as readonly string[]).includes(k);
}

/** Sections stored as one object; every other section is a list. */
export const OBJECT_SECTIONS: readonly ContentKey[] = ["site", "notice", "launch"];

/** Values shipped in the repo. Used until an owner publishes an override. */
export const defaultContent: SiteContent = {
  site: defaultSite,
  deals: defaultDeals,
  dealTiles: defaultDealTiles,
  faqs: defaultFaqs,
  menuItems: defaultMenuItems,
  gallery: defaultGalleryImages.map((src) => ({ src, caption: "" })),
  testimonials: defaultTestimonials.map((t) => ({
    ...t,
    rating: 5,
    show: true,
  })),
  notice: { enabled: false, message: "", until: "" },
  launch: defaultLaunch,
};

/** Pages that render site content; revalidated after every publish. */
export const SITE_PATHS = ["/", "/shop", "/faq", "/about-us", "/contact", "/gallery", "/coming-soon"];
export const CONTENT_TAG = "site-content";

const TABLE = "site_content";

type Row = {
  key: string;
  value: unknown;
  draft: unknown | null;
  previous: unknown | null;
  updated_at: string | null;
  published_at: string | null;
};

export type SectionMeta = {
  hasDraft: boolean;
  canUndo: boolean;
  publishedAt: string | null;
};

/**
 * Fields of the "site" section the owner can edit in /admin. Only these are
 * taken from the database; everything else (name, tagline, directions link)
 * always comes from lib/site.ts so code changes keep showing up.
 */
export const SITE_EDITABLE = [
  "promo",
  "phone",
  "phoneHref",
  "email",
  "address",
  "hours",
  "hoursDetail",
  "instagramHandle",
  "licenses",
] as const;

function mergeSite(stored: unknown): SiteInfo {
  const src = (stored ?? {}) as Record<string, unknown>;
  const site: SiteInfo = { ...defaultSite };
  for (const k of SITE_EDITABLE) {
    const v = src[k];
    if (k === "hoursDetail") {
      if (Array.isArray(v)) {
        const lines = v.map((l) => String(l ?? "").trim()).filter(Boolean);
        if (lines.length) site.hoursDetail = lines;
      }
    } else if (typeof v === "string") {
      site[k] = v;
    }
  }
  site.directionsUrl = `https://www.google.com/maps/dir//${encodeURIComponent(site.address)}`;
  return site;
}

/**
 * Coerces a stored launch row to the exact shape the gate expects. A row that
 * is missing the switch fails open (site visible) rather than locking the
 * site behind the holding page.
 */
function mergeLaunch(stored: unknown): Launch {
  const src = (stored ?? {}) as Record<string, unknown>;
  const text = (k: keyof Launch, fallback: string) =>
    typeof src[k] === "string" ? (src[k] as string) : fallback;
  return {
    enabled: src.enabled === true,
    launchAt: text("launchAt", ""),
    eyebrow: text("eyebrow", defaultLaunch.eyebrow),
    headline: text("headline", defaultLaunch.headline),
    message: text("message", defaultLaunch.message),
  };
}

/** Per-section clean-up applied to anything read from the database. */
function clean(key: ContentKey, v: unknown): unknown {
  if (key === "site") return mergeSite(v);
  if (key === "launch") return mergeLaunch(v);
  return v;
}

function merge(rows: Row[], pick: (r: Row) => unknown): SiteContent {
  const merged: SiteContent = { ...defaultContent };
  for (const row of rows) {
    const v = pick(row);
    if (!isContentKey(row.key) || v == null) continue;
    if (row.key === "site") {
      merged.site = mergeSite(v);
    } else if (row.key === "launch") {
      merged.launch = mergeLaunch(v);
    } else {
      // @ts-expect-error key is validated above
      merged[row.key] = v;
    }
  }
  return merged;
}

/**
 * Content for the public site. Cached under a tag so publishes invalidate it
 * instantly. In Draft Mode (owner clicked "Preview") the cache is bypassed and
 * unpublished drafts are layered over the live values.
 */
export async function getContent(): Promise<SiteContent> {
  const cfg = supabaseConfig();
  if (!cfg) return defaultContent;

  const { isEnabled: preview } = await draftMode();

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/${TABLE}?select=key,value,draft`,
      {
        headers: authHeaders(cfg.key),
        ...(preview
          ? { cache: "no-store" as const }
          : { next: { tags: [CONTENT_TAG], revalidate: 300 } }),
      },
    );
    if (!res.ok) return defaultContent;
    const rows: Row[] = await res.json();
    return merge(rows, (r) => (preview ? (r.draft ?? r.value) : r.value));
  } catch {
    return defaultContent;
  }
}

/** Everything the admin needs: live values, drafts and per-section status. */
export async function getAdminContent(): Promise<{
  live: SiteContent;
  drafts: Partial<SiteContent>;
  meta: Record<ContentKey, SectionMeta>;
  /** Set when the database could not be read; the editor must not save. */
  error?: string;
}> {
  const meta = Object.fromEntries(
    CONTENT_KEYS.map((k) => [
      k,
      { hasDraft: false, canUndo: false, publishedAt: null },
    ]),
  ) as Record<ContentKey, SectionMeta>;

  if (!supabaseConfig()) return { live: defaultContent, drafts: {}, meta };

  let rows: Row[] = [];
  try {
    rows = await restJson<Row[]>(
      `${TABLE}?select=key,value,draft,previous,updated_at,published_at`,
      { cache: "no-store" },
    );
  } catch (e) {
    return {
      live: defaultContent,
      drafts: {},
      meta,
      error: e instanceof Error ? e.message : "Database request failed.",
    };
  }

  const drafts: Partial<SiteContent> = {};
  for (const r of rows) {
    if (!isContentKey(r.key)) continue;
    meta[r.key] = {
      hasDraft: r.draft != null,
      canUndo: r.previous != null,
      publishedAt: r.published_at,
    };
    if (r.draft != null) {
      // Same layering as the live site, so a stored draft can't freeze
      // fields the owner can't edit.
      // @ts-expect-error key validated above
      drafts[r.key] = clean(r.key, r.draft);
    }
  }
  return { live: merge(rows, (r) => r.value), drafts, meta };
}

async function fetchRow(key: ContentKey): Promise<Row | null> {
  const rows = await restJson<Row[]>(
    `${TABLE}?key=eq.${key}&select=key,value,draft,previous,updated_at,published_at`,
    { cache: "no-store" },
  );
  return rows[0] ?? null;
}

async function upsert(row: Partial<Row> & { key: ContentKey }) {
  const res = await rest(TABLE, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([row]),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Save failed (${res.status}): ${await res.text()}`);
  }
}

/** Stores an unpublished draft. The live site is untouched. */
export async function saveDraft(key: ContentKey, value: unknown) {
  const cur = await fetchRow(key);
  await upsert({
    key,
    // No live override yet: keep it null so the site keeps using lib/site.ts
    // instead of freezing today's defaults into the database.
    value: cur?.value ?? null,
    draft: value,
    updated_at: new Date().toISOString(),
  });
}

/** Makes `value` live, remembering the old live value so it can be undone. */
export async function publishSection(key: ContentKey, value: unknown) {
  const cur = await fetchRow(key);
  const now = new Date().toISOString();
  await upsert({
    key,
    value,
    previous: cur?.value ?? defaultContent[key],
    draft: null,
    updated_at: now,
    published_at: now,
  });
}

/** Swaps the live value with the one published before it. */
export async function undoSection(key: ContentKey) {
  const cur = await fetchRow(key);
  if (!cur || cur.previous == null) {
    throw new Error("Nothing to undo in this section yet.");
  }
  const now = new Date().toISOString();
  await upsert({
    key,
    value: cur.previous,
    previous: cur.value,
    updated_at: now,
    published_at: now,
  });
}

/** Publishes every section that has a draft. Returns the keys published. */
export async function publishAllDrafts(): Promise<ContentKey[]> {
  const rows = await restJson<Row[]>(
    `${TABLE}?draft=not.is.null&select=key,value,draft`,
    { cache: "no-store" },
  );
  const now = new Date().toISOString();
  const done: ContentKey[] = [];
  for (const r of rows) {
    if (!isContentKey(r.key)) continue;
    await upsert({
      key: r.key,
      value: r.draft,
      previous: r.value ?? defaultContent[r.key],
      draft: null,
      updated_at: now,
      published_at: now,
    });
    done.push(r.key);
  }
  return done;
}

/** Throws away the draft for a section. The live value is left alone. */
export async function discardDraft(key: ContentKey) {
  const res = await rest(`${TABLE}?key=eq.${key}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ draft: null, updated_at: new Date().toISOString() }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Discard failed (${res.status}): ${await res.text()}`);
  }
}
