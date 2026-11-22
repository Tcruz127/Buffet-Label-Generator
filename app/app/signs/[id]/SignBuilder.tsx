"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import SignPage, { ArrowGlyph, ScaledSign, SIGN_FONT_FACES } from "../SignPage";
import { addSignRoom, duplicateSignSet, removeSignRoom, saveSignSet, setSignLogo } from "../actions";
import { imageFileToPngDataUrl, logoFileError } from "@/lib/imageFile";
import {
  ARROWS,
  MAX_SIGN_COPIES,
  MAX_SIGNS_PER_SET,
  SIGN_BORDERS,
  SIGN_FONTS,
  SIGN_LINE_HEIGHT,
  SIGN_SPACING,
  newSignId,
  type Arrow,
  type SignDesign,
  type SignEntry,
  type SignSelection,
} from "@/lib/signContent";

type SignBuilderProps = {
  signSet: {
    id: string;
    lines: string[];
    room: string;
    signs: SignEntry[];
    design: SignDesign;
    venueLogo: string | null;
    groupLogo: string | null;
  };
  /** The organization's function rooms, alphabetical. */
  rooms: string[];
};

type SaveStatus = "saved" | "editing" | "saving" | "error";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400";

const TEXT_SCALE_OPTIONS: { value: SignDesign["textScale"]; label: string }[] = [
  { value: 0.8, label: "S" },
  { value: 0.9, label: "M" },
  { value: 1, label: "L" },
  { value: 1.1, label: "XL" },
];

const LOGO_SIZE_OPTIONS: { value: SignDesign["logoSize"]; label: string }[] = [
  { value: "small", label: "S" },
  { value: "medium", label: "M" },
  { value: "large", label: "L" },
];

// Arrow directions that aren't used yet are offered first when adding a sign.
const ADD_ORDER: Arrow[] = ["left", "right", "up", "down", "up-left", "up-right", "down-left", "down-right", "none"];

