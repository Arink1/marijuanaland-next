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
import { authHeaders, rest, restJson, supabaseConfig } from "./supabase";

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
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

export function isContentKey(k: string): k is ContentKey {
  return (CONTENT_KEYS as readonly string[]).includes(k);
}

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
};

/** Pages that render site content; revalidated after every publish. */
export const SITE_PATHS = ["/", "/shop", "/faq", "/about-us", "/contact", "/gallery"];
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

function merge(rows: Row[], pick: (r: Row) => unknown): SiteContent {
  const merged: SiteContent = { ...defaultContent };
  for (const row of rows) {
    const v = pick(row);
    if (isContentKey(row.key) && v != null) {
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
  } catch {
    return { live: defaultContent, drafts: {}, meta };
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
      // @ts-expect-error key validated above
      drafts[r.key] = r.draft;
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
    value: cur?.value ?? defaultContent[key],
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
      previous: r.value,
      draft: null,
      updated_at: now,
      published_at: now,
    });
    done.push(r.key);
  }
  return done;
}

/** Throws away the draft for a section. */
export async function discardDraft(key: ContentKey) {
  const cur = await fetchRow(key);
  if (!cur) return;
  await upsert({ key, draft: null, updated_at: new Date().toISOString() });
}
