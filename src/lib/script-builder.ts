import { Rng } from "./prng";
import {
  CTA_POOL,
  HOOK_TEMPLATES,
  PRODUCTION_NOTES_POOL,
  SHOT_TYPES,
  SOUND_POOL,
  TONE_CTA_POOL,
  TONE_HOOK_PREFIX,
  TONE_PRODUCTION_NOTE,
} from "./mock/pools";
import type { GeneratedScript, Platform, ScriptBlock, ScriptInspiration, ScriptTone } from "./types";

export type ScriptAngle =
  | "storytime"
  | "tutorial"
  | "lista"
  | "antes-depois"
  | "bastidores"
  | "polemico"
  | "desafio"
  | "pov"
  | "mito-verdade"
  | "confissao";

export const SCRIPT_ANGLES: { id: ScriptAngle; label: string; description: string }[] = [
  { id: "storytime", label: "Storytime com virada", description: "Narrativa pessoal que constrói tensão até uma virada surpreendente." },
  { id: "tutorial", label: "Tutorial rápido", description: "Ensina algo aplicável em passos curtos e diretos." },
  { id: "lista", label: "Lista polêmica", description: "Formato 'X coisas que...' com uma opinião forte no meio." },
  { id: "antes-depois", label: "Antes / Depois", description: "Contraste visual ou de resultado que prova uma transformação." },
  { id: "bastidores", label: "Bastidores + revelação", description: "Mostra o processo real por trás de algo e revela o resultado." },
  { id: "polemico", label: "Opinião polêmica", description: "Declaração que divide opinião e puxa comentários." },
  { id: "desafio", label: "Desafio / X dias", description: "Você se compromete com um desafio em vídeo e mostra o resultado." },
  { id: "pov", label: "POV", description: "Coloca quem assiste no lugar de alguém — primeira pessoa, sem narração externa." },
  { id: "mito-verdade", label: "Mito vs. Verdade", description: "Desmonta uma crença comum com um fato contra-intuitivo." },
  { id: "confissao", label: "Confissão", description: "Admite um erro ou vergonha real — gera identificação imediata." },
];

export const SCRIPT_TONES: { id: ScriptTone; label: string; description: string }[] = [
  { id: "serio", label: "Sério / direto", description: "Ritmo firme, sem gírias — passa autoridade." },
  { id: "humor", label: "Humor", description: "Leve e engraçado, com timing cômico." },
  { id: "inspirador", label: "Inspirador", description: "Emocional, motivacional, olhar na câmera." },
  { id: "sarcastico", label: "Sarcástico", description: "Irônico, provocador — cuidado com o tom." },
];

export const DURATION_OPTIONS = [15, 30, 45, 60] as const;
export type DurationOption = (typeof DURATION_OPTIONS)[number];

interface BlockTemplateInput {
  angle: ScriptAngle;
  niche: string;
  hook: string;
  cta: string;
  platform: Platform;
}

