/**
 * CategoryIcon: small line icons for the product categories, each with one
 * slow micro-motion (transform + opacity only, see category-icon.css).
 *
 * Idle is static. Motion plays when the parent link/button has the class
 * "mlCatHost" and is hovered, focused from the keyboard or pressed. On touch
 * screens wrap the list in <CategoryIconPlay> so the icons play once when the
 * list scrolls into view and replay on tap. Reduced motion: always static.
 *
 * Usage:
 *   <Link href="/shop" className="mlCatHost inline-flex items-center gap-1.5">
 *     <CategoryIcon category="Pre-rolls" />
 *     Pre-rolls
 *   </Link>
 *
 * Strokes use currentColor, so the icon follows the link's text color. On an
 * orange background add "mlCatOnOrange" to the host so the ember and the amber
 * drop switch to light tones.
 */

import type { ReactNode } from "react";
import "./category-icon.css";

export type CategoryIconKind =
  | "deals"
  | "flower"
  | "prerolls"
  | "cartridges"
  | "edibles"
  | "concentrates"
  | "topicals";

const ALIASES: Record<string, CategoryIconKind> = {
  deals: "deals",
  deal: "deals",
  specials: "deals",
  flower: "flower",
  prerolls: "prerolls",
  preroll: "prerolls",
  cartridges: "cartridges",
  cartridge: "cartridges",
  carts: "cartridges",
  vapes: "cartridges",
  vape: "cartridges",
  edibles: "edibles",
  edible: "edibles",
  concentrates: "concentrates",
  concentrate: "concentrates",
  topicals: "topicals",
  topical: "topicals",
};

/** "Pre-Rolls", "pre-rolls" and "Prerolls" all map to "prerolls". Unknown labels (e.g. "All") give null. */
export function categoryIconKind(category: string): CategoryIconKind | null {
  return ALIASES[category.toLowerCase().replace(/[^a-z]/g, "")] ?? null;
}

// Four-point glint, unit radius; placed and sized by its parent <g>.
const GLINT = "M0-1C.12-.25.25-.12 1 0 .25.12.12.25 0 1-.12.25-.25.12-1 0-.25-.12-.12-.25 0-1Z";

// Five serrated leaflets (center longest) fanning from the leaf base at 12,15.
const LEAF =
  "M12 15L12.92 14.1L13.42 13.21L13.51 12.44L14.27 11.44L13.79 11.16L14.38 10.16L13.85 9.88L14.3 8.88L13.74 8.6L14.08 7.6L13.49 7.32L13.75 6.32L13.14 6.04L13.35 5.04L12.72 4.76L12.9 3.76L12.3 3.48L12.19 2.71L12 2.2L11.81 2.71L11.7 3.48L11.1 3.76L11.28 4.76L10.65 5.04L10.86 6.04L10.25 6.32L10.51 7.32L9.92 7.6L10.26 8.6L9.7 8.88L10.15 9.88L9.62 10.16L10.21 11.16L9.73 11.44L10.49 12.44L10.58 13.21L11.08 14.1Z" +
  "M12 15L12.17 13.91L12.04 13.06L11.71 12.53L11.64 11.35L11.14 11.43L10.91 10.38L10.37 10.49L10.03 9.54L9.45 9.67L9.02 8.8L8.42 8.95L7.93 8.13L7.31 8.3L6.79 7.5L6.19 7.65L5.71 7.24L5.32 7.03L5.45 7.46L5.77 8.01L5.52 8.56L6.21 9.22L5.94 9.79L6.67 10.42L6.41 10.99L7.2 11.56L6.96 12.11L7.84 12.61L7.63 13.13L8.63 13.53L8.47 14.02L9.62 14.28L10.08 14.71L10.9 14.97Z" +
  "M12 15L13.1 14.97L13.92 14.71L14.38 14.28L15.53 14.02L15.37 13.53L16.37 13.13L16.16 12.61L17.04 12.11L16.8 11.56L17.59 10.99L17.33 10.42L18.06 9.79L17.79 9.22L18.48 8.56L18.23 8.01L18.55 7.46L18.68 7.03L18.29 7.24L17.81 7.65L17.21 7.5L16.69 8.3L16.07 8.13L15.58 8.95L14.98 8.8L14.55 9.67L13.97 9.54L13.63 10.49L13.09 10.38L12.86 11.43L12.36 11.35L12.29 12.53L11.96 13.06L11.83 13.91Z" +
  "M12 15L11.65 14.24L11.23 13.78L10.82 13.62L10.18 12.87L9.88 13.18L9.19 12.65L8.89 13.01L8.16 12.65L7.85 13.05L7.1 12.8L6.78 13.22L6.02 13.03L5.71 13.44L5.27 13.43L4.96 13.5L5.21 13.7L5.62 13.87L5.74 14.37L6.51 14.5L6.63 15.02L7.42 15.09L7.54 15.58L8.35 15.55L8.48 16L9.33 15.81L9.47 16.2L10.36 15.78L10.8 15.8L11.37 15.55Z" +
  "M12 15L12.63 15.55L13.2 15.8L13.64 15.78L14.53 16.2L14.67 15.81L15.52 16L15.65 15.55L16.46 15.58L16.58 15.09L17.37 15.02L17.49 14.5L18.26 14.37L18.38 13.87L18.79 13.7L19.04 13.5L18.73 13.43L18.29 13.44L17.98 13.03L17.22 13.22L16.9 12.8L16.15 13.05L15.84 12.65L15.11 13.01L14.81 12.65L14.12 13.18L13.82 12.87L13.18 13.62L12.77 13.78L12.35 14.24Z";

