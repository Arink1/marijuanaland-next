"use client";

import { useState } from "react";
import { uploadPrepared } from "@/lib/client/shrink";
import ImageLibrary from "./ImageLibrary";
import { btn, fieldLabel } from "./ui";

/** Thumbnail + "Upload photo" + "Choose" — replaces typing an image path. */
export default function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libOpen, setLibOpen] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadPrepared(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full sm:w-auto">
      <span className={fieldLabel}>{label}</span>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-beige bg-cream">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] text-stone-warm/60">
              No photo
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-[10px] font-bold text-olive">
              Uploading…
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={`${btn.subtle} cursor-pointer text-center`}>
            Upload photo
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => setLibOpen(true)}
            disabled={busy}
            className={btn.subtle}
          >
            Choose existing
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-orange-dark">{error}</p>}
      <ImageLibrary
        open={libOpen}
        onClose={() => setLibOpen(false)}
        onPick={(urls) => urls[0] && onChange(urls[0])}
      />
    </div>
  );
}
