import { draftMode } from "next/headers";
import { isLoggedIn } from "@/lib/auth";
import { isContentKey, saveDraft } from "@/lib/content";

/**
 * "Preview on site": saves the section as a draft and switches this browser
 * into Draft Mode (a cookie on the response). The admin then opens the page
 * that shows the section. Only the owner's browser sees drafts; every other
 * visitor keeps seeing the live site.
 */
export async function POST(request: Request) {
  if (!(await isLoggedIn())) {
    return Response.json({ error: "Your session expired. Sign in again." }, { status: 401 });
  }

  let body: { section?: string; value?: unknown; path?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Could not read the submitted values." }, { status: 400 });
  }

  const key = String(body.section ?? "");
  if (!isContentKey(key) || body.value === undefined) {
    return Response.json({ error: "Unknown section." }, { status: 400 });
  }

  try {
    await saveDraft(key, body.value);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Could not save the draft." },
      { status: 500 },
    );
  }

  (await draftMode()).enable();
  const path = String(body.path ?? "/");
  return Response.json({
    path: path.startsWith("/") && !path.startsWith("//") ? path : "/",
  });
}
