"use client";

import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { DEAL_SLOT_COUNT, DealCard, DealGrid } from "@/components/DealCard";
import type { DealCard as Deal, SectionMeta } from "@/lib/content";
import { isLive, scheduleState, shortDate, todayInShop } from "@/lib/schedule";
import EditorFrame from "./EditorFrame";
import ImageField from "./ImageField";
import ScaledPreview, { DEVICE_WIDTH, DeviceToggle, useDevice } from "./ScaledPreview";
import { btn, fieldLabel, input } from "./ui";

const str = (v: unknown) => (v == null ? "" : String(v));
const blank = (): Deal => ({ title: "", text: "", image: "", start: "", end: "" });

type Row = { id: number; card: Deal };

/** Which cards fill the homepage spots today, in order: the homepage's own rule. */
function pickShown(items: Deal[], today: string): number[] {
  const shown: number[] = [];
  items.forEach((d, i) => {
    if (shown.length < DEAL_SLOT_COUNT && isLive(d, today)) shown.push(i);
  });
  return shown;
}

type Tone = "olive" | "gold" | "gray";

function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const cls = {
    olive: "bg-olive/15 text-olive",
    gold: "bg-gold/25 text-stone-warm",
    gray: "bg-beige/60 text-stone-warm",
  }[tone];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${cls}`}>{children}</span>
  );
}

/** Where a card is today and, if it is not on the homepage, why. */
function status(d: Deal, today: string, onHomepage: boolean) {
  const state = scheduleState(d, today);
  if (state === "scheduled") {
    const when = shortDate(str(d.start));
    return { tone: "gold" as Tone, label: `Starts ${when}`, note: `Not on the homepage yet. It appears on ${when}.` };
  }
  if (state === "ended") {
    const when = shortDate(str(d.end));
    return {
      tone: "gray" as Tone,
      label: `Ended ${when}`,
      note: `No longer on the homepage. It ended ${when}. Change or clear the dates to bring it back.`,
    };
  }
  if (!onHomepage) {
    return {
      tone: "gray" as Tone,
      label: "No spot left",
      note: `Not on the homepage: all ${DEAL_SLOT_COUNT} spots are taken by the cards before it. Move it earlier, or remove one of those, to show it.`,
    };
  }
  if (d.end) return { tone: "olive" as Tone, label: `Live until ${shortDate(str(d.end))}`, note: "" };
  return { tone: "olive" as Tone, label: "Live", note: "" };
}

/**
 * Deal cards, edited on a live picture of the homepage: tap a card in the
 * preview, change it in the panel, watch the preview follow.
 */
export default function DealCardsEditor({
  initial,
  live,
  meta,
  storeReady,
  flash,
}: {
  initial: Deal[];
  live: Deal[];
  meta: SectionMeta;
  storeReady: boolean;
  flash?: string;
}) {
  // Each card gets a stable id for the session, so an upload that finishes
  // after the owner reorders or removes cards still lands on the right one.
  const [rows, setRows] = useState<Row[]>(() =>
    initial.map((d, i) => ({ id: i + 1, card: { ...d } })),
  );
  const nextId = useRef(initial.length + 1);
  const items = rows.map((r) => r.card);
  const [selected, setSelected] = useState(0);
  const [datesOpen, setDatesOpen] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [device, setDevice] = useDevice();
  const panelRef = useRef<HTMLElement>(null);

  const today = todayInShop();
  const shown = pickShown(items, today);
  const hidden = items.map((_, i) => i).filter((i) => !shown.includes(i));
  const cur = Math.min(selected, items.length - 1);
  const card = cur >= 0 ? items[cur] : null;

  const noPhoto = items.findIndex((d) => !d.image);
  const problem =
    noPhoto >= 0 ? `Card ${noPhoto + 1} needs a photo before you can preview or publish.` : null;

  const select = (i: number) => {
    setSelected(i);
    setDatesOpen(false);
    // On a phone the panel sits under the preview; bring it into view.
    if (window.innerWidth < 1024) {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const patch = (i: number, p: Partial<Deal>) =>
    setRows((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, card: { ...r.card, ...p } } : r)),
    );

  // By id, for results that arrive later (photo uploads).
  const patchById = (id: number, p: Partial<Deal>) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, card: { ...r.card, ...p } } : r)),
    );

  const add = () => {
    setRows((prev) => [...prev, { id: nextId.current++, card: blank() }]);
    select(items.length);
  };

  const duplicate = (i: number) => {
    setRows((prev) => [
      ...prev.slice(0, i + 1),
      { id: nextId.current++, card: { ...prev[i].card } },
      ...prev.slice(i + 1),
    ]);
    select(i + 1);
  };

  const remove = (i: number) => {
    if (!confirm("Remove this card?")) return;
    setRows((prev) => prev.filter((_, idx) => idx !== i));
    setSelected(Math.max(0, i - 1));
    setDatesOpen(false);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    setRows((prev) => {
      const next = [...prev];
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return next;
    });
    setSelected(to);
  };

  // Drag a card onto another to put it in that position (mouse only; the
  // Earlier / Later buttons do the same on a phone).
  const drag = (i: number) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      // Firefox only starts a drag once some data is set.
      e.dataTransfer.setData("text/plain", String(i + 1));
      e.dataTransfer.effectAllowed = "move";
      setDragFrom(i);
    },
    onDragOver: (e: DragEvent) => e.preventDefault(),
    onDrop: () => {
      if (dragFrom !== null) move(dragFrom, i);
      setDragFrom(null);
    },
    onDragEnd: () => setDragFrom(null),
  });

  const hasDates = Boolean(card && (card.start || card.end));
  const curStatus = card ? status(card, today, shown.includes(cur)) : null;

  return (
    <EditorFrame
      section="deals"
      title="Homepage deal cards"
      description="The photo cards under the hero. Tap a card to change it and the preview follows as you type. The first five cards that are live today fill the five spots, in order."
      payload={JSON.stringify(items)}
      previewPath="/"
      meta={meta}
      storeReady={storeReady}
      flash={flash}
      problem={problem}
      onReset={() => {
        if (confirm("Go back to the cards that are on the live site now? Unsaved edits here will be lost.")) {
          setRows(live.map((d) => ({ id: nextId.current++, card: { ...d } })));
          setSelected(0);
          setDatesOpen(false);
        }
      }}
    >
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className={fieldLabel}>
              How the homepage looks today. Tap a card to edit it, drag one to move it.
            </span>
            <DeviceToggle value={device} onChange={setDevice} />
          </div>

          <div className="rounded border border-beige bg-smoke">
            {shown.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-stone-warm">
                No cards are showing today. Add one, or give a card dates that include today.
              </p>
            ) : (
              <ScaledPreview width={DEVICE_WIDTH[device]}>
                <DealGrid variant={device}>
                  {shown.map((i, slot) => {
                    const d = items[i];
                    const on = i === cur;
                    const st = status(d, today, true);
                    return (
                      <DealCard
                        key={rows[i].id}
                        title={d.title}
                        text={d.text}
                        image={d.image}
                        slot={slot}
                        variant={device}
                        preview
                      >
                        <button
                          type="button"
                          onClick={() => select(i)}
                          aria-label={`Edit card ${i + 1}${d.title ? `: ${d.title}` : ""}`}
                          aria-pressed={on}
                          {...drag(i)}
                          className={`absolute inset-0 cursor-pointer rounded-lg ring-inset ring-orange transition focus:outline-none focus-visible:ring-4 ${
                            on ? "ring-4" : "hover:ring-4 hover:ring-gold"
                          } ${dragFrom === i ? "opacity-50" : ""}`}
                        />
                        <span className="pointer-events-none absolute left-2 top-2 rounded bg-ink/70 px-2 py-0.5 text-sm font-bold text-white">
                          {i + 1}
                        </span>
                        {st.label !== "Live" && (
                          <span className="pointer-events-none absolute right-2 top-2 rounded bg-gold px-2 py-0.5 text-xs font-bold text-ink">
                            {st.label}
                          </span>
                        )}
                      </DealCard>
                    );
                  })}
                </DealGrid>
              </ScaledPreview>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {hidden.length > 0 && (
              <span className="text-xs font-semibold text-stone-warm">Not showing today:</span>
            )}
            {hidden.map((i) => {
              const d = items[i];
              const on = i === cur;
              return (
                <button
                  key={rows[i].id}
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={on}
                  {...drag(i)}
                  className={`flex items-center gap-2 rounded border bg-white py-1 pl-1 pr-3 text-left text-xs transition ${
                    on ? "border-orange ring-2 ring-orange" : "border-beige hover:border-gold"
                  } ${dragFrom === i ? "opacity-50" : ""}`}
                >
                  <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-cream-deep">
                    {d.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.image} alt="" className="h-full w-full object-cover" />
                    )}
                    <span className="absolute left-0.5 top-0.5 rounded bg-ink/70 px-1 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                  </span>
                  <span>
                    <span className="block font-bold uppercase tracking-brand text-olive">
                      {d.title || "Untitled"}
                    </span>
                    <span className="block text-stone-warm">{status(d, today, false).label}</span>
                  </span>
                </button>
              );
            })}
            <button type="button" onClick={add} className={btn.secondary}>
              + Add card
            </button>
          </div>
        </div>

        <aside ref={panelRef} className="mt-5 scroll-mt-4 lg:sticky lg:top-4 lg:mt-0">
          {card && curStatus ? (
            <div className="rounded border border-beige bg-smoke p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-brand text-stone-warm">
                  Card {cur + 1} of {items.length}
                </span>
                <Badge tone={curStatus.tone}>{curStatus.label}</Badge>
              </div>
              {curStatus.note && (
                <p className="mt-2 rounded bg-cream px-3 py-2 text-xs text-stone-warm">{curStatus.note}</p>
              )}

              <label className="mt-4 block">
                <span className={fieldLabel}>Title</span>
                <input
                  value={card.title}
                  onChange={(e) => patch(cur, { title: e.target.value })}
                  placeholder="e.g. Flower sale"
                  className={input}
                />
              </label>
              <label className="mt-3 block">
                <span className={fieldLabel}>Deal</span>
                <input
                  value={card.text}
                  onChange={(e) => patch(cur, { text: e.target.value })}
                  placeholder="e.g. $25 1/8oz"
                  className={input}
                />
              </label>
              <div className="mt-3">
                <ImageField
                  key={rows[cur].id}
                  label="Photo"
                  value={card.image}
                  onChange={(url) => patchById(rows[cur].id, { image: url })}
                />
              </div>

              <div className="mt-4 border-t border-beige pt-3">
                {hasDates || datesOpen ? (
                  <>
                    <div className="flex gap-3">
                      <label className="min-w-0 flex-1">
                        <span className={fieldLabel}>Show from</span>
                        <input
                          type="date"
                          value={str(card.start)}
                          onChange={(e) => patch(cur, { start: e.target.value })}
                          className={input}
                        />
                        <span className="mt-0.5 block text-[11px] text-stone-warm/70">Blank = right away</span>
                      </label>
                      <label className="min-w-0 flex-1">
                        <span className={fieldLabel}>Show until</span>
                        <input
                          type="date"
                          value={str(card.end)}
                          onChange={(e) => patch(cur, { end: e.target.value })}
                          className={input}
                        />
                        <span className="mt-0.5 block text-[11px] text-stone-warm/70">Blank = until you remove it</span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        patch(cur, { start: "", end: "" });
                        setDatesOpen(false);
                      }}
                      className={`${btn.link} mt-2 text-xs`}
                    >
                      Clear dates
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-stone-warm">
                    Showing now, until you remove it.{" "}
                    <button type="button" onClick={() => setDatesOpen(true)} className={`${btn.link} text-xs`}>
                      Schedule it instead
                    </button>
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-1 border-t border-beige pt-3">
                <button type="button" onClick={() => move(cur, cur - 1)} disabled={cur === 0} className={btn.subtle}>
                  ↑ Earlier
                </button>
                <button
                  type="button"
                  onClick={() => move(cur, cur + 1)}
                  disabled={cur === items.length - 1}
                  className={btn.subtle}
                >
                  ↓ Later
                </button>
                <button type="button" onClick={() => duplicate(cur)} className={btn.subtle}>
                  Duplicate
                </button>
                <button type="button" onClick={() => remove(cur)} className={btn.danger}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <p className="rounded border border-dashed border-beige px-4 py-8 text-center text-sm text-stone-warm">
              No cards yet. Press “Add card” to make one.
            </p>
          )}
        </aside>
      </div>
    </EditorFrame>
  );
}
