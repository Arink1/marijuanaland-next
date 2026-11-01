import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ScreenVariant } from "@/lib/screen";

/**
 * The homepage deal mosaic: five photo cards under the hero.
 *
 * `responsive` is what the homepage renders (phone layout, desktop from the
 * lg breakpoint). `phone` and `desktop` pin one of those layouts regardless
 * of screen size so the admin can preview either one in a small box. Keep
 * the three strings of each slot in step.
 */
type SlotClasses = Record<ScreenVariant, string>;

// Mobile placement mirrors the original site: flower full-width, then
// topicals + cartridges side by side, then pre-rolls and edibles full-width.
export const DEAL_SLOTS: readonly SlotClasses[] = [
  {
    // tall, left
    phone: "order-2 col-span-1 h-[190px]",
    desktop: "col-start-1 row-start-1 row-span-2 h-[540px]",
    responsive:
      "order-2 col-span-1 h-[190px] lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:h-[540px]",
  },
  {
    // wide, top middle
    phone: "order-1 col-span-2 h-[162px]",
    desktop: "col-start-2 col-span-2 row-start-1 h-[250px]",
    responsive:
      "order-1 col-span-2 h-[162px] lg:order-none lg:col-start-2 lg:col-span-2 lg:row-start-1 lg:h-[250px]",
  },
  {
    // bottom, middle left
    phone: "order-4 col-span-2 h-[176px]",
    desktop: "col-start-2 col-span-1 row-start-2 h-[250px]",
    responsive:
      "order-4 col-span-2 h-[176px] lg:order-none lg:col-start-2 lg:col-span-1 lg:row-start-2 lg:h-[250px]",
  },
  {
    // bottom, middle right
    phone: "order-5 col-span-2 h-[162px]",
    desktop: "col-start-3 col-span-1 row-start-2 h-[250px]",
    responsive:
      "order-5 col-span-2 h-[162px] lg:order-none lg:col-start-3 lg:col-span-1 lg:row-start-2 lg:h-[250px]",
  },
  {
    // tall, right
    phone: "order-3 col-span-1 h-[190px]",
    desktop: "col-start-4 row-start-1 row-span-2 h-[540px]",
    responsive:
      "order-3 col-span-1 h-[190px] lg:order-none lg:col-start-4 lg:row-start-1 lg:row-span-2 lg:h-[540px]",
  },
];

/** How many cards the homepage shows at once. */
export const DEAL_SLOT_COUNT = DEAL_SLOTS.length;

const SECTION: Record<ScreenVariant, string> = {
  responsive: "px-[15px] py-6 lg:px-4 lg:py-12",
  phone: "px-[15px] py-6",
  desktop: "px-4 py-12",
};
const GRID: Record<ScreenVariant, string> = {
  responsive: "grid grid-cols-2 gap-[9px] lg:grid-cols-4 lg:gap-5",
  phone: "grid grid-cols-2 gap-[9px]",
  desktop: "grid grid-cols-4 gap-5",
};
const CAPTION: Record<ScreenVariant, string> = {
  responsive: "p-3 lg:p-5",
  phone: "p-3",
  desktop: "p-5",
};
const TEXT: Record<ScreenVariant, string> = {
  responsive: "text-xs lg:text-sm",
  phone: "text-xs",
  desktop: "text-sm",
};
const BUTTON: Record<ScreenVariant, string> = {
  responsive: "mt-2 px-4 py-1.5 text-xs lg:mt-3 lg:px-5 lg:py-2 lg:text-sm",
  phone: "mt-2 px-4 py-1.5 text-xs",
  desktop: "mt-3 px-5 py-2 text-sm",
};

/** The section and grid the cards sit in, with the homepage's own spacing. */
export function DealGrid({
  variant = "responsive",
  children,
}: {
  variant?: ScreenVariant;
  children: ReactNode;
}) {
  return (
    <section className={`mx-auto max-w-7xl ${SECTION[variant]}`}>
      <div className={GRID[variant]}>{children}</div>
    </section>
  );
}

/**
 * One photo card. `slot` is its position in the mosaic (0 to 4). In `preview`
 * mode (the admin) the photo is a plain <img> so any URL shows instantly and
 * the button is inert; `children` lets the admin lay controls over the card.
 */
export function DealCard({
  title,
  text,
  image,
  slot,
  variant = "responsive",
  preview = false,
  children,
}: {
  title: string;
  text: string;
  image: string;
  slot: number;
  variant?: ScreenVariant;
  preview?: boolean;
  children?: ReactNode;
}) {
  const button = `inline-block rounded bg-orange font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark ${BUTTON[variant]}`;
  return (
    <div className={`group relative overflow-hidden rounded-lg ${DEAL_SLOTS[slot][variant]}`}>
      {preview ? (
        image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-cream-deep text-sm font-semibold text-stone-warm">
            Add a photo
          </span>
        )
      ) : (
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className={`absolute inset-x-0 bottom-0 ${CAPTION[variant]}`}>
        <h3 className="text-[22px] font-bold uppercase leading-tight tracking-brand text-gold">
          {title}
        </h3>
        <p className={`mt-1 text-white ${TEXT[variant]}`}>{text}</p>
        {preview ? (
          <span className={button}>Shop Now</span>
        ) : (
          <Link href="/shop" className={button}>
            Shop Now
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
