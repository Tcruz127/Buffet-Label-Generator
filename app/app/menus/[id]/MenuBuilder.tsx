"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import MenuSheet, {
  BorderFrame,
  CourseDivider,
  HeaderDivider,
  MENU_FONT_CLASSES,
  type MenuSelection,
} from "../MenuSheet";
import { createDish, createSection, duplicateMenu, saveMenu, setMenuLogo } from "../actions";
import { imageFileToPngDataUrl, logoFileError } from "@/lib/imageFile";
import {
  formatMenuDate,
  type LibrarySection,
  type MenuContent,
  type MenuDesign,
  type MenuDishEntry,
  type MenuSectionEntry,
} from "@/lib/menuContent";

type MenuBuilderProps = {
  menu: {
    id: string;
    welcomeText: string;
    hostName: string;
    eventDate: string | null;
    logoData: string | null;
    content: MenuContent;
  };
  packageId: string | null;
  packageName: string | null;
  library: LibrarySection[];
};

type SaveStatus = "saved" | "editing" | "saving" | "error";

export default function MenuBuilder({
  menu,
  packageId,
  packageName,
  library: initialLibrary,
}: MenuBuilderProps) {
  const [welcomeText, setWelcomeText] = useState(menu.welcomeText);
  const [hostName, setHostName] = useState(menu.hostName);
  const [eventDate, setEventDate] = useState(menu.eventDate ?? "");
  const [logo, setLogo] = useState<string | null>(menu.logoData);
  const [sections, setSections] = useState<MenuSectionEntry[]>(menu.content.sections);
  const [design, setDesign] = useState<MenuDesign>(menu.content.design);
  const [library, setLibrary] = useState(initialLibrary);
  const [selection, setSelection] = useState<MenuSelection>(
    menu.hostName ? null : { type: "header" }
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isDuplicating, startDuplicate] = useTransition();

  // Debounced autosave whenever the menu changes.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveStatus("editing");
    const timer = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await saveMenu(menu.id, {
          welcomeText,
          hostName,
          eventDate: eventDate || null,
          content: { sections, design },
        });
        setSaveStatus("saved");
      } catch (error) {
        console.error("Menu save failed:", error);
        setSaveStatus("error");
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [menu.id, welcomeText, hostName, eventDate, sections, design]);

  const dateLabel = formatMenuDate(eventDate);
  const activeSection =
    selection?.type === "section" ? sections[selection.index] ?? null : null;

  const updateSection = (index: number, update: (s: MenuSectionEntry) => MenuSectionEntry) =>
    setSections((prev) => prev.map((s, i) => (i === index ? update(s) : s)));

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSections((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSelection({ type: "section", index: target });
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
    setSelection(null);
  };

  const addSection = (section: MenuSectionEntry) => {
    setSections((prev) => [...prev, section]);
    setSelection({ type: "section", index: sections.length });
  };

  return (
    <main className="min-h-screen print:min-h-0 print:bg-none print:bg-white bg-[linear-gradient(to_bottom,#f8fbff_0%,#f6f8fc_45%,#ffffff_100%)] text-slate-900">
      <style>{`
        @media print {
          @page { size: letter landscape; margin: 0; }
          html, body { background: #fff !important; }
        }
      `}</style>

      {/* Screen UI */}
      <div className="print:hidden">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-6 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/app/menus"
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                ← Menus
              </Link>
              <h1 className="truncate text-lg font-bold text-slate-950">
                {hostName.trim() || "Untitled Menu"}
              </h1>
              {packageName && (
                <span className="hidden shrink-0 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 sm:inline">
                  {packageName}
                </span>
              )}
              <SaveBadge status={saveStatus} />
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/app/menus/library"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Dish Library
              </Link>
              <button
                type="button"
                onClick={() => setSelection({ type: "design" })}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  selection?.type === "design"
                    ? "border-cyan-300 bg-cyan-50 text-cyan-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                Design
              </button>
              <button
                type="button"
                disabled={isDuplicating}
                onClick={() => startDuplicate(() => duplicateMenu(menu.id))}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {isDuplicating ? "Duplicating…" : "Duplicate"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01]"
              >
                Print
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1600px] gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section>
            <p className="mb-3 text-sm text-slate-500">
              Click any part of the menu to edit it. Both copies print on one landscape page.
            </p>
            <ScaledSheet>
              <MenuSheet
                welcomeText={welcomeText}
                hostName={hostName}
                dateLabel={dateLabel}
                sections={sections}
                design={design}
                logo={logo}
                interactive={{ selection, onSelect: setSelection }}
              />
            </ScaledSheet>
          </section>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              {selection?.type === "header" && (
                <HeaderPanel
                  welcomeText={welcomeText}
                  hostName={hostName}
                  eventDate={eventDate}
                  onWelcomeText={setWelcomeText}
                  onHostName={setHostName}
                  onEventDate={setEventDate}
                  onDone={() => setSelection(null)}
                >
                  <LogoControls
                    menuId={menu.id}
                    logo={logo}
                    design={design}
                    onLogo={setLogo}
                    onDesign={setDesign}
                  />
                </HeaderPanel>
              )}

              {selection?.type === "design" && (
                <DesignPanel design={design} onChange={setDesign} onDone={() => setSelection(null)} />
              )}

              {selection?.type === "section" && activeSection && (
                <SectionPanel
                  key={selection.index}
                  section={activeSection}
                  index={selection.index}
                  total={sections.length}
                  library={library}
                  onChange={(update) => updateSection(selection.index, update)}
                  onMove={(direction) => moveSection(selection.index, direction)}
                  onRemove={() => removeSection(selection.index)}
                  onDishCreated={(sectionId, dish) =>
                    setLibrary((prev) =>
                      prev.map((s) =>
                        s.id === sectionId ? { ...s, dishes: [...s.dishes, dish] } : s
                      )
                    )
                  }
                  onDone={() => setSelection(null)}
                />
              )}

              {(selection === null || (selection.type === "section" && !activeSection)) && (
                <OverviewPanel
                  packageId={packageId}
                  sections={sections}
                  library={library}
                  onSelect={setSelection}
                  onAddSection={addSection}
                  onSectionCreated={(section) => setLibrary((prev) => [...prev, section])}
                />
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Print-only page */}
      {/* Slightly shorter than the page so rounding never spills onto a blank second page. */}
      <div className="hidden print:block print:h-[8.45in] print:overflow-hidden">
        <MenuSheet
          welcomeText={welcomeText}
          hostName={hostName}
          dateLabel={dateLabel}
          sections={sections}
          design={design}
          logo={logo}
        />
      </div>
    </main>
  );
}

