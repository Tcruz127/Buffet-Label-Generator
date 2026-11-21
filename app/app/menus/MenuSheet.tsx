"use client";

import { Montserrat } from "next/font/google";
import type { CSSProperties } from "react";
import type { MenuDesign, MenuSectionEntry } from "@/lib/menuContent";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500"] });

export type MenuSelection =
  | { type: "header" }
  | { type: "design" }
  | { type: "section"; index: number }
  | null;

type MenuSheetProps = {
  welcomeText: string;
  hostName: string;
  dateLabel: string;
  sections: MenuSectionEntry[];
  design: MenuDesign;
  /** When set, sections and the header become clickable (screen only). */
  interactive?: {
    selection: MenuSelection;
    onSelect: (selection: MenuSelection) => void;
  };
};

// Sizes are in points/inches so the printed page matches the reference banquet
// layout: letter landscape, two identical menus side by side for cutting.
// Ornaments are SVG strokes or CSS borders, never backgrounds: browsers drop
// background colours when printing unless "Background graphics" is ticked.
const INK = "#4a4a4a";
const SOFT_INK = "#5f5f5f";
const RULE = "#555";

// Columns centred 2.36in either side of the page's middle, as in the PDF.
const COLUMN_LEFTS = ["calc(5.5in - 2.36in - 2.3in)", "calc(5.5in + 2.36in - 2.3in)"];

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
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {COLUMN_LEFTS.map((left) => (
        <div key={left}>
          {/* 4.4in leaves a clear gap at the centre cut line between the two frames. */}
          <div style={{ position: "absolute", left: `calc(${left} + 0.1in)`, top: "0.3in", width: "4.4in", height: "7.9in" }}>
            <BorderFrame border={props.design.border} />
          </div>
          <div style={{ ...columnStyle, left }}>
            <MenuCard {...props} />
          </div>
        </div>
      ))}
    </div>
  );
}

const columnStyle: CSSProperties = {
  position: "absolute",
  top: "0.5in",
  width: "4.6in",
  textAlign: "center",
};

