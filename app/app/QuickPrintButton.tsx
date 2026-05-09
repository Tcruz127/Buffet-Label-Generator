"use client";

import { useEffect, useRef, useState } from "react";

type LabelResult = {
  id: string;
  foodName: string;
  description: string | null;
  diets: string[] | null;
  sheet: { id: string; title: string };
};

function buildPrintHtml(labels: LabelResult[]): string {
  // Group into sheets of 10 — same as the label editor
  const sheets: LabelResult[][] = [];
  for (let i = 0; i < labels.length; i += 10) {
    sheets.push(labels.slice(i, i + 10));
  }

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
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Quick Print</title>
<style>
  @page { size: Letter portrait; margin: 0; }
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0 !important; padding: 0 !important; background: white !important; color: #000 !important; font-family: Arial, sans-serif !important; width: 100% !important; height: auto !important; }
  .print-wrap { width: 100% !important; margin: 0 !important; padding: 0 !important; }
  .sheet-preview { display: block !important; width: 8.5in !important; height: 11in !important; margin: 0 !important; padding: 0.5in !important; box-sizing: border-box !important; background: white !important; border: none !important; box-shadow: none !important; border-radius: 0 !important; overflow: hidden !important; page-break-after: always !important; break-after: page !important; }
  .sheet-preview:last-child { page-break-after: auto !important; break-after: auto !important; }
  .labels { display: grid !important; grid-template-columns: repeat(2, 3.5in) !important; grid-template-rows: repeat(5, 2in) !important; column-gap: 0 !important; row-gap: 0 !important; width: 7in !important; height: 10in !important; margin-left: auto !important; margin-right: auto !important; padding: 0 !important; background: white !important; border: none !important; box-shadow: none !important; }
  .label { width: 3.5in !important; height: 2in !important; box-sizing: border-box !important; overflow: hidden !important; page-break-inside: avoid !important; break-inside: avoid !important; border: none !important; border-radius: 0 !important; box-shadow: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .label:nth-child(even) { position: relative !important; left: -0.05in !important; }
  .label-content { width: 100% !important; height: 100% !important; display: flex !important; flex-direction: column !important; justify-content: center !important; align-items: center !important; text-align: center !important; box-sizing: border-box !important; padding: 10px 16px 10px 12px !important; }
  .dish-name { font-family: Arial, sans-serif; font-size: 20px; font-weight: 700; color: #111111; line-height: 1.1; word-break: break-word; width: 100% !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .description-line { font-family: Arial, sans-serif; font-size: 12px; color: #555555; margin-top: 4px; width: 100% !important; }
  .label-divider { width: 40px; height: 1px; background: #cccccc; margin: 6px auto 4px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .allergen-line { font-family: Arial, sans-serif; font-size: 12px; color: #444444; margin-top: 0; width: 100% !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
</style>
</head>
<body>
<div class="print-wrap">${sheetsHtml}</div>
<script>
window.onload = function () {
  document.querySelectorAll(".label,.label-content,.sheet-preview").forEach(function(el){
    el.style.border = "none";
    el.style.borderRadius = "0";
    el.style.boxShadow = "none";
    el.style.outline = "none";
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

export default function QuickPrintButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LabelResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selected, setSelected] = useState<LabelResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelected([]);
    }
  }, [isOpen]);

  // Debounced search
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
        const res = await fetch(
          `/api/labels/search?q=${encodeURIComponent(query.trim())}`
        );
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

  const toggle = (label: LabelResult) => {
    setSelected((prev) =>
      isSelected(label.id) ? prev.filter((s) => s.id !== label.id) : [...prev, label]
    );
  };

  const removeSelected = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  };

  const print = () => {
    if (!selected.length) return;
    const html = buildPrintHtml(selected);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
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

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]" style={{ maxHeight: "90vh" }}>

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

              {/* Search input */}
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

            {/* Results list */}
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
                        className={`flex cursor-pointer items-start gap-4 px-6 py-4 transition ${
                          checked ? "bg-cyan-50" : "hover:bg-slate-50"
                        }`}
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
                            <span className="font-semibold text-slate-900 leading-snug">{label.foodName}</span>
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
                                <span
                                  key={d}
                                  className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500"
                                >
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

            {/* Footer — selected tray + actions */}
            <div className="border-t border-slate-200 px-6 py-5">
              {selected.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {selected.length} label{selected.length === 1 ? "" : "s"} selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800"
                      >
                        {s.foodName}
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
                    ))}
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
        </div>
      )}
    </>
  );
}