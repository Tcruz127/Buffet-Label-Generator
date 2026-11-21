"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkle } from "./Brand";
import LabelCard, { DIET_TAGS, LABEL_THEMES, type DietTag, type LabelThemeId } from "./LabelCard";

const DEMO_THEMES: LabelThemeId[] = ["classic", "elegant", "corporate"];

/** Hero "type a dish, watch the label" demo. Runs entirely in the browser; nothing is saved. */
export default function HeroDemo() {
  const [name, setName] = useState("Chicken Marsala");
  const [ingredients, setIngredients] = useState("cremini mushrooms, marsala wine sauce");
  const [tags, setTags] = useState<DietTag[]>(["Contains Dairy", "Contains Gluten"]);
  const [theme, setTheme] = useState<LabelThemeId>("classic");

  const toggleTag = (tag: DietTag) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
      {/* Controls */}
      <div className="rounded-[1.75rem] bg-white p-5 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.25)] sm:p-6">
        <label htmlFor="demo-dish" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          Try it — type a dish
        </label>
        <input
          id="demo-dish"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="e.g. Chicken Marsala"
          className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-lg font-semibold outline-none transition focus:border-violet-400"
        />
        <input
          aria-label="Ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          maxLength={70}
          placeholder="Ingredients (optional)"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400"
        />

        <div className="mt-4 flex flex-wrap gap-1.5">
          {DIET_TAGS.map((tag) => {
            const on = tags.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                aria-pressed={on}
                onClick={() => toggleTag(tag.value)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  on
                    ? "border-violet-300 bg-violet-50 text-violet-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {tag.icon} {tag.value}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Style</span>
          {DEMO_THEMES.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={theme === id}
              onClick={() => setTheme(id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                theme === id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {LABEL_THEMES[id].name}
            </button>
          ))}
        </div>

        <Link
          href="/signup"
          className="mt-5 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110"
        >
          Make a full sheet — start free
        </Link>
      </div>

      {/* Live label on a sheet */}
      <div className="relative mx-auto w-full max-w-md lg:max-w-none">
        <div className="absolute -inset-4 rotate-2 rounded-[2rem] bg-gradient-to-br from-cyan-200/60 to-purple-200/60" aria-hidden="true" />
        <div className="relative grid grid-cols-2 gap-3 rounded-[1.5rem] bg-white p-4 shadow-2xl">
          <LabelCard name={name} ingredients={ingredients} tags={tags} theme={theme} className="col-span-2 shadow-sm" />
          <LabelCard name="Caesar Salad" tags={["Contains Dairy", "Contains Eggs"]} theme={theme} className="opacity-70" />
          <LabelCard name="Garlic Bread" tags={["Vegetarian", "Contains Gluten"]} theme={theme} className="opacity-70" />
        </div>
        <div className="absolute -bottom-4 -left-3 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-xl ring-1 ring-violet-100">
          <Sparkle className="h-3 w-3 text-purple-500" /> Updates as you type
        </div>
      </div>
    </div>
  );
}
