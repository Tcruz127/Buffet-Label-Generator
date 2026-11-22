"use client";

import { Carlito, Lato, Montserrat, Open_Sans, Oswald, Playfair_Display } from "next/font/google";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ARROW_ANGLES, type Arrow, type SignDesign, type SignSelection } from "@/lib/signContent";

// Carlito is metrically compatible with Calibri, which the client's signs use.
const carlito = Carlito({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });
const openSans = Open_Sans({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });

export const SIGN_FONT_FACES: Record<SignDesign["groupFont"], { label: string; className: string; family: string }> = {
  carlito: { label: "Carlito", className: carlito.className, family: carlito.style.fontFamily },
  opensans: { label: "Open Sans", className: openSans.className, family: openSans.style.fontFamily },
  lato: { label: "Lato", className: lato.className, family: lato.style.fontFamily },
  montserrat: { label: "Montserrat", className: montserrat.className, family: montserrat.style.fontFamily },
  oswald: { label: "Oswald", className: oswald.className, family: oswald.style.fontFamily },
  playfair: { label: "Playfair", className: playfair.className, family: playfair.style.fontFamily },
};

const PX_PER_IN = 96;
const PAGE_W = 11;
const PAGE_H = 8.5;
const PAD_Y = 0.45;
const TEXT_W = 9.8; // usable text width in inches
const MAX_FONT_PX = 112; // ≈ 84pt, the size used on the reference sign
const LOGO_HEIGHTS: Record<SignDesign["logoSize"], number> = { small: 1, medium: 1.35, large: 1.8 };
/** Height of the arrow: left/right arrows are long and low, the rest need more room. */
function arrowArea(arrow: Arrow) {
  if (arrow === "none") return 0;
  return ARROW_ANGLES[arrow] % 180 === 0 ? 0.9 : 1.5;
}

type SignPageProps = {
  /** Group name lines. */
  lines: string[];
  room: string;
  arrow: Arrow;
  venueLogo: string | null;
  groupLogo: string | null;
  design: SignDesign;
  /** When set, each part of the sign becomes clickable (screen only). */
  interactive?: {
    selection: SignSelection;
    onSelect: (selection: SignSelection) => void;
  };
};

type TextStyle = { family: string; bold: boolean; italic: boolean };

function cssFont(style: TextStyle, size: string) {
  return `${style.italic ? "italic " : ""}${style.bold ? 700 : 400} ${size} ${style.family}`;
}

/**
 * Measures text widths (in ems) for any mix of font styles once those fonts have
 * loaded; falls back to a rough estimate until then.
 */
