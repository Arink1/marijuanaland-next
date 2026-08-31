import Link from "next/link";
import Image from "next/image";
import Testimonials from "@/components/Testimonials";
import {
  brands,
  categories,
  deals,
  faqs,
  instagramImages,
  site,
} from "@/lib/site";

function DealCard({
  title,
  text,
  image,
  tall,
}: {
  title: string;
  text: string;
  image: string;
  tall: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg ${
        tall ? "min-h-[540px]" : "min-h-[250px]"
      }`}
    >
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-xl font-bold uppercase tracking-brand text-gold">
          {title}
        </h3>
        <p className="mt-1 text-sm text-white">{text}</p>
        <Link
          href="/shop"
          className="mt-3 inline-block rounded bg-orange px-5 py-2 text-sm font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[650px] items-center justify-center overflow-hidden">
        <Image
          src="/images/hero-min.png"
          alt="Aerial view of Upper Peninsula forest"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative flex flex-col items-center px-4 text-center">
          <Image
            src="/images/Marijuana-Land-Badge2.gif"
            alt=""
            width={130}
            height={130}
            priority
            unoptimized
            className="mb-8"
          />
          <h1 className="text-3xl font-medium uppercase tracking-brand text-gold sm:text-5xl">
            Welcome to Marijuana Land
          </h1>
          <p className="mt-4 text-lg font-semibold text-white">
            {site.tagline}
          </p>
          <Link
            href="/shop"
            className="mt-8 rounded bg-orange px-10 py-3 font-(family-name:--font-josefin) text-lg font-bold text-white transition hover:bg-orange-dark"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Category bar */}
      <nav className="border-b border-beige bg-cream">
        <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4">
          {categories.map((c, idx) => (
            <li key={c}>
              <Link
                href="/shop"
                className={`font-(family-name:--font-josefin) font-semibold ${
                  idx === 0
                    ? "border-b-2 border-orange text-orange"
                    : "text-ink hover:text-orange"
                }`}
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Deals grid */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-5 lg:grid-cols-4">
          <DealCard {...deals[0]} />
          <div className="grid gap-5 lg:col-span-2">
            <DealCard {...deals[1]} />
            <div className="grid gap-5 sm:grid-cols-2">
              <DealCard {...deals[2]} />
              <DealCard {...deals[3]} />
            </div>
          </div>
          <DealCard {...deals[4]} />
        </div>
      </section>

      {/* Top brands */}
      <section className="bg-ink px-4 py-16">
        <h2 className="text-center text-2xl font-medium uppercase tracking-brand text-gold">
          Our Top Brands
        </h2>
        <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-10">
          {brands.map((b) => (
            <Image
              key={b}
              src={b}
              alt="Brand logo"
              width={110}
              height={110}
              className="h-20 w-auto object-contain"
            />
          ))}
        </div>
      </section>

      <Testimonials />

      {/* Our story */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/our-story-1.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center">
          <h4 className="text-2xl font-bold uppercase tracking-brand text-gold">
            Our Story
          </h4>
          <p className="mt-5 leading-relaxed text-white">
            Founded by one of Northern Michigan&apos;s most esteemed growers,
            our roots run deep in the rich, fertile soils that have produced
            some of the state&apos;s most celebrated brands.
          </p>
          <Image
            src="/images/Marijuana-Land-Bag.gif"
            alt="Marijuana Land shopping bag"
            width={380}
            height={380}
            unoptimized
            className="mx-auto mt-6"
          />
          <Link
            href="/about-us"
            className="mt-6 inline-block rounded bg-orange px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark"
          >
            About Us
          </Link>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="bg-cream px-4 py-16">
        <h2 className="text-center text-2xl font-bold uppercase tracking-brand text-olive">
          Got a Question?
        </h2>
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {faqs.slice(0, 5).map((f) => (
            <details
              key={f.q}
              className="group rounded border border-beige bg-white px-5 py-4"
            >
              <summary className="cursor-pointer list-none font-semibold">
                {f.q}
                <span className="float-right text-gold group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-stone-warm">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Instagram */}
      <section className="bg-cream px-4 pb-16 pt-4 text-center">
        <h2 className="inline-flex items-center gap-3 text-xl font-medium uppercase tracking-brand text-olive">
          <Image
            src="/images/MariuanaLand-icons_icon-48px-instagram-copy-1.png"
            alt=""
            width={26}
            height={26}
          />
          {site.instagramHandle}
        </h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-5 sm:grid-cols-3">
          {instagramImages.map((src) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded"
            >
              <Image src={src} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
        <a
          href="#"
          className="mt-8 inline-block rounded bg-olive px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-olive-dark"
        >
          Follow Us
        </a>
      </section>
    </>
  );
}
