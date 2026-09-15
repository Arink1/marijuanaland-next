// Photo uploads live in a public Supabase Storage bucket. Files are written
// only from the server with the service role key; reading is public so the
// site can serve them straight from the CDN.
import { randomBytes } from "crypto";
import { authHeaders, requireConfig, supabaseConfig } from "./supabase";

export const BUCKET = "site-images";

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

const EXT_FOR: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export function extensionFor(contentType: string): string | null {
  return EXT_FOR[contentType] ?? null;
}

/** Photos that ship with the site and can be reused from the picker. */
export const builtinImages = [
  "/images/shop-2.png",
  "/images/shop-3.png",
  "/images/shop-4.png",
  "/images/shop-6.png",
  "/images/shop-8.png",
  "/images/shop.jpg",
  "/images/image-8.png",
  "/images/Rectangle-98-1.png",
  "/images/Rectangle-99-1.png",
  "/images/Rectangle-100-2.png",
  "/images/Rectangle-102-1.png",
  "/images/Rectangle-104-1.png",
  "/images/Rectangle-107.png",
  "/images/Rectangle-98.jpg",
  "/images/Rectangle-99.png",
  "/images/Rectangle-100.png",
  "/images/our-story-1.png",
  "/images/hero-min.png",
  "/images/about-location-img-mob.png",
  "/images/ml-pop-up-banner.jpg",
];

export function publicUrl(name: string) {
  const cfg = requireConfig();
  return `${cfg.url}/storage/v1/object/public/${BUCKET}/${name}`;
}

export async function uploadImage(
  bytes: ArrayBuffer,
  contentType: string,
): Promise<string> {
  const cfg = requireConfig();
  const ext = extensionFor(contentType);
  if (!ext) throw new Error("Only JPG, PNG, WebP, GIF or SVG images can be uploaded.");
  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new Error("That photo is too large. Please use one under 6 MB.");
  }
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const res = await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${name}`, {
    method: "POST",
    headers: authHeaders(cfg.key, {
      "Content-Type": contentType,
      "x-upsert": "false",
      "Cache-Control": "public, max-age=31536000, immutable",
    }),
    body: bytes,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 404 || /bucket/i.test(text)) {
      throw new Error(
        `Upload failed: the "${BUCKET}" storage bucket does not exist yet. Run supabase/schema.sql.`,
      );
    }
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }
  return publicUrl(name);
}

export type UploadedImage = { name: string; url: string; created_at: string };

export async function listUploads(): Promise<UploadedImage[]> {
  const cfg = supabaseConfig();
  if (!cfg) return [];
  try {
    const res = await fetch(`${cfg.url}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: authHeaders(cfg.key, { "Content-Type": "application/json" }),
      body: JSON.stringify({
        prefix: "",
        limit: 500,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      }),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as { name: string; created_at: string; id?: string }[];
    return rows
      .filter((r) => r.id) // folders have no id
      .map((r) => ({
        name: r.name,
        url: `${cfg.url}/storage/v1/object/public/${BUCKET}/${r.name}`,
        created_at: r.created_at,
      }));
  } catch {
    return [];
  }
}
