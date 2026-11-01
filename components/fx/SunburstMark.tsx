/**
 * SunburstMark: the Marijuana Land emblem (ring, seven-ray sun, five-blade leaf)
 * as an inline SVG with three motion modes. Pure CSS, no JS, hydration-safe,
 * honours prefers-reduced-motion. Decorative: give the wrapper a label if the
 * mark stands in for the brand name.
 *
 *   <SunburstMark mode="intro" size={96} />   sunrise reveal (~2s), then idles
 *   <SunburstMark mode="idle" />              slow ray shimmer, breathing leaf
 *   <SunburstMark mode="spinner" size={18} /> loading state for buttons
 *
 * pose="sunrise" (default) is the age-gate badge layout: sun on top, leaf below.
 * pose="emblem" matches the header logo and favicon: leaf on top, rays fanning down.
 * Colour is currentColor: cream by default (the spinner inherits the text colour);
 * override with any text-* class.
 */
import "./sunburst-mark.css";

type Props = {
  mode?: "intro" | "idle" | "spinner";
  pose?: "sunrise" | "emblem";
  /** Square size, px or any CSS length. Defaults to 120 (spinner: 1em). */
  size?: number | string;
  /** Seconds before the intro (or idle loop) starts. */
  delay?: number;
  className?: string;
};

// Traced from public/images/logo-emblem-512.png onto a 100-unit box (emblem pose).
const RAY_ANGLES = [198, 162, 126, 90, 54, 18, -18]; // fan order, left to right
const HUB = "M50 46.58L62.08 42.66A14.14 14.14 0 1 1 37.92 42.66Z"; // sun disc under the chevron horizon
// Two half rings that start at the bottom and overlap slightly at both ends (no seam).
const RING = [
  "M49.19 96.67A46.68 46.68 0 1 0 49.19 3.33",
  "M50.81 96.67A46.68 46.68 0 1 1 50.81 3.33",
];
const BLADES = [
  ["c", "M51.03 35.64C53.25 28.73 53.25 24.13 53.25 20.3C53.25 15.3 52.53 13.19 50 9.19C47.47 13.19 46.75 15.3 46.75 20.3C46.75 24.13 46.75 28.73 48.97 35.64Z"],
  ["sl", "M49.77 35.9C47.55 30.13 45.07 27.1 43 24.58C38.46 19.03 36.3 18.27 32.44 16.37C33.36 20.68 33.56 23.04 38.11 28.59C40.17 31.11 42.65 34.14 48.18 37.2Z"],
  ["sr", "M51.82 37.2C57.35 34.14 59.83 31.11 61.89 28.59C66.44 23.04 66.64 20.68 67.56 16.37C63.7 18.27 61.54 19.03 57 24.58C54.93 27.1 52.45 30.13 50.23 35.9Z"],
  ["fl", "M50.17 34.96C45.3 32.71 42.77 32.4 40.24 32.09C32.65 31.17 29.43 32.3 24.69 33.24C29.03 35.61 31.84 37.79 39.44 38.71C41.97 39.02 44.5 39.33 49.83 37.68Z"],
  ["fr", "M50.17 37.68C55.5 39.33 58.03 39.02 60.56 38.71C68.16 37.79 70.97 35.61 75.31 33.24C70.57 32.3 67.35 31.17 59.76 32.09C57.23 32.4 54.7 32.71 49.83 34.96Z"],
] as const;

export default function SunburstMark({
  mode = "idle",
  pose = "sunrise",
  size,
  delay,
  className,
}: Props) {
  const dim = size ?? (mode === "spinner" ? "1em" : 120);
  const sunrise = pose === "sunrise";

  return (
    <svg
      viewBox="0 0 100 100"
      width={dim}
      height={dim}
      className={["sbm", `sbm--${mode}`, className].filter(Boolean).join(" ")}
      style={
        delay !== undefined
          ? ({ ["--sbm-delay" as string]: `${delay}s` } as React.CSSProperties)
          : undefined
      }
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth={3.76}>
        {RING.map((d) => (
          <path key={d} className="sbm__arc" d={d} pathLength={1} />
        ))}
      </g>

      {/* sunrise flips the sun so the rays fan upward; the leaf is never flipped */}
      <g transform={sunrise ? "matrix(1 0 0 -1 0 100)" : undefined}>
        <g className="sbm__core">
          <path className="sbm__hub" d={HUB} />
          {RAY_ANGLES.map((angle, i) => (
            <g key={angle} transform={`rotate(${angle} 50 50)`}>
              <rect
                className="sbm__ray"
                x={50}
                y={46.75}
                width={41.38}
                height={6.5}
                rx={1.6}
                style={
                  {
                    "--i": i, // shimmer order, left to right
                    "--r": Math.abs(i - 3), // intro order, centre ray first
                    "--s": sunrise ? i : 6 - i, // spinner slot, clockwise
                  } as React.CSSProperties
                }
              />
            </g>
          ))}
        </g>
      </g>

      <g transform={sunrise ? "translate(0 50.16)" : undefined}>
        <g className="sbm__sprout">
          <circle cx={50} cy={34.95} r={2.74} />
          {BLADES.map(([id, d]) => (
            <path key={id} className={`sbm__blade sbm__blade--${id}`} d={d} />
          ))}
        </g>
      </g>
    </svg>
  );
}
