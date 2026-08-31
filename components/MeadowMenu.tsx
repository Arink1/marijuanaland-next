"use client";

import { useEffect, useRef } from "react";
import { MEADOW_ORG_ID } from "@/lib/site";

// Embeds the Meadow online-ordering menu the original site used.
// Rendered only when MEADOW_ENABLED is true in lib/site.ts.
export default function MeadowMenu() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const script = document.createElement("script");
    script.src = "https://embed.getmeadow.com/assets/embed.js";
    script.dataset.organizationId = MEADOW_ORG_ID;
    el.appendChild(script);
    return () => {
      el.innerHTML = "";
    };
  }, []);

  return <div ref={ref} className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8" />;
}