export default function SignBuilder({ signSet, rooms: initialRooms }: SignBuilderProps) {
  const [lines, setLines] = useState(signSet.lines);
  const [room, setRoom] = useState(signSet.room);
  const [rooms, setRooms] = useState(initialRooms);
  const [signs, setSigns] = useState(signSet.signs);
  const [design, setDesign] = useState(signSet.design);
  const [venueLogo, setVenueLogo] = useState(signSet.venueLogo);
  const [groupLogo, setGroupLogo] = useState(signSet.groupLogo);
  const [selectedId, setSelectedId] = useState(signSet.signs[0]?.id ?? null);
  const [selection, setSelection] = useState<SignSelection>(signSet.room ? null : "room");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isDuplicating, startDuplicate] = useTransition();

  // Debounced autosave of text, room, signs and design (logos save on upload).
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveStatus("editing");
    const timer = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await saveSignSet(signSet.id, { lines, room, signs, design });
        setSaveStatus("saved");
      } catch (error) {
        console.error("Sign save failed:", error);
        setSaveStatus("error");
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [signSet.id, lines, room, signs, design]);

  const selected = signs.find((s) => s.id === selectedId) ?? signs[0] ?? null;
  const selectedNumber = selected ? signs.indexOf(selected) + 1 : 0;
  const totalPages = signs.reduce((sum, s) => sum + s.copies, 0);
  const pageProps = { lines, room, venueLogo, groupLogo, design };

  const updateSign = (id: string, update: Partial<SignEntry>) =>
    setSigns((prev) => prev.map((s) => (s.id === id ? { ...s, ...update } : s)));

  const addSign = () => {
    if (signs.length >= MAX_SIGNS_PER_SET) return;
    const used = new Set(signs.map((s) => s.arrow));
    const arrow = ADD_ORDER.find((a) => !used.has(a)) ?? "left";
    const sign = { id: newSignId(), arrow, copies: 1 };
    setSigns((prev) => [...prev, sign]);
    setSelectedId(sign.id);
    setSelection("arrow");
  };

  const removeSign = (id: string) => {
    if (signs.length <= 1) return;
    const index = signs.findIndex((s) => s.id === id);
    const remaining = signs.filter((s) => s.id !== id);
    setSigns(remaining);
    setSelectedId(remaining[Math.max(0, index - 1)]?.id ?? null);
  };

  const done = () => setSelection(null);

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fbff_0%,#f6f8fc_45%,#ffffff_100%)] text-slate-900 print:min-h-0 print:bg-white">
      <style>{`
        @media print {
          @page { size: letter landscape; margin: 0; }
          html, body { background: #fff !important; }
        }
      `}</style>

      {/* Screen UI */}
      <div className="print:hidden">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-6 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/app/signs" className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                ← Signs
              </Link>
              <h1 className="truncate text-lg font-bold text-slate-950">{lines.find((l) => l.trim()) || "Untitled Signs"}</h1>
              <SaveBadge status={saveStatus} />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelection("design")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selection === "design"
                    ? "border-cyan-300 bg-cyan-50 text-cyan-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Design
              </button>
              <button
                type="button"
                disabled={isDuplicating}
                onClick={() => startDuplicate(() => duplicateSignSet(signSet.id))}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {isDuplicating ? "Duplicating…" : "Duplicate set"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
              >
                Print {totalPages} {totalPages === 1 ? "page" : "pages"}
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1600px] gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0">
            <p className="mb-3 text-sm text-slate-500">
              Click any part of the sign to edit it. {signs.length > 1 && `Showing sign ${selectedNumber} of ${signs.length}.`}
            </p>
            {selected && (
              <ScaledSign className="rounded-2xl border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
                <SignPage {...pageProps} arrow={selected.arrow} interactive={{ selection, onSelect: setSelection }} />
              </ScaledSign>
            )}

            {/* All signs in this set */}
            <div className="mt-5 flex flex-wrap gap-3">
              {signs.map((sign, i) => (
                <button
                  key={sign.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(sign.id);
                    setSelection("arrow");
                  }}
                  className={`w-40 rounded-xl border-2 bg-white p-1.5 text-left transition ${
                    sign.id === selected?.id ? "border-cyan-400 shadow-md" : "border-transparent hover:border-slate-200"
                  }`}
                >
                  <ScaledSign className="rounded-md border border-slate-100">
                    <SignPage {...pageProps} arrow={sign.arrow} />
                  </ScaledSign>
                  <span className="mt-1 block px-1 text-xs font-semibold text-slate-600">
                    Sign {i + 1}
                    {sign.copies > 1 && <span className="text-slate-400"> · ×{sign.copies}</span>}
                  </span>
                </button>
              ))}
              {signs.length < MAX_SIGNS_PER_SET && (
                <button
                  type="button"
                  onClick={addSign}
                  className="flex w-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 transition hover:border-cyan-400 hover:text-cyan-700"
                  style={{ minHeight: "8rem" }}
                >
                  <span className="text-2xl leading-none">+</span>
                  Add sign
                </button>
              )}
            </div>
          </section>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            {selection === null && (
              <Panel title="Build your signs" hint="Click a part of the sign, or pick one here.">
                <ul className="space-y-1.5">
                  {(
                    [
                      ["logos", "Logos", venueLogo || groupLogo ? "Venue & group logos" : "None yet"],
                      ["text", "Group name", lines.filter((l) => l.trim()).join(" · ") || "Not set"],
                      ["room", "Room", room || "Not chosen"],
                      ["arrow", `Arrow — sign ${selectedNumber}`, selected?.arrow === "none" ? "No arrow" : selected?.arrow.replace("-", " ") ?? ""],
                      ["design", "Design & spacing", `${SIGN_FONT_FACES[design.groupFont].label} / ${SIGN_FONT_FACES[design.roomFont].label}`],
                    ] as const
                  ).map(([key, label, detail]) => (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => setSelection(key)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition hover:border-cyan-300 hover:bg-cyan-50/40"
                      >
                        <span className="text-sm font-semibold text-slate-800">{label}</span>
                        <span className="truncate text-xs capitalize text-slate-400">{detail}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-slate-400">
                  Use &ldquo;Add sign&rdquo; below the preview for each extra arrow direction you need.
                </p>
              </Panel>
            )}

            {selection === "logos" && (
              <Panel title="Logos" hint="New sign sets reuse your most recent venue logo." onDone={done}>
                <LogoSlot label="Venue logo" signSetId={signSet.id} slot="venue" logo={venueLogo} onChange={setVenueLogo} />
                <LogoSlot label="Group logo" signSetId={signSet.id} slot="group" logo={groupLogo} onChange={setGroupLogo} />
                {(venueLogo || groupLogo) && (
                  <div className="mt-3">
                    <span className={labelClass}>Logo size</span>
                    <Segmented options={LOGO_SIZE_OPTIONS} value={design.logoSize} onChange={(logoSize) => setDesign((d) => ({ ...d, logoSize }))} />
                  </div>
                )}
              </Panel>
            )}

            {selection === "text" && (
              <Panel title="Group name" hint="One line per row. Shared by every sign in this set." onDone={done}>
                <textarea
                  className={`${inputClass} min-h-[96px] font-semibold`}
                  value={lines.join("\n")}
                  onChange={(e) => setLines(e.target.value.split("\n").slice(0, 6))}
                  placeholder={"Crystal Springs\nBook Club"}
                  autoFocus
                />
                <div className="mt-4">
                  <TextStyleControls label="Font" part="group" design={design} onChange={setDesign} />
                </div>
                <div>
                  <span className={labelClass}>Text size</span>
                  <Segmented options={TEXT_SCALE_OPTIONS} value={design.textScale} onChange={(textScale) => setDesign((d) => ({ ...d, textScale }))} />
                  <p className="mt-1.5 text-xs text-slate-400">Long lines shrink automatically to fit the page.</p>
                </div>
              </Panel>
            )}

            {selection === "design" && <DesignPanel design={design} onChange={setDesign} onDone={done} />}

            {selection === "room" && (
              <RoomPanel room={room} rooms={rooms} onRoom={setRoom} onRooms={setRooms} onDone={done}>
                <TextStyleControls label="Room font" part="room" design={design} onChange={setDesign} />
              </RoomPanel>
            )}

            {selection === "arrow" && selected && (
              <Panel title={`Sign ${selectedNumber} — arrow`} hint="Each sign in the set can point a different way." onDone={done}>
                <div className="grid w-44 grid-cols-3 gap-1.5">
                  {ARROWS.map((arrow) => (
                    <button
                      key={arrow}
                      type="button"
                      aria-label={arrow === "none" ? "No arrow" : `Arrow ${arrow.replace("-", " ")}`}
                      aria-pressed={selected.arrow === arrow}
                      onClick={() => updateSign(selected.id, { arrow })}
                      className={`flex h-12 items-center justify-center rounded-xl border transition ${
                        selected.arrow === arrow
                          ? "border-cyan-400 bg-cyan-50 text-slate-900 ring-2 ring-cyan-100"
                          : "border-slate-200 bg-white text-slate-500 hover:border-cyan-300"
                      }`}
                    >
                      {arrow === "none" ? <span className="text-[10px] font-semibold">None</span> : <ArrowGlyph arrow={arrow} size="1.35rem" />}
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Copies</span>
                  <div className="flex items-center gap-1">
                    <StepButton label="Fewer copies" disabled={selected.copies <= 1} onClick={() => updateSign(selected.id, { copies: selected.copies - 1 })}>−</StepButton>
                    <span className="w-8 text-center text-sm font-bold">{selected.copies}</span>
                    <StepButton label="More copies" disabled={selected.copies >= MAX_SIGN_COPIES} onClick={() => updateSign(selected.id, { copies: selected.copies + 1 })}>+</StepButton>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  {signs.length < MAX_SIGNS_PER_SET && (
                    <button type="button" onClick={addSign} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                      + Add another sign
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={signs.length <= 1}
                    onClick={() => removeSign(selected.id)}
                    className="ml-auto rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                  >
                    Remove this sign
                  </button>
                </div>
              </Panel>
            )}
          </aside>
        </div>
      </div>

      {/* Print: every sign, repeated for its copies, one per page. */}
      <div className="hidden print:block">
        {signs.flatMap((sign) =>
          Array.from({ length: sign.copies }, (_, copy) => (
            <div key={`${sign.id}-${copy}`} className="h-[8.45in] overflow-hidden break-after-page last:break-after-auto">
              <SignPage {...pageProps} arrow={sign.arrow} />
            </div>
          ))
        )}
      </div>
    </main>
  );
}

const COLOR_PRESETS = [
  { value: "#000000", label: "Black" },
  { value: "#374151", label: "Charcoal" },
  { value: "#8b5e3c", label: "Lodge brown" },
  { value: "#1e3a5f", label: "Navy" },
  { value: "#2f5d3a", label: "Forest" },
  { value: "#7a1f2b", label: "Burgundy" },
];

const BORDER_LABELS: Record<SignDesign["border"], string> = {
  none: "None",
  thin: "Thin",
  thick: "Thick",
  double: "Double",
  rounded: "Rounded",
  corners: "Corners",
};

/** Font, bold and italic for the group name or the room. */
function TextStyleControls({
  label,
  part,
  design,
  onChange,
}: {
  label: string;
  part: "group" | "room";
  design: SignDesign;
  onChange: (update: (design: SignDesign) => SignDesign) => void;
}) {
  const font = part === "group" ? design.groupFont : design.roomFont;
  const bold = part === "group" ? design.groupBold : design.roomBold;
  const italic = part === "group" ? design.groupItalic : design.roomItalic;
  const set = (update: Partial<{ font: SignDesign["groupFont"]; bold: boolean; italic: boolean }>) =>
    onChange((d) =>
      part === "group"
        ? { ...d, groupFont: update.font ?? d.groupFont, groupBold: update.bold ?? d.groupBold, groupItalic: update.italic ?? d.groupItalic }
        : { ...d, roomFont: update.font ?? d.roomFont, roomBold: update.bold ?? d.roomBold, roomItalic: update.italic ?? d.roomItalic }
    );

  const toggle = (on: boolean) =>
    `flex h-8 w-9 items-center justify-center rounded-lg border text-sm transition ${
      on ? "border-cyan-400 bg-cyan-50 text-slate-900 ring-2 ring-cyan-100" : "border-slate-200 bg-white text-slate-500 hover:border-cyan-300"
    }`;

  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className={`${labelClass} mb-0`}>{label}</span>
        <div className="flex gap-1">
          <button type="button" aria-label="Bold" aria-pressed={bold} onClick={() => set({ bold: !bold })} className={`${toggle(bold)} font-black`}>
            B
          </button>
          <button type="button" aria-label="Italic" aria-pressed={italic} onClick={() => set({ italic: !italic })} className={`${toggle(italic)} font-serif italic`}>
            I
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {SIGN_FONTS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={font === f}
            onClick={() => set({ font: f })}
            className={`flex flex-col items-center rounded-xl border px-1 py-1.5 transition ${
              font === f ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white hover:border-cyan-300"
            }`}
          >
            <span
              className={`${SIGN_FONT_FACES[f].className} text-lg text-slate-800`}
              style={{ fontWeight: bold ? 700 : 400, fontStyle: italic ? "italic" : "normal" }}
            >
              Aa
            </span>
            <span className="text-[10px] font-semibold text-slate-500">{SIGN_FONT_FACES[f].label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Small preview of each border style for the picker tiles. */
function BorderSwatch({ border }: { border: SignDesign["border"] }) {
  if (border === "none") return <span className="text-xs font-medium text-slate-300">None</span>;
  const base = "absolute inset-1 border-slate-700";
  if (border === "corners") {
    return (
      <span className="relative block h-9 w-12">
        <span className="absolute left-1 top-1 h-3 w-3 border-l-2 border-t-2 border-slate-700" />
        <span className="absolute right-1 top-1 h-3 w-3 border-r-2 border-t-2 border-slate-700" />
        <span className="absolute bottom-1 left-1 h-3 w-3 border-b-2 border-l-2 border-slate-700" />
        <span className="absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-slate-700" />
      </span>
    );
  }
  const variant = { thin: "border", thick: "border-[3px]", double: "border-[4px] border-double", rounded: "border-2 rounded-md" }[border];
  return (
    <span className="relative block h-9 w-12">
      <span className={`${base} ${variant}`} />
    </span>
  );
}

function SpacingSlider({
  label,
  value,
  min,
  max,
  step = 0.05,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm font-semibold text-slate-700">
        {label}
        <span className="text-xs font-medium tabular-nums text-slate-400">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.round(Number(e.target.value) * 100) / 100)}
        className="mt-1 w-full accent-cyan-500"
      />
    </label>
  );
}

function DesignPanel({
  design,
  onChange,
  onDone,
}: {
  design: SignDesign;
  onChange: (update: (design: SignDesign) => SignDesign) => void;
  onDone: () => void;
}) {
  const set = <K extends keyof SignDesign>(key: K, value: SignDesign[K]) => onChange((d) => ({ ...d, [key]: value }));
  const inches = (v: number) => `${v.toFixed(2)} in`;

  return (
    <Panel title="Design" hint="Applies to every sign in this set." onDone={onDone}>
      <TextStyleControls label="Group name font" part="group" design={design} onChange={onChange} />
      <TextStyleControls label="Room font" part="room" design={design} onChange={onChange} />

      <span className={labelClass}>Colour</span>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            aria-label={c.label}
            aria-pressed={design.color === c.value}
            onClick={() => set("color", c.value)}
            className={`h-8 w-8 rounded-full ring-offset-2 transition ${design.color === c.value ? "ring-2 ring-cyan-400" : "hover:ring-2 hover:ring-slate-200"}`}
            style={{ background: c.value }}
          />
        ))}
        <label className="flex items-center gap-1.5 rounded-full border border-slate-200 py-1 pl-1 pr-3 text-xs font-semibold text-slate-600">
          <input
            type="color"
            value={design.color}
            onChange={(e) => set("color", e.target.value.toLowerCase())}
            className="h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0"
          />
          Custom
        </label>
      </div>

      <span className={labelClass}>Border</span>
      <div className="mb-5 grid grid-cols-3 gap-2">
        {SIGN_BORDERS.map((border) => (
          <button
            key={border}
            type="button"
            aria-pressed={design.border === border}
            onClick={() => set("border", border)}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 transition ${
              design.border === border ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white hover:border-cyan-300"
            }`}
          >
            <span className="flex h-9 items-center">
              <BorderSwatch border={border} />
            </span>
            <span className="text-[11px] font-semibold text-slate-500">{BORDER_LABELS[border]}</span>
          </button>
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span className={`${labelClass} mb-0`}>Spacing</span>
        <button
          type="button"
          onClick={() =>
            onChange((d) => ({
              ...d,
              logoGap: SIGN_SPACING.logoGap.default,
              roomGap: SIGN_SPACING.roomGap.default,
              arrowGap: SIGN_SPACING.arrowGap.default,
              lineHeight: SIGN_LINE_HEIGHT.default,
            }))
          }
          className="text-xs font-semibold text-slate-500 underline-offset-2 hover:underline"
        >
          Reset spacing
        </button>
      </div>
      <div className="space-y-3">
        <SpacingSlider label="Logos ↔ group name" {...SIGN_SPACING.logoGap} value={design.logoGap} format={inches} onChange={(v) => set("logoGap", v)} />
        <SpacingSlider label="Group name ↔ room" {...SIGN_SPACING.roomGap} value={design.roomGap} format={inches} onChange={(v) => set("roomGap", v)} />
        <SpacingSlider label="Text ↔ arrow" {...SIGN_SPACING.arrowGap} value={design.arrowGap} format={inches} onChange={(v) => set("arrowGap", v)} />
        <SpacingSlider
          label="Line spacing"
          {...SIGN_LINE_HEIGHT}
          value={design.lineHeight}
          format={(v) => `${v.toFixed(2)}×`}
          onChange={(v) => set("lineHeight", v)}
        />
      </div>
      <p className="mt-3 text-xs text-slate-400">The text resizes to fit the space that&apos;s left.</p>
    </Panel>
  );
}

/** Pick the room from the organization's alphabetical list, like picking dishes on a menu. */
function RoomPanel({
  room,
  rooms,
  onRoom,
  onRooms,
  onDone,
  children,
}: {
  room: string;
  rooms: string[];
  onRoom: (room: string) => void;
  onRooms: (rooms: string[]) => void;
  onDone: () => void;
  /** Style controls shown under the list. */
  children?: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();

  const q = search.trim().toLowerCase();
  const options = q ? rooms.filter((r) => r.toLowerCase().includes(q)) : rooms;

  const add = () => {
    const name = newRoom.trim();
    if (!name) return;
    setError("");
    startSaving(async () => {
      try {
        onRooms(await addSignRoom(name));
        onRoom(name);
        setNewRoom("");
      } catch {
        setError("Couldn't add that room. Please try again.");
      }
    });
  };

  const remove = (name: string) =>
    startSaving(async () => {
      try {
        onRooms(await removeSignRoom(name));
      } catch {
        setError("Couldn't remove that room. Please try again.");
      }
    });

  return (
    <Panel title="Room" hint="Shared by every sign in this set." onDone={onDone}>
      <input className={`${inputClass} mb-2`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rooms…" autoFocus />
      <ul className="max-h-[50vh] space-y-1.5 overflow-y-auto pr-1">
        {options.map((name) => {
          const isSelected = name === room;
          return (
            <li key={name} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onRoom(isSelected ? "" : name)}
                className={`flex flex-1 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                  isSelected ? "border-emerald-200 bg-emerald-50 text-slate-900" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/40"
                }`}
              >
                <span className={isSelected ? "text-emerald-600" : "text-cyan-600"}>{isSelected ? "✓" : "+"}</span>
                {name}
              </button>
              {editing && (
                <button
                  type="button"
                  aria-label={`Remove ${name} from the list`}
                  disabled={isSaving}
                  onClick={() => remove(name)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-red-500 hover:bg-red-50 disabled:opacity-40"
                >
                  ×
                </button>
              )}
            </li>
          );
        })}
        {options.length === 0 && (
          <li className="px-1 py-2 text-sm text-slate-400">{rooms.length ? "No rooms match your search." : "No rooms in your list yet."}</li>
        )}
      </ul>

      <div className="mt-3 flex gap-2">
        <input
          className={inputClass}
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a room to the list"
        />
        <button type="button" disabled={isSaving || !newRoom.trim()} onClick={add} className="shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50">
          Add
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <button type="button" onClick={() => setEditing((e) => !e)} className="mt-3 text-xs font-semibold text-slate-500 underline-offset-2 hover:underline">
        {editing ? "Done editing list" : "Edit room list"}
      </button>
      <div className="mt-4 border-t border-slate-100 pt-4">{children}</div>
    </Panel>
  );
}

function Panel({
  title,
  hint,
  onDone,
  children,
}: {
  title: string;
  hint?: string;
  onDone?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        {onDone && (
          <button type="button" onClick={onDone} className="rounded-full px-3 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100">
            Done
          </button>
        )}
      </div>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
            value === o.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-base font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function LogoSlot({
  label,
  signSetId,
  slot,
  logo,
  onChange,
}: {
  label: string;
  signSetId: string;
  slot: "venue" | "group";
  logo: string | null;
  onChange: (logo: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();

  const save = (next: string | null) =>
    startSaving(async () => {
      try {
        await setSignLogo(signSetId, slot, next);
        onChange(next);
      } catch {
        setError("Couldn't save the logo. Please try again.");
      }
    });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    const fileError = logoFileError(file);
    if (fileError) {
      setError(fileError);
      return;
    }
    try {
      save(await imageFileToPngDataUrl(file));
    } catch {
      setError("That image couldn't be read. Try a PNG or JPG.");
    }
  };

  return (
    <div className="mb-3">
      <span className={labelClass}>{label}</span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {logo ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL preview */}
          <img src={logo} alt={label} className="h-12 w-24 object-contain" />
          <div className="flex flex-1 justify-end gap-1">
            <button type="button" disabled={isSaving} onClick={() => fileInputRef.current?.click()} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
              Replace
            </button>
            <button type="button" disabled={isSaving} onClick={() => save(null)} className="rounded-full px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isSaving}
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 disabled:opacity-50"
        >
          {isSaving ? "Uploading…" : `+ Upload ${label.toLowerCase()}`}
        </button>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SaveBadge({ status }: { status: SaveStatus }) {
  const styles: Record<SaveStatus, [string, string]> = {
    saved: ["Saved", "bg-emerald-50 text-emerald-700"],
    editing: ["Editing…", "bg-slate-100 text-slate-600"],
    saving: ["Saving…", "bg-cyan-50 text-cyan-700"],
    error: ["Save failed — keep editing to retry", "bg-red-50 text-red-700"],
  };
  const [label, className] = styles[status];
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}
