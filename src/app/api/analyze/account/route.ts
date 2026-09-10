import { NextResponse } from "next/server";
import { isAiConfigured } from "@/lib/ai/anthropic";
import { fetchAccountSignals } from "@/lib/ai/account-signals";
import { analyzeAccount } from "@/lib/ai/prompts";
import type { Platform } from "@/lib/types";

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada no servidor." },
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
