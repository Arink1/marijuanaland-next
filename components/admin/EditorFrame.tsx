"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import {
  discardChanges,
  publishContent,
  undoPublish,
  type ActionState,
} from "@/app/admin/actions";
import type { ContentKey, SectionMeta } from "@/lib/content";
import { btn, card } from "./ui";

/**
 * Wraps every editor with the same three-step flow:
 * Preview on site → Publish to live site → Undo last publish.
 */
export default function EditorFrame({
  section,
  title,
  description,
  payload,
  previewPath,
  meta,
  storeReady,
  flash,
  problem,
  onReset,
  children,
}: {
  section: ContentKey;
  title: string;
  description: string;
  /** JSON of the current editor state. */
  payload: string;
  /** Public page that shows this section; opened by "Preview on site". */
  previewPath: string;
  meta: SectionMeta;
  storeReady: boolean;
  flash?: string;
  /** Something the owner must fix first; blocks Preview and Publish while set. */
  problem?: string | null;
  onReset: () => void;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pub, publishAction, publishing] = useActionState<ActionState, FormData>(
    publishContent,
    {},
  );
  const [undo, undoAction, undoing] = useActionState<ActionState, FormData>(
    undoPublish,
    {},
  );
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const busy = publishing || undoing || previewing;
  const blocked = !storeReady || busy || Boolean(problem);

  // Saves a draft, gets the Draft Mode cookie back, then opens the page.
  // The tab is opened synchronously in the click so popup blockers allow it.
  const preview = async () => {
    const tab = window.open("", "_blank");
    setPreviewing(true);
    setPreviewError(null);
    try {
      const res = await fetch("/admin/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          value: JSON.parse(payload),
          path: previewPath,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        path?: string;
        error?: string;
      };
      if (!res.ok || !data.path) {
        throw new Error(data.error || "Could not start the preview.");
      }
      if (tab) tab.location.href = data.path;
      else window.location.href = data.path;
      router.refresh(); // picks up the "unpublished changes" badge
    } catch (e) {
      tab?.close();
      setPreviewError(e instanceof Error ? e.message : "Could not start the preview.");
    } finally {
      setPreviewing(false);
    }
  };

  const publishedAt = meta.publishedAt
    ? new Date(meta.publishedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <section className={card}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-brand text-olive">
            {title}
          </h2>
          <p className="mt-1 text-sm text-stone-warm">{description}</p>
        </div>
        {publishedAt && (
          <p className="text-xs text-stone-warm/80">Last published {publishedAt}</p>
        )}
      </div>

      {flash && (
        <p role="status" className="mt-4 rounded border border-olive/40 bg-olive/10 px-4 py-3 text-sm font-semibold text-olive">
          {flash}
        </p>
      )}

      {meta.hasDraft && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded border border-gold/60 bg-cream px-4 py-3 text-sm">
          <p>
            <strong className="font-bold text-olive">Unpublished changes.</strong>{" "}
            You previewed changes here that are not on the live site yet. They
            are loaded below — publish them or throw them away.
          </p>
          <form action={discardChanges}>
            <input type="hidden" name="section" value={section} />
            <button type="submit" className={btn.danger}>
              Throw away changes
            </button>
          </form>
        </div>
      )}

      <form
        action={publishAction}
        className="mt-5"
        onKeyDown={(e) => {
          // Enter in a text box would submit (publish); only the button should.
          const t = e.target as HTMLInputElement;
          if (e.key === "Enter" && t.tagName === "INPUT" && t.type !== "file") e.preventDefault();
        }}
      >
        <input type="hidden" name="section" value={section} />
        <input type="hidden" name="payload" value={payload} />

        {children}

        <div className="sticky bottom-0 -mx-5 mt-6 border-t border-beige bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={preview}
              disabled={blocked}
              className={btn.secondary}
              title="Opens the site in a new tab showing these changes. Only you can see them."
            >
              {previewing ? "Opening preview…" : "Preview on site"}
            </button>
            <button
              type="submit"
              disabled={blocked}
              className={btn.primary}
            >
              {publishing ? "Publishing…" : "Publish to live site"}
            </button>
            <button
              type="submit"
              formAction={undoAction}
              disabled={!storeReady || busy || !meta.canUndo}
              onClick={(e) => {
                if (
                  !confirm(
                    "Put the previously published version of this section back on the live site?",
                  )
                )
                  e.preventDefault();
              }}
              className={btn.subtle}
              title={
                meta.canUndo
                  ? "Swap the live site back to the version before your last publish"
                  : "Nothing to undo yet"
              }
            >
              {undoing ? "Undoing…" : "Undo last publish"}
            </button>
            <button type="button" onClick={onReset} className={btn.link}>
              Start over
            </button>
          </div>

          {problem && (
            <p role="alert" className="mt-3 text-sm font-semibold text-orange-dark">
              {problem}
            </p>
          )}
          {(pub.error || undo.error || previewError) && (
            <p role="alert" className="mt-3 text-sm font-semibold text-orange-dark">
              {pub.error || undo.error || previewError}
            </p>
          )}
          {pub.ok && (
            <p role="status" className="mt-3 text-sm font-semibold text-olive">
              {pub.ok}
            </p>
          )}
          {!storeReady && (
            <p className="mt-3 text-xs text-stone-warm">
              Previewing and publishing are turned off until storage is connected.
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
