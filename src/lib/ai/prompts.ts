import type { AiAccountAudit, AiContentAudit, AiScriptInsight, GeneratedScript, Platform } from "../types";
import type { AccountSignals } from "./account-signals";
import type { ContentSignals } from "./content-signals";
import type { TrendSignals } from "./trend-signals";
import { callLLM, extractJson } from "./llm";

const HONESTY_RULE = `Regra inegociável: você NÃO assistiu ao vídeo nem tem acesso à conta em tempo real — só ao que estiver listado em "dados disponíveis" abaixo. Nunca finja ter visto o vídeo, ouvido o áudio ou lido a legenda/hashtags/comentários reais se eles não estiverem nos dados. Se um dado não existir, diga isso explicitamente no campo "dataNote"/notas e baseie a nota nesse critério em boas práticas gerais da plataforma, não em detalhes inventados. Seja um avaliador cético, minucioso e direto, no estilo de uma ferramenta como o vidIQ: analise TUDO que os dados permitirem (gancho, legenda/descrição, hashtags, CTA, ritmo, som, estilo visual, comentários reais quando houver) e explique o "porquê" de cada nota, não só o número. Elogie só o que for justificado pelos dados reais, e seja honesto quando a avaliação for genérica por falta de dados.`;

const CRITERION = `{ "score": number (0-100), "note": "1 frase objetiva explicando exatamente por que essa nota, citando o dado real usado (ex: título, descrição, comentário, proporção like/view) sempre que possível" }`;

const CONTENT_SCHEMA = `{
  "mode": "real-data" | "metadata-only" | "guidance-only",
  "dataNote": "string curta explicando exatamente que dados você usou e quais faltaram",
  "overallScore": number (0-100),
  "hookScore": number (0-100, igual a criteria.hook.score),
  "pacingScore": number (0-100, igual a criteria.pacing.score),
  "captionScore": number (0-100, igual a criteria.caption.score),
  "hashtagScore": number (0-100, igual a criteria.hashtags.score),
  "soundScore": number (0-100, igual a criteria.sound.score),
  "ctaScore": number (0-100, igual a criteria.cta.score),
  "styleScore": number (0-100, igual a criteria.style.score),
  "predictedRetention": number (0-1),
  "summary": "1-2 frases resumindo o diagnóstico geral",
  "criteria": {
    "hook": ${CRITERION},
    "pacing": ${CRITERION},
    "caption": ${CRITERION},
    "hashtags": ${CRITERION},
    "sound": ${CRITERION},
    "cta": ${CRITERION},
    "style": ${CRITERION}
  },
  "commentInsight": "1 frase resumindo o que os comentários reais revelam sobre a recepção do público — SÓ preencha se houver commentSamples reais nos dados, senão null",
  "diagnosis": ["4 a 6 problemas ou observações concretas, cobrindo o máximo possível de: gancho, legenda, hashtags, CTA, ritmo, som, estilo visual"],
  "fixes": ["4 a 6 ações práticas e específicas, uma para cada problema listado em diagnosis sempre que possível"]
}`;

