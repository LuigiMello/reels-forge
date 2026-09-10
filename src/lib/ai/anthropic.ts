/**
 * Minimal server-side Claude client — plain fetch against the Messages API,
 * no SDK dependency needed. Never import this from a client component: the
 * API key must stay on the server.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5";

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function callClaude(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY não configurada.");
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: params.maxTokens ?? 1500,
      system: params.system,
      messages: [{ role: "user", content: params.user }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Chamada à API da Anthropic falhou (${res.status}): ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Resposta inesperada da API da Anthropic.");
  }
  return text;
}

/** Extracts the first JSON object found in a model response (handles stray prose/fences around it). */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Não encontrei um JSON válido na resposta da IA.");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
