"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "instabels_onboarded";

export default function OnboardingModal({ userName }: { userName: string }) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const done = localStorage.getItem(STORAGE_KEY);
      if (!done) setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const getStarted = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    router.push("/app/new");
  };

  if (!visible) return null;

  const firstName = userName.split(" ")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="rounded-t-[2rem] bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(168,85,247,0.10))] px-8 pt-8 pb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 shadow-lg shadow-cyan-500/25">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 0 0 2.25 2.25h.75" />
            </svg>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Welcome to Instabels{firstName ? `, ${firstName}` : ""}!
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            You're all set. Here's how to create your first buffet label sheet in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 px-8 py-6">
          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-400 text-sm font-black text-white shadow-sm">
              1
            </div>
            <div>
              <p className="font-semibold text-slate-900">Create a sheet</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Name your event or occasion and set how many labels you need.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-400 text-sm font-black text-white shadow-sm">
              2
            </div>
            <div>
              <p className="font-semibold text-slate-900">Add your labels</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Fill in dish names, descriptions, and allergen info for each label.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-sm font-black text-white shadow-sm">
              3
            </div>
            <div>
              <p className="font-semibold text-slate-900">Print your labels</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Export polished, print-ready labels straight from the editor.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-8 py-5">
          <button
            type="button"
            onClick={dismiss}
            className="text-sm font-medium text-slate-400 transition hover:text-slate-600"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={getStarted}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
          >
            Create My First Sheet
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
