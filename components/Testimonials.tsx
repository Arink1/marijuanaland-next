"use client";

import { useState } from "react";
import Image from "next/image";
import type { Testimonial } from "@/lib/content";

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  if (items.length === 0) return null;

  const t = items[i % items.length];
  const step = (d: number) => setI((i + d + items.length) % items.length);
  const rating = Math.min(5, Math.max(0, Math.round(Number(t.rating) || 0)));

  return (
    <section className="bg-olive px-4 py-8 lg:py-16">
      <h4 className="text-center text-sm font-bold uppercase tracking-brand text-beige">
        What people are saying
      </h4>
      <div className="mx-auto mt-5 flex max-w-3xl items-center gap-2 sm:gap-6 lg:mt-8">
        <button
          onClick={() => step(-1)}
          aria-label="Previous testimonial"
          disabled={items.length < 2}
          className="rounded bg-orange px-3 py-2 font-bold text-white disabled:opacity-40"
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
          {rating > 0 && (
            <p
              className="mb-2 text-lg tracking-widest text-gold"
              aria-label={`${rating} out of 5 stars`}
            >
              {"★".repeat(rating)}
              <span className="text-beige">{"★".repeat(5 - rating)}</span>
            </p>
          )}
          <blockquote className="text-sm leading-relaxed sm:text-base">
            {t.quote}
          </blockquote>
          <figcaption className="mt-3 text-sm font-semibold lg:mt-4 lg:text-base">
            – {t.author}
          </figcaption>
        </figure>
        <button
          onClick={() => step(1)}
          aria-label="Next testimonial"
          disabled={items.length < 2}
          className="rounded bg-orange px-3 py-2 font-bold text-white disabled:opacity-40"
        >
          &rsaquo;
        </button>
      </div>
    </section>
  );
}
