import type { CSSProperties } from "react";

// Dietary tags and icons match the label editor (public/label-editor.html).
export const DIET_TAGS = [
  { value: "Vegetarian", icon: "🥬" },
  { value: "Vegan", icon: "🌱" },
  { value: "Gluten Free", icon: "🌾" },
  { value: "Contains Gluten", icon: "🌾" },
  { value: "Contains Dairy", icon: "🥛" },
  { value: "Contains Eggs", icon: "🥚" },
  { value: "Contains Nuts", icon: "🥜" },
  { value: "Contains Shellfish", icon: "🦐" },
] as const;

export type DietTag = (typeof DIET_TAGS)[number]["value"];

/** Landing-page approximations of the built-in label templates (lib/templates.ts). */
export const LABEL_THEMES = {
  classic: {
    name: "Classic White",
    background: "#ffffff",
    text: "#111111",
    accent: "#444444",
    font: "Georgia, 'Times New Roman', serif",
    italic: true,
    border: "1px solid #d4d4d8",
  },
  elegant: {
    name: "Elegant Wedding",
    background: "#fffaf7",
    text: "#3b2f2f",
    accent: "#c8a97e",
    font: "'Times New Roman', Georgia, serif",
    italic: true,
    border: "1.5px solid #c8a97e",
  },
  corporate: {
    name: "Corporate Buffet",
    background: "#ffffff",
    text: "#0f172a",
    accent: "#2563eb",
    font: "Arial, Helvetica, sans-serif",
    italic: false,
    border: "1px solid #cbd5e1",
  },
  rustic: {
    name: "Rustic Farmhouse",
    background: "#fdf6ec",
    text: "#3a2e2a",
    accent: "#8b5e3c",
    font: "Georgia, serif",
    italic: true,
    border: "1px solid #d6c3a5",
  },
  holiday: {
    name: "Holiday Gold",
    background: "#fffdf7",
    text: "#4b1f1f",
    accent: "#d4af37",
    font: "'Times New Roman', Georgia, serif",
    italic: true,
    border: "3px double #d4af37",
  },
  minimal: {
    name: "Minimal Modern",
    background: "#ffffff",
    text: "#111827",
    accent: "#6b7280",
    font: "Helvetica, Arial, sans-serif",
    italic: false,
    border: "1px solid #e5e7eb",
  },
} as const;

export type LabelThemeId = keyof typeof LABEL_THEMES;

const ICONS: Record<string, string> = Object.fromEntries(DIET_TAGS.map((t) => [t.value, t.icon]));

/** A single 3.5" × 2" buffet label. Text sizes use container units so it scales with its width. */
export default function LabelCard({
  name,
  ingredients,
  tags,
  theme = "classic",
  className = "",
  style,
}: {
  name: string;
  ingredients?: string;
  tags: readonly string[];
  theme?: LabelThemeId;
  className?: string;
  style?: CSSProperties;
}) {
  const t = LABEL_THEMES[theme];

  return (
    <div
      className={`overflow-hidden rounded-xl ${className}`}
      style={{ aspectRatio: "7 / 4", containerType: "inline-size", background: t.background, border: t.border, ...style }}
    >
      <div
        className="flex h-full flex-col items-center justify-center text-center"
        style={{ padding: "6cqw 7cqw", color: t.text, fontFamily: t.font }}
      >
        <div
          style={{
            fontSize: "8.5cqw",
            fontWeight: 700,
            fontStyle: t.italic ? "italic" : "normal",
            lineHeight: 1.12,
            letterSpacing: t.italic ? undefined : "-0.01em",
            overflowWrap: "anywhere",
          }}
        >
          {name || "Your dish name"}
        </div>
        {ingredients && (
          <div style={{ fontSize: "3.7cqw", fontStyle: "italic", color: t.accent, marginTop: "1.6cqw", lineHeight: 1.3 }}>
            {ingredients}
          </div>
        )}
        <div style={{ width: "68%", height: 0, borderTop: `1px solid ${t.accent}`, margin: "3cqw 0 2.6cqw" }} />
        <div style={{ fontSize: "3.4cqw", lineHeight: 1.45, minHeight: "4.9cqw" }}>
          {tags.length > 0
            ? tags.map((tag, i) => (
                <span key={tag}>
                  {i > 0 && " • "}
                  {ICONS[tag] ?? ""} {tag}
                </span>
              ))
            : <span style={{ color: t.accent, fontStyle: "italic" }}>Add dietary tags</span>}
        </div>
      </div>
    </div>
  );
}
