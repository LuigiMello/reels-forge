import type { Platform, ViralPost } from "../types";

const CATEGORY_NAMES: Record<string, string> = {
  "1": "Filmes",
  "10": "Música",
  "15": "Pets",
  "17": "Esportes",
  "19": "Viagem",
  "20": "Games",
  "22": "Vlog",
  "23": "Humor",
  "24": "Entretenimento",
  "25": "Notícias",
  "26": "Tutorial",
  "27": "Educação",
  "28": "Tecnologia",
};

// Real videos ≤ this length count as "short-ish" for this feed. YouTube's
// own "trending" chart (mostPopular) is dominated by trailers/music videos
// in the 1-3min range — true sub-60s Shorts rarely place there — so this is
// set generously enough to reliably return a handful of real items instead
// of an empty feed, while still filtering out full-length videos.
const MAX_DURATION_SEC = 180;

function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, h, min, s] = m;
  return (Number(h) || 0) * 3600 + (Number(min) || 0) * 60 + (Number(s) || 0);
}

interface VideoItem {
  id: string;
  snippet: {
    title: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    categoryId?: string;
    thumbnails?: { medium?: { url: string }; high?: { url: string } };
  };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails?: { duration: string };
}

/**
 * Real trending videos from YouTube's own "mostPopular" chart (Brazil) —
 * genuinely real, and cheap: `videos.list` (even with chart=) costs 1 quota
 * unit per call vs. 100 for `search.list`, so this can refresh often without
 * burning through the free 10,000/day quota (search.list was tried first
 * and blew the daily quota in testing — see git history).
 */
export async function fetchRealTrendingShorts(limit = 12): Promise<ViralPost[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=BR&maxResults=50&key=${apiKey}`
  );
  if (!res.ok) throw new Error(`YouTube videos.list (chart) falhou (${res.status})`);
  const data = await res.json();
  const items: VideoItem[] = data.items ?? [];

  const shortish = items.filter((it) => {
    const d = parseIsoDuration(it.contentDetails?.duration ?? "PT0S");
    return d > 0 && d <= MAX_DURATION_SEC;
  });
  if (shortish.length === 0) return [];

  const channelIds = Array.from(new Set(shortish.map((it) => it.snippet.channelId))).slice(0, 50);
  const subsByChannel = new Map<string, number>();
  if (channelIds.length > 0) {
    try {
      const channelsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds.join(",")}&key=${apiKey}`
      );
      if (channelsRes.ok) {
        const channelsData = await channelsRes.json();
        for (const c of channelsData.items ?? []) {
          subsByChannel.set(c.id, Number(c.statistics?.subscriberCount) || 0);
        }
      }
    } catch {
      // subscriber counts are a bonus signal, not required
    }
  }

  const posts: ViralPost[] = shortish
    .sort((a, b) => (Number(b.statistics?.viewCount) || 0) - (Number(a.statistics?.viewCount) || 0))
    .slice(0, limit)
    .map((it) => {
      const views = Number(it.statistics?.viewCount) || 0;
      const likes = Number(it.statistics?.likeCount) || 0;
      const comments = Number(it.statistics?.commentCount) || 0;
      const durationSec = parseIsoDuration(it.contentDetails?.duration ?? "PT0S");
      const postedHoursAgo = Math.max((Date.now() - new Date(it.snippet.publishedAt).getTime()) / 3600_000, 0.5);
      const engagementRate = views > 0 ? (likes + comments) / views : 0;
      const velocityPerHour = views / postedHoursAgo;
      const viralScore = Math.round(
        Math.min(engagementRate / 0.1, 1) * 55 + Math.min(velocityPerHour / 150_000, 1) * 45
      );

      return {
        id: `yt-real-${it.id}`,
        platform: "youtube" as Platform,
        niche: CATEGORY_NAMES[it.snippet.categoryId ?? ""] ?? "Em alta",
        creator: it.snippet.channelTitle,
        handle: it.snippet.channelTitle,
        followers: subsByChannel.get(it.snippet.channelId) ?? 0,
        caption: it.snippet.title,
        hook: it.snippet.title,
        sound: "",
        hashtags: (it.snippet.title.match(/#[\p{L}\p{N}_]+/gu) ?? []).slice(0, 6),
        postedAt: it.snippet.publishedAt,
        raw: {
          views,
          likes,
          comments,
          watchTimeAvgSec: 0,
          durationSec,
          postedHoursAgo,
        },
        derived: {
          engagementRate,
          velocityPerHour,
          retentionRate: 0,
          viralScore: Math.min(viralScore, 100),
        },
        thumbnailSeed: it.id,
        url: `https://www.youtube.com/watch?v=${it.id}`,
        thumbHue: 0,
        thumbnailUrl: it.snippet.thumbnails?.high?.url ?? it.snippet.thumbnails?.medium?.url,
        isReal: true,
      };
    });

  return posts;
}
