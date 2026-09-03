import { Play } from "lucide-react";
import type { ViralPost } from "@/lib/types";
import { InstagramGlyph, TikTokGlyph, YouTubeGlyph } from "@/components/icons/PlatformGlyphs";
import { formatCompact, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

const GLYPH: Record<ViralPost["platform"], typeof InstagramGlyph> = {
  instagram: InstagramGlyph,
  tiktok: TikTokGlyph,
  youtube: YouTubeGlyph,
};

/**
 * Stand-in for a real thumbnail: no scraping is wired up yet (see
 * src/lib/connectors), so this renders a generated gradient "cover" using
 * the post's hook text instead of pretending to show a captured frame.
 */
// Curated vivid pairs (indigo → violet → magenta → coral → orange), the
// same family as the Instagram-style brand gradient — avoids the muddy
// browns/olives that a raw hue rotation produces at arbitrary angles.
const PREVIEW_PALETTES: [string, string][] = [
  ["#2b2570", "#7b2ff7"],
  ["#4f0f7a", "#c2266b"],
  ["#6a11cb", "#c21e74"],
  ["#c21e74", "#ff5b6a"],
  ["#ff5b6a", "#ff9d3b"],
  ["#1c3fae", "#7b2ff7"],
];

export function VideoPreview({ post, className }: { post: ViralPost; className?: string }) {
  const Glyph = GLYPH[post.platform];
  const [from, to] = PREVIEW_PALETTES[post.thumbHue % PREVIEW_PALETTES.length];

  return (
    <div
      className={cn("relative aspect-[9/16] w-full overflow-hidden", className)}
      style={{ background: `linear-gradient(155deg, ${from} 0%, ${to} 100%)` }}
    >
      <div
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,.09) 0px, rgba(255,255,255,.09) 1px, transparent 1px, transparent 10px)",
        }}
        aria-hidden="true"
      />

      <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center border border-white/25 bg-black/30 text-white backdrop-blur-sm">
        <Glyph size={13} />
      </div>

      <span className="tape-label absolute right-2 top-2 border border-white/25 bg-black/30 px-1.5 py-0.5 text-[9px] text-white/90 backdrop-blur-sm">
        {formatDuration(post.raw.durationSec)}
      </span>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur-sm">
          <Play size={14} fill="currentColor" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2.5 pt-6">
        <p className="line-clamp-3 text-[11px] font-medium leading-snug text-white">{post.hook}</p>
        <p className="tape-label mt-1 text-[9px] text-white/70">{formatCompact(post.raw.views)} views</p>
      </div>
    </div>
  );
}
