"use client";

import { useState, useTransition } from "react";
import { deleteSignSet, duplicateSignSet } from "./actions";

export default function SignSetRowActions({ signSetId }: { signSetId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-slate-500">Delete?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => deleteSignSet(signSetId))}
          className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "Deleting…" : "Delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => duplicateSignSet(signSetId))}
        className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
      >
        Duplicate
      </button>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-full px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}
