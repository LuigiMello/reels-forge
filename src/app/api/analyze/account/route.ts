import { NextResponse } from "next/server";
import { isAiConfigured } from "@/lib/ai/llm";
import { fetchAccountSignals } from "@/lib/ai/account-signals";
import { analyzeAccount } from "@/lib/ai/prompts";
import type { Platform } from "@/lib/types";

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "Nenhuma chave de IA configurada no servidor (GEMINI_API_KEY, GROQ_API_KEY ou ANTHROPIC_API_KEY)." },
      { status: 501 }
    );
  }

  let body: { platform?: Platform; handle?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { platform, handle } = body;
  if (!platform || !handle?.trim()) {
    return NextResponse.json({ error: "Informe platform e handle." }, { status: 400 });
  }

  try {
    const signals = await fetchAccountSignals(platform, handle.trim());
    const audit = await analyzeAccount(signals);
    return NextResponse.json(audit);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Falha ao analisar a conta." },
      { status: 502 }
    );
  }
}
