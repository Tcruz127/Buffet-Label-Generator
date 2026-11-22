"use client";

import { useState, useTransition } from "react";
import { deleteSignSet, duplicateSignSet, renameSignSet } from "./actions";

export default function SignSetRowActions({ signSetId, title }: { signSetId: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(title);
  const [isPending, startTransition] = useTransition();

  if (renaming) {
    const save = () =>
      startTransition(async () => {
        await renameSignSet(signSetId, name);
        setRenaming(false);
      });
    return (
      <form
        className="flex flex-1 items-center gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          autoFocus
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setRenaming(false)}
          placeholder="Sign set name"
          aria-label="Sign set name"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-900 outline-none focus:border-cyan-400"
        />
        <button type="submit" disabled={isPending} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">
          {isPending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setRenaming(false)} className="rounded-full px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100">
          Cancel
        </button>
      </form>
    );
  }

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
        onClick={() => {
          setName(title);
          setRenaming(true);
        }}
        className="rounded-full px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
      >
        Rename
      </button>
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
