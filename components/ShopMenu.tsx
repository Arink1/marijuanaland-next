"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { menuCategories } from "@/lib/site";
import type { MenuItem } from "@/lib/site";
import type { SiteInfo } from "@/lib/content";
import CategoryIcon from "@/components/fx/CategoryIcon";
import CategoryIconPlay from "@/components/fx/CategoryIconPlay";

const ALL = "All";

export default function ShopMenu({
  items,
  site,
}: {
  items: MenuItem[];
  site: SiteInfo;
}) {
  const [active, setActive] = useState(ALL);
  const shown =
    active === ALL
      ? items
      : items.filter((i) => i.category === active);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:py-14">
      {/* Sample-menu notice — this is a preview, not live inventory */}
      <div className="mx-auto mb-8 max-w-3xl rounded-lg border border-gold/40 bg-cream px-5 py-4 text-center">
        <p className="font-(family-name:--font-cabin) text-sm font-bold uppercase tracking-brand text-olive">
          Sample menu &middot; preview only
        </p>
        <p className="mt-1.5 text-sm text-stone-warm">
          Online ordering is coming soon. Products, potency and pricing below
          are examples — call or stop in for today&apos;s real selection.
        </p>
      </div>

      {/* Category filter */}
      <CategoryIconPlay className="-mx-4 mb-8 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-max gap-2 lg:w-auto lg:flex-wrap lg:justify-center">
          {[ALL, ...menuCategories].map((c) => (
            <li key={c}>
              <button
                onClick={() => setActive(c)}
                aria-pressed={active === c}
                className={`mlCatHost inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-(family-name:--font-josefin) text-sm font-bold whitespace-nowrap transition ${
                  active === c
                    ? "mlCatOnOrange bg-orange text-white"
                    : "bg-cream text-ink hover:bg-beige"
                }`}
              >
                {c !== ALL && <CategoryIcon category={c} size={18} />}
                {c}
              </button>
            </li>
          ))}
        </ul>
      </CategoryIconPlay>

      {/* Product grid */}
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {shown.map((item) => (
          <li
            key={item.name}
            className="group overflow-hidden rounded-lg border border-beige bg-white transition hover:shadow-lg"
          >
            <div className="relative aspect-square overflow-hidden bg-cream">
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute left-2 top-2 rounded bg-olive/90 px-2 py-1 text-[10px] font-bold uppercase tracking-brand text-cream">
                {item.strain}
              </span>
            </div>

            <div className="p-3 lg:p-4">
              <p className="text-[11px] font-bold uppercase tracking-brand text-stone-warm">
                {item.category}
              </p>
              <h3 className="mt-1 font-(family-name:--font-cabin) text-base font-bold leading-tight text-ink lg:text-lg">
                {item.name}
              </h3>
              <p className="mt-1 text-xs text-stone-warm">
                THC {item.thc} &middot; {item.size}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="font-(family-name:--font-cabin) text-lg font-bold text-olive">
                  {item.price}
                </span>
                <a
                  href={site.phoneHref}
                  className="rounded bg-orange px-3 py-1.5 font-(family-name:--font-josefin) text-xs font-bold text-white transition hover:bg-orange-dark"
                >
                  Ask in store
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Closing CTA */}
      <div className="mt-12 rounded-lg bg-olive px-6 py-10 text-center">
        <h2 className="text-2xl font-medium uppercase tracking-brand text-gold">
          Want today&apos;s full menu?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-cream">
          Our budtenders keep the freshest drops behind the counter. Give us a
          call or visit us in Germfask — {site.hours}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <a
            href={site.phoneHref}
            className="rounded bg-orange px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark"
          >
            Call {site.phone}
          </a>
          <Link
            href="/contact"
            className="rounded border border-cream px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-cream transition hover:bg-white/10"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
