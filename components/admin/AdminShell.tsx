import Link from "next/link";
import { logout } from "@/app/admin/actions";

export type TabKey =
  | "dealTiles"
  | "deals"
  | "testimonials"
  | "notice"
  | "site"
  | "menuItems"
  | "faqs"
  | "gallery"
  | "messages"
  | "subscribers";

export const TAB_GROUPS: { title: string; tabs: { key: TabKey; label: string }[] }[] = [
  {
    title: "Homepage",
    tabs: [
      { key: "dealTiles", label: "Today at the Shop" },
      { key: "deals", label: "Deal cards" },
      { key: "testimonials", label: "Reviews" },
    ],
  },
  {
    title: "Site",
    tabs: [
      { key: "notice", label: "Hours notice" },
      { key: "site", label: "Promo & contact" },
      { key: "menuItems", label: "Shop menu" },
      { key: "faqs", label: "FAQ" },
      { key: "gallery", label: "Gallery" },
    ],
  },
  {
    title: "Inbox",
    tabs: [
      { key: "messages", label: "Messages" },
      { key: "subscribers", label: "Signups" },
    ],
  },
];

export const ALL_TABS: TabKey[] = TAB_GROUPS.flatMap((g) => g.tabs.map((t) => t.key));

export function isTab(v: string | undefined): v is TabKey {
  return Boolean(v) && (ALL_TABS as string[]).includes(v as string);
}

export default function AdminShell({
  tab,
  storeReady,
  unread,
  drafts,
  children,
}: {
  tab: TabKey;
  storeReady: boolean;
  unread: number;
  /** Sections with unpublished changes, for a dot on the tab. */
  drafts: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-beige pb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-brand text-olive">
            Site Admin
          </h1>
          <p className="mt-1 text-sm text-stone-warm">
            Preview first, then publish. Nothing changes on the live site until you press Publish.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="rounded border border-olive px-4 py-2 text-sm font-semibold text-olive transition hover:bg-olive hover:text-white"
          >
            View live site
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-warm"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {!storeReady && (
        <p className="mb-5 rounded border border-gold/50 bg-cream px-4 py-3 text-sm text-stone-warm">
          <strong className="font-bold text-olive">Storage not connected.</strong>{" "}
          You can browse the editor, but previewing, publishing, photo uploads,
          messages and signups need{" "}
          <code className="rounded bg-white px-1">SUPABASE_URL</code> and{" "}
          <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          set in the Vercel project. See ADMIN_SETUP.md.
        </p>
      )}

      <nav aria-label="Sections" className="mb-6 space-y-3">
        {TAB_GROUPS.map((g) => (
          <div key={g.title} className="flex flex-wrap items-center gap-2">
            <span className="w-full text-[11px] font-bold uppercase tracking-brand text-stone-warm/70 sm:w-20">
              {g.title}
            </span>
            {g.tabs.map((t) => {
              const active = t.key === tab;
              const badge =
                t.key === "messages" && unread > 0
                  ? unread
                  : drafts.includes(t.key)
                    ? "•"
                    : null;
              return (
                <Link
                  key={t.key}
                  href={`/admin?tab=${t.key}`}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? "bg-orange text-white" : "bg-cream text-ink hover:bg-beige"
                  }`}
                >
                  {t.label}
                  {badge !== null && (
                    <span
                      className={`ml-1.5 inline-block min-w-4 rounded-full px-1 text-center text-[11px] leading-4 ${
                        active ? "bg-white text-orange" : "bg-orange text-white"
                      }`}
                      title={t.key === "messages" ? "Unread messages" : "Unpublished changes"}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {children}
    </div>
  );
}
