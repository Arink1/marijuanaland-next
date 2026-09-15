"use client";

import { useEffect, useState } from "react";
import { btn } from "./ui";

type Library = { uploads: string[]; builtin: string[] };

function Grid({
  title,
  urls,
  selected,
  onChoose,
}: {
  title: string;
  urls: string[];
  selected: string[];
  onChoose: (url: string) => void;
}) {
  if (urls.length === 0) return null;
  return (
    <div className="mt-4">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-brand text-stone-warm">
        {title}
      </h4>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {urls.map((url) => {
          const on = selected.includes(url);
          return (
            <button
              key={url}
              type="button"
              onClick={() => onChoose(url)}
              aria-pressed={on}
              className={`relative aspect-square overflow-hidden rounded border-2 bg-cream transition ${
                on ? "border-orange" : "border-transparent hover:border-gold"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
              {on && (
                <span className="absolute right-1 top-1 rounded-full bg-orange px-1.5 text-xs font-bold text-white">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Mounted fresh each time the picker opens, so its state starts clean. */
function LibraryDialog({
  multiple,
  onClose,
  onPick,
}: {
  multiple: boolean;
  onClose: () => void;
  onPick: (urls: string[]) => void;
}) {
  const [lib, setLib] = useState<Library | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/admin/library")
      .then(async (r) => {
        if (!r.ok) throw new Error("Could not load your photos.");
        const data = (await r.json()) as Library;
        if (!cancelled) setLib(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const choose = (url: string) => {
    if (!multiple) {
      onPick([url]);
      onClose();
      return;
    }
    setSelected((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose a photo"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-t-lg bg-white shadow-2xl sm:rounded-lg"
      >
        <div className="flex items-center justify-between border-b border-beige px-5 py-3">
          <h3 className="text-base font-bold uppercase tracking-brand text-olive">
            {multiple ? "Choose photos" : "Choose a photo"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-2xl leading-none text-stone-warm">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {error && <p className="mt-4 text-sm text-orange-dark">{error}</p>}
          {!lib && !error && <p className="mt-4 text-sm text-stone-warm">Loading photos…</p>}
          {lib && (
            <>
              {lib.uploads.length === 0 && (
                <p className="mt-4 rounded bg-cream px-4 py-3 text-sm text-stone-warm">
                  No uploaded photos yet. Use the <strong>Upload photo</strong> button
                  to add your own; they will show up here.
                </p>
              )}
              <Grid title="Your uploads" urls={lib.uploads} selected={selected} onChoose={choose} />
              <Grid title="Photos that came with the site" urls={lib.builtin} selected={selected} onChoose={choose} />
            </>
          )}
        </div>

        {multiple && (
          <div className="flex items-center justify-between border-t border-beige px-5 py-3">
            <span className="text-sm text-stone-warm">{selected.length} selected</span>
            <button
              type="button"
              disabled={selected.length === 0}
              onClick={() => {
                onPick(selected);
                onClose();
              }}
              className={btn.primary}
            >
              Add selected
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Modal grid of every photo on the site. Single-pick by default; with
 * `multiple` the owner ticks several and adds them at once.
 */
export default function ImageLibrary({
  open,
  multiple = false,
  onClose,
  onPick,
}: {
  open: boolean;
  multiple?: boolean;
  onClose: () => void;
  onPick: (urls: string[]) => void;
}) {
  if (!open) return null;
  return <LibraryDialog multiple={multiple} onClose={onClose} onPick={onPick} />;
}
