import Link from "next/link";
import { shortDate } from "@/lib/schedule";
import { TRAFFIC_RANGES, type TrafficSummary, type TrafficTop } from "@/lib/traffic";
import { btn, card } from "./ui";

const num = (n: number) => n.toLocaleString("en-US");

const RANGE_LABELS: Record<number, string> = {
  7: "Last 7 days",
  30: "Last 30 days",
  90: "Last 90 days",
};

/** "+24% vs the 30 days before" — or nothing when there is no history yet. */
function change(now: number, before: number) {
  if (before === 0) return now === 0 ? null : { text: "new", up: true };
  const pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return { text: "no change", up: true };
  return { text: `${pct > 0 ? "+" : ""}${pct}%`, up: pct > 0 };
}

function Stat({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: { text: string; up: boolean } | null;
}) {
  return (
    <div className="rounded border border-beige/70 bg-smoke p-4">
      <p className="text-[11px] font-bold uppercase tracking-brand text-stone-warm/80">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-olive">{value}</p>
      <p className="mt-0.5 text-xs text-stone-warm">
        {delta && (
          <span className={delta.up ? "font-semibold text-olive" : "font-semibold text-orange-dark"}>
            {delta.text}
          </span>
        )}
        {delta && hint ? " · " : ""}
        {hint}
      </p>
    </div>
  );
}

/** A day-by-day column chart. Dark part of each bar is visitors, light is repeat views. */
function DailyChart({ daily, days }: { daily: TrafficSummary["daily"]; days: number }) {
  const max = Math.max(1, ...daily.map((d) => d.views));
  const gap = days <= 14 ? "gap-1.5" : days <= 31 ? "gap-[2px]" : "gap-px";
  const every = days <= 14 ? 1 : days <= 31 ? 5 : 15;

  return (
    <div>
      <div className="flex items-baseline justify-between text-xs text-stone-warm">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-olive" />
            Visitors
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-olive/25" />
            Repeat views
          </span>
        </span>
        <span>Busiest day: {num(max)} views</span>
      </div>

      <div className={`mt-3 flex h-40 items-end ${gap}`} role="img" aria-label="Page views per day">
        {daily.map((d) => (
          <div
            key={d.day}
            className="flex h-full flex-1 flex-col justify-end"
            title={`${shortDate(d.day)}: ${num(d.views)} views, ${num(d.visitors)} visitors`}
          >
            <div
              className="relative w-full rounded-t-sm bg-olive/25"
              style={{ height: d.views ? `max(3px, ${(d.views / max) * 100}%)` : "0" }}
            >
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-sm bg-olive"
                style={{ height: d.views ? `${(d.visitors / d.views) * 100}%` : "0" }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-1.5 flex ${gap} text-[10px] text-stone-warm/80`}>
        {daily.map((d, i) => (
          <span key={d.day} className="flex-1 truncate text-center">
            {i % every === 0 || i === daily.length - 1 ? shortDate(d.day) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function HourChart({ hours }: { hours: TrafficSummary["hours"] }) {
  const max = Math.max(1, ...hours.map((h) => h.views));
  const label = (h: number) =>
    h === 0 ? "12am" : h === 12 ? "12pm" : h < 12 ? `${h}am` : `${h - 12}pm`;
  return (
    <div>
      <div className="flex h-24 items-end gap-1">
        {hours.map((h) => (
          <div
            key={h.hour}
            className="flex h-full flex-1 flex-col justify-end"
            title={`${label(h.hour)}: ${num(h.views)} views`}
          >
            <div
              className="w-full rounded-t-sm bg-gold"
              style={{ height: h.views ? `max(3px, ${(h.views / max) * 100}%)` : "0" }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1 text-[10px] text-stone-warm/80">
        {hours.map((h) => (
          <span key={h.hour} className="flex-1 text-center">
            {h.hour % 6 === 0 ? label(h.hour) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function TopTable({
  title,
  description,
  rows,
  unit = "visitors",
  empty = "Nothing yet.",
}: {
  title: string;
  description?: string;
  rows: TrafficTop[];
  /** Which number the bar is drawn from, and which column comes first. */
  unit?: "visitors" | "views";
  empty?: string;
}) {
  const pick = (r: TrafficTop) => (unit === "views" ? r.views : r.visitors);
  const max = Math.max(1, ...rows.map(pick));

  return (
    <section className="rounded border border-beige/70 bg-white p-4">
      <h3 className="text-sm font-bold uppercase tracking-brand text-olive">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-stone-warm">{description}</p>}

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-stone-warm/80">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {rows.map((r) => (
            <li key={r.label} className="relative overflow-hidden rounded bg-smoke">
              <span
                className="absolute inset-y-0 left-0 bg-olive/15"
                style={{ width: `${(pick(r) / max) * 100}%` }}
                aria-hidden
              />
              <span className="relative flex items-baseline justify-between gap-3 px-2.5 py-1.5 text-sm">
                <span className="truncate" title={r.label}>
                  {r.label}
                </span>
                <span className="shrink-0 tabular-nums text-stone-warm">
                  <strong className="font-semibold text-ink">{num(pick(r))}</strong>
                  <span className="ml-1 text-xs">
                    {unit === "views"
                      ? `view${r.views === 1 ? "" : "s"}`
                      : `visitor${r.visitors === 1 ? "" : "s"}`}
                  </span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RangePills({ days }: { days: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TRAFFIC_RANGES.map((n) => (
        <Link
          key={n}
          href={`/admin?tab=traffic&days=${n}`}
          aria-current={n === days ? "page" : undefined}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            n === days ? "bg-olive text-white" : "bg-cream text-ink hover:bg-beige"
          }`}
        >
          {RANGE_LABELS[n] ?? `${n} days`}
        </Link>
      ))}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className={card}>
      <h2 className="text-lg font-bold uppercase tracking-brand text-olive">Visitors</h2>
      <div className="mt-3 text-sm text-stone-warm">{children}</div>
    </section>
  );
}

