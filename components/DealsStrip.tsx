import Link from "next/link";
import { type MarkKind } from "@/lib/site";
import type { DealTile } from "@/lib/site";

// CSS-only category marks — deliberately generic, no brand iconography.
function Mark({ kind }: { kind: MarkKind }) {
  switch (kind) {
    case "circle":
      return <span className="deals-mark h-10 w-10 rounded-full border-[3px]" />;
    case "bars":
      return (
        <span className="flex flex-col items-start gap-[5px]">
          <span className="deals-mark-fill h-[7px] w-10 rounded" />
          <span className="deals-mark-fill h-[7px] w-10 rounded" />
          <span className="deals-mark-fill h-[7px] w-[27px] rounded" />
        </span>
      );
    case "bar":
      return <span className="deals-mark-fill h-10 w-[15px] rounded-lg" />;
    case "diamond":
      return <span className="deals-mark-fill h-9 w-9 rotate-45 rounded-[5px]" />;
    case "dots":
      return (
        <span className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="deals-mark-fill h-[15px] w-[15px] rounded-full" />
          ))}
        </span>
      );
    case "pill":
      return <span className="deals-mark h-[26px] w-10 rounded-[20px] border-[3px]" />;
  }
}

export default function DealsStrip({ tiles }: { tiles: DealTile[] }) {
  return (
    <section className="deals-band relative font-(family-name:--font-archivo)">
      <h2 className="deals-eyebrow">Today at the Shop</h2>
      <p className="deals-subhead">
        <span className="deals-subhead-desktop">
          In-store &amp; online &middot; while supplies last
        </span>
        <span className="deals-subhead-mobile">
          Swipe for today&apos;s deals
        </span>
      </p>
      <div className="deals-row">
        {tiles.map((t, i) => (
          <Link
            key={t.category}
            href={t.href}
            className="deals-tile"
            aria-label={`${t.category}: ${t.staticLabel}`}
          >
            <span
              className="deals-flipper"
              style={{ animationDelay: `${i * 0.7}s` }}
            >
              <span className="deals-face deals-face-front">
                <Mark kind={t.mark} />
                <span className="deals-category">{t.category}</span>
                <span className="deals-static">{t.staticLabel}</span>
              </span>
              <span
                className={`deals-face deals-face-back ${
                  t.tone === "green" ? "deals-back-green" : "deals-back-accent"
                }`}
                aria-hidden
              >
                <span
                  className={`deals-figure ${
                    t.figure.length > 3 ? "deals-figure-wide" : ""
                  }`}
                >
                  {t.figure}
                </span>
                <span className="deals-caption">{t.caption}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
      <div className="deals-divider" aria-hidden />
    </section>
  );
}
