"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { mobileNav, nav, site } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // close the slide-out on navigation, and lock body scroll while it is open
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink px-4 py-2 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
        {site.promo}{" "}
        <Link href="/shop" className="text-gold underline">
          Shop Now
        </Link>
      </div>

      <div className="bg-olive">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-[10px] py-1.5 md:px-4 md:py-3">
          <Link href="/" className="shrink-0">
            <Image
              src="/images/header-logo-n.png"
              alt="Marijuana Land"
              width={143}
              height={52}
              className="h-[52px] w-auto md:h-14"
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
            <form
              className="hidden items-stretch overflow-hidden rounded bg-white lg:flex"
              onSubmit={(e) => {
                e.preventDefault();
                router.push("/shop");
              }}
            >
              <input
                type="search"
                placeholder="What are you looking for?"
                aria-label="Search"
                className="w-52 px-3 py-2 text-sm text-ink outline-none placeholder:text-stone-warm/60"
              />
              <button
                type="submit"
                aria-label="Search"
                className="bg-ink px-3 text-white"
              >
                ⌕
              </button>
            </form>

            <Link
              href="/shop"
              aria-label="Cart"
              className="hidden text-cream sm:block"
            >
              <Image src="/images/cart-icon.png" alt="" width={30} height={30} />
            </Link>

            <button
              className="md:hidden"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Image
                src="/images/nav-line.svg"
                alt=""
                width={32}
                height={30}
                className="h-[30px] w-8"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-out: full-screen olive panel, matching the original site */}
      <div
        className={`fixed inset-0 z-50 bg-olive md:hidden ${
          open ? "flex" : "hidden"
        } flex-col`}
      >
        <div className="flex items-center justify-between px-[10px] py-4">
          <Link href="/" onClick={() => setOpen(false)}>
            <Image
              src="/images/header-logo-n.png"
              alt="Marijuana Land"
              width={124}
              height={45}
              className="h-[45px] w-auto"
            />
          </Link>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="p-1"
          >
            <Image
              src="/images/nav-close.svg"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-[10px]">
          <ul>
            {mobileNav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex h-[60px] items-center font-(family-name:--font-cabin) text-2xl text-cream-deep"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
