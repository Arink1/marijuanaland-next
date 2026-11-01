import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { isPreLaunch } from "@/lib/launch";

/**
 * Coming-soon / maintenance gate (set in /admin). Lives in a template rather
 * than the layout because templates run again on every navigation, so a
 * visitor already browsing is caught the moment the gate is switched on.
 *
 * isLoggedIn() reads the session cookie on every request, which also keeps
 * every public page rendered per request; a page prerendered while the gate
 * was off would otherwise never notice it being turned on.
 */
export default async function SiteTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const owner = await isLoggedIn();
  const { launch } = await getContent();
  if (isPreLaunch(launch) && !owner) redirect("/coming-soon");
  return children;
}
