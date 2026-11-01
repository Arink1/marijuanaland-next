import Image from "next/image";
import Countdown from "@/components/Countdown";
import type { SiteInfo } from "@/lib/content";
import { gateState, launchEpoch, launchLabel, type Launch } from "@/lib/launch";
import type { ScreenVariant } from "@/lib/screen";

const SIZE: Record<ScreenVariant, { logo: string; h1: string; buttons: string }> = {
  responsive: { logo: "w-48 sm:w-64", h1: "text-4xl sm:text-6xl", buttons: "flex-col sm:flex-row" },
  phone: { logo: "w-48", h1: "text-4xl", buttons: "flex-col" },
  desktop: { logo: "w-64", h1: "text-6xl", buttons: "flex-row" },
};

/**
 * The full-screen holding page visitors see while the site is hidden.
 * Rendered by /coming-soon and previewed live inside /admin.
 */
export default function ComingSoonView({
  launch,
  site,
  now,
  variant = "responsive",
  preview = false,
  className = "min-h-svh",
}: {
  launch: Launch;
  site: SiteInfo;
  /** Epoch ms the page is rendered at; the countdown runs from this clock. */
  now: number;
  variant?: ScreenVariant;
  /** Admin preview: no page reload when the countdown ends, no eager image loads. */
  preview?: boolean;
  /** Height of the page; the real page fills the screen. */
  className?: string;
}) {
  const state = gateState(launch, now);
  const epoch = launchEpoch(launch.launchAt);
  const label = launchLabel(launch.launchAt);
  const s = SIZE[variant];

  return (
    <div className={`relative flex flex-col overflow-hidden bg-olive-dark text-cream ${className}`}>
      <Image
        src="/images/marijuana-land-coming-soon-bg.jpg"
        alt=""
        fill
        priority={!preview}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <Image
          src="/images/header-logo-n.png"
          alt={site.name}
          width={270}
          height={96}
          priority={!preview}
          className={`h-auto ${s.logo}`}
        />

        {launch.eyebrow.trim() !== "" && (
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.3em] text-gold">
            {launch.eyebrow}
          </p>
        )}
        {launch.headline.trim() !== "" && (
          <h1
            className={`font-bold leading-tight ${s.h1} ${
              launch.eyebrow.trim() !== "" ? "mt-3" : "mt-10"
            }`}
          >
            {launch.headline}
          </h1>
        )}

        {state === "countdown" && epoch !== null && (
          <>
            <Countdown end={epoch} startedAt={now} variant={variant} reload={!preview} />
            <p className="mt-6 text-sm font-bold uppercase tracking-brand text-gold">{label}</p>
          </>
        )}

        {launch.message.trim() !== "" && (
          <p className="mt-8 max-w-md text-lg text-cream/85">{launch.message}</p>
        )}

        <div className={`mt-8 flex gap-3 ${s.buttons}`}>
          <a
            href={site.phoneHref}
            className="rounded-full bg-gold px-7 py-3 font-bold uppercase tracking-brand text-ink transition hover:bg-orange"
          >
            Call {site.phone}
          </a>
          <a
            href={site.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-cream/60 px-7 py-3 font-bold uppercase tracking-brand transition hover:border-gold hover:text-gold"
          >
            Get directions
          </a>
        </div>
      </main>

      <footer className="relative px-4 pb-6 text-center text-sm text-cream/60">
        <p>
          {site.address} · {site.hours}
        </p>
        <p className="mt-1">
          <a
            href={`https://instagram.com/${site.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold"
          >
            @{site.instagramHandle}
          </a>{" "}
          · For adults 21 and over.
        </p>
      </footer>
    </div>
  );
}
