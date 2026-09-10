/**
 * Provider-agnostic server-side LLM client — plain fetch, no SDK. Picks
 * whichever provider has a key configured (Gemini first: it's free with no
 * card required, same Google account as the YouTube key). Never import this
 * from a client component: keys must stay on the server.
 */

type Provider = "gemini" | "groq" | "anthropic";

function activeProvider(): Provider | null {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

export function isAiConfigured(): boolean {
  return activeProvider() !== null;
}

export function activeProviderLabel(): string | null {
  const p = activeProvider();
  if (p === "gemini") return "Google Gemini";
  if (p === "groq") return "Groq (Llama)";
  if (p === "anthropic") return "Anthropic Claude";
  return null;
}

interface CallParams {
  system: string;
  user: string;
  maxTokens?: number;
}

async function callGemini({ system, user, maxTokens = 1500 }: CallParams): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  // maxOutputTokens on Gemini's "thinking" models is a shared budget across
  // hidden reasoning + the visible answer — cap thinking low so a long,
  // structured JSON answer doesn't get starved/truncated by it.
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: {
          maxOutputTokens: Math.max(maxTokens, 2500),
          temperature: 0.6,
          thinkingConfig: { thinkingBudget: 300 },
          // Forces syntactically valid JSON out of the model — real-world
          // titles/comments often contain quotes that break naive JSON
          // written as free text.
          responseMimeType: "application/json",
        },
      }),
    }
  );
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Chamada à API do Gemini falhou (${res.status}): ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
  if (!text) {
    const blockReason = data?.promptFeedback?.blockReason;
    if (blockReason) throw new Error(`Gemini bloqueou a resposta (${blockReason}).`);
    if (candidate?.finishReason === "MAX_TOKENS") {
      throw new Error("Gemini estourou o limite de tokens antes de terminar a resposta (aumente maxOutputTokens).");
    }
    throw new Error("Resposta vazia do Gemini.");
  }
  return text;
}

async function callGroq({ system, user, maxTokens = 1500 }: CallParams): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY!;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Chamada à API do Groq falhou (${res.status}): ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") throw new Error("Resposta inesperada da API do Groq.");
  return text;
}

async function callAnthropic({ system, user, maxTokens = 1500 }: CallParams): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Chamada à API da Anthropic falhou (${res.status}): ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string") throw new Error("Resposta inesperada da API da Anthropic.");
  return text;
}

export async function callLLM(params: CallParams): Promise<string> {
  const provider = activeProvider();
  if (provider === "gemini") return callGemini(params);
  if (provider === "groq") return callGroq(params);
  if (provider === "anthropic") return callAnthropic(params);
  throw new Error("Nenhum provedor de IA configurado (GEMINI_API_KEY, GROQ_API_KEY ou ANTHROPIC_API_KEY).");
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
  const jsonSlice = candidate.slice(start, end + 1);
  try {
    return JSON.parse(jsonSlice) as T;
  } catch {
    // Cheap repair pass for the most common slip (trailing commas) before giving up.
    const repaired = jsonSlice.replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(repaired) as T;
  }
}