function baseBlocks({ angle, niche, hook, cta }: BlockTemplateInput): Omit<ScriptBlock, "shot">[] {
  const hookBlock = {
    label: "Gancho",
    timeframe: "0s – 3s",
    instruction: "Entre já na ação/conflito. Sem logo, sem introdução, sem 'oi gente'.",
    onScreenText: hook,
    vo: hook,
  };

  const templates: Record<ScriptAngle, Omit<ScriptBlock, "shot">[]> = {
    storytime: [
      hookBlock,
      { label: "Contexto", timeframe: "3s – 10s", instruction: `Situe rapidamente a cena: onde, quando, e por que isso sobre ${niche.toLowerCase()} importa pra quem assiste.`, onScreenText: "Deixa eu te contar o que aconteceu..." },
      { label: "Tensão", timeframe: "10s – 20s", instruction: "Aumente a aposta — o que estava em jogo, o que podia dar errado." },
      { label: "Virada", timeframe: "20s – 28s", instruction: "Revele o desfecho inesperado em uma frase curta e direta." },
      { label: "CTA", timeframe: "28s – 32s", instruction: "Feche com o call-to-action falado e escrito na tela.", onScreenText: cta, vo: cta },
    ],
    tutorial: [
      hookBlock,
      { label: "Promessa", timeframe: "3s – 6s", instruction: `Declare exatamente o que a pessoa vai aprender sobre ${niche.toLowerCase()} em menos de 30s.` },
      { label: "Passo 1", timeframe: "6s – 13s", instruction: "Mostre a ação, não apenas explique. Corte no exato momento do resultado." },
      { label: "Passo 2", timeframe: "13s – 20s", instruction: "Adicione o detalhe que a maioria erra — é o que gera comentários." },
      { label: "Passo 3 + resultado", timeframe: "20s – 26s", instruction: "Feche com o resultado final visível em tela." },
      { label: "CTA", timeframe: "26s – 30s", instruction: "Convide para salvar o vídeo (conteúdo de valor salva mais que curte).", onScreenText: cta, vo: cta },
    ],
    lista: [
      hookBlock,
      { label: "Enquadramento", timeframe: "3s – 6s", instruction: "Anuncie o número de itens e o critério (ex.: 'os 3 erros mais comuns em...')." },
      { label: "Item 1 e 2", timeframe: "6s – 16s", instruction: "Um corte de cena por item. Ritmo rápido, sem enrolação." },
      { label: "Item polêmico", timeframe: "16s – 24s", instruction: "Guarde o item mais controverso para o meio/fim — é o que trava o scroll e gera comentário." },
      { label: "CTA", timeframe: "24s – 28s", instruction: "Pergunte qual item a pessoa também faz — gera resposta em comentário.", onScreenText: cta, vo: cta },
    ],
    "antes-depois": [
      hookBlock,
      { label: "Estado 'antes'", timeframe: "3s – 9s", instruction: "Mostre o ponto de partida sem filtro — quanto mais real, mais crível a transformação." },
      { label: "Processo", timeframe: "9s – 18s", instruction: "Corte acelerado do processo, 2-3 cenas curtas mostrando o esforço." },
      { label: "Reveal 'depois'", timeframe: "18s – 24s", instruction: "Corte seco (sem transição suave) para o resultado — o contraste é o gancho visual." },
      { label: "CTA", timeframe: "24s – 28s", instruction: "Convide a pessoa a começar o próprio processo hoje.", onScreenText: cta, vo: cta },
    ],
    bastidores: [
      hookBlock,
      { label: "Processo real", timeframe: "3s – 14s", instruction: "Mostre o que normalmente ninguém vê — o erro, o retrabalho, o tempo real gasto." },
      { label: "Obstáculo", timeframe: "14s – 20s", instruction: "Inclua um contratempo genuíno — aumenta identificação e retenção." },
      { label: "Revelação final", timeframe: "20s – 27s", instruction: "Mostre o resultado e conecte de volta com o hook inicial." },
      { label: "CTA", timeframe: "27s – 30s", instruction: "Convide a seguir para acompanhar o próximo bastidor.", onScreenText: cta, vo: cta },
    ],
    polemico: [
      hookBlock,
      { label: "Declaração", timeframe: "3s – 8s", instruction: `Diga a opinião polêmica sobre ${niche.toLowerCase()} sem suavizar — meio-termo não viraliza.` },
      { label: "Argumento 1", timeframe: "8s – 16s", instruction: "Justifique com um exemplo concreto, de preferência pessoal." },
      { label: "Contra-argumento antecipado", timeframe: "16s – 23s", instruction: "Responda à objeção óbvia antes que alguém comente — isso reduz hate e aumenta autoridade." },
      { label: "CTA", timeframe: "23s – 27s", instruction: "Pergunte diretamente se a pessoa concorda ou discorda.", onScreenText: cta, vo: cta },
    ],
    desafio: [
      hookBlock,
      { label: "O compromisso", timeframe: "3s – 8s", instruction: `Declare exatamente a regra do desafio sobre ${niche.toLowerCase()} — duração, critério de sucesso.` },
      { label: "Dia difícil", timeframe: "8s – 17s", instruction: "Mostre o momento em que quase desistiu — humaniza e prende." },
      { label: "Resultado", timeframe: "17s – 25s", instruction: "Revele o resultado final com números ou prova visual concreta." },
      { label: "CTA", timeframe: "25s – 29s", instruction: "Convite direto: 'topa fazer esse desafio também?'", onScreenText: cta, vo: cta },
    ],
    pov: [
      hookBlock,
      { label: "Cena 1", timeframe: "3s – 9s", instruction: "Filme em primeira pessoa (câmera na mão/selfie) reagindo à situação, sem narrar por fora." },
      { label: "Escalada", timeframe: "9s – 17s", instruction: "A situação piora ou fica mais absurda — mantenha a câmera sempre em POV." },
      { label: "Payoff", timeframe: "17s – 23s", instruction: "Resolução cômica ou satisfatória, ainda em primeira pessoa." },
      { label: "CTA", timeframe: "23s – 27s", instruction: "Pergunte se quem assiste já viveu isso.", onScreenText: cta, vo: cta },
    ],
    "mito-verdade": [
      hookBlock,
      { label: "O mito", timeframe: "3s – 8s", instruction: `Enuncie a crença popular sobre ${niche.toLowerCase()} que todo mundo repete.` },
      { label: "A quebra", timeframe: "8s – 15s", instruction: "Apresente o dado ou exemplo que contradiz o mito — direto, sem rodeio." },
      { label: "A verdade", timeframe: "15s – 22s", instruction: "Explique o que fazer no lugar, de forma acionável." },
      { label: "CTA", timeframe: "22s – 26s", instruction: "Peça pra marcarem quem ainda acredita no mito.", onScreenText: cta, vo: cta },
    ],
    confissao: [
      hookBlock,
      { label: "A admissão", timeframe: "3s – 9s", instruction: `Admita algo real e um pouco desconfortável sobre ${niche.toLowerCase()} — vulnerabilidade gera conexão.` },
      { label: "Por que aconteceu", timeframe: "9s – 17s", instruction: "Explique o contexto sem se justificar demais — mantenha o tom humano." },
      { label: "O aprendizado", timeframe: "17s – 24s", instruction: "Feche com o que mudou depois disso." },
      { label: "CTA", timeframe: "24s – 28s", instruction: "Pergunte se alguém mais já passou por isso.", onScreenText: cta, vo: cta },
    ],
  };

  return templates[angle];
}

