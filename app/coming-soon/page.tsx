import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ComingSoonView from "@/components/ComingSoon";
import PreviewBar from "@/components/PreviewBar";
import { isLoggedIn } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { currentTime, gateState, launchLabel } from "@/lib/launch";

export async function generateMetadata(): Promise<Metadata> {
  const { launch, site } = await getContent();
  const label = launchLabel(launch.launchAt);
  return {
    title: { absolute: `${launch.eyebrow.trim() || "Coming soon"} | ${site.name}` },
    description: label
      ? `The ${site.name} online store launches ${label}. ${launch.message}`
      : launch.message,
  };
}

/**
 * The holding page. app/(site)/template.tsx sends visitors here while the
 * gate is on. Once the site is open only the owner can still view it, so
 * "Preview on site" in the admin keeps working.
 */
export default async function ComingSoonPage() {
  // Read the cookie first, unconditionally: it keeps this page rendered per
  // request, so the countdown ending really does open the site.
  const owner = await isLoggedIn();
  const { launch, site } = await getContent();
  const now = currentTime();
  if (gateState(launch, now) === "open" && !owner) redirect("/");
  return (
    <>
      <ComingSoonView launch={launch} site={site} now={now} />
      {/* "Preview on site" from the admin lands here; same bar as the rest of the site. */}
      <PreviewBar />
    </>
  );
}
