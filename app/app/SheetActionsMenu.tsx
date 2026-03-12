"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { copySheet, deleteSheet, renameSheet } from "./actions";

type ModalMode = "rename" | "copy" | "delete" | null;

export default function SheetActionsMenu({
  sheetId,
  sheetTitle,
}: {
  sheetId: string;
  sheetTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [draftTitle, setDraftTitle] = useState(sheetTitle);

  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setOpen(false);

  const openRenameModal = () => {
    setDraftTitle(sheetTitle);
    setModalMode("rename");
    setOpen(false);
  };

  const openCopyModal = () => {
    setDraftTitle(`${sheetTitle} Copy`);
    setModalMode("copy");
    setOpen(false);
  };

  const openDeleteModal = () => {
    setModalMode("delete");
    setOpen(false);
  };

  const closeModal = () => {
    setModalMode(null);
    setDraftTitle(sheetTitle);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-lg text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
        >
          ⋯
        </button>

        {open && (
          <div className="absolute right-0 z-20 mt-3 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-200/70">
            <div className="mb-2 border-b border-slate-100 px-3 py-2">
              <p className="truncate text-sm font-semibold text-slate-900">
                {sheetTitle}
              </p>
              <p className="text-xs text-slate-500">Sheet actions</p>
            </div>

            <Link
              href={`/app/sheet/${sheetId}/editor`}
              className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              onClick={closeMenu}
            >
              Open
            </Link>

            <button
              type="button"
              onClick={openRenameModal}
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Rename
            </button>

            <button
              type="button"
              onClick={openCopyModal}
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Copy
            </button>

            <button
              type="button"
              onClick={openDeleteModal}
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 shadow-2xl">
            {modalMode === "rename" && (
              <>
                <div className="mb-5">
                  <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Rename
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                    Rename Sheet
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Update the name of this sheet so it’s easier to find later.
                  </p>
                </div>

                <form action={renameSheet} className="space-y-5">
                  <input type="hidden" name="sheetId" value={sheetId} />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Sheet name
                    </label>
                    <input
                      type="text"
                      name="newTitle"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200"
                      placeholder="Sheet name"
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalMode === "copy" && (
              <>
                <div className="mb-5">
                  <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Duplicate
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                    Copy Sheet
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Create a duplicate of this sheet with a new name.
                  </p>
                </div>

                <form action={copySheet} className="space-y-5">
                  <input type="hidden" name="sheetId" value={sheetId} />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      New sheet name
                    </label>
                    <input
                      type="text"
                      name="newTitle"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200"
                      placeholder="Copied sheet name"
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Create Copy
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalMode === "delete" && (
              <>
                <div className="mb-5">
                  <div className="mb-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
                    Warning
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                    Delete Sheet
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Are you sure you want to permanently delete{" "}
                    <span className="font-semibold text-slate-900">
                      {sheetTitle}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>

                <form action={deleteSheet}>
                  <input type="hidden" name="sheetId" value={sheetId} />

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      Delete Sheet
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}