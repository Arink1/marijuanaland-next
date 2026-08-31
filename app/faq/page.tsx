import type { Metadata } from "next";
import Link from "next/link";
import { faqs } from "@/lib/site";

export const metadata: Metadata = { title: "FAQ" };

export default function Faq() {
  return (
    <>
      <section className="bg-olive px-4 py-14 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-brand text-cream">
          FAQ
        </h1>
        <p className="mt-3 text-beige">
          Have questions or need assistance? Check out our FAQs or{" "}
          <Link href="/contact" className="underline">
            contact us
          </Link>
          .
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold uppercase tracking-brand text-olive">
          FAQs
        </h2>
        <div className="mt-8 space-y-3">
          {faqs.map((f) => (
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
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold uppercase tracking-brand">
            Still have questions?
          </h3>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded bg-orange px-8 py-2.5 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
