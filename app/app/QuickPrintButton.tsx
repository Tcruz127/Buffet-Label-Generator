"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type LabelResult = {
  id: string;
  foodName: string;
  description: string | null;
  diets: string[] | null;
  sheet: { id: string; title: string };
};

type DesignSettings = {
  fontFamily: string;
  foodNameSize: number;
  textColor: string;
  foodBold: boolean;
  foodItalic: boolean;
  descColor: string;
  descSize: number;
  accentColor: string;
  dietTextSize: number;
  backgroundColor: string;
  borderStyle: "none" | "classic" | "modern" | "elegant" | "gold-frame";
  borderColor: string;
  borderRadius: number;
  align: "left" | "center" | "right";
};

const DEFAULT_DESIGN: DesignSettings = {
  fontFamily: "Arial",
  foodNameSize: 20,
  textColor: "#111111",
  foodBold: true,
  foodItalic: false,
  descColor: "#555555",
  descSize: 12,
  accentColor: "#444444",
  dietTextSize: 12,
  backgroundColor: "#ffffff",
  borderStyle: "none",
  borderColor: "#cfcfcf",
  borderRadius: 0,
  align: "center",
};

const FONTS = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Helvetica",
  "Verdana",
  "Trebuchet MS",
  "Garamond",
  "Palatino",
];

function getLabelBorderCss(d: DesignSettings): string {
  const r = `border-radius: ${d.borderRadius}px !important;`;
  if (d.borderStyle === "none") return `border: none !important; box-shadow: none !important; ${r}`;
  if (d.borderStyle === "classic") return `border: 1px solid ${d.borderColor} !important; box-shadow: none !important; ${r}`;
  if (d.borderStyle === "modern") return `border: none !important; box-shadow: 0 2px 10px rgba(15,23,42,0.08) !important; ${r}`;
  if (d.borderStyle === "elegant") return `border: none !important; box-shadow: inset 0 0 0 1px ${d.borderColor}, inset 0 0 0 4px rgba(219,199,170,0.18) !important; ${r}`;
  if (d.borderStyle === "gold-frame") return `border: none !important; box-shadow: inset 0 0 0 2px ${d.borderColor}, inset 0 0 0 6px rgba(212,175,55,0.18) !important; ${r}`;
  return `border: none !important; ${r}`;
}

function buildPrintHtml(labels: LabelResult[], d: DesignSettings): string {
  const sheets: LabelResult[][] = [];
  for (let i = 0; i < labels.length; i += 10) sheets.push(labels.slice(i, i + 10));

  const alignItems = d.align === "left" ? "flex-start" : d.align === "right" ? "flex-end" : "center";
  const labelBorder = getLabelBorderCss(d);

  const sheetsHtml = sheets
    .map((sheetLabels) => {
      const labelHtml = sheetLabels
        .map((label) => {
          const diets = Array.isArray(label.diets) ? label.diets : [];
          const dietText = diets.join(" • ");
          return `
<div class="label">
  <div class="label-content">
    <div class="dish-name">${label.foodName}</div>
    ${label.description ? `<div class="description-line">${label.description}</div>` : ""}
    ${dietText ? `<div class="label-divider"></div><div class="allergen-line">${dietText}</div>` : ""}
  </div>
</div>`;
        })
        .join("");
      return `<div class="sheet-preview"><div class="labels">${labelHtml}</div></div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Quick Print</title>
<style>
  @page { size: Letter portrait; margin: 0; }
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0 !important; padding: 0 !important; background: white !important; color: #000 !important; font-family: ${d.fontFamily}, Arial, sans-serif !important; width: 100% !important; height: auto !important; }
  .print-wrap { width: 100% !important; margin: 0 !important; padding: 0 !important; }
  .sheet-preview { display: block !important; width: 8.5in !important; height: 11in !important; margin: 0 !important; padding: 0.5in !important; box-sizing: border-box !important; background: white !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; overflow: hidden !important; page-break-after: always !important; break-after: page !important; }
  .sheet-preview:last-child { page-break-after: auto !important; break-after: auto !important; }
  .labels { display: grid !important; grid-template-columns: repeat(2, 3.5in) !important; grid-template-rows: repeat(5, 2in) !important; column-gap: 0 !important; row-gap: 0 !important; width: 7in !important; height: 10in !important; margin-left: auto !important; margin-right: auto !important; padding: 0 !important; background: white !important; }
  .label { width: 3.5in !important; height: 2in !important; box-sizing: border-box !important; overflow: hidden !important; page-break-inside: avoid !important; break-inside: avoid !important; background-color: ${d.backgroundColor} !important; ${labelBorder} -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .label:nth-child(even) { position: relative !important; left: -0.05in !important; }
  .label-content { width: 100% !important; height: 100% !important; display: flex !important; flex-direction: column !important; justify-content: center !important; align-items: ${alignItems} !important; text-align: ${d.align} !important; box-sizing: border-box !important; padding: 10px 16px 10px 12px !important; }
  .dish-name { font-family: ${d.fontFamily}, Arial, sans-serif; font-size: ${d.foodNameSize}px; font-weight: ${d.foodBold ? "700" : "400"}; font-style: ${d.foodItalic ? "italic" : "normal"}; color: ${d.textColor}; line-height: 1.1; word-break: break-word; width: 100% !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .description-line { font-family: ${d.fontFamily}, Arial, sans-serif; font-size: ${d.descSize}px; color: ${d.descColor}; margin-top: 4px; width: 100% !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .label-divider { width: 40px; height: 1px; background: ${d.accentColor}; margin: 6px auto 4px; opacity: 0.4; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .allergen-line { font-family: ${d.fontFamily}, Arial, sans-serif; font-size: ${d.dietTextSize}px; color: ${d.accentColor}; margin-top: 0; width: 100% !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
</style>
</head>
<body>
<div class="print-wrap">${sheetsHtml}</div>
<script>
window.onload = function () {
  document.querySelectorAll(".sheet-preview").forEach(function(el){
    el.style.border = "none";
    el.style.boxShadow = "none";
  });
  document.querySelectorAll(".description-line").forEach(function(el){
    if (!(el.textContent || "").trim()) el.remove();
  });
  setTimeout(function(){ window.focus(); window.print(); }, 250);
};
<\/script>
</body>
</html>`;
}

// ── Small reusable UI pieces ────────────────────────────────────────────────

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-600">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-10 cursor-pointer rounded-lg border border-slate-200 p-0.5"
      />
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-slate-600">{label}</span>
        <span className="text-xs font-semibold text-slate-700">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500"
      />
    </div>
  );
}


