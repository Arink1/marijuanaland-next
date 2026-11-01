import { Fragment } from "react";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { getAdminContent, type ContentKey } from "@/lib/content";
import { isEmailConfigured } from "@/lib/email";
import { getMessages, getSubscribers } from "@/lib/inbox";
import { isPreLaunch } from "@/lib/launch";
import { menuCategories } from "@/lib/site";
import { isStoreConfigured } from "@/lib/supabase";
import {
  getTrafficSummary,
  trafficRange,
  TrafficNotInstalled,
} from "@/lib/traffic";
import AdminShell, { isTab } from "@/components/admin/AdminShell";
import DealCardsEditor from "@/components/admin/DealCardsEditor";
import GalleryEditor from "@/components/admin/GalleryEditor";
import { MessagesInbox, SubscribersList } from "@/components/admin/Inbox";
import LaunchEditor from "@/components/admin/LaunchEditor";
import NoticeEditor from "@/components/admin/NoticeEditor";
import SectionEditor, { type FieldSpec } from "@/components/admin/SectionEditor";
import Traffic from "@/components/admin/Traffic";

// Always reflect the latest saved content for the owner.
export const dynamic = "force-dynamic";

const SCHEDULE_FIELDS: FieldSpec[] = [
  { name: "start", label: "Show from", type: "date", width: "sm", hint: "Blank = right away" },
  { name: "end", label: "Show until", type: "date", width: "sm", hint: "Blank = until you remove it" },
];

const TILE_FIELDS: FieldSpec[] = [
  { name: "category", label: "Category", width: "sm", hint: "e.g. FLOWER" },
  { name: "figure", label: "Deal", width: "xs", hint: "e.g. 20% or 2/$30" },
  { name: "caption", label: "What it's on", width: "sm", hint: "e.g. OFF OUNCES" },
  { name: "staticLabel", label: "Full label", width: "md", hint: "Shown when animations are off" },
  { name: "href", label: "Link", width: "sm", options: ["/shop", "/contact", "/faq", "/gallery", "/about-us"] },
  { name: "tone", label: "Colour", width: "xs", options: ["green", "accent"] },
  { name: "mark", label: "Icon", width: "xs", options: ["circle", "bars", "bar", "diamond", "dots", "pill"] },
  ...SCHEDULE_FIELDS,
];

const MENU_FIELDS: FieldSpec[] = [
  { name: "image", label: "Photo", type: "image" },
  { name: "name", label: "Product", width: "md" },
  { name: "category", label: "Category", width: "sm", options: menuCategories },
  { name: "strain", label: "Type", width: "xs", options: ["Indica", "Sativa", "Hybrid", "CBD"] },
  { name: "thc", label: "THC", width: "xs" },
  { name: "size", label: "Size", width: "xs" },
  { name: "price", label: "Price", width: "xs" },
];

const FAQ_FIELDS: FieldSpec[] = [
  { name: "q", label: "Question", width: "lg" },
  { name: "a", label: "Answer", width: "lg", multiline: true },
];

const TESTIMONIAL_FIELDS: FieldSpec[] = [
  { name: "quote", label: "What they said", width: "lg", multiline: true },
  { name: "author", label: "Name", width: "sm", hint: "e.g. Jamie S." },
  { name: "rating", label: "Stars", type: "rating" },
  { name: "show", label: "Show on site", type: "toggle" },
];

