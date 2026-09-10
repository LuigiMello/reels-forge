import { Play } from "lucide-react";
import type { Platform } from "@/lib/types";
import { InstagramGlyph, TikTokGlyph, YouTubeGlyph } from "@/components/icons/PlatformGlyphs";
import { previewGradientCss } from "@/lib/preview-gradient";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

const GLYPH: Record<Platform, typeof InstagramGlyph> = {
  instagram: InstagramGlyph,
  tiktok: TikTokGlyph,
  youtube: YouTubeGlyph,
};

export function ScriptCoverPreview({
  platform,
  hook,
  coverSeed,
  durationSec,
  className,
}: {
  platform: Platform;
  hook: string;
  coverSeed: number;
  durationSec: number;
  className?: string;
}) {
  const Glyph = GLYPH[platform];

  return (
    <div
      className={cn("relative aspect-[9/16] w-full overflow-hidden", className)}
      style={{ background: previewGradientCss(coverSeed) }}
    >
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,.09) 0px, rgba(255,255,255,.09) 1px, transparent 1px, transparent 10px)",
        }}
        aria-hidden="true"
      />

      <div className="absolute left-2.5 top-2.5 flex h-7 w-7 items-center justify-center border border-white/25 bg-black/30 text-white backdrop-blur-sm">
        <Glyph size={14} />
      </div>

      <span className="tape-label absolute right-2.5 top-2.5 border border-white/25 bg-black/30 px-1.5 py-0.5 text-[9px] text-white/90 backdrop-blur-sm">
        {formatDuration(durationSec)}
      </span>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur-sm">
          <Play size={18} fill="currentColor" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-3 pt-8">
        <p className="line-clamp-4 font-display text-sm font-bold leading-snug text-white">{hook}</p>
      </div>
    </div>
  );
}