// ── Side panels ─────────────────────────────────────────────────────────────

function DesignSidePanel({
  design,
  onChange,
  onReset,
}: {
  design: DesignSettings;
  onChange: (patch: Partial<DesignSettings>) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex w-52 shrink-0 flex-col rounded-l-[2rem] border-r border-slate-200 bg-white px-5 py-6">
      <p className="mb-5 text-base font-black tracking-tight text-slate-900">Design</p>

      <div className="flex flex-col gap-5">
        {/* Font */}
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-slate-500">Font style</span>
          <select
            value={design.fontFamily}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          >
            {FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>
        </div>

        {/* Sizes */}
        <SliderRow label="Dish name size" value={design.foodNameSize} min={12} max={32} unit="px" onChange={(v) => onChange({ foodNameSize: v })} />
        <SliderRow label="Ingredient size" value={design.descSize} min={8} max={20} unit="px" onChange={(v) => onChange({ descSize: v })} />
        <SliderRow label="Allergen size" value={design.dietTextSize} min={8} max={18} unit="px" onChange={(v) => onChange({ dietTextSize: v })} />

        {/* Colors */}
        <div className="space-y-2.5">
          <ColorRow label="Dish name color" value={design.textColor} onChange={(v) => onChange({ textColor: v })} />
          <ColorRow label="Ingredient color" value={design.descColor} onChange={(v) => onChange({ descColor: v })} />
          <ColorRow label="Allergen color" value={design.accentColor} onChange={(v) => onChange({ accentColor: v })} />
        </div>

        {/* Bold / Italic */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Style</span>
          <div className="flex gap-1">
            {(["B", "I"] as const).map((s) => {
              const key = s === "B" ? "foodBold" : "foodItalic";
              const active = design[key as keyof DesignSettings] as boolean;
              return (
                <button key={s} type="button" onClick={() => onChange({ [key]: !active })}
                  className={`h-7 w-7 rounded-lg border text-xs font-bold transition ${active ? "border-cyan-400 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button type="button" onClick={onReset}
        className="mt-auto pt-6 text-left text-xs font-semibold text-slate-400 transition hover:text-slate-600">
        Reset to defaults
      </button>
    </div>
  );
}

function PreviewSidePanel({ design }: { design: DesignSettings }) {
  const boxShadow =
    design.borderStyle === "modern" ? "0 2px 10px rgba(15,23,42,0.10)" :
    design.borderStyle === "elegant" ? `inset 0 0 0 1px ${design.borderColor}, inset 0 0 0 4px rgba(219,199,170,0.18)` :
    design.borderStyle === "gold-frame" ? `inset 0 0 0 2px ${design.borderColor}, inset 0 0 0 6px rgba(212,175,55,0.18)` :
    "none";

  // Scale font sizes proportionally (preview ≈ 65% of a real 3.5in label)
  const scale = 0.65;

  return (
    <div className="flex w-64 shrink-0 flex-col rounded-r-[2rem] border-l border-slate-200 bg-white px-5 py-6">
      <p className="mb-5 text-base font-black tracking-tight text-slate-900">Label Preview</p>

      <div
        className="flex items-center justify-center overflow-hidden rounded-2xl p-5"
        style={{
          background: design.backgroundColor,
          border: design.borderStyle === "classic" ? `1px solid ${design.borderColor}` : "1px solid #e2e8f0",
          boxShadow,
          textAlign: design.align,
          minHeight: "190px",
        }}
      >
        <div style={{ width: "100%" }}>
          <p style={{ fontFamily: design.fontFamily, fontSize: Math.round(design.foodNameSize * scale) + "px", fontWeight: design.foodBold ? 700 : 400, fontStyle: design.foodItalic ? "italic" : "normal", color: design.textColor, margin: 0, lineHeight: 1.2 }}>
            Chicken Marsala
          </p>
          <p style={{ fontFamily: design.fontFamily, fontSize: Math.round(design.descSize * scale) + "px", color: design.descColor, margin: "4px 0 0" }}>
            Wine sauce, mushrooms
          </p>
          <div style={{ width: "28px", height: "1px", background: design.accentColor, opacity: 0.4, margin: design.align === "center" ? "6px auto" : "6px 0" }} />
          <p style={{ fontFamily: design.fontFamily, fontSize: Math.round(design.dietTextSize * scale) + "px", color: design.accentColor, margin: 0 }}>
            Gluten Free
          </p>
        </div>
      </div>
    </div>
  );
}

const DIET_OPTIONS: { group: string; value: string; icon: string }[] = [
  { group: "Dietary Notes", value: "Gluten Free", icon: "🌾" },
  { group: "Dietary Notes", value: "Dairy Free", icon: "🥛" },
  { group: "Dietary Notes", value: "Egg Free", icon: "🥚" },
  { group: "Dietary Notes", value: "Soy Free", icon: "🫘" },
  { group: "Dietary Notes", value: "Nut Free", icon: "🥜" },
  { group: "Dietary Notes", value: "Shellfish Free", icon: "🦐" },
  { group: "Dietary Notes", value: "Sesame Free", icon: "🫓" },
  { group: "Dietary Notes", value: "Vegan", icon: "🌱" },
  { group: "Dietary Notes", value: "Vegetarian", icon: "🥬" },
  { group: "Contains", value: "Contains Gluten", icon: "🌾" },
  { group: "Contains", value: "Contains Dairy", icon: "🥛" },
  { group: "Contains", value: "Contains Eggs", icon: "🥚" },
  { group: "Contains", value: "Contains Soy", icon: "🫘" },
  { group: "Contains", value: "Contains Nuts", icon: "🥜" },
  { group: "Contains", value: "Contains Shellfish", icon: "🦐" },
  { group: "Contains", value: "Contains Sesame", icon: "🫓" },
];

// ── Main component ──────────────────────────────────────────────────────────

export default function QuickPrintButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LabelResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<LabelResult[]>([]);
  const [isDesignOpen, setIsDesignOpen] = useState(false);
  const [design, setDesign] = useState<DesignSettings>(DEFAULT_DESIGN);
  const [editingId, setEditingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const patchDiets = (id: string, diets: string[]) =>
    setSelected((prev) => prev.map((s) => s.id === id ? { ...s, diets } : s));

  const patchDesign = (patch: Partial<DesignSettings>) =>
    setDesign((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelected([]);
      setIsDesignOpen(false);
      setDesign(DEFAULT_DESIGN);
    }
  }, [isOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/labels/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        }
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);
  }, [query]);

  const isSelected = (id: string) => selected.some((s) => s.id === id);

  const toggle = (label: LabelResult) =>
    setSelected((prev) =>
      isSelected(label.id) ? prev.filter((s) => s.id !== label.id) : [...prev, label]
    );

  const removeSelected = (id: string) =>
    setSelected((prev) => prev.filter((s) => s.id !== id));

  const print = () => {
    if (!selected.length) return;
    const html = buildPrintHtml(selected, design);
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;width:0;height:0;border:none;visibility:hidden;";
    document.body.appendChild(iframe);
    const cleanup = () => { if (document.body.contains(iframe)) document.body.removeChild(iframe); };
    iframe.addEventListener("load", () => {
      iframe.contentWindow?.addEventListener("afterprint", cleanup);
    });
    iframe.srcdoc = html;
    setTimeout(cleanup, 60000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9v-1h8v1H6v1H7v-1h6v1H6zm8-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
        Quick Print
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div
            className="flex w-full items-stretch shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
            style={{ maxWidth: isDesignOpen ? "980px" : "672px", maxHeight: "90vh" }}
          >
          {/* Design side panel */}
          {isDesignOpen && (
            <DesignSidePanel
              design={design}
              onChange={patchDesign}
              onReset={() => setDesign(DEFAULT_DESIGN)}
            />
          )}

          {/* Main modal */}
          <div
            className="flex min-w-0 flex-1 flex-col overflow-hidden border border-slate-200 bg-white"
            style={{
              borderRadius: isDesignOpen ? "0" : "2rem",
              borderLeft: isDesignOpen ? "none" : undefined,
              borderRight: isDesignOpen ? "none" : undefined,
            }}
          >
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
                    Quick Print
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">
                    Find and print any label
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Search across all your sheets and build a custom print set.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-1 shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="relative mt-4">
                <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by dish name or ingredient…"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/15"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-cyan-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {query.trim().length < 2 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                  <svg className="mb-3 h-10 w-10 opacity-30" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold text-slate-500">Start typing to search your labels</p>
                  <p className="mt-1 text-xs text-slate-400">Searches food names and ingredient descriptions</p>
                </div>
              ) : results.length === 0 && !isSearching ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm font-semibold text-slate-500">No labels found for &ldquo;{query}&rdquo;</p>
                  <p className="mt-1 text-xs text-slate-400">Try a different search term</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {results.map((label) => {
                    const checked = isSelected(label.id);
                    const diets = Array.isArray(label.diets) ? label.diets : [];
                    return (
                      <li
                        key={label.id}
                        onClick={() => toggle(label)}
                        className={`flex cursor-pointer items-start gap-4 px-6 py-4 transition ${checked ? "bg-cyan-50" : "hover:bg-slate-50"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(label)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-semibold leading-snug text-slate-900">{label.foodName}</span>
                            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                              {label.sheet.title}
                            </span>
                          </div>
                          {label.description && (
                            <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{label.description}</p>
                          )}
                          {diets.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {diets.map((d) => (
                                <span key={d} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-5">
              {selected.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {selected.length} label{selected.length === 1 ? "" : "s"} selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.map((s) => {
                      const diets = Array.isArray(s.diets) ? s.diets : [];
                      const isEditing = editingId === s.id;
                      return (
                        <div key={s.id} className="relative">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                            {s.foodName}
                            {diets.length > 0 && (
                              <span className="text-cyan-500">· {diets.join(", ")}</span>
                            )}
                            {/* Edit allergens */}
                            <button
                              type="button"
                              onClick={() => setEditingId(isEditing ? null : s.id)}
                              className="text-cyan-400 transition hover:text-cyan-700"
                              title="Edit allergens"
                            >
                              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
                              </svg>
                            </button>
                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() => removeSelected(s.id)}
                              className="text-cyan-400 transition hover:text-red-500"
                            >
                              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </span>

                          {/* Allergen popover */}
                          {isEditing && (
                            <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Edit Allergens</p>
                              {["Dietary Notes", "Contains"].map((group) => (
                                <div key={group} className="mb-3">
                                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{group}</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {DIET_OPTIONS.filter((o) => o.group === group).map((opt) => {
                                      const active = diets.includes(opt.value);
                                      return (
                                        <button
                                          key={opt.value}
                                          type="button"
                                          onClick={() =>
                                            patchDiets(s.id, active ? diets.filter((d) => d !== opt.value) : [...diets, opt.value])
                                          }
                                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                                            active
                                              ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                          }`}
                                        >
                                          {opt.icon} {opt.value}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="mt-2 w-full rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                              >
                                Done
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  {selected.length === 0
                    ? "Select labels above to build your print set."
                    : `${Math.ceil(selected.length / 10)} sheet${Math.ceil(selected.length / 10) === 1 ? "" : "s"} will be printed.`}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  {/* Design toggle */}
                  <button
                    type="button"
                    onClick={() => setIsDesignOpen((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      isDesignOpen
                        ? "border-violet-300 bg-violet-50 text-violet-700"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M13.5 4.938a7 7 0 1 1-9.006 1.737c.202-.257.59-.218.793.039.278.352.594.672.943.954.332.269.786-.049.773-.476a5.977 5.977 0 0 1 .572-2.838c.082-.20.218-.392.365-.396s.28.17.357.354a5.978 5.978 0 0 1 .428 2.268c0 .61.697.867 1.025.423A6.967 6.967 0 0 0 13.5 4.938ZM14 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                    </svg>
                    Design
                    <svg
                      className={`h-3.5 w-3.5 transition-transform ${isDesignOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={print}
                    disabled={selected.length === 0}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9v-1h8v1H6v1H7v-1h6v1H6zm8-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                    Print{selected.length > 0 ? ` ${selected.length} Label${selected.length === 1 ? "" : "s"}` : ""}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Preview side panel */}
          {isDesignOpen && <PreviewSidePanel design={design} />}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}