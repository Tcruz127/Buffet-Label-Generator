// Sign set data shapes and pure helpers, safe to import from client components.

export const ARROWS = [
  "up-left", "up", "up-right",
  "left", "none", "right",
  "down-left", "down", "down-right",
] as const;
export type Arrow = (typeof ARROWS)[number];

/** Clockwise rotation from an arrow pointing right. */
export const ARROW_ANGLES: Record<Exclude<Arrow, "none">, number> = {
  right: 0,
  "down-right": 45,
  down: 90,
  "down-left": 135,
  left: 180,
  "up-left": 225,
  up: 270,
  "up-right": 315,
};

export const SIGN_TEXT_SCALES = [0.8, 0.9, 1, 1.1] as const;
export const SIGN_LOGO_SIZES = ["small", "medium", "large"] as const;
export const SIGN_FONTS = ["carlito", "opensans", "lato", "montserrat", "oswald", "playfair"] as const;
export const SIGN_BORDERS = ["none", "thin", "thick", "double", "rounded", "corners"] as const;

/** Adjustable gaps, in inches, and their slider ranges. */
export const SIGN_SPACING = {
  logoGap: { min: 0, max: 1.5, default: 0.3 },
  roomGap: { min: 0, max: 1, default: 0 },
  arrowGap: { min: 0, max: 1.5, default: 0.35 },
} as const;
export const SIGN_LINE_HEIGHT = { min: 1, max: 1.5, default: 1.2 } as const;

export type SignEntry = {
  id: string;
  arrow: Arrow;
  copies: number;
};

export type SignDesign = {
  /** Multiplier on the auto-fitted text size. */
  textScale: (typeof SIGN_TEXT_SCALES)[number];
  logoSize: (typeof SIGN_LOGO_SIZES)[number];
  groupFont: (typeof SIGN_FONTS)[number];
  groupBold: boolean;
  groupItalic: boolean;
  roomFont: (typeof SIGN_FONTS)[number];
  roomBold: boolean;
  roomItalic: boolean;
  /** Text, arrow and border colour, as #rrggbb. */
  color: string;
  border: (typeof SIGN_BORDERS)[number];
  /** Space between the logos and the group name, in inches. */
  logoGap: number;
  /** Extra space between the group name and the room, in inches. */
  roomGap: number;
  /** Space between the text and the arrow, in inches. */
  arrowGap: number;
  lineHeight: number;
};

export const DEFAULT_SIGN_DESIGN: SignDesign = {
  textScale: 1,
  logoSize: "medium",
  groupFont: "carlito",
  groupBold: true,
  groupItalic: false,
  roomFont: "carlito",
  roomBold: true,
  roomItalic: false,
  color: "#000000",
  border: "none",
  logoGap: SIGN_SPACING.logoGap.default,
  roomGap: SIGN_SPACING.roomGap.default,
  arrowGap: SIGN_SPACING.arrowGap.default,
  lineHeight: SIGN_LINE_HEIGHT.default,
};
export const MAX_SIGN_COPIES = 50;
export const MAX_SIGNS_PER_SET = 30;

/** Parts of a sign that can be clicked in the builder. */
export type SignSelection = "logos" | "text" | "room" | "arrow" | "design" | null;

/** Alphabetical, case-insensitive, de-duplicated room list ("Emerald 1" before "Emerald Ballroom"). */
export function sortRooms(rooms: string[]): string[] {
  const seen = new Set<string>();
  return rooms
    .map((r) => r.trim().slice(0, 80))
    .filter((r) => r && !seen.has(r.toLowerCase()) && seen.add(r.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

/**
 * The name a sign set gets from its group name. A set keeps following its group
 * name until someone renames it (i.e. while its title still equals this).
 */
export function autoSignSetTitle(lines: string[]) {
  return lines.find((l) => l.trim())?.trim().slice(0, 120) || "Untitled Signs";
}

export function newSignId() {
  return Math.random().toString(36).slice(2, 10);
}

function pick<T extends string | number>(options: readonly T[], value: unknown, fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

export function parseSignLines(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((l): l is string => typeof l === "string").map((l) => l.slice(0, 80)).slice(0, 8)
    : [];
}

export function parseSigns(value: unknown): SignEntry[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_SIGNS_PER_SET).map((v) => {
    const raw = (v ?? {}) as Record<string, unknown>;
    const copies = Number(raw.copies);
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id.slice(0, 20) : newSignId(),
      arrow: pick(ARROWS, raw.arrow, "none"),
      copies: Number.isInteger(copies) ? Math.min(MAX_SIGN_COPIES, Math.max(1, copies)) : 1,
    };
  });
}

function clampNumber(value: unknown, range: { min: number; max: number; default: number }) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(range.max, Math.max(range.min, Math.round(n * 100) / 100)) : range.default;
}

export function parseSignDesign(value: unknown): SignDesign {
  const raw = (value ?? {}) as Record<string, unknown>;
  // Sets saved before group/room fonts were split had a single `font`.
  const legacyFont = pick(SIGN_FONTS, raw.font, DEFAULT_SIGN_DESIGN.groupFont);
  const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
  return {
    textScale: pick(SIGN_TEXT_SCALES, raw.textScale, DEFAULT_SIGN_DESIGN.textScale),
    logoSize: pick(SIGN_LOGO_SIZES, raw.logoSize, DEFAULT_SIGN_DESIGN.logoSize),
    groupFont: pick(SIGN_FONTS, raw.groupFont, legacyFont),
    groupBold: bool(raw.groupBold, DEFAULT_SIGN_DESIGN.groupBold),
    groupItalic: bool(raw.groupItalic, DEFAULT_SIGN_DESIGN.groupItalic),
    roomFont: pick(SIGN_FONTS, raw.roomFont, legacyFont),
    roomBold: bool(raw.roomBold, DEFAULT_SIGN_DESIGN.roomBold),
    roomItalic: bool(raw.roomItalic, DEFAULT_SIGN_DESIGN.roomItalic),
    color: typeof raw.color === "string" && /^#[0-9a-f]{6}$/i.test(raw.color) ? raw.color.toLowerCase() : DEFAULT_SIGN_DESIGN.color,
    border: pick(SIGN_BORDERS, raw.border, DEFAULT_SIGN_DESIGN.border),
    logoGap: clampNumber(raw.logoGap, SIGN_SPACING.logoGap),
    roomGap: clampNumber(raw.roomGap, SIGN_SPACING.roomGap),
    arrowGap: clampNumber(raw.arrowGap, SIGN_SPACING.arrowGap),
    lineHeight: clampNumber(raw.lineHeight, SIGN_LINE_HEIGHT),
  };
}
