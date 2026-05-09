"use client";

import { useEffect, useRef, useState } from "react";

type LabelResult = {
  id: string;
  foodName: string;
  description: string | null;
  diets: string[] | null;
  sheet: { id: string; title: string };
};

const DIET_COLORS: Record<string, string> = {
  "Contains Gluten": "#d97706",
  "Contains Dairy": "#2563eb",
  "Contains Eggs": "#ca8a04",
  "Contains Soy": "#16a34a",
  "Contains Nuts": "#b45309",
  "Contains Shellfish": "#0891b2",
  "Contains Sesame": "#7c3aed",
  "Contains Fish": "#0369a1",
  Vegetarian: "#15803d",
  Vegan: "#166534",
};

function buildPrintHtml(labels: LabelResult[]): string {
  const labelCards = labels
    .map((label) => {
      const diets = Array.isArray(label.diets) ? label.diets : [];
      const dietBadges = diets
        .map((d) => {
          const color = DIET_COLORS[d] ?? "#475569";
          return `<span style="display:inline-block;margin:2px 3px 2px 0;padding:2px 8px;border-radius:999px;border:1px solid ${color}33;background:${color}11;color:${color};font-size:9px;font-weight:700;letter-spacing:0.04em;">${d}</span>`;
        })
        .join("");

      return `
        <div style="break-inside:avoid;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;background:#fff;margin-bottom:12px;">
          <div style="font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:800;color:#0f172a;margin-bottom:4px;line-height:1.3;">${label.foodName}</div>
          ${label.description ? `<div style="font-family:'Inter',Arial,sans-serif;font-size:11px;color:#64748b;margin-bottom:6px;line-height:1.5;">${label.description}</div>` : ""}
          ${dietBadges ? `<div style="margin-top:4px;">${dietBadges}</div>` : ""}
          <div style="margin-top:8px;padding-top:6px;border-top:1px solid #f1f5f9;font-family:'Inter',Arial,sans-serif;font-size:9px;color:#94a3b8;">${label.sheet.title}</div>
        </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Quick Print — ${labels.length} Label${labels.length === 1 ? "" : "s"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',Arial,sans-serif;background:#f8fafc;padding:24px;}
    h1{font-size:13px;font-weight:700;color:#64748b;margin-bottom:16px;letter-spacing:0.06em;text-transform:uppercase;}
    .grid{columns:2;column-gap:16px;}
    @media print{
      body{padding:0;background:#fff;}
      h1{display:none;}
      @page{margin:12mm 10mm;}
    }
  </style>
</head>
<body>
  <h1>Quick Print &mdash; ${labels.length} Label${labels.length === 1 ? "" : "s"}</h1>
  <div class="grid">${labelCards}</div>
  <script>window.onload=function(){window.print();}<\/script>
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
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]" style={{ maxHeight: "88vh" }}>

              {/* Header */}
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-1 inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
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
                    className="mt-1 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-500/15"
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
                    <svg className="mb-3 h-10 w-10 opacity-40" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">Start typing to search your labels</p>
                    <p className="mt-1 text-xs">Searches food names and ingredient descriptions</p>
                  </div>
                ) : results.length === 0 && !isSearching ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                    <p className="text-sm font-medium">No labels found for &ldquo;{query}&rdquo;</p>
                    <p className="mt-1 text-xs">Try a different search term</p>
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
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-semibold text-slate-900">{label.foodName}</span>
                              <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-500">
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
                                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
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

              {/* Selected tray + print */}
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                {selected.length > 0 ? (
                  <>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Selected — {selected.length} label{selected.length === 1 ? "" : "s"}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {selected.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm"
                        >
                          {s.foodName}
                          <button
                            type="button"
                            onClick={() => removeSelected(s.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="mb-4 text-sm text-slate-400">
                    Select labels above to add them to your print set.
                  </p>
                )}

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={print}
                    disabled={selected.length === 0}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9v-1h8v1H6v1H7v-1h6v1H6zm8-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                    </svg>
                    Print {selected.length > 0 ? `${selected.length} Label${selected.length === 1 ? "" : "s"}` : ""}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
}