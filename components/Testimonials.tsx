"use client";

import { useState } from "react";
import Image from "next/image";
import { testimonials } from "@/lib/site";

export default function Testimonials() {
  const [i, setI] = useState(0);
  const t = testimonials[i];
  const step = (d: number) =>
    setI((i + d + testimonials.length) % testimonials.length);

  return (
    <section className="bg-olive px-4 py-16">
      <h4 className="text-center text-sm font-bold uppercase tracking-brand text-beige">
        What people are saying
      </h4>
      <div className="mx-auto mt-8 flex max-w-3xl items-center gap-3 sm:gap-6">
        <button
          onClick={() => step(-1)}
          aria-label="Previous testimonial"
          className="rounded bg-gold px-3 py-2 font-bold text-ink"
        >
          &lsaquo;
        </button>
        <figure className="flex-1 rounded-lg bg-white px-6 py-10 text-center shadow-lg sm:px-12">
          <Image
            src="/images/quote.png"
            alt=""
            width={36}
            height={28}
            className="mx-auto mb-5"
          />
          <blockquote className="text-sm leading-relaxed sm:text-base">
            {t.quote}
          </blockquote>
          <figcaption className="mt-4 font-semibold">– {t.author}</figcaption>
        </figure>
        <button
          onClick={() => step(1)}
          aria-label="Next testimonial"
          className="rounded bg-gold px-3 py-2 font-bold text-ink"
        >
          &rsaquo;
        </button>
      </div>
    </section>
  );
}
