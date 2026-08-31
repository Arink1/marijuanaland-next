import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

const productLinks = [
  "Flower",
  "Edibles",
  "Vapes",
  "Cartridges",
  "Beverages",
  "Merch",
];

export default function Footer() {
  return (
    <footer className="bg-smoke pt-14 text-sm">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 md:grid-cols-3">
        <div>
          <Image
            src="/images/footer-logo-1-2.png"
            alt="Marijuana Land"
            width={160}
            height={72}
            className="h-16 w-auto"
          />
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Instagram">
              <Image
                src="/images/MariuanaLand-icons_icon-48px-instagram-copy-1.png"
                alt=""
                width={28}
                height={28}
              />
            </a>
            <a href="#" aria-label="Facebook">
              <Image
                src="/images/MariuanaLand-icons_icon-48px-facebook-copy-1-1.png"
                alt=""
                width={28}
                height={28}
              />
            </a>
            <a href="#" aria-label="Yelp">
              <Image
                src="/images/MariuanaLand-icons_icon-48px-yelp-copy-1.png"
                alt=""
                width={28}
                height={28}
              />
            </a>
          </div>
          <ul className="mt-5 space-y-2.5 text-stone-warm">
            <li className="flex items-center gap-2.5">
              <Image src="/images/clock.png" alt="" width={18} height={18} />
              {site.hours}
            </li>
            <li className="flex items-center gap-2.5">
              <Image src="/images/phone.png" alt="" width={18} height={18} />
              <a href={site.phoneHref} className="underline">
                {site.phone}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Image src="/images/pin.png" alt="" width={18} height={18} />
              {site.address}
            </li>
          </ul>
          <a
            href={site.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-semibold underline"
          >
            Get Directions &gt;
          </a>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Link href="/" className="block font-semibold underline">
              Home
            </Link>
            <Link href="/shop" className="block font-semibold underline">
              Order Online
            </Link>
            {productLinks.slice(0, 3).map((p) => (
              <Link key={p} href="/shop" className="block text-stone-warm">
                {p}
              </Link>
            ))}
          </div>
          <div className="space-y-2.5 pt-[4.25rem]">
            {productLinks.slice(3).map((p) => (
              <Link key={p} href="/shop" className="block text-stone-warm">
                {p}
              </Link>
            ))}
            <Link href="/about-us" className="block font-semibold underline">
              About Us
            </Link>
            <Link href="/gallery" className="block font-semibold underline">
              Gallery
            </Link>
            <Link href="/contact" className="block font-semibold underline">
              Contact Us
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold uppercase tracking-brand">
            Get 20% off your first order when you subscribe
          </h3>
          <div className="mt-4">
            <input
              type="email"
              placeholder="Your Email"
              className="w-full rounded border border-gold bg-white px-4 py-2.5 outline-none placeholder:text-stone-warm/60"
            />
          </div>
        </div>
      </div>
      <div className="bg-olive-dark px-4 py-5 text-center text-xs text-beige">
        <p>{site.licenses}</p>
        <p className="mt-2">Terms &amp; Services | Privacy Policy</p>
      </div>
    </footer>
  );
}
