import type { Platform } from "../types";

export interface RecentUpload {
  title: string;
  publishedAt: string;
  viewCount?: number;
}

export interface AccountSignals {
  platform: Platform;
  handle: string;
  channelTitle?: string;
  realStats?: {
    subscribers?: number;
    totalViews?: number;
    videoCount?: number;
  };
  recentUploads?: RecentUpload[];
  sourceNote: string;
}

async function fetchYouTubeAccountSignals(handleInput: string): Promise<AccountSignals> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const handle = handleInput.trim().replace(/^@/, "");

  if (!apiKey) {
    return {
      platform: "youtube",
      handle: `@${handle}`,
      sourceNote: "YOUTUBE_API_KEY não configurada — não há como buscar dados reais deste canal.",
    };
  }

  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`
    );
    if (!channelRes.ok) throw new Error("channels.list falhou");
    const channelData = await channelRes.json();
    const channel = channelData.items?.[0];
    if (!channel) {
      return {
        platform: "youtube",
        handle: `@${handle}`,
        sourceNote: `Nenhum canal público encontrado para @${handle} via YouTube Data API.`,
      };
    }

    const channelId = channel.id;
    let recentUploads: RecentUpload[] | undefined;
    try {
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=6&type=video&key=${apiKey}`
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        recentUploads = (searchData.items ?? []).map(
          (it: { snippet: { title: string; publishedAt: string } }) => ({
            title: it.snippet.title,
            publishedAt: it.snippet.publishedAt,
          })
        );
      }
    } catch {
      // recent uploads are a bonus signal, not required
    }

    return {
      platform: "youtube",
      handle: `@${handle}`,
      channelTitle: channel.snippet?.title,
      realStats: {
        subscribers: Number(channel.statistics?.subscriberCount) || undefined,
        totalViews: Number(channel.statistics?.viewCount) || undefined,
        videoCount: Number(channel.statistics?.videoCount) || undefined,
      },
      recentUploads,
      sourceNote: "Dados reais via YouTube Data API (inscritos, views totais, nº de vídeos e uploads recentes públicos).",
    };
  } catch {
    return {
      platform: "youtube",
      handle: `@${handle}`,
      sourceNote: "A busca pelo canal na YouTube Data API falhou (handle incorreto ou canal inexistente).",
    };
  }
}

export async function fetchAccountSignals(platform: Platform, handle: string): Promise<AccountSignals> {
  if (platform === "youtube") return fetchYouTubeAccountSignals(handle);
  return {
    platform,
    handle: `@${handle.trim().replace(/^@/, "")}`,
    sourceNote:
      platform === "instagram"
        ? "O Instagram exige login oficial (Graph API) para ler dados de qualquer conta — não configurado. Sem isso, não há dados públicos reais para auditar."
        : "O TikTok não tem API pública gratuita para estatísticas de conta — exigiria uma chave paga (RapidAPI/Apify), não configurada.",
  };
}
