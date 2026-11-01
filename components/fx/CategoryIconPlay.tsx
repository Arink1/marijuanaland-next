"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Longest one-shot in category-icon.css plus the widest stagger (8 items).
const PLAY_MS = 2600;
const WAVE_MS = PLAY_MS + 1300;

/**
 * Wraps a list of .mlCatHost links/buttons holding <CategoryIcon>s and adds the
 * touch-screen triggers: on devices without hover the icons play once, left to
 * right, when the list scrolls into view, and an icon replays when its item is
 * tapped. Mouse users get plain CSS :hover / :focus-visible, so this does
 * nothing for them. Renders one plain block <div> around the children.
 */
export default function CategoryIconPlay({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };

    let io: IntersectionObserver | undefined;
    if (window.matchMedia("(hover: none)").matches && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io?.disconnect();
          setInView(true);
          later(() => setInView(false), WAVE_MS);
        },
        { threshold: 0.6 },
      );
      io.observe(root);
    }

    // Tap replays that item's icon; the attribute outlives the brief :active.
    const tapTimers = new WeakMap<Element, number>();
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || !(e.target instanceof Element)) return;
      const host = e.target.closest(".mlCatHost");
      if (!host || !root.contains(host)) return;
      const prev = tapTimers.get(host);
      if (prev !== undefined) {
        window.clearTimeout(prev);
        timers.delete(prev);
      }
      host.removeAttribute("data-mlcat-tap");
      host.getBoundingClientRect(); // flush styles so the animation restarts
      host.setAttribute("data-mlcat-tap", "");
      tapTimers.set(host, later(() => host.removeAttribute("data-mlcat-tap"), PLAY_MS));
    };
    root.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      io?.disconnect();
      root.removeEventListener("pointerdown", onPointerDown);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `mlCatPlay ${className}` : "mlCatPlay"}
      data-mlcat-inview={inView ? "" : undefined}
    >
      {children}
    </div>
  );
}
