import { updateTag } from "next/cache";
import {
  deals as defaultDeals,
  dealTiles as defaultDealTiles,
  faqs as defaultFaqs,
  menuItems as defaultMenuItems,
  site as defaultSite,
  type DealTile,
  type MenuItem,
} from "./site";

export type DealCard = { title: string; text: string; image: string };
export type Faq = { q: string; a: string };
export type SiteInfo = typeof defaultSite;

export type SiteContent = {
  site: SiteInfo;
  deals: DealCard[];
  dealTiles: DealTile[];
  faqs: Faq[];
  menuItems: MenuItem[];
};

export const CONTENT_KEYS = [
  "site",
  "deals",
  "dealTiles",
  "faqs",
  "menuItems",
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

/** Values shipped in the repo. Used until an owner saves an override. */
export const defaultContent: SiteContent = {
  site: defaultSite,
  deals: defaultDeals,
  dealTiles: defaultDealTiles,
  faqs: defaultFaqs,
  menuItems: defaultMenuItems,
};

const TABLE = "site_content";
const TAG = "site-content";

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export function isStoreConfigured() {
  return config() !== null;
}

/**
 * Reads saved overrides and merges them over the repo defaults, so the site
 * keeps rendering normally when the store is unreachable or not yet set up.
 * Cached under a tag so saves can invalidate it instantly.
 */
export async function getContent(): Promise<SiteContent> {
  const cfg = config();
  if (!cfg) return defaultContent;

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/${TABLE}?select=key,value`,
      {
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
        },
        next: { tags: [TAG], revalidate: 300 },
      },
    );
    if (!res.ok) return defaultContent;

    const rows: { key: string; value: unknown }[] = await res.json();
    const merged: SiteContent = { ...defaultContent };
    for (const row of rows) {
      if ((CONTENT_KEYS as readonly string[]).includes(row.key) && row.value) {
        // @ts-expect-error key is validated above
        merged[row.key] = row.value;
      }
    }
    return merged;
  } catch {
    return defaultContent;
  }
}

/** Upserts one section and invalidates the cached read. */
export async function saveSection(
  key: ContentKey,
  value: unknown,
): Promise<void> {
  const cfg = config();
  if (!cfg) {
    throw new Error(
      "Content store is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const res = await fetch(`${cfg.url}/rest/v1/${TABLE}`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify([
      { key, value, updated_at: new Date().toISOString() },
    ]),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Save failed (${res.status}): ${await res.text()}`);
  }

  // called from a Server Action: expire immediately so the owner
  // sees their change on the next render rather than stale content
  updateTag(TAG);
}
