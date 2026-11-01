"use client";

import { useState, type ReactNode } from "react";

/** Preview helper: remounts its children so CSS intros (SunburstMark mode="intro") play again. */
export default function SunburstReplay({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [run, setRun] = useState(0);

  return (
    <div className={["relative", className].filter(Boolean).join(" ")}>
      <div key={run} className="contents">
        {children}
      </div>
      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="absolute right-3 top-3 z-10 rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold uppercase tracking-brand text-white transition hover:bg-black/75"
      >
        Replay
      </button>
    </div>
  );
}
