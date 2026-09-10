export interface TrendingItem {
  title: string;
  channel: string;
  views: number;
  category: "geral" | "música";
}

export interface TrendSignals {
  items: TrendingItem[];
  sourceNote: string;
}

async function fetchChart(apiKey: string, categoryId?: string): Promise<TrendingItem[]> {
  const params = new URLSearchParams({
    part: "snippet,statistics",
    chart: "mostPopular",
    regionCode: "BR",
    maxResults: "8",
    key: apiKey,
  });
  if (categoryId) params.set("videoCategoryId", categoryId);

  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).map(
    (it: { snippet: { title: string; channelTitle: string }; statistics?: { viewCount?: string } }) => ({
      title: it.snippet.title,
      channel: it.snippet.channelTitle,
      views: Number(it.statistics?.viewCount) || 0,
      category: categoryId === "10" ? "música" : "geral",
    })
  );
}

/**
 * Real "what's hyped right now" signal — YouTube's own trending chart
 * (Brazil) is the only genuinely live, free, public trending API among the
 * three platforms. TikTok/Instagram have no equivalent public endpoint, so
 * this doubles as a general cross-platform proxy — the prompt is told
 * explicitly what this is and isn't.
 */
export async function fetchTrendSignals(): Promise<TrendSignals> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return {
      items: [],
      sourceNote:
        "YOUTUBE_API_KEY não configurada — sem acesso a nenhum trending real. A IA vai responder só com conhecimento geral (menos confiável, potencialmente desatualizado).",
    };
  }

  try {
    const [general, music] = await Promise.all([fetchChart(apiKey), fetchChart(apiKey, "10")]);
    const items = [...general, ...music];
    if (items.length === 0) {
      return { items: [], sourceNote: "A busca no chart de trending do YouTube não retornou resultados." };
    }
    return {
      items,
      sourceNote:
        "Trending real do YouTube no Brasil agora (geral + categoria Música), via YouTube Data API — usado como o melhor proxy público disponível de 'o que está bombando', já que TikTok e Instagram não têm API pública de trending.",
    };
  } catch {
    return { items: [], sourceNote: "Falha ao buscar o trending real do YouTube." };
  }
}
