import type { Metadata } from "next";
import MeadowMenu from "@/components/MeadowMenu";
import ShopMenu from "@/components/ShopMenu";
import { MEADOW_ENABLED } from "@/lib/site";

export const metadata: Metadata = { title: "Shop" };

export default function Shop() {
  return (
    <>
      <section className="bg-olive px-4 py-14 text-center">
        <h1 className="text-3xl font-medium uppercase tracking-brand text-cream">
          Shop
        </h1>
      </section>

      {MEADOW_ENABLED ? <MeadowMenu /> : <ShopMenu />}
    </>
  );
}
