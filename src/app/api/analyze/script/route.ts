import { NextResponse } from "next/server";
import { isAiConfigured } from "@/lib/ai/llm";
import { fetchTrendSignals } from "@/lib/ai/trend-signals";
import { analyzeScript } from "@/lib/ai/prompts";
import type { GeneratedScript, Platform } from "@/lib/types";

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "Nenhuma chave de IA configurada no servidor (GEMINI_API_KEY ou GROQ_API_KEY)." },
      { status: 501 }
    );
  }

  let body: {
    script?: GeneratedScript;
    request?: { platform?: Platform; niche?: string; angle?: string; tone?: string; keyword?: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { script, request: req2 } = body;
  if (!script || !req2?.platform || !req2?.niche || !req2?.angle || !req2?.tone) {
    return NextResponse.json({ error: "Informe script e request (platform, niche, angle, tone)." }, { status: 400 });
  }

  try {
    const trends = await fetchTrendSignals();
    const insight = await analyzeScript(script, {
      platform: req2.platform,
      niche: req2.niche,
      angle: req2.angle,
      tone: req2.tone,
      keyword: req2.keyword,
    }, trends);
    return NextResponse.json(insight);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao analisar o roteiro." },
      { status: 502 }
    );
  }
}