export async function analyzeContent(signals: ContentSignals): Promise<AiContentAudit> {
  const hasRealStats = Boolean(signals.realStats);
  const hasMetadata = Boolean(signals.title);
  const mode = hasRealStats ? "real-data" : hasMetadata ? "metadata-only" : "guidance-only";

  const user = `Analise este conteúdo de vídeo curto (Reel/TikTok/Short) de forma MUITO detalhada, como um avaliador honesto e experiente no estilo vidIQ — cubra gancho (hook), legenda/descrição, hashtags, CTA, ritmo de edição, som/trilha e estilo visual, um por um.

Plataforma: ${signals.platform}
URL: ${signals.url}
Dados disponíveis:
${JSON.stringify(
  {
    title: signals.title ?? null,
    description: signals.description ?? null,
    authorName: signals.authorName ?? null,
    hashtags: signals.hashtags ?? null,
    commentSamples: signals.commentSamples ?? null,
    channelAvgViews: signals.channelAvgViews ?? null,
    realStats: signals.realStats ?? null,
    sourceNote: signals.sourceNote,
  },
  null,
  2
)}

Como usar cada dado, quando existir:
- "title"/"description": é a legenda/gancho real do vídeo — analise o texto literal (palavras, tom, tamanho, se cria curiosidade nos primeiros segundos) para captionScore e hookScore. O hook geralmente é a primeira frase do title ou description.
- "hashtags": são as hashtags REAIS extraídas do texto — avalie se são muito genéricas (#fyp, #viral), muito de nicho, ou uma mistura equilibrada, para hashtagScore.
- "commentSamples": comentários reais do público — use para inferir recepção real (riso, crítica, dúvida, elogio) e preencha "commentInsight". Nunca invente um comentário que não esteja na lista.
- "channelAvgViews" comparado com "realStats.views": diga se esse vídeo específico performou acima ou abaixo da média do canal — isso é um sinal forte para o overallScore e para diagnosis.
- "realStats" (views, likes, comentários, duração): calcule proporções reais de engajamento (likes/views, comentários/views) e compare com benchmarks típicos da plataforma.
- Se algum dado não existir (ex: sem description, sem comentários, sem hashtags), diga isso explicitamente na nota daquele critério ao invés de inventar, e dê uma nota mais neutra (50-65) pra esse critério específico.
- Para "sound"/"style" (ritmo de edição, estilo visual): como não há acesso ao vídeo em si, baseie-se em boas práticas gerais da plataforma e do nicho sugerido pelo título/descrição, e deixe isso claro na nota do critério.

Se não houver NENHUM dado (guidance-only), dê notas neutras (50-60) em todos os critérios e diagnosis/fixes como boas práticas gerais para esse tipo de link/plataforma, deixando claríssimo no dataNote que não foi possível ler nada deste link específico.

${HONESTY_RULE}

Responda em português do Brasil, APENAS com um JSON válido (sem markdown, sem texto fora do JSON) no formato exato:
${CONTENT_SCHEMA}

O campo "mode" deve ser "${mode}".`;

  const raw = await callLLM({
    system:
      "Você é um analista de conteúdo de vídeos curtos (Reels/TikTok/Shorts) rigoroso, minucioso e direto, parecido com o vidIQ. Você analisa cada dimensão do conteúdo separadamente e explica o porquê de cada nota. Você responde sempre em JSON puro, nunca inventa dados que não recebeu.",
    user,
    maxTokens: 2200,
  });

  const parsed = extractJson<
    Omit<AiContentAudit, "platform" | "url" | "title" | "caption" | "authorName" | "thumbnailUrl" | "hashtags" | "commentSamples" | "channelAvgViews" | "realStats">
  >(raw);

  return {
    ...parsed,
    mode: parsed.mode ?? mode,
    platform: signals.platform,
    url: signals.url,
    title: signals.title,
    caption: signals.description ?? signals.title,
    authorName: signals.authorName,
    thumbnailUrl: signals.thumbnailUrl,
    hashtags: signals.hashtags,
    commentSamples: signals.commentSamples,
    channelAvgViews: signals.channelAvgViews,
    realStats: signals.realStats,
  };
}

const ACCOUNT_SCHEMA = `{
  "mode": "real-data" | "guidance-only",
  "dataNote": "string curta explicando exatamente que dados você usou e quais faltaram",
  "overallScore": number (0-100),
  "growthScore": number (0-100, igual a criteria.growth.score),
  "consistencyScore": number (0-100, igual a criteria.consistency.score),
  "hookScore": number (0-100, igual a criteria.hook.score),
  "formatScore": number (0-100, igual a criteria.format.score),
  "bestPostingWindow": "string, ex: 'Ter/Qui, 18h-20h' — deixe claro que é uma sugestão geral se não houver dados de horário",
  "topFormat": "string curta com o formato mais provável de funcionar, baseado no nicho/títulos disponíveis",
  "summary": "1-2 frases resumindo a avaliação geral",
  "criteria": {
    "growth": ${CRITERION},
    "consistency": ${CRITERION},
    "hook": ${CRITERION},
    "format": ${CRITERION}
  },
  "strengths": ["3 a 4 pontos fortes, só se justificados pelos dados"],
  "risks": ["2 a 3 riscos ou lacunas"],
  "recommendations": ["4 a 5 recomendações práticas e específicas"]
}`;

