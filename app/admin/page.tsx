import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { getAdminContent, type ContentKey } from "@/lib/content";
import { isEmailConfigured } from "@/lib/email";
import { getMessages, getSubscribers } from "@/lib/inbox";
import { menuCategories } from "@/lib/site";
import { isStoreConfigured } from "@/lib/supabase";
import AdminShell, { isTab } from "@/components/admin/AdminShell";
import GalleryEditor from "@/components/admin/GalleryEditor";
import { MessagesInbox, SubscribersList } from "@/components/admin/Inbox";
import NoticeEditor from "@/components/admin/NoticeEditor";
import SectionEditor, { type FieldSpec } from "@/components/admin/SectionEditor";

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

const DEAL_FIELDS: FieldSpec[] = [
  { name: "image", label: "Photo", type: "image" },
  { name: "title", label: "Title", width: "sm" },
  { name: "text", label: "Text", width: "md" },
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
  { name: "hours", label: "Hours (short)", width: "md" },
  { name: "instagramHandle", label: "Instagram handle", width: "sm" },
  { name: "licenses", label: "Footer licence line", width: "lg" },
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; undone?: string }>;
}) {
  if (!(await isLoggedIn())) redirect("/admin/login");

  const params = await searchParams;
  const tab = isTab(params.tab) ? params.tab : "dealTiles";
  const flash = params.undone ? "Restored the previous version to the live site." : undefined;

  const storeReady = isStoreConfigured();
  const [{ live, drafts, meta }, messages, subscribers] = await Promise.all([
    getAdminContent(),
    getMessages(),
    getSubscribers(),
  ]);
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
      body = (
        <SectionEditor
          section="deals"
          title="Homepage deal cards"
          description="The photo cards under the hero. The first five cards that are live today are shown, in this order. Add dates to a card to schedule a sale."
          fields={DEAL_FIELDS}
          previewPath="/"
          rowLabel="card"
          schedulable
          {...pick("deals")}
        />
      );
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
          storeReady={storeReady}
          emailReady={isEmailConfigured()}
        />
      );
      break;
    case "subscribers":
      body = <SubscribersList subscribers={subscribers} storeReady={storeReady} />;
      break;
  }

  return (
    <AdminShell tab={tab} storeReady={storeReady} unread={unread} drafts={draftKeys}>
      {body}
    </AdminShell>
  );
}