const SITE_FIELDS: FieldSpec[] = [
  { name: "promo", label: "Promo bar text", width: "lg" },
  { name: "phone", label: "Phone (as shown)", width: "sm" },
  { name: "phoneHref", label: "Phone (for tap-to-call)", width: "sm", hint: "tel:+1…" },
  { name: "email", label: "Email", width: "sm" },
  { name: "address", label: "Address", width: "lg" },
  { name: "hours", label: "Hours (short)", width: "md", hint: "Header, footer and shop page" },
  { name: "hoursDetail", label: "Hours (contact page)", width: "lg", type: "lines", hint: "One line per day range" },
  { name: "instagramHandle", label: "Instagram handle", width: "sm" },
  { name: "licenses", label: "Footer licence line", width: "lg" },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; undone?: string; v?: string; days?: string }>;
}) {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const params = await searchParams;
  const tab = isTab(params.tab) ? params.tab : "dealTiles";
  const flash = params.undone ? "Restored the previous version to the live site." : undefined;

  const settle = <T,>(p: Promise<T[]>) =>
    p.then(
      (rows) => ({ rows, error: undefined as string | undefined }),
      (e: unknown) => ({
        rows: [] as T[],
        error: e instanceof Error ? e.message : "Database request failed.",
      }),
    );
  // Visitor counts are one database call, so only make it on their own tab.
  const days = trafficRange(params.days);
  const [content, inbox, signups, traffic] = await Promise.all([
    getAdminContent(),
    settle(getMessages()),
    settle(getSubscribers()),
    tab === "traffic"
      ? getTrafficSummary(days).then(
          (summary) => ({ summary, notInstalled: false, error: undefined as string | undefined }),
          (e: unknown) => ({
            summary: null,
            notInstalled: e instanceof TrafficNotInstalled,
            error:
              e instanceof TrafficNotInstalled
                ? undefined
                : e instanceof Error
                  ? e.message
                  : "Database request failed.",
          }),
        )
      : Promise.resolve(null),
  ]);
  const { live, drafts, meta } = content;
  const messages = inbox.rows;
  const subscribers = signups.rows;
  const dbError = content.error ?? inbox.error ?? signups.error;
  // A failed content read shows repo defaults; never let the owner publish
  // those over their real content. Inbox failures only lock the inbox tabs.
  const storeReady = isStoreConfigured() && !content.error;
  const inboxReady = isStoreConfigured() && !inbox.error;
  const signupsReady = isStoreConfigured() && !signups.error;
  const unread = messages.filter((m) => !m.read).length;
  const draftKeys = Object.keys(drafts);

  const pick = <K extends ContentKey>(k: K) => ({
    initial: drafts[k] ?? live[k],
    live: live[k],
    meta: meta[k],
    storeReady,
    flash,
  });

  let body: React.ReactNode;
  switch (tab) {
    case "dealTiles":
      body = (
        <SectionEditor
          section="dealTiles"
          title="Today at the Shop"
          description="The flip tiles on the homepage. Give a tile dates and it appears and disappears on its own."
          fields={TILE_FIELDS}
          previewPath="/"
          rowLabel="tile"
          schedulable
          {...pick("dealTiles")}
        />
      );
      break;
    case "deals":
      body = <DealCardsEditor {...pick("deals")} />;
      break;
    case "launch":
      body = <LaunchEditor {...pick("launch")} site={live.site} />;
      break;
    case "testimonials":
      body = (
        <SectionEditor
          section="testimonials"
          title="Customer reviews"
          description="Shown in the “What people are saying” slider on the homepage. Untick “Show on site” to hide one without deleting it."
          fields={TESTIMONIAL_FIELDS}
          previewPath="/"
          rowLabel="review"
          {...pick("testimonials")}
        />
      );
      break;
    case "notice":
      body = <NoticeEditor {...pick("notice")} />;
      break;
    case "site":
      body = (
        <SectionEditor
          section="site"
          title="Promo bar & contact details"
          description="Shown in the header banner, footer and contact page."
          fields={SITE_FIELDS}
          previewPath="/contact"
          rowLabel="detail"
          singleObject
          {...pick("site")}
        />
      );
      break;
    case "menuItems":
      body = (
        <SectionEditor
          section="menuItems"
          title="Shop menu"
          description="Sample products on the Shop page. These show as a preview, not live inventory."
          fields={MENU_FIELDS}
          previewPath="/shop"
          rowLabel="product"
          {...pick("menuItems")}
        />
      );
      break;
    case "faqs":
      body = (
        <SectionEditor
          section="faqs"
          title="FAQ"
          description="Shown on the FAQ page; the first five also appear on the homepage."
          fields={FAQ_FIELDS}
          previewPath="/faq"
          rowLabel="question"
          {...pick("faqs")}
        />
      );
      break;
    case "gallery":
      body = <GalleryEditor {...pick("gallery")} />;
      break;
    case "messages":
      body = (
        <MessagesInbox
          messages={messages}
          storeReady={inboxReady}
          emailReady={isEmailConfigured()}
        />
      );
      break;
    case "subscribers":
      body = <SubscribersList subscribers={subscribers} storeReady={signupsReady} />;
      break;
    case "traffic":
      body = (
        <Traffic
          summary={traffic?.summary ?? null}
          days={days}
          storeReady={isStoreConfigured()}
          notInstalled={traffic?.notInstalled ?? false}
          error={traffic?.error}
        />
      );
      break;
  }

  return (
    <AdminShell
      tab={tab}
      storeReady={isStoreConfigured()}
      dbError={dbError}
      unread={unread}
      drafts={draftKeys}
      preLaunch={isPreLaunch(live.launch)}
    >
      {/* Editors read their initial values once. Remount them when the tab, the
          database state or the data underneath (Undo, Throw away) changes, so
          stale values can't be published. */}
      <Fragment key={`${tab}|${storeReady}|${params.v ?? ""}`}>{body}</Fragment>
    </AdminShell>
  );
}
