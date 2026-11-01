import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CategoryIcon from "@/components/fx/CategoryIcon";
import CategoryIconPlay from "@/components/fx/CategoryIconPlay";
import { categories, menuCategories } from "@/lib/site";
import HeroSmoke from "@/components/fx/HeroSmoke";
import SunburstMark from "@/components/fx/SunburstMark";
import SunburstReplay from "@/components/fx/SunburstReplay";

// Local-only preview of the five brand animations. Not linked anywhere, and a
// production build returns 404 so it never ships to visitors.
export const metadata: Metadata = {
  title: "Animation lab",
  robots: { index: false, follow: false },
};

export default function FxLab() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="min-h-svh bg-smoke pb-24">
      <header className="sticky top-0 z-50 border-b border-beige bg-cream/95 px-4 py-3">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold">
          <span className="font-bold uppercase tracking-brand text-olive">Animation lab</span>
          <a href="#category" className="hover:text-orange">1 Icons</a>
          <a href="#smoke" className="hover:text-orange">2 Smoke</a>
          <a href="#sunburst" className="hover:text-orange">3 Sunburst</a>
          <Link href="/" className="ml-auto text-orange hover:underline">Homepage</Link>
          <Link href="/shop" className="text-orange hover:underline">Shop</Link>
        </nav>
      </header>

        <div id="category" className="scroll-mt-16">
          <h2 className="mx-auto max-w-7xl px-4 pb-3 pt-10 font-(family-name:--font-cabin) text-xl font-bold uppercase tracking-brand text-olive">
            1. Category icons (homepage strip + shop pills)
          </h2>
          <section className="space-y-10 bg-smoke py-10">
            {/* Homepage category strip, same markup as the integration */}
            <div>
              <p className="mx-auto mb-2 max-w-5xl px-4 text-xs font-bold uppercase tracking-brand text-stone-warm">
                Homepage category strip &middot; hover or Tab to a category to animate it (phones: plays once on scroll, tap to replay)
              </p>
              <nav className="border-y border-beige bg-cream">
                <CategoryIconPlay>
                  <ul className="mx-auto flex h-12 max-w-5xl items-center gap-x-7 overflow-x-auto whitespace-nowrap px-4 [scrollbar-width:none] lg:h-auto lg:flex-wrap lg:justify-center lg:gap-x-8 lg:overflow-visible lg:py-4 [&::-webkit-scrollbar]:hidden">
                    {categories.map((c, idx) => (
                      <li key={c} className="shrink-0">
                        <Link
                          href="/shop"
                          className={`mlCatHost inline-flex items-center gap-1.5 align-top font-(family-name:--font-inter) text-sm font-medium ${
                            idx === 0 ? "border-b-2 border-orange text-orange" : "text-ink hover:text-orange"
                          }`}
                        >
                          <CategoryIcon category={c} />
                          {c}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CategoryIconPlay>
              </nav>
            </div>
          
            {/* Shop filter pills ("Flower" shown as the active pill) */}
            <div className="mx-auto max-w-7xl px-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-brand text-stone-warm">
                Shop filter pills &middot; hover, Tab or tap a pill
              </p>
              <CategoryIconPlay className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <ul className="flex w-max gap-2 lg:w-auto lg:flex-wrap lg:justify-center">
                  {["All", ...menuCategories].map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        aria-pressed={c === "Flower"}
                        className={`mlCatHost inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-(family-name:--font-josefin) text-sm font-bold whitespace-nowrap transition ${
                          c === "Flower" ? "mlCatOnOrange bg-orange text-white" : "bg-cream text-ink hover:bg-beige"
                        }`}
                      >
                        {c !== "All" && <CategoryIcon category={c} size={18} />}
                        {c}
                      </button>
                    </li>
                  ))}
                </ul>
              </CategoryIconPlay>
            </div>
          
            {/* Review rows: every icon loops (demo prop), no hover needed */}
            <div className="mx-auto max-w-7xl space-y-3 px-4">
              <p className="text-xs font-bold uppercase tracking-brand text-stone-warm">
                Review rows &middot; all seven motions looping so they can be judged without hovering
              </p>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-3 rounded-lg border border-beige bg-cream px-5 py-4 font-(family-name:--font-inter) text-sm font-medium text-ink">
                {["Deals", ...menuCategories].map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5">
                    <CategoryIcon category={c} demo />
                    {c}
                  </span>
                ))}
              </div>
              <div className="mlCatOnOrange flex flex-wrap items-center gap-x-7 gap-y-3 rounded-lg bg-orange px-5 py-4 font-(family-name:--font-josefin) text-sm font-bold text-white">
                {["Deals", ...menuCategories].map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5">
                    <CategoryIcon category={c} size={18} demo />
                    {c}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-8 rounded-lg border border-beige bg-cream px-6 py-6 text-ink">
                {["Deals", ...menuCategories].map((c) => (
                  <CategoryIcon key={c} category={c} size={48} demo />
                ))}
              </div>
            </div>
          </section>
        </div>

        <div id="smoke" className="scroll-mt-16">
          <h2 className="mx-auto max-w-7xl px-4 pb-3 pt-10 font-(family-name:--font-cabin) text-xl font-bold uppercase tracking-brand text-olive">
            2. Hero smoke
          </h2>
          <section className="relative flex min-h-[635px] items-center justify-center overflow-hidden lg:min-h-[650px]">
            <Image
              src="/images/hero-min.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <HeroSmoke />
            <div className="relative flex flex-col items-center px-4 text-center">
              <Image
                src="/images/Marijuana-Land-Badge2.gif"
                alt=""
                width={130}
                height={130}
                unoptimized
                className="mb-6 h-[100px] w-[100px] sm:h-[130px] sm:w-[130px] lg:mb-8"
              />
              <h2 className="text-3xl font-medium uppercase tracking-brand text-gold sm:text-5xl">
                Welcome to Marijuana Land
              </h2>
              <p className="mt-4 text-base font-semibold text-white lg:text-lg">
                The Upper Peninsula&apos;s Premier Cannabis Dispensary
              </p>
              <span className="mt-6 rounded bg-orange px-10 py-3 font-(family-name:--font-josefin) text-lg font-bold text-white lg:mt-8">
                Shop Now
              </span>
            </div>
          </section>
        </div>

        <div id="sunburst" className="scroll-mt-16">
          <h2 className="mx-auto max-w-7xl px-4 pb-3 pt-10 font-(family-name:--font-cabin) text-xl font-bold uppercase tracking-brand text-olive">
            3. Sunburst mark (age gate + sign-up popup)
          </h2>
          <section className="overflow-hidden bg-olive-dark px-4 py-12 text-cream sm:px-8">
            <div className="mx-auto max-w-5xl space-y-12">
              <header>
                <p className="text-xs font-bold uppercase tracking-brand text-gold">Motion signature</p>
                <h2 className="mt-2 text-2xl font-bold uppercase text-cream">Sunburst mark</h2>
                <p className="mt-2 max-w-2xl text-sm text-beige/80">
                  One inline SVG, three modes. Top row is the age-gate badge layout (sun on top). Bottom row matches the header logo (leaf on top). Press Replay to run an intro again.
                </p>
              </header>
          
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SunburstReplay className="flex flex-col items-center gap-4 rounded-xl border border-cream/10 bg-black/20 px-4 pb-6 pt-12">
                  <SunburstMark mode="intro" size={160} />
                  <p className="text-xs font-bold uppercase tracking-brand text-beige/70">Intro, then idle</p>
                </SunburstReplay>
                <div className="flex flex-col items-center gap-4 rounded-xl border border-cream/10 bg-black/20 px-4 pb-6 pt-12">
                  <SunburstMark mode="idle" size={160} />
                  <p className="text-xs font-bold uppercase tracking-brand text-beige/70">Idle</p>
                </div>
                <div className="flex flex-col items-center gap-4 rounded-xl border border-cream/10 bg-black/20 px-4 pb-6 pt-12">
                  <SunburstMark mode="spinner" size={160} />
                  <p className="text-xs font-bold uppercase tracking-brand text-beige/70">Spinner</p>
                </div>
                <SunburstReplay className="flex flex-col items-center gap-4 rounded-xl border border-cream/10 bg-black/20 px-4 pb-6 pt-12">
                  <SunburstMark mode="intro" pose="emblem" size={160} />
                  <p className="text-xs font-bold uppercase tracking-brand text-beige/70">Intro, header layout</p>
                </SunburstReplay>
                <div className="flex flex-col items-center gap-4 rounded-xl border border-cream/10 bg-black/20 px-4 pb-6 pt-12">
                  <SunburstMark mode="idle" pose="emblem" size={160} />
                  <p className="text-xs font-bold uppercase tracking-brand text-beige/70">Idle, header layout</p>
                </div>
                <div className="flex flex-col items-center gap-4 rounded-xl border border-cream/10 bg-black/20 px-4 pb-6 pt-12">
                  <SunburstMark mode="spinner" pose="emblem" size={160} />
                  <p className="text-xs font-bold uppercase tracking-brand text-beige/70">Spinner, header layout</p>
                </div>
              </div>
          
              <div className="rounded-xl bg-white p-6 text-ink sm:p-8">
                <p className="text-xs font-bold uppercase tracking-brand text-stone-warm">Sign-up popup</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center justify-center gap-2 rounded bg-orange px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-white">
                    <SunburstMark mode="spinner" size={16} />
                    Signing up…
                  </span>
                  <span className="inline-flex items-center justify-center gap-2 rounded bg-orange px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-white">
                    <SunburstMark mode="spinner" size={20} />
                    Signing up…
                  </span>
                  <span className="inline-flex items-center justify-center gap-2 rounded bg-orange px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-white opacity-60">
                    <SunburstMark mode="spinner" size={18} />
                    Signing up…
                  </span>
                </div>
                <p className="mt-2 text-xs text-stone-warm/80">16px, 20px, and 18px as shipped in the disabled button.</p>
                <SunburstReplay className="mt-6 max-w-sm rounded-lg border border-beige p-6">
                  <SunburstMark mode="intro" size={44} className="mb-3 text-gold" />
                  <h3 className="text-xl font-bold uppercase text-gold">You&apos;re on the list!</h3>
                  <p className="mt-3 text-sm text-stone-warm">Watch your phone for exclusive Marijuana Land deals.</p>
                </SunburstReplay>
              </div>
          
              <SunburstReplay className="overflow-hidden rounded-xl">
                <div className="relative flex min-h-[480px] items-center justify-center bg-[url(/images/marijuana-land-coming-soon-bg.jpg)] bg-cover bg-center">
                  <div className="absolute inset-0 bg-black/60" />
                  <div className="relative mx-4 flex max-w-xl flex-col items-center text-center">
                    <div
                      role="img"
                      aria-label="Marijuana Land"
                      className="mb-6 flex size-30 items-center justify-center rounded-full bg-olive-dark/70 shadow-[inset_0_0_0_1px_rgba(255,244,221,0.1)]"
                    >
                      <SunburstMark mode="intro" size={92} delay={0.1} />
                    </div>
                    <p className="font-(family-name:--font-cabin) text-2xl font-medium uppercase tracking-brand text-gold sm:text-3xl">
                      Are you older than 21?
                    </p>
                    <div className="mt-6 flex gap-4" aria-hidden="true">
                      <span className="rounded border border-orange bg-orange px-10 py-2.5 font-(family-name:--font-josefin) font-bold text-white">Yes</span>
                      <span className="rounded border border-cream px-10 py-2.5 font-(family-name:--font-josefin) font-bold text-cream">No</span>
                    </div>
                    <p className="mt-6 max-w-sm text-sm text-beige">
                      By clicking &quot;Yes&quot; you certify that you are of legal age to view and purchase cannabis products.
                    </p>
                  </div>
                </div>
              </SunburstReplay>
            </div>
          </section>
        </div>

    </main>
  );
}