function parseTimeframe(tf: string): [number, number] {
  const m = tf.match(/(\d+)s\s*–\s*(\d+)s/);
  return m ? [Number(m[1]), Number(m[2])] : [0, 0];
}

function attachShots(blocks: Omit<ScriptBlock, "shot">[], rng: Rng): ScriptBlock[] {
  return blocks.map((b, i) => ({
    ...b,
    shot: i === 0 ? "Plano fechado (close-up no rosto)" : rng.pick(SHOT_TYPES),
  }));
}

/** Proportionally rescales block timeframes to hit a target total duration. */
function rescaleBlocks(blocks: ScriptBlock[], targetSec: number): ScriptBlock[] {
  const originalTotal = parseTimeframe(blocks[blocks.length - 1].timeframe)[1] || 1;
  const scale = targetSec / originalTotal;
  let prevEnd = 0;
  return blocks.map((b) => {
    const [s, e] = parseTimeframe(b.timeframe);
    const newStart = Math.max(Math.round(s * scale), prevEnd);
    let newEnd = Math.round(e * scale);
    if (newEnd <= newStart) newEnd = newStart + 1;
    prevEnd = newEnd;
    return { ...b, timeframe: `${newStart}s – ${newEnd}s` };
  });
}

function applyTone(hook: string, tone: ScriptTone, rng: Rng): string {
  const prefix = rng.pick(TONE_HOOK_PREFIX[tone]);
  if (!prefix) return hook;
  return prefix + hook.charAt(0).toLowerCase() + hook.slice(1);
}

function slugifyTag(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "");
}

function platformTagFor(platform: Platform): string {
  return platform === "instagram" ? "reels" : platform === "tiktok" ? "tiktok" : "shorts";
}

function scoreScript(rng: Rng, angle: ScriptAngle, tone: ScriptTone, targetSec: number, hasInspiration: boolean): number {
  const HIGH_PERFORMING: ScriptAngle[] = ["storytime", "polemico", "antes-depois", "confissao", "mito-verdade"];
  let score = rng.int(58, 78);
  if (HIGH_PERFORMING.includes(angle)) score += 6;
  if (targetSec >= 20 && targetSec <= 40) score += 8;
  if (tone === "inspirador" || tone === "humor") score += 3;
  if (hasInspiration) score += 5;
  return Math.min(98, score);
}

export interface ScriptRequest {
  platform: Platform;
  niche: string;
  angle: ScriptAngle;
  tone: ScriptTone;
  targetDurationSec: DurationOption;
  keyword?: string;
  inspiration?: ScriptInspiration;
}

