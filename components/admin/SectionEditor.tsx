"use client";

import { useState } from "react";
import type { ContentKey, SectionMeta } from "@/lib/content";
import { scheduleState, shortDate, todayLocal } from "@/lib/schedule";
import EditorFrame from "./EditorFrame";
import ImageField from "./ImageField";
import { btn, fieldLabel, input, rowCard } from "./ui";

export type FieldSpec = {
  name: string;
  label: string;
  width?: "xs" | "sm" | "md" | "lg";
  hint?: string;
  options?: string[];
  multiline?: boolean;
  /** "lines": a string[] edited as a textarea, one entry per line. */
  type?: "text" | "image" | "date" | "toggle" | "rating" | "lines";
};

type Row = Record<string, unknown>;

const WIDTH: Record<string, string> = {
  xs: "w-full sm:w-24",
  sm: "w-full sm:w-40",
  md: "w-full sm:w-64",
  lg: "w-full flex-1 sm:min-w-64",
};

const str = (v: unknown) => (v == null ? "" : String(v));

function blankRow(fields: FieldSpec[]): Row {
  return Object.fromEntries(
    fields.map((f) => [
      f.name,
      f.type === "lines"
        ? []
        : f.type === "toggle"
        ? true
        : f.type === "rating"
          ? 5
          : f.options
            ? f.options[0]
            : "",
    ]),
  );
}

function StatusBadge({ row, schedulable }: { row: Row; schedulable: boolean }) {
  if (row.show === false) {
    return <Badge tone="gray">Hidden</Badge>;
  }
  if (!schedulable) return null;
  const item = { start: str(row.start), end: str(row.end) };
  const state = scheduleState(item, todayLocal());
  if (state === "scheduled") return <Badge tone="gold">Starts {shortDate(item.start)}</Badge>;
  if (state === "ended") return <Badge tone="gray">Ended {shortDate(item.end)}</Badge>;
  if (item.end) return <Badge tone="olive">Live until {shortDate(item.end)}</Badge>;
  return <Badge tone="olive">Live</Badge>;
}

function Badge({ tone, children }: { tone: "olive" | "gold" | "gray"; children: React.ReactNode }) {
  const cls = {
    olive: "bg-olive/15 text-olive",
    gold: "bg-gold/25 text-stone-warm",
    gray: "bg-beige/60 text-stone-warm",
  }[tone];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>
      {children}
    </span>
  );
}

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <span className="flex gap-0.5" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className={`text-2xl leading-none ${n <= value ? "text-gold" : "text-beige"}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export default function SectionEditor({
  section,
  title,
  description,
  fields,
  initial,
  live,
  meta,
  storeReady,
  previewPath,
  rowLabel,
  singleObject = false,
  schedulable = false,
  flash,
}: {
  section: ContentKey;
  title: string;
  description: string;
  fields: FieldSpec[];
  /** Draft if one exists, otherwise the live value. */
  initial: unknown;
  /** Live value; "Start over" returns to this. */
  live: unknown;
  meta: SectionMeta;
  storeReady: boolean;
  previewPath: string;
  rowLabel: string;
  singleObject?: boolean;
  schedulable?: boolean;
  flash?: string;
}) {
  const toRows = (v: unknown): Row[] =>
    singleObject ? [{ ...(v as Row) }] : (v as Row[]).map((r) => ({ ...r }));

  const [items, setItems] = useState<Row[]>(() => toRows(initial));

  const update = (i: number, name: string, value: unknown) =>
    setItems((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [name]: value } : row)),
    );

  const addRow = () => setItems((prev) => [...prev, blankRow(fields)]);
  const duplicate = (i: number) =>
    setItems((prev) => [
      ...prev.slice(0, i + 1),
      { ...prev[i] },
      ...prev.slice(i + 1),
    ]);
  const removeRow = (i: number) => {
    if (!confirm(`Remove this ${rowLabel}?`)) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  };
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
    <EditorFrame
      section={section}
      title={title}
      description={description}
      payload={payload}
      previewPath={previewPath}
      meta={meta}
      storeReady={storeReady}
      flash={flash}
      onReset={() => {
        if (confirm("Go back to what is currently on the live site? Unsaved edits here will be lost.")) {
          setItems(toRows(live));
        }
      }}
    >
      <div className="space-y-4">
        {items.map((row, i) => (
          <div key={i} className={rowCard}>
            {!singleObject && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-brand text-stone-warm">
                  {rowLabel} {i + 1}
                  <StatusBadge row={row} schedulable={schedulable} />
                </span>
                <div className="flex flex-wrap gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${rowLabel} ${i + 1} up`} className={btn.subtle}>
                    ↑
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${rowLabel} ${i + 1} down`} className={btn.subtle}>
                    ↓
                  </button>
                  <button type="button" onClick={() => duplicate(i)} className={btn.subtle}>
                    Duplicate
                  </button>
                  <button type="button" onClick={() => removeRow(i)} className={btn.danger}>
                    Remove
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {fields.map((f) => {
                const v = row[f.name];
                if (f.type === "image") {
                  return (
                    <ImageField
                      key={f.name}
                      label={f.label}
                      value={str(v)}
                      onChange={(url) => update(i, f.name, url)}
                    />
                  );
                }
                if (f.type === "toggle") {
                  return (
                    <label key={f.name} className="flex items-center gap-2 self-end pb-2 text-sm">
                      <input
                        type="checkbox"
                        checked={v !== false}
                        onChange={(e) => update(i, f.name, e.target.checked)}
                        className="h-4 w-4 accent-olive"
                      />
                      {f.label}
                    </label>
                  );
                }
                if (f.type === "rating") {
                  return (
                    <div key={f.name}>
                      <span className={fieldLabel}>{f.label}</span>
                      <Stars value={Number(v) || 5} onChange={(n) => update(i, f.name, n)} />
                    </div>
                  );
                }
                return (
                  <label key={f.name} className={WIDTH[f.width ?? "sm"]}>
                    <span className={fieldLabel}>{f.label}</span>
                    {f.options ? (
                      <select value={str(v)} onChange={(e) => update(i, f.name, e.target.value)} className={input}>
                        {f.options.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : f.type === "lines" ? (
                      <textarea
                        value={Array.isArray(v) ? v.map(str).join("\n") : str(v)}
                        onChange={(e) => update(i, f.name, e.target.value.split("\n"))}
                        rows={3}
                        className={input}
                      />
                    ) : f.multiline ? (
                      <textarea value={str(v)} onChange={(e) => update(i, f.name, e.target.value)} rows={3} className={input} />
                    ) : (
                      <input
                        type={f.type === "date" ? "date" : "text"}
                        value={str(v)}
                        onChange={(e) => update(i, f.name, e.target.value)}
                        className={input}
                      />
                    )}
                    {f.hint && (
                      <span className="mt-0.5 block text-[11px] text-stone-warm/70">{f.hint}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!singleObject && (
        <button type="button" onClick={addRow} className={`${btn.secondary} mt-4`}>
          + Add {rowLabel}
        </button>
      )}
    </EditorFrame>
  );
}