function useTextMeasurer(styles: TextStyle[]) {
  const key = Array.from(new Set(styles.map((st) => cssFont(st, "100px")))).sort().join("|");
  const [ready, setReady] = useState<{ key: string; measure: (text: string, style: TextStyle) => number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled(key.split("|").filter(Boolean).map((font) => document.fonts.load(font))).then(() => {
      const ctx = document.createElement("canvas").getContext("2d");
      if (cancelled || !ctx) return;
      const measure = (text: string, style: TextStyle) => {
        ctx.font = cssFont(style, "100px");
        return ctx.measureText(text).width / 100;
      };
      setReady({ key, measure });
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return ready?.key === key ? ready.measure : (text: string) => text.length * 0.55;
}

export default function SignPage({ lines, room, arrow, venueLogo, groupLogo, design, interactive }: SignPageProps) {
  const groupStyle: TextStyle = { family: SIGN_FONT_FACES[design.groupFont].family, bold: design.groupBold, italic: design.groupItalic };
  const roomStyle: TextStyle = { family: SIGN_FONT_FACES[design.roomFont].family, bold: design.roomBold, italic: design.roomItalic };
  const groupLines = lines.filter((l) => l.trim());
  const roomLine = room.trim();
  const allLines = roomLine ? [...groupLines, roomLine] : groupLines;
  const measure = useTextMeasurer([groupStyle, roomStyle]);
  const widths = [...groupLines.map((l) => measure(l, groupStyle)), ...(roomLine ? [measure(roomLine, roomStyle)] : [])];
  const logos = [venueLogo, groupLogo].filter((l): l is string => Boolean(l));
  const logoHeight = LOGO_HEIGHTS[design.logoSize];

  // The logos, text and arrow are stacked with the chosen gaps and centred on the page;
  // the text is sized to fill whatever height and width remain.
  const availableH =
    PAGE_H -
    PAD_Y * 2 -
    (logos.length ? logoHeight + design.logoGap : 0) -
    (arrow !== "none" ? arrowArea(arrow) + design.arrowGap : 0) -
    (roomLine && groupLines.length ? design.roomGap : 0);
  const widest = Math.max(0.01, ...widths);
  const fitByWidth = (TEXT_W * PX_PER_IN) / widest;
  const fitByHeight = (Math.max(0.5, availableH) * PX_PER_IN) / (Math.max(1, allLines.length) * design.lineHeight);
  const fontPx = Math.min(fitByWidth, fitByHeight, MAX_FONT_PX * design.textScale);
  const lineStyle = (style: TextStyle): CSSProperties => ({
    fontSize: `${fontPx}px`,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? "italic" : "normal",
    fontFamily: style.family,
    lineHeight: design.lineHeight,
    whiteSpace: "nowrap",
    // Italic glyphs lean past their box; a little side padding stops clipping.
    paddingInline: style.italic ? "0.08em" : undefined,
  });
  const groupLineStyle = lineStyle(groupStyle);
  const roomLineStyle = lineStyle(roomStyle);

  const part = (name: Exclude<SignSelection, null>) =>
    interactive
      ? { active: interactive.selection === name, onClick: () => interactive.onSelect(name) }
      : { active: false };

  return (
    <div
      // Each text line sets its own font family; this class covers the hint text.
      className={SIGN_FONT_FACES[design.groupFont].className}
      style={{
        position: "relative",
        width: `${PAGE_W}in`,
        height: `${PAGE_H}in`,
        background: "#fff",
        color: design.color,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `${PAD_Y}in 0.6in`,
        boxSizing: "border-box",
        overflow: "hidden",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      <SignBorder border={design.border} color={design.color} />

      {logos.length > 0 ? (
        <Clickable {...part("logos")} style={{ marginBottom: `${design.logoGap}in` }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5in", height: `${logoHeight}in`, maxWidth: "9.8in" }}>
            {logos.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- data URL
              <img key={i} src={src} alt="" style={{ height: "100%", maxWidth: logos.length > 1 ? "4.6in" : "9.8in", objectFit: "contain" }} />
            ))}
          </div>
        </Clickable>
      ) : (
        interactive && (
          // Screen-only hint that takes no space, so the preview matches the printed page.
          <div style={{ position: "absolute", top: `${PAD_Y}in`, left: 0, right: 0 }}>
            <Clickable {...part("logos")}>
              <Hint>Click to add logos</Hint>
            </Clickable>
          </div>
        )
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }}>
        <Clickable {...part("text")}>
          {groupLines.length > 0
            ? groupLines.map((line, i) => (
                <div key={i} style={groupLineStyle}>
                  {line}
                </div>
              ))
            : interactive && <Hint>Click to add the group name</Hint>}
        </Clickable>
        {roomLine ? (
          <Clickable {...part("room")} style={{ marginTop: groupLines.length ? `${design.roomGap}in` : 0 }}>
            <div style={roomLineStyle}>{roomLine}</div>
          </Clickable>
        ) : (
          interactive && (
            <Clickable {...part("room")}>
              <Hint>Click to choose a room</Hint>
            </Clickable>
          )
        )}
      </div>

      {arrow !== "none" ? (
        <Clickable {...part("arrow")} style={{ marginTop: `${design.arrowGap}in` }}>
          <div style={{ height: `${arrowArea(arrow)}in`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowGlyph arrow={arrow} />
          </div>
        </Clickable>
      ) : (
        interactive && (
          <div style={{ position: "absolute", bottom: `${PAD_Y}in`, left: 0, right: 0 }}>
            <Clickable {...part("arrow")}>
              <Hint>Click to add an arrow</Hint>
            </Clickable>
          </div>
        )
      )}
    </div>
  );
}

/** Wraps a clickable part of the sign; a plain block when not interactive. Same treatment as the menu builder. */
function Clickable({
  active,
  onClick,
  style,
  children,
}: {
  active: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  children: ReactNode;
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
      style={{ ...style, width: "fit-content", marginInline: "auto", paddingInline: "0.12in", borderRadius: "0.1in" }}
      // Bare `outline` (1px) only inside hover/active: Tailwind v4 width utilities switch it on permanently.
      className={`cursor-pointer outline-offset-4 transition-colors ${
        active ? "bg-cyan-50 outline outline-cyan-400/70" : "hover:outline hover:outline-slate-400/50"
      }`}
    >
      {children}
    </div>
  );
}

/** Page border, inset from the paper edge so printers don't clip it. */
function SignBorder({ border, color }: { border: SignDesign["border"]; color: string }) {
  if (border === "none") return null;
  const frame: CSSProperties = { position: "absolute", inset: "0.3in", pointerEvents: "none" };
  if (border === "corners") {
    const line = `4px solid ${color}`;
    const corner: CSSProperties = { position: "absolute", width: "0.9in", height: "0.9in" };
    return (
      <div style={frame}>
        <div style={{ ...corner, top: 0, left: 0, borderTop: line, borderLeft: line }} />
        <div style={{ ...corner, top: 0, right: 0, borderTop: line, borderRight: line }} />
        <div style={{ ...corner, bottom: 0, left: 0, borderBottom: line, borderLeft: line }} />
        <div style={{ ...corner, bottom: 0, right: 0, borderBottom: line, borderRight: line }} />
      </div>
    );
  }
  const styles: Record<Exclude<SignDesign["border"], "none" | "corners">, CSSProperties> = {
    thin: { border: `2px solid ${color}` },
    thick: { border: `8px solid ${color}` },
    double: { border: `9px double ${color}` },
    rounded: { border: `3px solid ${color}`, borderRadius: "0.35in" },
  };
  return <div style={{ ...frame, ...styles[border] }} />;
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: "42px", fontWeight: 400, fontStyle: "italic", color: "#94a3b8", padding: "0.08in 0", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
}

/**
 * Solid block arrow like the reference sign, rotated to any of eight directions.
 * Left/right use the reference's long 3.4 : 1 shape; other directions use a
 * shorter 2 : 1 arrow so the shaft keeps the same weight in a compact space.
 */
export function ArrowGlyph({ arrow, size }: { arrow: Exclude<Arrow, "none">; size?: string }) {
  const angle = ARROW_ANGLES[arrow];
  const horizontal = angle % 180 === 0;
  const vertical = angle % 180 === 90;
  const length = horizontal ? 340 : 200;
  const head = length - 55;
  const cx = length / 2;
  // Crop the viewBox to the rotated arrow so every direction fills its box.
  const viewBox = horizontal
    ? `0 0 ${length} 100`
    : vertical
      ? `${cx - 50} ${50 - cx} 100 ${length}`
      : (() => {
          const half = (cx + 50) * Math.SQRT1_2;
          return `${cx - half} ${50 - half} ${half * 2} ${half * 2}`;
        })();
  const height = size ?? (horizontal ? "0.9in" : `${arrowArea(arrow)}in`);

  return (
    <svg viewBox={viewBox} style={{ height, width: "auto", display: "block" }} aria-hidden="true">
      <g transform={`rotate(${angle} ${cx} 50)`}>
        <polygon points={`0,25 ${head},25 ${head},0 ${length},50 ${head},100 ${head},75 0,75`} fill="currentColor" />
      </g>
    </svg>
  );
}

/** Renders a full-size sign scaled down to fit its container's width. */
export function ScaledSign({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / (PAGE_W * PX_PER_IN)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`w-full overflow-hidden ${className}`} style={{ aspectRatio: `${PAGE_W} / ${PAGE_H}` }}>
      <div style={{ width: `${PAGE_W}in`, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  );
}
