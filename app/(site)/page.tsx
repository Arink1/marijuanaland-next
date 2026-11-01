import Link from "next/link";
import Image from "next/image";
import Testimonials from "@/components/Testimonials";
import BagAnimation from "@/components/BagAnimation";
import HeroSmoke from "@/components/fx/HeroSmoke";
import { DEAL_SLOT_COUNT, DealCard, DealGrid } from "@/components/DealCard";
import DealsStrip from "@/components/DealsStrip";
import CategoryIcon from "@/components/fx/CategoryIcon";
import CategoryIconPlay from "@/components/fx/CategoryIconPlay";
import { categories, instagramImages } from "@/lib/site";
import { getContent } from "@/lib/content";
import { isLive, todayInShop } from "@/lib/schedule";

export default async function Home() {
  const { site, deals, dealTiles, faqs, testimonials } = await getContent();

  // Scheduled deals: only what is live today (shop time). The card mosaic
  // has five slots, so the first five live cards fill them in order. A card
  // without a photo is skipped rather than breaking the page.
  const today = todayInShop();
  const cards = deals
    .filter((d) => d.image && isLive(d, today))
    .slice(0, DEAL_SLOT_COUNT);
  const tiles = dealTiles.filter((t) => isLive(t, today));
  const reviews = testimonials.filter((t) => t.show !== false);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[635px] items-center justify-center overflow-hidden lg:min-h-[650px]">
        <Image
          src="/images/hero-min.png"
          alt="Aerial view of Upper Peninsula forest"
          fill
          priority
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
            priority
            unoptimized
            className="mb-6 h-[100px] w-[100px] sm:h-[130px] sm:w-[130px] lg:mb-8"
          />
          <h1 className="text-3xl font-medium uppercase tracking-brand text-gold sm:text-5xl">
            Welcome to Marijuana Land
          </h1>
          <p className="mt-4 text-base font-semibold text-white lg:text-lg">
            {site.tagline}
          </p>
          <Link
            href="/shop"
            className="mt-6 rounded bg-orange px-10 py-3 font-(family-name:--font-josefin) text-lg font-bold text-white transition hover:bg-orange-dark lg:mt-8"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Category bar — horizontal scroll strip on mobile */}
      <nav className="border-b border-beige bg-cream">
        <CategoryIconPlay>
          <ul className="mx-auto flex h-12 max-w-5xl items-center gap-x-7 overflow-x-auto whitespace-nowrap px-4 [scrollbar-width:none] lg:h-auto lg:flex-wrap lg:justify-center lg:gap-x-8 lg:overflow-visible lg:py-4 [&::-webkit-scrollbar]:hidden">
            {categories.map((c, idx) => (
              <li key={c} className="shrink-0">
                <Link
                  href="/shop"
                  className={`mlCatHost inline-flex items-center gap-1.5 align-top font-(family-name:--font-inter) text-sm font-medium ${
                    idx === 0
                      ? "border-b-2 border-orange text-orange"
                      : "text-ink hover:text-orange"
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

      {/* Deals grid */}
      <DealGrid>
        {cards.map((d, i) => (
          <DealCard key={i} title={d.title} text={d.text} image={d.image} slot={i} />
        ))}
      </DealGrid>

      {/* Today at the Shop — animated deals strip */}
      {tiles.length > 0 && <DealsStrip tiles={tiles} />}

      <Testimonials items={reviews} />

      {/* Our story */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/our-story-1.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center lg:py-24">
          <h4 className="text-2xl font-bold uppercase tracking-brand text-gold">
            Our Story
          </h4>
          <p className="mt-4 text-sm leading-relaxed text-white lg:mt-5 lg:text-base">
            Founded by one of Northern Michigan&apos;s most esteemed growers,
            our roots run deep in the rich, fertile soils that have produced
            some of the state&apos;s most celebrated brands.
          </p>
          <BagAnimation className="mx-auto mt-4 size-[210px] [--scale:0.42] lg:mt-6 lg:size-[360px] lg:[--scale:0.72]" />
          <Link
            href="/about-us"
            className="mt-4 inline-block rounded bg-orange px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark lg:mt-6"
          >
            About Us
          </Link>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="bg-cream px-4 py-8 lg:py-16">
        <h2 className="text-center text-2xl font-bold uppercase tracking-brand text-olive">
          Got a Question?
        </h2>
        <div className="mx-auto mt-5 max-w-3xl space-y-2 lg:mt-8 lg:space-y-3">
          {faqs.slice(0, 5).map((f) => (
            <details
              key={f.q}
              className="group rounded border border-beige bg-white px-4 py-2.5 lg:px-5 lg:py-4"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold lg:text-base">
                {f.q}
                <span className="float-right text-gold group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm text-stone-warm lg:mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Instagram */}
      <section className="bg-cream px-4 pb-10 pt-4 text-center lg:pb-16">
        <h2 className="inline-flex items-center gap-3 text-xl font-medium uppercase tracking-brand text-olive">
          <Image
            src="/images/MariuanaLand-icons_icon-48px-instagram-copy-1.png"
            alt=""
            width={26}
            height={26}
          />
          {site.instagramHandle}
        </h2>
        {/* photo tiles were desktop-only on the original site */}
        <div className="mx-auto mt-8 hidden max-w-4xl gap-5 sm:grid sm:grid-cols-3">
          {instagramImages.map((src) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 1024px) 33vw, 300px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <a
          href="#"
          className="mt-6 inline-block rounded bg-olive px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-olive-dark lg:mt-8"
        >
          Follow Us
        </a>
      </section>
    </>
  );
}