export function buildScript(req: ScriptRequest): GeneratedScript {
  const seed = `script:${req.platform}:${req.niche}:${req.angle}:${req.tone}:${req.keyword ?? ""}:${Date.now()}`;
  const rng = new Rng(seed);

  const rawHooks = rng.pickMany(HOOK_TEMPLATES, 3).map((t) => t.replace("{niche}", req.niche.toLowerCase()));
  const toneHooks = rawHooks.map((h) => applyTone(h, req.tone, rng));
  const hookOptions = req.inspiration ? [req.inspiration.hook, ...toneHooks.slice(0, 2)] : toneHooks;
  const primaryHook = hookOptions[0];

  const cta = rng.pick(TONE_CTA_POOL[req.tone] ?? CTA_POOL);
  const soundOptions = rng.pickMany(SOUND_POOL, 3);
  const angleMeta = SCRIPT_ANGLES.find((a) => a.id === req.angle)!;

  let blocks = attachShots(
    baseBlocks({ angle: req.angle, niche: req.niche, hook: primaryHook, cta, platform: req.platform }),
    rng
  );
  blocks = rescaleBlocks(blocks, req.targetDurationSec);
  const totalSec = parseTimeframe(blocks[blocks.length - 1].timeframe)[1];

  const hashtagBase = slugifyTag(req.niche);
  const platformTag = platformTagFor(req.platform);

  const notes: string[] = rng.pickMany(PRODUCTION_NOTES_POOL, 3);
  notes.push(TONE_PRODUCTION_NOTE[req.tone]);
  if (req.inspiration) {
    notes.push(`Gancho inspirado no vídeo #1 de hoje (${req.inspiration.handle}, score ${req.inspiration.score}) — adapte pra sua voz, não copie literalmente.`);
  }

  return {
    id: `${req.platform}-${req.angle}-${Date.now()}`,
    platform: req.platform,
    niche: req.niche,
    angle: angleMeta.label,
    tone: req.tone,
    title: `${angleMeta.label} — ${req.niche}`,
    hookOptions,
    blocks,
    caption: `${primaryHook}\n\n${cta} 👇\n\n#${hashtagBase} #${platformTag} #viral`,
    hashtags: [hashtagBase, platformTag, "viral", "fyp", req.keyword ? slugifyTag(req.keyword) : ""].filter(Boolean),
    soundOptions,
    cta,
    estimatedDurationSec: totalSec || req.targetDurationSec,
    productionNotes: notes,
    predictedScore: scoreScript(rng, req.angle, req.tone, req.targetDurationSec, Boolean(req.inspiration)),
    coverSeed: rng.int(0, 359),
    inspiration: req.inspiration,
  };
}

/** Re-rolls just the hook options (and caption's first line) without touching the rest of the script. */
export function rerollHooks(script: GeneratedScript, niche: string, tone: ScriptTone): GeneratedScript {
  const rng = new Rng(`reroll-hook:${script.id}:${Date.now()}`);
  const rawHooks = rng.pickMany(HOOK_TEMPLATES, 3).map((t) => t.replace("{niche}", niche.toLowerCase()));
  const hookOptions = rawHooks.map((h) => applyTone(h, tone, rng));
  const primaryHook = hookOptions[0];
  const firstBlock = { ...script.blocks[0], onScreenText: primaryHook, vo: primaryHook };
  return {
    ...script,
    hookOptions,
    blocks: [firstBlock, ...script.blocks.slice(1)],
    caption: script.caption.replace(script.hookOptions[0], primaryHook),
    inspiration: undefined,
  };
}

/** Re-rolls just the sound suggestions. */
export function rerollSound(script: GeneratedScript): GeneratedScript {
  const rng = new Rng(`reroll-sound:${script.id}:${Date.now()}`);
  return { ...script, soundOptions: rng.pickMany(SOUND_POOL, 3) };
}

/** Re-rolls just the CTA (and the caption's CTA line). */
export function rerollCta(script: GeneratedScript, tone: ScriptTone): GeneratedScript {
  const rng = new Rng(`reroll-cta:${script.id}:${Date.now()}`);
  const cta = rng.pick(TONE_CTA_POOL[tone] ?? CTA_POOL);
  const lastBlock = script.blocks[script.blocks.length - 1];
  const updatedLast = { ...lastBlock, onScreenText: cta, vo: cta };
  return {
    ...script,
    cta,
    blocks: [...script.blocks.slice(0, -1), updatedLast],
    caption: script.caption.replace(script.cta, cta),
  };
}

/** Plain-text export of a generated script — for the "baixar .txt" button. */
export function formatScriptAsText(script: GeneratedScript): string {
  const toneLabel = SCRIPT_TONES.find((t) => t.id === script.tone)?.label ?? script.tone;
  const lines: string[] = [];
  lines.push(script.title.toUpperCase());
  lines.push(`Plataforma: ${script.platform} · Nicho: ${script.niche} · Tom: ${toneLabel} · ${script.estimatedDurationSec}s`);
  lines.push(`Score previsto: ${script.predictedScore}/100`);
  lines.push("");
  lines.push("OPÇÕES DE HOOK");
  script.hookOptions.forEach((h, i) => lines.push(`${i + 1}. ${h}`));
  lines.push("");
  lines.push("ROTEIRO");
  script.blocks.forEach((b) => {
    lines.push(`[${b.timeframe}] ${b.label}${b.shot ? ` — ${b.shot}` : ""}`);
    lines.push(`  ${b.instruction}`);
    if (b.onScreenText) lines.push(`  texto em tela: "${b.onScreenText}"`);
    lines.push("");
  });
  lines.push("LEGENDA");
  lines.push(script.caption);
  lines.push("");
  lines.push(`TRILHAS SUGERIDAS: ${script.soundOptions.join(" | ")}`);
  lines.push(`CTA: ${script.cta}`);
  lines.push("");
  lines.push("NOTAS DE PRODUÇÃO");
  script.productionNotes.forEach((n) => lines.push(`- ${n}`));
  lines.push("");
  lines.push("gerado em reels-forge");
  return lines.join("\n");
}
