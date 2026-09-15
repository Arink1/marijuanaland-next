import type { Metadata } from "next";
import Image from "next/image";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "Gallery" };

export default async function Gallery() {
  const { gallery } = await getContent();
  return (
    <>
      <section className="bg-olive px-4 py-14 text-center">
        <h1 className="text-3xl font-medium uppercase tracking-brand text-cream">
          Gallery
        </h1>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        {gallery.length === 0 ? (
          <p className="text-center text-stone-warm">New photos coming soon.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((g, i) => (
              <figure key={`${g.src}-${i}`}>
                <div className="relative aspect-square overflow-hidden rounded-lg bg-cream">
                  <Image
                    src={g.src}
                    alt={g.caption || "Marijuana Land gallery photo"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </div>
                {g.caption && (
                  <figcaption className="mt-2 text-center text-sm text-stone-warm">
                    {g.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