function MenuCard({ welcomeText, hostName, dateLabel, sections, design, interactive }: MenuSheetProps) {
  const selection = interactive?.selection ?? null;
  const visibleSections = interactive ? sections : sections.filter((s) => s.dishes.length > 0);
  const hasCourseDivider = design.courseDivider !== "none";

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

      <Clickable
        style={{ marginTop: "10.75pt" }}
        active={selection?.type === "design"}
        onClick={interactive ? () => interactive.onSelect({ type: "design" }) : undefined}
      >
        <HeaderDivider style={design.divider} />
      </Clickable>

      {visibleSections.map((section, index) => {
        const sectionIndex = sections.indexOf(section);
        const showCourseDivider = hasCourseDivider && index > 0;
        return (
          <div key={`${section.sectionId ?? "custom"}-${sectionIndex}`}>
            {showCourseDivider && (
              <div style={{ marginTop: "11pt" }}>
                <CourseDivider style={design.courseDivider} />
              </div>
            )}
            <Clickable
              style={{ marginTop: index === 0 ? "16.75pt" : showCourseDivider ? "8pt" : "16pt" }}
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
          </div>
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
      // Use bare `outline` (1px) only inside hover/active: in Tailwind v4, width
      // utilities like `outline-2` also switch the outline on permanently.
      className={`cursor-pointer outline-offset-4 transition-colors ${
        active ? "bg-cyan-50 outline outline-cyan-400/70" : "hover:outline hover:outline-slate-400/50"
      }`}
    >
      {children}
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#b8bec8", fontStyle: "italic", textTransform: "none" }}>{children}</span>;
}

/** Rule under the heading; 4.2in wide, 8pt tall whatever the style so spacing never shifts. */
export function HeaderDivider({ style, width = "4.2in" }: { style: MenuDesign["divider"]; width?: string }) {
  return (
    <svg
      viewBox="0 0 605 16"
      preserveAspectRatio="none"
      style={{ display: "block", width, height: `calc(${width} * 16 / 605)`, marginInline: "auto", overflow: "visible" }}
      aria-hidden="true"
    >
      {style === "classic" && (
        <g stroke={RULE} strokeWidth="4">
          <line x1="0" y1="8" x2="15" y2="8" />
          <line x1="28" y1="8" x2="250" y2="8" />
          <line x1="350" y1="8" x2="577" y2="8" />
          <line x1="590" y1="8" x2="605" y2="8" />
          {[273, 302.5, 332].map((cx) => (
            <circle key={cx} cx={cx} cy="8" r="3.5" fill="#fff" stroke="#b5b5b5" strokeWidth="1.4" />
          ))}
        </g>
      )}
      {style === "line" && <line x1="0" y1="8" x2="605" y2="8" stroke={RULE} strokeWidth="2.5" />}
      {style === "double" && (
        <g stroke={RULE} strokeWidth="1.8">
          <line x1="0" y1="5" x2="605" y2="5" />
          <line x1="0" y1="11" x2="605" y2="11" />
        </g>
      )}
      {style === "diamond" && (
        <g stroke={RULE} strokeWidth="2.5" fill="#fff">
          <line x1="0" y1="8" x2="280" y2="8" />
          <line x1="325" y1="8" x2="605" y2="8" />
          <polygon points="302.5,1 310,8 302.5,15 295,8" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

/** Small ornament placed between courses; 1.6in wide. */
export function CourseDivider({ style, width = "1.6in" }: { style: MenuDesign["courseDivider"]; width?: string }) {
  if (style === "none") return null;
  return (
    <svg
      viewBox="0 0 200 16"
      preserveAspectRatio="none"
      style={{ display: "block", width, height: `calc(${width} * 16 / 200)`, marginInline: "auto", overflow: "visible" }}
      aria-hidden="true"
    >
      {style === "short" && <line x1="40" y1="8" x2="160" y2="8" stroke={RULE} strokeWidth="2.5" />}
      {style === "dots" &&
        [85, 100, 115].map((cx) => <circle key={cx} cx={cx} cy="8" r="2.6" fill="#8a8a8a" />)}
      {style === "diamond" && (
        <g stroke={RULE} strokeWidth="2" fill="#fff">
          <line x1="30" y1="8" x2="88" y2="8" />
          <line x1="112" y1="8" x2="170" y2="8" />
          <polygon points="100,2 106,8 100,14 94,8" />
        </g>
      )}
    </svg>
  );
}

/** Frame drawn around each printed menu; fills its positioned parent. */
export function BorderFrame({ border, scale = 1 }: { border: MenuDesign["border"]; scale?: number }) {
  const pt = (n: number) => `${n * scale}pt`;
  const fill: CSSProperties = { position: "absolute", inset: 0, boxSizing: "border-box" };

  switch (border) {
    case "thin":
      return <div style={{ ...fill, border: `${pt(1)} solid ${RULE}` }} />;
    case "double":
      return <div style={{ ...fill, border: `${pt(3.5)} double ${RULE}` }} />;
    case "inset":
      return (
        <div style={{ ...fill, border: `${pt(1.2)} solid ${RULE}` }}>
          <div style={{ ...fill, inset: pt(4), border: `${pt(0.6)} solid ${RULE}` }} />
        </div>
      );
    case "rounded":
      return <div style={{ ...fill, border: `${pt(1)} solid ${RULE}`, borderRadius: pt(18) }} />;
    case "corners": {
      const arm = `${0.45 * scale}in`;
      const line = `${pt(1.6)} solid ${RULE}`;
      const corner: CSSProperties = { position: "absolute", width: arm, height: arm };
      return (
        <div style={fill}>
          <div style={{ ...corner, top: 0, left: 0, borderTop: line, borderLeft: line }} />
          <div style={{ ...corner, top: 0, right: 0, borderTop: line, borderRight: line }} />
          <div style={{ ...corner, bottom: 0, left: 0, borderBottom: line, borderLeft: line }} />
          <div style={{ ...corner, bottom: 0, right: 0, borderBottom: line, borderRight: line }} />
        </div>
      );
    }
    default:
      return null;
  }
}
