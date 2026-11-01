/**
 * HeroSmoke: slow, soft smoke wisps drifting behind the homepage hero headline.
 *
 * Pure CSS motion (transform + opacity only). Each wisp is static SVG: soft
 * radial-gradient "puffs" strung along a hand-drawn centerline make the body, a
 * denser strand weaving through it reads as a fold, and thin stroked filaments
 * cross over it. No CSS filters, no blur, no JS per frame. The geometry is plain
 * deterministic math, computed once at module load.
 *
 * Designed for the dark photo hero. Place it between the overlay and the content:
 *   <HeroSmoke />
 */

import { useId } from "react";
import "./hero-smoke.css";

type Pt = readonly [number, number];

/** [sideways reach in ribbon widths, turns along the ribbon, phase, stroke width] */
type ThreadSpec = readonly [number, number, number, number];

type Plume = {
  /** centerline, source first (Catmull-Rom through these points) */
  pts: Pt[];
  /** width at the source, at its fullest, and at the tip (viewBox units) */
  w: readonly [number, number, number];
  a?: number;
  /** 0..1 along the ribbon where it starts to dissipate (default 0.7) */
  fade?: number;
  /** varies the wobble so no two ribbons match */
  seed: number;
  threads?: ThreadSpec[];
};

type Wisp = {
  id: string;
  vb: readonly [number, number];
  plumes: Plume[];
};

const WISPS: Wisp[] = [
  // bottom left: rises, leans right, hooks back over itself
  {
    id: "a",
    vb: [640, 440],
    plumes: [
      {
        pts: [[60, 470], [90, 392], [76, 326], [112, 268], [190, 236], [282, 232], [356, 210], [396, 166], [384, 116], [338, 96], [298, 118], [300, 158]],
        w: [22, 72, 26],
        seed: 1,
        threads: [[0.32, 1.6, 0.4, 2], [-0.38, 1.1, 2.2, 1.4]],
      },
      {
        pts: [[150, 472], [204, 404], [284, 376], [382, 362], [470, 322], [544, 266], [640, 242]],
        w: [18, 64, 50],
        a: 0.7,
        seed: 2,
        threads: [[0.3, 1.3, 1.2, 1.5]],
      },
    ],
  },
  // bottom right: rises, drifts left in a lazy S
  {
    id: "b",
    vb: [640, 440],
    plumes: [
      {
        pts: [[566, 470], [542, 396], [566, 336], [540, 282], [470, 250], [396, 240], [340, 214], [316, 168], [336, 124], [384, 116], [408, 150], [388, 184]],
        w: [20, 70, 26],
        seed: 3,
        threads: [[-0.34, 1.5, 0.9, 1.9], [0.4, 0.9, 3.1, 1.3]],
      },
      {
        pts: [[476, 472], [432, 412], [352, 394], [262, 382], [180, 344], [114, 300], [10, 292]],
        w: [16, 60, 46],
        a: 0.65,
        seed: 4,
        threads: [[0.28, 1.2, 0.2, 1.4]],
      },
    ],
  },
  // left edge: a single tendril climbing and curling
  {
    id: "c",
    vb: [360, 520],
    plumes: [
      {
        pts: [[46, 550], [74, 452], [52, 372], [92, 302], [154, 252], [172, 192], [144, 132], [154, 72], [206, 38], [260, 54], [268, 100], [234, 118]],
        w: [14, 48, 20],
        a: 0.85,
        seed: 5,
        threads: [[0.36, 1.4, 1.7, 1.5], [-0.3, 0.8, 0.3, 1.1]],
      },
    ],
  },
  // upper right: a long low-contrast band drifting left
  {
    id: "d",
    vb: [460, 300],
    plumes: [
      {
        pts: [[490, 214], [404, 172], [322, 182], [242, 150], [170, 110], [92, 120], [0, 90]],
        w: [30, 62, 52],
        a: 0.7,
        fade: 0.5,
        seed: 6,
        threads: [[0.34, 1.2, 0.6, 1.3]],
      },
    ],
  },
  // low haze under the button: wide, flat, faint
  {
    id: "e",
    vb: [900, 220],
    plumes: [
      {
        pts: [[-30, 186], [150, 152], [320, 172], [482, 140], [642, 160], [800, 122], [930, 132]],
        w: [54, 70, 64],
        a: 0.5,
        fade: 0.55,
        seed: 7,
        threads: [[0.3, 1.8, 2.4, 1.2]],
      },
    ],
  },
];

