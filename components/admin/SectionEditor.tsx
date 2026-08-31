"use client";

import { useActionState, useState } from "react";
import { saveContent, type ActionState } from "@/app/admin/actions";

export type FieldSpec = {
  name: string;
  label: string;
  width?: "xs" | "sm" | "md" | "lg";
  hint?: string;
  options?: string[];
  multiline?: boolean;
};

type Row = Record<string, string>;

const WIDTH: Record<string, string> = {
  xs: "w-24",
  sm: "w-40",
  md: "w-64",
  lg: "flex-1 min-w-64",
};

export default function SectionEditor({
  section,
  title,
  description,
  fields,
  rows,
  rowLabel,
  fixedLength = false,
  singleObject = false,
}: {
  section: string;
  title: string;
  description: string;
  fields: FieldSpec[];
  rows: unknown;
  rowLabel: string;
  fixedLength?: boolean;
  singleObject?: boolean;
}) {
  const initial: Row[] = singleObject
    ? [{ ...(rows as Row) }]
    : (rows as Row[]).map((r) => ({ ...r }));

  const [items, setItems] = useState<Row[]>(initial);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveContent,
    {},
  );

  const update = (i: number, name: string, value: string) =>
    setItems((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [name]: value } : row)),
    );

  const addRow = () =>
    setItems((prev) => [
      ...prev,
      Object.fromEntries(
        fields.map((f) => [f.name, f.options ? f.options[0] : ""]),
      ) as Row,
    ]);

  const removeRow = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const payload = JSON.stringify(singleObject ? items[0] : items);

  return (
    <section className="rounded-lg border border-beige bg-white p-5">
      <h2 className="text-lg font-bold uppercase tracking-brand text-olive">
        {title}
      </h2>
      <p className="mt-1 text-sm text-stone-warm">{description}</p>

      <form action={formAction} className="mt-5">
        <input type="hidden" name="section" value={section} />
        <input type="hidden" name="payload" value={payload} />

        <div className="space-y-4">
          {items.map((row, i) => (
            <div
              key={i}
              className="rounded border border-beige/70 bg-smoke p-3"
            >
              {!singleObject && (
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-brand text-stone-warm">
                    {rowLabel} {i + 1}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move ${rowLabel} ${i + 1} up`}
                      className="rounded border border-beige px-2 py-0.5 text-xs disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === items.length - 1}
                      aria-label={`Move ${rowLabel} ${i + 1} down`}
                      className="rounded border border-beige px-2 py-0.5 text-xs disabled:opacity-40"
                    >
                      ↓
                    </button>
                    {!fixedLength && (
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        aria-label={`Remove ${rowLabel} ${i + 1}`}
                        className="rounded border border-orange/50 px-2 py-0.5 text-xs text-orange-dark"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {fields.map((f) => (
                  <label key={f.name} className={WIDTH[f.width ?? "sm"]}>
                    <span className="mb-1 block text-xs font-semibold text-stone-warm">
                      {f.label}
                    </span>
                    {f.options ? (
                      <select
                        value={row[f.name] ?? ""}
                        onChange={(e) => update(i, f.name, e.target.value)}
                        className="w-full rounded border border-beige bg-white px-2 py-1.5 text-sm"
                      >
                        {f.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : f.multiline ? (
                      <textarea
                        value={row[f.name] ?? ""}
                        onChange={(e) => update(i, f.name, e.target.value)}
                        rows={2}
                        className="w-full rounded border border-beige bg-white px-2 py-1.5 text-sm"
                      />
                    ) : (
                      <input
                        value={row[f.name] ?? ""}
                        onChange={(e) => update(i, f.name, e.target.value)}
                        className="w-full rounded border border-beige bg-white px-2 py-1.5 text-sm"
                      />
                    )}
                    {f.hint && (
                      <span className="mt-0.5 block text-[11px] text-stone-warm/70">
                        {f.hint}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!fixedLength && !singleObject && (
            <button
              type="button"
              onClick={addRow}
              className="rounded border border-olive px-4 py-2 text-sm font-semibold text-olive transition hover:bg-olive hover:text-white"
            >
              + Add {rowLabel}
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-orange px-6 py-2 font-(family-name:--font-josefin) font-bold text-white transition hover:bg-orange-dark disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => setItems(initial)}
            className="text-sm text-stone-warm underline"
          >
            Reset
          </button>

          {state.error && (
            <span role="alert" className="text-sm font-semibold text-orange-dark">
              {state.error}
            </span>
          )}
          {state.ok && (
            <span role="status" className="text-sm font-semibold text-olive">
              {state.ok}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
