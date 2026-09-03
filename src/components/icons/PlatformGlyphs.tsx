import type { SVGProps } from "react";

/**
 * Minimal monoline marks for each platform — deliberately not the official
 * logos (avoids trademark lookalikes) and not generic lucide stand-ins,
 * just a consistent glyph language for this product's own nav/badges.
 * Shaped to swap in anywhere a lucide icon is used (size/color props).
 */
type GlyphProps = Omit<SVGProps<SVGSVGElement>, "color"> & {
  size?: number | string;
  color?: string;
};

export function InstagramGlyph({ size = 18, color, ...props }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={1.6}
      {...props}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill={color ?? "currentColor"} stroke="none" />
    </svg>
  );
}

export function TikTokGlyph({ size = 18, color, ...props }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={1.6}
      {...props}
    >
      <path d="M13 3v10.6a3.4 3.4 0 1 1-3-3.37" />
      <path d="M13 3c.3 2.4 2 4.2 4.4 4.5" />
    </svg>
  );
}

export function YouTubeGlyph({ size = 18, color, ...props }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={1.6}
      {...props}
    >
      <rect x="3" y="6" width="18" height="12" rx="4" />
      <path d="M10.5 9.5l5 2.5-5 2.5z" fill={color ?? "currentColor"} stroke="none" />
    </svg>
  );
}