/* ---- geometry (runs once, at module load) ---- */

const r = Math.round;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Catmull-Rom spline through pts, densely sampled, with running arc length. */
function sample(pts: Pt[]) {
  const s: { x: number; y: number; len: number }[] = [];
  const push = (x: number, y: number) => {
    const p = s[s.length - 1];
    s.push({ x, y, len: p ? p.len + Math.hypot(x - p.x, y - p.y) : 0 });
  };
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 16; k++) {
      const t = k / 16;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
      push(f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]));
    }
  }
  const end = pts[pts.length - 1];
  push(end[0], end[1]);
  const total = s[s.length - 1].len;
  /** point, unit normal and heading at normalized arc length u */
  const at = (u: number) => {
    const d = u * total;
    let lo = 1;
    let hi = s.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (s[mid].len < d) lo = mid + 1;
      else hi = mid;
    }
    const j = lo;
    const a = s[j - 1];
    const b = s[j];
    const k = b.len > a.len ? Math.min(1, (d - a.len) / (b.len - a.len)) : 0;
    const seg = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return {
      x: a.x + (b.x - a.x) * k,
      y: a.y + (b.y - a.y) * k,
      nx: -(b.y - a.y) / seg,
      ny: (b.x - a.x) / seg,
      deg: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
    };
  };
  return { at, total };
}

/** Same spline as cubic Bezier path data. */
function path(pts: Pt[]): string {
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += `C${r(p1[0] + (p2[0] - p0[0]) / 6)} ${r(p1[1] + (p2[1] - p0[1]) / 6)} ${r(p2[0] - (p3[0] - p1[0]) / 6)} ${r(p2[1] - (p3[1] - p1[1]) / 6)} ${r(p2[0])} ${r(p2[1])}`;
  }
  return d;
}

type Puff = { x: number; y: number; rx: number; ry: number; deg: number; o: number };
type Strand = { d: string; w: number; x1: number; y1: number; x2: number; y2: number };

function build(p: Plume) {
  const { at, total } = sample(p.pts);
  const fade = p.fade ?? 0.7;
  const [w0, w1, w2] = p.w;
  // swells as it rises, then thins into the curl so the hook stays legible
  const width = (u: number) =>
    (u < 0.55 ? w0 + (w1 - w0) * smooth(0, 0.55, u) : w1 + (w2 - w1) * smooth(0.55, 1, u)) *
    (1 + 0.18 * Math.sin((u * 2.3 + p.seed * 0.37) * Math.PI * 2));
  const life = (u: number) => smooth(0, 0.16, u) * (1 - smooth(fade, 1, u));

  const puffs: Puff[] = [];
  // body, then a narrower, denser strand that drifts from one edge to the other (the fold)
  for (const fold of [false, true]) {
    for (let d = 0; d <= total; ) {
      const u = d / total;
      const q = at(u);
      const w = width(u);
      const side = fold
        ? w * 0.3 * Math.sin((u * 1.15 + p.seed * 0.21) * Math.PI * 2)
        : w * 0.12 * Math.sin(u * 23 + p.seed * 2.1); // roughens the edges so it never reads as a tube
      const o = (p.a ?? 1) * life(u) * (fold ? smooth(0.1, 0.3, u) * (1 - smooth(0.55, 0.85, u)) * 0.9 : 1);
      if (o > 0.03) {
        puffs.push({
          x: q.x + q.nx * side,
          y: q.y + q.ny * side,
          rx: w * (fold ? 0.85 : 1),
          ry: w * (fold ? 0.2 : 0.5),
          deg: q.deg,
          o,
        });
      }
      d += Math.max(6, w * (fold ? 0.5 : 0.58));
    }
  }

  const threads: Strand[] = (p.threads ?? []).map(([reach, turns, ph, sw]) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 12; i++) {
      const u = 0.03 + (i / 12) * 0.93;
      const q = at(u);
      const off = width(u) * reach * Math.sin(u * turns * Math.PI * 2 + ph);
      pts.push([q.x + q.nx * off, q.y + q.ny * off]);
    }
    return strand(pts, sw);
  });
  return { puffs, threads };
}

