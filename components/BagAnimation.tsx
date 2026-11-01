/* eslint-disable @next/next/no-img-element */
/**
 * BagAnimation — Marijuana Land products rising out of the shop bag.
 *
 * Pure CSS animation (transform + opacity only, GPU-composited). No JS per frame,
 * no canvas, no video, no GIF. Runs at the device's native framerate, stays sharp
 * on retina, respects prefers-reduced-motion. Total weight ≈ 60 KB (three PNGs).
 *
 * Designed against a BLACK page background.
 *
 * Usage:
 *   import BagAnimation from '@/components/BagAnimation';
 *   <BagAnimation size={420} />
 *
 * Leave `size` off to size it from CSS instead: give the wrapper a width/height
 * and a matching --scale (rendered px / 500) through className.
 */

import './bag-animation.css';

type Props = {
  /** Rendered square size in px. Design size is 500; anything else scales cleanly.
   *  Omit to size from className (width, height and --scale). */
  size?: number;
  /** Full loop length. 7.5–9s reads best. */
  loopSeconds?: number;
  /** Show the small packaging labels (GUMMIES / FLOWER / VAPE · 1G). */
  labels?: boolean;
  className?: string;
};

export default function BagAnimation({
  size,
  loopSeconds = 8,
  labels = true,
  className,
}: Props) {
  return (
    <div
      className={['bagAnim', className].filter(Boolean).join(' ')}
      style={
        {
          ...(size !== undefined && {
            width: size,
            height: size,
            ['--scale' as string]: size / 500,
          }),
          ['--loop' as string]: `${loopSeconds}s`,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <div className="bagAnim__stage">
        {/* products sit behind the bag; clipped so they vanish at the bag mouth */}
        <div className="bagAnim__behind">
          {/* 1 — gummy tin (first out, first back in) */}
          <div className="bagAnim__slot bagAnim__slot--left">
            <div className="bagAnim__tin">
              <div className="bagAnim__tinRing" />
              <div className="bagAnim__tinLid" />
              <img className="bagAnim__tinMark" src="/bag-animation/ml-logo-mark.png" alt="" />
              {labels && (
                <>
                  <div className="bagAnim__tinTop">GUMMIES</div>
                  <div className="bagAnim__tinBottom">10 × 5 MG</div>
                </>
              )}
            </div>
          </div>

          {/* 2 — flower pouch */}
          <div className="bagAnim__slot bagAnim__slot--mid">
            <div className="bagAnim__pouch">
              <div className="bagAnim__pouchSeal" />
              <div className="bagAnim__pouchHang" />
              <img className="bagAnim__pouchMark" src="/bag-animation/ml-logo-mark.png" alt="" />
              {labels && (
                <div className="bagAnim__pouchCopy">
                  <div className="bagAnim__pouchTitle">FLOWER</div>
                  <div className="bagAnim__pouchSub">WHOLE BUD · 3.5 G</div>
                </div>
              )}
              <img className="bagAnim__pouchWord" src="/bag-animation/ml-logo-word.png" alt="" />
              <div className="bagAnim__pouchEdge" />
            </div>
          </div>

          {/* 3 — vape pen (last out, last back in) */}
          <div className="bagAnim__slot bagAnim__slot--right">
            <div className="bagAnim__pen">
              <div className="bagAnim__penCap" />
              <div className="bagAnim__penBand" />
              <img className="bagAnim__penMark" src="/bag-animation/ml-logo-mark.png" alt="" />
              {labels && <div className="bagAnim__penLabel">VAPE · 1G</div>}
              <div className="bagAnim__penLine" />
              <div className="bagAnim__penEdge" />
            </div>
          </div>
        </div>

        {/* the bag — drawn over the products */}
        <img className="bagAnim__bag" src="/bag-animation/bag.png" alt="" />
      </div>
    </div>
  );
}