export default function Traffic({
  summary,
  days,
  storeReady,
  notInstalled,
  error,
}: {
  summary: TrafficSummary | null;
  days: number;
  storeReady: boolean;
  /** The traffic tables and functions are not in the database yet. */
  notInstalled: boolean;
  error?: string;
}) {
  if (!storeReady) {
    return (
      <Panel>
        Visitor counts need the database. Set <code>SUPABASE_URL</code> and{" "}
        <code>SUPABASE_SERVICE_ROLE_KEY</code> in the Vercel project first; see
        ADMIN_SETUP.md.
      </Panel>
    );
  }

  if (notInstalled) {
    return (
      <Panel>
        <p>
          <strong className="font-bold text-olive">One setup step left.</strong> The
          visitor tables are not in the database yet.
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>Open the Supabase dashboard for this project and pick SQL Editor.</li>
          <li>
            Paste in everything from <code>supabase/schema.sql</code> and press Run.
            It is safe to run on a database that already has the other tables.
          </li>
          <li>Come back here and reload. Counting starts with the next visitor.</li>
        </ol>
      </Panel>
    );
  }

  if (error || !summary) {
    return (
      <Panel>
        Could not read the visitor counts just now. Wait a minute and reload the
        page. {error}
      </Panel>
    );
  }

  const {
    views,
    visitors,
    visits,
    bounces,
    prev,
    online,
    daily,
    hours,
    sources,
    pages,
    entries,
    places,
    devices,
    referrers,
    campaigns,
    latest,
  } = summary;

  const perVisit = visits > 0 ? views / visits : 0;
  const oneAndDone = visits > 0 ? Math.round((bounces / visits) * 100) : 0;
  const before = `vs the ${days} days before`;

  const when = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      timeZone: "America/Detroit",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="space-y-4">
      <section className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold uppercase tracking-brand text-olive">Visitors</h2>
            <p className="mt-1 text-sm text-stone-warm">
              {shortDate(summary.from_day)} to {shortDate(summary.to_day)}. Your own
              visits are left out while you are signed in here.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {online > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-olive">
                <span className="inline-block h-2 w-2 rounded-full bg-orange" aria-hidden />
                {num(online)} on the site now
              </span>
            )}
            <RangePills days={days} />
            {views > 0 && (
              <a href={`/admin/export?kind=traffic&days=${days}`} className={btn.secondary}>
                Download spreadsheet
              </a>
            )}
          </div>
        </div>

        {views === 0 ? (
          <p className="mt-6 rounded border border-dashed border-beige px-4 py-8 text-center text-sm text-stone-warm">
            No visits recorded in this window yet. Counting starts the moment
            someone opens the site, so check back after the next publish or ad.
          </p>
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="Visitors"
                value={num(visitors)}
                hint={before}
                delta={change(visitors, prev.visitors)}
              />
              <Stat
                label="Visits"
                value={num(visits)}
                hint="ends when the tab closes"
                delta={change(visits, prev.visits)}
              />
              <Stat
                label="Page views"
                value={num(views)}
                hint={before}
                delta={change(views, prev.views)}
              />
              <Stat
                label="Pages per visit"
                value={perVisit.toFixed(1)}
                hint={`${oneAndDone}% looked at one page only`}
              />
            </div>

            <div className="mt-6">
              <DailyChart daily={daily} days={days} />
            </div>
          </>
        )}
      </section>

      {views > 0 && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <TopTable
              title="Where visitors came from"
              description="Counted once per visit, so clicking around the site does not change it."
              rows={sources}
            />
            <TopTable
              title="Most visited pages"
              description="Every page view in the window."
              rows={pages}
              unit="views"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TopTable
              title="Where visitors are"
              description="From the network only, and often just the nearest city."
              rows={places}
            />
            <div className="space-y-4">
              <TopTable title="Phone or computer" rows={devices} />
              <TopTable
                title="First page they landed on"
                rows={entries}
                unit="views"
                empty="No landing pages recorded yet."
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TopTable
              title="Sites linking to you"
              description="The exact site a visit arrived from."
              rows={referrers}
              empty="No links in from other sites yet. Everyone typed the address, used a bookmark or came from an app."
            />
            <TopTable
              title="Campaign tags"
              description="Add ?utm_source=facebook&utm_campaign=fall-deal to a link to see it here."
              rows={campaigns}
              empty="No tagged links used yet."
            />
          </div>

          <section className={card}>
            <h3 className="text-sm font-bold uppercase tracking-brand text-olive">
              Busiest times of day
            </h3>
            <p className="mt-0.5 mb-3 text-xs text-stone-warm">
              Michigan time, across the whole window. Handy for picking when to post a deal.
            </p>
            <HourChart hours={hours} />
          </section>

          {latest.length > 0 && (
            <section className={card}>
              <h3 className="text-sm font-bold uppercase tracking-brand text-olive">
                Latest page views
              </h3>
              <p className="mt-0.5 text-xs text-stone-warm">
                The last {latest.length}, newest first.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-beige text-left text-xs uppercase tracking-brand text-stone-warm">
                      <th className="py-2 pr-4">When</th>
                      <th className="py-2 pr-4">Page</th>
                      <th className="py-2 pr-4">Came from</th>
                      <th className="py-2 pr-4">Where</th>
                      <th className="py-2">Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.map((r, i) => (
                      <tr key={`${r.at}-${i}`} className="border-b border-beige/50">
                        <td className="py-2 pr-4 whitespace-nowrap text-stone-warm">{when(r.at)}</td>
                        <td className="py-2 pr-4 font-semibold">{r.path}</td>
                        <td className="py-2 pr-4">{r.source}</td>
                        <td className="py-2 pr-4 text-stone-warm">{r.place}</td>
                        <td className="py-2 text-stone-warm">{r.device}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
