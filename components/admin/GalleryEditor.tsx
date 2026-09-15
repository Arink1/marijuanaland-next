"use client";

import { useState } from "react";
import { uploadPrepared } from "@/lib/client/shrink";
import type { GalleryImage, SectionMeta } from "@/lib/content";
import EditorFrame from "./EditorFrame";
import ImageLibrary from "./ImageLibrary";
import { btn, input } from "./ui";

/** Upload, drag to reorder, caption, remove. */
export default function GalleryEditor({
  initial,
  live,
  meta,
  storeReady,
  flash,
}: {
  initial: GalleryImage[];
  live: GalleryImage[];
  meta: SectionMeta;
  storeReady: boolean;
  flash?: string;
}) {
  const [items, setItems] = useState<GalleryImage[]>(() => initial.map((g) => ({ ...g })));
  const [libOpen, setLibOpen] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const add = (urls: string[]) =>
    setItems((prev) => [...prev, ...urls.map((src) => ({ src, caption: "" }))]);

  const uploadMany = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const list = Array.from(files);
    for (let i = 0; i < list.length; i++) {
      setProgress(`Uploading photo ${i + 1} of ${list.length}…`);
      try {
        add([await uploadPrepared(list[i])]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
        break;
      }
    }
    setProgress(null);
  };

  const move = (from: number, to: number) =>
    setItems((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });

  const setCaption = (i: number, caption: string) =>
    setItems((prev) => prev.map((g, idx) => (idx === i ? { ...g, caption } : g)));

  const remove = (i: number) => {
    if (!confirm("Remove this photo from the gallery?")) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  return (
    <EditorFrame
      section="gallery"
      title="Gallery"
      description="Photos on the Gallery page, in this order. Drag a photo to move it, or use the arrows on a phone."
      payload={JSON.stringify(items)}
      previewPath="/gallery"
      meta={meta}
      storeReady={storeReady}
      flash={flash}
      onReset={() => {
        if (confirm("Go back to the gallery that is on the live site now?")) {
          setItems(live.map((g) => ({ ...g })));
        }
      }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <label className={`${btn.primary} cursor-pointer`}>
          {progress ?? "Upload photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={Boolean(progress)}
            onChange={(e) => {
              void uploadMany(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <button type="button" onClick={() => setLibOpen(true)} className={btn.secondary}>
          Add from existing photos
        </button>
        <span className="text-sm text-stone-warm">
          {items.length} photo{items.length === 1 ? "" : "s"}
        </span>
      </div>
      {error && <p className="mt-2 text-sm text-orange-dark">{error}</p>}

      {items.length === 0 ? (
        <p className="mt-6 rounded border border-dashed border-beige px-4 py-8 text-center text-sm text-stone-warm">
          No photos yet. Upload some to fill the Gallery page.
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((g, i) => (
            <li
              key={`${g.src}-${i}`}
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom !== null) move(dragFrom, i);
                setDragFrom(null);
              }}
              onDragEnd={() => setDragFrom(null)}
              className={`rounded border bg-smoke p-2 ${
                dragFrom === i ? "border-orange opacity-60" : "border-beige/70"
              }`}
            >
              <div className="relative aspect-square cursor-grab overflow-hidden rounded bg-cream active:cursor-grabbing">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt="" className="h-full w-full object-cover" />
                <span className="absolute left-1.5 top-1.5 rounded bg-ink/70 px-1.5 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <input
                value={g.caption}
                onChange={(e) => setCaption(i, e.target.value)}
                placeholder="Caption (optional)"
                className={`${input} mt-2`}
              />
              <div className="mt-2 flex justify-between gap-1">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move earlier" className={btn.subtle}>
                    ←
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label="Move later" className={btn.subtle}>
                    →
                  </button>
                </div>
                <button type="button" onClick={() => remove(i)} className={btn.danger}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ImageLibrary
        open={libOpen}
        multiple
        onClose={() => setLibOpen(false)}
        onPick={add}
      />
    </EditorFrame>
  );
}
