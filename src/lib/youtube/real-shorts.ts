import type { Platform, ViralPost } from "../types";

// YouTube's search.list needs a query term to return anything at all (no
// term = 0 results, regardless of other filters), and generic terms like
// "shorts" mostly surface global clickbait/hashtag farms. Querying by
// Portuguese niche terms — the same niches the rest of the app uses —
// surfaces real Brazilian creators instead.
const QUERY_NICHES: { q: string; niche: string }[] = [
  { q: "finanças dicas", niche: "Finanças pessoais" },
  { q: "humor engraçado", niche: "Humor cotidiano" },
  { q: "treino academia", niche: "Fitness & treino" },
  { q: "receita fácil", niche: "Culinária rápida" },
  { q: "curiosidades incrível", niche: "Curiosidades" },
  { q: "pets engraçados", niche: "Pets" },
  { q: "motivação sucesso", niche: "Motivacional" },
  { q: "beleza skincare", niche: "Beleza & skincare" },
];

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
    thumbnails?: { medium?: { url: string }; high?: { url: string } };
  };
  statistics?: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails?: { duration: string };
}

async function searchNiche(apiKey: string, q: string, publishedAfter: string): Promise<Map<string, string>> {
  const idToNiche = new Map<string, string>();
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=short&order=viewCount&regionCode=BR&relevanceLanguage=pt&maxResults=6&publishedAfter=${publishedAfter}&q=${encodeURIComponent(q)}&key=${apiKey}`
    );
    if (!res.ok) return idToNiche;
    const data = await res.json();
    for (const it of data.items ?? []) {
      const id = it.id?.videoId;
      if (id) idToNiche.set(id, "");
    }
  } catch {
    // one failed niche query shouldn't sink the whole feed
  }
  return idToNiche;
}

/**
 * Real trending-ish YouTube Shorts — the only one of the three platforms
 * with a free, official, public API for anything like this. There's no
 * genuine public "trending Shorts" endpoint, so this approximates it:
 * search per (Portuguese, on-brand) niche term, real duration ≤ 60s, sorted
 * by real view count among recent (last week) uploads in Brazil.
 */
export async function fetchRealTrendingShorts(limit = 12): Promise<ViralPost[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const publishedAfter = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
  const terms = QUERY_NICHES.slice(0, 8);

  const results = await Promise.all(terms.map((t) => searchNiche(apiKey, t.q, publishedAfter)));

  const nicheByVideoId = new Map<string, string>();
  results.forEach((idMap, i) => {
    for (const id of idMap.keys()) {
      if (!nicheByVideoId.has(id)) nicheByVideoId.set(id, terms[i].niche);
    }
  });

  const ids = Array.from(nicheByVideoId.keys());
  if (ids.length === 0) return [];

  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${ids.join(",")}&key=${apiKey}`
  );
  if (!videosRes.ok) throw new Error(`YouTube videos.list falhou (${videosRes.status})`);
  const videosData = await videosRes.json();
  const items: VideoItem[] = videosData.items ?? [];

  // search's videoDuration=short is a loose "<4min" filter — confirm true Shorts.
  const shorts = items.filter((it) => parseIsoDuration(it.contentDetails?.duration ?? "PT0S") <= 60);

  const channelIds = Array.from(new Set(shorts.map((it) => it.snippet.channelId))).slice(0, 50);
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

  const posts: ViralPost[] = shorts
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
        niche: nicheByVideoId.get(it.id) ?? "Em alta",
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
        url: `https://www.youtube.com/shorts/${it.id}`,
        thumbHue: 0,
        thumbnailUrl: it.snippet.thumbnails?.high?.url ?? it.snippet.thumbnails?.medium?.url,
        isReal: true,
      };
    });

  return posts;
}
