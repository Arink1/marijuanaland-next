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
    <section className="bg-olive px-4 py-8 lg:py-16">
      <h4 className="text-center text-sm font-bold uppercase tracking-brand text-beige">
        What people are saying
      </h4>
      <div className="mx-auto mt-5 flex max-w-3xl items-center gap-2 sm:gap-6 lg:mt-8">
        <button
          onClick={() => step(-1)}
          aria-label="Previous testimonial"
          className="rounded bg-orange px-3 py-2 font-bold text-white"
        >
          &lsaquo;
        </button>
        <figure className="flex-1 rounded-lg bg-white px-4 py-6 text-center shadow-lg sm:px-12 lg:py-10">
          <Image
            src="/images/quote.png"
            alt=""
            width={36}
            height={28}
            className="mx-auto mb-3 lg:mb-5"
          />
          <blockquote className="text-sm leading-relaxed sm:text-base">
            {t.quote}
          </blockquote>
          <figcaption className="mt-3 text-sm font-semibold lg:mt-4 lg:text-base">– {t.author}</figcaption>
        </figure>
        <button
          onClick={() => step(1)}
          aria-label="Next testimonial"
          className="rounded bg-orange px-3 py-2 font-bold text-white"
        >
          &rsaquo;
        </button>
      </div>
    </section>
  );
}
