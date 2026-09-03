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
export function VideoPreview({ post, className }: { post: ViralPost; className?: string }) {
  const Glyph = GLYPH[post.platform];
  const hue = post.thumbHue;

  return (
    <div
      className={cn("relative aspect-[9/16] w-full overflow-hidden", className)}
      style={{
        background: `linear-gradient(155deg, hsl(${hue} 65% 16%) 0%, hsl(${(hue + 40) % 360} 70% 24%) 55%, hsl(${(hue + 80) % 360} 75% 30%) 100%)`,
      }}
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
