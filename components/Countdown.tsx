"use client";

import { useEffect, useState } from "react";
import type { ScreenVariant } from "@/lib/screen";

const UNITS = [
  { label: "Days", ms: 86_400_000 },
  { label: "Hours", ms: 3_600_000 },
  { label: "Minutes", ms: 60_000 },
  { label: "Seconds", ms: 1_000 },
];

function split(remaining: number) {
  let left = Math.max(0, remaining);
  return UNITS.map(({ label, ms }) => {
    const value = Math.floor(left / ms);
    left -= value * ms;
    return { label, value };
  });
}

const SIZE: Record<ScreenVariant, { gap: string; box: string; num: string; label: string }> = {
  responsive: {
    gap: "gap-2 sm:gap-4",
    box: "w-18 py-4 sm:w-28 sm:py-6",
    num: "text-3xl sm:text-5xl",
    label: "text-[10px] sm:text-xs",
  },
  phone: { gap: "gap-2", box: "w-18 py-4", num: "text-3xl", label: "text-[10px]" },
  desktop: { gap: "gap-4", box: "w-28 py-6", num: "text-5xl", label: "text-xs" },
};

export default function Countdown({
  end,
  startedAt,
  variant = "responsive",
  reload = true,
}: {
  /** Epoch ms the clock counts down to. */
  end: number;
  /**
   * The server's clock when the page was rendered. The countdown runs from
   * this plus time elapsed on the device, so a phone whose clock is fast does
   * not hit zero (and reload) before the server agrees the site is open.
   */
  startedAt: number;
  variant?: ScreenVariant;
  /** Reload when the clock hits zero so the real site appears. Off in the admin preview. */
  reload?: boolean;
}) {
  // null until mounted so server and client markup match.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const mounted = performance.now();
    const tick = () => {
      const t = startedAt + (performance.now() - mounted);
      setNow(t);
      if (t >= end) {
        clearInterval(id);
        if (reload) setTimeout(() => window.location.reload(), 1500);
      }
    };
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [end, startedAt, reload]);

  const parts = split(now === null ? 0 : end - now);
  const s = SIZE[variant];

  return (
    <div className={`mt-8 grid grid-cols-4 ${s.gap}`} role="timer" aria-live="off">
      {parts.map(({ label, value }) => (
        <div
          key={label}
          className={`flex flex-col items-center rounded-xl border border-cream/20 bg-black/35 backdrop-blur-sm ${s.box}`}
        >
          <span
            className={`font-[family-name:var(--font-archivo)] font-extrabold tabular-nums text-cream ${s.num}`}
          >
            {now === null ? "--" : String(value).padStart(2, "0")}
          </span>
          <span className={`mt-1 font-bold uppercase tracking-[0.2em] text-gold ${s.label}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
