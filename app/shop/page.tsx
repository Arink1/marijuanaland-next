import type { Metadata } from "next";
import Link from "next/link";
import MeadowMenu from "@/components/MeadowMenu";
import { MEADOW_ENABLED, site } from "@/lib/site";

export const metadata: Metadata = { title: "Shop" };

export default function Shop() {
  return (
    <>
      <section className="bg-olive px-4 py-14 text-center">
        <h1 className="text-3xl font-medium uppercase tracking-brand text-cream">
          Shop
        </h1>
      </section>

      {MEADOW_ENABLED ? (
        <MeadowMenu />
      ) : (
        <section className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h2 className="text-2xl font-bold uppercase tracking-brand text-olive">
            Online menu coming soon
          </h2>
          <p className="mt-5 leading-relaxed text-stone-warm">
            Our online ordering menu is being refreshed. In the meantime, visit
            us in-store or give us a call — our budtenders are happy to help
            you find exactly what you&apos;re looking for.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={site.phoneHref}
              className="rounded bg-orange px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark"
            >
              Call {site.phone}
            </a>
            <Link
              href="/contact"
              className="rounded border border-olive px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-olive transition hover:bg-olive hover:text-white"
            >
              Contact Us
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
