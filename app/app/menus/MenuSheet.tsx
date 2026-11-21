"use client";

import { Montserrat } from "next/font/google";
import type { CSSProperties } from "react";
import type { MenuSectionEntry } from "@/lib/menuContent";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500"] });

export type MenuSelection = { type: "header" } | { type: "section"; index: number } | null;

type MenuSheetProps = {
  welcomeText: string;
  hostName: string;
  dateLabel: string;
  sections: MenuSectionEntry[];
  /** When set, sections and the header become clickable (screen only). */
  interactive?: {
    selection: MenuSelection;
    onSelect: (selection: MenuSelection) => void;
  };
};

// Sizes are in points/inches so the printed page matches the reference banquet
// layout: letter landscape, two identical menus side by side for cutting.
const INK = "#4a4a4a";
const SOFT_INK = "#5f5f5f";

export default function MenuSheet(props: MenuSheetProps) {
  return (
    <div
      className={montserrat.className}
      style={{
        width: "11in",
        height: "8.5in",
        background: "#fff",
        position: "relative",
        overflow: "hidden",
        color: INK,
      }}
    >
      {/* Columns centred 2.36in either side of the page's middle, as in the PDF. */}
      <div style={{ ...columnStyle, left: "calc(5.5in - 2.36in - 2.3in)" }}>
        <MenuCard {...props} />
      </div>
      <div style={{ ...columnStyle, left: "calc(5.5in + 2.36in - 2.3in)" }}>
        <MenuCard {...props} />
      </div>
    </div>
  );
}

const columnStyle: CSSProperties = {
  position: "absolute",
  top: "0.5in",
  width: "4.6in",
  textAlign: "center",
};

function MenuCard({ welcomeText, hostName, dateLabel, sections, interactive }: MenuSheetProps) {
  const selection = interactive?.selection ?? null;
  const visibleSections = interactive ? sections : sections.filter((s) => s.dishes.length > 0);

  return (
    <div>
      <Clickable
        active={selection?.type === "header"}
        onClick={interactive ? () => interactive.onSelect({ type: "header" }) : undefined}
      >
        <div style={{ fontSize: "26pt", fontWeight: 300, lineHeight: "34.5pt", letterSpacing: "0.01em", color: SOFT_INK, textTransform: "uppercase" }}>
          {welcomeText || (interactive ? <Placeholder>Welcome line</Placeholder> : null)}
        </div>
        <div style={{ fontSize: "24pt", fontWeight: 500, lineHeight: "34.5pt", letterSpacing: "0.01em", textTransform: "uppercase" }}>
          {hostName || (interactive ? <Placeholder>Client name</Placeholder> : null)}
        </div>
        <div style={{ fontSize: "12pt", fontWeight: 400, marginTop: "9pt", color: SOFT_INK }}>
          {dateLabel || (interactive ? <Placeholder>Event date</Placeholder> : null)}
        </div>
      </Clickable>

      <Divider />

      {visibleSections.map((section, index) => {
        const sectionIndex = sections.indexOf(section);
        return (
          <Clickable
            key={`${section.sectionId ?? "custom"}-${sectionIndex}`}
            style={{ marginTop: index === 0 ? "19pt" : "16pt" }}
            active={selection?.type === "section" && selection.index === sectionIndex}
            onClick={
              interactive
                ? () => interactive.onSelect({ type: "section", index: sectionIndex })
                : undefined
            }
          >
            <div style={{ fontSize: "20pt", fontWeight: 300, lineHeight: "26.5pt", color: SOFT_INK, textTransform: "uppercase" }}>
              {section.name}
            </div>

            {section.dishes.length === 0 && interactive && (
              <div style={{ fontSize: "11pt", marginTop: "6pt" }}>
                <Placeholder>Click to add dishes</Placeholder>
              </div>
            )}

            {section.dishes.map((dish, dishIndex) => (
              <div key={`${dish.dishId ?? dish.name}-${dishIndex}`} style={{ marginTop: dishIndex === 0 ? "9pt" : "13pt" }}>
                <div style={{ fontSize: "16pt", fontWeight: 500, lineHeight: "21.25pt" }}>{dish.name}</div>
                {dish.description
                  .split("\n")
                  .filter((line) => line.trim())
                  .map((line, i) => (
                    <div key={i} style={{ fontSize: "11.75pt", fontWeight: 400, lineHeight: "17pt", color: SOFT_INK }}>
                      {line.trim()}
                    </div>
                  ))}
              </div>
            ))}
          </Clickable>
        );
      })}
    </div>
  );
}

function Clickable({
  active,
  onClick,
  style,
  children,
}: {
  active: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  if (!onClick) return <div style={style}>{children}</div>;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ ...style, borderRadius: "6pt" }}
      className={`cursor-pointer outline-2 outline-offset-4 transition ${
        active ? "bg-cyan-50 outline outline-cyan-400" : "hover:bg-slate-50 hover:outline hover:outline-slate-200"
      }`}
    >
      {children}
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#b8bec8", fontStyle: "italic", textTransform: "none" }}>{children}</span>;
}

/** "– ———— · · · ———— –" rule under the date. */
function Divider() {
  const line = { height: "1.4pt", background: "#555" };
  const dot = { width: "3.5pt", height: "3.5pt", borderRadius: "50%", background: "#d4d4d4" };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7pt", marginTop: "13pt", width: "4.2in", marginInline: "auto" }}>
      <div style={{ ...line, width: "9pt" }} />
      <div style={{ ...line, flex: 1 }} />
      <div style={{ display: "flex", gap: "6pt", padding: "0 6pt" }}>
        <div style={dot} />
        <div style={dot} />
        <div style={dot} />
      </div>
      <div style={{ ...line, flex: 1 }} />
      <div style={{ ...line, width: "9pt" }} />
    </div>
  );
}
