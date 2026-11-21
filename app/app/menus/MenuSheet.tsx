"use client";

import { Cormorant_Garamond, EB_Garamond, Lato, Montserrat, Playfair_Display, Raleway } from "next/font/google";
import type { CSSProperties } from "react";
import type { MenuDesign, MenuSectionEntry } from "@/lib/menuContent";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500"] });
const raleway = Raleway({ subsets: ["latin"], weight: ["300", "400", "500"] });
const lato = Lato({ subsets: ["latin"], weight: ["300", "400", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"] });
const garamond = EB_Garamond({ subsets: ["latin"], weight: ["400", "500"] });

/** Font class per design option; Montserrat matches the reference menu. */
export const MENU_FONT_CLASSES: Record<MenuDesign["font"], string> = {
  montserrat: montserrat.className,
  raleway: raleway.className,
  lato: lato.className,
  playfair: playfair.className,
  cormorant: cormorant.className,
  garamond: garamond.className,
};

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
  /** Group logo as an image data URL. */
  logo?: string | null;
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

const LOGO_HEIGHTS: Record<MenuDesign["logoSize"], string> = {
  small: "0.55in",
  medium: "0.85in",
  large: "1.2in",
};

// The sheet is cut in half at 5.5in, so each 4.6in column is centred on its own
// 5.5in half (centres at 2.75in and 8.25in) to give two identical menus.
const COLUMN_LEFTS = ["calc(2.75in - 2.3in)", "calc(8.25in - 2.3in)"];

export default function MenuSheet(props: MenuSheetProps) {
  return (
    <div
      className={MENU_FONT_CLASSES[props.design.font]}
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
          {/* 4.8in frame centred on its half: 0.35in margin to the paper edge and to the cut line. */}
          <div style={{ position: "absolute", left: `calc(${left} - 0.1in)`, top: "0.3in", width: "4.8in", height: "7.9in" }}>
            <BorderFrame border={props.design.border} />
          </div>
          <div style={{ ...columnStyle, left }}>
            <MenuCard {...props} />
          </div>
          {props.logo && props.design.logoPosition === "bottom" && (
            <div style={{ position: "absolute", left, bottom: "0.55in", width: "4.6in" }}>
              <Clickable
                active={props.interactive?.selection?.type === "header"}
                onClick={props.interactive ? () => props.interactive?.onSelect({ type: "header" }) : undefined}
              >
                <MenuLogo src={props.logo} size={props.design.logoSize} />
              </Clickable>
            </div>
          )}
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

function MenuCard({ welcomeText, hostName, dateLabel, sections, design, logo, interactive }: MenuSheetProps) {
  const selection = interactive?.selection ?? null;
  const visibleSections = interactive ? sections : sections.filter((s) => s.dishes.length > 0);
  const hasCourseDivider = design.courseDivider !== "none";
  // Text sizes and the spacing between text scale together so the layout keeps its rhythm.
  const s = (pt: number) => `${pt * design.textScale}pt`;

  return (
    <div>
      <Clickable
        active={selection?.type === "header"}
        onClick={interactive ? () => interactive.onSelect({ type: "header" }) : undefined}
      >
        {logo && design.logoPosition === "top" && (
          <div style={{ marginBottom: s(8) }}>
            <MenuLogo src={logo} size={design.logoSize} />
          </div>
        )}
        <div style={{ fontSize: s(26), fontWeight: 300, lineHeight: s(34.5), letterSpacing: "0.01em", color: SOFT_INK, textTransform: "uppercase" }}>
          {welcomeText || (interactive ? <Placeholder>Welcome line</Placeholder> : null)}
        </div>
        {logo && design.logoPosition === "name" ? (
          <div style={{ marginTop: s(6), marginBottom: s(2) }}>
            <MenuLogo src={logo} size={design.logoSize} />
          </div>
        ) : (
          <div style={{ fontSize: s(24), fontWeight: 500, lineHeight: s(34.5), letterSpacing: "0.01em", textTransform: "uppercase" }}>
            {hostName || (interactive ? <Placeholder>Client name</Placeholder> : null)}
          </div>
        )}
        <div style={{ fontSize: s(12), fontWeight: 400, marginTop: s(9), color: SOFT_INK }}>
          {dateLabel || (interactive ? <Placeholder>Event date</Placeholder> : null)}
        </div>
      </Clickable>

      <Clickable
        style={{ marginTop: s(10.75) }}
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
              <div style={{ marginTop: s(11) }}>
                <CourseDivider style={design.courseDivider} />
              </div>
            )}
            <Clickable
              style={{ marginTop: index === 0 ? s(16.75) : showCourseDivider ? s(8) : s(16) }}
              active={selection?.type === "section" && selection.index === sectionIndex}
              onClick={
                interactive
                  ? () => interactive.onSelect({ type: "section", index: sectionIndex })
                  : undefined
              }
            >
              <div style={{ fontSize: s(20), fontWeight: 300, lineHeight: s(26.5), color: SOFT_INK, textTransform: "uppercase" }}>
                {section.name}
              </div>

              {section.dishes.length === 0 && interactive && (
                <div style={{ fontSize: s(11), marginTop: s(6) }}>
                  <Placeholder>Click to add dishes</Placeholder>
                </div>
              )}

              {section.dishes.map((dish, dishIndex) => (
                <div key={`${dish.dishId ?? dish.name}-${dishIndex}`} style={{ marginTop: dishIndex === 0 ? s(9) : s(13) }}>
                  <div style={{ fontSize: s(16), fontWeight: 500, lineHeight: s(21.25) }}>{dish.name}</div>
                  {dish.description
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((line, i) => (
                      <div key={i} style={{ fontSize: s(11.75), fontWeight: 400, lineHeight: s(17), color: SOFT_INK }}>
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
      // Shrink-wrap and centre so the outline hugs the text rather than the full column.
      style={{ ...style, width: "fit-content", marginInline: "auto", paddingInline: "6pt", borderRadius: "4pt" }}
      // Use bare `outline` (1px) only inside hover/active: in Tailwind v4, width
      // utilities like `outline-2` also switch the outline on permanently.
      className={`cursor-pointer outline-offset-2 transition-colors ${
        active ? "bg-cyan-50 outline outline-cyan-400/70" : "hover:outline hover:outline-slate-400/50"
      }`}
    >
      {children}
    </div>
  );
}

function MenuLogo({ src, size }: { src: string; size: MenuDesign["logoSize"] }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- data URL; next/image adds nothing here
    <img
      src={src}
      alt="Group logo"
      style={{ display: "block", height: LOGO_HEIGHTS[size], maxWidth: "3.6in", objectFit: "contain", marginInline: "auto" }}
    />
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
