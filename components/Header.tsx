"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { nav, site } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink px-4 py-2 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
        {site.promo}{" "}
        <Link href="/shop" className="text-gold underline">
          Shop Now
        </Link>
      </div>
      <div className="bg-olive">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/header-logo-n.png"
              alt="Marijuana Land"
              width={140}
              height={64}
              className="h-12 w-auto sm:h-14"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-4 py-1.5 font-(family-name:--font-josefin) font-semibold transition ${
                  pathname === item.href
                    ? "bg-cream-deep text-ink"
                    : "text-cream hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              aria-label="Cart"
              className="hidden text-cream sm:block"
            >
              <Image
                src="/images/cart-icon.png"
                alt=""
                width={30}
                height={30}
              />
            </Link>
            <button
              className="md:hidden"
              aria-label="Menu"
              onClick={() => setOpen(!open)}
            >
              <div className="space-y-1.5">
                <span className="block h-0.5 w-6 bg-cream" />
                <span className="block h-0.5 w-6 bg-cream" />
                <span className="block h-0.5 w-6 bg-cream" />
              </div>
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-white/10 px-4 pb-4 md:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 font-(family-name:--font-josefin) font-semibold text-cream"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
