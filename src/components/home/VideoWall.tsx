import type { ViralPost } from "@/lib/types";
import { VideoPreview } from "@/components/research/VideoPreview";

const COLUMN_STYLES = [
  { duration: "38s", reverse: false },
  { duration: "46s", reverse: true },
  { duration: "34s", reverse: false },
  { duration: "50s", reverse: true },
];

export function VideoWall({ posts, columns = 4 }: { posts: ViralPost[]; columns?: number }) {
  const cols: ViralPost[][] = Array.from({ length: columns }, () => []);
  posts.forEach((p, i) => cols[i % columns].push(p));

  return (
    <div className="grid h-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cols.slice(0, columns).map((colPosts, i) => {
        if (colPosts.length === 0) return null;
        const style = COLUMN_STYLES[i % COLUMN_STYLES.length];
        const looped = [...colPosts, ...colPosts];
        return (
          <div key={i} className="relative h-full overflow-hidden" style={{ maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)" }}>
            <div
              className="flex flex-col gap-3"
              style={{
                animation: `wall-scroll ${style.duration} linear infinite`,
                animationDirection: style.reverse ? "reverse" : "normal",
              }}
            >
              {looped.map((post, j) => (
                <VideoPreview key={`${post.id}-${j}`} post={post} className="w-full" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
