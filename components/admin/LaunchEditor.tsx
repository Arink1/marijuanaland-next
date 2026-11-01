"use client";

import { useState } from "react";
import ComingSoonView from "@/components/ComingSoon";
import { useNow } from "@/lib/client/hooks";
import type { SectionMeta, SiteInfo } from "@/lib/content";
import {
  LAUNCH_PRESETS,
  gateState,
  launchEpoch,
  launchLabel,
  shopWallClock,
  type Launch,
} from "@/lib/launch";
import EditorFrame from "./EditorFrame";
import ScaledPreview, { DEVICE_WIDTH, DeviceToggle, useDevice } from "./ScaledPreview";
import { btn, fieldLabel, input } from "./ui";

/** One switch, an optional opening time, three lines of copy, and a live preview. */
export default function LaunchEditor({
  initial,
  live,
  meta,
  storeReady,
  flash,
  site,
}: {
  initial: Launch;
  live: Launch;
  meta: SectionMeta;
  storeReady: boolean;
  flash?: string;
  /** Live contact details, shown on the page's buttons and footer. */
  site: SiteInfo;
}) {
  const [launch, setLaunch] = useState<Launch>({ ...initial });
  const set = (patch: Partial<Launch>) => setLaunch((l) => ({ ...l, ...patch }));
  const [device, setDevice] = useDevice();

  // Refreshed every half minute so the status line flips on its own when the
  // opening time passes while the admin is open. Null until hydrated.
  const now = useNow(30_000);
  const nowMs = now ?? undefined;

  const state = gateState(launch, nowMs);
  const label = launchLabel(launch.launchAt);
  const badTime = launch.launchAt.trim() !== "" && launchEpoch(launch.launchAt) === null;
  const passed = launch.enabled && state === "open";

  const status = !launch.enabled
    ? label
      ? "Visitors see the full site. The time below only counts while the page is switched on."
      : "Visitors see the full site."
    : state === "countdown"
      ? `Visitors see this page until ${label} shop time, then the site opens on its own.`
      : label
        ? `${label} has already passed, so visitors see the full site. Pick a new time, or switch this off.`
        : "Visitors see this page until you switch it off.";

  return (
    <EditorFrame
      section="launch"
      title="Coming soon / maintenance page"
      description="Hides the whole site behind one page. Add a date and time and a countdown shows, then the site opens on its own at that moment. Leave the time blank to keep it hidden until you switch it off."
      payload={JSON.stringify(launch)}
      previewPath="/coming-soon"
      meta={meta}
      storeReady={storeReady}
      flash={flash}
      problem={badTime ? "The opening time is not a full date and time." : null}
      onReset={() => {
        if (confirm("Go back to what is on the live site now? Unsaved edits here will be lost.")) {
          setLaunch({ ...live });
        }
      }}
    >
      {/* Phone: preview first, then the controls. Desktop: side by side. */}
      <div className="flex flex-col-reverse lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-5">
        <div className="mt-5 lg:mt-0">
          <label className="flex cursor-pointer items-center gap-3 rounded border border-beige bg-smoke px-4 py-3">
            <input
              type="checkbox"
              role="switch"
              checked={launch.enabled}
              onChange={(e) => set({ enabled: e.target.checked })}
              className="h-5 w-5 accent-olive"
            />
            <span className="font-semibold">
              {!launch.enabled
                ? "Site is open"
                : passed
                  ? "Site is open (the time has passed)"
                  : "Site is hidden"}
            </span>
          </label>
          <p
            role="status"
            className={`mt-2 text-sm ${passed ? "font-semibold text-orange-dark" : "text-stone-warm"}`}
          >
            {status}
          </p>

          <label className="mt-4 block">
            <span className={fieldLabel}>Open the site automatically at</span>
            {/* No min/max here: browser validation would block Publish and
                Undo for the whole section once a saved time is in the past. */}
            <input
              type="datetime-local"
              value={launch.launchAt}
              onChange={(e) => set({ launchAt: e.target.value })}
              className={input}
            />
            <span className="mt-0.5 block text-[11px] text-stone-warm/70">
              Shop time (Eastern), now {now === null ? "" : shopWallClock(new Date(now)).replace("T", " ")}.
              Blank = no countdown; the site stays hidden until you switch it off.
            </span>
          </label>
          {launch.launchAt !== "" && (
            <button type="button" onClick={() => set({ launchAt: "" })} className={`${btn.link} mt-1 text-xs`}>
              Clear the time
            </button>
          )}

          <div className="mt-4">
            <span className={fieldLabel}>Quick fill</span>
            <div className="flex flex-wrap gap-2">
              {LAUNCH_PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => set(p.values)} className={btn.subtle}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-4 block">
            <span className={fieldLabel}>Small line (gold)</span>
            <input
              value={launch.eyebrow}
              maxLength={60}
              onChange={(e) => set({ eyebrow: e.target.value })}
              placeholder="e.g. Online store coming soon"
              className={input}
            />
          </label>
          <label className="mt-3 block">
            <span className={fieldLabel}>Headline</span>
            <input
              value={launch.headline}
              maxLength={80}
              onChange={(e) => set({ headline: e.target.value })}
              placeholder="e.g. Our online store launches in"
              className={input}
            />
          </label>
          <label className="mt-3 block">
            <span className={fieldLabel}>Message</span>
            <textarea
              value={launch.message}
              maxLength={240}
              rows={3}
              onChange={(e) => set({ message: e.target.value })}
              placeholder="e.g. Our Germfask dispensary is open now, so stop in and see us."
              className={input}
            />
            <span className="mt-0.5 block text-[11px] text-stone-warm/70">
              {launch.message.length}/240 characters. The Call and Directions buttons come from Promo &amp; contact.
            </span>
          </label>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className={fieldLabel}>How it will look</span>
            <DeviceToggle value={device} onChange={setDevice} />
          </div>
          <div className="rounded border border-beige bg-olive-dark">
            {now === null ? (
              <p className="px-4 py-16 text-center text-sm text-cream/70">Loading preview…</p>
            ) : (
              <ScaledPreview width={DEVICE_WIDTH[device]}>
                {/* inert: a picture, not a page. Nothing inside can be clicked,
                    tabbed to, or read out as a second main/footer. */}
                <div inert className="select-none">
                  {/* Always drawn as if switched on, so the owner can get it
                      ready (countdown included) before flipping the switch. */}
                  <ComingSoonView
                    launch={{ ...launch, enabled: true }}
                    site={site}
                    now={now}
                    variant={device}
                    preview
                    className={device === "phone" ? "min-h-[760px]" : "min-h-[680px]"}
                  />
                </div>
              </ScaledPreview>
            )}
          </div>
          {!launch.enabled && (
            <p className="mt-2 text-xs text-stone-warm">
              The page is switched off, so visitors will not see it. Your wording is kept for next time.
            </p>
          )}
        </div>
      </div>
    </EditorFrame>
  );
}
