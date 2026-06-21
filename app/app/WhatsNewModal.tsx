"use client";

import { useEffect, useState } from "react";

// ─── UPDATE THESE TWO THINGS EACH RELEASE ────────────────────────────────────
const CURRENT_VERSION = "v1.4";

const PATCH_NOTES: { icon: string; title: string; description: string }[] = [
  {
    icon: "🎨",
    title: "Quick Print Design Panel",
    description: "Customize your labels before printing — change fonts, adjust text sizes, pick colors, and see a live preview, all without leaving Quick Print.",
  },
  {
    icon: "🖨️",
    title: "Quick Print",
    description: "Search all your labels across every sheet, pick the ones you need, and print them as a single custom sheet — no editor required.",
  },
  {
    icon: "💬",
    title: "Sheet Comments",
    description: "Leave notes for your team directly inside the label editor. Comments are shared with everyone who has access to the sheet.",
  },
  {
    icon: "📝",
    title: "Feedback",
    description: "Have a suggestion or ran into something? Use the new Feedback button in the bottom-right corner to share your thoughts with us directly.",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "instabels_whats_new_seen";

export default function WhatsNewModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (seen !== CURRENT_VERSION) setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="rounded-t-[2rem] bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(168,85,247,0.10))] px-8 pt-8 pb-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-2.5 py-0.5 text-xs font-black text-white">
              {CURRENT_VERSION}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              What&apos;s New
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            Instabels just got better
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what we shipped in this update.
          </p>
        </div>

        {/* Notes list */}
        <div className="max-h-[55vh] overflow-y-auto px-8 py-5">
          <ul className="space-y-3">
            {PATCH_NOTES.map((note, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <span className="mt-0.5 text-lg leading-none">{note.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900">{note.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{note.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 rounded-b-[2rem] border-t border-slate-100 px-8 py-5">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
          >
            Got it
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