/** Filament with its fade running from the start to its farthest point. */
function strand(pts: Pt[], w: number): Strand {
  const [x1, y1] = pts[0];
  let far = pts[0];
  for (const q of pts) if (Math.hypot(q[0] - x1, q[1] - y1) > Math.hypot(far[0] - x1, far[1] - y1)) far = q;
  return { d: path(pts), w, x1: r(x1), y1: r(y1), x2: r(far[0]), y2: r(far[1]) };
}

const BUILT = WISPS.map((wisp) => {
  const parts = wisp.plumes.map(build);
  return {
    id: wisp.id,
    vb: wisp.vb,
    puffs: parts.flatMap((p) => p.puffs),
    threads: parts.flatMap((p) => p.threads),
  };
});

export default function HeroSmoke({ className }: { className?: string }) {
  const uid = useId();
  return (
    <div className={["mlSmoke", className].filter(Boolean).join(" ")} aria-hidden="true">
      {BUILT.map((w) => {
        const id = `${uid}${w.id}`;
        const vb = `0 0 ${w.vb[0]} ${w.vb[1]}`;
        return (
          <div
            key={w.id}
            className={`mlSmoke__wisp mlSmoke__wisp--${w.id}`}
            style={{ aspectRatio: `${w.vb[0]} / ${w.vb[1]}` }}
          >
            {/* two layers that sway against each other, so the smoke appears to fold */}
            <div className="mlSmoke__curl">
              <svg viewBox={vb} focusable="false">
                <defs>
                  <radialGradient id={`${id}p`}>
                    <stop offset="0" stopColor="#fff8ea" stopOpacity="0.55" />
                    <stop offset="0.35" stopColor="#fff4dd" stopOpacity="0.4" />
                    <stop offset="0.7" stopColor="#fee7c1" stopOpacity="0.12" />
                    <stop offset="1" stopColor="#fee7c1" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <g fill={`url(#${id}p)`}>
                  {w.puffs.map((q, i) => (
                    <ellipse
                      key={i}
                      cx={r(q.x)}
                      cy={r(q.y)}
                      rx={r(q.rx)}
                      ry={r(q.ry)}
                      transform={`rotate(${r(q.deg)} ${r(q.x)} ${r(q.y)})`}
                      opacity={r(q.o * 100) / 100}
                    />
                  ))}
                </g>
              </svg>
            </div>
            <div className="mlSmoke__curl mlSmoke__curl--1">
              <svg viewBox={vb} focusable="false">
                <defs>
                  {w.threads.map((t, i) => (
                    <linearGradient key={i} id={`${id}g${i}`} gradientUnits="userSpaceOnUse" x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}>
                      <stop offset="0" stopColor="#fff8ea" stopOpacity="0" />
                      <stop offset="0.2" stopColor="#fff8ea" />
                      <stop offset="0.6" stopColor="#fff4dd" stopOpacity="0.7" />
                      <stop offset="1" stopColor="#fff4dd" stopOpacity="0" />
                    </linearGradient>
                  ))}
                </defs>
                {w.threads.map((t, i) => (
                  <g key={i} fill="none" stroke={`url(#${id}g${i})`} strokeLinecap="round">
                    {/* halo, glow, core: stacked strokes give a soft falloff without blur */}
                    <path d={t.d} strokeWidth={t.w * 7} opacity="0.07" />
                    <path d={t.d} strokeWidth={t.w * 3} opacity="0.16" />
                    <path d={t.d} strokeWidth={t.w} opacity="0.65" />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
