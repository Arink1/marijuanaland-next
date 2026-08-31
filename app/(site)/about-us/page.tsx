import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutUs() {
  const { site } = await getContent();
  return (
    <>
      <section className="bg-olive px-4 py-14 text-center">
        <h1 className="text-3xl font-medium uppercase tracking-brand text-cream">
          About Us
        </h1>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-brand text-olive">
            Who We Are
          </h2>
          <p className="mt-5 leading-relaxed text-stone-warm">
            Our journey began with a vision to create a space where quality
            cannabis products meet the beauty of our great outdoors. We believe
            in the power of cannabis to enhance life&apos;s experiences,
            whether you&apos;re hiking through Michigan&apos;s lush forests or
            relaxing by a serene lakeside.
          </p>
        </div>
        <Image
          src="/images/image-8.png"
          alt="Marijuana Land storefront"
          width={560}
          height={400}
          className="w-full rounded-lg object-cover"
        />
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <Image
            src="/images/Rectangle-107.png"
            alt="Organic soil"
            width={560}
            height={400}
            className="w-full rounded-lg object-cover md:order-1"
          />
          <div className="md:order-2">
            <h2 className="text-2xl font-bold uppercase tracking-brand text-olive">
              Grown with Integrity
            </h2>
            <p className="mt-5 leading-relaxed text-stone-warm">
              Our soil, proudly certified by Penn University, is a cornerstone
              of our commitment to quality. This organic, nutrient-rich soil
              provides the ideal foundation for cultivating premium cannabis.
              With its excellent composition, our soil helps us produce
              cannabis that stands out in both potency and purity, delivering
              an unparalleled experience to our customers.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded bg-orange px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark"
            >
              Shop Our Products
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h3 className="text-center text-2xl font-bold uppercase tracking-brand text-olive">
          Location
        </h3>
        <div className="mx-auto mt-8 grid max-w-4xl items-center gap-8 rounded-lg border border-beige bg-white p-6 md:grid-cols-2">
          <Image
            src="/images/about-location-img-mob.png"
            alt="Map to Marijuana Land"
            width={480}
            height={320}
            className="w-full rounded object-cover"
          />
          <div className="space-y-3 text-stone-warm">
            <h4 className="text-xl font-bold uppercase tracking-brand text-ink">
              Germfask
            </h4>
            <p className="flex items-center gap-2.5">
              <Image
                src="/images/time-icon-black.svg"
                alt=""
                width={18}
                height={18}
              />
              {site.hours}
            </p>
            <p className="flex items-center gap-2.5">
              <Image
                src="/images/phone-icon-black.svg"
                alt=""
                width={18}
                height={18}
              />
              <a href={site.phoneHref} className="underline">
                {site.phone}
              </a>
            </p>
            <p className="flex items-start gap-2.5">
              <Image
                src="/images/location-icon-black.svg"
                alt=""
                width={18}
                height={18}
              />
              {site.address}
            </p>
            <a
              href={site.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-semibold text-orange underline"
            >
              Get Directions &gt;
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
