// Browser-side photo prep: fixes phone-camera rotation and shrinks big photos
// before upload so a 12 MB iPhone shot becomes a few hundred KB.

const MAX_EDGE = 1600;

export type PreparedImage = { blob: Blob; type: string };

// Matches MAX_UPLOAD_BYTES in lib/storage.ts (Vercel caps uploads at 4.5 MB).
const UPLOAD_CAP = 4 * 1024 * 1024;

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fall through to <img> */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file does not look like a photo."));
    };
    img.src = url;
  });
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  // Animated GIFs and SVGs are uploaded untouched.
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return { blob: file, type: file.type };
  }

  const source = await decode(file);
  const w = "naturalWidth" in source ? source.naturalWidth : source.width;
  const h = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { blob: file, type: file.type || "image/jpeg" };
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ("close" in source) source.close();

  const encode = (t: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, t, 0.85));

  // PNGs keep transparency (logos); everything else becomes a JPEG.
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await encode(type);
  if (!blob) throw new Error("Could not process that photo.");
  if (type !== "image/png" || blob.size <= UPLOAD_CAP) return { blob, type };

  // The browser's PNG encoder can make big photos bigger than the original.
  // Try WebP (keeps transparency), then the original file, then JPEG.
  const webp = await encode("image/webp");
  if (webp && webp.type === "image/webp" && webp.size <= UPLOAD_CAP) {
    return { blob: webp, type: "image/webp" };
  }
  if (scale === 1 && file.size <= UPLOAD_CAP) return { blob: file, type: file.type };
  const jpeg = await encode("image/jpeg");
  return jpeg ? { blob: jpeg, type: "image/jpeg" } : { blob, type };
}

export async function uploadPrepared(file: File): Promise<string> {
  const { blob, type } = await prepareImage(file);
  if (blob.size > UPLOAD_CAP) {
    throw new Error("That photo is too large. Please use one under 4 MB.");
  }
  const body = new FormData();
  body.append("file", new File([blob], "photo", { type }));
  const res = await fetch("/admin/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Upload failed. Please try again.");
  }
  return data.url;
}
