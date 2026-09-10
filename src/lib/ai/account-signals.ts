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
  description?: string;
  realStats?: {
    subscribers?: number;
    totalViews?: number;
    videoCount?: number;
  };
  recentUploads?: RecentUpload[];
  /** Real, computed from recentUploads timestamps — not an AI guess. */
  uploadsPerWeek?: number;
  sourceNote: string;
}

function computeUploadsPerWeek(uploads: RecentUpload[]): number | undefined {
  if (uploads.length < 2) return undefined;
  const dates = uploads.map((u) => new Date(u.publishedAt).getTime()).sort((a, b) => b - a);
  const spanDays = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24);
  if (spanDays <= 0) return undefined;
  return Math.round(((uploads.length - 1) / spanDays) * 7 * 10) / 10;
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
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=8&type=video&key=${apiKey}`
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const items: { id: { videoId: string }; snippet: { title: string; publishedAt: string } }[] = searchData.items ?? [];
        recentUploads = items.map((it) => ({ title: it.snippet.title, publishedAt: it.snippet.publishedAt }));

        // Bonus: fetch real view counts for those uploads (one batched call).
        const ids = items.map((it) => it.id?.videoId).filter(Boolean).join(",");
        if (ids) {
          try {
            const videosRes = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${apiKey}`
            );
            if (videosRes.ok) {
              const videosData = await videosRes.json();
              const viewsById = new Map<string, number>(
                (videosData.items ?? []).map((v: { id: string; statistics?: { viewCount?: string } }) => [
                  v.id,
                  Number(v.statistics?.viewCount) || 0,
                ])
              );
              recentUploads = items.map((it) => ({
                title: it.snippet.title,
                publishedAt: it.snippet.publishedAt,
                viewCount: viewsById.get(it.id?.videoId) ?? undefined,
              }));
            }
          } catch {
            // view counts are a bonus signal, not required
          }
        }
      }
    } catch {
      // recent uploads are a bonus signal, not required
    }

    const uploadsPerWeek = recentUploads ? computeUploadsPerWeek(recentUploads) : undefined;

    return {
      platform: "youtube",
      handle: `@${handle}`,
      channelTitle: channel.snippet?.title,
      description: channel.snippet?.description,
      realStats: {
        subscribers: Number(channel.statistics?.subscriberCount) || undefined,
        totalViews: Number(channel.statistics?.viewCount) || undefined,
        videoCount: Number(channel.statistics?.videoCount) || undefined,
      },
      recentUploads,
      uploadsPerWeek,
      sourceNote:
        "Dados reais via YouTube Data API: inscritos, views totais, nº de vídeos, descrição do canal, uploads recentes com views reais" +
        (uploadsPerWeek !== undefined ? " e frequência de postagem calculada a partir das datas reais" : "") +
        ".",
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
