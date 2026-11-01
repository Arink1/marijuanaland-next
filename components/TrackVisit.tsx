"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Counts one page view, for the Traffic tab in /admin.
 *
 * Where the visit came from is read once, on the first page of the tab, and
 * carried on every later page of the same visit, so someone who arrives from
 * Facebook and then clicks through three pages counts as one Facebook visitor
 * rather than one Facebook view and three direct ones.
 *
 * Nothing is kept on the visitor's device except a random id that the browser
 * forgets when the tab closes. There is no cookie, so there is nothing to ask
 * consent for; a browser with storage switched off is still counted.
 */
const SID_KEY = "ml-sid";
const SRC_KEY = "ml-src";

type Origin = {
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

const EMPTY: Origin = { referrer: "", utmSource: "", utmMedium: "", utmCampaign: "" };

// Module scope, so it survives moving between pages without a reload.
let lastPath = "";
let lastAt = 0;
let sentOnce = false;
let cachedOrigin: Origin | null = null;

function sessionStore(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function randomId(): string {
  try {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

function readOrigin(): Origin {
  const q = new URLSearchParams(window.location.search);
  const first = (...names: string[]) => {
    for (const n of names) {
      const v = q.get(n);
      if (v) return v.slice(0, 80);
    }
    return "";
  };
  return {
    referrer: document.referrer || "",
    utmSource: first("utm_source", "ref", "src"),
    utmMedium: first("utm_medium"),
    utmCampaign: first("utm_campaign"),
  };
}

export default function TrackVisit() {
  const pathname = usePathname();

  useEffect(() => {
    // React runs effects twice in development; a real second view of the same
    // page is seconds away at the earliest.
    const now = Date.now();
    if (pathname === lastPath && now - lastAt < 1500) return;
    lastPath = pathname;
    lastAt = now;

    const store = sessionStore();
    let session = "";
    let entry = false;
    if (store) {
      session = store.getItem(SID_KEY) ?? "";
      if (!session) {
        session = randomId();
        entry = true;
        try {
          store.setItem(SID_KEY, session);
        } catch {}
      }
    } else {
      entry = !sentOnce;
    }
    sentOnce = true;

    let origin = EMPTY;
    if (entry) {
      origin = readOrigin();
      cachedOrigin = origin;
      try {
        store?.setItem(SRC_KEY, JSON.stringify(origin));
      } catch {}
    } else {
      try {
        const saved = store?.getItem(SRC_KEY);
        origin = saved
          ? { ...EMPTY, ...(JSON.parse(saved) as Partial<Origin>) }
          : (cachedOrigin ?? EMPTY);
      } catch {
        origin = cachedOrigin ?? EMPTY;
      }
    }

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, session, entry, ...origin }),
      keepalive: true,
      cache: "no-store",
    }).catch(() => {});
  }, [pathname]);

  return null;
}
