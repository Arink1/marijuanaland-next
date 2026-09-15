import type { Metadata } from "next";
import Image from "next/image";
import ContactForm from "@/components/ContactForm";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "Contact" };

export default async function Contact() {
  const { site } = await getContent();
  return (
    <>
      <section className="bg-olive px-4 py-14 text-center">
        <h1 className="text-3xl font-medium uppercase tracking-brand text-cream">
          Contact
        </h1>
      </section>

      <section className="mx-auto grid max-w-5xl gap-12 px-4 py-16 md:grid-cols-2">
        <div className="space-y-6 text-stone-warm">
          <div>
            <h2 className="flex items-center gap-2.5 text-lg font-bold uppercase tracking-brand text-ink">
              <Image
                src="/images/time-icon-black.svg"
                alt=""
                width={20}
                height={20}
              />
              Store Hours
            </h2>
            {site.hoursDetail.map((h) => (
              <p key={h} className="mt-1.5">
                {h}
              </p>
            ))}
          </div>
          <div>
            <h2 className="flex items-center gap-2.5 text-lg font-bold uppercase tracking-brand text-ink">
              <Image
                src="/images/location-icon-black.svg"
                alt=""
                width={20}
                height={20}
              />
              Address
            </h2>
            <p className="mt-1.5">{site.address}</p>
            <a
              href={site.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-semibold text-orange underline"
            >
              Get Directions &gt;
            </a>
          </div>
          <div className="space-y-1.5">
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
            <p className="flex items-center gap-2.5">
              <Image src="/images/email.png" alt="" width={18} height={18} />
              <a href={`mailto:${site.email}`} className="underline">
                {site.email}
              </a>
            </p>
          </div>
        </div>

        <ContactForm email={site.email} />
      </section>
    </>
  );
}
