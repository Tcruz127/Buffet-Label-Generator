"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

type State = "idle" | "submitting" | "success" | "error";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");

  const reset = () => {
    setRating(null);
    setHovered(null);
    setMessage("");
    setState("idle");
  };

  const close = () => {
    setOpen(false);
    setTimeout(reset, 300);
  };

  const submit = async () => {
    if (!message.trim()) return;
    setState("submitting");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, message }),
      });
      if (!res.ok) throw new Error();
      setState("success");
      setTimeout(close, 2000);
    } catch {
      setState("error");
    }
  };

  const displayRating = hovered ?? rating;

  const modal = open ? (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-6 sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={close}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-[2rem] bg-[linear-gradient(135deg,rgba(34,211,238,0.10),rgba(168,85,247,0.08))] px-6 py-5">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-950">
              Share your feedback
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Help us improve Instabels
            </p>
          </div>
          <button
            onClick={close}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {state === "success" ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-900">Thanks for your feedback!</p>
            <p className="text-sm text-slate-500">We appreciate you taking the time.</p>
          </div>
        ) : (
          <div className="px-6 py-5">
            {/* Star rating */}
            <div className="mb-5">
              <p className="mb-2 text-sm font-semibold text-slate-700">
                How would you rate Instabels?
              </p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(null)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg
                      className={`h-8 w-8 transition-colors ${
                        displayRating !== null && star <= displayRating
                          ? "text-amber-400"
                          : "text-slate-200"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
                    </svg>
                  </button>
                ))}
              </div>
              {displayRating && (
                <p className="mt-1.5 text-xs text-slate-400">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][displayRating]}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tell us more <span className="font-normal text-slate-400">(required)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="What's working well? What could be better?"
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
              <p
                className={`mt-1 text-right text-xs ${
                  message.length > 1800 ? "text-amber-500" : "text-slate-400"
                }`}
              >
                {message.length}/2000
              </p>
            </div>

            {state === "error" && (
              <p className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
                Something went wrong. Please try again.
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!message.trim() || state === "submitting"}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state === "submitting" ? "Sending..." : "Send feedback"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        <svg className="h-4 w-4 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.671 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579c.605.062 1.218.094 1.84.1 2.236 0 4.43-.18 6.57-.524C19.007 13.245 20 11.986 20 10.574V5.426c0-1.413-.993-2.671-2.43-2.902A41.102 41.102 0 0 0 10 2Z" clipRule="evenodd" />
        </svg>
        Feedback
      </button>

      {typeof window !== "undefined" && modal
        ? createPortal(modal, document.body)
        : null}
    </>
  );
}