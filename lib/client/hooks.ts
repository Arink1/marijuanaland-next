"use client";

import { useSyncExternalStore } from "react";

/**
 * The current time, refreshed every `everyMs`. Null on the server and during
 * hydration so server and client markup match; a number straight after.
 */
export function useNow(everyMs: number): number | null {
  return useSyncExternalStore(
    (onChange) => {
      const id = setInterval(onChange, everyMs);
      return () => clearInterval(id);
    },
    // Rounded to the tick so the snapshot is stable between renders.
    () => Math.floor(Date.now() / everyMs) * everyMs,
    () => null,
  );
}

/** Whether a CSS media query matches. False on the server. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
