"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/admin/actions";
import type { SiteContent } from "@/lib/content";
import SectionEditor, { type FieldSpec } from "./SectionEditor";

const TABS = [
  { key: "dealTiles", label: "Today at the Shop" },
  { key: "deals", label: "Deal Cards" },
  { key: "site", label: "Promo & Contact" },
  { key: "menuItems", label: "Shop Menu" },
  { key: "faqs", label: "FAQ" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TILE_FIELDS: FieldSpec[] = [
  { name: "category", label: "Category", width: "sm" },
  { name: "figure", label: "Deal figure", width: "xs", hint: "e.g. 20%" },
  { name: "caption", label: "Caption", width: "sm" },
  { name: "staticLabel", label: "Full label", width: "md", hint: "Shown when motion is reduced" },
  { name: "href", label: "Link", width: "sm" },
  {
    name: "tone",
    label: "Colour",
    width: "xs",
    options: ["green", "accent"],
  },
  {
    name: "mark",
    label: "Icon",
    width: "xs",
    options: ["circle", "bars", "bar", "diamond", "dots", "pill"],
  },
];

const DEAL_FIELDS: FieldSpec[] = [
  { name: "title", label: "Title", width: "sm" },
  { name: "text", label: "Text", width: "md" },
  { name: "image", label: "Image path", width: "md" },
];

const MENU_FIELDS: FieldSpec[] = [
  { name: "name", label: "Product", width: "md" },
  { name: "category", label: "Category", width: "sm" },
  {
    name: "strain",
    label: "Type",
    width: "xs",
    options: ["Indica", "Sativa", "Hybrid", "CBD"],
  },
  { name: "thc", label: "THC", width: "xs" },
  { name: "size", label: "Size", width: "xs" },
  { name: "price", label: "Price", width: "xs" },
  { name: "image", label: "Image path", width: "md" },
];

const FAQ_FIELDS: FieldSpec[] = [
  { name: "q", label: "Question", width: "md" },
  { name: "a", label: "Answer", width: "lg", multiline: true },
];

const SITE_FIELDS: FieldSpec[] = [
  { name: "promo", label: "Promo bar text", width: "lg" },
  { name: "phone", label: "Phone (display)", width: "sm" },
  { name: "phoneHref", label: "Phone (link)", width: "sm", hint: "tel:+1…" },
  { name: "email", label: "Email", width: "sm" },
  { name: "address", label: "Address", width: "lg" },
  { name: "hours", label: "Hours (short)", width: "md" },
  { name: "instagramHandle", label: "Instagram handle", width: "sm" },
  { name: "licenses", label: "Footer licence line", width: "lg" },
];

export default function AdminDashboard({
  content,
  storeReady,
}: {
  content: SiteContent;
  storeReady: boolean;
}) {
  const [tab, setTab] = useState<TabKey>("dealTiles");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-beige pb-4">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-brand text-olive">
            Site Admin
          </h1>
          <p className="mt-1 text-sm text-stone-warm">
            Changes go live as soon as you save.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="rounded border border-olive px-4 py-2 text-sm font-semibold text-olive transition hover:bg-olive hover:text-white"
          >
            View site
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
        <p className="mb-6 rounded border border-gold/50 bg-cream px-4 py-3 text-sm text-stone-warm">
          <strong className="font-bold text-olive">Storage not connected.</strong>{" "}
          You can browse the editor, but saving needs{" "}
          <code className="rounded bg-white px-1">SUPABASE_URL</code> and{" "}
          <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          set in the Vercel project.
        </p>
      )}

      <nav className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === t.key
                ? "bg-orange text-white"
                : "bg-cream text-ink hover:bg-beige"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "dealTiles" && (
        <SectionEditor
          section="dealTiles"
          title="Today at the Shop"
          description="The six flip tiles on the homepage. Keep figures short so they fit the tile."
          fields={TILE_FIELDS}
          rows={content.dealTiles}
          rowLabel="tile"
        />
      )}
      {tab === "deals" && (
        <SectionEditor
          section="deals"
          title="Homepage deal cards"
          description="The five photo cards under the hero. Order here matches the layout slots."
          fields={DEAL_FIELDS}
          rows={content.deals}
          rowLabel="card"
          fixedLength
        />
      )}
      {tab === "site" && (
        <SectionEditor
          section="site"
          title="Promo bar & contact details"
          description="Shown in the header banner, footer and contact page."
          fields={SITE_FIELDS}
          rows={content.site as unknown as Record<string, string>}
          rowLabel="detail"
          singleObject
        />
      )}
      {tab === "menuItems" && (
        <SectionEditor
          section="menuItems"
          title="Shop menu"
          description="Sample products on /shop. Remember these show as a preview, not live inventory."
          fields={MENU_FIELDS}
          rows={content.menuItems}
          rowLabel="product"
        />
      )}
      {tab === "faqs" && (
        <SectionEditor
          section="faqs"
          title="FAQ"
          description="Shown on the FAQ page and the homepage preview."
          fields={FAQ_FIELDS}
          rows={content.faqs}
          rowLabel="question"
        />
      )}
    </div>
  );
}
