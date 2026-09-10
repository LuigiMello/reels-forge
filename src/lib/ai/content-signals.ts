import type { Platform } from "../types";

export interface ContentSignals {
  platform: Platform;
  url: string;
  title?: string;
  description?: string;
  authorName?: string;
  thumbnailUrl?: string;
  hashtags?: string[];
  /** A few real top comments, when reachable — genuine audience reaction signal. */
  commentSamples?: string[];
  /** Real average views per video for this creator's channel, for "over/underperformed" context. */
  channelAvgViews?: number;
  /** Only populated when a real metrics API (currently just YouTube Data API) was reachable. */
  realStats?: {
    views?: number;
    likes?: number;
    comments?: number;
    durationSec?: number;
    publishedAt?: string;
  };
  /** What we actually managed to fetch, for honest disclosure to the user. */
  sourceNote: string;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, h, min, s] = m;
  return (Number(h) || 0) * 3600 + (Number(min) || 0) * 60 + (Number(s) || 0);
}

/** Pulls real #hashtags out of real text (title/description/caption) — never invented. */
function extractHashtags(...texts: (string | undefined)[]): string[] {
  const found = new Set<string>();
  for (const text of texts) {
    if (!text) continue;
    const matches = text.match(/#[\p{L}\p{N}_]+/gu) ?? [];
    matches.forEach((m) => found.add(m));
  }
  return Array.from(found).slice(0, 15);
}

async function fetchTopComments(videoId: string, apiKey: string): Promise<string[] | undefined> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&order=relevance&maxResults=5&textFormat=plainText&key=${apiKey}`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    const comments = (data.items ?? [])
      .map((it: { snippet?: { topLevelComment?: { snippet?: { textDisplay?: string } } } }) => it.snippet?.topLevelComment?.snippet?.textDisplay)
      .filter((t: string | undefined): t is string => Boolean(t))
      .map((t: string) => t.slice(0, 220));
    return comments.length > 0 ? comments : undefined;
  } catch {
    return undefined;
  }
}

async function fetchChannelAvgViews(channelId: string, apiKey: string): Promise<number | undefined> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    const stats = data.items?.[0]?.statistics;
    const totalViews = Number(stats?.viewCount);
    const videoCount = Number(stats?.videoCount);
    if (!totalViews || !videoCount) return undefined;
    return Math.round(totalViews / videoCount);
  } catch {
    return undefined;
  }
}

async function fetchYouTubeSignals(url: string): Promise<ContentSignals> {
  const videoId = extractYouTubeId(url);
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (videoId && apiKey) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`
      );
      if (res.ok) {
        const data = await res.json();
        const item = data.items?.[0];
        if (item) {
          const title: string | undefined = item.snippet?.title;
          const description: string | undefined = item.snippet?.description;
          const channelId: string | undefined = item.snippet?.channelId;
          const commentCount = Number(item.statistics?.commentCount) || 0;

          const [commentSamples, channelAvgViews] = await Promise.all([
            commentCount > 0 ? fetchTopComments(videoId, apiKey) : Promise.resolve(undefined),
            channelId ? fetchChannelAvgViews(channelId, apiKey) : Promise.resolve(undefined),
          ]);

          return {
            platform: "youtube",
            url,
            title,
            description,
            authorName: item.snippet?.channelTitle,
            thumbnailUrl: item.snippet?.thumbnails?.medium?.url,
            hashtags: extractHashtags(title, description),
            commentSamples,
            channelAvgViews,
            realStats: {
              views: Number(item.statistics?.viewCount) || undefined,
              likes: Number(item.statistics?.likeCount) || undefined,
              comments: commentCount || undefined,
              durationSec: item.contentDetails?.duration ? parseIsoDuration(item.contentDetails.duration) : undefined,
              publishedAt: item.snippet?.publishedAt,
            },
            sourceNote:
              "Dados reais via YouTube Data API: título, descrição, estatísticas, duração" +
              (commentSamples ? ", amostra de comentários reais" : "") +
              (channelAvgViews ? " e média de views do canal para comparação" : "") +
              ".",
          };
        }
      }
    } catch {
      // fall through to oEmbed
    }
  }

  // Public oEmbed fallback — no key required, gives title/author/thumbnail only.
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (res.ok) {
      const data = await res.json();
      return {
        platform: "youtube",
        url,
        title: data.title,
        authorName: data.author_name,
        thumbnailUrl: data.thumbnail_url,
        hashtags: extractHashtags(data.title),
        sourceNote: apiKey
          ? "Não foi possível ler as estatísticas via API — usei apenas título/autor públicos (oEmbed)."
          : "YOUTUBE_API_KEY não configurada — usei apenas título/autor públicos (oEmbed), sem views/likes/descrição/comentários reais.",
      };
    }
  } catch {
    // ignore
  }

  return { platform: "youtube", url, sourceNote: "Não consegui obter nenhum dado público deste link." };
}

async function fetchTikTokSignals(url: string): Promise<ContentSignals> {
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        platform: "tiktok",
        url,
        title: data.title,
        authorName: data.author_name,
        thumbnailUrl: data.thumbnail_url,
        hashtags: extractHashtags(data.title),
        sourceNote:
          "Dados públicos via oEmbed do TikTok (legenda/título completo, de onde extraí as hashtags reais, autor e thumbnail). Views, likes e comentários exigem uma chave de API paga (RapidAPI/Apify) — não configurada.",
      };
    }
  } catch {
    // ignore
  }
  return {
    platform: "tiktok",
    url,
    sourceNote: "Não consegui obter dados públicos deste link (oEmbed do TikTok indisponível para esse vídeo).",
  };
}

function instagramSignals(url: string): ContentSignals {
  return {
    platform: "instagram",
    url,
    sourceNote:
      "O Instagram não expõe mais um oEmbed público sem autenticação — não há como ler legenda, hashtags, thumbnail ou métricas deste link sem uma chave de API (RapidAPI/Apify) ou login oficial (Graph API), nenhum configurado.",
  };
}

export async function fetchContentSignals(platform: Platform, url: string): Promise<ContentSignals> {
  if (platform === "youtube") return fetchYouTubeSignals(url);
  if (platform === "tiktok") return fetchTikTokSignals(url);
  return instagramSignals(url);
}
