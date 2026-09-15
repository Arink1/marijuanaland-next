// Thin helpers around the Supabase REST + Storage APIs. Server-only: these
// read the service role key, which must never reach the browser.

export function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export function isStoreConfigured() {
  return supabaseConfig() !== null;
}

export const NOT_CONFIGURED =
  "Storage is not connected yet. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the Vercel project.";

export function requireConfig() {
  const cfg = supabaseConfig();
  if (!cfg) throw new Error(NOT_CONFIGURED);
  return cfg;
}

export function authHeaders(key: string, extra: Record<string, string> = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  };
}

/** fetch() against /rest/v1/<path> with the service role key attached. */
export async function rest(
  path: string,
  init: RequestInit & { next?: { tags?: string[]; revalidate?: number } } = {},
) {
  const cfg = requireConfig();
  return fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: authHeaders(cfg.key, {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string>) ?? {}),
    }),
  });
}

export async function restJson<T>(
  path: string,
  init: RequestInit & { next?: { tags?: string[]; revalidate?: number } } = {},
): Promise<T> {
  const res = await rest(path, init);
  if (!res.ok) {
    throw new Error(`Database request failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as T;
}