const GLYPHS: Record<CategoryIconKind, ReactNode> = {
  // Fan leaf that sways a few degrees while glints catch the light in turn.
  // (A bud silhouette read as a tree or bird at 20px; the leaf stays clear.)
  flower: (
    <>
      <g className="mlCat__m mlCat__leaf">
        <path d={LEAF} fill="currentColor" stroke="none" />
        <path d="M12 14.6v6.8" />
      </g>
      <g transform="translate(18.2 2.8) scale(2.4)">
        <path className="mlCat__m mlCat__glint" d={GLINT} />
      </g>
      <g transform="translate(4.4 19.2) scale(1.9)">
        <path className="mlCat__m mlCat__glint mlCat__glint--b" d={GLINT} />
      </g>
      <g transform="translate(21 10.6) scale(2)">
        <path className="mlCat__m mlCat__glint mlCat__glint--c" d={GLINT} />
      </g>
      <g transform="translate(5.4 3.2) scale(1.7)">
        <path className="mlCat__m mlCat__glint mlCat__glint--d" d={GLINT} />
      </g>
    </>
  ),

  // Cone pre-roll, filter left; the wide end glows (halo + core) and a wisp
  // rises. Kept near-horizontal: at 45 degrees it read as a pencil.
  prerolls: (
    <>
      <g transform="translate(18.6 10.6) rotate(68.1)">
        <ellipse className="mlCat__m mlCat__ember mlCat__hot" rx="4.1" ry="2.5" fillOpacity=".32" />
        <ellipse className="mlCat__m mlCat__ember mlCat__amber" rx="2.8" ry="1.05" />
      </g>
      <path d="M2.35 15.89 17 7.83Q20.15 10.02 19.4 13.77L3.25 18.11Z" />
      <path d="M5.53 14.14 6.75 17.17" strokeWidth="1.6" />
      <path
        className="mlCat__m mlCat__wisp"
        d="M19.3 7.4c-1.1-1 .9-1.8-.1-3-.5-.6 0-1.2.3-1.6"
        strokeWidth="1.3"
      />
    </>
  ),

  // 510 cartridge: mouthpiece, tank with center post and oil, threaded base.
  cartridges: (
    <>
      <g className="mlCat__m mlCat__puff">
        <circle cx="12" cy="2.5" r="1.5" />
        <circle cx="10.4" cy="3.2" r="1.05" />
        <circle cx="13.6" cy="3.1" r="1.15" />
      </g>
      <path className="mlCat__tint" d="M9 12.8H15V17.4A1.2 1.2 0 0 1 13.8 18.6H10.2A1.2 1.2 0 0 1 9 17.4Z" />
      <path d="M10.6 8.4 10.8 5.6Q10.9 4.4 12 4.4T13.2 5.6L13.4 8.4" />
      <rect x="9" y="8.4" width="6" height="10.2" rx="1.2" />
      <path d="M12 8.6v4.2" strokeWidth="1.3" />
      <path d="M10 18.6v1.6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1.6" />
    </>
  ),

  // Dab tool over an open jar; one amber drop forms, falls and lands.
  concentrates: (
    <>
      <path
        className="mlCat__m mlCat__drop mlCat__amber"
        d="M13.3 5C14.4 6.4 14.7 7.2 14.7 7.8A1.4 1.4 0 0 1 11.9 7.8C11.9 7.2 12.2 6.4 13.3 5Z"
      />
      <path d="M19.4.6 13.6 4.6" />
      <rect x="7.4" y="12.6" width="9.2" height="2.2" rx=".6" />
      <path d="M5.8 14.8H18.2V19A2 2 0 0 1 16.2 21H7.8A2 2 0 0 1 5.8 19Z" />
      <path className="mlCat__tint" d="M7.6 17.6H16.4V18.6A.8.8 0 0 1 15.6 19.4H8.4A.8.8 0 0 1 7.6 18.6Z" />
      <ellipse className="mlCat__m mlCat__ripple" cx="13.3" cy="17.6" rx="2" ry=".5" />
    </>
  ),

  // Chocolate bar that lifts off one corner and settles.
  edibles: (
    <g className="mlCat__m mlCat__bar">
      <rect x="5.6" y="4" width="12.8" height="16.6" rx="1.8" />
      <path d="M12 4v16.6M5.6 9.5h12.8M5.6 15.1h12.8" strokeWidth="1.6" />
    </g>
  ),

  // Pump bottle: a short press, then a sheen sweeps across.
  topicals: (
    <>
      <g className="mlCat__m mlCat__pump">
        <path d="M12 7.8V4.6M9.4 4.6h5.4c1 0 1.7.5 2 1.5" />
      </g>
      <rect x="9.4" y="7.8" width="5.2" height="2.4" rx=".6" />
      <rect x="6.8" y="10.2" width="10.4" height="10.8" rx="2.4" />
      <g className="mlCat__m mlCat__sheen">
        <path d="M8.7 18.6 10.6 13" strokeWidth="1.6" strokeOpacity=".6" />
        <path d="M10.7 18.6 11.8 15.4" strokeWidth="1.1" strokeOpacity=".45" />
      </g>
    </>
  ),

  // Price tag hanging from a nail; swings and comes to rest.
  deals: (
    <>
      <circle cx="12" cy="2.4" r="1.1" fill="currentColor" stroke="none" />
      <g className="mlCat__m mlCat__tag">
        <path d="M12 3.4v5.4" strokeWidth="1.4" />
        <path d="M12 5.8 16.4 9.8V19.2A1.2 1.2 0 0 1 15.2 20.4H8.8A1.2 1.2 0 0 1 7.6 19.2V9.8Z" />
        <circle cx="12" cy="10" r="1.2" strokeWidth="1.6" />
        <path d="M13.9 13.2 10.1 18.2" strokeWidth="1.5" />
        <circle cx="10.4" cy="13.8" r="1" fill="currentColor" stroke="none" />
        <circle cx="13.6" cy="17.6" r="1" fill="currentColor" stroke="none" />
      </g>
    </>
  ),
};

type Props = {
  /** Category label as shown in the UI, e.g. "Pre-rolls" or "Pre-Rolls". */
  category: string;
  /** Rendered size in px. 18 to 22 sits well next to 14px text. */
  size?: number;
  /** Loop the motion forever (previews and reviews only). */
  demo?: boolean;
  className?: string;
};

export default function CategoryIcon({ category, size = 20, demo = false, className }: Props) {
  const kind = categoryIconKind(category);
  if (!kind) return null;

  return (
    <svg
      className={["mlCat", `mlCat--${kind}`, demo && "mlCat--demo", className]
        .filter(Boolean)
        .join(" ")}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[kind]}
    </svg>
  );
}
