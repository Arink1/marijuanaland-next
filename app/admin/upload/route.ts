import { isLoggedIn } from "@/lib/auth";
import { extensionFor, uploadImage } from "@/lib/storage";

export async function POST(request: Request) {
  if (!(await isLoggedIn())) {
    return Response.json({ error: "Your session expired. Sign in again." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No photo was received." }, { status: 400 });
  }
  if (!extensionFor(file.type)) {
    return Response.json(
      { error: "Only JPG, PNG, WebP, GIF or SVG images can be uploaded." },
      { status: 400 },
    );
  }

  try {
    const url = await uploadImage(await file.arrayBuffer(), file.type);
    return Response.json({ url });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Upload failed." },
      { status: 500 },
    );
  }
}