export async function analyzeAccount(signals: AccountSignals): Promise<AiAccountAudit> {
  const mode = signals.realStats ? "real-data" : "guidance-only";

  const user = `Audite esta conta/canal de criador de conteúdo de forma MUITO detalhada, como um avaliador honesto e experiente no estilo vidIQ — cubra crescimento, consistência de postagem, qualidade dos ganchos (títulos) e variedade de formato, um por um.

Plataforma: ${signals.platform}
Handle: ${signals.handle}
Dados disponíveis:
${JSON.stringify(
  {
    channelTitle: signals.channelTitle ?? null,
    description: signals.description ?? null,
    realStats: signals.realStats ?? null,
    recentUploads: signals.recentUploads ?? null,
    uploadsPerWeek: signals.uploadsPerWeek ?? null,
    sourceNote: signals.sourceNote,
  },
  null,
  2
)}

Como usar cada dado, quando existir:
- "realStats" (inscritos, views totais, nº de vídeos): calcule a média real de views por vídeo (totalViews/videoCount) e use isso para growthScore — compare mentalmente com o porte do canal (nº de inscritos).
- "recentUploads" com "viewCount": são vídeos e views REAIS recentes — compare o desempenho entre eles (qual performou acima/abaixo da média do canal), analise os títulos reais como ganchos (hookScore), e infere o nicho/formato dominante (topFormat).
- "uploadsPerWeek": é a frequência REAL calculada a partir das datas de publicação — use isso diretamente para consistencyScore, não estime por conta própria.
- "description": descrição real do canal — pode indicar nicho, proposta de valor, frequência declarada.
- Se não houver "recentUploads" ou "uploadsPerWeek", diga isso na nota do critério de consistência/formato e dê uma nota mais neutra (50-65) pra esse critério específico, ao invés de inventar.

Se não houver NENHUM dado real (mode "guidance-only"): scores neutros (50-60) em todos os critérios, e strengths/risks/recommendations como orientação geral de crescimento para essa plataforma — nunca invente número de seguidores, views ou títulos de vídeos que não foram fornecidos.

${HONESTY_RULE}

Responda em português do Brasil, APENAS com um JSON válido (sem markdown, sem texto fora do JSON) no formato exato:
${ACCOUNT_SCHEMA}

O campo "mode" deve ser "${mode}".`;

  const raw = await callLLM({
    system:
      "Você é um analista de crescimento de contas de criadores de conteúdo (Instagram/TikTok/YouTube), rigoroso, minucioso e direto, parecido com o vidIQ. Você analisa cada dimensão separadamente e explica o porquê de cada nota. Você responde sempre em JSON puro, nunca inventa dados que não recebeu.",
    user,
    maxTokens: 2200,
  });

  const parsed = extractJson<
    Omit<AiAccountAudit, "platform" | "handle" | "channelTitle" | "realStats" | "recentUploads" | "uploadsPerWeek">
  >(raw);

  return {
    ...parsed,
    mode: parsed.mode ?? mode,
    platform: signals.platform,
    handle: signals.handle,
    channelTitle: signals.channelTitle,
    realStats: signals.realStats,
    recentUploads: signals.recentUploads,
    uploadsPerWeek: signals.uploadsPerWeek,
  };
}

