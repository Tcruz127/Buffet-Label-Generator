import type { ReactNode } from "react";

// Visual language taken from the Instabels logo (public/logo-dark.svg):
// cyan→violet gradient, pale tinted rounded "label tile" with a thin gradient
// stroke, three label lines of fading opacity, and a four-point sparkle.
export const BRAND_CYAN = "#22d3ee";
export const BRAND_VIOLET = "#a855f7";

/** The logo tile on its own. `gradientId` must be unique per page. */
export function LogoMark({ gradientId, className = "" }: { gradientId: string; className?: string }) {
  const g = `${gradientId}-stroke`;
  const f = `${gradientId}-fill`;
  return (
    <svg viewBox="0 0 84 88" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_CYAN} />
          <stop offset="100%" stopColor={BRAND_VIOLET} />
        </linearGradient>
        <linearGradient id={f} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_CYAN} stopOpacity="0.15" />
          <stop offset="100%" stopColor={BRAND_VIOLET} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect x="4" y="6" width="76" height="76" rx="16" fill={`url(#${f})`} />
      <rect x="4" y="6" width="76" height="76" rx="16" fill="none" stroke={`url(#${g})`} strokeWidth="1.5" />
      <rect x="19" y="25" width="46" height="7" rx="3.5" fill={`url(#${g})`} />
      <rect x="19" y="40" width="32" height="5.5" rx="2.75" fill={`url(#${g})`} opacity="0.7" />
      <rect x="19" y="53" width="40" height="5.5" rx="2.75" fill={`url(#${g})`} opacity="0.45" />
      <path d="M73 2 L75 7 L80 9 L75 11 L73 16 L71 11 L66 9 L71 7 Z" fill={`url(#${g})`} />
    </svg>
  );
}

/** The logo's four-point sparkle. */
export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden="true">
      <path d="M7 0 L8.6 5.4 L14 7 L8.6 8.6 L7 14 L5.4 8.6 L0 7 L5.4 5.4 Z" fill="currentColor" />
    </svg>
  );
}

/** Section eyebrow: sparkle + gradient text. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em]">
      <Sparkle className="h-3.5 w-3.5 text-violet-500" />
      <span className="bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">{children}</span>
    </p>
  );
}

/** A panel styled like the logo tile: pale cyan→violet tint inside a thin gradient border. */
export function BrandTile({
  children,
  className = "",
  innerClassName = "",
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div className={`rounded-[2rem] bg-gradient-to-br from-cyan-400 to-purple-500 p-[1.5px] ${className}`}>
      <div className={`h-full rounded-[calc(2rem-1.5px)] bg-[linear-gradient(135deg,#ecfeff_0%,#f5f3ff_100%)] ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}