/** Fits the 11in-wide sheet to the available width. */
function ScaledSheet({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / (11 * 96));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-2xl border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.10)]"
      style={{ height: `calc(8.5in * ${scale})` }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: "11in" }}>
        {children}
      </div>
    </div>
  );
}

function SaveBadge({ status }: { status: SaveStatus }) {
  const styles: Record<SaveStatus, [string, string]> = {
    saved: ["Saved", "bg-emerald-50 text-emerald-700"],
    editing: ["Editing…", "bg-slate-100 text-slate-600"],
    saving: ["Saving…", "bg-cyan-50 text-cyan-700"],
    error: ["Save failed — keep editing to retry", "bg-red-50 text-red-700"],
  };
  const [label, className] = styles[status];
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400";

function PanelTitle({ title, onDone }: { title: string; onDone?: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      {onDone && (
        <button
          type="button"
          onClick={onDone}
          className="rounded-full px-3 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
        >
          Done
        </button>
      )}
    </div>
  );
}

const FONT_OPTIONS: { value: MenuDesign["font"]; label: string }[] = [
  { value: "montserrat", label: "Montserrat" },
  { value: "raleway", label: "Raleway" },
  { value: "lato", label: "Lato" },
  { value: "playfair", label: "Playfair" },
  { value: "cormorant", label: "Cormorant" },
  { value: "garamond", label: "Garamond" },
];

const TEXT_SCALE_OPTIONS: { value: MenuDesign["textScale"]; label: string }[] = [
  { value: 0.85, label: "XS" },
  { value: 0.92, label: "S" },
  { value: 1, label: "M" },
  { value: 1.08, label: "L" },
  { value: 1.16, label: "XL" },
];

const DIVIDER_OPTIONS: { value: MenuDesign["divider"]; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "line", label: "Single line" },
  { value: "double", label: "Double line" },
  { value: "diamond", label: "Diamond" },
  { value: "none", label: "None" },
];