const SCRIPT_INSIGHT_SCHEMA = `{
  "trendsSummary": "2-3 frases sobre o que está bombando agora relevante pro nicho/plataforma escolhidos, citando exemplos reais de trendingExamples quando existirem",
  "recommendedStyle": "1-2 frases recomendando um estilo/formato de vídeo bom pra gravar AGORA, considerando as tendências e a plataforma",
  "ideaCritique": "2-4 frases avaliando com honestidade a ideia do usuário (nicho + ângulo + tom escolhidos) — o que está bom, o que é arriscado, se está alinhada com o que está em alta",
  "scriptCritique": "2-4 frases avaliando o roteiro específico que foi gerado (hook, estrutura, CTA, duração) — critique de verdade, não só elogie",
  "hookRewrite": "opcional: uma versão alternativa do hook mais alinhada com as tendências atuais, ou null se o hook já estiver bom",
  "score": number (0-100, quão bem essa ideia+roteiro está posicionada pra viralizar AGORA, considerando as tendências)
}`;

export async function analyzeScript(
  script: GeneratedScript,
  request: { platform: Platform; niche: string; angle: string; tone: string; keyword?: string },
  trends: TrendSignals
): Promise<AiScriptInsight> {
  const hasRealTrendData = trends.items.length > 0;

  const user = `Você vai fazer 3 coisas para um criador de conteúdo, de forma honesta e direta, no estilo vidIQ: (1) resumir o que está em alta agora relevante pro nicho dele, (2) criticar a ideia que ele propôs, (3) criticar o roteiro específico que foi gerado pra essa ideia.

Plataforma: ${request.platform}
Nicho escolhido: ${request.niche}
Ângulo escolhido: ${request.angle}
Tom escolhido: ${request.tone}
Palavra-chave: ${request.keyword ?? "(nenhuma)"}

Trending real disponível (${trends.sourceNote}):
${JSON.stringify(trends.items, null, 2)}

Roteiro gerado (para você criticar):
${JSON.stringify(
  {
    title: script.title,
    hookOptions: script.hookOptions,
    blocks: script.blocks.map((b) => ({ label: b.label, timeframe: b.timeframe, onScreenText: b.onScreenText })),
    caption: script.caption,
    hashtags: script.hashtags,
    cta: script.cta,
    estimatedDurationSec: script.estimatedDurationSec,
  },
  null,
  2
)}

Regras:
- Os itens em "trending real disponível" são do chart de trending do YouTube Brasil (geral + música) — é o único trending público e real que existe entre as 3 plataformas. Use isso como termômetro real do que está bombando, mas deixe claro que é um proxy do YouTube, não um trending nativo do TikTok/Instagram, se a plataforma escolhida for outra.
- Se a lista de trending estiver vazia, diga isso claramente em vez de inventar nomes de músicas, sons ou memes que você não tem certeza que estão em alta agora — prefira falar de formatos/estruturas de vídeo que costumam funcionar bem (storytime, antes/depois, etc.) em vez de citar uma trend específica não verificada.
- Seja um crítico de verdade: se a ideia ou o roteiro tiver um problema real (ângulo saturado, hook fraco, duração desalinhada com o formato), diga isso sem suavizar.
- "hookRewrite": só preencha se você tiver uma sugestão concreta melhor que os hooks já existentes; senão, null.

Responda em português do Brasil, APENAS com um JSON válido (sem markdown, sem texto fora do JSON) no formato exato:
${SCRIPT_INSIGHT_SCHEMA}`;

  const raw = await callLLM({
    system:
      "Você é um estrategista de conteúdo viral (Reels/TikTok/Shorts) atualizado e direto, no estilo vidIQ. Você é honesto sobre o que é dado real vs. conhecimento geral, nunca inventa uma trend específica sem ter certeza. Você responde sempre em JSON puro.",
    user,
    maxTokens: 1800,
  });

  const parsed = extractJson<Omit<AiScriptInsight, "hasRealTrendData" | "dataNote" | "trendingExamples">>(raw);

  return {
    ...parsed,
    hasRealTrendData,
    dataNote: trends.sourceNote,
    trendingExamples: trends.items,
  };
}
