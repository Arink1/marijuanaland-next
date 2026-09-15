"use client";

import { useState } from "react";
import type { Notice, SectionMeta } from "@/lib/content";
import { shortDate, todayLocal } from "@/lib/schedule";
import EditorFrame from "./EditorFrame";
import { btn, fieldLabel, input } from "./ui";

const PRESETS: { label: string; message: string }[] = [
  { label: "Closed today", message: "We are closed today. See you tomorrow!" },
  { label: "Closing early", message: "Closing early today at 5pm." },
  { label: "Holiday hours", message: "Holiday hours: open 10am to 6pm." },
  { label: "Weather", message: "Closed today due to weather. Stay safe!" },
];

/** One switch, one message, one optional end date. */
export default function NoticeEditor({
  initial,
  live,
  meta,
  storeReady,
  flash,
}: {
  initial: Notice;
  live: Notice;
  meta: SectionMeta;
  storeReady: boolean;
  flash?: string;
}) {
  const [notice, setNotice] = useState<Notice>({ ...initial });
  const set = (patch: Partial<Notice>) => setNotice((n) => ({ ...n, ...patch }));
  const today = todayLocal();
  const expired = Boolean(notice.until) && notice.until < today;

  return (
    <EditorFrame
      section="notice"
      title="Hours notice"
      description="A bright banner across the top of every page for closures, holiday hours or weather. Turn it on, type the message, publish."
      payload={JSON.stringify(notice)}
      previewPath="/"
      meta={meta}
      storeReady={storeReady}
      flash={flash}
      onReset={() => setNotice({ ...live })}
    >
      <label className="flex cursor-pointer items-center gap-3 rounded border border-beige bg-smoke px-4 py-3">
        <input
          type="checkbox"
          role="switch"
          checked={notice.enabled}
          onChange={(e) => set({ enabled: e.target.checked })}
          className="h-5 w-5 accent-olive"
        />
        <span className="font-semibold">
          {notice.enabled ? "Notice is ON" : "Notice is OFF"}
        </span>
        <span className="text-sm text-stone-warm">
          {notice.enabled
            ? "Visitors will see the banner once you publish."
            : "Nothing is shown on the site."}
        </span>
      </label>

      <div className="mt-4">
        <span className={fieldLabel}>Quick fill</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => set({ enabled: true, message: p.message })}
              className={btn.subtle}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-4 block">
        <span className={fieldLabel}>Message</span>
        <textarea
          value={notice.message}
          onChange={(e) => set({ message: e.target.value.slice(0, 160) })}
          rows={2}
          maxLength={160}
          placeholder="e.g. Closed Thanksgiving Day. Back Friday at 9am."
          className={input}
        />
        <span className="mt-0.5 block text-[11px] text-stone-warm/70">
          {notice.message.length}/160 characters
        </span>
      </label>

      <label className="mt-4 block sm:w-64">
        <span className={fieldLabel}>Hide automatically after (optional)</span>
        <input
          type="date"
          value={notice.until}
          min={today}
          onChange={(e) => set({ until: e.target.value })}
          className={input}
        />
        <span className="mt-0.5 block text-[11px] text-stone-warm/70">
          {notice.until
            ? expired
              ? "That date has passed, so the banner is hidden."
              : `Shows through the end of ${shortDate(notice.until)}, then disappears on its own.`
            : "Leave blank to keep it up until you switch it off."}
        </span>
      </label>

      <div className="mt-6">
        <span className={fieldLabel}>How it will look</span>
        {notice.enabled && notice.message.trim() && !expired ? (
          <div className="rounded bg-gold px-4 py-2.5 text-center text-sm font-bold text-ink">
            {notice.message}
          </div>
        ) : (
          <div className="rounded border border-dashed border-beige px-4 py-2.5 text-center text-sm text-stone-warm/70">
            Banner is hidden
          </div>
        )}
      </div>
    </EditorFrame>
  );
}