const COURSE_DIVIDER_OPTIONS: { value: MenuDesign["courseDivider"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "short", label: "Short line" },
  { value: "dots", label: "Dots" },
  { value: "diamond", label: "Diamond" },
];

const BORDER_OPTIONS: { value: MenuDesign["border"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "thin", label: "Thin" },
  { value: "double", label: "Double" },
  { value: "inset", label: "Inset" },
  { value: "rounded", label: "Rounded" },
  { value: "corners", label: "Corners" },
];

function DesignPanel({
  design,
  onChange,
  onDone,
}: {
  design: MenuDesign;
  onChange: (design: MenuDesign) => void;
  onDone: () => void;
}) {
  const set = <K extends keyof MenuDesign>(key: K, value: MenuDesign[K]) =>
    onChange({ ...design, [key]: value });

  return (
    <div>
      <PanelTitle title="Design" onDone={onDone} />

      <div className={labelClass}>Font</div>
      <div className="mb-5 grid grid-cols-3 gap-2">
        {FONT_OPTIONS.map((o) => (
          <OptionTile key={o.value} label={o.label} active={design.font === o.value} onClick={() => set("font", o.value)}>
            <span className={`${MENU_FONT_CLASSES[o.value]} text-2xl text-slate-700`}>Aa</span>
          </OptionTile>
        ))}
      </div>

      <div className={labelClass}>Text size</div>
      <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1">
        {TEXT_SCALE_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={design.textScale === o.value}
            onClick={() => set("textScale", o.value)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
              design.textScale === o.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className={labelClass}>Divider under heading</div>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {DIVIDER_OPTIONS.map((o) => (
          <OptionTile key={o.value} label={o.label} active={design.divider === o.value} onClick={() => set("divider", o.value)}>
            {o.value === "none" ? <NoneMark /> : <HeaderDivider style={o.value} width="130px" />}
          </OptionTile>
        ))}
      </div>

      <div className={labelClass}>Between courses</div>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {COURSE_DIVIDER_OPTIONS.map((o) => (
          <OptionTile key={o.value} label={o.label} active={design.courseDivider === o.value} onClick={() => set("courseDivider", o.value)}>
            {o.value === "none" ? <NoneMark /> : <CourseDivider style={o.value} width="80px" />}
          </OptionTile>
        ))}
      </div>

      <div className={labelClass}>Border</div>
      <div className="grid grid-cols-3 gap-2">
        {BORDER_OPTIONS.map((o) => (
          <OptionTile key={o.value} label={o.label} active={design.border === o.value} onClick={() => set("border", o.value)}>
            {o.value === "none" ? (
              <NoneMark />
            ) : (
              <div className="relative mx-auto h-12 w-9 bg-white">
                <BorderFrame border={o.value} scale={0.5} />
              </div>
            )}
          </OptionTile>
        ))}
      </div>
    </div>
  );
}

function OptionTile({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center gap-2 rounded-xl border px-2 py-3 transition ${
        active ? "border-cyan-400 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white hover:border-cyan-300"
      }`}
    >
      <div className="flex h-12 w-full items-center justify-center">{children}</div>
      <span className={`text-xs font-semibold ${active ? "text-cyan-800" : "text-slate-600"}`}>{label}</span>
    </button>
  );
}

function NoneMark() {
  return <span className="text-sm font-medium text-slate-300">None</span>;
}

function HeaderPanel(props: {
  welcomeText: string;
  hostName: string;
  eventDate: string;
  onWelcomeText: (v: string) => void;
  onHostName: (v: string) => void;
  onEventDate: (v: string) => void;
  onDone: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <PanelTitle title="Menu heading" onDone={props.onDone} />
      <div className="space-y-4">
        <div>
          <label className={labelClass} htmlFor="menu-welcome">Welcome line</label>
          <input
            id="menu-welcome"
            className={inputClass}
            value={props.welcomeText}
            onChange={(e) => props.onWelcomeText(e.target.value)}
            placeholder="WELCOME"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="menu-host">Client / group name</label>
          <input
            id="menu-host"
            className={inputClass}
            value={props.hostName}
            onChange={(e) => props.onHostName(e.target.value)}
            placeholder="e.g. Smith Wedding"
            autoFocus
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="menu-date">Event date</label>
          <input
            id="menu-date"
            type="date"
            className={inputClass}
            value={props.eventDate}
            onChange={(e) => props.onEventDate(e.target.value)}
          />
        </div>
        {props.children}
      </div>
    </div>
  );
}

const LOGO_POSITION_OPTIONS: { value: MenuDesign["logoPosition"]; label: string }[] = [
  { value: "top", label: "Above heading" },
  { value: "name", label: "Replace name" },
  { value: "bottom", label: "Bottom" },
];

const LOGO_SIZE_OPTIONS: { value: MenuDesign["logoSize"]; label: string }[] = [
  { value: "small", label: "S" },
  { value: "medium", label: "M" },
  { value: "large", label: "L" },
];

function LogoControls({
  menuId,
  logo,
  design,
  onLogo,
  onDesign,
}: {
  menuId: string;
  logo: string | null;
  design: MenuDesign;
  onLogo: (logo: string | null) => void;
  onDesign: (design: MenuDesign) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();

  const saveLogo = (next: string | null) =>
    startSaving(async () => {
      try {
        await setMenuLogo(menuId, next);
        onLogo(next);
      } catch {
        setError("Couldn't save the logo. Please try again.");
      }
    });

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    const fileError = logoFileError(file);
    if (fileError) {
      setError(fileError);
      return;
    }
    try {
      saveLogo(await imageFileToPngDataUrl(file));
    } catch {
      setError("That image couldn't be read. Try a PNG or JPG.");
    }
  };

  const segment = (active: boolean) =>
    `flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
      active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
    }`;

  return (
    <div className="border-t border-slate-100 pt-4">
      <div className={labelClass}>Group logo</div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {logo ? (
        <>
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-200 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL preview */}
            <img src={logo} alt="Group logo" className="h-12 w-20 object-contain" />
            <div className="flex flex-1 justify-end gap-1">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Replace
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => saveLogo(null)}
                className="rounded-full px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>

          <div className="mb-1 text-xs font-medium text-slate-500">Position</div>
          <div className="mb-3 flex gap-1 rounded-xl bg-slate-100 p-1">
            {LOGO_POSITION_OPTIONS.map((o) => (
              <button key={o.value} type="button" className={segment(design.logoPosition === o.value)} onClick={() => onDesign({ ...design, logoPosition: o.value })}>
                {o.label}
              </button>
            ))}
          </div>

          <div className="mb-1 text-xs font-medium text-slate-500">Size</div>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {LOGO_SIZE_OPTIONS.map((o) => (
              <button key={o.value} type="button" className={segment(design.logoSize === o.value)} onClick={() => onDesign({ ...design, logoSize: o.value })}>
                {o.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <button
          type="button"
          disabled={isSaving}
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl border border-dashed border-slate-300 px-3 py-3 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 disabled:opacity-50"
        >
          {isSaving ? "Uploading…" : "+ Upload logo"}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SectionPanel({
  section,
  index,
  total,
  library,
  onChange,
  onMove,
  onRemove,
  onDishCreated,
  onDone,
}: {
  section: MenuSectionEntry;
  index: number;
  total: number;
  library: LibrarySection[];
  onChange: (update: (s: MenuSectionEntry) => MenuSectionEntry) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onDishCreated: (sectionId: string, dish: LibrarySection["dishes"][number]) => void;
  onDone: () => void;
}) {
  const [search, setSearch] = useState("");
  const [showNewDish, setShowNewDish] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [error, setError] = useState("");
  const [isCreating, startCreate] = useTransition();

  const librarySection = library.find((s) => s.id === section.sectionId) ?? null;

  const options = useMemo(() => {
    const dishes = librarySection?.dishes ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return dishes;
    return dishes.filter(
      (d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
    );
  }, [librarySection, search]);

  const isOnMenu = (dishId: string) => section.dishes.some((d) => d.dishId === dishId);

  const toggleDish = (dish: LibrarySection["dishes"][number]) => {
    onChange((s) =>
      isOnMenu(dish.id)
        ? { ...s, dishes: s.dishes.filter((d) => d.dishId !== dish.id) }
        : { ...s, dishes: [...s.dishes, { dishId: dish.id, name: dish.name, description: dish.description }] }
    );
  };

  const moveDish = (dishIndex: number, direction: -1 | 1) => {
    const target = dishIndex + direction;
    if (target < 0 || target >= section.dishes.length) return;
    onChange((s) => {
      const dishes = [...s.dishes];
      [dishes[dishIndex], dishes[target]] = [dishes[target], dishes[dishIndex]];
      return { ...s, dishes };
    });
  };

  const removeDish = (dishIndex: number) =>
    onChange((s) => ({ ...s, dishes: s.dishes.filter((_, i) => i !== dishIndex) }));

  const submitNewDish = () => {
    if (!librarySection || !newName.trim()) return;
    setError("");
    startCreate(async () => {
      try {
        const dish = await createDish(librarySection.id, newName, newDescription);
        onDishCreated(librarySection.id, dish);
        const entry: MenuDishEntry = { dishId: dish.id, name: dish.name, description: dish.description };
        onChange((s) => ({ ...s, dishes: [...s.dishes, entry] }));
        setNewName("");
        setNewDescription("");
        setShowNewDish(false);
      } catch {
        setError("Couldn't save that dish. Please try again.");
      }
    });
  };

  return (
    <div>
      <PanelTitle title={section.name || "Section"} onDone={onDone} />

      {/* On this menu */}
      <div className="mb-5">
        <div className={labelClass}>On this menu</div>
        {section.dishes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 px-3 py-3 text-sm text-slate-400">
            Nothing yet — pick dishes below.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {section.dishes.map((dish, i) => (
              <li
                key={`${dish.dishId ?? dish.name}-${i}`}
                className="flex items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50/60 px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{dish.name}</span>
                <IconButton label="Move up" disabled={i === 0} onClick={() => moveDish(i, -1)}>↑</IconButton>
                <IconButton label="Move down" disabled={i === section.dishes.length - 1} onClick={() => moveDish(i, 1)}>↓</IconButton>
                <IconButton label="Remove" onClick={() => removeDish(i)}>×</IconButton>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Library options */}
      <div className={labelClass}>{section.name} options</div>
      {!librarySection ? (
        <p className="text-sm text-slate-500">
          This section is no longer in the Dish Library, so there are no options to pick from.
        </p>
      ) : (
        <>
          <input
            className={`${inputClass} mb-2`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${section.name.toLowerCase()}…`}
          />
          <ul className="max-h-[45vh] space-y-1.5 overflow-y-auto pr-1">
            {options.map((dish) => {
              const selected = isOnMenu(dish.id);
              return (
                <li key={dish.id}>
                  <button
                    type="button"
                    onClick={() => toggleDish(dish)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                      selected
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/40"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 text-sm font-bold ${selected ? "text-emerald-600" : "text-cyan-600"}`}>
                        {selected ? "✓" : "+"}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">{dish.name}</div>
                        {dish.description && (
                          <div className="truncate text-xs text-slate-500">{dish.description.replace(/\n/g, " ")}</div>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
            {options.length === 0 && (
              <li className="px-1 py-2 text-sm text-slate-400">
                {search ? "No dishes match your search." : "No dishes in this section yet."}
              </li>
            )}
          </ul>

          {showNewDish ? (
            <div className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <input
                className={inputClass}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Dish name"
                autoFocus
              />
              <textarea
                className={`${inputClass} min-h-[72px]`}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder={"Description — each line prints on its own line"}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isCreating || !newName.trim()}
                  onClick={submitNewDish}
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isCreating ? "Saving…" : "Save & add"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewDish(false)}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewDish(true)}
              className="mt-3 w-full rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700"
            >
              + Add a new {section.name.toLowerCase()} dish
            </button>
          )}
        </>
      )}

      {/* Section controls */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
          Move section up
        </button>
        <button type="button" disabled={index === total - 1} onClick={() => onMove(1)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
          Move section down
        </button>
        <button type="button" onClick={onRemove} className="ml-auto rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
          Remove from menu
        </button>
      </div>
    </div>
  );
}

function OverviewPanel({
  packageId,
  sections,
  library,
  onSelect,
  onAddSection,
  onSectionCreated,
}: {
  packageId: string | null;
  sections: MenuSectionEntry[];
  library: LibrarySection[];
  onSelect: (selection: MenuSelection) => void;
  onAddSection: (section: MenuSectionEntry) => void;
  onSectionCreated: (section: LibrarySection) => void;
}) {
  const [newSectionName, setNewSectionName] = useState("");
  const [error, setError] = useState("");
  const [isCreating, startCreate] = useTransition();

  const onMenu = new Set(sections.map((s) => s.sectionId));
  const available = library.filter((s) => !onMenu.has(s.id));

  const submitNewSection = () => {
    if (!newSectionName.trim()) return;
    setError("");
    startCreate(async () => {
      try {
        const section = await createSection(newSectionName, packageId);
        onSectionCreated(section);
        onAddSection({ sectionId: section.id, name: section.name, dishes: [] });
        setNewSectionName("");
      } catch {
        setError("Couldn't create that section. Please try again.");
      }
    });
  };

  return (
    <div>
      <PanelTitle title="Build your menu" />
      <p className="mb-4 text-sm text-slate-500">
        Click the heading or any section on the menu to choose what goes in it.
      </p>

      <div className={labelClass}>Sections on this menu</div>
      <ul className="mb-5 space-y-1.5">
        <li>
          <button type="button" onClick={() => onSelect({ type: "header" })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50/40">
            Heading — welcome, name & date
          </button>
        </li>
        <li>
          <button type="button" onClick={() => onSelect({ type: "design" })} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50/40">
            Design — dividers &amp; border
          </button>
        </li>
        {sections.map((section, i) => (
          <li key={`${section.sectionId ?? "custom"}-${i}`}>
            <button type="button" onClick={() => onSelect({ type: "section", index: i })} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50/40">
              <span>{section.name}</span>
              <span className="text-xs font-medium text-slate-400">
                {section.dishes.length} {section.dishes.length === 1 ? "dish" : "dishes"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className={labelClass}>Add a section</div>
      {available.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {available.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onAddSection({ sectionId: s.id, name: s.name, dishes: [] })}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              + {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className={inputClass}
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitNewSection()}
          placeholder="New section, e.g. Soup"
        />
        <button
          type="button"
          disabled={isCreating || !newSectionName.trim()}
          onClick={submitNewSection}
          className="shrink-0 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
