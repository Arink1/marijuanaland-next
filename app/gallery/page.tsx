import type { Metadata } from "next";
import Image from "next/image";
import { galleryImages } from "@/lib/site";

export const metadata: Metadata = { title: "Gallery" };

export default function Gallery() {
  return (
    <>
      <section className="bg-olive px-4 py-14 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-brand text-cream">
          Gallery
        </h1>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((src) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <Image
                src={src}
                alt="Marijuana Land gallery photo"
                fill
                className="object-cover transition duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
