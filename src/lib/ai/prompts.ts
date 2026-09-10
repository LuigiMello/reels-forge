import type { AiAccountAudit, AiContentAudit } from "../types";
import type { AccountSignals } from "./account-signals";
import type { ContentSignals } from "./content-signals";
import { callLLM, extractJson } from "./llm";

const HONESTY_RULE = `Regra inegociável: você NÃO assistiu ao vídeo nem tem acesso à conta em tempo real — só ao que estiver listado em "dados disponíveis" abaixo. Nunca finja ter visto o vídeo, ouvido o áudio ou lido a legenda/hashtags reais se eles não estiverem nos dados. Se um dado não existir, diga isso explicitamente no campo "dataNote"/notas e baseie a nota nesse critério em boas práticas gerais da plataforma, não em detalhes inventados. Seja um avaliador cético e direto, no estilo de uma ferramenta como o vidIQ: elogie só o que for justificado pelos dados reais, e seja honesto quando a avaliação for genérica por falta de dados.`;

const CONTENT_SCHEMA = `{
  "mode": "real-data" | "metadata-only" | "guidance-only",
  "dataNote": "string curta explicando exatamente que dados você usou e quais faltaram",
  "overallScore": number (0-100),
  "hookScore": number (0-100),
  "pacingScore": number (0-100),
  "captionScore": number (0-100),
  "hashtagScore": number (0-100),
  "soundScore": number (0-100),
  "ctaScore": number (0-100),
  "predictedRetention": number (0-1),
  "summary": "1-2 frases resumindo o diagnóstico",
  "diagnosis": ["3 a 4 problemas ou observações concretas"],
  "fixes": ["3 a 4 ações práticas e específicas"]
}`;

export async function analyzeContent(signals: ContentSignals): Promise<AiContentAudit> {
  const hasRealStats = Boolean(signals.realStats);
  const hasMetadata = Boolean(signals.title);
  const mode = hasRealStats ? "real-data" : hasMetadata ? "metadata-only" : "guidance-only";

  const user = `Analise este conteúdo de vídeo curto (Reel/TikTok/Short) como um avaliador honesto e experiente, no estilo vidIQ.

Plataforma: ${signals.platform}
URL: ${signals.url}
Dados disponíveis:
${JSON.stringify(
  {
    title: signals.title ?? null,
    authorName: signals.authorName ?? null,
    realStats: signals.realStats ?? null,
    sourceNote: signals.sourceNote,
  },
  null,
  2
)}

Se "realStats" existir, use os números reais (views, likes, comentários, duração) para calcular proporções de engajamento reais e comparar com benchmarks típicos da plataforma — isso deve pesar bastante nos scores. Se só houver título/autor, baseie hookScore/captionScore no texto do título (ele geralmente reflete o hook) e deixe pacingScore/soundScore mais genéricos, meio-termo (50-65), citando no dataNote que não há como avaliar ritmo/áudio sem o vídeo. Se não houver nenhum dado, dê uma nota "guidance-only": scores mais neutros (50-60) e diagnosis/fixes como boas práticas gerais para esse tipo de link/plataforma, deixando claríssimo no dataNote que não foi possível ler nada deste link específico.

${HONESTY_RULE}

Responda em português do Brasil, APENAS com um JSON válido (sem markdown, sem texto fora do JSON) no formato exato:
${CONTENT_SCHEMA}

O campo "mode" deve ser "${mode}".`;

  const raw = await callLLM({
    system:
      "Você é um analista de conteúdo de vídeos curtos (Reels/TikTok/Shorts) rigoroso e direto, parecido com o vidIQ. Você responde sempre em JSON puro, nunca inventa dados que não recebeu.",
    user,
    maxTokens: 1200,
  });

  const parsed = extractJson<Omit<AiContentAudit, "platform" | "url" | "title" | "authorName" | "thumbnailUrl" | "realStats">>(raw);

  return {
    ...parsed,
    mode: parsed.mode ?? mode,
    platform: signals.platform,
    url: signals.url,
    title: signals.title,
    authorName: signals.authorName,
    thumbnailUrl: signals.thumbnailUrl,
    realStats: signals.realStats,
  };
}

const ACCOUNT_SCHEMA = `{
  "mode": "real-data" | "guidance-only",
  "dataNote": "string curta explicando exatamente que dados você usou e quais faltaram",
  "overallScore": number (0-100),
  "growthScore": number (0-100),
  "consistencyScore": number (0-100),
  "hookScore": number (0-100),
  "formatScore": number (0-100),
  "bestPostingWindow": "string, ex: 'Ter/Qui, 18h-20h' — deixe claro que é uma sugestão geral se não houver dados de horário",
  "topFormat": "string curta com o formato mais provável de funcionar, baseado no nicho/títulos disponíveis",
  "summary": "1-2 frases resumindo a avaliação",
  "strengths": ["2 a 3 pontos fortes, só se justificados pelos dados"],
  "risks": ["2 a 3 riscos ou lacunas"],
  "recommendations": ["3 a 4 recomendações práticas"]
}`;

export async function analyzeAccount(signals: AccountSignals): Promise<AiAccountAudit> {
  const mode = signals.realStats ? "real-data" : "guidance-only";

  const user = `Audite esta conta/canal de criador de conteúdo como um avaliador honesto e experiente, no estilo vidIQ.

Plataforma: ${signals.platform}
Handle: ${signals.handle}
Dados disponíveis:
${JSON.stringify(
  {
    channelTitle: signals.channelTitle ?? null,
    realStats: signals.realStats ?? null,
    recentUploads: signals.recentUploads ?? null,
    sourceNote: signals.sourceNote,
  },
  null,
  2
)}

Se "realStats" existir, use inscritos/views totais/nº de vídeos reais para calcular a média de views por vídeo e avaliar crescimento e consistência de forma fundamentada. Se "recentUploads" existir, use os títulos reais para inferir o nicho, o formato dominante e possíveis padrões de hook. Se não houver nenhum dado real (conta não encontrada, plataforma sem API configurada), retorne "guidance-only": scores neutros (50-60), e strengths/risks/recommendations como orientação geral de crescimento para essa plataforma — nunca invente número de seguidores, views ou títulos de vídeos que não foram fornecidos.

${HONESTY_RULE}

Responda em português do Brasil, APENAS com um JSON válido (sem markdown, sem texto fora do JSON) no formato exato:
${ACCOUNT_SCHEMA}

O campo "mode" deve ser "${mode}".`;

  const raw = await callLLM({
    system:
      "Você é um analista de crescimento de contas de criadores de conteúdo (Instagram/TikTok/YouTube), rigoroso e direto, parecido com o vidIQ. Você responde sempre em JSON puro, nunca inventa dados que não recebeu.",
    user,
    maxTokens: 1200,
  });

  const parsed = extractJson<Omit<AiAccountAudit, "platform" | "handle" | "channelTitle" | "realStats" | "recentUploads">>(raw);

  return {
    ...parsed,
    mode: parsed.mode ?? mode,
    platform: signals.platform,
    handle: signals.handle,
    channelTitle: signals.channelTitle,
    realStats: signals.realStats,
    recentUploads: signals.recentUploads,
  };
}
