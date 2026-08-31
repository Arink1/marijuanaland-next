import type { Metadata } from "next";
import MeadowMenu from "@/components/MeadowMenu";
import ShopMenu from "@/components/ShopMenu";
import { MEADOW_ENABLED } from "@/lib/site";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "Shop" };

export default async function Shop() {
  const { menuItems, site } = await getContent();
  return (
    <>
      <section className="bg-olive px-4 py-14 text-center">
        <h1 className="text-3xl font-medium uppercase tracking-brand text-cream">
          Shop
        </h1>
      </section>

      {MEADOW_ENABLED ? <MeadowMenu /> : <ShopMenu items={menuItems} site={site} />}
    </>
  );
}
