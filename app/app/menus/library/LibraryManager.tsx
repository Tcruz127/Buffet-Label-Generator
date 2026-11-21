"use client";

import { useState, useTransition } from "react";
import type { Library, LibraryPackage, LibrarySection } from "@/lib/menuContent";
import {
  createDish,
  createPackage,
  createSection,
  deleteDish,
  deletePackage,
  deleteSection,
  renamePackage,
  renameSection,
  reorderSections,
  updateDish,
} from "../actions";

type Dish = LibrarySection["dishes"][number];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100";

export default function LibraryManager({ initialLibrary }: { initialLibrary: Library }) {
  const [packages, setPackages] = useState(initialLibrary.packages);
  const [sections, setSections] = useState(initialLibrary.sections);
  const [activePackageId, setActivePackageId] = useState<string | null>(
    initialLibrary.packages[0]?.id ?? null
  );
  const [newSectionName, setNewSectionName] = useState("");
  const [newPackageName, setNewPackageName] = useState("");
  const [showNewPackage, setShowNewPackage] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<void>) => {
    setError("");
    startTransition(async () => {
      try {
        await action();
      } catch {
        setError("Something went wrong saving that change. Please try again.");
      }
    });
  };

  // Sections created before menu types existed have no package; show them under "Unsorted".
  const hasUnsorted = sections.some((s) => s.packageId === null);
  const activePackage = packages.find((p) => p.id === activePackageId) ?? null;
  const visibleSections = sections.filter((s) => s.packageId === activePackageId);

  const updateSectionState = (id: string, update: (s: LibrarySection) => LibrarySection) =>
    setSections((prev) => prev.map((s) => (s.id === id ? update(s) : s)));

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= visibleSections.length) return;
    const reordered = [...visibleSections];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setSections((prev) => [...prev.filter((s) => s.packageId !== activePackageId), ...reordered]);
    run(() => reorderSections(reordered.map((s) => s.id)));
  };

  const addSection = () => {
    if (!newSectionName.trim()) return;
    run(async () => {
      const section = await createSection(newSectionName, activePackageId);
      setSections((prev) => [...prev, section]);
      setNewSectionName("");
    });
  };

  const addPackage = () => {
    if (!newPackageName.trim()) return;
    run(async () => {
      const menuPackage = await createPackage(newPackageName);
      setPackages((prev) => [...prev, menuPackage]);
      setActivePackageId(menuPackage.id);
      setNewPackageName("");
      setShowNewPackage(false);
    });
  };

  return (
    <div className="space-y-5">
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}

      {/* Menu type tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {packages.map((p) => (
          <TabButton key={p.id} active={p.id === activePackageId} onClick={() => setActivePackageId(p.id)}>
            {p.name}
          </TabButton>
        ))}
        {hasUnsorted && (
          <TabButton active={activePackageId === null} onClick={() => setActivePackageId(null)}>
            Unsorted
          </TabButton>
        )}
        {showNewPackage ? (
          <span className="flex items-center gap-2">
            <input
              className={`${inputClass} w-52`}
              value={newPackageName}
              onChange={(e) => setNewPackageName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPackage()}
              placeholder="e.g. Plated Lunch"
              autoFocus
            />
            <button type="button" disabled={isPending || !newPackageName.trim()} onClick={addPackage} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              Add
            </button>
            <SmallButton onClick={() => setShowNewPackage(false)}>Cancel</SmallButton>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewPackage(true)}
            className="rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700"
          >
            + Menu type
          </button>
        )}
      </div>

      {activePackage && (
        <PackageHeader
          key={activePackage.id}
          menuPackage={activePackage}
          sectionCount={visibleSections.length}
          disabled={isPending}
          onRename={(name) =>
            run(async () => {
              await renamePackage(activePackage.id, name);
              setPackages((prev) =>
                prev.map((p) => (p.id === activePackage.id ? { ...p, name: name.trim() } : p))
              );
            })
          }
          onDelete={() =>
            run(async () => {
              await deletePackage(activePackage.id);
              const remaining = packages.filter((p) => p.id !== activePackage.id);
              setPackages(remaining);
              setSections((prev) => prev.filter((s) => s.packageId !== activePackage.id));
              setActivePackageId(remaining[0]?.id ?? null);
            })
          }
        />
      )}

      {visibleSections.map((section, index) => (
        <SectionCard
          key={section.id}
          section={section}
          isFirst={index === 0}
          isLast={index === visibleSections.length - 1}
          disabled={isPending}
          onMove={(direction) => moveSection(index, direction)}
          onRename={(name) =>
            run(async () => {
              await renameSection(section.id, name);
              updateSectionState(section.id, (s) => ({ ...s, name: name.trim().toUpperCase() }));
            })
          }
          onDelete={() =>
            run(async () => {
              await deleteSection(section.id);
              setSections((prev) => prev.filter((s) => s.id !== section.id));
            })
          }
          onAddDish={(name, description) =>
            run(async () => {
              const dish = await createDish(section.id, name, description);
              updateSectionState(section.id, (s) => ({ ...s, dishes: [...s.dishes, dish] }));
            })
          }
          onUpdateDish={(dishId, name, description) =>
            run(async () => {
              await updateDish(dishId, name, description);
              updateSectionState(section.id, (s) => ({
                ...s,
                dishes: s.dishes.map((d) =>
                  d.id === dishId ? { ...d, name: name.trim(), description: description.trim() } : d
                ),
              }));
            })
          }
          onDeleteDish={(dishId) =>
            run(async () => {
              await deleteDish(dishId);
              updateSectionState(section.id, (s) => ({
                ...s,
                dishes: s.dishes.filter((d) => d.id !== dishId),
              }));
            })
          }
        />
      ))}

      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Add a section{activePackage ? ` to ${activePackage.name}` : ""}
        </div>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSection()}
            placeholder="e.g. Soup, Intermezzo, Late Night"
          />
          <button
            type="button"
            disabled={isPending || !newSectionName.trim()}
            onClick={addSection}
            className="shrink-0 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function PackageHeader({
  menuPackage,
  sectionCount,
  disabled,
  onRename,
  onDelete,
}: {
  menuPackage: LibraryPackage;
  sectionCount: number;
  disabled: boolean;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(menuPackage.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (renaming) {
    return (
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onRename(name);
          setRenaming(false);
        }}
      >
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <button type="submit" className="shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">Save</button>
        <button type="button" onClick={() => { setName(menuPackage.name); setRenaming(false); }} className="shrink-0 rounded-xl px-3 text-sm text-slate-500 hover:bg-slate-100">Cancel</button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <span className="flex-1">
        Sections staff can pick from when building a{" "}
        <span className="font-semibold text-slate-800">{menuPackage.name}</span> menu.
      </span>
      <SmallButton onClick={() => setRenaming(true)}>Rename type</SmallButton>
      {confirmDelete ? (
        <span className="flex items-center gap-1.5">
          <span className="text-xs">
            Delete {menuPackage.name} and its {sectionCount} {sectionCount === 1 ? "section" : "sections"}? Built
            menus are kept.
          </span>
          <button type="button" disabled={disabled} onClick={onDelete} className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">Delete</button>
          <SmallButton onClick={() => setConfirmDelete(false)}>Cancel</SmallButton>
        </span>
      ) : (
        <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-full px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete type</button>
      )}
    </div>
  );
}

function SectionCard({
  section,
  isFirst,
  isLast,
  disabled,
  onMove,
  onRename,
  onDelete,
  onAddDish,
  onUpdateDish,
  onDeleteDish,
}: {
  section: LibrarySection;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
  onMove: (direction: -1 | 1) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onAddDish: (name: string, description: string) => void;
  onUpdateDish: (dishId: string, name: string, description: string) => void;
  onDeleteDish: (dishId: string) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(section.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adding, setAdding] = useState(false);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {renaming ? (
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              onRename(name);
              setRenaming(false);
            }}
          >
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            <button type="submit" className="shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">Save</button>
            <button type="button" onClick={() => { setName(section.name); setRenaming(false); }} className="shrink-0 rounded-xl px-3 text-sm text-slate-500 hover:bg-slate-100">Cancel</button>
          </form>
        ) : (
          <>
            <h2 className="flex-1 text-lg font-bold tracking-wide text-slate-950">{section.name}</h2>
            <SmallButton disabled={disabled || isFirst} onClick={() => onMove(-1)}>↑</SmallButton>
            <SmallButton disabled={disabled || isLast} onClick={() => onMove(1)}>↓</SmallButton>
            <SmallButton onClick={() => setRenaming(true)}>Rename</SmallButton>
            {confirmDelete ? (
              <span className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">
                  Delete section and its {section.dishes.length} {section.dishes.length === 1 ? "dish" : "dishes"}?
                </span>
                <button type="button" disabled={disabled} onClick={onDelete} className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">Delete</button>
                <SmallButton onClick={() => setConfirmDelete(false)}>Cancel</SmallButton>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-full px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
            )}
          </>
        )}
      </div>

      <ul className="space-y-2">
        {section.dishes.map((dish) => (
          <DishRow
            key={dish.id}
            dish={dish}
            disabled={disabled}
            onSave={(n, d) => onUpdateDish(dish.id, n, d)}
            onDelete={() => onDeleteDish(dish.id)}
          />
        ))}
        {section.dishes.length === 0 && <li className="text-sm text-slate-400">No dishes yet.</li>}
      </ul>

      {adding ? (
        <DishForm
          submitLabel="Add dish"
          disabled={disabled}
          onSubmit={(n, d) => {
            onAddDish(n, d);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-3 w-full rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700"
        >
          + Add dish
        </button>
      )}
    </section>
  );
}

function DishRow({
  dish,
  disabled,
  onSave,
  onDelete,
}: {
  dish: Dish;
  disabled: boolean;
  onSave: (name: string, description: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (editing) {
    return (
      <li>
        <DishForm
          initialName={dish.name}
          initialDescription={dish.description}
          submitLabel="Save"
          disabled={disabled}
          onSubmit={(n, d) => {
            onSave(n, d);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-slate-900">{dish.name}</div>
        {dish.description && (
          <div className="mt-0.5 whitespace-pre-line text-xs text-slate-500">{dish.description}</div>
        )}
      </div>
      {confirmDelete ? (
        <span className="flex shrink-0 items-center gap-1.5">
          <button type="button" disabled={disabled} onClick={onDelete} className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">Delete</button>
          <SmallButton onClick={() => setConfirmDelete(false)}>Cancel</SmallButton>
        </span>
      ) : (
        <span className="flex shrink-0 items-center gap-1">
          <SmallButton onClick={() => setEditing(true)}>Edit</SmallButton>
          <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-full px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </span>
      )}
    </li>
  );
}

function DishForm({
  initialName = "",
  initialDescription = "",
  submitLabel,
  disabled,
  onSubmit,
  onCancel,
}: {
  initialName?: string;
  initialDescription?: string;
  submitLabel: string;
  disabled: boolean;
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  return (
    <form
      className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onSubmit(name, description);
      }}
    >
      <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Dish name" autoFocus />
      <textarea
        className={`${inputClass} min-h-[72px]`}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description — each line prints on its own line"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={disabled || !name.trim()} className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100">
          Cancel
        </button>
      </div>
    </form>
  );
}

function SmallButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
