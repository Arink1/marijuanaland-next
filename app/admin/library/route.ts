import { isLoggedIn } from "@/lib/auth";
import { builtinImages, listUploads } from "@/lib/storage";

/** Photos available to the picker: everything uploaded plus the built-ins. */
export async function GET() {
  if (!(await isLoggedIn())) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  const uploads = await listUploads();
  return Response.json({
    uploads: uploads.map((u) => u.url),
    builtin: builtinImages,
  });
}
