"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { exitPreview, publishPreview } from "@/app/admin/actions";

export default function PreviewBarClient() {
  const path = usePathname();
  return (
    <aside
      role="status"
      className="fixed inset-x-0 bottom-0 z-100 border-t-4 border-gold bg-ink px-4 py-3 text-white shadow-2xl"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          <strong className="font-bold text-gold">Preview mode.</strong> You are
          seeing unpublished changes. Only you can see this.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <form action={publishPreview}>
            <input type="hidden" name="path" value={path} />
            <button
              type="submit"
              className="rounded bg-orange px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-dark"
            >
              Looks good, publish
            </button>
          </form>
          <Link
            href="/admin"
            className="rounded border border-white/40 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          >
            Keep editing
          </Link>
          <form action={exitPreview}>
            <input type="hidden" name="path" value={path} />
            <button
              type="submit"
              className="px-2 py-2 text-sm text-white/70 underline hover:text-white"
            >
              Exit preview
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
