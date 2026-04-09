"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createFolder, deleteFolder, renameFolder } from "./actions";

type Folder = { id: string; name: string };
type ModalMode = "create" | "rename" | "delete" | null;

export default function FolderBar({
  folders,
  selectedFolderId,
}: {
  folders: Folder[];
  selectedFolderId: string | null;
}) {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeFolder = folders.find((f) => f.id === activeFolderId) ?? null;

  const openCreate = () => {
    setDraftName("");
    setActiveFolderId(null);
    setModalMode("create");
  };

  const openRename = (folder: Folder) => {
    setActiveFolderId(folder.id);
    setDraftName(folder.name);
    closeMenu();
    setModalMode("rename");
  };

  const openDelete = (folder: Folder) => {
    setActiveFolderId(folder.id);
    closeMenu();
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveFolderId(null);
    setDraftName("");
  };

  const closeMenu = () => {
    setOpenMenuId(null);
    setMenuPos(null);
  };

  return (
    <>
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        {/* All Sheets tab */}
        <Link
          href="/app"
          className={`inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
            selectedFolderId === null
              ? "bg-slate-900 text-white shadow-md"
              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          All Sheets
        </Link>

        {/* Folder tabs */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            ref={(el) => { menuRefs.current[folder.id] = el; }}
            className="relative shrink-0"
          >
            <div
              className={`inline-flex items-center gap-1 rounded-full transition ${
                selectedFolderId === folder.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Link
                href={`/app?folder=${folder.id}`}
                className="pl-4 pr-2 py-2 text-sm font-semibold"
              >
                {folder.name}
              </Link>

              <button
                type="button"
                onClick={(e) => {
                  if (openMenuId === folder.id) {
                    closeMenu();
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMenuPos({ top: rect.bottom + 8, left: rect.left });
                    setOpenMenuId(folder.id);
                  }
                }}
                className={`mr-1 flex h-6 w-6 items-center justify-center rounded-full text-xs transition ${
                  selectedFolderId === folder.id
                    ? "hover:bg-white/20 text-white"
                    : "hover:bg-slate-100 text-slate-500"
                }`}
                aria-label="Folder options"
              >
                ⋯
              </button>
            </div>

          </div>
        ))}

        {/* New folder button */}
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-transparent px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          New Folder
        </button>
      </div>

      {/* Fixed dropdown — rendered outside overflow container to avoid clipping */}
      {openMenuId && menuPos && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={closeMenu}
          />
          <div
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed z-40 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-200/70"
          >
            {folders.filter((f) => f.id === openMenuId).map((folder) => (
              <div key={folder.id}>
                <button
                  type="button"
                  onClick={() => openRename(folder)}
                  className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => openDelete(folder)}
                  className="flex w-full items-center rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 shadow-2xl">
            {modalMode === "create" && (
              <>
                <div className="mb-5">
                  <div className="mb-3 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                    New Folder
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                    Create Folder
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Give your folder a name to help organize your sheets.
                  </p>
                </div>

                <form action={createFolder} onSubmit={closeModal} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Folder name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200"
                      placeholder="e.g. Weddings, Corporate Events"
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
                      Create Folder
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalMode === "rename" && activeFolder && (
              <>
                <div className="mb-5">
                  <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Rename
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                    Rename Folder
                  </h3>
                </div>

                <form action={renameFolder} onSubmit={closeModal} className="space-y-5">
                  <input type="hidden" name="folderId" value={activeFolder.id} />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Folder name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200"
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

            {modalMode === "delete" && activeFolder && (
              <>
                <div className="mb-5">
                  <div className="mb-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
                    Warning
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                    Delete Folder
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-slate-900">
                      {activeFolder.name}
                    </span>
                    ? The sheets inside will not be deleted — they'll move back to All Sheets.
                  </p>
                </div>

                <form action={deleteFolder} onSubmit={closeModal}>
                  <input type="hidden" name="folderId" value={activeFolder.id} />

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
                      Delete Folder
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
