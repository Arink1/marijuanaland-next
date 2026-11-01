"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useMediaQuery } from "@/lib/client/hooks";

export type Device = "desktop" | "phone";

/** Design widths: the narrowest desktop the site lays out for, and a typical phone. */
export const DEVICE_WIDTH: Record<Device, number> = { desktop: 1024, phone: 390 };

/** Desktop by default; phone when the admin itself is open on a phone. */
export function useDevice(): [Device, (d: Device) => void] {
  const [choice, setChoice] = useState<Device | null>(null);
  const narrow = useMediaQuery("(max-width: 1023px)");
  return [choice ?? (narrow ? "phone" : "desktop"), setChoice];
}

export function DeviceToggle({
  value,
  onChange,
}: {
  value: Device;
  onChange: (d: Device) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Preview size"
      className="inline-flex overflow-hidden rounded border border-beige text-xs font-semibold"
    >
      {(["desktop", "phone"] as Device[]).map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          aria-pressed={value === d}
          className={`px-3 py-1.5 transition ${
            value === d ? "bg-olive text-white" : "bg-white text-stone-warm hover:bg-cream"
          }`}
        >
          {d === "desktop" ? "Desktop" : "Phone"}
        </button>
      ))}
    </div>
  );
}

/**
 * Lays its children out at a fixed design width (a 1024px desktop, a 390px
 * phone) and shrinks the whole thing to fit the box it is in, so the admin
 * sees the page's real layout at any window size.
 */
export default function ScaledPreview({
  width,
  children,
  className = "",
}: {
  width: number;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / width));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <div
        className="mx-auto"
        style={{
          width,
          zoom: scale ?? 1,
          // Hidden until measured so the first paint is not a 1024px-wide flash.
          visibility: scale === null ? "hidden" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
